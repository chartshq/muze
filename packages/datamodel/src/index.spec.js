/* global describe, it, context */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import { FilteringMode, assembleModelFromIdentifiers } from 'muze-utils';
import DataModel from './index';
import pkg from '../package.json';

function avg(...nums) {
    return nums.reduce((acc, next) => acc + next, 0) / nums.length;
}

describe('DataModel', () => {
    describe('#version', () => {
        it('should be same to the version value specified in package.json file', () => {
            expect(DataModel.version).to.equal(pkg.version);
        });
    });

    describe('#clone', () => {
        it('should make a new copy of the current DataModel instance', () => {
            const data = [
                { age: 30, job: 'unemployed', marital: 'married' },
                { age: 33, job: 'services', marital: 'married' },
                { age: 35, job: 'management', marital: 'single' }
            ];
            const schema = [
                { name: 'age', type: 'measure' },
                { name: 'job', type: 'dimension' },
                { name: 'marital', type: 'dimension' },
            ];
            const dataModel = new DataModel(data, schema);

            let cloneRelation;
            cloneRelation = dataModel.clone();
            expect(cloneRelation instanceof DataModel).to.be.true;
            // Check clone datamodel have all the required attribute
            expect(cloneRelation._colIdentifier).to.equal(dataModel._colIdentifier);
            expect(cloneRelation._rowDiffset).to.equal(dataModel._rowDiffset);
        });
    });

    context('Test for empty DataModel', () => {
        let data = [];
        let schema = [];
        let edm = new DataModel(data, schema);
        it('should return empty data array', () => {
            expect(edm.getData().data).to.deep.equal([]);
        });
        it('should return have empty fields array', () => {
            expect(edm.getFieldspace().fields.length).to.equal(0);
        });
        it('should have zero columns', () => {
            expect(edm._colIdentifier).to.equal('');
        });
        it('should have empty rowDiffset', () => {
            expect(edm._rowDiffset).to.equal('');
        });
    });

    describe('#getData', () => {
        it('should return the data in the specified format', () => {
            const schema = [
                { name: 'name', type: 'dimension' },
                { name: 'birthday', type: 'dimension', subtype: 'temporal', format: '%Y-%m-%d' }
            ];

            const data = [
                { name: 'Rousan', birthday: '1995-07-05', roll: 12 },
                { name: 'Sumant', birthday: '1996-08-04', roll: 89 },
                { name: 'Akash', birthday: '1994-01-03', roll: 33 }
            ];
            const dataModel = new DataModel(data, schema);

            let generatedData = dataModel.getData({
                order: 'row'
            });
            let expected = {
                data: [
                    ['Rousan', 804882600000],
                    ['Sumant', 839097000000],
                    ['Akash', 757535400000]
                ],
                schema: [
                    { name: 'name', type: 'dimension' },
                    { name: 'birthday', type: 'dimension', subtype: 'temporal', format: '%Y-%m-%d' }
                ],
                uids: [0, 1, 2]
            };
            expect(generatedData).to.deep.equal(expected);

            generatedData = dataModel.getData({
                order: 'column'
            });
            expected = {
                data: [
                    ['Rousan', 'Sumant', 'Akash'],
                    [804882600000, 839097000000, 757535400000]
                ],
                schema: [
                    { name: 'name', type: 'dimension' },
                    { name: 'birthday', type: 'dimension', subtype: 'temporal', format: '%Y-%m-%d' }
                ],
                uids: [0, 1, 2]
            };
            expect(generatedData).to.deep.equal(expected);

            generatedData = dataModel.getData({
                order: 'row',
                formatter: {
                    name: val => val.toUpperCase(),
                    birthday: (val) => {
                        const dm = new Date(val);
                        return `${dm.getFullYear()}-${dm.getMonth() + 1}-${dm.getDay()}`;
                    }
                }
            });
            expected = {
                schema: [
                    { name: 'name', type: 'dimension' },
                    { name: 'birthday', type: 'dimension', subtype: 'temporal', format: '%Y-%m-%d' }
                ],
                data: [
                    ['ROUSAN', '1995-7-3'],
                    ['SUMANT', '1996-8-0'],
                    ['AKASH', '1994-1-1']
                ],
                uids: [0, 1, 2]
            };
            expect(generatedData).to.deep.equal(expected);

            generatedData = dataModel.getData({
                order: 'column',
                formatter: {
                    name: val => val.toUpperCase(),
                    birthday: (val) => {
                        const dm = new Date(val);
                        return `${dm.getFullYear()}-${dm.getMonth() + 1}-${dm.getDay()}`;
                    }
                }
            });
            expected = {
                schema: [
                    { name: 'name', type: 'dimension' },
                    { name: 'birthday', type: 'dimension', subtype: 'temporal', format: '%Y-%m-%d' }
                ],
                data: [
                    ['ROUSAN', 'SUMANT', 'AKASH'],
                    ['1995-7-3', '1996-8-0', '1994-1-1']
                ],
                uids: [0, 1, 2]
            };
            expect(generatedData).to.deep.equal(expected);
        });

        it('should return sorted data according to the specified config', () => {
            const data = [
                { performance: 'low', horsepower: 100, weight: 2 },
                { performance: 'high', horsepower: 400, weight: 1 },
                { performance: 'medium', horsepower: 20, weight: 1.5 },
                { performance: 'decent', horsepower: 30, weight: 0.5 }
            ];
            const schema = [
                { name: 'performance', type: 'dimension' },
                { name: 'horsepower', type: 'measure' },
                { name: 'weight', type: 'measure' }
            ];

            const dm = new DataModel(data, schema);
            const expected = {
                schema: [
                    {
                        name: 'performance',
                        type: 'dimension'
                    },
                    {
                        name: 'horsepower',
                        type: 'measure'
                    },
                    {
                        name: 'weight',
                        type: 'measure'
                    }
                ],
                data: [
                    ['medium', 20, 1.5],
                    ['decent', 30, 0.5],
                    ['low', 100, 2],
                    ['high', 400, 1]
                ],
                uids: [2, 3, 0, 1]
            };

            expect(dm.getData({
                sort: [['horsepower', 'asc']]
            })).to.deep.equal(expected);
        });
    });

    describe('#project', () => {
        const data = [
            { age: 30, education: 'tertiary', job: 'management', marital: 'married' },
            { age: 59, education: 'secondary', job: 'blue-collar', marital: 'married' },
            { age: 35, education: 'tertiary', job: 'management', marital: 'single' }
        ];
        const schema = [
            { name: 'age', type: 'measure' },
            { name: 'education', type: 'dimension' },
            { name: 'job', type: 'dimension' },
            { name: 'marital', type: 'dimension' }
        ];

        it('should make projection with the input fields', () => {
            const dataModel = new DataModel(data, schema);
            const projectedDataModel = dataModel.project(['age', 'job']);
            const expected = {
                data: [
                    [30, 'management'],
                    [59, 'blue-collar'],
                    [35, 'management']
                ],
                schema: [
                    { name: 'age', type: 'measure' },
                    { name: 'job', type: 'dimension' },
                ],
                uids: [0, 1, 2]
            };
            expect(dataModel === projectedDataModel).to.be.false;
            expect(projectedDataModel.getData()).to.deep.equal(expected);
        });

        it('should make inverted projections', () => {
            const dataModel = new DataModel(data, schema);
            const invProjectedDataModel = dataModel.project(['age', 'job'], {
                mode: FilteringMode.INVERSE
            });
            const expected = {
                data: [
                    ['tertiary', 'married'],
                    ['secondary', 'married'],
                    ['tertiary', 'single']
                ],
                schema: [
                    { name: 'education', type: 'dimension' },
                    { name: 'marital', type: 'dimension' }
                ],
                uids: [0, 1, 2]
            };
            expect(expected).to.deep.equal(invProjectedDataModel.getData());
        });

        it('should make normal and inverse projection both when mode is ALL', () => {
            const datamodel = new DataModel(data, schema);
            const dataModels = datamodel.project(['age', 'job'], {
                mode: FilteringMode.ALL
            });

            const projectedModel = {
                data: [
                    [30, 'management'],
                    [59, 'blue-collar'],
                    [35, 'management']
                ],
                schema: [
                    { name: 'age', type: 'measure' },
                    { name: 'job', type: 'dimension' },
                ],
                uids: [0, 1, 2]
            };
            const rejectionModel = {
                data: [
                    ['tertiary', 'married'],
                    ['secondary', 'married'],
                    ['tertiary', 'single']
                ],
                schema: [
                    { name: 'education', type: 'dimension' },
                    { name: 'marital', type: 'dimension' }
                ],
                uids: [0, 1, 2]
            };

            expect(projectedModel).to.deep.equal(dataModels[0].getData());
            expect(rejectionModel).to.deep.equal(dataModels[1].getData());
        });

        it('should maintain the order of column names given in project params', () => {
            const datamodel = new DataModel(data, schema);
            const dataModels = datamodel.project(['job', 'age', 'marital', 'education']);
            const expColumnOrder = 'job,age,marital,education';
            expect(dataModels._colIdentifier).to.equal(expColumnOrder);
        });

        it('should maintain the order of column names in fieldConfig and schema', () => {
            const datamodel = new DataModel(data, schema);
            const dataModels = datamodel.project(['job', 'age', 'marital', 'education']);
            const shecma = dataModels.getData().schema.map((scheme, i) => ({ name: scheme.name, index: i }));
            const fieldMap = dataModels.getFieldsConfig();
            shecma.forEach((sch) => {
                expect(sch.index).to.equal(fieldMap[sch.name].index);
            });
        });
    });


    describe('#select', () => {
        const data = [
            { age: 30, job: 'management', marital: 'married' },
            { age: 59, job: 'blue-collar', marital: 'married' },
            { age: 35, job: 'management', marital: 'single' },
            { age: 57, job: 'self-employed', marital: 'married' },
            { age: 28, job: 'blue-collar', marital: 'married' },
        ];
        const schema = [
            { name: 'age', type: 'measure' },
            { name: 'job', type: 'dimension' },
            { name: 'marital', type: 'dimension' }
        ];

        it('should perform normal selection', () => {
            const dataModel = new DataModel(data, schema);
            const selectedDm = dataModel.select(fields => fields.age.value < 40);
            const expData = {
                data: [
                    [30, 'management', 'married'],
                    [35, 'management', 'single'],
                    [28, 'blue-collar', 'married']
                ],
                schema,
                uids: [0, 2, 4]
            };

            // check project is not applied on the same DataModel
            expect(dataModel === selectedDm).to.be.false;
            expect(selectedDm._rowDiffset).to.equal('0,2,4');
            // Check The return data
            expect(selectedDm.getData()).to.deep.equal(expData);
        });

        it('should perform selection with the specified modes', () => {
            const dataModel = new DataModel(data, schema);
            const selected = dataModel.select(fields => fields.marital.value === 'married').getData();
            const rejected = dataModel.select(fields => fields.marital.value === 'married', {
                mode: FilteringMode.INVERSE
            }).getData();
            const selectionAll = dataModel.select(fields => fields.marital.value === 'married', {
                mode: FilteringMode.ALL
            });

            expect(selected).to.deep.equal({
                data: [
                    [30, 'management', 'married'],
                    [59, 'blue-collar', 'married'],
                    [57, 'self-employed', 'married'],
                    [28, 'blue-collar', 'married']
                ],
                schema,
                uids: [0, 1, 3, 4]
            });
            expect(rejected).to.deep.equal({
                data: [
                    [35, 'management', 'single']
                ],
                schema,
                uids: [2]
            });
            expect(selectionAll[0].getData()).to.deep.equal(selected);
            expect(selectionAll[1].getData()).to.deep.equal(rejected);
        });

        it('should perform selection functionality in extreme condition', () => {
            const dataModel = new DataModel(data, schema);
            const selectedDm = dataModel.project(['age', 'job']).select(fields =>
                fields.job.value === 'management');
            // Check if repetition select works
            const selectedDm2 = selectedDm.select(fields =>
                fields.marital.value === 'single');
            let expData = {
                data: [
                    [30, 'management'],
                    [35, 'management']
                ],
                schema: [
                    { name: 'age', type: 'measure' },
                    { name: 'job', type: 'dimension' },
                ],
                uids: [0, 2]
            };
            // check project is not applied on the same DataModel
            expect(dataModel === selectedDm).to.be.false;
            expect(selectedDm._rowDiffset).to.equal('0,2');
            // Check The return data
            expect(selectedDm.getData()).to.deep.equal(expData);

            expData = {
                data: [
                    [35, 'management']
                ],
                schema: [
                    { name: 'age', type: 'measure' },
                    { name: 'job', type: 'dimension' },
                ],
                uids: [2]
            };
            expect(selectedDm2._rowDiffset).to.equal('2');
            // Check The return data
            expect(selectedDm2.getData()).to.deep.equal(expData);
        });

        it('should perform selection and field domain should return only selected data', () => {
            const dataModel = new DataModel(data, schema);
            const selectedDm = dataModel.select(fields => fields.age.value < 40);
            const expData = {
                data: [
                    [30, 'management', 'married'],
                    [35, 'management', 'single'],
                    [28, 'blue-collar', 'married']
                ],
                schema,
                uids: [0, 2, 4]
            };

            // check project is not applied on the same DataModel
            expect(dataModel === selectedDm).to.be.false;
            expect(selectedDm._rowDiffset).to.equal('0,2,4');
            // Check The return data
            expect(selectedDm.getData()).to.deep.equal(expData);
            expect(selectedDm.getFieldspace().fields[0].domain()).to.deep.equal([28, 35]);
        });
    });

    describe('#sort', () => {
        it('should perform sorting properly', () => {
            const data = [
                { age: 30, job: 'management', marital: 'married' },
                { age: 59, job: 'blue-collar', marital: 'married' },
                { age: 35, job: 'management', marital: 'single' },
                { age: 57, job: 'self-employed', marital: 'married' }
            ];
            const schema = [
                { name: 'age', type: 'measure' },
                { name: 'job', type: 'dimension' },
                { name: 'marital', type: 'dimension' }
            ];
            const dataModel = new DataModel(data, schema);

            const sortedDm = dataModel.sort([
                ['age', 'desc']
            ]);
            const expData = {
                data: [
                    [59, 'blue-collar', 'married'],
                    [57, 'self-employed', 'married'],
                    [35, 'management', 'single'],
                    [30, 'management', 'married']
                ],
                schema,
                uids: [0, 1, 2, 3]
            };

            expect(sortedDm).not.to.equal(dataModel);
            expect(sortedDm._sortingDetails).to.deep.equal([
                ['age', 'desc']
            ]);
            expect(sortedDm.getData()).to.deep.equal(expData);
        });

        it('should perform multi sort properly', () => {
            const data = [
                { age: 30, job: 'management', marital: 'married' },
                { age: 59, job: 'blue-collar', marital: 'married' },
                { age: 35, job: 'management', marital: 'single' },
                { age: 57, job: 'self-employed', marital: 'married' },
                { age: 28, job: 'blue-collar', marital: 'married' },
                { age: 30, job: 'blue-collar', marital: 'single' },
            ];
            const schema = [
                { name: 'age', type: 'measure' },
                { name: 'job', type: 'dimension' },
                { name: 'marital', type: 'dimension' }
            ];
            const dataModel = new DataModel(data, schema);

            const sortedDm = dataModel.sort([
                ['age', 'desc'],
                ['job'],
            ]);
            const expData = {
                data: [
                    [59, 'blue-collar', 'married'],
                    [57, 'self-employed', 'married'],
                    [35, 'management', 'single'],
                    [30, 'blue-collar', 'single'],
                    [30, 'management', 'married'],
                    [28, 'blue-collar', 'married']
                ],
                schema,
                uids: [0, 1, 2, 3, 4, 5]
            };
            expect(sortedDm._sortingDetails).to.deep.equal([
                ['age', 'desc'],
                ['job'],
            ]);
            expect(sortedDm.getData()).to.deep.equal(expData);
        });

        it('should perform sort with string data', () => {
            const data = [
                { Name: 'Shubham', Age: '22', Gender: 'Male', Location: 'Kolkata' },
                { Name: 'Teen', Age: '14', Gender: 'Female', Location: 'Kolkata' },
                { Name: 'Manoj', Age: '52', Gender: 'Male', Location: 'Kolkata' },
                { Name: 'Usha', Age: '49', Gender: 'Female', Location: 'Kolkata' },
                { Name: 'Akash', Age: '28', Gender: 'Male', Location: 'Kolkata' },
                { Name: 'Shyam', Age: '74', Gender: 'Male', Location: 'Kolkata' },
                { Name: 'Baby', Age: '3', Gender: 'Male', Location: 'Kolkata' },
            ];
            const schema = [
                { name: 'Name', type: 'dimension' },
                { name: 'Age', type: 'measure' },
                { name: 'Gender', type: 'dimension' },
                { name: 'Location', type: 'dimension' },
            ];
            const dataModel = new DataModel(data, schema);

            const sortedDm = dataModel.sort([
                ['Gender', 'desc'],
            ]);
            const expData = {
                schema: [
                    { name: 'Name', type: 'dimension' },
                    { name: 'Age', type: 'measure' },
                    { name: 'Gender', type: 'dimension' },
                    { name: 'Location', type: 'dimension' },
                ],
                data: [
                    ['Shubham', 22, 'Male', 'Kolkata'],
                    ['Manoj', 52, 'Male', 'Kolkata'],
                    ['Akash', 28, 'Male', 'Kolkata'],
                    ['Shyam', 74, 'Male', 'Kolkata'],
                    ['Baby', 3, 'Male', 'Kolkata'],
                    ['Teen', 14, 'Female', 'Kolkata'],
                    ['Usha', 49, 'Female', 'Kolkata'],
                ],
                uids: [0, 1, 2, 3, 4, 5, 6]
            };
            expect(sortedDm.getData()).to.deep.equal(expData);
        });

        it('should perform sort with sorting function', () => {
            const data = [
                { age: 30, job: 'management', marital: 'married' },
                { age: 59, job: 'blue-collar', marital: 'married' },
                { age: 35, job: 'management', marital: 'single' },
                { age: 57, job: 'self-employed', marital: 'married' },
                { age: 28, job: 'blue-collar', marital: 'married' },
                { age: 30, job: 'blue-collar', marital: 'single' },
            ];
            const schema = [
                { name: 'age', type: 'measure' },
                { name: 'job', type: 'dimension' },
                { name: 'marital', type: 'dimension' }
            ];
            const dataModel = new DataModel(data, schema);

            const sortedDm = dataModel.sort([
                ['age', (a, b) => b - a],
                ['job'],
            ]);
            const expData = {
                data: [
                    [59, 'blue-collar', 'married'],
                    [57, 'self-employed', 'married'],
                    [35, 'management', 'single'],
                    [30, 'blue-collar', 'single'],
                    [30, 'management', 'married'],
                    [28, 'blue-collar', 'married']
                ],
                schema,
                uids: [0, 1, 2, 3, 4, 5]
            };
            expect(sortedDm.getData()).to.deep.equal(expData);
        });

        it('should perform sort by another field', () => {
            const data = [
                { performance: 'low', horsepower: 100, weight: 2 },
                { performance: 'high', horsepower: 400, weight: 1 },
                { performance: 'medium', horsepower: 20, weight: 1.5 },
                { performance: 'low', horsepower: 50, weight: 4 },
                { performance: 'medium', horsepower: 660, weight: 5 },
                { performance: 'decent', horsepower: 30, weight: 0.5 }
            ];
            const schema = [
                { name: 'performance', type: 'dimension' },
                { name: 'horsepower', type: 'measure' },
                { name: 'weight', type: 'measure' }
            ];
            const dataModel = new DataModel(data, schema);

            let sortingDetails = [
                ['performance', ['horsepower', (a, b) => avg(...a.horsepower) - avg(...b.horsepower)]],
                ['horsepower', 'asc']
            ];
            let sortedDm = dataModel.sort(sortingDetails);
            let expected = {
                schema: [
                    { name: 'performance', type: 'dimension' },
                    { name: 'horsepower', type: 'measure' },
                    { name: 'weight', type: 'measure' }
                ],
                data: [
                    ['decent', 30, 0.5],
                    ['low', 50, 4],
                    ['low', 100, 2],
                    ['medium', 20, 1.5],
                    ['medium', 660, 5],
                    ['high', 400, 1]
                ],
                uids: [0, 1, 2, 3, 4, 5]
            };
            expect(sortedDm.getData()).to.deep.equal(expected);

            sortingDetails = [
                ['performance', ['horsepower', 'weight',
                    (a, b) => (avg(...a.horsepower) * avg(...a.weight)) - (avg(...b.horsepower) * avg(...b.weight))]],
                ['horsepower', 'desc']
            ];
            sortedDm = dataModel.sort(sortingDetails);
            expected = {
                schema: [
                    { name: 'performance', type: 'dimension' },
                    { name: 'horsepower', type: 'measure' },
                    { name: 'weight', type: 'measure' }
                ],
                data: [
                    ['decent', 30, 0.5],
                    ['low', 100, 2],
                    ['low', 50, 4],
                    ['high', 400, 1],
                    ['medium', 660, 5],
                    ['medium', 20, 1.5]
                ],
                uids: [0, 1, 2, 3, 4, 5]
            };
            expect(sortedDm.getData()).to.deep.equal(expected);
        });
    });

    describe('#join', () => {
        it('should perform join properly', () => {
            const data1 = [
                { profit: 10, sales: 20, city: 'a' },
                { profit: 15, sales: 25, city: 'b' },
            ];
            const schema1 = [
                { name: 'profit', type: 'measure' },
                { name: 'sales', type: 'measure' },
                { name: 'city', type: 'dimension' },
            ];
            const data2 = [
                { population: 200, city: 'a' },
                { population: 250, city: 'b' },
            ];
            const schema2 = [
                { name: 'population', type: 'measure' },
                { name: 'city', type: 'dimension' },
            ];
            const dataModel1 = new DataModel(data1, schema1, { name: 'ModelA' });
            const dataModel2 = new DataModel(data2, schema2, { name: 'ModelB' });

            expect((dataModel1.join(dataModel2)).getData()).to.deep.equal({
                schema: [
                    { name: 'profit', type: 'measure' },
                    { name: 'sales', type: 'measure' },
                    { name: 'ModelA.city', type: 'dimension' },
                    { name: 'population', type: 'measure' },
                    { name: 'ModelB.city', type: 'dimension' },
                ],
                data: [
                    [10, 20, 'a', 200, 'a'],
                    [10, 20, 'a', 250, 'b'],
                    [15, 25, 'b', 200, 'a'],
                    [15, 25, 'b', 250, 'b'],
                ],
                uids: [0, 1, 2, 3]
            });
            expect((dataModel1.join(dataModel2, obj => obj.ModelA.city === obj.ModelB.city))
                            .getData()).to.deep.equal({
                                schema: [
                        { name: 'profit', type: 'measure' },
                        { name: 'sales', type: 'measure' },
                        { name: 'ModelA.city', type: 'dimension' },
                        { name: 'population', type: 'measure' },
                        { name: 'ModelB.city', type: 'dimension' },
                                ],
                                data: [
                        [10, 20, 'a', 200, 'a'],
                        [15, 25, 'b', 250, 'b'],
                                ],
                                uids: [0, 1]
                            });
            expect((dataModel1.naturalJoin(dataModel2)).getData()).to.deep.equal({
                schema: [
                    { name: 'profit', type: 'measure' },
                    { name: 'sales', type: 'measure' },
                    { name: 'city', type: 'dimension' },
                    { name: 'population', type: 'measure' },
                ],
                data: [
                    [10, 20, 'a', 200],
                    [15, 25, 'b', 250],
                ],
                uids: [0, 1]
            });
        });

        it('should perform natural join correctly', () => {
            const data1 = [
                { profit: 10, sales: 20, city: 'a', type: 'aa' },
                { profit: 15, sales: 25, city: 'b', type: 'aa' },
                { profit: 15, sales: 25, city: 'c', type: 'aa' },
            ];
            const schema1 = [
                { name: 'profit', type: 'measure' },
                { name: 'sales', type: 'measure' },
                { name: 'city', type: 'dimension' },
                { name: 'type', type: 'dimension' },
            ];
            const data2 = [
                { population: 200, city: 'a', type: 'aa' },
                { population: 250, city: 'b', type: 'aa' },
            ];
            const schema2 = [
                { name: 'population', type: 'measure' },
                { name: 'city', type: 'dimension' },
                { name: 'type', type: 'dimension' },
            ];
            const dataModel1 = new DataModel(data1, schema1, { name: 'ModelA' });
            const dataModel2 = new DataModel(data2, schema2, { name: 'ModelB' });

            const k = dataModel1.naturalJoin(dataModel2);
            expect(k.getData()).to.deep.equal({
                schema: [
                    { name: 'profit', type: 'measure' },
                    { name: 'sales', type: 'measure' },
                    { name: 'city', type: 'dimension' },
                    { name: 'type', type: 'dimension' },
                    { name: 'population', type: 'measure' },
                ],
                data: [
                        [10, 20, 'a', 'aa', 200],
                        [15, 25, 'b', 'aa', 250]
                ],
                uids: [0, 1]
            });
        });

        it('should perform natural join correctly #1', () => {
            const data1 = [
                { profit: 10, sales: 20, city: 'a', type: 'aa' },
                { profit: 15, sales: 25, city: 'b', type: 'aa' },
                { profit: 15, sales: 25, city: 'c', type: 'aa' },
            ];
            const schema1 = [
                { name: 'profit', type: 'measure' },
                { name: 'sales', type: 'measure' },
                { name: 'city', type: 'dimension' },
                { name: 'type', type: 'dimension' },
            ];
            const data2 = [
                { population: 200, city: 'a', type: 'aa' },
                { population: 250, city: 'b', type: 'kk' },
            ];
            const schema2 = [
                { name: 'population', type: 'measure' },
                { name: 'city', type: 'dimension' },
                { name: 'type', type: 'dimension' },
            ];
            const dataModel1 = new DataModel(data1, schema1, { name: 'ModelA' });
            const dataModel2 = new DataModel(data2, schema2, { name: 'ModelB' });

            const k = dataModel1.naturalJoin(dataModel2);
            expect(k.getData()).to.deep.equal({
                schema: [
                    { name: 'profit', type: 'measure' },
                    { name: 'sales', type: 'measure' },
                    { name: 'city', type: 'dimension' },
                    { name: 'type', type: 'dimension' },
                    { name: 'population', type: 'measure' },
                ],
                data: [
                        [10, 20, 'a', 'aa', 200]
                ],
                uids: [0]
            });
        });
    });

    describe('#difference & #union', () => {
        it('should perform the difference and union properly', () => {
            const data1 = [
                { profit: 10, sales: 20, city: 'a', state: 'aa' },
                { profit: 15, sales: 25, city: 'b', state: 'bb' },
                { profit: 10, sales: 20, city: 'a', state: 'ab' },
                { profit: 15, sales: 25, city: 'b', state: 'ba' },
            ];
            const schema1 = [
                { name: 'profit', type: 'measure' },
                { name: 'sales', type: 'measure' },
                { name: 'city', type: 'dimension' },
                { name: 'state', type: 'dimension' },
            ];
            const data2 = [
                { profit: 10, sales: 20, city: 'a', state: 'ab' },
                { profit: 15, sales: 25, city: 'b', state: 'ba' },
                { profit: 10, sales: 20, city: 'a', state: 'aba' },
                { profit: 15, sales: 25, city: 'b', state: 'baa' },
            ];
            const schema2 = [
                { name: 'profit', type: 'measure' },
                { name: 'sales', type: 'measure' },
                { name: 'city', type: 'dimension' },
                { name: 'state', type: 'dimension' },
            ];
            const dataModel1 = (new DataModel(data1, schema1, 'ModelA')).project(['city', 'state']);
            const dataModel2 = (new DataModel(data2, schema2, 'ModelB')).project(['city', 'state']);

            expect(dataModel1.difference(dataModel2).getData()).to.deep.equal({
                schema: [
                    { name: 'city', type: 'dimension' },
                    { name: 'state', type: 'dimension' },
                ],
                data: [
                    ['a', 'aa'],
                    ['b', 'bb'],
                ],
                uids: [0, 1]
            });
            expect(dataModel1.union(dataModel2).getData()).to.deep.equal({
                schema: [
                    { name: 'city', type: 'dimension' },
                    { name: 'state', type: 'dimension' },
                ],
                data: [
                    ['a', 'aa'],
                    ['b', 'bb'],
                    ['a', 'ab'],
                    ['b', 'ba'],
                    ['a', 'aba'],
                    ['b', 'baa'],
                ],
                uids: [0, 1, 2, 3, 4, 5]
            });
        });
    });

    describe('#caclulatedVariable', () => {
        it('should create a calculated measure', () => {
            const data1 = [
                { profit: 10, sales: 20, city: 'a', state: 'aa' },
                { profit: 15, sales: 25, city: 'b', state: 'bb' },
                { profit: 10, sales: 20, city: 'a', state: 'ab' },
                { profit: 15, sales: 25, city: 'b', state: 'ba' },
            ];
            const schema1 = [
                { name: 'profit', type: 'measure' },
                { name: 'sales', type: 'measure' },
                { name: 'city', type: 'dimension' },
                { name: 'state', type: 'dimension' },
            ];
            const dataModel = new DataModel(data1, schema1, 'Yo');

            const next = dataModel.project(['profit', 'sales']).select(f => +f.profit > 10);
            const child = next.calculateVariable({
                name: 'Efficiency',
                type: 'measure'
            }, ['profit', 'sales', (profit, sales) => profit / sales]);

            const childData = child.getData().data;
            const efficiency = childData[0][childData[0].length - 1];
            expect(
                efficiency
            ).to.equal(0.6);

            expect(
                () => {
                    child.calculateVariable({
                        name: 'Efficiency'
                    }, ['profit', 'sales', (profit, sales) => profit / sales]);
                }
            ).to.throw('Efficiency field already exists in model.');
        });

        it('should create a calculated dimension', () => {
            const data1 = [
                { profit: 10, sales: 20, first: 'Hey', second: 'Jude' },
                { profit: 15, sales: 25, first: 'Norwegian', second: 'Wood' },
                { profit: 10, sales: 20, first: 'Here comes', second: 'the sun' },
                { profit: 15, sales: 25, first: 'White', second: 'walls' },
            ];
            const schema1 = [
                { name: 'profit', type: 'measure' },
                { name: 'sales', type: 'measure' },
                { name: 'first', type: 'dimension' },
                { name: 'second', type: 'dimension' },
            ];
            const dataModel = new DataModel(data1, schema1, 'Yo');
            const newDm = dataModel.calculateVariable({
                name: 'Song',
                type: 'dimension'
            }, ['first', 'second', (first, second) =>
                `${first} ${second}`
            ]);
            const songData = newDm.project(['Song']);
            expect(
                songData.getData().data[0][0]
            ).to.equal('Hey Jude');
        });

        it('should return correct value from the callback funciton', () => {
            const data = [
                { a: 10, aaa: 20, aaaa: 'd' },
                { a: 15, aaa: 25, aaaa: 'demo' },
            ];
            const schema = [
                { name: 'a', type: 'measure' },
                { name: 'aaa', type: 'measure' },
                { name: 'aaaa', type: 'dimension' },
            ];
            const dataModel = new DataModel(data, schema);

            let callback2 = function (a, aaa, ...arg) {
                return a + aaa + arg[0];
            };
            const child = dataModel.calculateVariable({
                name: 'bbbb',
                type: 'measure'
            }, ['a', 'aaa', callback2]);

            const childData = child.getData().data;
            const efficiency = childData[1][childData[1].length - 1];
            expect(efficiency).to.equal(41);
        });
    });

    describe('#propagate', () => {
        it('should propagate variables through out the dag', () => {
            const data1 = [
                { profit: 10, sales: 20, first: 'Hey', second: 'Jude' },
                { profit: 15, sales: 25, first: 'Norwegian', second: 'Wood' },
                { profit: 10, sales: 20, first: 'Here comes', second: 'the sun' },
                { profit: 15, sales: 25, first: 'White', second: 'walls' },
            ];
            const schema1 = [
                { name: 'profit', type: 'measure' },
                { name: 'sales', type: 'measure' },
                { name: 'first', type: 'dimension' },
                { name: 'second', type: 'dimension' },
            ];

            let projetionFlag = false;
            let selectionFlag = false;
            let groupByFlag = false;
            const dataModel = new DataModel(data1, schema1, 'Yo');
            const projected = dataModel.project(['profit']);
            const selected = dataModel.select(fields => fields.profit.valueOf() > 10);
            const grouped = dataModel.groupBy(['first']);
            // setup listeners
            projected.on('propagation', () => {
                projetionFlag = true;
            });
            selected.on('propagation', () => {
                selectionFlag = true;
            });
            grouped.on('propagation', () => {
                groupByFlag = true;
            });

            const identifiers = assembleModelFromIdentifiers(dataModel, [
                ['first', 'second'],
                ['Hey', 'Jude']
            ]);
            dataModel.propagate(identifiers, {
                action: 'reaction'
            });
            expect(
                projetionFlag && selectionFlag && groupByFlag
            ).to.be.true;
        });
    });


    describe('#bin', () => {
        it('should bin the data when buckets are given', () => {
            const data1 = [
                { profit: 10, sales: 20, first: 'Hey', second: 'Jude' },
                { profit: 15, sales: 25, first: 'Norwegian', second: 'Wood' },
                { profit: 15, sales: 25, first: 'Norwegian', second: 'Wood' },
                { profit: 15, sales: 25, first: 'Norwegian', second: 'Wood' },
                { profit: 10, sales: 20, first: 'Here comes', second: 'the sun' },
                { profit: 18, sales: 25, first: 'White', second: 'walls' },
                { profit: 21, sales: 25, first: 'White', second: 'walls' },
                { profit: 18, sales: 25, first: 'White', second: 'walls' },
                { profit: 21, sales: 25, first: 'White', second: 'walls' }
            ];
            const schema1 = [
                { name: 'profit', type: 'measure' },
                { name: 'sales', type: 'measure' },
                { name: 'first', type: 'dimension' },
                { name: 'second', type: 'dimension' },
            ];
            const dataModel = new DataModel(data1, schema1, 'Yo');

            const buckets = {
                start: 0,
                end: [5, 11, 16, 20, 30]
            };
            const bin = dataModel.bin('profit', { buckets, name: 'sumField' });
            let fieldData = bin.getFieldspace().fields.find(field => field.name === 'sumField').data;
            let expectedData = ['5-11', '11-16', '11-16', '11-16', '5-11', '16-20', '20-30', '16-20', '20-30'];
            expect(fieldData).to.deep.equal(expectedData);
        });
        it('should bin the data when buckets are given but data value having lesser and greater value', () => {
            const data1 = [
                { profit: 10, sales: 20, first: 'Hey', second: 'Jude' },
                { profit: 5, sales: 25, first: 'Norwegian', second: 'Wood' },
                { profit: 5, sales: 25, first: 'Norwegian', second: 'Wood' },
                { profit: 15, sales: 25, first: 'Norwegian', second: 'Wood' },
                { profit: 10, sales: 20, first: 'Here comes', second: 'the sun' },
                { profit: 18, sales: 25, first: 'White', second: 'walls' },
                { profit: 21, sales: 25, first: 'White', second: 'walls' },
                { profit: 18, sales: 25, first: 'White', second: 'walls' },
                { profit: 32, sales: 25, first: 'White', second: 'walls' }
            ];
            const schema1 = [
                { name: 'profit', type: 'measure' },
                { name: 'sales', type: 'measure' },
                { name: 'first', type: 'dimension' },
                { name: 'second', type: 'dimension' },
            ];
            const dataModel = new DataModel(data1, schema1, 'Yo');

            const buckets = {
                start: 10,
                end: [11, 16, 20, 30]
            };
            const bin = dataModel.bin('profit', { buckets, name: 'sumField' });
            let fieldData = bin.getFieldspace().fields.find(field => field.name === 'sumField').data;
            let expectedData = ['10-11', '5-10', '5-10', '11-16', '10-11', '16-20', '20-30', '16-20', '30-32'];
            expect(fieldData).to.deep.equal(expectedData);
            expect(bin.getFieldspace().fields.find(field => field.name === 'sumField').bins().mid)
                            .to.deep.equal([7.5, 10.5, 13.5, 18, 25, 31]);
            expect(bin.getFieldspace().fields.find(field => field.name === 'sumField').bins().range)
                            .to.deep.equal([5, 10, 11, 16, 20, 30, 32]);
        });
        it('should bin data when num of bins given', () => {
            const data1 = [
                { profit: 10, sales: 20, first: 'Hey', second: 'Jude' },
                { profit: 15, sales: 25, first: 'Norwegian', second: 'Wood' },
                { profit: 15, sales: 25, first: 'Norwegian', second: 'Wood' },
                { profit: 15, sales: 25, first: 'Norwegian', second: 'Wood' },
                { profit: 10, sales: 20, first: 'Here comes', second: 'the sun' },
                { profit: 18, sales: 25, first: 'White', second: 'walls' },
                { profit: 21, sales: 25, first: 'White', second: 'walls' },
                { profit: 18, sales: 25, first: 'White', second: 'walls' },
                { profit: 21, sales: 25, first: 'White', second: 'walls' },
                { profit: 21, sales: 25, first: 'White', second: 'walls' }
            ];
            const schema1 = [
                { name: 'profit', type: 'measure' },
                { name: 'sales', type: 'measure' },
                { name: 'first', type: 'dimension' },
                { name: 'second', type: 'dimension' },
            ];
            const dataModel = new DataModel(data1, schema1, 'Yo');
            const bin = dataModel.bin('profit', { numOfBins: 2, name: 'sumField' });
            let fieldData = bin.getFieldspace().fields.find(field => field.name === 'sumField').data;
            let expData = ['10-16', '10-16', '10-16', '10-16', '10-16', '16-22', '16-22', '16-22', '16-22', '16-22'];
            expect(fieldData).to.deep.equal(expData);
        });
        it('should bin data when binSize is given', () => {
            const data1 = [
                { profit: 10, sales: 20, first: 'Hey', second: 'Jude' },
                { profit: 15, sales: 25, first: 'Norwegian', second: 'Wood' },
                { profit: 15, sales: 25, first: 'Norwegian', second: 'Wood' },
                { profit: 15, sales: 25, first: 'Norwegian', second: 'Wood' },
                { profit: 10, sales: 20, first: 'Here comes', second: 'the sun' },
                { profit: 18, sales: 25, first: 'White', second: 'walls' },
                { profit: 21, sales: 25, first: 'White', second: 'walls' },
                { profit: 18, sales: 25, first: 'White', second: 'walls' },
                { profit: 21, sales: 25, first: 'White', second: 'walls' },
                { profit: 21, sales: 25, first: 'White', second: 'walls' }
            ];
            const schema1 = [
                { name: 'profit', type: 'measure' },
                { name: 'sales', type: 'measure' },
                { name: 'first', type: 'dimension' },
                { name: 'second', type: 'dimension' },
            ];
            const dataModel = new DataModel(data1, schema1, 'Yo');
            const bin = dataModel.bin('profit', { binSize: 5, name: 'sumField' });
            let fieldData = bin.getFieldspace().fields.find(field => field.name === 'sumField').data;
            let expData = ['10-15', '15-20', '15-20', '15-20', '10-15', '15-20', '20-25', '15-20', '20-25', '20-25'];
            expect(expData).to.deep.equal(fieldData);
            expect(bin.getFieldspace().fields.find(field => field.name === 'sumField').bins().mid)
                            .to.deep.equal([12.5, 17.5, 22.5]);
            expect(bin.getFieldspace().fields.find(field => field.name === 'sumField').bins().range)
                            .to.deep.equal([10, 15, 20, 25]);
        });
        // it('should return correct bins when binned after a selct operation', () => {
        //     const data1 = [
        //         { profit: 10, sales: 20, first: 'Hey', second: 'Jude' },
        //         { profit: 15, sales: 25, first: 'Norwegian', second: 'Wood' },
        //         { profit: 15, sales: 25, first: 'Norwegian', second: 'Wood' },
        //         { profit: 15, sales: 25, first: 'Norwegian', second: 'Wood' },
        //         { profit: 10, sales: 20, first: 'Here comes', second: 'the sun' },
        //         { profit: 18, sales: 25, first: 'White', second: 'walls' },
        //         { profit: 21, sales: 25, first: 'White', second: 'walls' },
        //         { profit: 18, sales: 25, first: 'White', second: 'walls' },
        //         { profit: 21, sales: 25, first: 'White', second: 'walls' },
        //         { profit: 21, sales: 25, first: 'White', second: 'walls' }
        //     ];
        //     const schema1 = [
        //         { name: 'profit', type: 'measure' },
        //         { name: 'sales', type: 'measure' },
        //         { name: 'first', type: 'dimension' },
        //         { name: 'second', type: 'dimension' },
        //     ];
        //     const dataModel = new DataModel(data1, schema1, 'Yo');

        //     const dm2 = dataModel.select(feild => feild.sales.value === 25);
        //     const bin = dm2.bin('profit', { binSize: 3, name: 'sumField' }, x => x[0]);
        //     let fieldData = bin.getFieldspace().fields.find(field => field.name === 'sumField').data;
        //     let profitData = bin.getFieldspace().fields.find(field => field.name === 'profit').data;
        //     expect(fieldData).to.deep.equal(profitData);
        // });
    });

    context('Aggregation function context', () => {
        const data1 = [
            { profit: 10, sales: 20, first: 'Hey', second: 'Jude' },
            { profit: 20, sales: 25, first: 'Hey', second: 'Wood' },
            { profit: 10, sales: 20, first: 'White', second: 'the sun' },
            { profit: 15, sales: 25, first: 'White', second: 'walls' },
        ];
        const schema1 = [
            {
                name: 'profit',
                type: 'measure',
                defAggFn: 'avg'
            },
            {
                name: 'sales',
                type: 'measure'
            },
            {
                name: 'first',
                type: 'dimension'
            },
            {
                name: 'second',
                type: 'dimension'
            },
        ];
        const dataModel = new DataModel(data1, schema1);

        describe('#groupBy', () => {
            it('should group properly if def aggregation function is first', () => {
                const grouped = dataModel.groupBy(['first']);
                const childData = grouped.getData().data;
                expect(childData[0][0]).to.equal(15);
            });
            it('should group properly if def aggregation function is sum', () => {
                const grouped = dataModel.groupBy(['first']);
                const childData = grouped.getData().data;
                expect(childData[0][1]).to.equal(45);
            });
            it('should group properly if def aggregation function is min', () => {
                DataModel.Reducers.defaultReducer('min');
                const grouped = dataModel.groupBy(['first']);
                const childData = grouped.getData().data;
                expect(childData[0][1]).to.equal(20);
            });
            it('should group properly if def aggregation function is changed from first to min', () => {
                DataModel.Reducers.defaultReducer('min');
                const grouped = dataModel.groupBy(['first']);
                const childData = grouped.getData().data;
                expect(childData[0][1]).to.equal(20);
            });
            it('should group properly if def aggregation function is changed from min to first', () => {
                DataModel.Reducers.defaultReducer('min');
                const grouped = dataModel.groupBy(['first'], {
                    sales: 'sum'
                });
                const childData = grouped.getData().data;
                expect(childData[0][1]).to.equal(45);
            });
            it('should Register a global aggregation', () => {
                DataModel.Reducers.register('mySum', (arr) => {
                    const isNestedArray = arr[0] instanceof Array;
                    let sum = arr.reduce((carry, a) => {
                        if (isNestedArray) {
                            return carry.map((x, i) => x + a[i]);
                        }
                        return carry + a;
                    }, isNestedArray ? Array(...Array(arr[0].length)).map(() => 0) : 0);
                    return sum * 100;
                });
                const grouped = dataModel.groupBy(['first'], {
                    sales: 'mySum'
                });
                const childData = grouped.getData().data;
                expect(childData[0][1]).to.equal(4500);
            });
            it('should reset default fnc', () => {
                DataModel.Reducers.defaultReducer('sum');
                expect(DataModel.Reducers.defaultReducer()).to.equal(DataModel.Reducers.resolve('sum'));
            });
        });
    });


    context('Checking api for updating parent child relationship', () => {
        const data1 = [
            { profit: 10, sales: 20, first: 'Hey', second: 'Jude' },
            { profit: 20, sales: 25, first: 'Hey', second: 'Wood' },
            { profit: 10, sales: 20, first: 'White', second: 'the sun' },
            { profit: 15, sales: 25, first: 'White', second: 'walls' },
        ];
        const schema1 = [
            {
                name: 'profit',
                type: 'measure',
                defAggFn: 'avg'
            },
            {
                name: 'sales',
                type: 'measure'
            },
            {
                name: 'first',
                type: 'dimension'
            },
            {
                name: 'second',
                type: 'dimension'
            },
        ];
        const dataModel = new DataModel(data1, schema1);
        describe('#dispose', () => {
            it('Should remove child on calling dispose', () => {
                let dm2 = dataModel.select(fields => fields.profit.value < 150);
                expect(dataModel._children.length).to.equal(1);
                dm2.dispose();
                expect(dataModel._children.length).to.equal(0);
            });
        });

        describe('#addParent', () => {
            it('Adding parent should save criteria in parent', () => {
                let dm2 = dataModel.select(fields => fields.profit.value < 150);
                let dm3 = dm2.groupBy(['sales'], {
                    profit: null
                });
                let dm4 = dm3.project(['sales']);
                let data = dm4.getData();
                let projFields = ['first'];
                let projectConfig = {};
                let normalizedprojFields = [];
                let criteriaQueue = [
                    {
                        op: 'select',
                        meta: '',
                        criteria: fields => fields.profit.value < 150
                    },
                    {
                        op: 'project',
                        meta: { projFields, projectConfig, normalizedprojFields },
                        criteria: null
                    }
                ];
                dm3.dispose();
                dm4.addParent(dm2, criteriaQueue);
                expect(dm2._children.length).to.equal(1);
                expect(dm2._children[0].getData()).to.deep.equal(data);
                expect(dm4._parent).to.equal(dm2);
            });
        });
    });

    context('Statistics function test', () => {
        describe('#sum', () => {
            it('should return sum for 1D array', () => {
                expect(DataModel.Stats.sum([10, 12, 17])).to.equal(39);
            });
        });
        describe('#sum', () => {
            it('should return sum for 2D Array', () => {
                expect(DataModel.Stats.sum([[10, 20], [12, 22], [27, 17]])).to.deep.equal([49, 59]);
            });
        });
        describe('#svg', () => {
            it('should return average for 1D Array', () => {
                expect(DataModel.Stats.avg([10, 12, 17])).to.equal(39 / 3);
            });
        });
    });
});
