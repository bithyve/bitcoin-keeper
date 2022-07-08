import { ObjectSchema } from "realm";
import { RealmSchema } from "../enum";

export const VersionHistorySchema: ObjectSchema = {
  name: RealmSchema.VersionHistory,
  properties: {
    version: "string",
    releaseNote: "string?",
    date: "string",
    title: "string",
  },
};
