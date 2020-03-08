import Database from '../src/database';
import { TasksQueue } from '../src/app';

const database = new Database('test_tasks_queue_db.json');
const tasksQueue = new TasksQueue(database);
const post = {
    originId: 1234,
    originDateTime: 100000,
    text: 'Test Post\nTest Post Description.'
};

test('tasks queue add task', () => {
    tasksQueue.push(post);
});

test('tasks queue has task', () => {
    expect(tasksQueue.has(post)).toBe(true);
});

test('tasks queue pop planned and failed tasks', () => {
    expect(tasksQueue.popPlannedAndFailed()).toHaveLength(1);
});