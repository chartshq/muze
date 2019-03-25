/* eslint-disable */
let i = 0;
for (i = 0; i < 2; i++) {
    const newDomNode = document.createElement('div');
    newDomNode.id = `chart${i + 1}`;
    document.getElementById('chart').appendChild(newDomNode);
}

const durationSecond = 1000;
const durationMinute = durationSecond * 60;
const durationHour = durationMinute * 60;
const durationDay = durationHour * 24;
const durationWeek = durationDay * 7;
const durationMonth = durationDay * 30;
const durationYear = durationDay * 365;
const timeDurations = {
    millisecond: 1,
    second: durationSecond,
    minute: durationMinute,
    hour: durationHour,
    week: durationWeek,
    day: durationDay,
    month: durationMonth,
    year: durationYear
};

function generateDate (interval, points) {
    const timeMillisecondsArr = [];
    let newTime = 0;
    for (let i = 0; i < points; i++) {
        newTime += timeDurations[interval];
        timeMillisecondsArr.push({
            dateTime: newTime,
            profit: Math.floor(Math.random() * 1000 + 1)
        });
    }
    return timeMillisecondsArr;
}

// d3.json('../data/test.json', (data) => {
    const schema = [
        {
            name: 'dateTime',
            type: 'dimension',
            subtype: 'temporal',
        },
        {
            name: 'profit',
            type: 'measure'
        }
    ];

    let env = window.muze();
    const DataModel = window.muze.DataModel;

  
    const chartConf = {
        axes: {
            x: {
                    nice: false,
                    name: 'dateTime'
            },
            y: {
                    name: 'profit'
            }
        }
    };
    // Object.keys(timeDurations).forEach(e=>{

    window.rootData = new DataModel(generateDate('year',Math.floor(Math.random() * 100)+1), schema)

   const canvas  = env.canvas().data(rootData)
            .rows(['profit'])
            .columns(['dateTime'])
            .width(4100)
            .height(400)
            .config(chartConf)
            .layers([{
                // mark: 'area',
                transition: {
                    duration: 0
                }
            }])
            .title('Select a range from the bottom chart to get a detailed view for that range')
            .mount(d3.select('#chart1').append('div').node());
        // })

    // const overview = env.canvas()
    //         .rows(['profit'])
    //         .columns(['dateTime'])
    //         .width(750)
    //         .height(160)
    //         .config(chartConf)
    //         .layers([{
    //             // mark: 'area',
    //             // interpolate: 'catmullRom'
    //         }])
    //         .mount('#chart2');

    // muze.ActionModel
    //     .for(detail, overview).enableCrossInteractivity()
    //     .for(overview).registerPropagationBehaviourMap({
    //         brush: 'filter'
    //     });
// });