export interface Idea {
  id: string;
  text: string;
  upvotes: number;
  created_at: string;
}

export interface PresenceUser {
  user_id: string;
  display_name: string;
}
