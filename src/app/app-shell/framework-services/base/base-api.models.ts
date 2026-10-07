export interface GridSchemaRecord {
  FieldName: string;
  Caption: string;
  Visible: string;
  Width: string | number;
  Separator?: string | null;
  [key: string]: unknown;
}

export interface GridSchemaResponse {
  GridSchemas: GridSchemaRecord[];
}

export interface LookupRecord {
  Code?: string | number | null;
  Name?: string | null;
  [key: string]: unknown;
}

export interface LookupResponse {
  Lookups: LookupRecord[];
}

export interface ServerDateResponse {
  Text: string;
}

export interface BaseApiRecord {
  [key: string]: unknown;
}

export interface BaseApiResponse {
  AttachedFiles?: BaseApiRecord[];
  users?: BaseApiRecord[];
  ObjectTypes?: BaseApiRecord[];
  applications?: BaseApiRecord[];
  Customers?: BaseApiRecord[];
  PropertyValues?: BaseApiRecord[];
  Centrals?: BaseApiRecord[];
  [key: string]: unknown;
}

export interface BaseFileDownloadResponse {
  success: boolean;
  base64: string;
  fileName: string;
  fileType: string;
}

export interface BaseImageResponse {
  Text?: string | null;
}

export interface PasswordChangeUserRecord extends BaseApiRecord {
  ErrDesc?: string | null;
}

export interface PasswordChangeResponse extends BaseApiResponse {
  users?: PasswordChangeUserRecord[];
}
