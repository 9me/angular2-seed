import * as gulp from 'gulp';
import * as file from 'gulp-file';
import {join} from 'path';
import config from '../utils/merged-config';
import {ROOT_PATH, CONFIG_PATH, CONFIG_FILE} from '../config';

//Get package information
let pkg = require(join(ROOT_PATH, 'package.json'));

/**
 * Task to get file stream for config file
 */
export default function compiledConfig() {
  let fileContents: string = getConfigFileContents();
  return file(CONFIG_FILE, fileContents);
}

/**
 * Get config file contents
 */
function getConfigFileContents(): string {
  let configLines: string[] = [
    '// Generated configuration file',
    '// To change settings, edit the relevant environment configuration files',
    '// located in ' + CONFIG_PATH
  ];
  for (var property in config) {
    if (config.hasOwnProperty(property)) {
      let configLine: string = getConfigLine(property, config[property]);
      configLines.push(configLine);
    }
  }
  return '\n' + configLines.join('\n');
}

/**
 * Get a config line
 */
function getConfigLine(property: string, value: any): string {
  if (typeof value === 'undefined') {
    return '';
  }
  if (typeof value === 'string') {
    if (value.indexOf('${pkg.') === 0) {
      value = eval('`' + value + '`');
    }
    value = `'${value}'`;
  }
  return `export const ${property} = ${value};`;
}
