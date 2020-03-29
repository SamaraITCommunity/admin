use std::collections::BTreeMap;

pub struct Database {
    storage: BTreeMap<i64, super::Post>,
    predefined_last_post_id: i64,
}

impl Database {
    pub fn new(last_post_id: i64) -> Result<Self, String> {
        Ok(Database {
            storage: BTreeMap::new(),
            predefined_last_post_id: last_post_id,
        })
    }

    pub async fn last_published_post_id(&self) -> i64 {
        self.predefined_last_post_id
    }

    pub async fn insert_published(&mut self, post: super::Post) {
        self.storage.insert(post.id, post);
    }
}
