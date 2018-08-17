/* eslint-disable */

const DataModel = window.DataModel.default;
let dm;

d3.json('./data/cars.json', (data) => {
    const jsonData = data,
        schema = [{
            name: 'Name',
            type: 'dimension'
        }, {
            name: 'Miles_per_Gallon',
            type: 'measure',
            unit : 'cm',
            scale: '1000',
            numberformat: '12-3-3'
        }, {
            name: 'Cylinders',
            type: 'dimension'
        }, {
            name: 'Displacement',
            type: 'measure'
        }, {
            name: 'Horsepower',
            type: 'measure'
        }, {
            name: 'Weight_in_lbs',
            type: 'measure',
        }, {
            name: 'Acceleration',
            type: 'measure'
        }, {
            name: 'Year',
            type: 'dimension',
        }, {
            name: 'Origin',
            type: 'dimension'
        }];
    dm = new DataModel(jsonData, schema);
    dms = dm.select((data) => {
        return data.Acceleration.value >= 15;
    });
    console.log(dms.getData());
    const data1 = [
        { profit: 10, sales: 20, city: 'a', state: 'aa' },
        { profit: 15, sales: 25, city: 'b', state: 'bb' },
        { profit: 10, sales: 20, city: 'a', state: 'ab' },
        { profit: 15, sales: 25, city: 'b', state: 'ba' },
    ];
    const schema1 = [
        { name: 'profit', type: 'measure' },
        { name: 'sales', type: 'measure' },
        { name: 'city', type: 'dimension' },
        { name: 'state', type: 'dimension' },
    ];
    const dataModel = new DataModel(data1, schema1, 'Yo');
    const next = dataModel.project(['profit', 'sales']).select(f => +f.profit > 10);
    const child = next.createMeasure({
        name: 'Efficiency'
    }, ['profit', 'sales'], (profit, sales) => profit / sales);
    console.log(child.getData().data);
    // test selection
    console.log('Testing selection')
    const selected = dataModel.select((fields) => {
        return fields.profit.value === 10;
    });
    console.log(selected.getData())

    console.log('Testing rejection');
    const rejected = dataModel.select((fields) => {
        return fields.profit.value === 10;
    }, {
        mode: 'inverse'
    });
    console.log(rejected.getData());

    console.log('Testing all mode');
    const teenTitansUnite = dataModel.select((fields) => {
        return fields.profit.value === 10;
    }, {
        mode: 'all'
    });
    console.log('ALL: selection')
    console.log(teenTitansUnite[0].getData());
    console.log('ALL: rejection');
    console.log(teenTitansUnite[1].getData());

    console.log('Test projection')
    const project = dataModel.project(['profit', 'sales']);
    console.log(project.getData().data);
    const reject = dataModel.project(['profit', 'sales'], {
        mode: 'exclude'
    });
    console.log(reject.getData().data);

    const yodata = [
        { a: 10, aaa: 20, aaaa: 'd' },
        { a: 15, aaa: 25, aaaa: 'demo' },
    ];
    const yoschema = [
        { name: 'a', type: 'measure' },
        { name: 'aaa', type: 'measure' },
        { name: 'aaaa', type: 'dimension' },
    ];
    const yodataModel = new DataModel(yodata, yoschema);
    const yoprojectedDataModel = yodataModel.project(['aaaa', 'a']);
    const invProjectedDataModel = yodataModel.project(['aaaa', 'a'], {
        mode: 'exclude'
    });
    console.log(invProjectedDataModel.getData())

    const dataLicious = [
        {
            year: '2010',
            Import_yo: 4000,
            Export_dude: 3000
        },
        {
            year: '2011',
            Import_yo: 4000,
            Export_dude: 7000
        },
        {
            year: '2012',
            Import_yo: 3000,
            Export_dude: 5000
        }
    ];
    const d_schema = [
        {
            name: 'year',
            type: 'dimension'
        },
        {
            name: 'Import_yo',
            type: 'measure'
        },
        {
            name: 'Export_dude',
            type: 'measure'
        }
    ];
    const dataInstance = new DataModel(dataLicious, d_schema);
    const almostPivoted = dataInstance.createDimensionFrom(['Import_yo', 'Export_dude'], 'type', 'values', values => values.split('_')[0]);
    console.log(almostPivoted.getData())

    // testing binning in datamodel
    const toBinData = [{
        marks: 1,
    }, {
        marks: 2,
    },{
        marks: 3,
    },{
        marks: 4
    },{
        marks: 4,
    },{
        marks: 5,
    },{
        marks: 5,
    },{
        marks: 9,
    }];
    const toBinSchema = [{
        name: 'marks',
        type: 'measure'
    }];
    const toBinDataModel = new DataModel(toBinData, toBinSchema);
    const buckets = [
        { end: 1, label: 'useless'},
        { start: 1, end: 4, label: 'failure'},
        { start: 4, end: 6, label: 'firstclass'},
        { start: 6, end: 10, label: 'decent'}
    ];
    let binnedDM = toBinDataModel.createBin('marks', {
        buckets,
    }, 'rating1');
    console.log(binnedDM.getData());
    let binnedDMnum = toBinDataModel.createBin('marks', {
        numOfBins: 4
    }, 'rating2');
    console.log(binnedDMnum.getData());
    let binnedDMSize = toBinDataModel.createBin('marks', {
        binSize: 4,
    }, 'rating3');
    console.log(binnedDMSize.getData());
});

function load (url) {
    return new Promise(function(resolve, reject) {
        var request = new XMLHttpRequest();
        request.open('GET', url);
        request.onload = function() {
            if (request.status === 200) {
                resolve(request.response);
            } else {
                reject(Error('File didn\'t load successfully; error code:' + request.statusText));
            }
        };
        request.onerror = function() {
            reject(Error('There was a network error.'));
        };
        request.send();
    });
  }


// load('../../js/cars.csv')
//     .then((res) => {
//         dm = new DataModel(res.split('\n').map(line => line.split(',')), {}, 'myDataModel', { dataFormat: 'DSVArr' });
//     });
