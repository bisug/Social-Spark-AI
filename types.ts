export type Tone = 'Professional' | 'Witty' | 'Urgent';

export type AspectRatio = '1:1' | '16:9' | '3:4' | '9:16';

export interface SocialPostTemplate {
  postText: string;
  hashtags: string;
  imagePrompt: string;
}

export interface SocialPost extends SocialPostTemplate {
  id: string; // Unique ID for React state management
  image: string; // Base64 encoded image string
}

export type Theme = 'light' | 'dark';