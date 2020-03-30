use super::*;
use rvk::{methods, objects::post, APIClient, Params};
use serde::Deserialize;
use std::fmt::Debug;

pub struct Vkontakte {
    /// Should start with `-`.
    group_id: String,
    client: APIClient,
}

impl Vkontakte {
    pub fn new(token: String, group_id: String) -> Self {
        Vkontakte {
            group_id,
            client: APIClient::new(token),
        }
    }

    pub fn get_wall_posts(&self) -> Result<Wall, String> {
        let mut params = Params::new();
        params.insert("owner_id".into(), self.group_id.clone());
        let wall_posts = methods::wall::get(&self.client, params)
            .map_err(|err| format!("Failed to get VK wall: {}", err))?;
        Ok(serde_json::from_value::<Wall>(wall_posts)
            .map_err(|err| format!("Failed to parse VK wall: {:?}", err))?)
    }

    pub fn get_posts(&self) -> Result<super::Posts, String> {
        Ok(self
            .get_wall_posts()?
            .items
            .iter()
            .map(|vk_post| vk_post.into())
            .collect())
    }
}

#[derive(Debug, Deserialize)]
pub struct Wall {
    count: i32,
    items: Vec<post::Post>,
}

impl From<&post::Post> for Post {
    fn from(vk_post: &post::Post) -> Post {
        Post::new(vk_post.id, vk_post.text.clone())
    }
}
