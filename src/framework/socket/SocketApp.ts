import http from 'http';
import { Server, Socket } from 'socket.io';
import { ExpressApp } from '../express';
import logger from '../logger/winston';

export interface SocketListener {
  event: string;
  callback: (socket: Socket, ...args: any[]) => void;
}

class SocketApp {
  private expressApp: ExpressApp;
  private httpApp: http.Server;
  private listeners: SocketListener[];
  public io: Server;

  constructor(expressApp: ExpressApp, listeners: SocketListener[][]) {
    this.expressApp = expressApp;
    this.httpApp = http.createServer(this.expressApp.app);
    this.io = new Server(this.httpApp, {
      serveClient: false,
      cors: {
        origin: '*',
        // methods: ['GET', 'POST'],
        // credentials: false,
      },
    });
    this.listeners = listeners.reduce((acc, val) => acc.concat(val), []);
  }

  private loadListeners(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log('a user connected');

      this.listeners.forEach((listener) => {
        socket.on(listener.event, (data: any) => {
          listener.callback(socket, data);
        });
      });
    });
  }

  public listen(): void {
    this.httpApp.listen(process.env.PORT, () => {
      logger.info(`Socket App Connected [port ${process.env.PORT}]`);
    });
  }

  public async start(services: Promise<any>[]): Promise<void> {
    await this.expressApp.runServices(services);
    this.loadListeners();
    this.listen();
  }
}

export default SocketApp;
