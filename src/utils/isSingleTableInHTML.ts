// Проверка, является ли фрагмент документа исключительно таблицей table HTML
// Используется для проверки условия для слияния таблиц
export function isSingleTableInHTML(fragment: DocumentFragment): boolean {

  const tables = Array.from(fragment.querySelectorAll('table'));
  if (tables.length !== 1) return false;

  const table = tables[0];

  // Поиск текстовых узлов с непустым содержимым вне таблицы
  const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = node.textContent?.trim();
      if (!text) return NodeFilter.FILTER_REJECT;
      if (table.contains(node.parentElement)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  if (walker.nextNode() !== null) {
    return false; // Найден непустой текст вне таблицы
  }

  // Проверка на содержательные элементы. Не учитываются тэги, которые идут вместе со стандартной вставкой
  const allowedWrapperTags = new Set([
    'html',
    'body',
    'head',
    'style',
    'meta',
    'title',
    'link',
    'script',
    'google-sheets-html-origin',
    'o:p',
    'comment',
  ]);

  const allElements = Array.from(fragment.querySelectorAll('*'));
  for (const el of allElements) {
    if (el === table || table.contains(el)) continue;

    const tag = el.tagName?.toLowerCase();
    if (!tag) continue;

    // Если тег не в списке разрешённых - значит, это содержательный контент (p, div с текстом и т.д.)
    if (!allowedWrapperTags.has(tag)) {
      return false;
    }
  }

  return true;
}
