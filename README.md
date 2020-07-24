[![Free](https://img.shields.io/badge/cost-Free-brightgreen)](http://muzejs.org/muze-wa/eula)
[![License](https://img.shields.io/badge/license-Custom-brightgreen)](http://muzejs.org/muze-wa/eula)
[![NPM version](https://img.shields.io/npm/v/@chartshq/datamodel.svg)](https://www.npmjs.com/package/@chartshq/datamodel)
[![Contributors](https://img.shields.io/github/contributors/chartshq/datamodel.svg)](https://github.com/chartshq/datamodel/graphs/contributors)

## What is DataModel?

DataModel is an in-browser representation of tabular data. It uses WebAssembly for high performance and works seamlessly with any JavaScript library. It supports [Relational Algebra](https://en.wikipedia.org/wiki/Relational_algebra) operators which enable you to run `select`, `group`, `sort` (and many more) operations on the data.

The current version performs all the data operations like `filtering`, `aggregation`, etc. on **[WebAssembly](https://webassembly.org/)** which gives a **10x performance** boost compared to the [old JavaScript version](https://github.com/chartshq/datamodel-deprecated).

It is written in [Rust Language](https://www.rust-lang.org/) to handle computation intensive data operations, which is then compiled to **[WebAssembly](https://webassembly.org/)**, thereby providing a native-like performance for data operations.

DataModel can be used if you need an in-browser tabular data store for data analysis, visualization or just general use of data. 

## Features

 * 🎉  Supports [**Relational Algebra**](https://en.wikipedia.org/wiki/Relational_algebra) operators e.g. `selection`, `projection`, `group`, `calculateVariable`, `sort` etc out-of-the-box.

* 💎  Every operation creates **Immutable** DataModel instance and builds a Directed Acyclic Graph (DAG) which establishes auto interactivity.

* 🚀  Uses **[WebAssembly](https://webassembly.org/)** for handling huge datasets and for **better performance**.

* ⛺  Also supports **Nodejs**.

## Installation

### CDN

Insert the DataModel build into the `<head>`:

```html
<script src="https://cdn.jsdelivr.net/npm/@chartshq/datamodel@3.0.0/dist/browser/datamodel.js" type="text/javascript"></script>
```

### NPM

Install DataModel from NPM:

```bash
$ npm install --save @chartshq/datamodel
```

As we're using [Worker](https://developer.mozilla.org/en-US/docs/Web/API/Worker) internally, so the [worker-loader](https://www.npmjs.com/package/worker-loader) needs to be added in your `webpack.config.js` file as follows:

```js
module: {
    rules: [
      {
        test: /\.worker/,
        include: /datamodel/,
        loader: 'worker-loader',
        options: {
          inline: false, // If you want to make it inline, set to true.
          fallback: true
        },
      },
    ],
  },
```

Please visit the [worker-loader](https://www.npmjs.com/package/worker-loader) for more info about the loader.

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

2. Import DataModel as follows:

```js
// If you are using the npm package,
// import the package as below:
import DataModel from '@chartshq/datamodel';

// If you are using CDN, then use it as follows:
const DataModel = window.DataModel;
```

2. Load the DataModel engine and pass the data and schema to `DataModel` constructor and create a new `DataModel` instance:

```js
import Engine from '@chartshq/datamodel';

// As the DataModel are asynchronous, so we need to
// use async-await syntax.
(async () => {
  // Load the DataModel module.
  const DataModel = await Engine.onReady();

  // Converts the raw data into a format
	// which DataModel can consume.
  const formattedData = await DataModel.loadData(data, schema);

  // Create a new DataModel instance with
  // the formatted data.
  const dm = new DataModel(formattedData);

  console.log(dm.getData().data);
  // Output:
  //  [
  //     ["chevrolet chevelle malibu", "chevrolet", 130, "USA"],
  //     ["buick skylark 320", "buick", 165, "USA"],
  //     ["datsun pl510", "datsun", 88, "Japan"]
  //  ]

  // Perform the selection operation
  const selectDm = dm.select({ field: ‘Origin’, value: ‘USA’, operator: ‘eq’ });
  console.log(selectDm.getData().data);
  // Output:
  //  [
  //     ["chevrolet chevelle malibu", "chevrolet", 130, "USA],
  //     ["buick skylark 320", "buick", 165, "USA]
  //  ]

  // Perform the projection operation
  const projectDm = dm.project(["Origin", "Maker"]);
  console.log(projectDm.getData().data);
  // Output:
  //  [
  //     ["USA", "chevrolet"],
  //     ["USA", "buick"],
  //     ["Japan", "datsun"]
  //  ]
  console.log(projectDm.getData().schema);
  // Output:
  //  [
  //     {"name": "Origin","type": "dimension"},
  //     {"name": "Maker","type": "dimension"}
  //  ]
})()
.catch(console.error.bind(console));
```

## Documentation

Find detailed documentation and API reference from [here](https://muzejs.org/docs/concepts/datamodel/introducing-datamodel).

## What has changed?

DataModel 3.0.0 now has the core written in [Rust langauge](https://www.rust-lang.org/)  and has been ported to **[WebAssembly](https://webassembly.org/)** bringing in a huge performance difference w.r.t to [previous version](https://github.com/chartshq/datamodel-deprecated), in terms of both data size and computing speed. While the JavaScript version is deprecated and no active development will take place there but critical bugs if raised would be taken and released in GitHub only.

You can visit the JavaScript (deprecated) version here [https://github.com/chartshq/datamodel-deprecated](https://github.com/chartshq/datamodel-deprecated)

## Migrating from previous versions of DataModel

Now the DataModel became asynchronous as opposed to being synchronous in the previous JavaScript version.

```js
import Engine from '@chartshq/datamodel';

(async () => {
  // Load the DataModel module.
  const DataModel = await Engine.onReady();

  // Converts the raw data into a format
	// which DataModel can consume.
  const formattedData = await DataModel.loadData(data, schema);

  // Create a new DataModel instance with
  // the formatted data.
  const dm = new DataModel(formattedData);
})();
```

### **Changed APIs**

- **select**

    DataModel deprecated version:

    ```js
    dm.select((fields) => { 
    		return fields.Origin.value === 'USA';
    });
    ```

    Latest version:

    ```js
    dm.select({
    		field: 'Origin',
    		operator: DataModel.ComparisonOperators.EQUAL,
    		value: 'USA'
    });
    ```

- **groupBy**

    DataModel deprecated version:

    ```js
    dm.groupBy(['Origin'], {
    		Acceleration: 'avg'
    });
    ```

    Latest version:

    ```js
    dm.groupBy(['Origin'], [{
    		aggn: Datamodel.AggregationFunctions.AVG,
    		field: 'Acceleration'
    }]);
    ```

Supported data operations:

- select
- project
- calculateVariable
- sort
- groupBy

Upcoming data operations:

- join
- bin
- compose
- union
- difference
- ... many more ...

For more details on API's visit our [docs](http://www.muzejs.org/docs)

## License

[Custom License](http://muzejs.org/muze-wa/eula) (Free to use)