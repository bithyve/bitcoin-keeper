import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { captureError } from 'src/services/sentry';
import DocumentPicker from 'react-native-document-picker';

export const exportFile = async (fileData, fileName, onError) => {
  try {
    if (!fileData) {
      return;
    }
    const filePath = RNFS.TemporaryDirectoryPath + fileName;
    await RNFS.writeFile(filePath, fileData);
    await Share.open({
      url: 'file://' + filePath,
      saveToFiles: true,
      // @ts-ignore: Property 'useInternalStorage' exists in type 'ShareOptions' but is missing in type 'ShareOptions'.
      useInternalStorage: Platform.OS === 'android',
      failOnCancel: false,
    })
      .catch((error) => {
        if (error.message === 'CANCELLED') {
          return;
        }
        onError(error);
      })
      .finally(() => {
        RNFS.unlink(filePath);
      });
  } catch (error) {
    captureError(error);
  }
};

export const importFile = async (onFileRead, onError) => {
  try {
    const result = await DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles],
    });
    try {
      const filePath = result[0].uri.split('%20').join(' ');
      const fileExtract = await RNFS.readFile(filePath);
      onFileRead(fileExtract);
    } catch (err) {
      captureError(err);
      onError(err);
    }
  } catch (err) {
    if (err.toString().includes('user canceled')) {
      // user cancelled
      return;
    }
    captureError(err);
    onError(err);
  }
};
