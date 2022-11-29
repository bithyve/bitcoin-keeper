import { addSemanticDecode, addSemanticEncode, DataItem } from './lib';

const alreadyPatchedTag: number[] = [];
export const patchTags = (tags: number[]): void => {
  tags.forEach((tag) => {
    if (alreadyPatchedTag.find((i) => i === tag)) return;
    addSemanticEncode(tag, (data: any) => {
      if (data instanceof DataItem) {
        if (data.getTag() === tag) {
          return data.getData();
        }
      }
    });
    addSemanticDecode(tag, (data: any) => {
      return new DataItem(data, tag);
    });
    alreadyPatchedTag.push(tag);
  });
};
