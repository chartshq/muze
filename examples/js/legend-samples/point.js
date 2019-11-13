d3.json('/data/word-freq-bubble.json', (data) => {
    const schema = [{
        name: 'f',
        type: 'measure'
    }, {
        name: 'index',
        type: 'dimension'
    }, {
        name: 'word',
        type: 'dimension'
    }, {
        name: 'x',
        type: 'measure'
    }, {
        name: 'y',
        type: 'measure'
    }];
    const env = window.muze();
    const DataModel = window.muze.DataModel;
    const html = muze.Operators.html;

    let rootData = new DataModel(data, schema);

    rootData = rootData.calculateVariable({
        name: 'Used More',
        type: 'dimension'
    }, ['x', function (x) {
        return x > 0 ? 'Female' : 'Male';
    }]);

    rootData = rootData.calculateVariable({
        name: 'displayWord',
        type: 'dimension'
    }, ['f', 'word', function (f, word) {
        return f > 15000 ? word : '';
    }]);

    const canvas = env.canvas().rows(['y']).columns(['x']).data(rootData).detail(['word']).width(900).height(600).color({
        field: 'Used More',
        range: ['#a9d3f2', '#f4a4c7']
    }).size({
        field: 'f',
        range: [1, 2450]

    }).layers([{
        mark: 'point'
    }, {
        mark: 'text',
        encoding: {
            text: 'displayWord',
            color: { value: function value () {
                return 'black';
            } }
        }
    }]).config({
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
    }).config({
        legend: {
            position: 'bottom',
            size: {
                show: false
            }
        },
        interaction: {
            tooltip: {
                formatter: function formatter (dataModel, context) {
                    const tooltipData = dataModel.getData().data;
                    const fieldConfig = dataModel.getFieldsConfig();

                    let tooltipContent = '';
                    tooltipData.forEach((dataArray, i) => {
                        const usedMore = dataArray[fieldConfig['Used More'].index];
                        const word = dataArray[fieldConfig.word.index];
                        const freq = dataArray[fieldConfig.f.index];

                        tooltipContent += `<p>The word <b>${word}</b> has been used more by <b>${usedMore}s</b> \n                                                         and its frequency of usage is <b>${freq}</b> </p>`;
                    });
                    return html`${tooltipContent}`;
                }
            }
        }
    })
    .title('Frequency of usage of words by males and females', { align: 'center' })
    .mount('#chart');
});
