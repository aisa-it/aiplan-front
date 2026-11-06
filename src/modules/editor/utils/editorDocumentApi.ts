export interface PlaygroundDocument {
  id?: string;
  title: string;
  content: string;
}

export interface PlaygroundDocumentOption {
  id: string;
  title: string;
  depth: number;
}

interface DocLight {
  id?: string;
  title?: string;
  has_child_docs?: boolean;
}

const documentPath = (workspace: string, document: string) =>
  `/api/auth/workspaces/${encodeURIComponent(workspace)}/doc/${encodeURIComponent(document)}/`;

const readResponse = async (response: Response) => {
  const body: unknown = await response.json().catch(() => undefined);
  if (response.ok) return body;
  const message =
    body && typeof body === 'object' && 'ru_error' in body
      ? String(body.ru_error)
      : `Ошибка HTTP ${response.status}`;
  throw new Error(message);
};

const readDocumentList = async (path: string): Promise<DocLight[]> => {
  const body = await readResponse(await fetch(path, { credentials: 'include' }));
  if (!Array.isArray(body)) {
    throw new Error('API вернул неверный список документов');
  }
  return body as DocLight[];
};

export const listPlaygroundDocuments = async (
  workspace: string,
): Promise<PlaygroundDocumentOption[]> => {
  const basePath = `/api/auth/workspaces/${encodeURIComponent(workspace)}/doc/`;
  const visited = new Set<string>();

  const collect = async (docs: DocLight[], depth: number): Promise<PlaygroundDocumentOption[]> => {
    const branches = await Promise.all(docs.map(async (doc) => {
      if (!doc.id || visited.has(doc.id)) return [];
      visited.add(doc.id);
      const item = { id: doc.id, title: doc.title || doc.id, depth };
      if (!doc.has_child_docs) return [item];
      const children = await readDocumentList(`${basePath}${encodeURIComponent(doc.id)}/child/`);
      return [item, ...await collect(children, depth + 1)];
    }));
    return branches.flat();
  };

  return collect(await readDocumentList(basePath), 0);
};

export const loadPlaygroundDocument = async (
  workspace: string,
  document: string,
) => {
  const body = await readResponse(
    await fetch(documentPath(workspace, document), {
      credentials: 'include',
    }),
  );
  if (
    !body ||
    typeof body !== 'object' ||
    !('content' in body) ||
    typeof body.content !== 'string'
  ) {
    throw new Error('API вернул документ без HTML-содержимого');
  }
  return body as PlaygroundDocument;
};

export const prepareEditorContentForSave = async (html: string) => {
  const files: File[] = [];
  let preparedHtml = '';
  let cursor = 0;
  for (const image of html.matchAll(/<img\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi)) {
    const source =
      /\bsrc\s*=\s*(["'])(data:image\/[\w.+-]+;base64,[^"']+)\1/i.exec(
        image[0],
      );
    if (!source || image.index === undefined || source.index === undefined)
      continue;
    const src = source[2];
    const response = await fetch(src);
    const blob = await response.blob();
    const name = `${crypto.randomUUID()}-${files.length}`;
    files.push(new File([blob], name, { type: blob.type }));
    const sourceStart = image.index + source.index + source[0].indexOf(src);
    preparedHtml += html.slice(cursor, sourceStart) + `/api/auth/file/${name}`;
    cursor = sourceStart + src.length;
  }
  const content = preparedHtml + html.slice(cursor);
  const onlyEmptyParagraphs =
    content.replace(/<p>(\s|&nbsp;|<br>|<\/?span[^>]*>)*<\/p>/gi, '').trim() === '';
  return { html: onlyEmptyParagraphs ? '' : content, files };
};

export const prepareDocumentContent = prepareEditorContentForSave;

export const savePlaygroundDocument = async (
  workspace: string,
  document: string,
  title: string,
  html: string,
) => {
  const prepared = await prepareEditorContentForSave(html);
  const form = new FormData();
  form.append('doc', JSON.stringify({ title, content: prepared.html }));
  prepared.files.forEach((file) => form.append('files', file));
  await readResponse(
    await fetch(documentPath(workspace, document), {
      method: 'PATCH',
      body: form,
      credentials: 'include',
    }),
  );
};
