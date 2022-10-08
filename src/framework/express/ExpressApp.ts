import Express, { Application, NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import errorHandler from './middlewares/errorHandler';
import NotFoundError from './errors/NotFoundError';
import healthRouter from './healthRouter';
import logger from '../logger/winston';
import morgan from '../logger/morgan';
import { AuthenticatedRequest } from './types';

type ExpressMiddleware = (
  request: Request | AuthenticatedRequest,
  response: Response,
  next: NextFunction,
) => Promise<void> | void;

class ExpressApp {
  public app: Application;
  private version: string;

  constructor(version: string, middlewares: ExpressMiddleware[] = [], routers: Express.Router[]) {
    this.app = Express();

    this.version = version;

    this.loadMiddleware(middlewares);

    this.loadRouters(routers);
  }

  private loadMiddleware(middlewares: ExpressMiddleware[]): void {
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(bodyParser.json());

    if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'test.local') {
      this.app.use(morgan);
    }

    this.app.use((req, res, next) => {
      res.set('X-service-version', this.version);

      next();
    });

    middlewares.forEach((middleware) => {
      this.app.use(middleware);
    });
  }

  private loadRouters(routers: Express.Router[]): void {
    this.app.use(healthRouter);

    routers.forEach((router) => {
      this.app.use(router);
    });
  }

  public applyErrorManagement(): void {
    this.app.all('*', (req, res, next) => {
      next(new NotFoundError());
    });

    this.app.use(errorHandler);
  }

  public listen(): void {
    if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'test.local') {
      this.app.listen(process.env.PORT, () => {
        logger.info(`Express App Connected [port ${process.env.PORT}]`);
      });
    }
  }

  public async runServices(services: Promise<any>[]): Promise<void> {
    await Promise.all(services);
  }

  public async start(services: Promise<any>[]): Promise<void> {
    await this.runServices(services);

    this.listen();
  }
}

export default ExpressApp;
