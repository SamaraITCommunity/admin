import request = require('request');
import queryString = require('query-string');
import { Post } from './app';

const API_GATEWAY = 'https://api.telegram.org';

class Telegram {
    private readonly token: string;
    private readonly channelId: string;

    constructor(token: string, channelId: string) {
        this.token = token;
        channelId = '@' + channelId.replace('@', '');
        this.channelId = channelId;
    }

    private call(method: string, data: any) {
        return new Promise((resolve, reject) => {
            request(`${API_GATEWAY}/bot${this.token}/${method}?${queryString.stringify(data)}`, { json: true }, (err, res, body: TelegramResponse) => {
                console.log(`Telegram call result: ${res}`);
                if (!res) reject('Не достучались до Telegram. Скорее-всего, Ваш провайдер их блокирует');
                else if (err) reject(`Ошибка при обращении к Telegram API ${err}`);
                else if (!body) reject('Не достучались до Telegram. Скорее-всего, Ваш провайдер их блокирует');
                else if (!body.ok) reject('Body not ok ${body.description}');
                else resolve(body.result);
            });
        });
    }

    sendPost(post: Post) {
        //TODO: Compose one full message.
        this.sendMessage(post.text);
        if (post.linkUrl)
            this.sendMessage(`[Подробнее по ссылкe](${post.linkUrl})`);
        if (post.articleUrl)
            this.sendMessage(`[Новая статья в группе.](${post.articleUrl})`);
        if (post.photoUrl)
            this.sendPhoto(post.photoUrl);
        if (post.videoUrl)
            this.sendMessage(post.videoUrl);
        if (post.podcastUrl)
            this.sendMessage(`Подкаст: ${post.podcastUrl}`);
        if (post.audioUrl)
            this.sendAudio(post.audioUrl);
        if (post.documentUrl)
            this.sendDocument(post.documentUrl);
    }

    sendMessage(text: string) {
        return new Promise((resolve, reject) => {
            const hashTags = text.match(new RegExp('(?:\s|^)?#[A-Za-z0-9\-\.\_]+(?:\s|$)', 'gi')) || [];
            const fixedHashTags = hashTags
                .map(tag => tag
                    .replace(new RegExp('_', 'g'), '\\_')
                    .replace(new RegExp('[*]', 'g'), '\\*')
                );
            this.call('sendMessage', {
                chatId: this.channelId, text: text
                    .split(' ')
                    .map(word => { if (hashTags.includes(word)) return fixedHashTags[hashTags.indexOf(word)]; else return word; })
                    .join(' '), parseMode: 'Markdown'
            })
                .then(data => resolve(data))
                .catch(err => reject(`Error sending message to chat ${err}`));
        });
    }

    sendPhoto(url: string) {
        return new Promise((resolve, reject) => {
            this.call('sendPhoto', { chatId: this.channelId, photo: url })
                .then(data => resolve(data))
                .catch(err => reject(`Error sending photo to chat ${err}`));
        });
    }

    sendAudio(url: string) {
        return new Promise((resolve, reject) => {
            this.call('sendAudio', { chatId: this.channelId, audio: url })
                .then(data => resolve(data))
                .catch(err => reject(`Error sending audio to chat ${err}`));
        });
    }

    sendDocument(url: string) {
        return new Promise((resolve, reject) => {
            this.call('sendDocument', { chatId: this.channelId, document: url })
                .then(data => resolve(data))
                .catch(err => reject(`Error sending document to telegram chat ${err}`));
        });
    }
}

interface TelegramResponse {
    ok: boolean;
    result?: any;
    description?: string;
    error_code?: number;
}

export default Telegram;