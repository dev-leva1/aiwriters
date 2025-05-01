export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface UserDTO {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserDTO;
  token?: string;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author?: UserDTO;
  likes: number;
  comments: Comment[];
  aiRating?: AIRating;
  createdAt: Date;
  updatedAt: Date;
  genre?: string;
  tags?: string[];
  reposts?: number;
  attachments?: Attachment[];
  views?: number;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author?: UserDTO;
  storyId: string;
  isAI: boolean;
  createdAt: Date;
}

export interface AIRating {
  overallScore: number;
  feedback: string;
  popularity: number;
  strengths: string[];
  improvements: string[];
  genre?: string;
}

export interface AIResponse {
  rating?: AIRating;
  comment?: string;
  aiPost?: {
    title: string;
    content: string;
  };
}

export interface Attachment {
  id: string;
  type: 'image' | 'file';
  url: string;
  filename?: string;
  storyId: string;
} 