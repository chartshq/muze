const DataModel = muze.DataModel;

const getSchema = () => {
    const schemaPop = [
        {
            id: 'a',
            name: 'Category',
            type: 'dimension'
        },
        {
            id: 'b',
            name: 'State/Country/UT',
            type: 'dimension'
        },
        {
            id: 'c',
            name: 'Population 2011',
            type: 'measure',
            defAggFn: 'avg'
        },
        {
            id: 'd',
            name: 'Decadal Population Growth Rate - 2001-2011',
            type: 'measure'
        },
        {
            id: 'e',
            name: 'Population Density (per sq.km) - 2011',
            type: 'measure'
        }
    ];
    const schemaRatio = [
        {
            id: 'a',
            name: 'Category',
            type: 'dimension'
        },
        {
            id: 'b',
            name: 'State/Country/UT',
            type: 'dimension'
        },
        {
            id: 'c',
            name: 'Sex ratio of total population - Total - 2001',
            type: 'measure'
        },
        {
            id: 'd',
            name: 'Sex ratio of total population - Total - 2011',
            type: 'measure'
        },
        {
            id: 'e',
            name: 'Sex ratio of total population - Rural - 2001',
            type: 'measure'
        },
        {
            id: 'f',
            name: 'Sex ratio of total population - Rural - 2011',
            type: 'measure'
        },
        {
            id: 'g',
            name: 'Sex ratio of total population - Urban - 2001',
            type: 'measure'
        },
        {
            id: 'h',
            name: 'Sex ratio of total population - Urban - 2011',
            type: 'measure'
        }
    ];
    return {
        schemaPop,
        schemaRatio
    };
};

const getActualData = (data, schema) => {
    const nData = [];
    data.forEach((e, i) => {
        nData[i] = {};
        schema.forEach((f, j) => {
            nData[i][f.name] = e[j];
        });
    });
    return nData;
};
const getData = (population, ratio) => {
    const {
        schemaPop,
        schemaRatio
    } = getSchema();

    const popData = new DataModel(getActualData(population, schemaPop), schemaPop);
    const ratioData = new DataModel(getActualData(ratio, schemaRatio), schemaRatio);

    const data = popData.naturalJoin(ratioData).getData();

    const newData = [[...data.schema.map(e => e.name), 'Gender']];
    data.data.forEach((e) => {
        const length = newData.length;
        newData[length] = e.slice();
        newData[length][newData[length].length] = 'Men';
        newData[length + 1] = e.slice();
        newData[length + 1][newData[length + 1].length] = 'Women';
    });
    data.schema.push({ name: 'Gender', type: 'dimension' });
    let rootData = new DataModel(newData, data.schema);

    rootData = rootData.calculateVariable({
        name: 'Gender Population',
        type: 'measure'
    }, ['Population 2011', 'Sex ratio of total population - Total - 2011', 'Gender', (pop, rat, gen) =>
    (pop * (gen === 'Women' ? rat : 1000) / (rat + 1000)) / pop
    ]);
    return rootData;
    // rootData = rootData.calculateVariable({
    //     name: 'Men Population',
    //     type: 'measure'
    // }, ['Population 2011', 'Women Population', (pop, wom) => pop - wom]);
};

const genderShapes = {
    Women: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="200 0 297 497"><g><path d="M462.5 323l-60-166c-.667-.667-1-1.333-1-2 0-3.333 1.667-5 5-5 2 0 3.333 1.333 4 4l41 107c3.337 7.333 10.67 11 22 11 4 0 6.833-3 8.5-9s2.5-10 2.5-12l-42-103c-1.333-12.667-7.333-23.333-18-32s-23-13-37-13h-53c-14 0-26.5 4.5-37.5 13.5S279.5 136 277.5 148l-39 104c-1.333 2-1 5.833 1 11.5s5 8.5 9 8.5c12.667 0 20-3.333 22-10l40-108c.667-2 2-3 4-3 2.667 0 4 1.333 4 4v1l-59 167v13c0 1.334 1.667 3.668 5 7 3.338 3.333 5.671 5 7 5h38v129c0 5.333 2.167 10 6.5 14 4.336 4 9.169 6 14.5 6 5.333 0 10-2 14-6s6-8.667 6-14V343c0-.667 1.833-1.167 5.5-1.5s7.167-.333 10.5 0c3.333.337 5 .837 5 1.5v133c0 5.333 2 10.167 6 14.5s8.833 6.5 14.5 6.5 10.5-2.167 14.5-6.5 6-9.167 6-14.5V348h39c2 0 4.333-1.667 7-5s4-5.667 4-7v-13zM317.5 42.5c0 11.667 4.167 21.667 12.5 30S348.333 85 360 85s21.667-4.167 30-12.5 12.5-18.333 12.5-30-4.167-21.667-12.5-30S371.667 0 360 0s-21.667 4.167-30 12.5-12.5 18.333-12.5 30z"/></g></svg>',
    Men: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 197 497"><g><path d="M53.5 476c0 14 6.833 21 20.5 21s20.5-7 20.5-21V287h21v189c0 14 6.834 21 20.5 21 13.667 0 20.5-7 20.5-21V154h10v116c0 7.334 2.5 12.667 7.5 16s10.167 3.333 15.5 0 8-8.667 8-16V145c0-13.334-4.5-23.667-13.5-31s-21.5-11-37.5-11h-82c-15.333 0-27.833 3.333-37.5 10s-14.5 17-14.5 31v133c0 6 2.667 10.333 8 13s10.5 2.667 15.5 0 7.5-7 7.5-13V154h10v322zM61.5 42.5c0 11.667 4.167 21.667 12.5 30S92.333 85 104 85s21.667-4.167 30-12.5S146.5 54 146.5 42c0-11.335-4.167-21.168-12.5-29.5C125.667 4.167 115.667 0 104 0S82.333 4.167 74 12.5s-12.5 18.333-12.5 30z"/></g></svg>'
};
