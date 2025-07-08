import React, { useContext, useState } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import SettingCard from '../Home/components/Settings/Component/SettingCard';
import { Box, useColorMode } from 'native-base';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { USDTWallet } from 'src/services/wallets/factories/USDTWalletFactory';
import idx from 'idx';
import { useUSDTWallets } from 'src/hooks/useUSDTWallets';
import { VisibilityType } from 'src/services/wallets/enums';
import { useNavigation } from '@react-navigation/native';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { useDispatch } from 'react-redux';
import { credsAuthenticated } from 'src/store/reducers/login';
import KeeperModal from 'src/components/KeeperModal';
import { wp } from 'src/constants/responsive';
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';
import BackupModalContent from '../AppSettings/BackupModal';

const Usdtsetting = ({ route }) => {
  const { colorMode } = useColorMode();
  const { usdtWallet }: { usdtWallet: USDTWallet } = route.params;
  const seedWords = idx(usdtWallet, (_) => _.derivationDetails.mnemonic);
  const { updateWallet } = useUSDTWallets();
  const { translations } = useContext(LocalizationContext);
  const { usdtWalletText, wallet: walletTranslation, settings, common } = translations;
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);
  const [backupModalVisible, setBackupModalVisible] = useState(false);

  const actions = [
    {
      title: usdtWalletText.walletDetails,
      description: usdtWalletText.walletNameAndDescription,
      onPress: () => {
        navigation.navigate('WalletDetailsSettings', { wallet: usdtWallet });
      },
    },
    {
      title: usdtWalletText.hideWallet,
      description: usdtWalletText.hideWalletDesc,
      onPress: async () => {
        try {
          const updatedWallet: USDTWallet = {
            ...usdtWallet,
            presentationData: {
              ...usdtWallet.presentationData,
              visibility: VisibilityType.HIDDEN,
            },
          };
          const updated = updateWallet(updatedWallet);
          navigation.navigate('Home');

          // if (updated) {
          //   showToast(
          //     walletTranslation.walletHiddenSuccessMessage,
          //     <TickIcon />,
          //     IToastCategory.DEFAULT,
          //     5000
          //   );
          // } else {
          //   showToast(walletTranslation.somethingWentWrong);
          // }
        } catch (error) {
          showToast(walletTranslation.somethingWentWrong);
        }
      },
    },
  ];

  if (seedWords) {
    actions.push({
      title: usdtWalletText.walletSeedWords,
      description: usdtWalletText.backupWalletOrExport,
      onPress: () => {
        dispatch(credsAuthenticated(false));
        setConfirmPassVisible(true);
      },
    });
  }

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader title={usdtWalletText.walletSetting} />
      <Box>
        {' '}
        <SettingCard
          subtitleColor={`${colorMode}.balanceText`}
          backgroundColor={`${colorMode}.textInputBackground`}
          borderColor={`${colorMode}.separator`}
          items={actions}
        />
      </Box>
      <KeeperModal
        visible={confirmPassVisible}
        close={() => setConfirmPassVisible(false)}
        title={walletTranslation?.confirmPassTitle}
        subTitleWidth={wp(300)}
        showCloseIcon={false}
        dismissible
        closeOnOverlayClick
        subTitle={walletTranslation?.confirmPassSubTitle}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => (
          <PasscodeVerifyModal
            useBiometrics
            close={() => {
              setConfirmPassVisible(false);
            }}
            onSuccess={() => {
              setConfirmPassVisible(false);
              setBackupModalVisible(true);
            }}
          />
        )}
      />
      <KeeperModal
        visible={backupModalVisible}
        close={() => setBackupModalVisible(false)}
        title={walletTranslation.walletSeedWord}
        subTitle={settings.RKBackupSubTitle}
        subTitleWidth={wp(300)}
        modalBackground={`${colorMode}.primaryBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.modalGreenTitle`}
        secondaryButtonText={common.cancel}
        secondaryCallback={() => setBackupModalVisible(false)}
        secButtonTextColor={`${colorMode}.greenText`}
        showCloseIcon={false}
        buttonText={common.backupNow}
        buttonCallback={() => {
          if (seedWords) {
            setBackupModalVisible(false);
            navigation.navigate('ExportSeed', {
              seed: seedWords,
              next: false,
              wallet: usdtWallet,
            });
          } else {
            setBackupModalVisible(false);
            showToast(walletTranslation.mnemonicDoesNotExist);
          }
        }}
        Content={BackupModalContent}
      />
    </ScreenWrapper>
  );
};

export default Usdtsetting;
