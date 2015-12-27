'use strict';

/**
 * Module dependencies
 */
var chalk = require('chalk');

/**
 * Detect environment
 */
module.exports = function detectEnvironment(verbose) {

  //Initialize
  var env = '';

  //Check if given as NODE_ENV shell export variable
  if (process.env.NODE_ENV) {
    env = process.env.NODE_ENV;
  }

  //Check if overwritten by command line arguments
  process.argv.forEach(function(arg) {
    var parts = arg.split('=');
    if (parts.length === 2) {
      switch (parts[0]) {
        case '-env':
          env = parts[1];
          break;
      }
    }
  });

  //Still no environment?
  if (env === '') {
    env = 'development';
    if (verbose) {
      console.warn(chalk.yellow(
        'Environment not specified, using default development environment.'
      ));
      console.info(chalk.grey(
        'To set your NODE_ENV, add "export NODE_ENV=development" to your bash profile,',
        'or run the application with the -env=environment flag.'
      ));
    }
  }

  //Return value
  return env;
};
