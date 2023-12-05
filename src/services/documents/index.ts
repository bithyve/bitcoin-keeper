import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';

const pickDocument = async () => {
  try {
    const result = await DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles],
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
    if (error.toString().includes('user canceled')) {
      return null;
    }
    return error;
  }
};

export { pickDocument };
