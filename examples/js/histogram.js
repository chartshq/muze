
let env = muze.Muze();
let DataModel = muze.DataModel,
    share = muze.operators.share;


d3.json('../../data/movies.json', (data) => {
    const jsonData = data,
        schema = [{
            name: 'IMDB_Rating',
            type: 'measure'
        }];
    let rootData = new DataModel(jsonData, schema);
    // rootData = rootData.bin('IMDB_Rating', { numOfBins: 10 }, 'count');
    env = env.data(rootData).minUnitHeight(40).minUnitWidth(40);
    let mountPoint = document.getElementsByClassName('chart')[0];
    let rows = ['y'],
        columns = [share('x', 'x0')];
    let canvas = env.canvas();
    canvas = canvas
        .rows(rows)
        .columns(columns)
        .width(600)
        .height(400)
        .data(rootData)
        .config({})
        .layers([{
            mark: 'bar',
            transition: {
                duration: 1000
            },
            encoding: {
                x: 'x',
                x0: 'x0'
            }
        }])
        .mount(mountPoint);
});
