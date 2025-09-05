import { DtoDoc } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { IDocTreeNode } from 'src/interfaces/docs';

export const mapDocNode = (el: DtoDoc): IDocTreeNode => ({
  id: el.id,
  title: el.title,
  lazy: el.has_child_docs,
  isFavorite: el.is_favorite,
});
