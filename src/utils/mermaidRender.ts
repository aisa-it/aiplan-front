import type { Mermaid } from 'mermaid';

/**
 * Ленивый загрузчик и рендер mermaid-диаграмм.
 *
 * Библиотека весит ~500 КБ gzip, поэтому импортируется динамически —
 * Vite выносит её в отдельный чанк, который грузится только когда
 * на экране реально появляется диаграмма.
 *
 * В базе хранится ТОЛЬКО исходный текст диаграммы (<pre class="mermaid">),
 * SVG собирается на клиенте при показе. Готовый SVG никогда не попадает
 * в контент и не проходит через санитайзер бэкенда.
 */

let mermaidPromise: Promise<Mermaid> | null = null;
// Тема задаётся глобальным mermaid.initialize — запоминаем последнюю,
// чтобы не переинициализировать на каждый рендер.
let initializedTheme: string | null = null;
let renderSeq = 0;

async function getMermaid(dark: boolean): Promise<Mermaid> {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then((module) => module.default);
  }
  const mermaid = await mermaidPromise;

  const theme = dark ? 'dark' : 'default';
  if (initializedTheme !== theme) {
    mermaid.initialize({
      startOnLoad: false,
      // strict — дефолт, но фиксируем явно: метки диаграммы проходят
      // через встроенный DOMPurify, script/клик-обработчики вырезаются.
      securityLevel: 'strict',
      theme,
    });
    initializedTheme = theme;
  }
  return mermaid;
}

/**
 * Рендерит текст диаграммы в SVG-строку.
 * Бросает Error с сообщением парсера mermaid, если текст невалиден.
 */
export async function renderMermaidSvg(
  code: string,
  dark: boolean,
): Promise<string> {
  const mermaid = await getMermaid(dark);

  // parse отдельно от render: при ошибке он не оставляет мусорных
  // элементов в DOM и даёт внятное сообщение с номером строки.
  await mermaid.parse(code);

  const id = `mermaid-render-${++renderSeq}`;
  try {
    const { svg } = await mermaid.render(id, code);
    return svg;
  } finally {
    // При падении render mermaid может оставить временный контейнер в body.
    document.getElementById(id)?.remove();
    document.getElementById(`d${id}`)?.remove();
  }
}
