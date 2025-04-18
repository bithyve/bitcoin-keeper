import { Alert, Platform } from 'react-native';
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
        Alert.alert(
          'Keeper Private',
          'You have been downgraded from Keeper Private, the app will now restart to apply the changes.',
          [
            {
              text: 'OK',
              onPress: async () => {
                const response = await changeIcon(ANDROID_ICONS.default);
                return response;
              },
            },
          ]
        );
      }
      return false;
    } else {
      const response = await resetIcon();
      return response;
    }
  };

  const changeToKeeperPrivateIcon = async () => {
    const currentIcon = await getCurrentIcon();
    if (isAndroid) {
      if (currentIcon === ANDROID_ICONS.keeperPrivate) return false;
      Alert.alert(
        'Keeper Private',
        'Your Keeper Private subscription has been successfully redeemed. The app will now restart to apply the changes.',
        [
          {
            text: 'OK',
            onPress: async () => {
              const response = await changeIcon(ANDROID_ICONS.keeperPrivate);
              return response;
            },
          },
        ]
      );
    } else {
      if (currentIcon == iOsKeeperPrivateIcon) return false;
      const response = await changeIcon(iOsKeeperPrivateIcon);
      return response;
    }
    return false;
  };

  return { getIcon, changeToDefaultIcon, changeToKeeperPrivateIcon };
};
