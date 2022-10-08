import 'dotenv/config';
import packageJson from '../../package.json';
import { ExpressApp, logger } from '../framework';

const appVersion = packageJson.version;

logger.info('version ' + appVersion);

const expressApp = new ExpressApp(packageJson.version, [], []);
expressApp.applyErrorManagement();

if (process.env.NODE_ENV !== 'test') {
  expressApp.start([]);
}

export { expressApp };
