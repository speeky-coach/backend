import 'module-alias/register';
import 'dotenv/config';
import packageJson from '../../package.json';
import { logger } from '@speeky/framework';

const appVersion = packageJson.version;

logger.info('version ' + appVersion);
