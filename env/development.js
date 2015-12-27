'use strict';

/**
 * Environment configuration (development)
 */
module.exports = {

  /**
   * App settings
   */
  app: {
    title: 'My Application (dev)',
    baseUrl: 'http://localhost:8080'
  },

  /**
   * API settings
   */
  api: {
    baseUrl: 'http://localhost:' + (process.env.PORT || 8081)
  },

  /**
   * Build settings
   */
  build: {
    js: {
      minify: {
        app: false,
        vendor: false
      },
      sourcemap: {
        app: false,
        vendor: false
      }
    },
    css: {
      minify: {
        app: false,
        vendor: false
      }
    }
  }
};
