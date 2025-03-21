import React, { useContext, useState } from 'react';
import { Box, useColorMode } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import ShowXPub from 'src/components/XPub/ShowXPub';
import { wp, hp } from 'src/constants/responsive';
import KeeperModal from 'src/components/KeeperModal';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import TickIcon from 'src/assets/images/icon_tick.svg';
import useWallets from 'src/hooks/useWallets';
import { Pressable, StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';
import TransferPolicy from 'src/components/XPub/TransferPolicy';
import useTestSats from 'src/hooks/useTestSats';
import idx from 'idx';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { VisibilityType } from 'src/services/wallets/enums';
import { WalletType } from 'src/services/wallets/enums';
import { captureError } from 'src/services/sentry';
import BackupModalContent from '../AppSettings/BackupModal';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import { credsAuthenticated } from 'src/store/reducers/login';
import { useDispatch } from 'react-redux';
import WalletHeader from 'src/components/WalletHeader';
import SettingCard from '../Home/components/Settings/Component/SettingCard';
import ConciergeNeedHelp from 'src/assets/images/conciergeNeedHelp.svg';
import { ConciergeTag } from 'src/models/enums/ConciergeTag';
import Text from 'src/components/KeeperText';
import LearnMoreIcon from 'src/assets/images/learnMoreIcon.svg';
import WalletInfoIllustration from 'src/assets/images/walletInfoIllustration.svg';

function WalletSettings({ route }) {
  const { colorMode } = useColorMode();
  const { wallet: walletRoute, editPolicy = false } = route.params || {};
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const [xpubVisible, setXPubVisible] = useState(false);
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);
  const [transferPolicyVisible, setTransferPolicyVisible] = useState(editPolicy);
  const [loadingState, setLoadingState] = useState(false);

  const { wallets } = useWallets();
  const wallet = wallets.find((item) => item.id === walletRoute.id);
  const walletMnemonic = idx(wallet, (_) => _.derivationDetails.mnemonic);

  const { translations } = useContext(LocalizationContext);
  const { settings, common, wallet: walletTranslation, vault: vaultText } = translations;
  const TestSatsComponent = useTestSats({ wallet });
  const isImported = wallet.type === WalletType.IMPORTED;
  const [backupModalVisible, setBackupModalVisible] = useState(false);
  const [needHelpModal, setNeedHelpModal] = useState(false);
  const dispatch = useDispatch();

  const updateWalletVisibility = () => {
    try {
      const updatedPresentationData = {
        ...wallet.presentationData,
        visibility: VisibilityType.HIDDEN,
      };
      dbManager.updateObjectById(RealmSchema.Wallet, wallet.id, {
        presentationData: updatedPresentationData,
      });
      showToast(
        walletTranslation.walletHiddenSuccessMessage,
        <TickIcon />,
        IToastCategory.DEFAULT,
        5000
      );
      navigation.navigate('Home');
    } catch (error) {
      captureError(error);
      showToast(walletTranslation.somethingWentWrong);
    }
  };

  const handleTransferPolicy = async () => {
    setLoadingState(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setTransferPolicyVisible(true);
    setLoadingState(false);
  };

  function modalContent() {
    return (
      <Box>
        <Box style={styles.illustration}>
          <WalletInfoIllustration />
        </Box>
        <Text color={`${colorMode}.headerWhite`} style={styles.modalDesc}>
          {walletTranslation.learnMoreDesc}
        </Text>
      </Box>
    );
  }

  const actions = [
    {
      title: walletTranslation.WalletDetails,
      description: walletTranslation.changeWalletDetails,
      icon: null,
      isDiamond: false,
      onPress: () => navigation.navigate('WalletDetailsSettings', { wallet }),
    },
    {
      title: 'Hide Wallet',
      description: 'Hidden wallets can be managed from Manage Wallets',
      icon: null,
      isDiamond: false,
      onPress: () => updateWalletVisibility(),
    },
    walletMnemonic && {
      title: walletTranslation.walletSeedWord,
      description: walletTranslation.walletSeedWordSubTitle,
      icon: null,
      isDiamond: false,
      onPress: () => {
        dispatch(credsAuthenticated(false));
        setConfirmPassVisible(true);
      },
    },

    !isImported && {
      title: walletTranslation.TransferPolicy,
      description: walletTranslation.TransferPolicyDesc,
      icon: null,
      isDiamond: false,
      onPress: handleTransferPolicy,
    },
  ].filter(Boolean);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <Box style={styles.container}>
        <Box style={styles.header}>
          <WalletHeader
            title={settings.walletSettings}
            rightComponent={
              <Pressable onPress={() => setNeedHelpModal(true)}>
                <LearnMoreIcon />
              </Pressable>
            }
          />
        </Box>

        <SettingCard
          subtitleColor={`${colorMode}.balanceText`}
          backgroundColor={`${colorMode}.textInputBackground`}
          borderColor={`${colorMode}.separator`}
          items={actions}
        />
        {TestSatsComponent}
      </Box>
      <ActivityIndicatorView visible={loadingState} showLoader />

      <KeeperModal
        visible={transferPolicyVisible}
        close={() => {
          setTransferPolicyVisible(false);
        }}
        title={walletTranslation.editTransPolicy}
        subTitle={walletTranslation.editTransPolicySubTitle}
        subTitleWidth={wp(220)}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        showCloseIcon={false}
        showCurrencyTypeSwitch={true}
        Content={() => (
          <TransferPolicy
            wallet={wallet}
            close={() => {
              showToast(walletTranslation.TransPolicyChange, <TickIcon />);
              setTransferPolicyVisible(false);
            }}
            secondaryBtnPress={() => {
              setTransferPolicyVisible(false);
            }}
          />
        )}
      />

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
          if (walletMnemonic) {
            setBackupModalVisible(false);
            navigation.navigate('ExportSeed', {
              seed: walletMnemonic,
              next: false,
              wallet,
            });
          } else {
            setBackupModalVisible(false);
            showToast(walletTranslation.mnemonicDoesNotExist);
          }
        }}
        Content={BackupModalContent}
      />
      <KeeperModal
        visible={xpubVisible}
        close={() => setXPubVisible(false)}
        title={walletTranslation.XPubTitle}
        subTitleWidth={wp(240)}
        subTitle={walletTranslation.xpubModalSubTitle}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => (
          <ShowXPub
            data={wallet?.specs?.xpub}
            copy={() => {
              setXPubVisible(false);
              showToast(walletTranslation.xPubCopyToastMsg, <TickIcon />);
            }}
            copyable
            subText={walletTranslation?.AccountXpub}
            noteSubText={walletTranslation?.AccountXpubNote}
          />
        )}
      />

      <KeeperModal
        visible={needHelpModal}
        close={() => setNeedHelpModal(false)}
        title={walletTranslation.learnMoreTitle}
        subTitle={walletTranslation.learnMoreSubTitle}
        modalBackground={`${colorMode}.pantoneGreen`}
        textColor={`${colorMode}.headerWhite`}
        Content={modalContent}
        subTitleWidth={wp(280)}
        DarkCloseIcon
        buttonText={common.Okay}
        secondaryButtonText={common.needHelp}
        buttonTextColor={`${colorMode}.textGreen`}
        buttonBackground={`${colorMode}.modalWhiteButton`}
        secButtonTextColor={`${colorMode}.modalGreenSecButtonText`}
        secondaryIcon={<ConciergeNeedHelp />}
        secondaryCallback={() => {
          setNeedHelpModal(false);
          navigation.dispatch(
            CommonActions.navigate({
              name: 'CreateTicket',
              params: {
                tags: [ConciergeTag.WALLET],
                screenName: 'wallet-settings',
              },
            })
          );
        }}
        buttonCallback={() => setNeedHelpModal(false)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    marginBottom: 18,
  },
  modalDesc: {
    fontSize: 14,
    padding: 1,
    marginBottom: 15,
    width: wp(295),
  },

  illustration: {
    marginTop: 20,
    alignSelf: 'center',
    marginBottom: 40,
  },
});
export default WalletSettings;
