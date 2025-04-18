import { Platform } from 'react-native';
import { changeIcon, getIcon as getCurrentIcon, resetIcon } from 'react-native-change-icon';

const isAndroid = Platform.OS == 'android';
const ANDROID_ICONS = {
  default: 'io.hexawallet.keeper.MainActivityDefault',
  keeperPrivate: 'io.hexawallet.keeper.MainActivityKp',
};
const iOsKeeperPrivateIcon = 'KpAppIcon';

export const AppIconWrapper = () => {
  const getIcon = async () => {
    const response = await getCurrentIcon();
    return response;
  };

  const changeToDefaultIcon = async () => {
    if (isAndroid) {
      const currentIcon = await getCurrentIcon();
      if (currentIcon != ANDROID_ICONS.default) {
        const response = await changeIcon(ANDROID_ICONS.default);
        return response;
      }
      return false;
    } else {
      const response = await resetIcon();
      return response;
    }
  };

  const changeToKeeperPrivateIcon = async () => {
    const currentIcon = await getCurrentIcon();
    if (![ANDROID_ICONS.keeperPrivate, iOsKeeperPrivateIcon].includes(currentIcon)) {
      const response = await changeIcon(
        isAndroid ? ANDROID_ICONS.keeperPrivate : iOsKeeperPrivateIcon
      );
      return response;
    }
    return false;
  };

  return { getIcon, changeToDefaultIcon, changeToKeeperPrivateIcon };
};
