import React, { useContext, useEffect, useState } from 'react';
import { Box, ScrollView } from 'native-base';
import { StyleSheet } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';

import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { setIKPDFPaths, setInheritance, setKeySecurityTipsPath, setLetterToAttornyPath, setRecoveryInstructionPath } from 'src/store/reducers/settings';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import SafeguardingTips from 'src/assets/images/SafeguardingTips.svg';
import SetupIK from 'src/assets/images/SetupIK.svg';
import Letter from 'src/assets/images/LETTER.svg';
import Recovery from 'src/assets/images/recovery.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import TickIcon from 'src/assets/images/icon_tick.svg';

import Text from 'src/components/KeeperText';
import Note from 'src/components/Note/Note';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import useToastMessage from 'src/hooks/useToastMessage';
import useVault from 'src/hooks/useVault';
import { SignerType } from 'src/core/wallets/enums';
import GenerateRecoveryInstrPDF from 'src/utils/GenerateRecoveryInstrPDF';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { genrateOutputDescriptors } from 'src/core/utils';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import GenerateSecurityTipsPDF from 'src/utils/GenerateSecurityTipsPDF';
import GenerateLetterToAtternyPDF from 'src/utils/GenerateLetterToAtternyPDF';
import IKSetupSuccessModal from './components/IKSetupSuccessModal';
import InheritanceDownloadView from './components/InheritanceDownloadView';
import InheritanceSupportView from './components/InheritanceSupportView';

function InheritanceStatus() {
  const { showToast } = useToastMessage();
  const navigtaion = useNavigation();
  const dispatch = useAppDispatch();
  const { keySecurityTips, letterToAttorny, recoveryInstruction } = useAppSelector((state) => state.settings);
  const iKPDFPaths = useAppSelector((state) => state.settings);
  console.log('iKPDFPaths', iKPDFPaths)
  const [visibleModal, setVisibleModal] = useState(false);
  const [visibleErrorView] = useState(false);

  const { activeVault } = useVault();
  const { useQuery } = useContext(RealmWrapperContext);
  const vault: Vault = useQuery(RealmSchema.Vault)
    .map(getJSONFromRealmObject)
    .filter((vault) => !vault.archived)[0];
  const fingerPrints = vault.signers.map(signer => signer.masterFingerprint)

  const descriptorString = genrateOutputDescriptors(vault);
  const [isSetupDone, setIsSetupDone] = useState(false);

  useEffect(() => {
    if (activeVault && activeVault.signers) {
      const [ikSigner] = activeVault.signers.filter(
        (signer) => signer.type === SignerType.INHERITANCEKEY
      );
      if (ikSigner) setIsSetupDone(true);
      else setIsSetupDone(false);
    }
  }, [activeVault]);

  return (
    <ScreenWrapper>
      <HeaderTitle
        onPressHandler={() => navigtaion.goBack()}
        learnMore
        learnMorePressed={() => {
          dispatch(setInheritance(true));
        }}
      />
      <InheritanceSupportView
        title="Inheritance Support"
        subtitle="Keeper provides you with the tips and tools you need to include the Vault in your estate planning"
      />
      <ScrollView style={styles.scrollViewWrapper} showsVerticalScrollIndicator={false}>
        <InheritanceDownloadView
          icon={<SafeguardingTips />}
          title="Key Security Tips"
          subTitle="How to store your keys securely"
          previewPDF={() => {
            if (keySecurityTips) {
              navigtaion.navigate('PreviewPDF', { source: keySecurityTips })
            } else {
              showToast('Document hasn\'t downloaded yet.', <ToastErrorIcon />);
            }

          }}
          downloadPDF={() => {
            GenerateSecurityTipsPDF().then((res) => {
              if (res) {
                dispatch(setKeySecurityTipsPath(res))
              }
              showToast('Document has been downloaded.', <TickIcon />);
            })
          }}
          isDownload
        />
        <InheritanceDownloadView
          icon={<SetupIK />}
          title="Setup Inheritance Key"
          subTitle="Add an assisted key to create a 3 of 6 Vault"
          isSetupDone={isSetupDone}
          onPress={() => {
            if (isSetupDone) {
              showToast('You have successfully added the Inheritance Key.', <TickIcon />)
              return
            }
            navigtaion.dispatch(
              CommonActions.navigate('AddSigningDevice', { isInheritance: true })
            );
          }}
        />
        {/* Error view - Need to add condition for this */}
        {visibleErrorView && (
          <Box style={styles.signingDevicesView}>
            <Text style={styles.signingDevicesText}>Signing Devices have been changed&nbsp;</Text>
            <ToastErrorIcon />
          </Box>
        )}
        <InheritanceDownloadView
          icon={<Letter />}
          title="Letter to the Attorney"
          subTitle="A partly filled pdf template"
          previewPDF={() => {
            if (letterToAttorny) {
              navigtaion.navigate('PreviewPDF', { source: letterToAttorny })
            } else {
              showToast('Document hasn\'t downloaded yet.', <ToastErrorIcon />);
            }

          }}
          downloadPDF={() => {
            GenerateLetterToAtternyPDF(fingerPrints).then((res) => {
              if (res) {
                dispatch(setLetterToAttornyPath(res))
              }
              showToast('Document has been downloaded.', <TickIcon />);
            })
          }}
          isDownload
        />
        <InheritanceDownloadView
          icon={<Recovery />}
          title="Recovery Instructions"
          subTitle="A document for the heir only"
          previewPDF={() => {
            if (recoveryInstruction) {
              navigtaion.navigate('PreviewPDF', { source: recoveryInstruction })
            } else {
              showToast('Document hasn\'t downloaded yet.', <ToastErrorIcon />);
            }

          }}
          downloadPDF={() =>
            GenerateRecoveryInstrPDF(activeVault.signers, descriptorString).then((res) => {
              if (res) {
                dispatch(setRecoveryInstructionPath(res))
              }
              showToast('Document has been downloaded.', <TickIcon />);
            })
          }
          isDownload
        />
      </ScrollView>
      {/* <Box style={styles.note}> */}
      <Note
        title="Note"
        subtitle="Consult your estate planning company to ensure the documents provided here are suitable for your needs and are as per your jurisdiction"
        subtitleColor="GreyText"
      />
      {/* </Box> */}
      <IKSetupSuccessModal visible={visibleModal} closeModal={() => setVisibleModal(false)} />
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  signingDevicesView: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    marginTop: hp(20),
    right: 3,
  },
  scrollViewWrapper: {
    height: windowHeight > 800 ? '50%' : '40%',
  },
  signingDevicesText: {
    color: '#E07962',
    fontSize: 14,
  },
  note: {
    bottom: hp(5),
    justifyContent: 'center',
    width: wp(320),
  },
});
export default InheritanceStatus;
