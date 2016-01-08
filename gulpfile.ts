import * as gulp from 'gulp';
import {cleanDist} from './build/tasks/clean';
import compiledConfig from './build/tasks/compiled-config';

/**
 * Folder cleaning
 */
gulp.task('clean', gulp.parallel(cleanDist));
gulp.task('clean.dist', cleanDist);
