import { Box, useColorMode } from 'native-base';
import React, { useContext, useState } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import Text from 'src/components/KeeperText';
import { CommonActions } from '@react-navigation/native';
import WalletHeader from 'src/components/WalletHeader';
import { hp, wp } from 'src/constants/responsive';
import Colors from 'src/theme/Colors';
import IconArrow from 'src/assets/images/icon_arrow_grey.svg';
import IconArrowWhite from 'src/assets/images/icon_arrow_white.svg';
import Vault2of3 from 'src/assets/images/2of3Vault.svg';
import Vault3of5 from 'src/assets/images/3of5Vault.svg';
import GreenArrow from 'src/assets/images/icon_arrow.svg';
import GreenArrowLight from 'src/assets/images/icon_arrow_white.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { useDispatch } from 'react-redux';
import { resetCollaborativeSession } from 'src/store/reducers/vaults';
import { useAppSelector } from 'src/store/hooks';
import KeeperModal from 'src/components/KeeperModal';
import CollaborativeIcon from 'src/assets/images/collaborativeGreen.svg';

export const AddNewMultiKeyWallet = ({ navigation }) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslations, vault: vaultText, common } = translations;
  const dispatch = useDispatch();
  const { collaborativeSession } = useAppSelector((state) => state.vault);
  const [collabSessionExistsModalVisible, setCollabSessionExistsModalVisible] = useState(false);

  const handleCollaborativeWalletCreation = () => {
    if (Object.keys(collaborativeSession.signers).length > 0) {
      setCollabSessionExistsModalVisible(true);
    } else {
      dispatch(resetCollaborativeSession());
      setTimeout(() => {
        navigation.navigate('SetupCollaborativeWallet');
      }, 500); // delaying navigation by 0.5 second to ensure collaborative session reset
    }
  };

  const CREATE_WALLET_OPTIONS = [
    {
      icon: <Vault2of3 />,
      title: walletTranslations.simpleMultiKey,
      subtitle: walletTranslations.simpleMultiKeyDesc,
      onPress: () =>
        navigation.dispatch(
          CommonActions.navigate({
            name: 'AddSigningDevice',
            params: {
              scheme: { m: 2, n: 3 },
              currentBlockHeight: null,
              hasInitialTimelock: false,
              isNewSchemeFlow: true,
            },
          })
        ),
      id: '2Of3',
    },
    {
      icon: <Vault3of5 />,
      title: walletTranslations.strongMultiKey,
      subtitle: walletTranslations.strongMultiKeyDesc,
      onPress: () =>
        navigation.dispatch(
          CommonActions.navigate({
            name: 'AddSigningDevice',
            params: {
              scheme: { m: 3, n: 5 },
              currentBlockHeight: null,
              hasInitialTimelock: false,
              isNewSchemeFlow: true,
            },
          })
        ),
      id: '3Of5',
    },
    {
      icon: <CollaborativeIcon />,
      title: vaultText.collaborativeWallet,
      subtitle: walletTranslations.walletWithFamily,
      onPress: handleCollaborativeWalletCreation,
      id: 'collaborative',
    },
  ];

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader title={walletTranslations.multiKeyAdvanced} />
      <Box style={styles.addWalletOptionsList}>
        {CREATE_WALLET_OPTIONS.map((option, index) => (
          <OptionItem key={index} option={option} colorMode={colorMode} />
        ))}
        <Pressable onPress={() => navigation.navigate('AddNewWallet')}>
          <Box
            style={styles.suggestionCtr}
            backgroundColor={isDarkMode ? Colors.seperatorDark : `${colorMode}.separator`}
            borderColor={`${colorMode}.primaryBackground`}
          >
            <Text color={`${colorMode}.greenText`} fontSize={14} bold style={styles.suggestionTxt}>
              {walletTranslations.advanceCustomSetup}
            </Text>
            {isDarkMode ? <GreenArrowLight /> : <GreenArrow />}
          </Box>
        </Pressable>
      </Box>
      <KeeperModal
        visible={collabSessionExistsModalVisible}
        close={() => setCollabSessionExistsModalVisible(false)}
        title={walletTranslations.collaborativeSessionExists}
        subTitle={walletTranslations.collaborativeSessionExistsDesc}
        buttonText={common.continueSession}
        secondaryButtonText={common.startNew}
        secondaryCallback={() => {
          setCollabSessionExistsModalVisible(false);
          dispatch(resetCollaborativeSession());
          setTimeout(() => {
            navigation.navigate('SetupCollaborativeWallet');
          }, 500);
        }}
        buttonCallback={() => {
          setCollabSessionExistsModalVisible(false);
          navigation.navigate('SetupCollaborativeWallet');
        }}
      />
    </ScreenWrapper>
  );
};

const OptionItem = ({ option, colorMode }) => {
  return (
    <TouchableOpacity onPress={option.onPress}>
      <Box
        style={styles.optionCTR}
        backgroundColor={`${colorMode}.boxSecondaryBackground`}
        borderColor={`${colorMode}.separator`}
      >
        <Box style={styles.optionRow}>
          {option.icon}
          <Box style={{ flex: 1 }}>
            <Text color={`${colorMode}.secondaryText`} fontSize={14} style={styles.optionTitle}>
              {option.title}
            </Text>
            <Text color={`${colorMode}.secondaryText`} fontSize={12} style={{ maxWidth: '90%' }}>
              {option.subtitle}
            </Text>
          </Box>
        </Box>
        <Box>{colorMode === 'dark' ? <IconArrowWhite /> : <IconArrow />}</Box>
      </Box>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  addWalletOptionsList: {
    gap: wp(15),
    marginTop: hp(30),
    flex: 1,
  },
  optionCTR: {
    flexDirection: 'row',
    padding: hp(20),
    alignItems: 'center',
    gap: wp(16),
    borderRadius: 12,
    borderWidth: 1.2,
  },
  optionTitle: {
    marginBottom: hp(4),
  },
  optionRow: {
    flexDirection: 'row',
    gap: wp(14),
    flex: 1,
    flexGrow: 1,
  },
  suggestionCtr: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: hp(15),
    marginTop: hp(10),
    marginBottom: hp(40),
  },
  suggestionTxt: { textAlign: 'center', marginRight: wp(6) },
});
