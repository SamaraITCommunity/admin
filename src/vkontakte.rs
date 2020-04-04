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
            .map(|vk_post| vk_post.clone().into())
            .collect())
    }
}

#[derive(Debug, Deserialize)]
pub struct Wall {
    count: i32,
    items: Vec<post::Post>,
}

impl From<post::Post> for Post {
    fn from(vk_post: post::Post) -> Post {
        let mut post = Post::new(vk_post.id, vk_post.text.replace("@samara_it_community", ""));
        if let Some(attachments) = vk_post.attachments {
            for attachment in attachments {
                if let Some(link) = attachment.link {
                    post.link_url(link.url.clone());
                }
                if let Some(photo) = attachment.photo {
                    if let Some(sizes) = photo.sizes {
                        let mut best_size = None;
                        for size in sizes {
                            match &mut best_size {
                                None => best_size = Some(size),
                                Some(current_best_size) => {
                                    if let Some(width) = size.width {
                                        if let Some(current_best_width) = current_best_size.width {
                                            if width > current_best_width {
                                                best_size = Some(size);
                                            }
                                        } else {
                                            best_size = Some(size);
                                        }
                                    }
                                }
                            }
                        }
                        if let Some(best_size) = best_size {
                            post.photo_url(best_size.url);
                        }
                    }
                }
                if let Some(podcast) = attachment.podcast {
                    post.podcast_url(
                        podcast.url,
                        podcast.access_key.unwrap_or_else(|| "".to_string()),
                    );
                }
            }
        }
        post
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs::File;
    use std::io::prelude::*;

    #[test]
    fn transform_vk_post_into_post() -> std::io::Result<()> {
        let mut content = String::new();
        File::open("tests/wall_payload.json")?.read_to_string(&mut content)?;
        let wall: Wall = serde_json::from_str(&content).expect("Failed to parse Wall");
        let result: Vec<Post> = wall
            .items
            .iter()
            .map(|vk_post| vk_post.clone().into())
            .collect();
        dbg!(result);
        Ok(())
    }

    #[test]
    fn check_transformation_of_text() -> std::io::Result<()> {
        let mut content = String::new();
        File::open("tests/wall_payload.json")?.read_to_string(&mut content)?;
        let wall: Wall = serde_json::from_str(&content).expect("Failed to parse Wall");
        let result: Vec<Post> = wall
            .items
            .iter()
            .map(|vk_post| vk_post.clone().into())
            .collect();
        for post in result {
            assert!(post.text.matches("@samara_it_community").count() == 0);
        }
        Ok(())
    }
}
