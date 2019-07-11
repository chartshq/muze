/* eslint-disable */
let env8 = muze();
const DataModel8 = muze.DataModel8;
const share8 = muze.Operators.share;
const DateTimeFormatter8 = muze.utils.DateTimeFormatter;

d3.csv('../../data/weather.csv', (data8) => {
  const schema8 = [
    {
        'name': 'time',
        'type': 'dimension',
        'subtype': 'temporal',
        'format': '%Y'
    },
    {
        'name': 'minDays',
        'type': 'measure',
        'defAggFn': 'avg'
    },
    {
        'name': 'days at or above 32 deg',
        'type': 'measure',
        'defAggFn': 'avg'
    },
    {
        'name': 'maxDays',
        'type': 'measure',
        'defAggFn': 'avg'
    }
  ]

  
  const rootData8 = new DataModel(data8, schema8);
  
  env8 = env8.data(rootData8).minUnitHeight(40).minUnitWidth(40);
  const rows8 = [[], [share8('minDays', 'days at or above 32 deg', 'maxDays')]];
  let canvas8 = env8.canvas();
  
  canvas8 = canvas8
    .rows(rows8)
      .columns(['time'])
      .width(850)
      .height(500)
      .color({
          value: '#f07520'
      })
      .config({
          gridLines: {
              x: {
                  show: true
              }
          },
          axes: {
              y: {
                  domain: [180, 320],
                  name: 'Average number of days at or above 32˚C',
                  numberOfTicks: 8
              }
          },
          interaction: {
              tooltip: {
                  formatter: (dm) => {
                      const dataArr = dm.getData().data;
                      const fieldsConfig = dm.getFieldsConfig();
                      const maxDayIndex = fieldsConfig.maxDays.index;
                      const minDayIndex = fieldsConfig.minDays.index;
                      return [
                          {
                            className:'muze-tooltip-row',
                            data:[
                              {     
                                value: 'Year',
                                style : {
                                  'margin-left': '10px'
                                }
                              },
                              {
                                value: DateTimeFormatter8.formatAs(dataArr[0][fieldsConfig.time.index], '%Y'),
                                className: 'muze-tooltip-value'
                              }
                            ]
                          },{
                            className:'muze-tooltip-row',
                            data:[
                              { 
                                value: 'Days at or above 32 deg:',
                                style : {
                                  'margin-left': '10px'
                                }
                              },
                              {
                                value: Math.floor(dataArr[0][fieldsConfig['days at or above 32 deg'].index]),
                                className: 'muze-tooltip-value'
                              }
                            ]
                          },{
                            className:'muze-tooltip-row',
                            data:[
                              {     
                                value: 'Range',
                                style : {
                                  'margin-left': '10px'
                                }
                              },
                              {
                                value: `${Math.floor(dataArr[0][minDayIndex])} - ${Math.floor(dataArr[0][maxDayIndex])}`,
                                className: 'muze-tooltip-value'
                              }
                            ]
                          }
                      ];
                  }
              }
          }
      })
      .layers([{
          mark: 'line',
          className: 'line-plot-item',
          encoding: {
              y: 'days at or above 32 deg'
          },
          interpolate: 'catmullRom'
      }, {
          mark: 'area',
          className: 'area-layer',
          encoding: {
              y: 'minDays',
              y0: 'maxDays',
              color: {
                  value: () => '#fdb92b'
              }
          },
          transition: {
              duration: 0
          },
          interpolate: 'catmullRom'
      }, {
          mark: 'text',
          className: 'text-layer',
          encoding: {
              y: 'days at or above 32 deg',
              text: {
                  field: 'time',
                  formatter: val => DateTimeFormatter8.formatAs(val, '%Y')
              },
              color: {
                  value: () => '#000'
              }
          },
          source: dt => dt.select(fields =>
              [1992, 2018, 2072].indexOf(new Date(fields.time.value).getFullYear()) !== -1),
          encodingTransform: (points) => {
              for (let i = 0, len = points.length; i < len; i++) {
                  points[i].update.y -= 10;
                  if (i === 0) {
                      points[i].text += '  Born';
                      points[i].update.x -= 30;
                  }
                  if (i === len - 1) {
                      points[i].text += ' Age 80';
                      points[i].update.x -= 30;
                  }
              }
              return points;
          }
      }, {
          mark: 'point',
          className: 'anchor-indicator',
          encoding: {
              y: 'days at or above 32 deg',
              size: {
                  value: 100
              },
              color: {
                  value: () => '#ff0000'
              }
          },
          source: dt => dt.select(fields =>
              [1992, 2018, 2072].indexOf(new Date(fields.time.value).getFullYear()) !== -1)
      }, {
          mark: 'tick',
          className: 'tick-layer',
          encoding: {
              y: 'maxDays',
              y0: 'minDays'
          },
          source: dt => dt.select(fields =>
              [1992, 2018, 2072].indexOf(new Date(fields.time.value).getFullYear()) !== -1)
      }])
      .subtitle('Days at or above 32°C per year from the time you were born')
      .title('Composition of layers')
      .mount('#chart8');
});