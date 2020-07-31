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

[![Free](https://img.shields.io/badge/cost-Free-brightgreen)](http://muzejs.org/muze-wa/eula)
[![License](https://img.shields.io/badge/license-Custom-brightgreen)](http://muzejs.org/muze-wa/eula)
[![NPM version](https://img.shields.io/npm/v/@chartshq/muze.svg)](https://www.npmjs.com/package/@chartshq/muze)
[![Contributors](https://img.shields.io/github/contributors/chartshq/muze.svg)](https://github.com/chartshq/muze/graphs/contributors)

Muze is a free **data visualization library for creating exploratory data visualizations (like Tableau)** in browser, using WebAssembly. It uses a layered Grammar of Graphics (GoG) to create composable and interactive data visualization for web. It is ideal for use in visual analytics dashboards & applications to create highly performant, interactive, multi-dimensional, and composable visualizations.

It uses a data-first approach to define the constructs and layers of the chart, automatically generates cross-chart interactivity, and allows you to over-ride any behavior or interaction on the chart.

Muze uses an in-browser **[DataModel](https://github.com/chartshq/datamodel)** to store and transform data, and control the behaviour of every component in the visualization, thereby enabling creating of complex and cross-connected charts.

## Features

* 🍗  Build complex and interactive visualizations by using **composable** layer constructs.

* 🔨  Use rich **data operators** to transform, visualize and interact with data.

* 👯  Define custom interactions by configuring **physical behavioural model** and **side effect**.

* ✂️  Use **css** to change look and feel of the charts.

* ☀️  Have a **single source of truth** for all your visualization and interaction controlled from data.

* 🔩  Integrate easily with your existing application by **dispatching actions** on demand.

* 🚀  Uses **WebAssembly** for handling huge datasets and for **better performance**.

## Installation

### CDN

Insert the muze build and the required CSS into the `<head>`:

```html
<link href="https://cdn.jsdelivr.net/npm/@chartshq/muze@2.0.0/dist/muze.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/@chartshq/muze@2.0.0/dist/muze.js" type="text/javascript"></script>
```

### NPM

Install muze from NPM:

```bash
$ npm install @chartshq/muze
```

Then you need to add a webpack plugin [copy-webpack-plugin](https://webpack.js.org/plugins/copy-webpack-plugin/) to copy some required muze files to your output `dist` or `build` folder.

```bash
npm install copy-webpack-plugin@5.1.1 --save-dev
```

And then within your webpack configuration object, you'll need to add the `copy-webpack-plugin` to the list of plugins, like so:

```js
const path = require("path");
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  plugins: [
    new CopyWebpackPlugin([
      {
        // Provide your node_modules path where @chartshq/muze
        // package is installed.
        from: path.resolve("<your_node_modules_path>", "@chartshq/muze/dist"),
        to: '.'
      },
    ]),
  ]
}
```

You also can checkout our [muze-app-template](https://github.com/chartshq/muze-app-template) to try out the `Muze` quickly through a boilerplate app.

## Getting Started

Once the installation is done, please follow the steps below:

1. Prepare the data and the corresponding schema:

```js
// Prepare the schema for data.
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

// Prepare the data.
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

2. Import muze as follows:

If you are using the npm package, import the package and its CSS file.
```js
import muze from '@chartshq/muze';
import "@chartshq/muze/dist/muze.css";
```

If you are using CDN, use it as follows:
```js
const muze = window.muze;
```

3. Create a DataModel and a basic chart:

```js
// As the muze and DataModel are asynchronous, so we need to
// use async-await syntax.
async function myAsyncFn() {
  // Load the DataModel module.
  const DataModel = await muze.DataModel.onReady();

  // Converts the raw data into a format
  // which DataModel can consume.
  const formattedData = await DataModel.loadData(data, schema);

  // Create a new DataModel instance with
  // the formatted data.
  let dm = new DataModel(formattedData);

  // Create a global environment to share common configs across charts.
  const env = await muze();

  // Create a new canvas instance from the global
  // environment to render chart on.
  const canvas = env.canvas();

  canvas
  .data(dm) // Set data to the chart.
  .rows(["Horsepower"]) // Fields drawn on Y axis.
  .columns(["Origin"]) // Fields drawn on X axis.
  .mount("#chart"); // Specify an element to mount on using a CSS selector.
}

myAsyncFn()
  .catch(console.error.bind(console));
```

## Documentation

You can find detailed tutorials, concepts and API references at our [Documentation](https://muzejs.org/docs/wa/latest/installation/getting-started).

## What has changed?

Muze 2.0.0 is now powered by WebAssembly bringing in huge performance improvement over the previous versions. The JavaScript version has been deprecated and no active development will take place in that version - but we'll fix critical bugs as and when raised in GitHub.

This version of Muze brings in power of WebAssembly for handling large datasets with ease, along with frictionless interaction and rendering. In addition, the data loading part in WebAssembly version is asynchronous, as opposed to being synchronous in the JavaScript version. Further, the WebAssembly version is free but only available as a compiled binary, whereas the JavaScript version is free and open-source (MIT).

You can visit the deprecated JavaScript version here [https://github.com/chartshq/muze-deprecated](https://github.com/chartshq/muze-deprecated)

## Migrating from previous versions of Muze

Now the Muze became asynchronous as opposed to being synchronous in the previous JavaScript version.

### Changed APIs

- **Creating Env**

    Muze deprecated version:

    ```js
    const env = muze();
    const canvas = env.canvas();
    ```

    Latest version:

    ```js
    (async function () {
      const env = await muze();
      const canvas = env.canvas();
    })();
    ```

- **dispatchBehaviour**

    Muze deprecated version:

    ```js
    canvas.firebolt().dispatchBehaviour('highlight', {
      criteria: {
        Maker: ['ford']
      }
    });
    ```

    Latest version :

    In the current version, the identifiers needs to be passed in dimensions object or range object if it is measure or temporal field.

    ```js
    // Dispatch highlight behaviour on data plots having maker as ford
    canvas.firebolt().dispatchBehaviour('highlight', {
      criteria: {
        dimensions: {
          Maker: ['ford']
        }
      }
    });

    // Dispatch highlight behaviour on data plots having Acceleration
    // between 20 and 50.
    canvas.firebolt().dispatchBehaviour('highlight', {
      criteria: {
        range: {
          Acceleration: [20, 50]
        }
      }
    });
    ```

## Support

Please raise a Github issue [here](https://github.com/chartshq/muze/issues/new).

## Roadmap

Please contribute to our public wishlist or upvote an existing feature at [Muze Public Wishlist & Roadmap](https://github.com/orgs/chartshq/projects/1).

## License

[Custom License](http://muzejs.org/muze-wa/eula) (Free to use)
