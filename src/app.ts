require('dotenv').config();
import SitcDiscord from './discord';
import Database from './database';
import Vkontakte from './vkontakte';
import Telegram from './telegram';
import Github from './github';
import express from "express";
import config from './config';
import fs from 'fs';

export interface Post {
    originId: number;
    originDateTime: number;
    text: string;
    articleUrl?: string;
    linkUrl?: string;
    photoUrl?: string;
    podcastUrl?: string;
    videoUrl?: string;
    audioUrl?: string;
    documentUrl?: string;
}

enum TaskStatus {
    Planned, Failed, Published
}

export class Task {
    post: Post;
    telegramStatus: TaskStatus;
    discordStatus: TaskStatus;
    githubStatus: TaskStatus;

    constructor(post: Post) {
        this.post = post;
        this.telegramStatus = TaskStatus.Planned;
        this.discordStatus = TaskStatus.Planned;
        this.githubStatus = TaskStatus.Planned;
    }
}

export class TasksQueue {
    private readonly database: Database;
    private readonly collectionName = 'tasks';

    constructor(database: Database) {
        this.database = database;
    }

    has(post: Post): boolean {
        return this.database.findById(this.collectionName, post.originId) !== undefined;
    }

    push(post: Post) {
        this.database.createNew(this.collectionName, post.originId, new Task(post));
    }

    popPlannedAndFailed() {
        return this.database.findAll(this.collectionName)
            .filter(
                (task: Task) =>
                    task.telegramStatus != TaskStatus.Published ||
                    task.discordStatus != TaskStatus.Published ||
                    task.githubStatus != TaskStatus.Published
            );
    }

}

class App {
    run() {
        const discord = new SitcDiscord(config.DISCORD_ADMIN_ROLE, config.DISCORD_API_KEY, config.DISCORD_CHANNEL_NAME);
        const database = new Database('db.json');
        const tasksQueue = new TasksQueue(database);
        const vkontakte = new Vkontakte(config.VK_API_KEY, config.VK_GROUP_ID, config.VK_CHECK_RATE);
        const github = new Github(config.GITHUB_USERNAME, config.GITHUB_API_KEY, config.GITHUB_REPO_NAME, config.text.github.TEMPLATE);
        const telegram = new Telegram(config.TELEGRAM_API_KEY, config.TELEGRAM_CHANNEL_ID);
        const app = express();
        app.get('/', (req, res) => res.send('Samara Sila'));
        app.get('/queue', (req, res) => res.send(JSON.stringify(tasksQueue.popPlannedAndFailed())));
        app.get('/vk/posts', (req, res) => res.send(JSON.stringify(vkontakte.getPosts(
            req.query['owner']
        ))));
        app.listen(config.PORT, () => console.log(`SITC Admin app listening on port ${config.PORT}`));
        return app;
    }
}

export default App;