export interface IDocTreeNode {
  id?: string;
  title?: string;
  lazy?: boolean;
  isFavorite?: boolean;
  /** путь по слагам от корня — адрес документа */
  slugPath?: string;
  shortUrl?: string;
}
