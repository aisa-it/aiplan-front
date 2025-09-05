const getSuccessCreateSubissueMessage = (href: string) =>
  `<a target="_blank" href="${href}" class="primary-link">Подзадача</a> создана`;

const getSuccessCreateIssueMessage = (href: string, issueIndex: string) =>
  `<a target="_blank" href="${href}" class="primary-link">Задача ${issueIndex}</a> создана`;

const getSuccessCopyIssueMessage = (href: string, issueIndex: string) =>
  `<a target="_blank" href="${href}" class="primary-link">Задача ${issueIndex}</a> скопирована`;

const getSuccessDeleteIssueMessage = (issueIndex: string) =>
  `Задача ${issueIndex} удалена`;

const getSuccessTransferIssueMessage = (href: string, issueIndex: string) =>
  `<a target="_blank" href="${href}" class="primary-link">Задача  ${issueIndex}</a> перенесена`;

const getSuccessCopyIssueByLabelMessage = (href: string) =>
  `<a target="_blank" href="${href}" class="primary-link">Задачи</a> скопированы`;

const getSuccessTransferIssueByLabelMessage = (href: string) =>
  `<a target="_blank" href="${href}" class="primary-link">Задачи</a> перенесены`;

export {
  getSuccessCreateSubissueMessage,
  getSuccessCreateIssueMessage,
  getSuccessCopyIssueMessage,
  getSuccessTransferIssueMessage,
  getSuccessCopyIssueByLabelMessage,
  getSuccessTransferIssueByLabelMessage,
  getSuccessDeleteIssueMessage,
};
