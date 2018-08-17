
/* eslint-disable */
/* eslint-disable */
(function () {
    // one type of renderer setup
    const p = muze.Muze();
        // picassoInstance2 = muze.Muze();
    var dm = muze.DataModel;

    var fn = p.width(600);

    let linedist = (p1, p2) => {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) +
        Math.pow(p1.y - p2.y, 2));
    };

    let getNewDataModel = (dm1, dm2, interp) => {
        let newdata = [],
            data = dm1.getData().data,
            data2 = dm2.getData().data,
            schema = dm1.getData().schema;

        for (let i = 0; i < data.length; i++) {
            let d1 = data[i],
                d2 = data2[i],
                diff,
                dObj = {};
            schema.forEach((obj, idx) => {
                if (obj.name === 'fertility' || obj.name === 'life_expect') {
                    diff = Math.abs(d2[idx] - d1[idx]) * interp.t;
                    dObj[obj.name] = d1[idx] <= d2[idx] ? d1[idx] + diff : d1[idx] - diff;
                }
                else {
                    dObj[obj.name] = d1[idx];
                }
            });
            newdata[i] = dObj;
        }
        return new dm(newdata, schema);
    };

    let interpValue = (currentPoint, nextPoint, x, y) => {
        let v1 = [Math.abs(currentPoint.x - x), Math.abs(currentPoint.y - y)],
            v2 = [Math.abs(nextPoint.x - currentPoint.x), Math.abs(nextPoint.y - currentPoint.y)];
        if (x < currentPoint.x) {
            v1[0] = -v1[0];
        }
        if (y > currentPoint.y) {
            v1[1] = -v1[1];
        }
        if (nextPoint.x < currentPoint.x) {
            v2[0] = -v2[0];
        }
        if (nextPoint.y > currentPoint.y) {
            v2[1] = -v2[1];
        }

        let dotprod = v1[0] * v2[0] + v1[1] * v2[1];
        let u = linedist(currentPoint, nextPoint);

        if (dotprod === 0) {
          return {
             interp: [0, 0],
             value: 0
            };
        }
       let value = dotprod / u;
       let absvalue = Math.min(Math.max(0, value), u);
       let t = absvalue / u;
       let x0 = currentPoint.x,
           y0 = currentPoint.y,
        y1 = nextPoint.y,
        x1 = nextPoint.x;

       let interp =[(1 - t) * x0 + t * x1, (1 - t) * y0 + t * y1];
       return {
          interp,
          value,
          t,
          dist: u,
          absvalue
       };
    };

    d3.json('../../data/gapminder.json', (data) => {
        const jsonData = data,
            schema = [
                {
                    name: 'cluster',
                    type: 'dimension'
                },
                {
                    name: 'country',
                    type: 'dimension'
                },
                {
                    name: 'pop',
                    type: 'measure'
                },
                {
                    name: 'life_expect',
                    type: 'measure'
                },

                {
                    name: 'fertility',
                    type: 'measure'
                },
                {
                    name: 'year',
                    type: 'dimension',
                    subtype: 'temporal',
                    format: '%Y'
                },

            ];
        let rootData = new dm(jsonData, schema);
        window.rootData = rootData;
        // rootData = rootData.select(fields => fields.country.value.startsWith('B'));
        let clusters = {
            0: {
                "name": "South Asia"
            },
            1: {
                "name": "Europe & Central Asia"
            },
            2: {
                "name": "Sub-Saharan Africa"
            },
            3: {
                name: 'America'
            },
            4: {
                "name": "East Asia & Pacific"
            },
            5: {
                "name": "Middle East & North Africa"
            }
        };
        rootData = rootData.generateDimensions([{
            name: 'Region'
        }], ['cluster'], (cluster) => {
            let region = clusters[cluster].name;
            return [region];
        });
        let yearData = rootData.select(fields => fields.year.value === 1985);

        // create renderer from combinaton of global and local settings
        let viz = fn.instance()
            .height(550)
            .data(yearData);

        let registerListenersOnUnit = (centerMatrix) => {
            viz.getValueMatrix()
                .filter((cell) => cell.constructor.name !== 'BlankCell')
                .each((cell, i, j, arr) => {
                    cell.unit.fireBolt.onBehaviourDispatch('select', behaviourCallback);
                    cell.unit.addLayers([{
                        mark: 'line',
                        name: 'newlayer',
                        encoding: {
                            x: 'fertility',
                            y: 'life_expect',
                            color: {
                                value: 'red'
                            }
                        },
                        transition: {
                            disabled: true
                        },
                        find: false
                    }, {
                        mark: 'text',
                        name: 'labels',
                        encoding: {
                            x: 'fertility',
                            y: 'life_expect',
                            text: 'year',
                            color: {
                                value: 'black'
                            }
                        },
                        transition: {
                            disabled: true
                        },
                        find: false
                    }]);
                });
        };

        let dataModels = {
            selection: null,
            calcMeasure: null
        };
        let elements = {
            tracker: null
        };

        let checkPointSide = (prevPoint, nextPoint, currentPoint, currPos) => {
            let checkBothSides;
            if (Math.abs(prevPoint.x - currPos.x) < 5 && Math.abs(prevPoint.y - currPos.y) < 5) {
              checkBothSides = true;
            }
            else if (Math.abs(nextPoint.x - currPos.x) < 5 && Math.abs(nextPoint.y - currPos.y) < 5) {
              checkBothSides = true;
            }

            else if (Math.abs(currentPoint.x - currPos.x) < 5 && Math.abs(currentPoint.y - currPos.y) < 5) {
              checkBothSides = true;
            }
            return checkBothSides;
        };

        let dragging,
            onDrag = (element, vuInstance) => {
                let utilFns = vuInstance._utilFns,
                    vuTracker = vuInstance._rootSvg.node(),
                    currentIndex,
                    dataModelData,
                    fieldIndex,
                    currPos;

                return utilFns.drag()().on('start', function () {
                    dragging = true;
                    let event = utilFns.event();
                    let pos = utilFns.getMousePos(vuTracker, event.sourceEvent);
                    element.attr('cx', event.x).attr('cy', event.y);
                    let lineLayer = vuInstance.getLayerByName('newlayer'),
                        nearestPoint = lineLayer.getNearestPoint(pos.x, pos.y, 1000);

                    dataModelData = dataModels.selection.getData(),
                    fieldIndex = dataModelData.schema.findIndex(d => d.name === 'year');
                    if (!nearestPoint) {
                        currentIndex = null;
                        return;
                    }
                    let id = nearestPoint.id;
                    currentIndex = dataModelData.uids.indexOf(id);
                }).on('drag', function () {
                    dragging = true;
                    if (currentIndex === null) {
                        return;
                    }
                    let event = utilFns.event();
                    let pos = utilFns.getMousePos(vuTracker, event.sourceEvent);
                    let lineLayer = vuInstance.getLayerByName('newlayer');

                    element.attr('cx', event.x).attr('cy', event.y);
                    let nextIndex = Math.min(currentIndex + 1, dataModelData.uids.length - 1),
                        prevIndex = Math.max(currentIndex - 1, 0),
                        currentPoint = lineLayer.getPointByRowId(dataModelData.uids[currentIndex]),
                        nextPoint = lineLayer.getPointByRowId(dataModelData.uids[nextIndex]),
                        prevPoint = lineLayer.getPointByRowId(dataModelData.uids[prevIndex]);

                    currPos = currPos || currentPoint;
                    let checkBothSides = false;

                    checkBothSides = checkPointSide(prevPoint, nextPoint, currentPoint, currPos);

                    let interp;
                    let year1,
                        year2,
                        x = pos.x,
                        y = pos.y;
                    if (checkBothSides) {
                        let interpNext = interpValue(currentPoint, nextPoint, x, y);
                        let interpPrev = interpValue(currentPoint, prevPoint, x, y);

                        if (interpNext.value > interpPrev.value) {
                            interp = interpNext;
                            let value = interpNext.interp;
                            year1 = dataModelData.data[currentIndex][fieldIndex],
                            year2 = dataModelData.data[nextIndex][fieldIndex];
                            check = 'next';
                        }
                        else {
                            let value = interpPrev.interp;
                            checkPoint = prevPoint;
                            interp = interpPrev;
                            year1 = dataModelData.data[currentIndex][fieldIndex],
                            year2 = dataModelData.data[prevIndex][fieldIndex];
                            check = 'prev';
                        }
                    }
                    else {
                        if (check === 'next') {
                            interp = interpValue(currentPoint, nextPoint, x, y);
                            year1 = dataModelData.data[currentIndex][fieldIndex],
                            year2 = dataModelData.data[nextIndex][fieldIndex];
                        }
                        else {
                            interp = interpValue(currentPoint, prevPoint, x, y);
                            year1 = dataModelData.data[currentIndex][fieldIndex],
                            year2 = dataModelData.data[prevIndex][fieldIndex];
                        }
                    }

                    let value = interp.interp;

                    if (value[0] === nextPoint.x && value[1] === nextPoint.y) {
                        currentIndex = nextIndex;
                    }
                    if (value[0] === prevPoint.x && value[1] === prevPoint.y) {
                        currentIndex = prevIndex;
                    }

                    if (value[0] === 0 && value[1] === 0) {
                        currPos = currentPoint;
                        interp = {
                            interp: currPos,
                            t: 0
                        }
                        year1 = dataModelData.data[currentIndex][fieldIndex],
                        year2 = nextIndex !== -1 ?
                            dataModelData.data[nextIndex][fieldIndex] : dataModelData.data[prevIndex][fieldIndex];
                    }
                    else {
                        currPos = {
                            x: value[0],
                            y: value[1]
                        };
                    }

                    let year1Dm = rootData.select(fields => fields.year.value === year1, {}, false),
                        year2Dm = rootData.select(fields => fields.year.value === year2, {}, false);
                    // Get a new datamodel
                    let newDm = getNewDataModel(year1Dm, year2Dm, interp);
                    vuInstance.getLayersByType('point')[0].dataModel(newDm);

                }).on('end', function () {
                    elements.tracker && elements.tracker.remove();
                    elements.tracker = null;
                    dragging = false;
                });
            }
        // This function will be called on hovering the circle
        // On hovering the circle, we draw a tracker circle on which the drag event gets binded
        let behaviourCallback = function (selectionSet, payload, dm) {
            let criteria = payload.criteria;
            let vuInstance = this.vuInstance;
            let pointLayer = vuInstance.getLayersByType('point')[0],
                point = pointLayer.getPointByRowId(criteria && criteria[0]),
                data = pointLayer.dataModel().getData(),
                uids = data.uids,
                dataArr = data.data,
                row = dataArr[uids.indexOf(criteria && criteria[0])],

                fieldIndex = data.schema.findIndex(d => d.name === 'country'),
                country = row && row[fieldIndex];

            if (point) {
                elements.tracker = vuInstance.drawCustomElement('circle', {
                    className: 'tracker-circle',
                    on: {
                        enter: el => el.call(onDrag(el, vuInstance))
                    }
                });

                elements.tracker.attr('cx', point.x + point.width / 2)
                    .attr('cy', point.y + point.width / 2)
                    .attr('r', 10)
                    .style('fill-opacity', 0);
            }
            else {
                if (event.toElement === (elements.tracker && elements.tracker.node())) {
                    return;
                }
                if (elements.tracker && !dragging) {
                    elements.tracker.remove();
                    elements.tracker = null;
                }
            }

            if (!dragging) {
                let newTable = rootData.select(fields => fields.country.value === country,
                    {}, false);
                dataModels.selection = newTable;
                vuInstance.getLayerByName('newlayer').dataModel(newTable);
                vuInstance.getLayerByName('labels').dataModel(newTable);
            }
        };

         function render() {
            viz = viz  /* takes the rest of the config from global */
                .rows(['life_expect'])
                .columns(['fertility'])
                .color('Region')
                .detail('country')
                .layers({
                    fertility: {
                        mark: 'point',
                        transition: {
                            disabled: true
                        }
                    }
                })
                .mount(d3.select('body').append('div').node());
                setTimeout(() => {
                    let centerMatrix = viz.compositon.VisualGroup._layout._centerMatrix;
                    let data = rootData.getData(),
                        dataArr = data.data,
                        fertility = data.schema.findIndex(d => d.name === 'fertility'),
                        life_expect = data.schema.findIndex(d => d.name === 'life_expect'),
                        xDomain = rootData.getNameSpace().fields[fertility].getDomain(),
                        yDomain = rootData.getNameSpace().fields[life_expect].getDomain();
                    let axes = viz.getAxes();

                    axes.rows[0].filter(cell => cell.constructor.name !== 'BlankCell')
                        .forEach(cell => cell.axis.updateDomain(yDomain));
                    axes.columns[0].filter(cell => cell.constructor.name !== 'BlankCell')
                        .forEach(cell => cell.axis.updateDomain(xDomain));
                    registerListenersOnUnit(viz);
                }, 1000);
        }
        render();
    });
})();