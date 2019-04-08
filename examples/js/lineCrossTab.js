/* eslint-disable */
(function () {
  let env = muze();
  let dataModel = muze.DataModel,
    share = muze.Operators.share,
    html = muze.Operators.html;
  const require = muze.utils.require;
  function convertToDollar(data, decimalValue){
    if (data > 1000 && data < 1000000) return `$${(data / 1000).toFixed(decimalValue)}K`
    if (data >= 1000000) return `$${(data / 1000000).toFixed(decimalValue)}M`
    return `$${data.toFixed(decimalValue)}`
  }

  d3.json('../data/lineCrossTab.json', (data) => {
    const jsonData = data,
      schema = [{
        "name": "date",
        "type": "dimension",
        "subtype": "temporal"
      }, {
        "name": "value",
        "type": "measure",
        "defAggFn": "avg"

      }, {
        "name": "quarter",
        "type": "dimension"
      }, {
        "name": "quarterYear",
        "type": "dimension"
      }
      ]
      
    let rootData = new dataModel(data, schema);
    rootData = rootData.calculateVariable({
      name: 'estimatedParam',
      type: 'dimension'
    }, ['quarterYear', (quarterYear) => {
      if(quarterYear.indexOf('2019') !== -1){
        return 'ESTIMATED'
      }
      return;
    }]);
    const quartileReference = {
      q1:{
        min:0,
        max:0,
        minKey:0,
        maxKey:0
      },
      q2:{
        min:0,
        max:0,
        minKey:0,
        maxKey:0
      },
      q3:{
        min:0,
        max:0,
        minKey:0,
        maxKey:0
      },
      q4:{
        min:0,
        max:0,
        minKey:0,
        maxKey:0
      },
    };
    const quarterYearGrouped = rootData.groupBy(['quarterYear']);
    const dataChange = quarterYearGrouped.getData().data;
    for(let i in dataChange){
        let index = dataChange[i][1].indexOf(2019);
        let str = dataChange[i][1].substr(0,2).toLowerCase();
        if(quartileReference[str].max < Math.round(dataChange[i][0])){
          quartileReference[str].max = Math.round(dataChange[i][0])
          quartileReference[str].maxKey = dataChange[i][1];
        }
        if(quartileReference[str].min > Math.round(dataChange[i][0]) || quartileReference[str].min === 0){
          quartileReference[str].min = Math.round(dataChange[i][0])
          quartileReference[str].minKey = dataChange[i][1];
        }
    }
    rootData = rootData.calculateVariable({
      name: 'colorParam',
      type: 'dimension'
    }, ['quarterYear', (quarterYear) => {
      let index = quarterYear.indexOf(2019);
      if(index !== -1){
        return 'average';
      } else{
        // console.log(index, quarterYear.substr(0,2).toLowerCase(), quartileReference[str].min)
        let str = quarterYear.substr(0,2).toLowerCase();
        if(quartileReference[str].minKey === quarterYear)
          return 'bad';
        else if(quartileReference[str].maxKey === quarterYear)
          return 'great';
        return 'normal';
      }
    }]);
    env = env.data(rootData).minUnitWidth(40);
    let mountPoint = document.getElementById('chart');
    window.canvas = env.canvas();
    canvas
      .rows(['value'])
      .columns([[],[ 'date', 'quarterYear']])
      .data(rootData.select((fields) => fields.quarter.value === 'Q4'))
      .width(850)
      .height(600)
      .detail(['quarterYear'])
      .transform({ 
        avg: (dm) => dm.groupBy(['']),
        estd :(dt) => dt.select(fields => fields.estimatedParam.value === 'ESTIMATED').groupBy(['estimatedParam'])
      })
      .layers([{
          mark: 'line',
          className: 'line-plot-item',
          interpolate: 'catmullRom',
        }, {
          mark: 'text',
          className: 'text-layer',
          source: 'avg',
          encoding: {
            x: { field: null },
            text: {
              field: 'value',
              formatter: val => Math.round(val)
            },
            color: {
              value: () => '#fff'
            }
          },
          encodingTransform: require('layers', ['line-0', (lineLayer) => {
            return (points, layerInst, dependencies) => {
              const domain = lineLayer.data().getFieldspace().fieldsObj().value.domain();
              const maxVal = domain[1];
              const maxYPos = lineLayer.axes().y.getScaleValue(maxVal);
              const measurement = layerInst.measurement();
              points[0].update.x = measurement.width / 2;
              const smartLabel = dependencies.smartLabel;
              const textHeight = smartLabel.getOriSize(points[0].text).height;
              points[0].update.y = maxYPos - textHeight / 2;
              points[0].text = convertToDollar(points[0].text, 2);
              return points;
            }
          }])
        },{
          mark: 'text',
          className: 'estimatedText',
          encoding: {
            x: { field: null },
            text: {
              field: 'estimatedParam',
            },
            color: {
              value: () => '#fff'
            }
        },
        source: 'estd',
        encodingTransform: (points, layer, dependencies) => {
            let width = layer.measurement().width;
            let height = layer.measurement().height;
            let smartLabel = dependencies.smartLabel;
            for (let i = 0; i < points.length; i++) {
                points[i].update.x = width-40;
                points[i].update.y = height-5;
                points[i].color = '#fff';
                points[i].style['font-weight'] = 'bold';
            }
            return points;
        },
        calculateDomain: false
      }])
      .color({
        field: 'colorParam',
        domain: ['normal', 'average', 'great', 'bad'],
        range: ['#33adff', 'yellow', 'green', 'red']

      })
      .config({
        legend: {
          color: {
              show: false
          }
        },
        border:{
          color: 'rgb(239, 239, 239)',
          width: 1
        },
        axes: {
          x: { show: false },
          y: {
            tickFormat: (d) => {
              return convertToDollar(d, 1);
            },
            numberOfTicks:  5,
            showAxisName: false
          }
        },
        interaction: {
          tooltip: {
            arrow: {
              disabled: true
            },
            offset: {
              x: -85
            },
            mode: 'fragmented',
            formatter: (dataModel, context) => {
              const tooltipData = dataModel.getData().data;
              const fieldConfig = dataModel.getFieldsConfig();
              let tooltipContent = '';
              tooltipData.forEach((dataArray) => {
                const date = fieldConfig.date.index;
                const value = fieldConfig.value.index;
                const quarterYear = fieldConfig.quarterYear.index;
                tooltipContent += `<p style = "color:white; font-size: 14px; text-align: center;"><strong>${dataArray[quarterYear]}</strong></p>`;
                tooltipContent += `<p style = "color:white; font-size: 14px;">Average Value: ${dataArray[value]}</p>`;
              });
              return html`${tooltipContent}`;
            }
          }
        }
      })
      .title('Q4 comparison from 2010 until 2019', { position: "top", align: "center", color: 'white' })
      .mount(mountPoint);

      async function wait(ms) {
        return new Promise(resolve => {
          setTimeout(resolve, ms);
        });
      };
      function quartile1(){
        canvas.data(rootData.select((fields) => fields.quarter.value === 'Q1'))
        .title('Q1 comparison from 2010 until 2019', { position: "top", align: "center", color: 'white' });
      }
      function quartile2(){
        canvas.data(rootData.select((fields) => fields.quarter.value === 'Q2'))
        .title('Q2 comparison from 2010 until 2019', { position: "top", align: "center", color: 'white' });
      }
      function quartile3(){
        canvas.data(rootData.select((fields) => fields.quarter.value === 'Q3'))
        .title('Q3 comparison from 2010 until 2019', { position: "top", align: "center", color: 'white' });
      }
      function quartile4(){
        canvas.data(rootData.select((fields) => fields.quarter.value === 'Q4'))
        .title('Q4 comparison from 2010 until 2019', { position: "top", align: "center", color: 'white' });
      }
      async function renderChart() {
        while(1){
          quartile1();
          await wait(5000);
          quartile2();
          await wait(5000);
          quartile3();
          await wait(5000);
          quartile4();
          await wait(5000);
        }          
      }
      renderChart();


  })
})()