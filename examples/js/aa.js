/* eslint-disable */

(function () {
    let env = window.muze();
    const DataModel = window.muze.DataModel;

    d3.csv('/data/austin-weather.csv', (data) => {
        const schema = [{
        name: 'Date',
        type: 'dimension'
    }, {
        name: 'Events',
        type: 'dimension'
    },{
        name: 'DewPointHighF',
        type: 'measure'
    }];
    let dm = new DataModel(data, schema);
    dm = dm.calculateVariable({
        name: 'Year',
        type: 'dimension'
    }, ['Date', (y) => {
        const date = new Date(y);
        return date.getFullYear();
    }]);
    // dm = dm.select((fields) => !!fields.Events.value)
    const canvas = env.canvas();
    
    canvas
        .columns(['Year', 'Events'])
        .rows(['DewPointHighF'])	
        .width(1000)
        .height(400)
        .data(dm)
        .mount('#chart')
    });
})();
