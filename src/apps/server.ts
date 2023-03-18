import 'dotenv/config';
import packageJson from '../../package.json';
import { ExpressApp, SocketApp, logger } from '../framework';

import coachingModule from '../contexts/coaching/module';
import paymentManagementModule from '../contexts/payment-management/module';

const appVersion = packageJson.version;

logger.info('version ' + appVersion);

const expressApp = new ExpressApp(packageJson.version, [], [coachingModule.router, paymentManagementModule.router]);
const socketApp = new SocketApp(expressApp, [coachingModule.listeners]);
expressApp.applyErrorManagement();

if (process.env.NODE_ENV !== 'test') {
  socketApp.start([]);
}

export { expressApp };
