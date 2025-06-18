import React, { useContext, useState } from 'react';
import { StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import MockWrapper from '../Vault/MockWrapper';
import { Box, ScrollView, useColorMode } from 'native-base';
import QRScanner from 'src/components/QRScanner';
import { useRoute } from '@react-navigation/native';
import useToastMessage from 'src/hooks/useToastMessage';
import { hp, wp } from 'src/constants/responsive';
import { SegmentedController } from '../../components/SegmentController';
import Text from 'src/components/KeeperText';
import { DerivationPurpose, SignerType } from 'src/services/wallets/enums';
import WalletUtilities from 'src/services/wallets/operations/utils';
import SuccessIllustration from 'src/assets/images/illustration.svg';
import Buttons from 'src/components/Buttons';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { manipulateSeedSignerData } from 'src/hardware/seedsigner';
import { getPassportDetails, manipulatePassportDetails } from 'src/hardware/passport';
import WalletHeader from 'src/components/WalletHeader';
import KeeperModal from 'src/components/KeeperModal';
import { InteracationMode } from '../Vault/HardwareModalMap';
import Instruction from 'src/components/Instruction';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';
import { manipulateKruxData } from 'src/hardware/krux';
import { manipulateSpecterData } from 'src/hardware/specter';

export const options = [
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
    Illustration,
    Instructions,
  } = route.params as any;
  const { showToast } = useToastMessage();
  const isDarkMode = colorMode === 'dark';
  const isHealthCheck = mode === InteracationMode.HEALTH_CHECK;
  const [infoModal, setInfoModal] = useState(false);
  const { translations } = useContext(LocalizationContext);
  const { common, signer: SignerText, error: ErrorText } = translations;

  const renderContent = () => {
    const data = xpubs[options[selectedIndex].purpose];
    return data ? (
      <SuccessContainer type={options[selectedIndex].label} />
    ) : (
      <QRScanner onScanCompleted={onScanCompleted} hideCamera={false} />
    );
  };

  const onScanCompleted = (data) => {
    let passportTaproot;
    try {
      if (type === SignerType.SEEDSIGNER) data = manipulateSeedSignerData(data);
      else if (type === SignerType.KRUX) data = manipulateKruxData(data);
      else if (type === SignerType.SPECTER) data = manipulateSpecterData(data);
      else if (type === SignerType.PASSPORT) {
        data = manipulatePassportDetails(getPassportDetails(data, true));
        passportTaproot = data?.taproot;
        delete data?.taproot;
      }
      const purpose = WalletUtilities.getPurpose(data.derivationPath);
      if (xpubs[purpose])
        showToast(
          `You have already scanned the ${options.find((tab) => tab.purpose === purpose).label} key`
        );
      else
        setXpubs({
          ...xpubs,
          [purpose]: data,
          ...(passportTaproot ? { [DerivationPurpose.BIP86]: passportTaproot } : {}),
        });
    } catch (error) {
      console.log('🚀 ~ onScanCompleted ~ error:', error);
      showToast(ErrorText.scanValidQR, <ToastErrorIcon />);
    }
  };
  const modalSubtitle = {
    [SignerType.PASSPORT]: SignerText.xPubPassPortSub,
    [SignerType.SEEDSIGNER]: SignerText.xPubSeedSignerSub,
    [SignerType.JADE]: SignerText.xPubJadeSub,
    [SignerType.KRUX]: SignerText.kruxQrSub,
  };

  const subtitleModal = modalSubtitle[type] || SignerText.xPubDefaultSubtitle;
  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <MockWrapper
        signerType={type}
        enable={setup && type && !disableMockFlow}
        addSignerFlow={addSignerFlow}
        mode={mode}
      >
        <WalletHeader
          title={title}
          subTitle={subtitle}
          rightComponent={
            !isHealthCheck ? (
              <TouchableOpacity style={styles.infoIcon} onPress={() => setInfoModal(true)}>
                <ThemedSvg name={'info_icon'} />
              </TouchableOpacity>
            ) : null
          }
        />
        <Box style={styles.segmentController}>
          <SegmentedController
            options={options.filter((tab) => {
              if ([SignerType.PASSPORT, SignerType.SPECTER].includes(type)) {
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
              primaryText={common.finish}
              primaryCallback={() => {
                onQrScan(xpubs);
              }}
            />
          )}
        </Box>
      </MockWrapper>
      <KeeperModal
        visible={infoModal}
        close={() => {
          setInfoModal(false);
        }}
        title={title}
        subTitle={subtitleModal}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => (
          <Box>
            <Box style={styles.illustration}>{Illustration}</Box>

            {Instructions?.map((instruction) => (
              <Instruction text={instruction} key={instruction} />
            ))}
          </Box>
        )}
      />
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
  infoIcon: {
    marginRight: wp(10),
  },
  illustration: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(20),
  },

  successTitle: { marginTop: hp(20), marginBottom: hp(12), fontSize: 16 },
  successSubTitle: { fontSize: 14, textAlign: 'center', maxWidth: '90%' },
});

export const SuccessContainer = ({ type }) => {
  const { colorMode } = useColorMode();
  const { signer: signerText } = useContext(LocalizationContext).translations;

  return (
    <Box alignItems={'center'}>
      <SuccessIllustration />
      <Text color={`${colorMode}.greenWhiteText`} semiBold style={styles.successTitle}>
        {`${type} ${signerText.keyAddedTitle}`}
      </Text>
      <Text style={styles.successSubTitle}>{`${type} ${signerText.keyAddedSubTitle}`}</Text>
    </Box>
  );
};
