export function normalizeOfficeLists(doc: Document) {
  const rules: { selector: string; value: string }[] = [];
  for (const style of doc.querySelectorAll('style')) {
    for (const match of (style.textContent ?? '').matchAll(
      /([^{}]+)\{([^{}]*)\}/g,
    )) {
      const value = match[2]
        ?.match(/(?:^|;)\s*mso-list\s*:\s*([^;}]+)/i)?.[1]
        ?.trim();
      if (value) rules.push({ selector: match[1]!.trim(), value });
    }
  }
  const listStyle = (element: Element) => {
    let value = '';
    for (const rule of rules) {
      try {
        if (element.matches(rule.selector)) value = rule.value;
      } catch {}
    }
    return (
      element
        .getAttribute('style')
        ?.match(/mso-list\s*:\s*([^;}]+)/i)?.[1]
        ?.trim() || value
    );
  };
  for (const parent of Array.from(doc.body.querySelectorAll('*')).concat(
    doc.body,
  )) {
    let stack: {
      level: number;
      list: HTMLElement;
      item: HTMLElement;
      key: string;
    }[] = [];
    for (const element of Array.from(parent.children)) {
      const metadata = listStyle(element).match(
        /(l\d+)\s+level(\d+)\s+(lfo\d+)/i,
      );
      const marker = Array.from(element.querySelectorAll('span')).find((span) =>
        /^ignore$/i.test(listStyle(span).trim()),
      );

      if (element.tagName !== 'P' || !metadata || !marker) {
        stack = [];
        continue;
      }
      const text = marker.textContent?.trim() || '';
      const number = text.match(/^(\d+)[.)]/);
      const ordered = !!number || /^[a-zivxlcdm]+[.)]/i.test(text);
      const tag = ordered ? 'ol' : 'ul';
      const level = Number(metadata[2]);
      const key = `${metadata[1]}:${metadata[3]}:${tag}`;
      while (stack.length && stack[stack.length - 1]!.level > level)
        stack.pop();
      if (
        stack.length &&
        stack[stack.length - 1]!.level === level &&
        stack[stack.length - 1]!.key !== key
      )
        stack.pop();
      let current = stack[stack.length - 1];
      if (!current || current.level !== level) {
        const list = doc.createElement(tag);
        if (number && Number(number[1]) !== 1)
          list.setAttribute('start', number[1]!);
        if (current) current.item.append(list);
        else parent.insertBefore(list, element);
        current = { level, list, item: doc.createElement('li'), key };
        stack.push(current);
      }
      marker.remove();
      const item = doc.createElement('li');
      current.list.append(item);
      item.append(element);
      current.item = item;
    }
  }
}
