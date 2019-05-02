/* eslint-disable */
d3.csv('../data/ISV.csv', (data) => {
    const jsonData = data;
    const schema = [
        {
            name: 'Source',
            type: 'dimension'
        },
        {
            name: 'License Type',
            type: 'dimension'
        },
        {
            name: 'Region',
            type: 'dimension'
        }
    ];
console.log(jsonData);
    const env = muze();
    const DataModel = muze.DataModel;

    let rootData = new DataModel(jsonData, schema);
    rootData = rootData.calculateVariable(
        {
            name: '#records',
            type: 'measure',
            defAggFn: 'count',
            numberFormat: val => parseInt(val, 10)
        },
        ['Region', () => 1]
    );
    env.data(rootData);

    // line chart
    window.canvas = env.canvas()
    .rows(['Region'])
    .columns(['Source'])
    .color({
      field: '#records',
      step: true,
            stops: 5
    })
    .layers([])
    .shape(undefined)
    .size({
      field: undefined,
      range: [1, 300],
      stops: 5,
    })
    .detail([])
    .data(rootData)
    .width(700)
    .height(500)
    .config({
      border: {
        showColBorders: {
          left: false,
          right: false,
        },
      },
      axes: {
        x: {
          // name: aliasMap[columns[0]] || columns[0],
          tickFormat: (value, rawValue) => {
            const rawValueStr = rawValue.toString();
            if (typeof rawValue === 'number' && rawValueStr.length !== 13) {
              const formattedRawValue = new Intl.NumberFormat().format(rawValue);
              if (value.length > rawValueStr.length) {
                // check if prefix or suffix exists
                const valueIdx = value.indexOf(rawValueStr);
                if (valueIdx === 0) {
                  return `${formattedRawValue}${value[value.length - 1]}`;
                }
                return `${value[0]}${formattedRawValue}`;
              }
              return formattedRawValue;
            }
            return value;
          },
        },
        y: {
          // name: aliasMap[rows[0]] || rows[0],
             // name: aliasMap[columns[0]] || columns[0],
          tickFormat: (value, rawValue) => {
            const rawValueStr = rawValue.toString();
            if (typeof rawValue === 'number' && rawValueStr.length !== 13) {
              const formattedRawValue = new Intl.NumberFormat().format(rawValue);
              if (value.length > rawValueStr.length) {
                // check if prefix or suffix exists
                const valueIdx = value.indexOf(rawValueStr);
                if (valueIdx === 0) {
                  return `${formattedRawValue}${value[value.length - 1]}`;
                }
                return `${value[0]}${formattedRawValue}`;
              }
              return formattedRawValue;
            }
            return value;
          },
        },
      },
    })
    .subtitle('Region, Source, License Type, colored by #records')
    .title('Source by Region colored by #records')
    .mount('#chart')
});
