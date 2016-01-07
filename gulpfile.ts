import * as gulp from 'gulp';
import {cleanDist} from './build/tasks/clean';
import compileConfig from './build/tasks/compile-config';

/**
 * Folder cleaning
 */
gulp.task('clean', gulp.parallel(cleanDist));
gulp.task('clean.dist', cleanDist);


/**
 * Config file compilation
 */
gulp.task('build.config', compileConfig);
