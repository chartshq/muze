<h3 align="center">
  <br />
  <br />
  <a href="https://github.com/chartshq/muze">
    <img src="https://github.com/chartshq/muze/raw/master/logo.png" alt="muzejs" title="muzejs" />
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

Muze is a data visualization library which uses a layered Grammar of Graphics (GoG) to create composable and interactive data visualization for web. It uses a data-first approach to define the constructs and layers of the chart, automatically generates cross-chart interactivity, and allows you to over-ride any behavior or interaction on the chart. 

Muze uses an in-browser [DataModel](https://github.com/chartshq/datamodel) to store and transform data, and control the behaviour of every component in the visualization, thereby enabling creating of complex and cross-connected charts.

## Features

* 🚀 Build complex and interactive visualizations by using **composable** layer constructs.
* 🔨 Use rich **data operators** to transform, visualize and interact with data.
* 👯 Define custom interactions by configuring **physical behavioural model** and **side effect**.
* ✂️ Use **css** to change look and feel of the charts.
* ☀️ Have a **single source of truth** for all your visualization and interaction controlled from data.
* 🔩 Integrate easily with your existing application by **dispatching actions** on demand.

## Installation

### CDN

Insert the muze build and the required CSS into the `<head>`:

```html
<link href="https://cdn.muzejs.org/lib/muze/core/latest/themes/muze.css" rel="stylesheet">
<script src="https://cdn.muzejs.org/lib/muze/core/latest/muze.js" type="text/javascript"></script>
```

### NPM

Install muze from NPM:

```bash
$ npm install --save muze
```

Also import the required stylesheet:

```javascript
import 'muze/dist/muze.css';
```

## Getting started

1. Prepare the data and the corresponding schema using [DataModel](https://github.com/chartshq/datamodel):

```javascript
// Prepare the schema for data
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
    type: 'measure',
    defAggFn: 'avg'
  },
  {
    name: 'Origin',
    type: 'dimension'
  }
]

// Prepare the data
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

2. Pass the data and schema to `DataModel` and create a new `DataModel` instance:

```javascript
const DataModel = muze.DataModel;
const dm = new DataModel(data, schema);
```

3. Pass the `DataModel` instance to `muze` and create your first chart:

```javascript
import muze from 'muze';
import 'muze/dist/muze.css';

// Create a global environment to share common configs across charts
const env = muze();
// Create a new canvas instance from the global environment
const canvas = env.canvas();
canvas
  .data(dm) 
  .rows(["Horsepower"]) // Fields drawn on Y axis
  .columns(["Origin"]) // Fields drawn on X axis
  .mount("#chart"); // Specify an element to mount on using a CSS selector
```

See [muzejs.org/docs](https://muzejs.org/docs) for more documentation!

You also can checkout our Yeoman Generator [generator-muze](https://github.com/chartshq/generator-muze) to try out the **muze** through a boilerplate app.

## Documentation

You can find detailed tutorials, concepts and API references at [muzejs.org/docs](https://muzejs.org/docs).

## Support

Please raise a Github issue [here](https://github.com/chartshq/muze/issues/new).

## Roadmap

Please contribute to our public wishlist or upvote an existing feature at [Muze Public Wishlist & Roadmap](https://feedback.muzejs.org)

## Contributing

Your PRs and stars are always welcome :). Checkout the [Contributing](https://github.com/chartshq/muze/blob/master/CONTRIBUTING.md) guides.

## License

MIT
