import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { captureError } from 'src/services/sentry';
import DocumentPicker from 'react-native-document-picker';
import { Alert, PermissionsAndroid, Platform } from 'react-native';

const saveToLocal = async (filePath, onError) => {
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
};
export const exportFile = async (fileData, fileName, onError) => {
  try {
    if (!fileData) {
      return;
    }
    if (Platform.OS === 'ios') {
      const filePath = RNFS.TemporaryDirectoryPath + fileName;
      await RNFS.writeFile(filePath, fileData);
      await saveToLocal(filePath, onError);
    } else if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED || Platform.Version >= 30) {
        const filePath = RNFS.DownloadDirectoryPath + `/${fileName}`;
        await RNFS.writeFile(filePath, fileData);
        await saveToLocal(filePath, onError);
      } else {
        Alert.alert('Permission Denied!', 'You need to give storage permission to save the file');
      }
    }
  } catch (error) {
    captureError(error);
  }
};

export const importFile = async (onFileRead, onError, encoding = null) => {
  try {
    const result = await DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles],
    });
    try {
      const filePath = result[0].uri.split('%20').join(' ');
      const fileExtract = await RNFS.readFile(filePath, encoding);
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
