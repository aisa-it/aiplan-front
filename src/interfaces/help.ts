export interface IHelpPage {
  title: string;
  full_path: string;
  sub_pages: IHelpPage[];
  score?: number;
}
