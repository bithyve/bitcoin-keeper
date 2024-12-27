import { Box, useColorMode } from 'native-base';
import React, { useCallback, useContext } from 'react';
import { StyleSheet } from 'react-native';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, windowWidth } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import KeeperQRCode from 'src/components/KeeperQRCode';
import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';

function ShareQR({ route }) {
  const { details, onShared } = route.params;
  const navigation = useNavigation();
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultText } = translations;

  useFocusEffect(
    useCallback(() => {
      return () => {
        navigation.dispatch((state) => {
          const routes = state.routes.slice(0, -1);
          return CommonActions.reset({
            ...state,
            routes,
            index: routes.length - 1,
          });
        });
        onShared?.();
      };
    }, [onShared, navigation])
  );

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader title={vaultText.shareQRTitle} subtitle={vaultText.shareQRSubtitle} />
      <Box style={styles.container}>
        <Box>{details && <KeeperQRCode qrData={details} size={windowWidth * 0.6} showLogo />}</Box>
      </Box>
    </ScreenWrapper>
  );
}

export default ShareQR;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: hp(47),
  },
});
