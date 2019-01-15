/* eslint-disable */

(function () {
    let env = window.muze();
    const DataModel = window.muze.DataModel;

    d3.csv('/data/coffee.csv', (data) => {
        let jsonData = data,
        schema = [{
            name: 'Market',
            type: 'dimension'
        },
        {
            name: 'Product',
            type: 'dimension'
        },
        {
            name: 'Product Type',
            type: 'dimension'
        },
        {
            name: 'Revenue',
            type: 'measure'
        },
        {
            name: 'Expense',
            type: 'measure'
        },
        {
            name: 'Profit',
            type: 'measure',
        },
        {
            name: 'Order Count',
            type: 'measure'
        },
    ];
    const dm = new DataModel(jsonData, schema);
    const canvas = env.canvas();
    
    canvas
        .data(dm)
        .width(600)
        .height(400)
        .rows(['Revenue'])
        .columns(['Product'])
        .mount('#chart') /* Attaching the canvas to DOM element */
        .config({
            axes: {
                y: {
                    tickFormat : (d)=>{
                        if (d<1000) return d;
                        if (d>1000 && d<=1000000) return `${d/1000}K`;
                        if (d>1000000) return `${d/1000}M`;
                        return d;
                    },
                    tickValues: [200000, 400000, 600000, 800000, 1000000],                        
                }
            }
        });

        setTimeout(() => {
            return canvas.config({
                axes: {
                    y: {                        
                        name: 'hello world',
                        tickFormat: (value) => `${value}h`
                    }
                }
            });
        }, 2000);
    });
}());
