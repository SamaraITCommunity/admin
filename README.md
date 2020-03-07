# Бот администратор самарского айти сообщества
[![Build Status](https://travis-ci.com/SamaraITCommunity/admin.svg?branch=master)](https://travis-ci.com/SamaraITCommunity/admin)
![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2SamaraITCommunity%2Fadmin.svg?type=medium)

## Функционал

### Размещение постов из [VK](https://vk.com/samara_it_community):

✔️ Push в [репозиторий сайта sitc.community](https://github.com/SamaraITCommunity/site).
❌ Публикация в twitter.
✔️ Публикация в [telegram-канале](t.me/Samara_IT_Community).
✔️ Публикация в [Discord](https://discord.gg/Vtnrgym).
✔️ Упоминания сообществ и людей (‘@’ ‘*’).
✔️ Очищать теги от `@samara_it_community`.
⚠️ Поддержка подкастов (ограниченная поддержка).
⚠️ Поддержка статей и их превью (ограниченная поддержка).
✔️ Для хранения изображений используется LFS или внешний сервис (все изображения хранятся только на серверах ВК).

## Ввод в эксплуатацию

1. Создать и заполнить `.env` файл согласно `config.ts`
1. Установить [YARN](https://yarnpkg.com/getting-started/install/) (опционально).
1. Установить TS-NODE - `yarn global add ts-node` / `npm i -g ts-node`.
1. Запустить - `yarn start`

### Переменные окружения

#### VK_GROUP_ID

ID группы VK. Может быть как отрицательным, так и положительным.

#### VK_API_KEY

Токен для обращения к API ВК. Пользовательский токен можно получить здесь: https://vkhost.github.io/. Доступность методов можно посмотреть [тут](https://vk.com/dev/methods) и [тут](https://vk.com/dev/permissions)

#### TELEGRAM_API_KEY

Token Telegram бота. Можно получить у @BotFather.

#### TELEGRAM_CHANNEL_ID

Ссылка на канал без `https://tg.me/` части или ID (с @ или без).

#### DISCORD_API_KEY

Токен Discord-бота. Можно получить [тут](https://discordapp.com/developers/applications/).
Приглашать в гильдию по ссылке: `https://discordapp.com/oauth2/authorize?client_id={BOT_ID}&scope=bot&permissions=452672`

#### DISCORD_CHANNEL_NAME

Человеческое название канала (например, general) в гильдии, где есть бот.

#### GITHUB_API_KEY

Ключ доступа для GitHub. Установите права для работы с репозиториями! Получить можно [тут](https://github.com/settings/tokens).

#### GITHUB_USERNAME

Ваш username на GitHub

#### GITHUB_REPO_NAME

Название репозитория, в котором расположен сайт. 

