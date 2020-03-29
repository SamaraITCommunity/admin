use super::*;
    use carapax::{
        methods::{SendAudio, SendDocument, SendMessage, SendPhoto, SendVideo},
        types::InputFile,
        Api, Config,
    };

    pub struct Telegram {
        api: Api,
        channel_id: String,
    }

    impl Telegram {
        pub fn new(token: String, channel_id: String) -> Self {
            let config = Config::new(token);
            Telegram {
                api: Api::new(config).expect("Failed to create API"),
                channel_id,
            }
        }

        pub async fn publish(&self, post: &Post) -> Result<(), String> {
            if let Some(article_url) = &post.article_url {
                self.api
                    .execute(SendMessage::new(
                        self.channel_id.clone(),
                        format!("Читайте полную версию [тут]({})", &post.text),
                    ))
                    .await;
            }
            if let Some(video_url) = &post.video_url {
                self.api
                    .execute(SendVideo::new(
                        self.channel_id.clone(),
                        InputFile::url(video_url),
                    ))
                    .await;
            }
            if let Some(podcast_url) = &post.podcast_url {
                self.api
                    .execute(
                        SendAudio::new(self.channel_id.clone(), InputFile::url(podcast_url))
                            .caption("Новый выпуск SITCast!"),
                    )
                    .await;
            }
            if let Some(audio_url) = &post.audio_url {
                self.api
                    .execute(SendAudio::new(
                        self.channel_id.clone(),
                        InputFile::url(audio_url),
                    ))
                    .await;
            }
            if let Some(document_url) = &post.document_url {
                self.api
                    .execute(SendDocument::new(
                        self.channel_id.clone(),
                        InputFile::url(document_url),
                    ))
                    .await;
            }
            //TODO: reply to chain of previous message let prev_m_id = Option<id>
            if let Some(photo_url) = &post.photo_url {
                self.api
                    .execute(
                        SendPhoto::new(self.channel_id.clone(), InputFile::url(photo_url))
                            .caption(&post.text[0..1023]), //TODO: better collapse algorithm
                    )
                    .await
                    .map(|_| ())
                    .map_err(|error| format!("{}", error))
            } else {
                self.api
                    .execute(
                        SendMessage::new(self.channel_id.clone(), &post.text)
                            .disable_web_page_preview(true),
                    )
                    .await
                    .map(|_| ())
                    .map_err(|error| format!("{}", error))
            }
        }
    }

