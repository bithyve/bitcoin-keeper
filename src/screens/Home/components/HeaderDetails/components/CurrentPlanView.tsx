import React, { useContext, useEffect, useState } from 'react';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import { StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import PlebIcon from 'src/assets/images/pleb_white.svg';
import HodlerIcon from 'src/assets/images/hodler.svg';
import DiamondIcon from 'src/assets/images/diamond_hands.svg';
import SettingIcon from 'src/assets/images/settings.svg';
import AppStatus from './AppStatus';
import { useAppSelector } from 'src/store/hooks';
import useToastMessage from 'src/hooks/useToastMessage';
import { useDispatch } from 'react-redux';
import { setStatusMessage } from 'src/store/reducers/login';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import KeeperModal from 'src/components/KeeperModal';
import OfflineIllustration from 'src/assets/images/offline-illustration.svg';
import { switchAppStatus } from 'src/store/sagaActions/login';
import Buttons from 'src/components/Buttons';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { hp, wp } from 'src/constants/responsive';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import UpgradePill from './UpgradePill';

function CurrentPlanView({ plan }) {
  const navigation = useNavigation();
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();
  const { translations } = useContext(LocalizationContext);
  const { login } = translations;
  const [showModal, setShowModal] = useState(false);
  const { statusMessage, isOffline, isLoading } = useAppSelector((state) => state?.login);
  const isPleb = plan === SubscriptionTier.L1.toUpperCase();

  useEffect(() => {
    if (statusMessage.message) {
      showToast(statusMessage.message, statusMessage.status ? <TickIcon /> : <ToastErrorIcon />);
      dispatch(setStatusMessage({ message: '', status: false }));
    }
  }, [statusMessage]);

  return (
    <Box style={styles.wrapper}>
      <ActivityIndicatorView visible={isLoading} showLoader />
      <Box style={styles.planContianer}>
        {!isOffline && (
          <TouchableOpacity
            testID={`btn_choosePlan`}
            style={styles.plan}
            onPress={() => navigation.navigate('ChoosePlan')}
          >
            {plan === 'Pleb'.toUpperCase() && <PlebIcon />}
            {plan === 'Hodler'.toUpperCase() && <HodlerIcon />}
            {plan === 'Diamond Hands'.toUpperCase() && <DiamondIcon />}
            <Text
              testID="text_home_current_plan"
              style={styles.currentPlanText}
              color={`${colorMode}.choosePlanHome`}
              bold
            >
              {plan}
            </Text>
          </TouchableOpacity>
        )}
        {isOffline && (
          <Box style={styles.appStatus}>
            <AppStatus setShowModal={setShowModal} />
          </Box>
        )}
        {!isOffline && isPleb && <UpgradePill />}
      </Box>
      <Box style={styles.settings}>
        <TouchableOpacity
          style={{ padding: 5 }}
          onPress={() => navigation.navigate('AppSettings')}
          testID="btn_settings"
        >
          <SettingIcon />
        </TouchableOpacity>
      </Box>
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
                  setShowModal(false);
                  dispatch(switchAppStatus());
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
}
const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planContianer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  plan: {
    flexDirection: 'row',
    gap: 5,
  },
  appStatus: {
    alignItems: 'center',
  },
  settings: {
    alignItems: 'center',
  },
  titleTxet: {
    fontSize: 12,
  },
  currentPlanText: {
    fontSize: 20,
    letterSpacing: 0.2,
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
export default CurrentPlanView;
