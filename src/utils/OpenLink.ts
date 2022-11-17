import { Linking } from 'react-native';
import { captureError } from 'src/core/services/sentry';

export default async function openLink(urlPath: string) {
  try {
    await Linking.openURL(urlPath);
  } catch (error) {
    captureError(error);
  }
}
