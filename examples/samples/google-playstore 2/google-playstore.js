/* global muze, d3 */

let env = muze();
const SpawnableSideEffect = muze.SideEffects.standards.SpawnableSideEffect;
const DataModel = muze.DataModel;
const ActionModel = muze.ActionModel;
const html = muze.Operators.html;
d3.csv('./google-playstore.csv', (data) => {
    const jsonData = data;
    const schema = [
        {
            name: 'App',
            type: 'dimension'
        },
        {
            name: 'Category',
            type: 'dimension'
        },
        {
            name: 'Rating',
            type: 'measure',
            defAggFn: 'avg'
        },
        {
            name: 'Reviews',
            type: 'measure',
            defAggFn: 'avg'
        },
        {
            name: 'Size',
            type: 'measure',
            defAggFn: 'avg'
        },
        {
            name: 'Installs',
            type: 'dimension',
            defAggFn: 'avg'
        },
        {
            name: 'Type',
            type: 'dimension',
            defAggFn: 'avg'
        },
        {
            name: 'Price',
            type: 'dimension',
            defAggFn: 'avg'
        },
        {
            name: 'Content Rating',
            type: 'dimension',
            defAggFn: 'avg'
        },
        {
            name: 'Genres',
            type: 'dimension',
            defAggFn: 'avg'
        },
        {
            name: 'Last Updated',
            type: 'dimension',
            format: '%B %e, %Y'
        },
        {
            name: 'Current Ver',
            type: 'dimension',
            defAggFn: 'avg'
        },
        {
            name: 'Android Ver',
            type: 'dimension',
            defAggFn: 'avg'
        }
    ];

    let rootData = new DataModel(jsonData, schema);
    rootData = rootData.select(f => f.Rating.value !== null).sort([['Rating', 'desc']]);

    // create a back button for the chart
    const backButton = document.createElement('DIV');
    backButton.innerHTML = '◀';
    backButton.className = 'backButton hidden';
    document.getElementById('chart-container').appendChild(backButton);

    env = env
    .data(rootData)
    .minUnitHeight(10)
    .minUnitWidth(10);

    const defaultTitle = 'A survey of the apps on the Google Play Store';
    const defaultSubTitle = 'Click on any point to get a deep level view for those apps';

    const crosstab = env
    .canvas()
    .columns(['Rating'])
    .rows(['Category'])
    .color({
        field: 'Content Rating',
        range: ['#3182bd', 'rgb(128, 20,20)', 'teal', 'brown', 'black', 'white']
    })
    .size({
        field: 'Size',
        range: [10, 350]
    })
    .data(rootData)
    .width(1000)
    .height(800)
    .title(defaultTitle)
    .subtitle(defaultSubTitle)
    .layers([{
        mark: 'point',
        transition: {
            disabled: true
        }
    }])
    .config({
        border: {
            showValueBorders: {
                left: false,
                bottom: false
            }
        },
        axes: {
            x: {
                showAxisName: false,
                domain: [3.5, 5]
            },
            y: {
                showAxisName: false,
                tickFormat: str => str.replace(/[_-]/g, ' ')
            }
        },
        gridLines: {
            x: {
                show: false
            },
            y: {
                show: true
            }
        },
        legend: {
            size: {
                show: false
            },
            color: {
                show: false
            }
        },
        interaction: {
            tooltip: {

                formatter: (dataModel, context) => {
                    const tooltipData = dataModel.getData().data;
                    const fieldConfig = dataModel.getFieldsConfig();
                    const { payload } = context;
                    const { target } = payload;
                    let tooltipContent = '';
                    const targetCategory = target[0].findIndex(e => e === 'Category');
                    const targetApp = target[0].findIndex(e => e === 'App');
                    const targetContentRating = target[0].findIndex(e => e === 'Content Rating');

                    tooltipData.forEach((dataArray) => {
                        const CategoryOrApp = dataArray[(fieldConfig.Category || fieldConfig.App).index];
                        const ContentRating = dataArray[fieldConfig['Content Rating'].index];
                        const Rating = dataArray[fieldConfig.Rating.index];
                        const Size = dataArray[fieldConfig.Size.index];
                        if (CategoryOrApp === target[1][targetCategory] && ContentRating === target[1][targetContentRating]) {
                            tooltipContent += `<p> Apps in Category <b>${CategoryOrApp}</b> and rated as <b>${ContentRating}</b> have an average size <b>${Size.toFixed(2)}</b> MB, have an average user rating of <b>${Rating.toFixed(2)}</b></p>`;
                        } else if (CategoryOrApp === target[1][targetApp]) {
                            tooltipContent += `<p> The app <b>${CategoryOrApp}</b> has a size of <b>${Size.toFixed(2)}</b> MB, and an average user rating of <b>${Rating.toFixed(2)}</b></p>`;
                        }
                    });
                    return html`${tooltipContent}`;
                }

            }
        }

    })
    .mount('#chart-container');

    ActionModel
                    .for(crosstab)
                    .registerSideEffects(class TextSideEffect extends SpawnableSideEffect {
                        static formalName () {
                            return 'drilldown';
                        }

                        apply (selectionSet) {
                            const dataModel = selectionSet.mergedEnter.model;

                            const cat = dataModel.getData().data[0][1];
                            const con = dataModel.getData().data[0][3];
                            const newDM = rootData.select(e => e.Category.value === cat && e['Content Rating'].value === con);

                            crosstab
                                            .rows(['App'])
                                            .data(newDM)
                                            .title(`Apps under Category ${cat} and content rated as ${con}`)
                                            .subtitle('');
                            backButton.classList.remove('hidden');

                            ActionModel
                                            .for(crosstab)
                                            .dissociateSideEffect(['drilldown', 'select']);
                            return this;
                        }
    }).mapSideEffects({
        select: ['drilldown']
    }).dissociateSideEffect(['tooltip', 'brush,select']);

    // Add event listener for the back button
    backButton.addEventListener('click', () => {
        crosstab
                        .rows(['Category'])
                        .data(rootData)
                        .title(defaultTitle)
                        .subtitle(defaultSubTitle);
        backButton.classList.add('hidden');
        ActionModel
                        .for(crosstab)
                        .mapSideEffects({
                            select: ['drilldown']
                        });
    });
});
