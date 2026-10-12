/** The verified remote base and account session held by one originating write. */
export type BackupWriteIntent = Readonly<{
  appId: string;
  accountSession: number;
  baseRevision: string;
  baselineEpoch: number;
}>;
