export interface User {
  _id: string;
  name: string;
  photo: string | null;
}

export interface CommentCreator {
  _id: string;
  name: string;
  photo: string;
}

export interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  commentCreator: CommentCreator;
}

export interface Post {
  _id: string;
  body: string;
  image: string;
  createdAt: string;
  user: User;
  comments: Comment[];
  likes: string[]; // 👈 ADD THIS
  isLiked?: boolean;
}


export interface CommentRequest {
  content: string;
  post: string;
}

export interface CommentResponse {
  message: string;
  comments: Comment[];
}

export interface PostResponse {
  message: string;
  post: Post;
}
