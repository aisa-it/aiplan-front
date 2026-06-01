import { DtoFormAttachmentLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { Forms } from '@aisa-it/aiplan-api-ts/src/Forms';
import axios from 'axios';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';

const api = new (withInterceptors(Forms))();

export interface UploadFormAttachmentOptions {
  formSlug: string;
  workspaceSlug: string;
  emptyUserAllowed?: boolean;
}

export const getFormAuth = async (formSlug: string) => {
  return (await api.getFormAuth(formSlug)).data;
};

export const createAnswerAuth = async (formSlug: string, answer: any[]) => {
  return (await api.createAnswerAuth(formSlug, answer)).data;
};

export const createFormAttachments = async (
  workspaceSlug: string,
  formSlug: string,
  data: { asset: File },
) => {
  return (await api.createFormAttachments(workspaceSlug, formSlug, data)).data;
};

export const uploadFormAttachment = async (
  file: File,
  options: UploadFormAttachmentOptions,
): Promise<DtoFormAttachmentLight> => {
  const { formSlug, workspaceSlug, emptyUserAllowed } = options;

  if (emptyUserAllowed) {
    const formData = new FormData();
    formData.append('asset', file);

    const url = `/api/forms/${formSlug}/form-attachments/`;
    return (await axios.post(url, formData)).data;
  }

  return createFormAttachments(workspaceSlug, formSlug, { asset: file });
};

export const getFormList = async (workspaceSlug: string) => {
  return (await api.getFormList(workspaceSlug)).data;
};

export const createForm = async (workspaceSlug: string, form: any) => {
  return (await api.createForm(workspaceSlug, form)).data;
};

export const deleteForm = async (workspaceSlug: string, formSlug: string) => {
  return (await api.deleteForm(workspaceSlug, formSlug)).data;
};

export const updateForm = async (
  workspaceSlug: string,
  formSlug: string,
  form: any,
) => {
  return (await api.updateForm(workspaceSlug, formSlug, form)).data;
};

export const getAnswers = async (
  workspaceSlug: string,
  formSlug: string,
  query?: { offset?: number; limit?: number },
) => {
  return (await api.getAnswers(workspaceSlug, formSlug, query)).data;
};

export const getAnswer = async (
  workspaceSlug: string,
  formSlug: string,
  answerSeq: string,
) => {
  return (await api.getAnswer(workspaceSlug, formSlug, answerSeq)).data;
};

export const getFormNoAuth = async (formSlug: string) => {
  return (await api.getFormNoAuth(formSlug)).data;
};

export const createAnswerNoAuth = async (formSlug: string, answer: any[]) => {
  return (await api.createAnswerNoAuth(formSlug, answer)).data;
};
