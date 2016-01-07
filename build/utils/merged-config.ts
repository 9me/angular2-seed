import {readFileSync} from 'fs';
import {join} from 'path';
import * as YAML from 'yamljs';
import {ENV, CONFIG_PATH} from '../config';

/**
 * Load and merge environment configuration files
 */
let env = loadConfig(ENV);
let local = loadConfig('local');
let config = Object.assign(env, local);

/**
 * Export merged as object
 */
export default config;

/**
 * Helper to load a config file and return parsed YAML object
 */
function loadConfig(env): any {
  try {
    let configPath: string = join(CONFIG_PATH, env + '.yml');
    let configYaml: string = readFileSync(configPath).toString();
    return YAML.parse(configYaml);
  }
  catch (e) {
    console.log(e);
    return {};
  }
}
