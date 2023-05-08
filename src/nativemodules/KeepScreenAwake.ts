import { NativeModules } from 'react-native';

const { KeepScreenAwake } = NativeModules;

export default class KeepAwake {
  static activate = async (): Promise<void> => KeepScreenAwake.keepAwake(true);

  static deactivate = async (): Promise<void> => KeepScreenAwake.keepAwake(false);
}
