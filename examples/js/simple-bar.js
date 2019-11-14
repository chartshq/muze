d3.csv('../../data/heatmap.csv', (data) => {
    // load data and schema from url
    // Retrieves the DataModel from muze namespace. Muze recognizes DataModel as a first class source of data.
    const DataModel = window.muze.DataModel;
    const schema = [{
        name: 'Month',
        type: 'dimension'
    }, {
        name: 'Name',
        type: 'dimension'
    }, {
        name: 'Sales',
        type: 'measure'
    }];

    // Create an instance of DataModel using the data and schema.
    const rootData = new DataModel(data, schema);
    // Create a global environment to share common configs across charts
    const env = window.muze();
    // Create a canvas from the global environment
    let canvas = env.canvas();

    canvas = canvas.rows(['Name']).columns(['Month']).layers([{ // For drawing the heatmap background
        mark: 'bar'
    }, { // For drawing the text
        mark: 'text',
        encoding: {
            text: {
                field: 'Sales',
                formatter: function formatter (value) {
                    return `${(value / 1000).toFixed(1)}k`;
                } // Formats the value of text
            },
            color: {
                value: function value () {
                    return '#fff';
                }
            }
        },
        interactive: false
    }]).config({
        axes: { // With bar encoding, it normally draws a bar chart without padding. Here its forcefully made zero
            x: {
                padding: 0
            },
            y: {
                padding: 0
            }
        },
        legend: {
            position: 'bottom'
        }
    }).data(rootData).color({ // Color encoding
        field: 'Sales',
        // step: true,
        range: ['#BBF6F0', '#85ECE1', '#50C0B5', '#12877B', '#005F56']
    }).width(750).height(450)
    // .title('Heatmap', { position: 'top', align: 'right' })
    .title('The car acceleration respective to origin', { position: 'bottom', align: 'center' }).subtitle('Sales per month for each sales person', { position: 'top', align: 'right' }).mount('#chart');

    canvas.once('canvas.updated').then(() => {
        // Disable events from legend
        const legend = canvas.legend().color;
        legend.firebolt().dissociateBehaviour('highlight', 'hover');
        legend.firebolt().dissociateBehaviour('select', 'click');
    });

    // Disable events from legend
    muze.ActionModel.for(canvas).dissociateBehaviour(['select', 'click'], ['brush', 'drag']);

    canvas.once('canvas.animationend').then((client) => {
        const element = document.getElementById('chart');
        element.classList.add('animateon');
    });
});
