import React, { useContext, useState } from 'react';
import { Box, HStack, Pressable, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import DotIcon from 'src/assets/images/dot-cream.svg';
import { StyleSheet } from 'react-native';
import KeeperModal from 'src/components/KeeperModal';
import OfflineIllustration from 'src/assets/images/offline-illustration.svg';
import { hp, wp } from 'src/constants/responsive';
import { switchAppStatus } from 'src/store/sagaActions/login';
import { useDispatch } from 'react-redux';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Buttons from 'src/components/Buttons';

const AppStatus = () => {
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const { translations } = useContext(LocalizationContext);
  const { login, common } = translations;
  const [showModal, setShowModal] = useState(false);

  return (
    <Box>
      <Pressable onPress={() => setShowModal(true)}>
        <Box
          style={styles.statusContainer}
          backgroundColor={`${colorMode}.appStatusButtonBackground`}
          borderColor={`${colorMode}.greyBorderTranslucent`}
        >
          <HStack style={styles.contentContainer}>
            <DotIcon />
            <Text color={`${colorMode}.appStatusTextColor`} style={styles.textStyle}>
              {common.offline}
            </Text>
          </HStack>
        </Box>
      </Pressable>
      <KeeperModal
        visible={showModal}
        close={() => setShowModal(false)}
        closeOnOverlayClick
        title={login.offlineModalTitle}
        subTitle={login.offlineModalSubTitle}
        showCloseIcon={false}
        textColor={`${colorMode}.modalWhiteContent`}
        subTitleColor={`${colorMode}.secondaryText`}
        subTitleWidth={wp(290)}
        secButtonTextColor={`${colorMode}.greenButtonBackground`}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        buttonTextColor={`${colorMode}.white`}
        buttonBackground={`${colorMode}.greenButtonBackground`}
        Content={() => (
          <Box>
            <Box style={styles.illustration}>
              <OfflineIllustration />
            </Box>
            <Text color={`${colorMode}.secondaryText`}>{login.offlineModalDesc}</Text>
            <Box style={styles.CTAWrapper}>
              <Buttons
                primaryText={login.retryConnection}
                primaryCallback={() => {
                  dispatch(switchAppStatus());
                  setShowModal(false);
                }}
                secondaryText={login.continueOffline}
                secondaryCallback={() => setShowModal(false)}
                width={wp(150)}
              />
            </Box>
          </Box>
        )}
      />
    </Box>
  );
};

const styles = StyleSheet.create({
  statusContainer: {
    width: 68,
    height: 27,
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2.5,
  },
  textStyle: {
    fontSize: 12,
    lineHeight: 17,
  },
  illustration: {
    marginBottom: hp(30),
    marginRight: wp(25),
    alignSelf: 'center',
  },
  CTAWrapper: {
    marginTop: hp(30),
  },
});

export default AppStatus;
