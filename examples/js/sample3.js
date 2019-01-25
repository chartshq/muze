/* eslint-disable */

(function () {
    let env = window.muze();
    const DataModel = window.muze.DataModel;

    d3.json('/data/cars.json', (data) => {
         data = [
            ["Horsepower", "Acceleration", "Origin", "Year", "Name"],
            [null, 22.4, "USA", "2001-01", "ford"],
            [115, 17.5, "Europe", "2002-01", "mazda"],
            [95, null, "Japan", null, "audi"],
            [120, 13.9, "India", "2004-01", null],
            [102, 15.7, "China", "2005-01", "chevroleet"]
          ];

        // data = [{
        //     Origin: 'USA',
        //     Acceleration: 20,
        //     Name: 'ford',
        //     Year: '2001-01'
        // }, {
        //     Origin: 'Japan',
        //     Acceleration: 30,
        //     Name: 'ford',
        //     Year: '2002-01'
        // }, {
        //     Origin: 'China',
        //     Acceleration: null,
        //     Name: null,
        //     Year: '2003-01'
        // }, {
        //     Origin: 'China',
        //     Acceleration: '',
        //     Name: null,
        //     Year: '2003-01'
        // }, {
        //     Origin: 'ss',
        //     Acceleration: 40,
        //     Name: 'aws',
        //     Year: "null"
        // }, {
        //     Origin: null,
        //     Acceleration: 40,
        //     Name: 'aws',
        //     Year: "null"
        // }];

        let jsonData = data,
		    schema = [{
        name: 'Name',
        type: 'dimension'
    }, {
        name: 'Maker',
        type: 'dimension'
    }, {
        name: 'Miles_per_Gallon',
        type: 'measure'
    }, {
        name: 'Displacement',
        type: 'measure'
    }, {
        name: 'Horsepower',
        type: 'measure'
    }, {
        name: 'Weight_in_lbs',
        type: 'measure'
    }, {
        name: 'Acceleration',
        type: 'measure'
    }, {
        name: 'Origin',
        type: 'dimension'
    }, {
        name: 'Cylinders',
        type: 'dimension'
    }, {
        name: 'Year',
        type: 'dimension',
        subtype: "temporal",
	    format: "%Y-%m"
    }];

    // DataModel.configureInvalidAwareTypes({
    //     '': DataModel.InvalidAwareTypes.NULL,
    // });


        const rootData = new DataModel(jsonData, schema)
        // .calculateVariable(
		// 	{
		// 	  name: "date",
		// 	  type: "dimension",
		// 	  subtype: "temporal",
		// 	  format: "%Y-%m"
		// 	},
		// 	[
		// 	  "Year",
		// 	  d => d
		// 	]
		//   );
        env = env.data(rootData).minUnitHeight(40).minUnitWidth(40);
        const mountPoint = document.getElementById('chart');
        window.canvas = env.canvas();
        canvas = canvas.rows(['Acceleration'])
            .color({
                field: 'Acceleration',
                step: true,
                range: ['#ff0000', '#00ff00']
            })
            .columns([ 'Year']).data(rootData).height(1200).width(900).mount(mountPoint)
            .layers([{
                mark: 'point',
                connectNullData: false
            }, {
                mark: 'text',
                encoding: {
                    text: 'Acceleration'
                }
            }]);
    });
}());

