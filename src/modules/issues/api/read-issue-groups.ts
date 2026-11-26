import type { DtoIssueWithCount } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import type { IssueGroupEntity, IssueGroupResult } from '../model/issue-groups';

const parseGroup = (line: string): IssueGroupResult => {
  const value: {
    entity?: IssueGroupEntity;
    issues?: DtoIssueWithCount[] | null;
    count?: number;
  } = JSON.parse(line);
  if (
    !value ||
    typeof value.count !== 'number' ||
    (value.issues != null && !Array.isArray(value.issues))
  ) {
    throw new Error('Invalid issue group response');
  }
  return {
    entity: value.entity ?? null,
    items: value.issues ?? [],
    total: value.count,
  };
};

export const readIssueGroups = async (
  body: ReadableStream<Uint8Array>,
  onGroup: (group: IssueGroupResult) => void,
) => {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let remainder = '';

  const emit = (line: string) => {
    if (line.trim()) onGroup(parseGroup(line));
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = (remainder + decoder.decode(value, { stream: true })).split(
        '\n',
      );
      remainder = lines.pop() ?? '';
      lines.forEach(emit);
    }
    emit(remainder + decoder.decode());
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
};
