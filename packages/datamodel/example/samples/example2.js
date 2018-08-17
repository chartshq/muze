const DataModel = window.DataModel.default;

const schema = [
    {
        name: 'name',
        type: 'dimension'
    },
    {
        name: 'birthday',
        type: 'dimension',
        subtype: 'temporal',
        format: '%Y-%m-%d'
    },
    {
        name: 'roll',
        type: 'measure'
    }
];

const data = [
    {
        name: 'Rousan',
        birthday: '1995-07-05',
        roll: 12
    },
    {
        name: 'Sumant',
        birthday: '1996-08-04',
        roll: 89
    },
    {
        name: 'Ajay',
        birthday: '1994-01-03',
        roll: 33
    },
    {
        name: 'Sushant',
        birthday: '1994-01-03',
        roll: 33
    },
    {
        name: 'Samim',
        birthday: '1994-01-03',
        roll: 33
    },
    {
        name: 'Akash',
        birthday: '1994-01-03',
        roll: 33
    }
];

const dm = new DataModel(data, schema);
const dataGenerated = dm.getData({
    order: 'column',
    formatter: {
        birthday: val => new Date(val),
        name: val => `Name: ${val}`
    }
});

console.log(dataGenerated);
