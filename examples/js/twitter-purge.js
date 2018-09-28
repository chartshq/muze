/* global muze, d3 */

const env = muze();
const DataModel = muze.DataModel;
d3.json('../data/twitter-purge.json', (data) => {
    const jsonData = data;

    const schema = [
        {
            name: 'user',
            type: 'dimension'
        },
        {
            name: 'followers',
            type: 'measure',
            defAggFn: 'avg'
        },
        {
            name: 'time',
            type: 'dimension',
            subtype: 'temporal'
        }
    ];
    // const newData = [];
    // Object.entries(data).forEach((element, i) => {
    //     element[1].forEach((e, j) => {
    //         newData[newData.length] = {
    //             user: element[0],
    //             followers: e[1],
    //             time: e[0]
    //         };
    //     });
    // });
    // console.log(JSON.stringify(newData));
    const rootData = new DataModel(jsonData, schema);

    // rootData = rootData.calculateVariable(
    //     {
    //         name: 'Months Of Fire',
    //         type: 'dimension',
    //         subtype: 'temporal',
    //         format: '%Y-%m-%d'
    //     },
    //     ['alarm_date', (date) => {
    //         const monthData = date.substring(5, date.length);
    //         return `1970-${monthData}`;
    //     }]
    // );
    // const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug',
    //     'Sep', 'Oct', 'Nov', 'Dec'];
    const userNames = [];
    d3.json('../data/twitter-purge-original.json', (data) => {
        Object.keys(data).forEach((user, i) => {
            const domNode = d3.select('#parentdiv')
            .append('div')
            .classed('chart-div', true);
            const chartNode = domNode.append('div')
            .attr('id', `chart${i}`);
            const userNode = domNode.append('div')
            .attr('id', `user${i}`).text(user);

            const canvas = env.canvas()
                    .rows([[], ['followers']])
                    .columns(['time'])
                    .data(rootData.select(f => f.user.value === user))
                    .width(180)
                    .height(120)
                    .config({
                        border: {
                            showValueBorders: {
                                left: false,
                                right: false,
                                bottom: false
                            }
                        },
                        axes: {
                            y: {
                                tickFormat: (val, j, labels) => {
                                    if (j === 0 || j === labels.length - 1) {
                                        return val;
                                    } return '';
                                },
                                showAxisName: false
                            },
                            x: {
                                show: false
                            }
                        }
                    })
                    .mount(chartNode.node());
        });
    });
});
