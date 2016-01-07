import {normalize, join} from 'path';
import {argv} from 'yargs';

//Get package information
let pkg = require('../package.json');

/**
 * Environment
 */
export const ENV = argv['env'] || process.env.NODE_ENV || 'dev';
export const VERSION = pkg.version;

/**
 * Paths
 */
export const ROOT_PATH = normalize(join(__dirname, '..'));

/**
 * Source folders
 */
export const APP_SRC = join(ROOT_PATH, 'app');
export const STATIC_SRC = join(APP_SRC, 'static');

/**
 * Destination paths
 */
export const APP_DEST = join(ROOT_PATH, 'dist', ENV);
export const STATIC_DEST = APP_DEST;

/**
 * Application configuration
 */
export const CONFIG_PATH = join(ROOT_PATH, 'config');
export const CONFIG_FILE = 'config.ts';
