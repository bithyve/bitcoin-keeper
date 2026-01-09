import { Box, useColorMode } from 'native-base';
import React, { useContext, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import SettingCard from './Component/SettingCard';
import { useSettingKeeper } from 'src/hooks/useSettingKeeper';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'src/store/hooks';
import useToastMessage from 'src/hooks/useToastMessage';
import { NetworkType } from 'src/services/wallets/enums';
import { changeBitcoinNetwork } from 'src/store/sagaActions/settings';
import TickIcon from 'src/assets/images/tick_icon.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import KeeperModal from 'src/components/KeeperModal';
import CheckBoxActive from 'src/assets/images/checkbox_active.svg';
import CheckBoxInactive from 'src/assets/images/checkbox_inactive.svg';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import Buttons from 'src/components/Buttons';

export const GeneralSettingsScreen = () => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { settings,common } = translations;
  const { General, keysAndwallet,appSetting:settingsList} = useSettingKeeper();
  const dispatch = useDispatch();
  const { bitcoinNetworkType } = useAppSelector((state) => state.settings);
  const { showToast } = useToastMessage();
  const [networkModeModal, setNetworkModeModal] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(bitcoinNetworkType);
  const [loading, setLoading] = useState(false);

  let appSetting = [
    ...settingsList,
    {
      title: settings.networkModeTitle,
      description: settings.networkModeSubTitle,
      icon: <ThemedSvg name={'NetworkIcon'} />,
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
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <ScrollView showsVerticalScrollIndicator={false}>
      <Box style={styles.container} backgroundColor={`${colorMode}.primaryBackground`}>
        <Box style={styles.header}>
          <WalletHeader title={settings.General} />
        </Box>
       <SettingCard
        subtitleColor={`${colorMode}.balanceText`}
        backgroundColor={`${colorMode}.textInputBackground`}
        borderColor={`${colorMode}.separator`}
        items={General}
      />
      <SettingCard
        header={settings.KeysWallets}
        subtitleColor={`${colorMode}.balanceText`}
        backgroundColor={`${colorMode}.textInputBackground`}
        borderColor={`${colorMode}.separator`}
        // @ts-ignore
        items={keysAndwallet}
      />
        <SettingCard
        header={"App Setting"}
          subtitleColor={`${colorMode}.balanceText`}
          backgroundColor={`${colorMode}.textInputBackground`}
          borderColor={`${colorMode}.separator`}
          // @ts-ignore
          items={appSetting}
        />
      </Box>
      </ScrollView>
         <KeeperModal
          visible={networkModeModal}
          closeOnOverlayClick={false}
          close={() => {
            setNetworkModeModal(false);
            setSelectedNetwork(bitcoinNetworkType);
          }}
          title={settings.networkModeTitle}
          subTitleWidth={wp(240)}
          subTitle={settings.networkModeModalSubTitle}
          modalBackground={`${colorMode}.modalWhiteBackground`}
          textColor={`${colorMode}.textGreen`}
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
                  primaryDisable={selectedNetwork === bitcoinNetworkType}
                  primaryCallback={() => confirmNetworkMode()}
                />
              </Box>
            </Box>
          )}
        />
        <ActivityIndicatorView visible={loading} showLoader />
    </ScreenWrapper>
  );
};

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