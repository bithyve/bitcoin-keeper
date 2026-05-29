import { Platform } from 'react-native';
import { errorCodes, isErrorWithCode, pick, types } from '@react-native-documents/picker';
import RNFS from 'react-native-fs';

const pickDocument = async () => {
  try {
    const result = await pick({
      type: [types.allFiles],
    });
    try {
      const filePath = result[0].uri.split('%20').join(' ');
      const file = await RNFS.readFile(filePath);
      return file;
    } catch (error) {
      throw error;
    }
  } catch (error) {
    // user cancelled
    if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
      return null;
    }
    return error;
  }
};

const persistDocument = async (sourcePath: string, desPath?: string) => {
  try {
    const ext = Platform.OS === 'ios' ? sourcePath.split('.').pop() : 'jpg';
    const defaultDestPath =
      desPath ?? `file://${RNFS.DocumentDirectoryPath}/dp_${Date.now()}.${ext}`;
    await RNFS.copyFile(sourcePath, desPath ?? defaultDestPath);
    return defaultDestPath;
  } catch (error) {
    console.log('🚀 ~ persistDocument ~ error:', error);
    return null;
  }
};

const getPersistedDocument = (sourcePath: string) => {
  if (!sourcePath) return sourcePath;
  return `file://${RNFS.DocumentDirectoryPath}/dp_${sourcePath.split('dp_')[1]}`;
};

export { pickDocument, persistDocument, getPersistedDocument };
