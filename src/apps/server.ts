import 'dotenv/config';
import packageJson from '../../package.json';
import { ExpressApp, logger } from '../framework';

import paymentManagementModule from '../contexts/payment-management/module';

const appVersion = packageJson.version;

logger.info('version ' + appVersion);

const expressApp = new ExpressApp(packageJson.version, [], [paymentManagementModule.router]);
expressApp.applyErrorManagement();

if (process.env.NODE_ENV !== 'test') {
  expressApp.start([]);
}

export { expressApp };
