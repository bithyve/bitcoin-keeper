import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import { useQuery } from '@realm/react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import OptionCard from 'src/components/OptionCard';
import KeeperModal from 'src/components/KeeperModal';
import ScreenWrapper from 'src/components/ScreenWrapper';
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';
import { wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import WalletCopiableData from 'src/components/WalletCopiableData';
import usePlan from 'src/hooks/usePlan';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import idx from 'idx';
import { VaultType, XpubTypes } from 'src/services/wallets/enums';
import useToastMessage from 'src/hooks/useToastMessage';
import { VaultSigner } from 'src/services/wallets/interfaces/vault';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { generateVaultId } from 'src/services/wallets/factories/VaultFactory';
import useCanaryVault from 'src/hooks/useCanaryWallets';
import { captureError } from 'src/services/sentry';
import { useDispatch } from 'react-redux';
import { addNewVault } from 'src/store/sagaActions/vaults';
import { useAppSelector } from 'src/store/hooks';
import { resetRealyVaultState } from 'src/store/reducers/bhr';
import useSigners from 'src/hooks/useSigners';
import { NewVaultInfo } from 'src/store/sagas/wallets';
import BackupModalContent from './BackupModal';
import { credsAuthenticated } from 'src/store/reducers/login';
import WalletHeader from 'src/components/WalletHeader';

function AppBackupSettings() {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { settings, common, error, home, wallet } = translations;
  const { primaryMnemonic, publicId } = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];
  const { isOnL2Above: isCanaryWalletAllowed } = usePlan();
  let signer = useSigners().signers.find((data) => data.masterFingerprint === publicId);
  const CANARY_SCHEME = { m: 1, n: 1 };
  const { allCanaryVaults } = useCanaryVault({ getAll: true });
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);
  const [canaryVaultLoading, setCanaryVaultLoading] = useState(false);
  const [backupModalVisible, setBackupModalVisible] = useState(false);
  const [canaryWalletId, setCanaryWalletId] = useState<string>();
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();

  const { relayVaultUpdate, relayVaultError, realyVaultErrorMessage } = useAppSelector(
    (state) => state.bhr
  );
  const { bitcoinNetworkType } = useAppSelector((state) => state.settings);
  useEffect(() => {
    if (relayVaultUpdate) {
      navigation.navigate('VaultDetails', { vaultId: canaryWalletId });
      setCanaryVaultLoading(false);
      dispatch(resetRealyVaultState());
    }
    if (relayVaultError) {
      showToast(`${error.canaryVaultFailed} ${realyVaultErrorMessage}`);
      dispatch(resetRealyVaultState());
      setCanaryVaultLoading(false);
    }
  }, [relayVaultUpdate, relayVaultError]);

  const handleCanaryWallet = () => {
    setCanaryVaultLoading(true);
    try {
      const singleSigSigner = idx(signer, (_) => {
        return _.signerXpubs[XpubTypes.P2WPKH][0];
      });
      if (!singleSigSigner) {
        showToast(error.noSingleSigFound);
        setCanaryVaultLoading(false);
      } else {
        const ssVaultKey: VaultSigner = {
          ...singleSigSigner,
          masterFingerprint: publicId,
          xfp: WalletUtilities.getFingerprintFromExtendedKey(
            singleSigSigner.xpub,
            WalletUtilities.getNetworkByType(bitcoinNetworkType)
          ),
        };
        const canaryVaultId = generateVaultId([ssVaultKey], CANARY_SCHEME);
        setCanaryWalletId(canaryVaultId);
        const canaryVault = allCanaryVaults.find((vault) => vault.id === canaryVaultId);
        if (canaryVault) {
          navigation.navigate('VaultDetails', { vaultId: canaryVaultId, signer: signer });
          setCanaryVaultLoading(false);
        } else {
          createCreateCanaryWallet(ssVaultKey);
        }
      }
    } catch (err) {
      console.log('🚀 ~ handleCanaryWal ~ err:', err);
    }
  };

  const createCreateCanaryWallet = useCallback(
    (ssVaultKey) => {
      try {
        const vaultInfo: NewVaultInfo = {
          vaultType: VaultType.CANARY,
          vaultScheme: CANARY_SCHEME,
          vaultSigners: [ssVaultKey],
          vaultDetails: {
            name: common.CANARY + ' ' + home.wallet,
            description: wallet.canaryWalletForRecoveryKey,
          },
        };
        dispatch(addNewVault({ newVaultInfo: vaultInfo }));
        return vaultInfo;
      } catch (err) {
        captureError(err);
        return false;
      }
    },
    [signer]
  );

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <ActivityIndicatorView visible={canaryVaultLoading} showLoader={true} />
      <WalletHeader title={settings.BackupSettings} subTitle={settings.BackupSettingSubTitle} />
      <ScrollView
        contentContainerStyle={styles.optionsListContainer}
        showsVerticalScrollIndicator={false}
      >
        <OptionCard
          title={settings.ViewRKTitle}
          description={settings.ViewRKDesc}
          callback={() => {
            dispatch(credsAuthenticated(false));
            setConfirmPassVisible(true);
          }}
        />
        {isCanaryWalletAllowed && (
          <OptionCard
            title={common.CANARY + ' ' + home.wallet}
            description={wallet.onChainKeyAlert}
            callback={handleCanaryWallet}
          />
        )}
      </ScrollView>
      <KeeperModal
        visible={confirmPassVisible}
        closeOnOverlayClick={true}
        dismissible
        showCloseIcon={false}
        close={() => setConfirmPassVisible(false)}
        title={settings.confirmPassTitle}
        subTitleWidth={wp(240)}
        subTitle={settings.confirmPassSubTitle}
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
        title={settings.RKBackupTitle}
        subTitle={settings.RKBackupSubTitle}
        subTitleWidth={wp(320)}
        modalBackground={`${colorMode}.primaryBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.modalGreenTitle`}
        secondaryButtonText={common.cancel}
        secondaryCallback={() => setBackupModalVisible(false)}
        secButtonTextColor={`${colorMode}.greenText`}
        showCloseIcon={false}
        buttonText={common.backupNow}
        buttonCallback={() => {
          setBackupModalVisible(false),
            navigation.dispatch(
              CommonActions.navigate('ExportSeed', {
                seed: primaryMnemonic,
                next: false,
                viewRecoveryKeys: true,
              })
            );
        }}
        Content={BackupModalContent}
      />
      <Box style={styles.fingerprint}>
        <WalletCopiableData
          title={common.signerFingerPrint}
          data={publicId.toString()}
          dataType="fingerprint"
        />
      </Box>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  optionsListContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  fingerprint: {
    alignItems: 'center',
  },
});
export default AppBackupSettings;
