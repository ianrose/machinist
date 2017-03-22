// Set a true or false for production/development. Use to run certain plugins
var devBuild = ((process.env.NODE_ENV || '').trim().toLowerCase() === 'development')
var stageBuild = ((process.env.NODE_ENV || '').trim().toLowerCase() === 'staging')
var productionBuild = ((process.env.NODE_ENV || '').trim().toLowerCase() === 'production')
var debugMode = ((process.env.NODE_ENV || '').trim().toLowerCase() === 'debug')

// Dependencies
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
var models = require('metalsmith-models')
var filedata = require('metalsmith-filedata')
var writemetadata = require('metalsmith-writemetadata')
var raw = require('metalsmith-raw')
var fingerprint = require('metalsmith-fingerprint-ignore')
var pkg = require('./package.json')
var config = require('./config.json')

// Global Configuration
var assetPath

if (devBuild) {
  assetPath = config.assetPath.development
}

if (stageBuild) {
  assetPath = config.assetPath.stage
}

if (productionBuild) {
  assetPath = config.assetPath.production
}

config.assetPath = assetPath
config.version = pkg.version
config.dependencies = pkg.dependencies
config.repository = pkg.repository.url
config.devBuild = devBuild
config.debugMode = debugMode

// Adds metadata from files
var data = {}
if (fs.existsSync(config.src + 'data/globals/')) {
  var dataFiles = fs.readdirSync(path.join(__dirname, config.src + 'data', 'globals'))

  dataFiles.forEach(function (filename) {
    data[filename.split('.')[0]] = 'data/globals/' + filename
  })
}

// Metalsmith Build
var ms = Metalsmith(__dirname)
  .source(config.src)
  .destination(config.dest)
  .metadata(config)
  .use(globaldata(data))
  .use(models({
    directory: config.src + 'data/models'
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
  .use(filedata({
    pattern: ['styles/*.css'],
    key: 'cssData'
  }))
  .use(webpack({
    context: config.src + 'scripts/',
    entry: './main.js',
    devtool: devBuild ? 'source-map' : null,
    output: {
      path: path.resolve(__dirname, config.dest + 'scripts/'),
      filename: devBuild ? '[name].js' : '[name].[hash].js'
    }
  }))
  .use(fingerprint({
    pattern: 'styles/main.css',
    keep: true
  }))
  .use(raw())
  .use(helpers({
    directory: 'lib/helpers'
  }))
  .use(inplace({
    engine: 'handlebars',
    pattern: '**/*.{html,xml,txt,md}',
    directory: config.src
  }))
  .use(markdown({
    smartypants: true,
    gfm: true,
    tables: true,
    langPrefix: 'language-'
  }))
  .use(layouts({
    engine: 'handlebars',
    directory: 'layouts',
    partials: 'partials',
    default: 'default.hbs',
    pattern: '**/*.html'
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
    files: [config.src + '**/*.*', 'layouts/*.*', 'partials/**/*.*'],
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
