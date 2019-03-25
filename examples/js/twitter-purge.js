function _taggedTemplateLiteral (strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

const _templateObject = _taggedTemplateLiteral(['<a href = "https://www.twitter.com/@', '" class= "twitter-link">@', '</a>'], ['<a href = "https://www.twitter.com/@', '" class= "twitter-link">@', '</a>']);

const style = 'body,\nhtml {\n    font-family: \'Source Sans Pro\', "Helvetica Neue", Helvetica, Arial, sans-serif;\n    width: 100%;\n    height: 100%;\n}\n\n.chart {\n    margin-left: 20px;\n}\n\n.muze-grid-lines path {\n    opacity: 0.1;\n}\n\n.muze-grid .muze-text-cell {\n    font-size: 12px !important;\n}\n\n.muze-layer-text text {\n    alignment-baseline: central;\n}\n\n.chart-div {\n    float: left;\n    padding: 15px;\n}\n\n.muze-layer-point {\n    fill-opacity: 1 !important;\n}\n\n#chart-container {\n    overflow-y: auto !important;\n    text-align: center;\n    padding: 0px 10px 10px 10px;\n    height: auto;\n    min-height: 350px;\n}\n\n.twitter-link {\n    text-decoration: none;\n    color: #3182bd;\n    font-weight: 700;\n}\n\n.twitter-link:hover {\n    text-decoration: underline;\n}\n\n.chart-header {\n    font-size: 24px !important;\n    margin-bottom: 10px;\n    color: #5f5f5f !important;\n}';
const node = document.createElement('style');
node.innerHTML = style;
document.body.appendChild(node);

d3.json('../data/twitter-purge.json', (data) => {
    // load data and schema from url
    const schema = [{
        name: 'user',
        type: 'dimension'
    }, {
        name: 'followers',
        type: 'measure',
        defAggFn: 'avg'
    }, {
        name: 'time',
        type: 'dimension',
        subtype: 'temporal'
    }];
    const users = ['aplusk', 'barackobama', 'c_nyakundih', 'd_copperfield', 'elonmusk', 'hilaryr', 'hillaryclinton', 'iamcardib', 'jack', 'jashkenas', 'johnleguizamo', 'kathyireland', 'katyperry', 'kyliejenner', 'lucaspeterson', 'marthalanefox', 'michaeldell', 'nickconfessore', 'nickywhelan', 'nytimes', 'paulhollywood', 'paulkagame', 'poppy', 'porszag', 'rambodonkeykong', 'realalexjones', 'realdonaldtrump', 'samiralrifai', 'seanhannity', 'senjohnmccain', 'taylorswift13', 'twitter'];
    const env = window.muze();
    const DataModel = window.muze.DataModel;
    const html = muze.Operators.html;
    const require = muze.utils.require;

    const _formatter = function _formatter (val) {
        if (val > 1000000) {
            return `${(val / 1000000).toFixed(2)} M`;
        } else if (val > 1000) {
            return `${(val / 1000).toFixed(2)} K`;
        } return val.toFixed(2);
    };

    const rootData = new DataModel(data, schema);
    const canvases = [];

    const div = document.createElement('div');
    div.className = 'chart-header muze-header-cell';
    div.innerHTML = 'Charting the Great Twitter Bot Purge of 2018 (A Trellis Example)';
    document.getElementById('chart').appendChild(div);

    users.forEach((user, i) => {
        const newDomNode = document.createElement('div');
        newDomNode.className = 'chart-div';
        newDomNode.id = `chart${i + 1}`;
        newDomNode.style.overflow = 'auto';
        document.getElementById('chart').appendChild(newDomNode);

        const canvas = env.canvas().rows([[], ['followers']]).columns(['time']).data(rootData.select(f => f.user.value === user)).width(250).height(200).transform({
            lastPoint: function lastPoint (dt) {
                const dataLength = dt.getData().data.length;
                return dt.select((fields, i) => {
                    if (i === dataLength - 1) {
                        return true;
                    } return false;
                });
            }
        }).layers([{
            mark: 'line',
            name: 'lineLayer'
        }, {
            mark: 'point',
            source: 'lastPoint'
        }, {
            mark: 'text',
            encoding: {
                text: {
                    field: 'followers',
                    formatter: function formatter (val) {
                        return _formatter(val);
                    }
                },
                color: {
                    value: function value () {
                        return '#858585';
                    }
                }
            },
            encodingTransform: require('layers', ['lineLayer', function () {
                return function (points, layer, dep) {
                    const width = layer.measurement().width;
                    const height = layer.measurement().height;
                    const smartlabel = dep.smartLabel;

                    return points.map((point) => {
                        const size = smartlabel.getOriSize(point.text);
                        if (point.update.y + size.height > height) {
                            point.update.y -= size.height / 2;
                        } else {
                            point.update.y += size.height / 2;
                        }
                        if (point.update.x + size.width / 2 > width) {
                            point.update.x -= size.width / 2 + 1;
                        }
                        return point;
                    });
                };
            }]),
            source: 'lastPoint'
        }]).config({
            border: {
                showValueBorders: {
                    right: false,
                    bottom: false
                }
            },
            gridLines: {
                y: {
                    show: false
                }
            },
            axes: {
                y: {
                    tickFormat: function tickFormat (val, parsedVal, j, labels) {
                        if (j === 0 || j === labels.length - 1) {
                            return _formatter(val);
                        } return '';
                    },
                    showAxisName: false
                },
                x: {
                    show: false
                }
            }
        })
        .title('The car acceleration respective to origin', { position: 'bottom', align: 'center' })
        .subtitle(html(_templateObject, user, user), { position: 'bottom', align: 'center' })
        .mount(`#chart${i + 1}`);
    });
});
