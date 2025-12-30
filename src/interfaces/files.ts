export interface IAttachmentCard {
  created_at: string;
  id: string;
  asset: {
    id: string;
    name: string;
    size: number;
    content_type: string;
  };
  draft?: boolean;
}

export type FileAttUploadProgressFunc = (
  fileName: string,
  bytesUploaded: number,
  bytesTotal: number,
  canceled?: boolean,
) => void;
