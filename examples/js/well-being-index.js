/* eslint-disable */
const style = `body,
html {
    font-family: 'Source Sans Pro', "Helvetica Neue", Helvetica, Arial, sans-serif;
    width: 100%;
    height: 100%;
}

.muze-layer-text text {
    alignment-baseline: central;
}

.muze-layer-point {
    fill-opacity: 1 !important;
}

.smiley circle,
ellipse {
    stroke: #937702 !important;
    stroke-width: .5;
    stroke-opacity: .4;
}

.smiley-expression line,
.smiley-expression path {
    fill: none;
    stroke: #000 !important;
    stroke-width: .5;
}

#chart-container {
    overflow-y: auto !important;
    text-align: center;
    padding: 0px 10px 10px 10px;
    height: auto;
    min-height: 350px;
}

ellipse.st1 {
    fill: #000 !important;
    fill-opacity: 1 !important;
}`;

const node = document.createElement('style');
node.innerHTML = style;
document.body.appendChild(node);

d3.csv('/data/well-being-index.csv', (data) => { // load data and schema from url
    const schema = [
        {
            name: 'State',
            type: 'dimension'
        },
        {
            name: 'State Codes',
            type: 'dimension'
        },
        {
            name: 'Well-being Index',
            type: 'measure',
            defAggFn: 'max'
        },
        {
            name: 'Latitude',
            type: 'measure',
            defAggFn: 'avg'
        },
        {
            name: 'Longitude',
            type: 'measure',
            defAggFn: 'avg'
        }
    ];
    const env = window.muze();
    const DataModel = window.muze.DataModel;
    const html = muze.Operators.html;
    const smileys = {
        smiley1: '<g class="smiley smiley-0" fill="#fffae6" transform="translate(-26,-26)"><circle r="22" cx="26" cy="26"></circle><g class="smiley-expression" transform="translate(4,4) scale(1.4666666666666666)"><ellipse transform="matrix(1 -5.128771e-03 5.128771e-03 1 -7.673427e-02 7.712884e-02)" class="st0" cx="15" cy="15" rx="15" ry="15"></ellipse><ellipse transform="matrix(1 -5.128771e-03 5.128771e-03 1 -5.115256e-02 0.1111)" class="st1" cx="21.6" cy="10" rx="1.1" ry="1.1"></ellipse><ellipse transform="matrix(1 -5.128771e-03 5.128771e-03 1 -5.167323e-02 4.345998e-02)" class="st1" cx="8.4" cy="10.1" rx="1.1" ry="1.1"></ellipse><line class="st2" x1="20" y1="22.2" x2="11.5" y2="22.2"></line></g></g>',
        smiley2: '<g class="smiley smiley-1" fill="#ffefab" transform="translate(-26,-26)"><circle r="22" cx="26" cy="26"></circle><g class="smiley-expression" transform="translate(4,4) scale(1.4666666666666666)"><ellipse transform="matrix(1 -5.128771e-03 5.128771e-03 1 -7.673427e-02 7.712884e-02)" class="st5" cx="15" cy="15" rx="15" ry="15"></ellipse><path class="st2" d="M6.8,17c2.5,4.5,8.3,6.1,12.8,3.6c1.3-0.7,2.4-1.7,3.2-3"></path><ellipse transform="matrix(1 -5.128771e-03 5.128771e-03 1 -5.115328e-02 0.1109)" class="st1" cx="21.6" cy="10" rx="1.1" ry="1.1"></ellipse><ellipse transform="matrix(1 -5.128771e-03 5.128771e-03 1 -5.167395e-02 4.317867e-02)" class="st1" cx="8.4" cy="10.1" rx="1.1" ry="1.1"></ellipse></g></g>',
        smiley3: '<g class="smiley smiley-2" fill="#ffe473" transform="translate(-26,-26)"><circle r="22" cx="26" cy="26"></circle><g class="smiley-expression" transform="translate(4,4) scale(1.4666666666666666)"><ellipse transform="matrix(1 -5.128771e-03 5.128771e-03 1 -7.673427e-02 7.712884e-02)" class="st5" cx="15" cy="15" rx="15" ry="15"></ellipse><path class="st2" d="M6.8,17c2.5,4.5,8.3,6.1,12.8,3.6c1.3-0.7,2.4-1.7,3.2-3"></path><ellipse transform="matrix(1 -5.128771e-03 5.128771e-03 1 -5.115328e-02 0.1109)" class="st1" cx="21.6" cy="10" rx="1.1" ry="1.1"></ellipse><ellipse transform="matrix(1 -5.128771e-03 5.128771e-03 1 -5.167395e-02 4.317867e-02)" class="st1" cx="8.4" cy="10.1" rx="1.1" ry="1.1"></ellipse></g></g>',
        smiley4: '<g class="smiley smiley-3" fill="#ffcc00" transform="translate(-26,-26)"><circle r="22" cx="26" cy="26"></circle><g class="smiley-expression" transform="translate(4,4) scale(1.4666666666666666)"><ellipse transform="matrix(1 -5.128771e-03 5.128771e-03 1 -7.673643e-02 7.684924e-02)" class="st6" cx="14.9" cy="15" rx="15" ry="15"></ellipse><path class="st7" d="M5.6,15.1c0,5.2,4.2,9.4,9.4,9.3c5.2,0,9.4-4.2,9.3-9.4"></path><ellipse transform="matrix(1 -5.128771e-03 5.128771e-03 1 -5.115504e-02 0.1109)" class="st1" cx="21.6" cy="10" rx="1.1" ry="1.1"></ellipse><ellipse transform="matrix(1 -5.128771e-03 5.128771e-03 1 -5.167570e-02 4.318081e-02)" class="st1" cx="8.4" cy="10.1" rx="1.1" ry="1.1"></ellipse></g></g>',
        smiley5: '<g class="smiley smiley-4" fill="#eabe03" transform="translate(-26,-26)"><circle r="22" cx="26" cy="26"></circle><g class="smiley-expression" transform="translate(4,4) scale(1.4666666666666666)"><ellipse transform="matrix(1 -5.128771e-03 5.128771e-03 1 -7.673427e-02 7.712884e-02)" class="st6" cx="15" cy="15" rx="15" ry="15"></ellipse><path class="st2" d="M5.6,15.1c0,5.2,4.2,9.4,9.4,9.3c5.2,0,9.4-4.2,9.3-9.4L5.6,15.1z"></path><ellipse transform="matrix(1 -5.128771e-03 5.128771e-03 1 -5.115260e-02 0.1109)" class="st1" cx="21.6" cy="10" rx="1.1" ry="1.1"></ellipse><ellipse transform="matrix(1 -5.128771e-03 5.128771e-03 1 -5.167491e-02 4.317867e-02)" class="st1" cx="8.4" cy="10.1" rx="1.1" ry="1.1"></ellipse></g></g>'
    };

    let rootData = new DataModel(data, schema);

    const stateGrid = [
            [null, null, null, null, null, 'WI', null, null, null, 'VT', 'ME'],
            ['WA', 'ID', 'MT', 'ND', 'MN', 'IL', 'MI', null, 'NY', 'MA', 'NH'],
            ['OR', 'NV', 'WY', 'SD', 'IN', 'IA', 'OH', 'PA', 'NJ', 'CT', 'RI'],
            ['CA', 'UT', 'CO', 'NE', 'MO', 'KY', 'WV', 'VA', 'MD', 'DE', null],
            [null, 'AZ', 'NM', 'KS', 'AR', 'TN', 'NC', 'SC', null, null, null],
            [null, null, null, 'OK', 'LA', 'MS', 'AL', 'GA', null, null, null],
            ['HI', 'AK', null, 'TX', null, null, null, null, 'FL', null, null]
    ];
    const alphabets = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];
    rootData = rootData.calculateVariable(
        {
            name: 'Latiudinal-Dimension',
            type: 'dimension'
        },
        ['State Codes', (state) => {
            let x = -1;
            stateGrid.forEach((e, i) => {
                if (e.indexOf(state) > -1) {
                    x = `${i}`;
                }
            });
            return alphabets[x];
        }]
        );
    rootData = rootData.calculateVariable(
        {
            name: 'Longitudinal-Dimension',
            type: 'dimension'
        },
        ['State Codes', (state) => {
            let x = -1;
            stateGrid.forEach((e) => {
                if (e.indexOf(state) > -1) {
                    x = `${e.indexOf(state)}`;
                }
            });
            return alphabets[x];
        }]
        );

    rootData = rootData.sort([['Well-being Index']]);
    let wellBeingArray = [];

    DataModel.Reducers.register('aggFn', (arr) => {
        wellBeingArray = arr;
        return 1;
    });
    const max = rootData.groupBy([''], {
        'Well-being Index': 'aggFn'
    });
    const quantiles = Math.round(wellBeingArray.length / 5);
    rootData = rootData.calculateVariable(
        {
            name: 'Well-being-quantile',
            type: 'dimension'
        },
        ['Well-being Index', (wbIndex) => {
            const index = wellBeingArray.indexOf(wbIndex);
            return Math.floor(index / quantiles);
        }]
        );
    rootData = rootData.sort([
            ['Longitudinal-Dimension', 'asc'],
            ['Latiudinal-Dimension', 'asc']

    ]);

    window.canvas = env.canvas()
            .rows(['Latiudinal-Dimension'])
            .columns(['Longitudinal-Dimension'])
            .shape({
                field: 'Well-being-quantile',
                domain: ['0', '1', '2', '3', '4'],
                generator: (val, i) => {
                    const pathVar = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    pathVar.innerHTML = smileys[`smiley${+val + 1}`];
                    pathVar.setAttribute('class', 'smiley-icon');
                    return pathVar;
                }
            })
            .detail(['State Codes', 'State', 'Well-being Index'])
            .data(rootData)
            .width(830)
            .height(650)
            .layers([{
                mark: 'point'
            }, {
                mark: 'text',
                encoding: {
                    text: 'State Codes',
                    color: {
                        value: () => 'rgba(0,0,0,.4)'
                    }
                },
                encodingTransform: (points) => {
                    points.forEach((e) => {
                        e.update.y += 30;
                    });
                    return points;
                }
            }])
            .config({
                gridLines: {
                    y: {
                        show: true
                    }
                },
                border: {
                    showValueBorders: {
                        left: false,
                        bottom: false
                    }
                },
                axes: {
                    y: {
                        domain: ['a', 'b', 'c', 'd', 'e', 'f', 'g'].reverse(),
                        show: false
                    },
                    x: {
                        show: false
                    }
                }
            })
            .config({
                gridLines: {
                    y: {
                        show: false
                    }
                },
                interaction: {
                    tooltip: {
                        formatter: (dataModel, context) => {
                            const tooltipData = dataModel.getData().data;
                            const fieldConfig = dataModel.getFieldsConfig();

                            let tooltipContent = '';
                            tooltipData.forEach((dataArray, i) => {
                                const state = dataArray[fieldConfig.State.index];
                                const wellBeing = dataArray[fieldConfig['Well-being Index'].index];
                                const quant = dataArray[fieldConfig['Well-being-quantile'].index];
                                const wellBeingTypes = ['Poor', 'Less Than Average', 'Average', 'Above Average', 'Excellent'];

                                tooltipContent += `<p>The state of <b>${state}</b> has a well being score of <b>${wellBeing}</b> 
                                          providing a <b>${wellBeingTypes[quant]}</b> quality of life</p>`;
                            });
                            return html`${tooltipContent}`;
                        }
                    }
                },
                legend: {
                    position: 'bottom',
                    shape: {
                        title: { text: 'Well Being Score' },
                        item: {
                            icon: {
                                height: 50,
                                width: 50
                            },
                            text: {
                                formatter: () => '',
                                orientation: 'bottom'
                            }
                        }
                    }
                }
            })
            // .title('Where to find the good life in USA?', {align: 'center'})
            // {title}
            .subtitle('An example of Custom Shapes provided in Shape Encoding', { align: 'center' })
            .mount('#chart');
    canvas.once('canvas.animationend').then((client) => {
        const element = document.getElementById('chart');
        element.classList.add('animateon');
    });
});
