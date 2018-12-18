/* global muze, d3 */

let env = muze();
const SurrogateSideEffect = muze.SideEffects.standards.SurrogateSideEffect;
const selectElement = muze.utils.selectElement;
const DataModel = muze.DataModel;
const html = muze.Operators.html;
const DateTimeFormatter = muze.utils.DateTimeFormatter;

const getMaxPoint = (arr) => {
    let maxVal = 0;
    let maxPoint;
    arr.forEach((d) => {
        maxVal = Math.max(maxVal, d.y - d.y0);
        const val = Math.abs(d.y - d.y0);
        if (val > maxVal) {
            maxVal = val;
            maxPoint = d;
        }
    });
    return maxPoint;
};
d3.tsv('../data/data.tsv', (data) => {
    const jsonData = data;
    const schema = [
        {
            name: 'year',
            type: 'dimension',
            subtype: 'temporal',
            format: '%Y'
        },
        {
            name: 'Freq',
            type: 'measure'
        },
        {
            name: 'Country',
            type: 'dimension'
        },

        {
            name: 'continent',
            type: 'dimension'
        },
        {
            name: 'league_id',
            type: 'dimension'
        }
    ];

    let rootData = new DataModel(jsonData, schema);
    rootData = rootData.select(fields => fields.league_id.value === 'wfn-germany-bundesliga');
    rootData = rootData.sort([['year']]);
    env = env.data(rootData).minUnitHeight(40).minUnitWidth(40);

    const canvas = env.canvas()
        .rows(['Freq'])
        .columns(['year'])
        .detail(['Country'])
        .color('continent')
        .data(rootData)
        .width(1000)
        .height(600)
        .config({
            axes: {
                y: {
                    nice: false,
                    tickFormat: val => `${val * 100}%`
                },
                x: {
                    nice: false
                }
            },
            legend: {
                color: {
                    show: false
                }
            },
            interaction: {
                tooltip: {
                    formatter: (dm, context) => {
                        const hoveredItem = context.payload.hoveredItem;
                        const groupedCountryModel = dm.groupBy(['continent']).sort([['Freq', 'desc']]);
                        const dataArr = groupedCountryModel.getData().data;
                        let content = '';
                        const seasonIdVal = dm.getData().data[0][dm.getFieldsConfig().year.index];
                        content += `<h3>Where players in Bundesliga came from in
                            ${DateTimeFormatter.formatAs(seasonIdVal, '%Y')}</h3>`;
                        const fieldsConfig = groupedCountryModel.getFieldsConfig();
                        const totalVal = groupedCountryModel.groupBy(['']).getData().data[0][0];
                        content += '<table class=tooltip-content-table ><tbody>';
                        const arr = [];
                        let anyCountrySelected = false;
                        let hoveredContinent;
                        dataArr.forEach((tuple) => {
                            let percVal = Math.round((tuple[fieldsConfig.Freq.index] / totalVal) * 100);
                            if (percVal > 0) {
                                const continentVal = tuple[fieldsConfig.continent.index];
                                arr.push(`<tr id=muze-${continentVal} class=tooltip-continent-group>`, `<th><div>${continentVal}<div></th>`,
                                    `<td><div>${percVal}%<div></td>`,
                                '</tr>');
                                const countries = dm.select(fields => fields.continent.value === continentVal, {
                                    saveChild: false
                                }).sort([['Freq', 'desc']]);
                                countries.getData().data.forEach((countryTuple) => {
                                    const fieldConfig = countries.getFieldsConfig();
                                    const countryVal = countryTuple[fieldConfig.Country.index];
                                    percVal = Math.round((countryTuple[fieldConfig.Freq.index] / totalVal) * 100);
                                    const hoveredCountry = countryVal === hoveredItem;
                                    if (percVal >= 2) {
                                        const className = hoveredCountry ? 'tooltip-highlight' : '';
                                        if (!anyCountrySelected) {
                                            anyCountrySelected = hoveredCountry || anyCountrySelected;
                                        }
                                        arr.push(`<tr class=${className}>`, `<td>${countryVal}</td>`, `<td> ${percVal}%</td>`, '</tr>');
                                    }
                                    if (!hoveredContinent && hoveredCountry) {
                                        hoveredContinent = continentVal;
                                    }
                                });
                            }
                        });

                        if (!anyCountrySelected && hoveredContinent) {
                            const index = arr.findIndex(d => new RegExp(`id=muze-${hoveredContinent}`, 'g').test(d));
                            if (index !== -1) {
                                arr[index] = arr[index].replace(`id=muze-${hoveredContinent}`,
                                    'id=tooltip-highlight');
                            }
                        }
                        content += arr.join('');
                        content += '</tbody></table>';
                        return html`${content}`;
                    }
                }
            }
        })
        .layers([{
            mark: 'area',
            name: 'areaLayer',
            interpolate: 'catmullRom',
            className: 'arealayer',
            individualClassName: (d, i, dataArr) => {
                let maxVal = 0;
                dataArr.forEach((d) => {
                    maxVal = Math.max(Math.abs(d.y - d.y0), maxVal);
                });
                return (maxVal * 100) >= 2 ? 'visiblearea' : 'invisiblearea';
            },
            transform: {
                type: 'stack',
                groupBy: 'Country',
                orderBy: 'continent',
                offset: 'expand'
            }
        }, {
            mark: 'text',
            encoding: {
                text: 'Country',
                color: {
                    value: () => '#fff'
                }
            },
            calculateDomain: false,
            source: dt => dt.groupBy(['Country']),
            encodingTransform: muze.utils.require('layers', ['areaLayer', areaLayer => (points, layerInst, deps) => {
                const smartLabel = deps.smartLabel;
                const axisStartPos = layerInst.axes().x.range()[0];
                const axisEndPos = layerInst.axes().x.range()[1];
                points.forEach((point) => {
                    const countryVal = point.source[1];
                    const areaPoints = areaLayer.getPointsFromIdentifiers([['Country'], [countryVal]]);
                    const maxPoint = getMaxPoint(areaPoints);
                    point.update.x = maxPoint.x;
                    const diff = Math.abs(maxPoint.y - maxPoint.y0);
                    point.update.y = maxPoint.y + diff / 2;
                    const textSize = smartLabel.getOriSize(point.text);
                    if (textSize.height > diff) {
                        point.text = '';
                    } else if (textSize.height * 3 < diff) {
                        point.style['font-size'] = '18px';
                    }
                    if (point.update.x <= axisStartPos) {
                        point.update.x += textSize.width;
                    }
                    if (point.update.x + textSize.width >= axisEndPos) {
                        point.update.x -= textSize.width;
                    }
                });
                return points;
            }])
        }])
        .mount('#chart');

    muze.ActionModel.for(canvas).registerPhysicalActions({
        areahover: firebolt => (targetEl, behaviours) => {
            const dispatchFn = function (elemData) {
                const event = muze.utils.getEvent();
                const fieldsConfig = firebolt.context.data().getFieldsConfig();
                const mousePos = muze.utils.getClientPoint(this, event);
                const point = firebolt.context.getNearestPoint(mousePos.x, mousePos.y, {
                    getAllPoints: true
                });
                const payload = {
                    criteria: point.id,
                    target: point.target,
                    hoveredItem: elemData[0].source[fieldsConfig.Country.index]
                };
                behaviours.forEach(behaviour => firebolt.dispatchBehaviour(behaviour, payload));
            };

            targetEl.on('mouseover', dispatchFn)
                            .on('mousemove', dispatchFn)
                            .on('mouseout', () => {
                                behaviours.forEach(behaviour => firebolt.dispatchBehaviour(behaviour, {
                                    criteria: null
                                }));
                            });
        }
    }).registerPhysicalBehaviouralMap({
        areahover: {
            target: '.arealayer path',
            behaviours: ['highlight']
        }
    }).dissociateBehaviour(['highlight', 'hover'])
                    .mapSideEffects({
                        highlight: ['areaStrokeChanger']
                    })
                    .registerSideEffects(
                        class AreaStrokeChanger extends SurrogateSideEffect {
                            static formalName () {
                                return 'areaStrokeChanger';
                            }

                            apply (selectionSet, payload) {
                                const areaLayer = this.firebolt.context.getLayersByType('area')[0];
                                const countryIndex = areaLayer.data().getFieldsConfig().Country.index;
                                const areaPath = selectElement(areaLayer.mount())
                                                .selectAll('path').filter(d => d[0].source[countryIndex] ===
                                                    payload.hoveredItem);
                                this._highlightedArea && this._highlightedArea.classed('area-highlight', false);
                                areaPath.classed('area-highlight', true);
                                this._highlightedArea = areaPath;
                            }
                        }
                    );
});
