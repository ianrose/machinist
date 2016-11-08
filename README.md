# Machinist

An opinionated boilerplate for a [Metalsmith](http://www.metalsmith.io/) static site.

- [Handlebars](http://handlebarsjs.com/)
- SemistandardJS
- Sass
- Stylelint Standard
- Webpack
- Autoprefixer
- HTMLHint
- Editorconfig

## Requirements

[node.js](https://nodejs.org/en/)

## How to Setup

### 1. Clone

```
git clone https://github.com/ianrose/machinist.git
```

### 2. Install Dependencies

```
$ npm install
```

## How to use

### Develop

Runs your project locally at `localhost:3000` with BrowserSync. Edit contents of `./layouts`, `./lib`, `./partials`, and `./src`.

```
npm run dev
```

Develop with Metalsmith debugging.

```
npm run debug
```

### Build

Generates your dist to be deployed in the folder `./www`.

```
npm run build
```

### Lint

Lints your styles, scripts, and markup.

```
npm run lint
```

### Format

Fix lint errors in your styles and scripts.

```
npm run format
```
