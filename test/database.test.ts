import Database from '../src/database';
import { Post, TasksQueue } from '../src/app';

const database = new Database('test_database_db.json');

test('database set attribute value', () => {
    database.setAttributeValue('object', 'attribute', 'value');
});

test('database find attribute value', () => {
    expect(database.findAttributeValue('object', 'attribute')).toEqual('value');
});

test('database creaet new', () => {
    database.createNew('tasks', 1234, 'testObject');
});

test('database find by id', () => {
    expect(database.findById('tasks', 1234)).toBe('testObject')
});
