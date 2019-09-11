/* eslint-disable */
const env6 = muze();
const DataModel6 = muze.DataModel;
const html6 = muze.Operators.html;

d3.json('../../data/word-freq-bubble.json', (data) => {
    let jsonData6 = data;
    const schema6 = [
      {
        "name": "f",
        "type": "measure"
      },
      {
        "name": "index",
        "type": "dimension"
      },
      {
        "name": "word",
        "type": "dimension"
      },
      {
        "name": "x",
        "type": "measure"
      },
      {
        "name": "y",
        "type": "measure"
      }
    ]
    let rootData6 = new DataModel6(jsonData6, schema6);
    let canvas6 = env6.canvas();
    rootData6 = rootData6.calculateVariable(
      {
          name: 'Used More',
          type: 'dimension'
      },
      ['x', x => x > 0 ? 'Female' : 'Male']
    );
    rootData6 = rootData6.calculateVariable(
        {
            name: 'displayWord',
            type: 'dimension'
        },
        ['f', 'word', (f, word) => f > 15000 ? word : '']
    );
    canvas6 = canvas6
    .rows(['y'])
    .columns(['x'])
    .data(rootData6)
    .detail(['word'])
    .width(900)
    .height(600)
    .color({
        field: 'Used More',
        range: ['#a9d3f2', '#f4a4c6']
    })
    .size({
        field: 'f',
        range: [1, 2450]

    })
    .layers([{
        mark: 'point'
    }, {
        mark: 'text',
        encoding: {
            text: 'displayWord',
            color: { value: () => 'black' }
        }
    }])
    .config({
        border: {
            showValueBorders: {
                left: false,
                bottom: false
            }
        },
        axes: {
            y: {
                show: false
            },
            x: {
                show: false
            }
        }
    })
    .config({
        legend: {
            position: 'bottom',
            size: {
                show: false
            },
        },
        interaction: {
            tooltip: {
                formatter: (dataModel, context) => {
                    const tooltipData = dataModel.getData().data;
                    const fieldConfig = dataModel.getFieldsConfig();

                    let tooltipContent = '';
                    tooltipData.forEach((dataArray, i) => {
                        const usedMore = dataArray[fieldConfig['Used More'].index];
                        const word = dataArray[fieldConfig['word'].index];
                        const freq = dataArray[fieldConfig.f.index];

                        tooltipContent += `<p>The word <b>${word}</b> has been used more by <b>${usedMore}s</b> 
                                     and its frequency of usage is <b>${freq}</b> </p>`
                    });
                    return html6`${tooltipContent}`;
                }
            }
        }
    })
    .title('Frequency of usage of words by males and females', {align: 'center'})
    .subtitle('An example of a Bubble Plot', {align: 'center'})
    .mount('#chart6');
});