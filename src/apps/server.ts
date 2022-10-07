import 'dotenv/config';
import packageJson from '../../package.json';
import { logger } from '../framework';

const appVersion = packageJson.version;

logger.info('version ' + appVersion);
