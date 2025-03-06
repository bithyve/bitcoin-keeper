import React, { useContext, useState } from 'react';
import { StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import MockWrapper from '../Vault/MockWrapper';
import KeeperHeader from 'src/components/KeeperHeader';
import { Box, ScrollView, useColorMode } from 'native-base';
import QRScanner from 'src/components/QRScanner';
import { useRoute } from '@react-navigation/native';
import useToastMessage from 'src/hooks/useToastMessage';
import { hp } from 'src/constants/responsive';
import { SegmentedController } from '../../components/SegmentController';
import Text from 'src/components/KeeperText';
import { DerivationPurpose, SignerType } from 'src/services/wallets/enums';
import WalletUtilities from 'src/services/wallets/operations/utils';
import SuccessIllustration from 'src/assets/images/illustration.svg';
import Buttons from 'src/components/Buttons';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { manipulateSeedSignerData } from 'src/hardware/seedsigner';

const options = [
  { label: 'Singlesig', sub: 'BIP84', purpose: DerivationPurpose.BIP84 },
  { label: 'Multisig', sub: 'BIP48', purpose: DerivationPurpose.BIP48 },
  { label: 'Taproot', sub: 'BIP86', purpose: DerivationPurpose.BIP86 },
];

export const AddMultipleXpub = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { colorMode } = useColorMode();
  const [xpubs, setXpubs] = useState({});
  const route = useRoute();
  const {
    title = '',
    subtitle = '',
    onQrScan = () => {},
    setup = false,
    type,
    mode,
    disableMockFlow = false,
    addSignerFlow = false,
  } = route.params as any;
  const { showToast } = useToastMessage();

  const renderContent = () => {
    const data = xpubs[options[selectedIndex].purpose];
    return data ? (
      <SuccessContainer type={options[selectedIndex].label} />
    ) : (
      <QRScanner onScanCompleted={onScanCompleted} hideCamera={false} />
    );
  };

  const onScanCompleted = (data) => {
    try {
      if (type === SignerType.SEEDSIGNER) data = manipulateSeedSignerData(data);
      const purpose = WalletUtilities.getPurpose(data.derivationPath);
      if (xpubs[purpose])
        showToast(
          `You have already scanned the ${options.find((tab) => tab.purpose === purpose).label} key`
        );
      else setXpubs({ ...xpubs, [purpose]: data });
    } catch (error) {
      console.log('🚀 ~ onScanCompleted ~ error:', error);
      showToast('Please scan a valid QR', <ToastErrorIcon />);
    }
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <MockWrapper
        signerType={type}
        enable={setup && type && !disableMockFlow}
        addSignerFlow={addSignerFlow}
        mode={mode}
      >
        <KeeperHeader title={title} subtitle={subtitle} />
        <Box style={styles.segmentController}>
          <SegmentedController
            options={options.filter((tab) => {
              if (type === SignerType.JADE) {
                return tab.label !== 'Taproot';
              }
              return true;
            })}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
          />
        </Box>
        <Box style={styles.container}>
          <ScrollView
            automaticallyAdjustKeyboardInsets={true}
            contentContainerStyle={styles.contentContainer}
            style={styles.flex1}
            showsVerticalScrollIndicator={false}
          >
            {renderContent()}
          </ScrollView>
          {Object.values(xpubs).some((value) => value !== null) && (
            <Buttons
              fullWidth
              primaryText="Finish"
              primaryCallback={() => {
                onQrScan(xpubs);
              }}
            />
          )}
        </Box>
      </MockWrapper>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  segmentController: {
    marginVertical: hp(20),
  },
  container: {
    flexGrow: 1,
  },
  contentContainer: {
    alignItems: 'center',
    paddingTop: hp(30),
  },
  flex1: {
    flex: 1,
  },
  successTitle: { marginTop: hp(20), marginBottom: hp(12), fontSize: 16 },
  successSubTitle: { fontSize: 14, textAlign: 'center', maxWidth: '90%' },
});

const SuccessContainer = ({ type }) => {
  const { colorMode } = useColorMode();
  const { signer } = useContext(LocalizationContext).translations;

  return (
    <Box alignItems={'center'}>
      <SuccessIllustration />
      <Text color={`${colorMode}.noteTextClosed`} semiBold style={styles.successTitle}>
        {`${type} ${signer.keyAddedTitle}`}
      </Text>
      <Text style={styles.successSubTitle}>{`${type} ${signer.keyAddedSubTitle}`}</Text>
    </Box>
  );
};
