import { Box, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';

import IconArrow from 'src/assets/images/icon_arrow_grey.svg';
import IconArrowWhite from 'src/assets/images/icon_arrow_white.svg';
import { CommonActions, useNavigation } from '@react-navigation/native';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import ThemedColor from 'src/components/ThemedColor/ThemedColor';
import ImportWallet from 'src/assets/images/import.svg';
import ImportWalletGreen from 'src/assets/images/importGreen.svg';
import CreateWalletIcon from 'src/assets/images/createWallet.svg';
import CreateVaultIcon from 'src/assets/images/createVault1.svg';
import CreateMultiVaultIcon from 'src/assets/images/createVault2.svg';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import useWallets from 'src/hooks/useWallets';
import { DerivationPurpose, WalletType } from 'src/services/wallets/enums';
import { NewWalletInfo } from 'src/store/sagas/wallets';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { useAppSelector } from 'src/store/hooks';
import { getCosignerDetails } from 'src/services/wallets/factories/WalletFactory';
import { setupKeeperSigner } from 'src/hardware/signerSetup';
import { useDispatch } from 'react-redux';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { addNewWallets } from 'src/store/sagaActions/wallets';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { resetRealyWalletState } from 'src/store/reducers/bhr';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';

export const SelectWalletType = ({ navigation }) => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletText } = translations;
  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader title={walletText.addNewWallet} subTitle={walletText.createOrImportWallet} />
      <Box style={styles.container}>
        <Box style={styles.cardsList}>
          <SelectWalletTypeCards />
        </Box>
        <ImportWalletCta onPress={() => navigation.navigate('VaultConfigurationCreation')} />
      </Box>
    </ScreenWrapper>
  );
};

export const SelectWalletTypeCards = () => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletText } = translations;
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const { wallets } = useWallets({ getAll: true });
  const { bitcoinNetworkType } = useAppSelector((state) => state.settings);
  const dispatch = useDispatch();
  const { primaryMnemonic } = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const { relayWalletUpdate, relayWalletError, realyWalletErrorMessage } = useAppSelector(
    (state) => state.bhr
  );
  const { showToast } = useToastMessage();

  useEffect(() => {
    if (relayWalletUpdate) {
      dispatch(resetRealyWalletState());
      setLoading(false);
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [{ name: 'Home' }],
        })
      );
    }
    if (relayWalletError) {
      showToast(realyWalletErrorMessage || walletText.walletCreationFailed, <ToastErrorIcon />);
      setLoading(false);
      dispatch(resetRealyWalletState());
    }
  }, [relayWalletUpdate, relayWalletError]);

  const createNewHotWallet = () => {
    setLoading(true);
    setTimeout(() => {
      try {
        let lastInstanceNum = -1;
        wallets.forEach((wallet) => {
          if (wallet.type === WalletType.DEFAULT) {
            // improves the instance number generation logic(accounts for deleted wallets as well)
            lastInstanceNum = Math.max(lastInstanceNum, wallet.derivationDetails.instanceNum);
          }
        });
        const newWallet: NewWalletInfo = {
          walletType: WalletType.DEFAULT,
          walletDetails: {
            name: `Mobile Wallet ${lastInstanceNum == -1 ? '' : lastInstanceNum + 2}`,
            description: '',
            derivationPath: WalletUtilities.getDerivationPath(
              false,
              bitcoinNetworkType,
              0,
              DerivationPurpose.BIP84
            ),
            instanceNum: lastInstanceNum + 1,
          },
        };
        getCosignerDetails(primaryMnemonic as string, lastInstanceNum + 1).then((cosigner) => {
          const hw = setupKeeperSigner(cosigner);
          if (hw) {
            dispatch(addSigningDevice([hw.signer]));
          }
        });
        dispatch(addNewWallets([newWallet]));
      } catch (error) {
        console.log('Error');
        setLoading(false);
      }
    }, 0);
  };

  const createNewVault = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'AddSigningDevice',
        params: {
          scheme: { m: 1, n: 1 },
          currentBlockHeight: null,
          hasInitialTimelock: false,
          isNewSchemeFlow: true,
        },
      })
    );
  };

  const OPTIONS = [
    {
      title: walletText.hotWallet,
      subtitle: walletText.hotWalletDesc,
      icon: <CreateWalletIcon />,
      onPress: createNewHotWallet,
      id: 'newWallet',
    },
    {
      title: walletText.coldStorage,
      subtitle: walletText.coldStorageDesc,
      icon: <CreateVaultIcon />,
      onPress: createNewVault,
      id: 'newVault',
    },
    {
      title: walletText.multiKeyAdvanced,
      subtitle: walletText.multiKeyAdvancedDesc,
      icon: <CreateMultiVaultIcon />,
      onPress: () => navigation.dispatch(CommonActions.navigate('AddNewMultiKeyWallet')),
      id: 'newMultiVault',
    },
  ];

  return (
    <>
      <ActivityIndicatorView visible={loading} showLoader />
      {OPTIONS.map((option, index) => (
        <OptionItem key={index} option={option} colorMode={colorMode} />
      ))}
    </>
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

const ImportWalletCta = ({ onPress }) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletText } = translations;
  const bg = ThemedColor({ name: 'dashed_CTA_background' });
  return (
    <TouchableOpacity onPress={onPress}>
      <Box style={styles.ImportCtr} backgroundColor={bg} borderColor={`${colorMode}.pantoneGreen`}>
        <Box style={{ paddingTop: wp(4), marginRight: wp(7) }}>
          {isDarkMode ? <ImportWallet /> : <ImportWalletGreen />}
        </Box>

        <Box>
          <Text color={`${colorMode}.greenWhiteText`} semiBold fontSize={14}>
            {walletText.ImportAWallet}
          </Text>
          <Text color={`${colorMode}.greenWhiteText`} fontSize={12} style={{ marginTop: hp(4) }}>
            {walletText.restoreWalletUsingBackup}
          </Text>
        </Box>
      </Box>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    flex: 1,
  },
  cardsList: { gap: hp(8), marginTop: hp(20) },
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
  ImportCtr: {
    borderRadius: 11,
    borderWidth: 1,
    borderStyle: 'dashed',
    flexDirection: 'row',
    padding: wp(20),
  },
});
