// import {writeFile} from 'fs';
import * as gulp from 'gulp';
import * as file from 'gulp-file';
import {join} from 'path';
import config from '../utils/merged-config';
import {ROOT_PATH, APP_SRC, CONFIG_PATH, CONFIG_FILE} from '../config';

//Get package information
let pkg = require(join(ROOT_PATH, 'package.json'));

/**
 * Task to write config file
 */
export default function compileConfig() {
  let fileContents: string = getConfigFileContents();
  return file(COMPILED_CONFIG_FILE, fileContents, {
    src: true
  }).pipe(gulp.dest(APP_SRC));
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
