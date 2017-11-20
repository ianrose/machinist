// Set a true or false for production/development. Use to run certain plugins
const devBuild = ((process.env.NODE_ENV || '').trim().toLowerCase() === 'development')
const stageBuild = ((process.env.NODE_ENV || '').trim().toLowerCase() === 'staging')
const productionBuild = ((process.env.NODE_ENV || '').trim().toLowerCase() === 'production')
const debugMode = ((process.env.NODE_ENV || '').trim().toLowerCase() === 'debug')

// Dependencies
const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const Metalsmith = require('metalsmith')
const markdown = require('metalsmith-markdown')
const layouts = require('metalsmith-layouts')
const assets = require('metalsmith-assets')
const collections = require('metalsmith-collections')
const permalinks = require('metalsmith-permalinks')
const browserSync = devBuild ? require('metalsmith-browser-sync') : null
const globaldata = require('metalsmith-metadata')
const sass = require('metalsmith-sass')
const inplace = require('metalsmith-in-place')
const debug = require('metalsmith-debug')
const helpers = require('metalsmith-register-helpers')
const sitemap = require('metalsmith-mapsite')
const postcss = require('metalsmith-with-postcss')
const paths = require('metalsmith-paths')
const drafts = require('metalsmith-drafts')
const webpack = require('metalsmith-webpack2')
const models = require('metalsmith-models')
const filedata = require('metalsmith-filedata')
const writemetadata = require('metalsmith-writemetadata')
const raw = require('metalsmith-raw')
const fingerprint = require('metalsmith-fingerprint-ignore')
const pkg = require('./package.json')
const config = yaml.safeLoad(fs.readFileSync('config.yml', 'utf8'))

// Global Configuration
let assetPath

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
const data = {}
if (fs.existsSync(config.src + 'data/globals/')) {
  const dataFiles = fs.readdirSync(path.join(__dirname, config.src + 'data', 'globals'))

  dataFiles.forEach(function (filename) {
    data[filename.split('.')[0]] = 'data/globals/' + filename
  })
}

// Metalsmith Build
const ms = Metalsmith(__dirname)
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
  .use(webpack(require('./webpack.config.js')(config)))
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
      throw error
    }
  })
