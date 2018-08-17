

/* eslint-disable */
/* eslint-disable */
(function () {
    const picassoInstance = muze.Muze();
    var dm = muze.DataModel,
        share = muze.operators.share;

    muze.layerFactory.composeLayers('compositeline', [{
        name: 'line1',
        layerType: 'line',
        definition: {
            dataSource: 'dataSource1',
            encoding: {
                x: 'compositeline.encoding.x',
                y: 'compositeline.encoding.y'
            },
            interpolate: 'compositeline.interpolate'
        }
    }, {
        name: 'dottedline',
        layerType: 'line',
        definition: {
            dataSource: 'dottedLineData',
            className: 'line-dashed',
            encoding: {
                x: 'compositeline.encoding.x',
                y: 'compositeline.encoding.y'
            },
            interpolate: 'compositeline.interpolate'
        }
    }, {
        name: 'line3',
        layerType: 'line',
        definition: {
            dataSource: 'dataSource2',
            encoding: {
                x: 'compositeline.encoding.x',
                y: 'compositeline.encoding.y'
            },
            interpolate: 'compositeline.interpolate'
        }
    }]);

    d3.json('../../data/cars.json', (data) => {
        const jsonData = data,
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
        let rootData = new dm(jsonData, schema);
        // rootData = rootData.project(['Cylinders', 'Acceleration']);
        rootData = rootData.groupBy(['Year'], {
            Horsepower: 'mean',
            Acceleration: 'mean'
        });
        let renderer = picassoInstance.width(1000)
            .height(500)
            .data(rootData);
        let viz = renderer.instance();
        let rows = ['Horsepower'],
            columns = ['Year'];

         function render() {
            viz = viz  /* takes the rest of the config from global */
                .rows(rows)
                .columns(columns)
                .layers({
                    Horsepower: {
                        mark: 'compositeline'
                    }
                })
                .transform([
                    ['dataSource1', [dm =>
                        dm.select(fields => new Date(fields.Year.value).getFullYear() <= 1974)]],
                    ['dottedLineData', [dm =>
                        dm.select(fields => {
                            let year = new Date(fields.Year.value).getFullYear();
                            return year >= 1974 && year <= 1976;
                        })]],
                    ['dataSource2', [dm => dm.select(fields =>
                        new Date(fields.Year.value).getFullYear() > 1975)]]
                ])
                .minUnitWidth(20)
                .minUnitHeight(50)
                .mount(document.getElementsByTagName('body')[0]);
        }
        render();
    });
})()
