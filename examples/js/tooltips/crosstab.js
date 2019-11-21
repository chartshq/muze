/* eslint-disable */
const env7 = muze();
const DataModel7 = muze.DataModel;

d3.csv('../../data/coffee.csv', (data) => {
    let csvData = data;
    const schema7 = [{
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
    let rootData7 = new DataModel7(csvData, schema7);
    let canvas7 = env7.canvas();

    canvas7 = canvas7
      .rows([[],['Market', 'Product Type', 'Product']])
      .columns([['Revenue', 'Expense'], ['Revenue', 'Expense']])
      .data(rootData7)
      .width(750)
      .height(1300)
      .config({
        showHeaders: true, /* show the headers of fields used in faceting */
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
        },
        facetConfig: { rows: { verticalAlign: 'bottom' } }, /* dimensional values are placed in middle */
        border:{
            showRowBorders: {
              top: true,
              bottom: true,
            },
            showColBorders:{
                left: true,
                right: true
            },
            showValueBorders: {
                top: true,
                bottom: true,
                left: true,
                right: true
            }
        },
      })
      .title('Visual Crosstab')
      .subtitle('Revenue and Expense by Product type and Market')
      .mount('#chart7');
});