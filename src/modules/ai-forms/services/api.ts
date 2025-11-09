import {
  AiplanReqAnswer,
  AiplanReqForm,
  AiplanRespAnswers,
  DaoPaginationResponse,
  DtoForm,
  DtoFormAnswer,
  DtoFormLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { Forms } from '@aisa-it/aiplan-api-ts/src/Forms';

import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';

const apiForms = new (withInterceptors(Forms))();

export const api = {
  getFormList: async (wsSlug: string): Promise<DtoFormLight[]> => {
    return apiForms.getFormList(wsSlug).then((res) => res.data);
  },
  createForm: async (wsSlug: string, form: AiplanReqForm): Promise<DtoForm> => {
    return apiForms.createForm(wsSlug, form).then((res) => res.data);
  },
  updateForm: async (
    wsSlug: string,
    formSlug: string,
    form: AiplanReqForm,
  ): Promise<DtoForm> => {
    return apiForms.updateForm(wsSlug, formSlug, form).then((res) => res.data);
  },
  deleteForm: async (wsSlug: string, formSlug: string): Promise<void> => {
    return apiForms.deleteForm(wsSlug, formSlug).then((res) => res.data);
  },
  getFormNoAuth: async (formSlug: string): Promise<DtoForm> => {
    return apiForms.getFormNoAuth(formSlug).then((res) => res.data);
  },
  getFormAuth: async (formSlug: string): Promise<DtoForm> => {
    return apiForms.getFormAuth(formSlug).then((res) => res.data);
  },
  createAnswerAuth: async (
    formSlug: string,
    answer: AiplanReqAnswer[],
  ): Promise<AiplanRespAnswers> => {
    return apiForms.createAnswerAuth(formSlug, answer).then((res) => res.data);
  },
  createAnswerNoAuth: async (
    formSlug: string,
    answer: AiplanReqAnswer[],
  ): Promise<AiplanRespAnswers> => {
    return apiForms
      .createAnswerNoAuth(formSlug, answer)
      .then((res) => res.data);
  },
  getAnswers: async (
    wsSlug: string,
    formSlug: string,
    query?: {
      offset?: number;
      limit?: number;
    },
  ) => {
    return apiForms.getAnswers(wsSlug, formSlug, query).then((res) => res.data);
  },
  getAnswer: async (
    wsSlug: string,
    formSlug: string,
    answerSeq: string,
  ): Promise<DtoFormAnswer> => {
    return apiForms
      .getAnswer(wsSlug, formSlug, answerSeq)
      .then((res) => res.data);
  },
};
