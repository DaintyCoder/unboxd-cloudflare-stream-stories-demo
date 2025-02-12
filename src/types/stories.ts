export interface StoryUser {
    name: string;
    avatar?: string;
  }
  
  export interface StoryMedia {
    type: "video" | "image";
    url: string;
    thumbnail?: string;
    duration?: number;
    streamId?: string;
  }
  
  export interface Story {
    id: string;
    user: StoryUser;
    media: StoryMedia[];
  }
  