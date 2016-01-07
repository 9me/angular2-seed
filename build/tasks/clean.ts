import * as gulp from 'gulp';
import * as del from 'del';
import {APP_DEST} from '../config';

/**
 * Options
 */
let options = {
  dot: true
};

/**
 * Folder cleaning function
 */
export function cleanDist(done) {
  return del(APP_DEST, options);
};
