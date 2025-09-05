import { IUser } from 'src/interfaces/users';

export interface IReleaseNote {
  id: string;
  tag_name: string;
  published_at: Date;
  body: string;
  body_html: string;
  author_id: string;
  author_detail: IUser;
}
