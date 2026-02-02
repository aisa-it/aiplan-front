import { DOMParser, DOMSerializer } from '@tiptap/pm/model';
import { findParentNode } from '@tiptap/vue-3';

import { convertFontSizeToPx } from 'src/utils/convertFontSizeToPx';
import { isSingleTableInHTML } from 'src/utils/isSingleTableInHTML';

// Обработка вставки скопированного содержимого в редактор
export const handleTipTapPaste = (editorInstance, view, event, slice) => {
  const html = event.clipboardData?.getData('text/html');
  if (!html) return false;

  const { state, dispatch } = editorInstance.value.view;
  const { selection } = state;
  const { $from } = selection;

  // Проверка вставки внутрь таблицы
  const parentTable = findParentNode((node) => node.type.name === 'table')(
    selection,
  );
  const isInTable = !!parentTable;

  // Проверка на вставку из MS Word
  const isFromMsWord =
    html.includes('<!--[if gte mso 9]>') ||
    html.includes('<!-- [if gte mso 9]-->') ||
    /class="[^"]*Mso[A-Za-z]/.test(html) ||
    /<[/]?o:p\b/i.test(html);

  // Обработка и подстановка стилей текста из оригинальной таблицы
  const temp = document.createElement('template');
  temp.innerHTML = html;
  const fragment = temp.content;

  // Конвертация размеров шрифта текста Word
  if (isFromMsWord) {
    const elementsWithStyle = fragment.querySelectorAll('[style]');
    for (const el of elementsWithStyle) {
      const styleAttr = el.getAttribute('style');
      if (!styleAttr) continue;

      const ptMatch = styleAttr.match(/font-size\s*:\s*([\d.]+)\s*pt\b/i);
      if (ptMatch) {
        const ptValue = ptMatch[1];
        const pxValue = convertFontSizeToPx(`${ptValue}pt`);

        const newStyle = styleAttr
          .replace(/font-size\s*:\s*[\d.]+\s*pt\b/i, `font-size: ${pxValue}`)
          .replace(/\s+/g, ' ')
          .trim()
          .replace(/;$/, '');

        el.setAttribute('style', newStyle);
      }
    }
  }

  // Парсинг классов из <style> (Excel)
  const classStyles: Record<string, CSSStyleDeclaration> = {};
  const styleElements = Array.from(fragment.querySelectorAll('style'));

  for (const styleEl of styleElements) {
    const cssText = styleEl.textContent || '';
    const tempStyle = document.createElement('style');
    tempStyle.textContent = cssText;
    document.head.appendChild(tempStyle);

    try {
      const sheet = tempStyle.sheet as CSSStyleSheet | null;
      if (sheet?.cssRules) {
        for (const rule of sheet.cssRules) {
          if (
            rule instanceof CSSStyleRule &&
            rule.selectorText.startsWith('.')
          ) {
            const className = rule.selectorText.slice(1).trim();
            classStyles[className] = rule.style;
          }
        }
      }
    } finally {
      document.head.removeChild(tempStyle);
    }
    styleEl.remove();
  }

  // Обработка всех элементов внутри таблиц
  const tablesInFragment = Array.from(fragment.querySelectorAll('table'));
  for (const table of tablesInFragment) {
    table.classList.add('table-striped');

    const allElements = Array.from(table.querySelectorAll('*'));
    for (const el of allElements) {
      let targetFontSize: string | null = null;
      let targetFontWeight: string | null = null;
      let targetFontStyle: string | null = null;
      let targetTextDecoration: string | null = null;
      const tagName = el.tagName.toLowerCase();

      if (!isFromMsWord) {
        // Обработка классов Excel
        for (const cls of el.classList) {
          const styles = classStyles[cls];
          if (styles) {
            if (styles.fontSize && !targetFontSize) {
              targetFontSize = convertFontSizeToPx(styles.fontSize);
            }
            if (styles.fontWeight && !targetFontWeight) {
              targetFontWeight = styles.fontWeight;
            }
            if (styles.fontStyle && !targetFontStyle) {
              targetFontStyle = styles.fontStyle;
            }
            if (styles.textDecoration && !targetTextDecoration) {
              targetTextDecoration = styles.textDecoration;
            }
          }
        }

        // Обработка инлайн стилей
        if (el.hasAttribute('style')) {
          const inlineStyle = el.getAttribute('style')!;
          const fontSizeMatch = inlineStyle.match(
            /font-size\s*:\s*([\d.]+)\s*(pt|px)\b/i,
          );
          if (fontSizeMatch && !targetFontSize) {
            const raw = `${fontSizeMatch[1]}${fontSizeMatch[2]}`;
            targetFontSize = convertFontSizeToPx(raw);
          }

          const fontWeightMatch = inlineStyle.match(
            /font-weight\s*:\s*(\w+|\d+)/i,
          );
          if (fontWeightMatch && !targetFontWeight) {
            targetFontWeight = fontWeightMatch[1];
          }

          const fontStyleMatch = inlineStyle.match(/font-style\s*:\s*(\w+)/i);
          if (fontStyleMatch && !targetFontStyle) {
            targetFontStyle = fontStyleMatch[1];
          }

          const textDecorationMatch = inlineStyle.match(
            /text-decoration\s*:\s*([^;]+)/i,
          );
          if (textDecorationMatch && !targetTextDecoration) {
            targetTextDecoration = textDecorationMatch[1].trim();
          }
        }

        // Обработка шрифтов формата <font size="...">
        if (tagName === 'font' && !targetFontSize) {
          const sizeAttr = el.getAttribute('size');
          if (sizeAttr) {
            const sizeNum = Number(sizeAttr);
            const ptMap: Record<number, number> = {
              1: 8,
              2: 10,
              3: 12,
              4: 14,
              5: 18,
              6: 24,
              7: 36,
            };
            const pt = ptMap[sizeNum] || 12;
            targetFontSize = `${Math.round((pt * 4) / 3)}px`;
          }
        }

        // Дефолтные стили для элементов в семантических тегах
        if (
          !targetFontWeight &&
          (el.matches('b, strong') || el.querySelector('b, strong'))
        ) {
          targetFontWeight = '700';
        }
        if (
          !targetFontStyle &&
          (el.matches('i, em') || el.querySelector('i, em'))
        ) {
          targetFontStyle = 'italic';
        }
        if (!targetTextDecoration && el.matches('u')) {
          targetTextDecoration = 'underline';
        }
        if (
          !targetTextDecoration &&
          (el.matches('s, del') || el.querySelector('s, del'))
        ) {
          targetTextDecoration = 'line-through';
        }

        // Перенос стилей
        if (
          targetFontSize ||
          targetFontWeight ||
          targetFontStyle ||
          targetTextDecoration
        ) {
          const wrapper = document.createElement('span');
          if (targetFontSize) wrapper.style.fontSize = targetFontSize;
          if (targetFontWeight) wrapper.style.fontWeight = targetFontWeight;
          if (targetFontStyle) wrapper.style.fontStyle = targetFontStyle;
          if (targetTextDecoration)
            wrapper.style.textDecoration = targetTextDecoration;

          while (el.firstChild) {
            wrapper.appendChild(el.firstChild);
          }

          if (tagName === 'font') {
            el.replaceWith(wrapper);
          } else {
            el.appendChild(wrapper);
            // Чистка родительского style, чтобы избежать дублирования
            if (el.hasAttribute('style')) {
              let newStyle = el
                .getAttribute('style')!
                .replace(/font-size\s*:[^;]*;?/gi, '')
                .replace(/font-weight\s*:[^;]*;?/gi, '')
                .replace(/font-style\s*:[^;]*;?/gi, '')
                .replace(/text-decoration\s*:[^;]*;?/gi, '')
                .replace(/;;/g, ';')
                .trim()
                .replace(/;$/, '');
              if (newStyle) {
                el.setAttribute('style', newStyle);
              } else {
                el.removeAttribute('style');
              }
            }
          }
        }
      }
    }

    // Обход ячеек, простановка дефолтного размера шрифта
    table.querySelectorAll('td, th').forEach((cell) => {
      const hasFontSize = cell.querySelector('[style*="font-size"]');
      if (!hasFontSize) {
        const wrapper = document.createElement('span');
        wrapper.style.fontSize = '14px';
        while (cell.firstChild) {
          wrapper.appendChild(cell.firstChild);
        }
        cell.appendChild(wrapper);
      }
    });
  }

  // Сценарий с обычной вставкой
  if (!isInTable || !isSingleTableInHTML(fragment)) {
    event.preventDefault();
    const parser = DOMParser.fromSchema(editorInstance.value.schema);
    const nodes = parser.parse(fragment);
    dispatch(state.tr.replaceSelectionWith(nodes, false));
    return true;
  }

  // Сценарий со вставкой внутрь таблицы
  const pastedTableEl = fragment.querySelector('table');
  if (!pastedTableEl) {
    event.preventDefault();
    const parser = DOMParser.fromSchema(editorInstance.value.schema);
    const nodes = parser.parse(fragment);
    dispatch(state.tr.replaceSelectionWith(nodes, false));
    return true;
  }

  event.preventDefault();
  const tableNode = parentTable.node;
  const tableStartPos = parentTable.pos;
  const schema = state.schema;

  // Получение положения места вставки в таблице
  let tableDepth = -1;
  for (let d = $from.depth; d >= 0; d--) {
    const node = $from.node(d);
    if (node.type.name === 'table') {
      tableDepth = d;
      break;
    }
  }

  // Если таблица не нашлась - обычная вставка
  if (tableDepth === -1) {
    const parser = DOMParser.fromSchema(schema);
    const nodes = parser.parse(fragment);
    dispatch(state.tr.replaceSelectionWith(nodes, false));
    return true;
  }

  const rowIndex = $from.index(tableDepth);
  const colIndex = $from.index(tableDepth + 1);

  // Преобразование вставляемой из буфера таблицы в матрицу с ячейками td и th
  const pastedRows = Array.from(pastedTableEl.querySelectorAll('tr'));
  const pastedMatrix: { content: string; isHeader: boolean }[][] =
    pastedRows.map((row) => {
      const cells = Array.from(row.querySelectorAll('td, th'));
      return cells.map((cell) => ({
        content: cell.innerHTML || '',
        isHeader: cell.tagName.toLowerCase() === 'th',
      }));
    });

  const pasteRowCount = pastedMatrix.length;
  const pasteColCount = pasteRowCount > 0 ? pastedMatrix[0].length : 0;

  if (pasteRowCount === 0 || pasteColCount === 0) {
    return false;
  }

  // Преобразование текущей таблицы в документе в матрицу с ячейками td и th
  const currentMatrix: { content: string; isHeader: boolean }[][] = [];
  tableNode.forEach((row) => {
    if (row.type.name !== 'tableRow') return;
    const rowCells: { content: string; isHeader: boolean }[] = [];
    row.forEach((cell) => {
      if (cell.type.name === 'tableCell' || cell.type.name === 'tableHeader') {
        const div = document.createElement('div');
        const cellContentDOM = DOMSerializer.fromSchema(
          schema,
        ).serializeFragment(cell.content);
        div.appendChild(cellContentDOM);
        rowCells.push({
          content: div.innerHTML,
          isHeader: cell.type.name === 'tableHeader',
        });
      }
    });
    currentMatrix.push(rowCells);
  });

  const currentRows = currentMatrix.length;
  const currentCols =
    currentRows > 0 ? Math.max(...currentMatrix.map((r) => r.length)) : 0;

  // Создание пустой матрицы нового размера, чтобы уместить данные обеих таблиц
  const newRows = Math.max(currentRows, rowIndex + pasteRowCount);
  const newCols = Math.max(currentCols, colIndex + pasteColCount);

  const newMatrix: { content: string; isHeader: boolean }[][] = Array(newRows)
    .fill(null)
    .map(() =>
      Array(newCols)
        .fill(null)
        .map(() => ({ content: '', isHeader: false })),
    );

  // Перенос данных в новую пустую матрицу
  for (let r = 0; r < newRows; r++) {
    for (let c = 0; c < newCols; c++) {
      const sourceCell = currentMatrix[r]?.[c];
      newMatrix[r][c] = sourceCell ?? { content: '', isHeader: false };
    }
  }

  const isFirstRowHeader =
    currentRows > 0 &&
    currentMatrix[0].length > 0 &&
    currentMatrix[0][0].isHeader === true;

  // Перенос данных двух матриц (таблиц)
  for (let r = 0; r < pasteRowCount; r++) {
    for (let c = 0; c < pasteColCount; c++) {
      const sourceCell = pastedMatrix[r]?.[c];
      if (sourceCell !== undefined) {
        // Перенос заголовков из вставляемой таблицы только если первая ячейка первой строки - заголовок
        const isHeader =
          rowIndex === 0 && isFirstRowHeader ? sourceCell.isHeader : false;
        newMatrix[rowIndex + r][colIndex + c] = {
          content: sourceCell.content,
          isHeader,
        };
      }
    }
  }

  // Вся первая строка также становится заголовками, если первая ячейка первой строки - заголовок
  if (isFirstRowHeader) {
    for (let c = 0; c < newCols; c++) {
      newMatrix[0][c] = {
        content: newMatrix[0][c].content,
        isHeader: true,
      };
    }
  }

  // Преобразование обработанной матрицы в ноды
  const parser = DOMParser.fromSchema(schema);
  const newTableContent = [];

  for (const rowHtmlArr of newMatrix) {
    const rowCells = rowHtmlArr.map((cellData) => {
      const div = document.createElement('div');
      div.innerHTML = cellData.content || '<p></p>';
      const parsed = parser.parse(div);

      const cellType = cellData.isHeader
        ? schema.nodes.tableHeader
        : schema.nodes.tableCell;

      return cellType.createAndFill({}, parsed.content);
    });
    newTableContent.push(schema.nodes.tableRow.createAndFill({}, rowCells));
  }

  const newTableNode = schema.nodes.table.createAndFill({}, newTableContent);

  // Замена старой таблицы на расширенную и обработанную
  const tr = state.tr.replaceWith(
    tableStartPos,
    tableStartPos + tableNode.nodeSize,
    newTableNode,
  );
  dispatch(tr);

  return true;
};
