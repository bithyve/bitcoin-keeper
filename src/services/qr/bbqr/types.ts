import { ENCODING_NAMES, FILETYPE_NAMES, QR_DATA_CAPACITY } from './consts';

export type FileType = keyof typeof FILETYPE_NAMES;
export type Encoding = keyof typeof ENCODING_NAMES;
export type Version = keyof typeof QR_DATA_CAPACITY;

export type SplitOptions = {
  encoding?: Encoding;
  minSplit?: number;
  maxSplit?: number;
  minVersion?: Version;
  maxVersion?: Version;
};

export type SplitResult = {
  version: Version;
  parts: string[];
  encoding: Encoding;
};

export type JoinResult = {
  fileType: FileType;
  encoding: Encoding;
  raw: Uint8Array;
};

export type ImageOptions = {
  frameDelay?: number;
  randomizeOrder?: boolean;
};
