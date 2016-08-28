// Set a ture or false for production/development. Use to run certain plugins
var devBuild = ((process.env.NODE_ENV || '').trim().toLowerCase() !== 'production');

var fs = require('fs');
var path = require('path');
var Metalsmith = require('metalsmith');
var markdown = require('metalsmith-markdown');
var layouts = require('metalsmith-layouts');
var assets = require('metalsmith-assets');
var collections = require('metalsmith-collections');
var permalinks = require('metalsmith-permalinks');
var browserSync = devBuild ? require('metalsmith-browser-sync') : null;
var metadata = require('metalsmith-metadata');
var sass = require('metalsmith-sass');
var inplace = require('metalsmith-in-place');
var debug = require('metalsmith-debug');
var helpers = require('metalsmith-register-helpers');
var postcss = require('metalsmith-with-postcss');
var pkg = require('./package.json');

var dataFiles = fs.readdirSync(path.join(__dirname, 'src', 'data'));
var data = {};

dataFiles.forEach(function (filename) {
  data[filename.split('.')[0]] = 'data/' + filename;
});

var ms = Metalsmith(__dirname)
  .source('src/')
  .destination('./build/')
  .use(metadata(data))
  .use(collections({
    collection: {
      pattern: 'collection/*.md',
      sortBy: 'startDate',
      reverse: true,
      limit: 1
    }
  }))
  .use(permalinks({
    pattern: ':title'
  }))
  .use(markdown({
    smartypants: true,
  }))
  .use(helpers({
    directory: 'lib'
  }))
  .use(inplace({
    engine: 'handlebars',
    pattern: '**/*.html',
    directory: 'src/'
  }))
  .use(layouts({
    engine: 'handlebars',
    directory: 'layouts',
    partials: 'partials',
    default: 'default.html',
    pattern: '**/*.html'
  }))
  .use(sass({
    outputStyle: devBuild ? 'expanded' : 'compressed',
    outputDir: 'styles',
    sourceMap: devBuild ? true : false,
    sourceMapContents: devBuild ? true : false
  }))
  .use(postcss({
    pattern: ['**/*.css', '!**/_*/*', '!**/_*'],
    from: '*.scss',
    to: '*.css',
    map: devBuild ? {inline: false} : false,
    plugins: {
      'autoprefixer': {browsers: ['> 0.5%', 'Explorer >= 10']}
    }
  }))
  .use(assets({
    source: './src/assets', // relative to the working directory
    destination: './assets' // relative to the build directory
  }));

  if(devBuild) ms.use(browserSync({
    server: './build',
    files: ['src/**/*.*', 'layouts/*.*', 'partials/**/*.*'],
    open: false,
    notify: false
  }));

  ms.use(debug({
    files: false,
    match: "**/*.md"
  }))
  .build(function (error) {
    console.log((devBuild ? 'Development' : 'Production'), 'build success, version', pkg.version);
    if (error) {
      console.log(error);
    }
  });