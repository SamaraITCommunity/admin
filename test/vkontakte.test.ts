import Vkontakte from '../src/vkontakte';
require('dotenv').config();
import config from '../src/config';
import { resolve } from 'dns';

const vkontakte = new Vkontakte(config.VK_API_KEY, config.VK_GROUP_ID, config.VK_CHECK_RATE);

test('vkontakte should get posts', () => {
    return expect(vkontakte.getPosts(config.VK_GROUP_ID))
        .resolves.toBeDefined();
});