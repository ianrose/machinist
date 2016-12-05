// Set a ture or false for production/development. Use to run certain plugins
var devBuild = ((process.env.NODE_ENV || '').trim().toLowerCase() !== 'production')
var debugMode = ((process.env.NODE_ENV || '').trim().toLowerCase() === 'debug')

var fs = require('fs')
var path = require('path')
var Metalsmith = require('metalsmith')
var markdown = require('metalsmith-markdown')
var layouts = require('metalsmith-layouts')
var assets = require('metalsmith-assets')
var collections = require('metalsmith-collections')
var permalinks = require('metalsmith-permalinks')
var browserSync = devBuild ? require('metalsmith-browser-sync') : null
var globaldata = require('metalsmith-metadata')
var sass = require('metalsmith-sass')
var inplace = require('metalsmith-in-place')
var debug = require('metalsmith-debug')
var helpers = require('metalsmith-register-helpers')
var sitemap = require('metalsmith-mapsite')
var postcss = require('metalsmith-with-postcss')
var paths = require('metalsmith-paths')
var drafts = require('metalsmith-drafts')
var uglify = require('metalsmith-uglify')
var webpack = require('metalsmith-webpack')
var models = require('./lib/metalsmith-models')
var writemetadata = require('metalsmith-writemetadata')
var raw = require('metalsmith-raw')
var fingerprint = require('metalsmith-fingerprint-ignore')
var pkg = require('./package.json')

var dataFiles = fs.readdirSync(path.join(__dirname, 'src/data', 'globals'))
var data = {}

dataFiles.forEach(function (filename) {
  data[filename.split('.')[0]] = 'data/globals/' + filename
})

var config = {
  name: '',
  version: pkg.version,
  devBuild: devBuild,
  debugMode: debugMode,
  domain: '',
  url: 'http://www.github.com',
  dest: './www/'
}

var ms = Metalsmith(__dirname)
  .source('src/')
  .destination(config.dest)
  .metadata(config)
  .use(globaldata(data))
  .use(models({
    directory: './src/data/models'
  }))
  .use(collections({
    posts: {
      pattern: 'posts/**/!(index.md)',
      sortBy: 'date',
      reverse: true
    },
    collection2: {
      pattern: 'collection2/**/!(index.md)',
      sortBy: 'date',
      reverse: true
    }
  }))
  .use(markdown({
    smartypants: true,
    gfm: true,
    tables: true
  }))
  .use(drafts())
  .use(permalinks({
    relative: false,
    pattern: ':file',
    linksets: [{
      match: {collection: 'articles'},
      pattern: ':collection/:title'
    }, {
      match: {collection: 'work'},
      pattern: ':collection/:title'}
    ]
  }))
  .use(paths({
    property: 'paths',
    directoryIndex: 'index.html'
  }))
  .use(raw())
  .use(sass({
    outputStyle: devBuild ? 'expanded' : 'compressed',
    outputDir: 'styles',
    sourceMap: devBuild || false,
    sourceMapContents: devBuild || false
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
  .use(webpack({
    context: './src/scripts/',
    entry: './main.js',
    devtool: devBuild ? 'source-map' : null,
    output: {
      path: path.resolve(__dirname, './www/scripts/'),
      filename: devBuild ? '[name].js' : '[name].[hash].js'
    }
  }))
  .use(fingerprint({
    pattern: 'styles/main.css',
    keep: true
  }))
  .use(helpers({
    directory: 'lib'
  }))
  .use(inplace({
    engine: 'handlebars',
    pattern: '**/*.{html,xml}',
    directory: 'src/'
  }))
  .use(layouts({
    engine: 'handlebars',
    directory: 'layouts',
    partials: 'partials',
    default: 'default.hbs',
    pattern: '**/*.html'
  }))
  .use(assets({
    source: './assets', // relative to the working directory
    destination: './assets' // relative to the build directory
  }))

if (debugMode) {
  ms.use(writemetadata({
    pattern: ['**/*.md', '**/*.html'],
    bufferencoding: 'utf8'
  }))
}

if (!devBuild) {
  ms.use(uglify({
    removeOriginal: true,
    nameTemplate: '[name].js'
  }))
}

if (devBuild) {
  ms.use(browserSync({
    server: config.dest,
    files: ['src/**/*.*', 'layouts/*.*', 'partials/**/*.*'],
    open: false,
    notify: false
  }))
}

ms.use(debug({
  files: false,
  match: '**/*.md'
}))
  .use(sitemap({ // generate sitemap.xml
    hostname: config.url,
    omitIndex: true
  }))
  .build(function (error) {
    console.log((devBuild ? 'Development' : 'Production'), 'build success, version', pkg.version)
    if (error) {
      console.log(error)
    }
  })
