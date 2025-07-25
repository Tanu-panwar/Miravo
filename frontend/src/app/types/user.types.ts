export interface UserInfo {
  message: string;
  user: {
    _id: string;
    name: string;
    email: string;
    photo: string;
    gender: string;
    dateOfBirth: string;
    createdAt: string;
  };
}
