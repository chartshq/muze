d3.csv('/data/coffee.csv', (data) => {  // load data and schema from url
    const schema = [{
        "name": "Market",
        "type": "dimension"
      },
      {
        "name": "Product",
        "type": "dimension"
      },
      {
        "name": "Product Type",
        "type": "dimension"
      },

      {
        "name": "Revenue",
        "type": "measure"
      },
      {
        "name": "Expense",
        "type": "measure"
      },
      {
        "name": "Profit",
        "type": "measure"
      },
      {
        "name": "Order Count",
        "type": "measure"
      }];
    const env = window.muze();
    const DataModel = window.muze.DataModel;
    const rootData = new DataModel(data, schema); /* data and schema is global */
    const canvas = env.canvas();
    canvas
        .rows(['Product Type', 'Product'])
        .columns(['Market', 'Revenue', 'Expense'])
        .data(rootData)
        .width(1000)
        .height(800)
        .config({
            showHeaders: true, /* show the headers of fields used in faceting */
            facetConfig: { rows: { verticalAlign: 'middle' } }, /* dimensional values are placed in middle */
            axes: {
                y: { showAxisName: false }, /* dont show axis name as we are showing headers, its redundant information */
                x: {
                    tickFormat: (d) => {
                        if (d < 1000) return d;
                        if (d > 1000 && d < 1000000) return `${d / 1000}K`
                        if (d > 1000000) return `${d / 1000}M`
                        return d
                    }
                }
            }
        })
        //.title('Visual Crosstab')
        .title('The car acceleration respective to origin',{ position: 'bottom',align:'center'})
        .subtitle('Revenue and Expense by Product type and Market')
        .mount('#chart');

      canvas.once('canvas.animationend').then((client) => {

                const element = document.getElementById('chart');
                element.classList.add('animateon');
              });
    });

