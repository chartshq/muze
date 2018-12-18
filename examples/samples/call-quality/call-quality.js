/* global muze, d3 */

let env = muze();
const DataModel = muze.DataModel;
const html = muze.Operators.html;
d3.csv('./call-quality.csv', (data1) => {
    const jsonData = data1;
    const schema = [
        {
            name: 'Operator',
            type: 'dimension'
        },
        {
            name: 'In Out Travelling',
            type: 'dimension'
        },
        {
            name: 'Network Type',
            type: 'dimension'
        },

        {
            name: 'Rating',
            type: 'dimension',
            defAggFn: 'avg'
        },
        {
            name: 'Call Drop Category',
            type: 'dimension'
        },
        {
            name: 'Latitude',
            type: 'measure',
            defAggFn: 'count'
        },
        {
            name: 'Longitude',
            type: 'dimension'
        },
        {
            name: 'State Name',
            type: 'dimension'
        }
    ];
    const rootData = new DataModel(jsonData, schema);

    const states = rootData.getFieldspace().fields[7].domain();

    env = env
    .data(rootData)
    .minUnitHeight(10)
    .minUnitWidth(10);

    const selection = document.createElement('div');

    selection.className = 'selectionContainer';
    document.getElementById('chart-container').appendChild(selection);

    states.sort().forEach((d) => {
        const state = document.createElement('div');

        state.className = 'selectors';
        state.innerHTML = d.length ? d : 'All States';
        state.setAttribute('value', d);
        selection.appendChild(state);
    });

    function getData (data, state) {
        if (state) {
            data = data.select(f => f['State Name'].value === state, {
                saveChild: false
            });
        }
        let nData = data.groupBy(['Operator', 'Call Drop Category']).sort([['Operator'], ['Call Drop Category']]);
        const oData = data.groupBy(['Operator']).sort([['Operator']]);
        nData = nData.calculateVariable({
            name: 'perc',
            type: 'measure'
        }, ['Latitude', 'Operator', (l, o) => {
            const dataset = oData.select(f => f.Operator.value === o);
            const val = dataset.getData().data[0][1];
            return l * 100 / val;
        }]);
        return nData.sort([['Call Drop Category', 'desc'], ['perc', 'desc']]);
    }

    const crosstab = env
    .canvas()
    .rows(['perc'])
    .columns(['Operator'])
    .data(getData(rootData))
    .color({
        field: 'Call Drop Category',
        domain: ['Satisfactory', 'Poor Voice Quality', 'Call Dropped'],
        range: ['black', 'grey', '#eaeaea']
    })
    .width(900)
    .height(600)
    .config({
        legend: {
            position: 'bottom'
        },
        border: {
            color: '#fff'
        },
        axes: {
            y: {
                show: false
            },
            x: {
                showAxisName: false
            }
        },
        interaction: {
            tooltip: {
                formatter: (dataModel) => {
                    let tooltipContent = '';
                    const tooltipData = dataModel.getData().data;
                    const fieldConfig = dataModel.getFieldsConfig();
                    const operatorVal = tooltipData[0][fieldConfig.Operator.index];
                    tooltipContent += `<p>Calls made by Operator <b>${operatorVal}</b>:  </p>`;
                    tooltipData.forEach((dataArray) => {
                        const perc = dataArray[fieldConfig.perc.index];
                        const dropCat = dataArray[fieldConfig['Call Drop Category'].index];
                        tooltipContent += `<p>${dropCat}: <b style='float: right'>${perc.toFixed(2)} % </b> </p>`;
                    });
                    return html`${tooltipContent}`;
                }
            }
        }
    })
    .size({
        value: 2
    })
    .layers([{
        mark: 'area',
        transition: {
            disabled: true,
            duration: 0
        },
        interpolate: 'catmullRom'
    }, {
        mark: 'point',
        transition: {
            disabled: true,
            duration: 0
        },
        transform: {
            type: 'stack'
        }
    }
    ])
    .mount('#chart-container');
    const selectors = document.getElementsByClassName('selectors');

    for (let i = 0; i < selectors.length; i++) {
        selectors[i].addEventListener('click', function () {
            for (let j = 0; j < selectors.length; j++) {
                selectors[j].classList.remove('selected');
            }
            this.classList.add('selected');
            const state = this.getAttribute('value');
            crosstab.data(getData(rootData, state));
        });
    }
});
