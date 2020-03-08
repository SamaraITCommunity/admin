import { Post } from './app';
import request = require('request');
import moment from 'moment';

class Github {
    private readonly username: string;
    private readonly apiKey: string;
    private readonly repositoryName: string;
    private readonly template: string;

    constructor(username: string, apiKey: string, repositoryName: string, template: string) {
        this.username = username;
        this.apiKey = apiKey;
        this.repositoryName = repositoryName;
        this.template = template;
    }

    publish(post: Post) {
        const articleName = moment(new Date).format('YYYY-MM-DD-HH-MM-SS');
        request.put(`https://api.github.com/repos/${this.username}/${this.repositoryName}/contents/content/${articleName}.md`, {
            json: true,
            headers: {
                //TODO: do we really need it?
                'User-Agent': this.username,
                Authorization: `token ${this.apiKey}`
            },
            body: {
                message: `Новый пост - ${articleName}.md`,
                content:
                    Buffer.from(
                        this.template
                            .replace(new RegExp('%title%', 'g'), `${post.text.split('\n')[0]}`)
                            .replace(new RegExp('\%date\.([^\s]+)\%', 'g'), articleName)
                            .replace(new RegExp('%description%', 'g'),
                                post.text.slice(0, 25) + (post.text.length > 25 ? '...' : ''))
                            .replace(new RegExp('%photos%', 'g'), post.photoUrl ? post.photoUrl.toString() : '')
                    ).toString('base64')
            }
        }, (err, res, __) => {
            if (!res) console.error('Ошибка при публикации на GitHub');
            else if (err) console.error('Ошибка при публикации на GitHub');
        });
    }

}

export default Github;