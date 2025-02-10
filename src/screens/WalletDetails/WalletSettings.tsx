import React, { useContext, useState } from 'react';
import { ScrollView, useColorMode } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import ShowXPub from 'src/components/XPub/ShowXPub';
import KeeperHeader from 'src/components/KeeperHeader';
import { wp, hp } from 'src/constants/responsive';
import KeeperModal from 'src/components/KeeperModal';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import TickIcon from 'src/assets/images/icon_tick.svg';
import useWallets from 'src/hooks/useWallets';
import { StyleSheet } from 'react-native';
import OptionCard from 'src/components/OptionCard';
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

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader title={settings.walletSettings} subtitle={settings.walletSettingSubTitle} />
      <ScrollView
        contentContainerStyle={styles.optionsListContainer}
        showsVerticalScrollIndicator={false}
      >
        <OptionCard
          title={walletTranslation.WalletDetails}
          description={walletTranslation.changeWalletDetails}
          callback={() => {
            navigation.navigate('WalletDetailsSettings', { wallet });
          }}
        />
        <OptionCard
          title="Hide Wallet"
          description="Hidden wallets can be managed from Manage Wallets"
          callback={() => updateWalletVisibility()}
        />
        {walletMnemonic && (
          <OptionCard
            title={walletTranslation.walletSeedWord}
            description={walletTranslation.walletSeedWordSubTitle}
            callback={() => {
              dispatch(credsAuthenticated(false));
              setConfirmPassVisible(true);
            }}
          />
        )}
        {!isImported && (
          <OptionCard
            title={walletTranslation.TransferPolicy}
            description={walletTranslation.TransferPolicyDesc}
            callback={handleTransferPolicy}
          />
        )}
        {TestSatsComponent}
      </ScrollView>
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
        textColor={`${colorMode}.modalHeaderTitle`}
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
        textColor={`${colorMode}.modalHeaderTitle`}
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
        textColor={`${colorMode}.modalHeaderTitle`}
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
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    padding: 20,
    position: 'relative',
  },
  fingerprint: {
    alignItems: 'center',
  },
  walletCardContainer: {
    borderRadius: hp(20),
    width: wp(320),
    paddingHorizontal: 5,
    paddingVertical: 20,
    position: 'relative',
    marginLeft: -wp(20),
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: wp(10),
  },
  walletDetailsWrapper: {
    width: wp(155),
  },
  walletName: {
    letterSpacing: 0.28,
    fontSize: 15,
  },
  walletBalance: {
    letterSpacing: 1.2,
    fontSize: 23,
    padding: 5,
  },
  optionsListContainer: {
    paddingHorizontal: wp(10),
    marginTop: 20,
  },
  optionContainer: {
    marginTop: hp(20),
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  optionTitle: {
    fontSize: 14,
    letterSpacing: 1.12,
  },
  optionSubtitle: {
    fontSize: 12,
    letterSpacing: 0.6,
    width: '90%',
  },
  cancelBtn: {
    marginRight: wp(20),
    borderRadius: 10,
  },
  btnText: {
    fontSize: 12,
    letterSpacing: 0.84,
  },
  createBtn: {
    paddingVertical: hp(15),
    borderRadius: 10,
    paddingHorizontal: 20,
  },
  BalanceModalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalContainer: {
    gap: 40,
  },
  unhideText: {
    fontSize: 14,
    width: wp(200),
  },
});
export default WalletSettings;
