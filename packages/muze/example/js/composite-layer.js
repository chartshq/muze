
/* eslint-disable */
/* eslint-disable */
(function () {
    // one type of renderer setup
    const p = muze.Muze();
        // picassoInstance2 = muze.Muze();
    var dm = muze.DataModel;

    var fn = p.width(400);


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
                    // subtype: 'temporal',

                },

            ];
        let rootData = new dm(jsonData, schema);

        // some data operation
        rootData1 = rootData.groupBy(['Year'], {
            Horsepower : 'sum',
            Miles_per_Gallon : 'mean',
            Displacement : 'mean',
            Acceleration: 'mean',
        });

        // create renderer from combinaton of global and local settings
        let viz = fn.instance()
            .height(600)
            .data(rootData1);

        // let viz2 = renderer2.instance();
        function render() {
            viz = viz  /* takes the rest of the config from global */
                .rows(['Horsepower'].reverse())
                .columns(['Year'])
                .mount(d3.select('body').append('div').node());
        }
        render();
    });
})();