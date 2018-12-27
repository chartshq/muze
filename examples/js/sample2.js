const res = `Media,Year,value,
Youtube,2015,null,
Youtube,2018,85,
Instagram,2018,72,
Instagram,2015,52,
Snapchat,2018,69,
Snapchat,2015,41,
Facebook,2018,51,
Facebook,2015,71,
Twitter,2018,32,
Twitter,2015,33,
Tumblr,2018,9,
Tumblr,2015,14,
Reddit,2018,7,
Reddit,2015,null,
Vine,2015,24,
Vine,2018,null,`;

const env = muze();
const canvas = env.canvas();
const DataModel = muze.DataModel;

const schema = [
    { name: 'Media', type: 'dimension' },
    { name: 'Year', type: 'dimension', subtype: 'temporal', format: '%Y' },
    { name: 'value', type: 'measure' }
];

const dm = new DataModel(res, schema);
canvas
                .data(dm)
                .width(600)
                .height(400)
                .config({
                    axes: { y: { name: 'Value in percentage' } }
                })
                .rows(['value']) /* Plots against y-axis + provides panel split */
                .columns(['Year'])  /* Plots against x-axis */
                .color({
                    field: 'Media',
                    range: ['red', 'orange', 'yellow', '#33b5e91', '#31a6ea', 'grey', 'red', 'green']
                })
                .layers([
                    {
                        mark: 'line',
                        connectNullData: true
                    },
        { mark: 'point' }
                ])
                .title('Shifts of teenagers in social media usage')
                .mount('#chart-container');

