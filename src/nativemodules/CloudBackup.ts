import { NativeModules } from 'react-native';

const { CloudBackup } = NativeModules;

export interface Response {
  status: boolean;
  error: string;
  data: string;
}

export default class CloudBackupModule {
  static setup = async (): Promise<boolean> => CloudBackup.setup();
  static login = async (): Promise<Response> => {
    const response = await CloudBackup.login();
    return await JSON.parse(response);
  };
  static bsmsHealthCheck = async (): Promise<Response> => {
    const response = await CloudBackup.bsmsHealthCheck();
    return await JSON.parse(response);
  };
  static backupBsms = async (bsms: string, password: string): Promise<Response> => {
    const response = await CloudBackup.backupBsms(bsms, password);
    return await JSON.parse(response);
  };
}
