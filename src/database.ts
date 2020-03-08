import low = require('lowdb');
import FileSync = require('lowdb/adapters/FileSync');
import { Task } from './app';
import request = require('request');

interface DBScheme {
    tasks: {
        [key: string]: Task;
    };
    vk: { lastCheckTime: number };
}

class Database {
    private readonly backend: any;

    constructor(filename: string) {
        this.backend = low(new FileSync<DBScheme>(filename.toString()));
        this.backend.defaults({
            tasks: {},
            vk: { lastCheckTime: Math.round(+new Date() / 1000) }
        }).write();
    }

    findById(collectionName: string, id: number) {
        return this.findAttributeValue(collectionName, id.toString());
    }

    createNew(collectionName: string, id: number, value: any) {
        this.setAttributeValue(collectionName, id.toString(), value);
    }

    findAll(collectionName: string) {
        return Object.values(this.backend.get(collectionName).value());
    }

    findAttributeValue(collectionName: string, attributeName: string) {
        return this.backend.get(`${collectionName}.${attributeName}`).value();
    }

    setAttributeValue(objectName: string, attributeName: string, value: string) {
        this.backend.set(`${objectName}.${attributeName}`, value).write();
    }
}

export default Database;