import { Box, useColorMode } from 'native-base';
import React, { useContext, useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import SettingCard from './Component/SettingCard';
import { useSettingKeeper } from 'src/hooks/useSettingKeeper';
import { hp, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import CheckBoxActive from 'src/assets/images/checkbox_active.svg';
import CheckBoxInactive from 'src/assets/images/checkbox_inactive.svg';
import NetworkModeIcon from 'src/assets/images/SettingNetworkMode.svg';
import KeeperModal from 'src/components/KeeperModal';
import Buttons from 'src/components/Buttons';
import { NetworkType } from 'src/services/wallets/enums';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { changeBitcoinNetwork } from 'src/store/sagaActions/settings';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/tick_icon.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';

const SettingsApp = () => {
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const { settings, common } = useContext(LocalizationContext).translations;
  const { bitcoinNetworkType } = useAppSelector((state) => state.settings);
  const { showToast } = useToastMessage();
  const [networkModeModal, setNetworkModeModal] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(bitcoinNetworkType);
  const [loading, setLoading] = useState(false);

  let appSetting = [
    ...useSettingKeeper().appSetting,
    {
      title: settings.networkModeTitle,
      description: settings.networkModeSubTitle,
      icon: <NetworkModeIcon width={16.5} height={16} />,
      onPress: () => setNetworkModeModal(true),
      isDiamond: false,
    },
  ];

  const NETWORK_OPTIONS = [
    {
      label: NetworkType.MAINNET.charAt(0) + NetworkType.MAINNET.slice(1).toLowerCase(),
      onPress: () => setSelectedNetwork(NetworkType.MAINNET),
      id: NetworkType.MAINNET,
    },
    {
      label: NetworkType.TESTNET.charAt(0) + NetworkType.TESTNET.slice(1).toLowerCase(),
      onPress: () => setSelectedNetwork(NetworkType.TESTNET),
      id: NetworkType.TESTNET,
    },
  ];

  const confirmNetworkMode = () => {
    Alert.alert('', settings.networkModeChangeConfirmationTitle, [
      {
        text: common.cancel,
        onPress: () => {
          setNetworkModeModal(false);
          setSelectedNetwork(bitcoinNetworkType);
        },
        style: 'cancel',
      },
      {
        text: common.ok,
        onPress: () => {
          setLoading(true);
          setNetworkModeModal(false);
          setSelectedNetwork(selectedNetwork);
          dispatch(
            changeBitcoinNetwork(selectedNetwork, (success) => {
              setLoading(false);
              if (success) showToast('Bitcoin network updated successfully', <TickIcon />);
              else
                showToast('Failed to update Bitcoin network. Please try again', <ToastErrorIcon />);
            })
          );
        },
      },
    ]);
  };

  return (
    <ScreenWrapper>
      <Box style={styles.container}>
        <Box style={styles.header}>
          <WalletHeader title={settings.appSetting} />
        </Box>

        <SettingCard
          subtitleColor={`${colorMode}.balanceText`}
          backgroundColor={`${colorMode}.textInputBackground`}
          borderColor={`${colorMode}.separator`}
          items={appSetting}
        />

        <KeeperModal
          visible={networkModeModal}
          closeOnOverlayClick={false}
          close={() => setNetworkModeModal(false)}
          title={settings.networkModeTitle}
          subTitleWidth={wp(240)}
          subTitle={settings.networkModeModalSubTitle}
          modalBackground={`${colorMode}.modalWhiteBackground`}
          textColor={`${colorMode}.modalHeaderTitle`}
          subTitleColor={`${colorMode}.modalSubtitleBlack`}
          Content={() => (
            <Box>
              <Box style={styles.optionsWrapper}>
                {NETWORK_OPTIONS.map((option, index) => (
                  <OptionItem
                    key={index}
                    option={option}
                    colorMode={colorMode}
                    active={option.id === selectedNetwork}
                  />
                ))}
              </Box>
              <Box marginTop={hp(20)}>
                <Buttons
                  primaryText={settings.networkChangePrimaryCTA}
                  fullWidth
                  primaryCallback={() => confirmNetworkMode()}
                />
              </Box>
            </Box>
          )}
        />
        <ActivityIndicatorView visible={loading} showLoader />
      </Box>
    </ScreenWrapper>
  );
};

export default SettingsApp;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    marginBottom: 18,
  },
  optionCTR: {
    flexDirection: 'row',
    paddingHorizontal: wp(16),
    paddingVertical: hp(19),
    alignItems: 'center',
    gap: wp(20),
    borderRadius: 12,
    borderWidth: 1,
  },
  optionsWrapper: {
    gap: hp(10),
  },
});

const OptionItem = ({ option, colorMode, active }) => (
  <Pressable onPress={option.onPress}>
    <Box
      style={styles.optionCTR}
      backgroundColor={`${colorMode}.boxSecondaryBackground`}
      borderColor={`${colorMode}.greyBorder`}
    >
      {active ? (
        <CheckBoxActive width={wp(18)} height={wp(18)} />
      ) : (
        <CheckBoxInactive width={wp(18)} height={wp(18)} />
      )}
      <Text fontSize={14} medium>
        {option.label}
      </Text>
    </Box>
  </Pressable>
);
