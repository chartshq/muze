import DataModel from './datamodel';
import * as Operators from './operator';
import * as Stats from './stats';
import pkg from '../package.json';

DataModel.Operators = Operators;
DataModel.Stats = Stats;
DataModel.version = pkg.version;

export default DataModel;
