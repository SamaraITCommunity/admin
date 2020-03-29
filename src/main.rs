#![feature(binary_heap_into_iter_sorted)]
#![feature(map_first_last)]
use dotenv;
use std::{cmp::Ordering, collections::BinaryHeap, env};

mod database;
mod telegram;
mod vkontakte;

#[tokio::main]
async fn main() -> Result<(), String> {
    dotenv::dotenv().ok();
    let mut app = Application::new(
        vkontakte::Vkontakte::new(
            env::var("VK_API_KEY").expect("Set VK_API_KEY environment variable"),
            env::var("VK_GROUP_ID").expect("Set VK_GROUP_ID environment variable"),
        ),
        telegram::Telegram::new(
            env::var("TELEGRAM_BOT_TOKEN").expect("Set TELEGRAM_BOT_TOKEN environment variable"),
            env::var("TELEGRAM_CHANNEL_ID").expect("Set TELEGRAM_CHANNEL_ID environment variable"),
        ),
        database::Database::new(
            env::var("LAST_POST_ID")
                .expect("Set LAST_POST_ID environment variable")
                .parse()
                .expect("LAST_POST_ID should be integer"),
        )?,
    );
    &app.try_posts().await?;
    Ok(())
}

struct Application {
    vkontakte: vkontakte::Vkontakte,
    telegram: telegram::Telegram,
    database: database::Database,
}

impl Application {
    fn new(
        vkontakte: vkontakte::Vkontakte,
        telegram: telegram::Telegram,
        database: database::Database,
    ) -> Self {
        Application {
            vkontakte,
            telegram,
            database,
        }
    }

    async fn try_posts(&mut self) -> Result<(), String> {
        let posts = self.vkontakte.get_posts();
        let last_published_post_id = self.database.last_published_post_id().await;
        let posts = posts?
            .into_iter_sorted()
            .take_while(|post| post.id > last_published_post_id)
            .collect::<Posts>();
        println!(
            "There are {} posts since post with id {}.",
            posts.len(),
            last_published_post_id
        );
        for post in posts {
            self.publish(post).await?;
        }
        Ok(())
    }

    async fn publish(&mut self, post: Post) -> Result<(), String> {
        println!("Going to publish post with id: {}.", post.id);
        //TODO: iterate over results, log errors and schedule retry
        self.telegram.publish(&post).await?;
        self.database.insert_published(post).await;
        //TODO: retry one more time and return error or result
        Ok(())
    }
}

type Posts = BinaryHeap<Post>;

#[derive(Eq, Debug, serde::Serialize)]
pub struct Post {
    id: i64,
    text: String,
    link_url: Option<String>,
    article_url: Option<String>,
    photo_url: Option<String>,
    video_url: Option<String>,
    podcast_url: Option<String>,
    audio_url: Option<String>,
    document_url: Option<String>,
}

impl Post {
    fn new(id: i64, text: String) -> Self {
        Post {
            id,
            text,
            link_url: Option::None,
            article_url: Option::None,
            photo_url: Option::None,
            video_url: Option::None,
            podcast_url: Option::None,
            audio_url: Option::None,
            document_url: Option::None,
        }
    }
}

impl Ord for Post {
    fn cmp(&self, other: &Self) -> Ordering {
        self.id.cmp(&other.id)
    }
}

impl PartialOrd for Post {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Option::Some(self.cmp(other))
    }
}

impl PartialEq for Post {
    fn eq(&self, other: &Self) -> bool {
        self.id == other.id
    }
}
