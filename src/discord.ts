import Discord = require('discord.js');
import { Post } from './app';

class SitcDiscord {
    private readonly role: string;
    private readonly channelName: string;
    private readonly apiKey: string;
    private readonly origin: Discord.Client;

    constructor(role: string, apiKey: string, channelName: string) {
        this.role = role;
        this.channelName = channelName;
        this.apiKey = apiKey;
        this.origin = new Discord.Client();
        this.origin.on('ready', () =>
            console.log(`Дискорд бот работает на аккаунте ${this.origin.user.tag}.`)
        );
        this.origin.login(apiKey);
    }

    publish(post: Post) {
        const channel = this.origin.guilds.first().channels.find(channel => channel.name == this.channelName) as Discord.TextChannel;
        if (!channel) {
            console.error(`Failed to find discord channel: ${this.channelName}`);
            return;
        }
        //TODO: construct one fully featured message.
        channel.send(post.text);
        if (post.articleUrl)
            channel.send('', { embed: { title: 'Новая статья в группе ВК.', description: `[Читать](${post.articleUrl})` } });
        if (post.photoUrl)
            channel.send('', { file: post.photoUrl.toString() });
        if (post.videoUrl)
            channel.send(`Видео: ${post.videoUrl}`);
        if (post.podcastUrl)
            channel.send(`Подкаст: ${post.podcastUrl}`);
        if (post.audioUrl)
            channel.send('', { file: post.audioUrl.toString() });
        if (post.documentUrl)
            channel.send('', { file: post.documentUrl.toString() });
    }
}

export default SitcDiscord;
