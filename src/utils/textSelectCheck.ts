// Проверка выделения текста пользователем
export const isTextSelected = (): boolean => {
  const selection = window.getSelection();
  return selection && selection.toString().length > 0 ? true : false;
};
