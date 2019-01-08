/* global muze, d3 */

const env = muze();
const DataModel = muze.DataModel;

d3.json('../data/cars.json', (data) => {
    const jsonData = data;
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
            name: 'Miles_per_Gallon',
            type: 'measure',
            defAggFn: 'avg'
        },

        {
            name: 'Displacement',
            type: 'measure',
            defAggFn: 'avg'
        },
        {
            name: 'Horsepower',
            type: 'measure',
            defAggFn: 'avg'
        },
        {
            name: 'Weight_in_lbs',
            type: 'measure'
        },
        {
            name: 'Acceleration',
            type: 'measure',
            defAggFn: 'sum'
        },
        {
            name: 'Origin',
            type: 'dimension'
        },
        {
            name: 'Cylinders',
            type: 'dimension'
        },
        {
            name: 'Year',
            type: 'dimension',
            subtype: 'temporal',
            format: '%Y-%m-%d'
        }
    ];
    const dm = new DataModel(jsonData, schema);

    canvas
        .width(600)
        .height(400)
        // @preamble_end
        // DataModel instance is created from https://www.charts.com/static/cars.json data,
        // https://www.charts.com/static/cars-schema.json schema and assigned to variable dm.
        // This is part view of the whole code. Click on copy icon to copy the whole code.
        .data(dm)
        .layers([
            { mark: 'point' },
            { mark: 'line' },
            {
                mark: 'text',
                encoding: {
                    text: {
                        field: 'Displacement',
                        formatter: val => val.toFixed(2)
                    },
                    background: {
                        enabled: true,
                        padding: 5
                    }
                },
                encodingTransform: (points) => {
                    for (let i = 0, len = points.length; i < len; i++) {
                        const currentPoint = points[i];
                        const nextPoint = points[i + 1];
                        if (i === len - 1) {
                            currentPoint.update.y -= 10;
                        } else {
                            const diff = currentPoint.update.y - nextPoint.update.y;
                            if (diff > 0) {
                                currentPoint.update.y += 20;
                            } else {
                                currentPoint.update.y -= 10;
                            }
                        }
                    }
                    return points;
                }
            }
        ])
        .rows(['Displacement'])
        .columns(['Year'])
        // @preamble_start
        .mount('#chart1');
});
