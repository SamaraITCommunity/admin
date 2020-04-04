use super::Post;
use discord::model::ChannelId;
use discord::Discord as Origin;

pub struct Discord {
    origin: Origin,
    channel_id: u64,
}

impl Discord {
    pub fn new(token: String, channel_id: u64) -> Result<Self, String> {
        Ok(Discord {
            origin: Origin::from_bot_token(&token)
                .map_err(|e| format!("Failed to initialize discord: {}", e))?,
            channel_id,
        })
    }

    pub fn publish(&self, post: &Post) -> Result<(), String> {
        self.origin
            .send_message(ChannelId(self.channel_id), &post.text, "", false)
            .map_err(|e| format!("Failed to send message to Discord: {}", e))?;
        Ok(())
    }
}
