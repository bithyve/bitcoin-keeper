export interface ICryptoKey {
  isECKey: () => boolean;
  getOutputDescriptorContent: () => string;
}

export type DataItemMap = Record<string, any>;
