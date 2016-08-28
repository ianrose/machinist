var fs = require('fs');
var path = require('path');
var Metalsmith = require('metalsmith');
var markdown = require('metalsmith-markdown');
var layouts = require('metalsmith-layouts');
var assets = require('metalsmith-assets');
var collections = require('metalsmith-collections');
var permalinks = require('metalsmith-permalinks');
var browserSync = require('metalsmith-browser-sync');
var metadata = require('metalsmith-metadata');
var sass = require('metalsmith-sass');
var inplace = require('metalsmith-in-place');
var debug = require('metalsmith-debug');
var postcss = require('metalsmith-with-postcss');
var pkg = require('./package.json');

var devBuild = ((process.env.NODE_ENV || '').trim().toLowerCase() !== 'production');
console.log((devBuild ? 'Development' : 'Production'), 'build, version', pkg.version);

var dataFiles = fs.readdirSync(path.join(__dirname, 'src', 'data'));
var data = {};

dataFiles.forEach(function (filename) {
  data[filename.split('.')[0]] = 'data/' + filename;
});

Metalsmith(__dirname)
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
  .use(markdown())
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
    outputStyle: 'expanded',
    outputDir: 'styles'
  }))
  .use(postcss({
    pattern: ['**/*.css', '!**/_*/*', '!**/_*'],
    plugins: {
      'autoprefixer': {browsers: ['> 0.5%', 'Explorer >= 10']}
    },
    map: false
  }))
  .use(assets({
    source: './src/assets', // relative to the working directory
    destination: './assets' // relative to the build directory
  }))
  // .use(browserSync({
  //   server: './build',
  //   files: ['src/**/*.*', 'layouts/*.*', 'partials/**/*.*'],
  //   open: false,
  //   notify: false
  // }))//
  .use(debug({
    files: false,
    match: "**/*.md"
  }))
  .build(function (error) {
    if (error) {
      console.log(error);
    }
  });