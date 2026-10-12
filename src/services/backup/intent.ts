export type BackupWriteIntent = Readonly<{
  appId: string;
  accountSession: number;
  baseRevision: string;
  baselineEpoch: number;
}>;
