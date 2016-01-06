import env from './build/utils/merge-config';

//Get package information
let pkg = require('../package.json');

//Helper to get config with optional default value
function config(property: string, defaultValue = null): any {
  if (typeof env[property] !== 'undefined') {
    if (typeof env[property] === 'string') {
      return eval('`' + env[property] + '`');
    }
    return env[property];
  }
  return defaultValue;
}

/**
 * Application settings
 */
export const APP_NAME = config('APP_NAME', '');
export const APP_VERSION = config('APP_VERSION', '');
export const APP_TITLE = config('APP_TITLE', '');
export const APP_BASE_URL = config('APP_BASE_URL', '');

/**
 * API settings
 */
export const API_VERSION = config('API_VERSION', 0);
export const API_BASE_URL = config('API_BASE_URL', '');

/**
 * Authentication settings
 */
export const AUTH_CLIENT_IDENTIFIER = config('AUTH_CLIENT_IDENTIFIER', '');

/**
 * Analytics settings
 */
export const ANALYTICS_ENABLED = config('ANALYTICS_ENABLED', false);
export const ANALYTICS_TRACKING_ID = config('ANALYTICS_TRACKING_ID', '');

/**
 * Build settings
 */
export const BUILD = config('BUILD', {});
