d3.csv('/data/coffee.csv', function (data) {
    // load data and schema from url
    var schema = [{
      "name": "Market",
      "type": "dimension"
    }, {
      "name": "Product",
      "type": "dimension"
    }, {
      "name": "Product Type",
      "type": "dimension"
    }, {
      "name": "Revenue",
      "type": "measure"
    }, {
      "name": "Expense",
      "type": "measure"
    }, {
      "name": "Profit",
      "type": "measure"
    }, {
      "name": "Order Count",
      "type": "measure"
    }];
    var env = window.muze();
    var DataModel = window.muze.DataModel;
    var rootData = new DataModel(data, schema);

    /* data and schema is global */
    var canvas = env.canvas();
    canvas.rows(['Market', 'Product Type']).columns([['Revenue', 'Expense'], ['Revenue', 'Expense']]).data(rootData).width(650).height(800).config({
      showHeaders: true, /* show the headers of fields used in faceting */
      facetConfig: { rows: { verticalAlign: 'middle' } }, /* dimensional values are placed in middle */
      axes: {
        y: { showAxisName: false }, /* dont show axis name as we are showing headers, its redundant information */
        x: {
          tickFormat: function tickFormat(d) {
            if (d < 1000) return d;
            if (d > 1000 && d < 1000000) return d / 1000 + "K";
            if (d > 1000000) return d / 1000 + "M";
            return d;
          }
        }
      }
    })
    .title('Visual Crosstab')
    .mount('#chart')
});