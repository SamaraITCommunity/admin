import request = require('request');
import queryString = require('query-string');
import { Post, TasksQueue } from './app';
import Database from './database';

const API_GATEWAY = 'https://api.vk.com/method';

class Vkontakte {
    private readonly token: string;
    private readonly groupId: number;
    private readonly checkRateMillis: number;
    private readonly database: Database;
    private readonly tasksQueue: TasksQueue;

    constructor(token: string, groupId: number, checkRateMinutes: number) {
        this.token = token;
        this.groupId = -Math.abs(groupId);
        this.checkRateMillis = 1000 * 60 * checkRateMinutes;
    }

    public start() {
        setInterval(() => this.getPosts(this.groupId).then(result => this.checkPosts(result)), this.checkRateMillis);
    }

    private async  call(method: string, action: string, data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            request(
                `${API_GATEWAY}/${method}.${action}?${queryString.stringify(data)}&v=5.103&access_token=${this.token}`,
                { json: true },
                (err, res, body: VKResponse) => {
                    if (!res) reject('Не достучались до VK. Скорее-всего, Ваш провайдер их блокирует');
                    if (err) reject(err);
                    else if (!body) reject('Не достучались до VK. Скорее-всего, Ваш провайдер их блокирует');
                    else if (body.error) reject(body.error);
                    else resolve(body.response);
                }
            );
        });
    }

    async getPosts(groupId: number): Promise<VKWallGetResponse> {
        if (groupId >= 0) {
            groupId = -Math.abs(groupId);
        }
        return new Promise<VKWallGetResponse>((resolve, reject) => {
            this.call('wall', 'get', { ownerId: groupId, filter: 'owner' })
                .then((data: VKWallGetResponse) => resolve(data))
                .catch(err => reject(err));
        });
    }

    checkPosts(data: VKWallGetResponse) {
        const checkTime = Math.round(+new Date() / 1000);
        data.items.forEach((vkPost, i, arr) => {
            if (vkPost.date > this.database.findAttributeValue('vk', 'lastCheckTime')) {
                const post = vkPost.intoPost();
                if (!this.tasksQueue.has(post)) {
                    this.tasksQueue.push(post);
                }
            }
        });
        this.database.setAttributeValue('vk', 'lastCheckTime', checkTime.toString());
    }
}

interface VKResponse {
    error?: {
        error_msg: string;
        error_code: number;
        request_params: Array<{ key: string; value: string }>;
    };
    response?: any;
}

interface VKWallGetResponse {
    count: number;
    items: Array<VKPost>;
}

class VKPost {
    id: number;
    from_id: number;
    owner_id: number;
    date: number;
    marked_as_ads: 0 | 1;
    post_type: 'post';
    text: string;
    can_pin: 0 | 1;
    attachments: Array<VKAttachment>;

    intoPost(): Post {
        let articleUrl;
        let linkUrl;
        let photoUrl;
        let videoUrl;
        let podcastUrl;
        let audioUrl;
        let documentUrl;
        if (this.attachments) {
            this.attachments.forEach(attach => {
                switch (attach.type) {
                    case 'link':
                        if (attach.link.button && attach.link.button.title == 'Читать')
                            articleUrl = attach.link.url;
                        else
                            linkUrl = attach.link.url;
                        break;
                    case 'photo':
                        photoUrl = attach.photo.sizes[attach.photo.sizes.length - 1].url;
                        break;
                    case 'video':
                        videoUrl = `https://vk.com/video?z=video${attach.video.owner_id}_${attach.video.id}&access_key=${attach.video.access_key}`;
                        break;
                    case 'podcast':
                        podcastUrl = `${attach.podcast.url}?${attach.podcast.access_key}`;
                        break;
                    case 'audio':
                        audioUrl = attach.audio.url.split('.mp3')[0] + '.mp3';
                        break;
                    case 'doc':
                        documentUrl = `${attach.doc.url}&access_key=${attach.doc.access_key}`;
                        break;
                    default:
                        console.warn(`Unsupported type of attachment: ${attach.type}.`);
                        break;
                }
            });
        }
        let text = this.text.replace(new RegExp('@samara_it_community', 'g'), '');
        text.match(/\S*\|[^|]*\]/g).forEach(reg => {
            const url = reg.replace('[', '').replace(']', '').split('|')[0];
            const desc = reg.replace('[', '').replace(']', '').split('|')[1];
            text = text.replace(reg, `[${desc}](https://vk.com/${url})`);
        });
        return {
            originId: this.id,
            text: text,
            originDateTime: this.date,
            linkUrl,
            photoUrl,
            videoUrl,
            podcastUrl,
            audioUrl,
            documentUrl,
        };
    }
}

interface VKAttachment {
    type: 'podcast' | 'photo' | 'video' | 'audio' | 'doc' | 'graffiti' | 'link' | 'note' | 'app' | 'poll' | 'page' | 'album' | 'photos_list' | 'market' | 'market_album' | 'sticker' | 'pretty_cards' | 'event';
    [key: string]: any;
}

interface VKPhoto extends VKAttachment {
    type: 'photo';
    photo: {
        id: number;
        album_id: number;
        owner_id: number;
        user_id: number;
        sizes: Array<{ type: string; url: string; width: number; height: number }>;
        text: string;
        date: number;
        post_id: number;
        access_key: string;
    };
}

interface VKAudio extends VKAttachment {
    type: 'audio';
    audio: {
        artist: string;
        id: number;
        owner_id: number;
        title: string;
        duration: number;
        access_key: string;
        ads: {
            content_id: string;
            duration: string;
            account_age_type: string;
            paid22: string;
        };
        is_licensed: boolean;
        track_code: string;
        url: string;
        date: number;
        album: {
            id: number;
            title: string;
            owner_id: number;
            access_key: string;
            thumb: {
                width: number;
                height: number;
                photo_34: string;
                photo_68: string;
                photo_135: string;
                photo_270: string;
                photo_300: string;
                photo_600: string;
            };
        };
        main_artists: [
            {
                name: string;
                is_followed: boolean;
                can_follow: boolean;
                domain: string;
                id: string;
            }
        ];
    };
}

interface VKVideo extends VKAttachment {
    type: 'video';
    video: {
        first_frame?: Array<VKPhoto>;
        width?: 1920;
        height?: 1080;
        id: number;
        owner_id: number;
        title: string;
        duration: number;
        description: string;
        date: number;
        comments: number;
        views: number;
        local_views: number;
        image: VKPhoto;
        is_favorite: boolean;
        access_key: string;
        platform: 'YouTube' | '';
        can_edit: 0 | 1;
        can_add: 0 | 1;
        track_code: string;
        type: 'video';
    };
}

interface VKDoc extends VKAttachment {
    type: 'doc';
    doc: {
        id: number;
        owner_id: number;
        title: string;
        size: number;
        ext: string;
        url: string;
        date: number;
        type: number;
        preview: { [key: string]: any };
        is_licensed: 0 | 1;
        access_key: string;
    };
}

interface VKPodcast extends VKAttachment {
    type: 'podcast';
    podcast: VKAudio['audio'];
}

interface VKLink extends VKAttachment {
    type: 'link';
    link: {
        url: string;
        title: string;
        caption: string;
        description?: string;
        photo: VKPhoto['photo'];
        button?: {
            title: string;
            action: {
                type: 'open_url' | '';
                url: string;
            };
        };
    };
}

export default Vkontakte;