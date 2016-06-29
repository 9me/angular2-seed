/**
 * SystemJS configuration
 */
(function() {

  //Map tells the System loader where to look for things
  var map = {
    'app': 'app',
    '@angular': 'node_modules/@angular',
    'rxjs': 'node_modules/rxjs'
  };

  //Packages tells the System loader how to load when no filename and/or
  //extension are specified
  var packages = {
    'app': { main: 'index.js', defaultExtension: 'js' },
    'rxjs': { defaultExtension: 'js' }
  };

  //Angular packages
  var ngPackages = [
    'common',
    'compiler',
    'core',
    'http',
    'platform-browser',
    'platform-browser-dynamic',
    'router'
  ];

  //Individual files
  function packIndex(pkgName) {
    packages['@angular/' + pkgName] = {
      main: 'index.js',
      defaultExtension: 'js'
    };
  }

  //Bundled
  function packUmd(pkgName) {
    packages['@angular/' + pkgName] = {
      main: pkgName + '.umd.js',
      defaultExtension: 'js'
    };
  }

  //Most environments should use UMD; some (Karma) need the individual files
  var setPackageConfig = System.packageWithIndex ? packIndex : packUmd;

  //Add package entries for angular packages
  ngPackages.forEach(setPackageConfig);

  //Configure system
  System.config({
    map: map,
    packages: packages
  });
})(this);
