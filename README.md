<h3 align="center">
  <br />
  <br />
  <a href="https://github.com/chartshq/muze">
    <img src="https://github.com/rousan/public-server/raw/master/5.png" alt="muzejs" title="muzejs" />
  </a>
</h3>
<br />
<br />
<br />

[![NPM version](https://img.shields.io/npm/v/muze.svg)](https://www.npmjs.com/package/muze)
[![NPM total downloads](https://img.shields.io/npm/dt/muze.svg)](https://www.npmjs.com/package/muze)
[![Contributors](https://img.shields.io/github/contributors/chartshq/muze.svg)](https://github.com/chartshq/muze/graphs/contributors)
[![License](https://img.shields.io/github/license/chartshq/muze.svg)](https://github.com/chartshq/muze/blob/master/LICENSE)

## What is Muze?

Muze is a data visualization library which uses a layered `Grammar of Graphics(GoG)` to create composable and interactive charts. It uses a data-first approach to generate cross interactivity which enables you to control any interaction in the chart directly using the data.

Muze uses the [DataModel](https://github.com/chartshq/datamodel) to control the behaviour of every component in the visualization, making use of the **DataModel** operations to configure complex and cross-connected charts.

## Features

[PLACEHOLDER]
* 🚀 **Blazing fast** bundle times - multicore compilation, and a filesystem cache for fast rebuilds even after a restart.
* 📦 Out of the box support for JS, CSS, HTML, file assets, and more - **no plugins to install**.
* 🐠 **Automatically transforms modules** using Babel, PostCSS, and PostHTML when needed - even `node_modules`.
* ✂️ Zero configuration **code splitting** using dynamic `import()` statements.
* 🔥 Built in support for **hot module replacement**
* 🚨 Friendly error logging experience - syntax highlighted code frames help pinpoint the problem.

## Installation

### CDN

```html
<script src="https://cdn.charts.com/lib/muze/core/latest/muze.js" type="text/javascript"></script>
```

### NPM

```bash
$ npm install --save muze
```

### CSS

Also Copy-paste the required stylesheet `<link>` into the `<head>`:

```html
<link rel="stylesheet" href="https://cdn.charts.com/lib/muze/core/latest/themes/muze.css">
```

## Getting started

1. Prepare the data and the corresponding schema through the [DataModel](https://github.com/chartshq/datamodel) interface:

```javascript
// The schema for cars.json data
const schema = [
  {
    name: 'Name',
    type: 'dimension'
  },
  {
    name: 'Maker',
    type: 'dimension'
  },
  {
    name: 'Horsepower',
    type: 'measure'
  },
  {
    name: 'Origin',
    type: 'dimension'
  }
]

const data = [
   {
    "Name": "chevrolet chevelle malibu",
    "Maker": "chevrolet",
    "Horsepower": 130,
    "Origin": "USA"
  },
  {
    "Name": "buick skylark 320",
    "Maker": "buick",
    "Horsepower": 165,
    "Origin": "USA"
  },
  {
    "Name": "datsun pl510",
    "Maker": "datsun",
    "Horsepower": 88,
    "Origin": "Japan"
  }
]
```

2. Pass the data to muze and render the chart:

```javascript
import muze from 'muze'

const env = muze();
const DataModel = muze.DataModel;
const mountPoint = document.getElementById('chart');

const dm = new DataModel(data, schema);
const rows = ["Horsepower"];
const columns = ["Origin"];

const canvas = env.canvas();
canvas
  .rows(rows)
  .columns(columns)
  .data(dm) 
  .mount(mountPoint)
```

See [charts.com/muze](https://charts.com/muze/docs) for more documentation!

You also can checkout our Yeoman Generator [generator-muze](https://github.com/chartshq/generator-muze) to try out the **muze** through a boilerplate app.

## Documentation

Documentation lives on [charts.com/muze](https://charts.com/muze/docs).

## Community

All feedback and suggestions are welcome!

* 💬 Join the community on [Spectrum](https://spectrum.chat/muze)
* 📣 Stay up to date on new features and announcements on [@muze](https://twitter.com/muze)

## Contributing

Your PRs and stars are always welcome.

Checkout the [CONTRIBUTING](https://github.com/chartshq/muze/CONTRIBUTING) guides.

## License

MIT
