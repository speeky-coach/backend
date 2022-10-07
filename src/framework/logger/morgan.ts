import morgan, { StreamOptions } from 'morgan';
import { Request } from 'express';
import logger from './winston';

const stream: StreamOptions = {
  write: (message) => logger.info(message),
};

function isGraphQLRequest(body: any): boolean {
  if (body.operationName || (body.query && typeof body.query === 'string')) {
    return true;
  }

  return false;
}

function getGraphQLRequest(query: string): string {
  return query.replaceAll('  ', '').replaceAll('\n', ' ');
}

morgan.token('graphql', (req: Request) => {
  if (req.body && isGraphQLRequest(req.body)) {
    return '\nGraphQL Operation: ' + req.body.operationName + '\nGraphQL Query: ' + getGraphQLRequest(req.body.query);
  }

  return '';
});

function isIntrospectionQuery(req: Request): boolean {
  if (
    req.body &&
    req.body.query &&
    typeof req.body.query === 'string' &&
    req.body.query.includes('query IntrospectionQuery')
  ) {
    return true;
  }

  return false;
}

const skip = (req: Request, res) => {
  const isTesting = process.env.NODE_ENV === 'test';
  const isHealthChecking = req.path === '/health';

  return isTesting || isHealthChecking || isIntrospectionQuery(req);
};

const morganMiddleware = morgan(
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms :graphql',
  {
    stream,
    skip,
  },
);

export default morganMiddleware;
