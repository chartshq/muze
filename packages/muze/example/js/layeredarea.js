

/* eslint-disable */
/* eslint-disable */
(function () {
    const picassoInstance = muze.Muze();
    var dm = muze.DataModel,
        share = muze.operators.share;

    muze.layerFactory.composeLayers('compositearea', [{
        name: 'line12',
        mark: 'line',
        encoding: {
            x: 'compositearea.encoding.x',
            y: 'compositearea.encoding.y'
        }
    },
    {
        name: 'dottedline',
        mark: 'point',
        className: 'line-dashed',
        encoding: {
            y: 'compositearea.encoding.thresholdValue',
            shape: {
                value: 'line'
            }
        },
        find: false
    },
    {
        name: 'line1',
        mark: 'area',
        dataSource: 'rangeAreaData',
        encoding: {
            x: 'compositearea.encoding.x',
            y: 'compositearea.encoding.y',
            y0: 'compositearea.encoding.y0'
        }
    }
]);
    d3.json('../../data/cars.json', (data) => {
        let jsonData = barData,
            schema = [
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
                    type: 'measure'
                },

                {
                    name: 'Displacement',
                    type: 'measure'
                },
                {
                    name: 'Horsepower',
                    type: 'measure'
                },
                {
                    name: 'Weight_in_lbs',
                    type: 'measure',
                },
                {
                    name: 'Acceleration',
                    type: 'measure'
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

                },

            ];
        schema = barSchema;
        let rootData = new dm(jsonData, schema);
        // rootData = rootData.project(['Cylinders', 'Acceleration']);
        // rootData = rootData.groupBy(['Year'], {
        //     Horsepower: 'mean',
        //     Acceleration: 'mean'
        // });

        rootData = rootData.calculatedMeasure({
            name: 'thresholdValue'
        }, ['Value', 'Day'], (value, day) => day === '9' ? 100 : undefined);

        // rootData = rootData.generateDimensions([{
        //     name: 'thresholdValue'
        // }], ['Day'], (day) => day === '9' ? 300 : undefined);
        rootData = rootData.calculatedMeasure({
            name: 'y0Value'
        }, ['Value', 'Day'], (value, day) => 100);
        let renderer = picassoInstance.width(1200)
            .height(500)
            .data(rootData);
        let viz = renderer.instance();

        let rows = [op = share('Value', 'thresholdValue', 'y0Value')],
            columns = ['Day'],
            color = 'Cylinders',
            size = 'Maker';
         function render() {
            viz = viz  /* takes the rest of the config from global */
                .rows(rows)
                .columns(columns)
                .transform([
                    ['rangeAreaData', [
                        dm => dm.select(fields => fields.Value.internalValue >= 100)
                    ]]
                ])
                .layers({
                    [op]: {
                        mark: 'compositearea',
                        encoding: {
                            x: 'Day',
                            y: 'Value',
                            thresholdValue: 'thresholdValue',
                            y0: 'y0Value'
                        }
                    }
                })
                .minUnitWidth(20)
                .minUnitHeight(50)
                .mount(document.getElementsByTagName('body')[0]);
        }
        render();
    });
})()
