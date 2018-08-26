/* eslint-disable */

let env = muze();
let DataModel = muze.DataModel,
    share = muze.operators.share,
    html = muze.operators.html,
    actionModel = muze.ActionModel;
const require = muze.utils.require;
const selectElement = muze.utils.selectElement;
const SpawnableSideEffect = muze.SideEffects.standards.SpawnableSideEffect;
const GenericBehaviour = muze.Behaviours.standards.GenericBehaviour;

d3.tsv('../../data/death-prop.tsv', (data) => {
    const jsonData = data,
        schema = [{

                name: 'age',
                type: 'dimension'
            },
            {
                name: 'group',
                type: 'dimension'
            },
            {
                name: 'prop',
                type: 'measure'
            },

            {
                name: 'cause',
                type: 'dimension'
            }
        ];

    let rootData = new DataModel(jsonData, schema);

    env = env.data(rootData);

    let canvas = env.canvas();
    const getMaxPoint = (points) => {
        let maxPoint = 0;
        let pointArr = [];
        for (let i = 1; i < points.length; i++) {
            let y = points[i].y;
            let y0 = points[i].y0;
            let val = Math.abs(y - y0);
            let y1 = points[maxPoint].y;
            let y2 = points[maxPoint].y0;
            let val2 = Math.abs(y1 - y2);
            if (val > val2) {
                maxPoint = i;
            }
        }
        return [points[maxPoint].y, points[maxPoint].y0, points[maxPoint].x];

    };

    let rows = ['prop'],
        columns = ['age'];
    canvas = canvas
        .rows(rows)
        .columns(columns)
        .detail(['group'])
        .data(rootData.select((fields) => fields.group.value === 'Female'))
        .color({
            field: 'cause',
            range: ['red', 'green', 'blue', 'maroon', 'black', 'brown', 'teal', 'navy', 'magenta', 'coral', 'orange', 'pink', 'purple']
        })
        .config({
            groupBy: {
                disabled: true
            },
            axes:{
                x:{
                    tickValues: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
                    sortDomain: (domain) => domain.map(Number).sort((a, b) => a - b)
                },
                y: {
                    domain: [0, 1],
                    nice: false,
                    tickFormat: (value) => `${value * 100}%`
                }
            },
            legend:{
                color: {
                    show: false
                }
            }
        })
        .width(1200)
        .height(700)
        .layers([{
            mark: 'area',
            name: 'interactive-area',
            className: 'interactive-area-plot',
            transform: {
                type: 'stack'
            },
            interpolate: 'catmullRom'
        }, {
            mark: 'text',
            source: (dt) => dt.groupBy(['cause']),
            encoding: {
                text: 'cause'
            },
            interactive: false,
            calculateDomain: false,
            encodingTransform: require('layers', ['interactive-area', (myarea) => {
                return (points, layer, dependencies) => {
                    const causeIndex = layer.data().getFieldsConfig().cause.index;
                    const unitWidth = layer.measurement().width;
                    const smartLabel = dependencies.smartLabel;

                    for (let i = 0; i < points.length; i++) {
                        let d = points[i];
                        const areaPoints = myarea.getPointsFromIdentifiers([['cause'], [d.source[causeIndex]]]);
                        const point = getMaxPoint(areaPoints);
                        points[i].update.x = point[2];
                        const width = smartLabel.getOriSize(points[i].text).width;
                        if (points[i].update.x <= 10) {
                            points[i].update.x += (width * 2);
                        }

                        if ((points[i].update.x + width) >= unitWidth) {
                            points[i].update.x -= ((points[i].update.x + width) - unitWidth);
                        }
                        points[i].update.y = point[0] + Math.abs(point[0] - point[1]) / 2;
                        points[i].color = '#fff';

                    }
                    return points;
                };
            }])
        }])


    .title('Causes of Death', { position: "top", align: "center",  })
    .mount('#chart');

    muze.ActionModel.for(canvas)
    .registerPhysicalActions({
        areaclick: (firebolt) => (targetEl, behaviours) => {
            targetEl.on('click', (data) => {
                const fieldsConfig = firebolt.context.data().getFieldsConfig();
                const criteria = {
                    cause: [data[0]._data[fieldsConfig.cause.index]]
                };
                behaviours.forEach((behaviour) => firebolt.dispatchBehaviour(behaviour, {
                    criteria
                }));
                event.stopPropagation();
            })
        },
        containerclick: (firebolt) => (targetEl, behaviours) => {
            targetEl.on('click', function (data) {
                if (event.srcElement === this) {
                    behaviours.forEach((behaviour) => firebolt.dispatchBehaviour(behaviour, {
                        criteria: null
                    }));
                }
            });
        }
    })
    .registerBehaviouralActions([class SingleSelectBehaviour extends GenericBehaviour {
        static formalName () {
            return 'singleSelect';
        }

        setSelectionSet (addSet, selectionSet) {
            if (addSet === null) {
                selectionSet.reset();
            } else if (addSet.length) {
                const existingAddSet = selectionSet.getExistingEntrySet(addSet);
                if(existingAddSet.length){
                    selectionSet.reset();
                } else {
                    selectionSet.add(addSet);
                }
            } else {
                selectionSet.reset();
            }

        }
    }])
    .mapSideEffects({
        singleSelect: ['filter', 'menu'],
    })
    .dissociateBehaviour(['select', 'click'], ['highlight', 'hover'], ['brush', 'drag'])
    .registerPhysicalBehaviouralMap({
        'areaclick': {    /* Mapping multiple behaviours to ctrlClick */
            target: '.interactive-area-plot path',
            behaviours: ['singleSelect']
        },
        'containerclick': {
            behaviours: ['singleSelect']
        }
    })
    .registerSideEffects(
        class Menu extends SpawnableSideEffect {
            static formalName () {
                return 'menu';
            }

            apply (selectionSet) {
                const drawingInf = this.drawingContext();
                const entryModel = selectionSet.mergedEnter.model;
                const fieldsConfig = entryModel.getFieldsConfig();
                const htmlContainer = drawingInf.htmlContainer;
                const infoBox =  this.createElement(htmlContainer, 'div', [1], '.info-box')
                .style('position', 'absolute')
                .style('top', `${drawingInf.height / 4}px`)
                .style('left', `${drawingInf.width / 2}px`);
                const infoSectionData = ['show', 'disease','value', 'gender', 'page'];
                const infoSections = this.createElement(infoBox, 'div', infoSectionData, 'info-section');
                infoSections.each(function(d) {
                    selectElement(this).classed(`info-section-${d}`, true);
                });

                if (!entryModel.isEmpty()) {
                    const groupByData = entryModel.groupBy([''], {
                        prop: 'avg'
                    });
                    const groupConfig = groupByData.getFieldsConfig();
                    const dataArr = entryModel.getData().data;
                    let value = dataArr[0][fieldsConfig.cause.index];
                    infoBox.select('.info-section-disease')
                        .text(value);
                    const avgVal = groupByData.getData().data[0][groupConfig.prop.index];
                    infoBox.select('.info-section-value').text(`${(avgVal * 100).toFixed(2)}%`);
                    infoBox.style('display', 'flex');
                    const genderVal = dataArr[0][fieldsConfig.group.index];
                    infoBox.select('.info-section-gender').html(`${genderVal} Deaths`);
                }
                else {
                    infoBox.style('display', 'none');
                }
            }
        }
    );

    const male = document.getElementById('male');
    const female = document.getElementById('female');
    male.addEventListener('click', () => {
        const maleData = rootData.select((fields) => fields.group.value === 'Male');
        canvas.data(maleData);
    });

    female.addEventListener('click', () => {
        const femaleData = rootData.select((fields) => fields.group.value === 'Female');
        canvas.data(femaleData);
    });
});

