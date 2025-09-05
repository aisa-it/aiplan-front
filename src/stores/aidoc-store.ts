import { defineStore } from 'pinia';
import { useAiplanStore } from './aiplan-store';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';
import { Docs } from '@aisa-it/aiplan-api-ts/src/Docs';
import {
  DtoDocLight,
  DtoDoc,
  AiplanReactionRequest,
  DtoDocFavorites,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { getActivityOffset } from 'src/utils/helpers';

const aiplan = useAiplanStore();
const api = aiplan.api;
const docApi = new (withInterceptors(Docs))();

interface IDocState {
  rootDocs: DtoDocLight[];
  newChildrenDoc: DtoDoc | null;
  newRootDoc: DtoDoc | null;
  selectedDocId: string | null;
  selectedDocTitle: string | null;
  parentDocId: string | null;
  deletedDocId: string | null;
  updatedDocId: string | null;
  favoritesDocs: DtoDocFavorites[];
  isHierarchyOpened: boolean;
}

export const useAiDocStore = defineStore('aidoc-store', {
  state: (): IDocState => {
    return {
      rootDocs: [],
      newChildrenDoc: null,
      newRootDoc: null,
      selectedDocId: null,
      selectedDocTitle: null,
      parentDocId: null,
      deletedDocId: null,
      updatedDocId: null,
      favoritesDocs: [],
      isHierarchyOpened: false,
    };
  },
  getters: {
    aidocLink(): string {
      return `${location.protocol}//${location.host}/${this.router.currentRoute.value.params.workspace}/aidoc/${this.router.currentRoute.value.params.doc}`;
    },
  },
  actions: {
    setParentDoc(id: string | null) {
      this.parentDocId = id;
    },
    setUpdatedDoc(id: string | null) {
      this.updatedDocId = id;
    },
    async getAiDoc(workspaceSlug: string, id: string) {
      if (!workspaceSlug) return;
      return await docApi.getDoc(workspaceSlug, id);
    },
    async updateDocument(document: object, workspaceSlug: string, id: string) {
      await docApi.updateDoc(workspaceSlug, id, document);
      this.setUpdatedDoc(id);
      if (document?.doc?.title) this.selectedDocTitle = document.doc.title;
    },
    async deleteDocument(workspaceSlug: string, docId: string) {
      await docApi.deleteDoc(workspaceSlug, docId);
      this.deletedDocId = docId;
    },
    async getCommentsList(workspaceSlug: string, id: string) {
      const { data } = await docApi.getDocCommentList(workspaceSlug, id);
      return data.result;
    },

    async getRootDocs(workspaceSlug: string) {
      this.rootDocs = (await docApi.getRootDocList(workspaceSlug)).data;
    },

    async createRootDoc(workspaceSlug: string, doc: object, files?: File[]) {
      await docApi
        .createRootDoc(workspaceSlug, doc)
        .then((res) => (this.newRootDoc = res.data));
      await this.docAttachmentsUploadByOne(
        files,
        workspaceSlug,
        this.newRootDoc?.id,
      );
      await this.getRootDocs(workspaceSlug);
    },

    async createComment(data) {
      await docApi.createDocComment(data.workspaceSlug, data.id, {
        comment: data.content.comment,
        files: data.content.files,
      });
    },

    async deleteComment(data: object) {
      await docApi.deleteDocComment(
        data.workspaceSlug,
        data.docId,
        data.commentId,
      );
    },

    async updateComment(data: object) {
      await docApi.updateDocComment(
        data.workspaceSlug,
        data.docId,
        data.commentId,
        data.data,
      );
    },

    async getSingleComment(
      workspaceSlug: string,
      docId: string,
      commentId: string,
    ) {
      return (await docApi.getDocComment(workspaceSlug, docId, commentId)).data;
    },

    async copyComment(comment_id: string) {
      const baseUrl = this.aidocLink;
      const link = `${baseUrl}/${comment_id}`;
      navigator.clipboard.writeText(link);
    },

    async createChildDoc(
      workspaceSlug: string,
      id: string,
      doc: object,
      files?: File[],
    ) {
      await docApi
        .createDoc(workspaceSlug, id, doc)
        .then((res) => (this.newChildrenDoc = res.data));
      await this.docAttachmentsUploadByOne(
        files,
        workspaceSlug,
        this.newChildrenDoc?.id,
      );
      await this.getRootDocs(workspaceSlug);
    },

    async moveDoc(
      workspaceSlug: string,
      docId: string,
      parentId?: string,
      previousId?: string,
      nextId?: string,
    ) {
      const { data } = await api.post(
        `/api/auth/workspaces/${workspaceSlug}/doc/${docId}/move/`,
        {
          parent_id: parentId,
          previous_id: previousId,
          next_id: nextId,
        },
      );
      return data;
    },

    async addReaction(
      workspaceSlug: string,
      docId: string,
      commentId: string,
      data: AiplanReactionRequest,
    ) {
      await docApi.addDocCommentReaction(workspaceSlug, docId, commentId, data);
    },

    async deleteReaction(
      workspaceSlug: string,
      docId: string,
      commentId: string,
      reaction: string,
    ) {
      await docApi.removeDocCommentReaction(
        workspaceSlug,
        docId,
        commentId,
        reaction,
      );
    },

    async getChildDocList(workspaceSlug: string, id: string) {
      return await docApi.getChildDocList(workspaceSlug, id);
    },

    selectDoc(id: string, title: string) {
      this.selectedDocId = id;
      this.selectedDocTitle = title;
    },

    uploadDocAttachments(workspaceSlug: string, docId: string, files: any) {
      const uploadPromises = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        uploadPromises.push(
          docApi.createDocAttachments(workspaceSlug, docId, {
            asset: file,
          }),
        );
      }
      return Promise.all(uploadPromises);
    },

    async docAttachmentsList(workspaceSlug: string, docId: string) {
      const { data } = await docApi.getDocAttachmentList(workspaceSlug, docId);
      return data;
    },

    async docAttachmentsUploadByOne(
      files: any,
      workspaceSlug: string,
      docId: string,
    ) {
      return this.uploadDocAttachments(workspaceSlug, docId, files);
    },

    async docAttachmentsUpload(ev: any, docId: string) {
      return aiplan.uploadFileAsync(
        ev,
        docId,
        'doc',
        (file, uploaded, total) => {
          const percentage = ((uploaded / total) * 100).toFixed(2);
          // TODO: show progress, split by file name in case of multiple uploads
          console.log(file, percentage);
          return percentage;
        },
      );
    },

    async docAttachmentDelete(
      workspaceSlug: string,
      docId: string,
      attachmentId: string,
    ) {
      await docApi.deleteDocAttachment(workspaceSlug, docId, attachmentId);
    },

    async getFavoriteDocs(workspaceSlug: string) {
      const { data } = await docApi.getFavoriteDocList(workspaceSlug);
      this.favoritesDocs = data;
    },

    async addDocToFavorites(workspaceSlug: string, docId: string) {
      await docApi.addDocToFavorites(workspaceSlug, { doc: docId });
    },

    async deleteDocFromFavorites(workspaceSlug: string, docId: string) {
      await docApi.removeDocFromFavorites(workspaceSlug, docId);
    },

    async getListVersion(workspaceSlug: string, docId: string) {
      const { data } = await docApi.getDocHistoryList(workspaceSlug, docId);
      return data.result;
    },

    async getVersionPreview(
      workspaceSlug: string,
      docId: string,
      versionId: string,
    ) {
      const { data } = await api.get(
        `/api/auth/workspaces/${workspaceSlug}/doc/${docId}/history/${versionId}`,
      );
      return data;
    },

    async setVersionDoc(
      workspaceSlug: string,
      docId: string,
      versionId: string,
    ) {
      const { data } = await api.patch(
        `/api/auth/workspaces/${workspaceSlug}/doc/${docId}/history/${versionId}`,
      );
      return data;
    },

    async getDocActivityList(
      workspaceSlug: string,
      docId: string,
      page: number,
      pageSize: number,
    ) {
      const { data } = await docApi.getDocActivityList(workspaceSlug, docId, {
        offset: getActivityOffset(page, pageSize),
        limit: pageSize,
      });
      return data;
    },
  },
});
