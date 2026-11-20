import { httpClient } from '@/services/clients';

const UPLOAD_ENDPOINT = '/api/auth/attachments/tus/';
const TUS_CONTENT_TYPE = 'application/offset+octet-stream';
const TUS_HEADERS = { 'Tus-Resumable': '1.0.0' };

const encodeMetadata = (metadata: Record<string, string>) =>
  Object.entries(metadata)
    .map(([key, value]) => {
      if (!value) return key;

      const bytes = new TextEncoder().encode(value);
      return `${key} ${btoa(String.fromCharCode(...bytes))}`;
    })
    .join(',');

const startUpload = async (issueId: string, file: File) => {
  const { headers } = await httpClient.post(UPLOAD_ENDPOINT, null, {
    headers: {
      ...TUS_HEADERS,
      'Content-Type': false,
      'Upload-Length': file.size,
      'Upload-Metadata': encodeMetadata({
        file_name: file.name,
        file_type: file.type,
        file_size: String(file.size),
        issue_id: issueId,
        entity_type: 'issue',
      }),
    },
  });

  const { location } = headers;
  if (typeof location !== 'string' || !location) {
    throw new Error(
      'The attachment upload response did not include a location',
    );
  }

  const endpoint = new URL(UPLOAD_ENDPOINT, window.location.origin);
  const { pathname, search } = new URL(location, endpoint);
  if (!pathname.startsWith(UPLOAD_ENDPOINT)) {
    throw new Error('The attachment upload returned an unexpected path');
  }
  // Keep upload traffic on the same origin, including when Vite proxies the API.
  return pathname + search;
};

const getUploadOffset = async (path: string, size: number) => {
  const { headers, status } = await httpClient.head(path, {
    headers: TUS_HEADERS,
    validateStatus: (code) =>
      (code >= 200 && code < 300) || code === 404 || code === 410,
  });
  if (status === 404 || status === 410) return undefined;

  const offset = Number(headers['upload-offset'] ?? NaN);
  const length = Number(headers['upload-length'] ?? NaN);
  if (
    length !== size ||
    !Number.isSafeInteger(offset) ||
    offset < 0 ||
    offset > size
  ) {
    throw new Error('The attachment server returned invalid upload progress');
  }
  return offset;
};

export const uploadIssueAttachment = async (
  issueId: string,
  upload: { file: File; path?: string },
) => {
  const { file } = upload;
  let path = upload.path;
  let offset =
    path === undefined ? undefined : await getUploadOffset(path, file.size);

  if (path === undefined || offset === undefined) {
    path = await startUpload(issueId, file);
    upload.path = path;
    offset = 0;
  }

  if (offset === file.size) return;

  const content = file.slice(offset, file.size, TUS_CONTENT_TYPE);
  const { headers } = await httpClient.patch(path, content, {
    headers: {
      ...TUS_HEADERS,
      'Content-Type': TUS_CONTENT_TYPE,
      'Upload-Offset': offset,
    },
  });
  if (Number(headers['upload-offset'] ?? NaN) !== file.size) {
    throw new Error('The attachment server did not confirm a complete upload');
  }
};
