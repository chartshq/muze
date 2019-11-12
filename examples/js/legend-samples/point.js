var style = 'body,\nhtml {\n    font-family: \'Source Sans Pro\', "Helvetica Neue", Helvetica, Arial, sans-serif;\n    width: 100%;\n    height: 100%;\n}\n\n.muze-layer-text text {\n    alignment-baseline: central;\n}\n\n.chart {\n    margin-left: 20px;\n}\n\n.muze-grid-lines path {\n    opacity: 0.1;\n}\n\n.muze-layer-point {\n    fill-opacity: 0.6 !important;\n    stroke-opacity: 0.6 !important;\n}';
var node = document.createElement('style');
node.innerHTML = style;
document.body.appendChild(node);
var _templateObject = _taggedTemplateLiteral(['', ''], ['', '']);
function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

d3.json('/data/word-freq-bubble.json', function (data) {
    var schema = [{
        "name": "f",
        "type": "measure"
    }, {
        "name": "index",
        "type": "dimension"
    }, {
        "name": "word",
        "type": "dimension"
    }, {
        "name": "x",
        "type": "measure"
    }, {
        "name": "y",
        "type": "measure"
    }];
    var env = window.muze();
    var DataModel = window.muze.DataModel;
    var html = muze.Operators.html;

    var rootData = new DataModel(data, schema);

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

    var canvas = env.canvas().rows(['y']).columns(['x']).data(rootData).detail(['word']).width(900).height(600).color({
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
            color: { value: function value() {
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
                formatter: function formatter(dataModel, context) {
                    var tooltipData = dataModel.getData().data;
                    var fieldConfig = dataModel.getFieldsConfig();

                    var tooltipContent = '';
                    tooltipData.forEach(function (dataArray, i) {
                        var usedMore = dataArray[fieldConfig['Used More'].index];
                        var word = dataArray[fieldConfig['word'].index];
                        var freq = dataArray[fieldConfig.f.index];

                        tooltipContent += '<p>The word <b>' + word + '</b> has been used more by <b>' + usedMore + 's</b> \n                                                         and its frequency of usage is <b>' + freq + '</b> </p>';
                    });
                    return html(_templateObject, tooltipContent);
                }
            }
        }
    })
    .title('Frequency of usage of words by males and females', {align: 'center'})
    .mount('#chart')
})