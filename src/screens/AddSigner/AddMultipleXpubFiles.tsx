import React, { useContext, useState } from 'react';
import { StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Box, Input, ScrollView, useColorMode } from 'native-base';
import useToastMessage from 'src/hooks/useToastMessage';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { SegmentedController } from '../../components/SegmentController';
import Text from 'src/components/KeeperText';
import { DerivationPurpose, SignerType } from 'src/services/wallets/enums';
import WalletUtilities from 'src/services/wallets/operations/utils';
import SuccessIllustration from 'src/assets/images/illustration.svg';
import Buttons from 'src/components/Buttons';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import WalletHeader from 'src/components/WalletHeader';
import KeeperModal from 'src/components/KeeperModal';
import Instruction from 'src/components/Instruction';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';
import { manipulateKruxData } from 'src/hardware/krux';
import { Tile } from '../NewKeeperAppScreen/NewKeeperAppScreen';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { importFile } from 'src/services/fs';

export const options = [
  { label: 'Singlesig', sub: 'BIP84', purpose: DerivationPurpose.BIP84 },
  { label: 'Multisig', sub: 'BIP48', purpose: DerivationPurpose.BIP48 },
  { label: 'Taproot', sub: 'BIP86', purpose: DerivationPurpose.BIP86 },
];

export const AddMultipleXpubFiles = ({ route, navigation }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { colorMode } = useColorMode();
  const [xpubs, setXpubs] = useState({});
  const { title, subTitle, onFileExtract, ctaText, signerType, Illustration, Instructions } =
    route.params;
  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);
  const { error: ErrorText, signer: signerText } = translations;
  const [infoModal, setInfoModal] = useState(false);

  const importCallback = () => {
    importFile(
      (data) => loadFileData(data),
      (_) => showToast(ErrorText.pickValidFile, <ToastErrorIcon />),
      'utf8'
    );
  };

  const renderContent = () => {
    const data = xpubs[options[selectedIndex].purpose];
    return data ? (
      <SuccessContainer type={options[selectedIndex].label} />
    ) : (
      <FileImportComponent importCallback={importCallback} loadFileData={loadFileData} />
    );
  };

  const loadFileData = (data) => {
    try {
      if (signerType === SignerType.KRUX) data = manipulateKruxData(data);
      const purpose = WalletUtilities.getPurpose(data.derivationPath);
      if (xpubs[purpose])
        showToast(
          `You have already loaded the ${options.find((tab) => tab.purpose === purpose).label} key`
        );
      else setXpubs({ ...xpubs, [purpose]: data });
    } catch (error) {
      console.log('🚀 ~ loadFileData ~ error:', error);
      showToast(ErrorText.pickValidFile, <ToastErrorIcon />);
    }
  };

  const modalSubtitle = {
    [SignerType.KRUX]: signerText.kruxQrSub,
  };

  const subtitleModal = modalSubtitle[signerType];

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader
        title={title}
        subTitle={subTitle}
        rightComponent={
          <TouchableOpacity style={styles.infoIcon} onPress={() => setInfoModal(true)}>
            <ThemedSvg name={'info_icon'} />
          </TouchableOpacity>
        }
      />
      <Box style={styles.segmentController}>
        <SegmentedController
          options={options}
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
            primaryText={ctaText}
            primaryCallback={() => {
              navigation.goBack();
              onFileExtract(JSON.stringify(xpubs));
            }}
          />
        )}
      </Box>
      <KeeperModal
        visible={infoModal}
        close={() => setInfoModal(false)}
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

  tileWrapper: {
    marginBottom: hp(15),
    marginLeft: wp(7),
    width: windowWidth * 0.85,
    borderWidth: 1,
    borderRadius: 10,
  },
  inputWrapper: {
    width: windowWidth * 0.85,
    marginTop: hp(10),
    marginLeft: wp(7),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: hp(15),
    paddingHorizontal: hp(10),
    borderWidth: 1,
  },
  textInput: {
    width: '100%',
    height: hp(110),
    fontSize: 11,
  },
});

export const SuccessContainer = ({ type }) => {
  const { colorMode } = useColorMode();
  const { signer } = useContext(LocalizationContext).translations;

  return (
    <Box alignItems={'center'}>
      <SuccessIllustration />
      <Text color={`${colorMode}.greenWhiteText`} semiBold style={styles.successTitle}>
        {`${type} ${signer.keyAddedTitle}`}
      </Text>
      <Text style={styles.successSubTitle}>{`${type} ${signer.keyAddedSubTitle}`}</Text>
    </Box>
  );
};

export const FileImportComponent = ({ importCallback, loadFileData }) => {
  const { colorMode } = useColorMode();
  const { signer: signerText } = useContext(LocalizationContext).translations;
  const [inputText, setInputText] = useState('');
  return (
    <>
      <Box style={styles.tileWrapper} borderColor={`${colorMode}.separator`}>
        <Tile
          title={signerText.importFile}
          subTitle={signerText.fromYourPhone}
          onPress={importCallback}
        />
      </Box>
      <Box
        style={styles.inputWrapper}
        backgroundColor={`${colorMode}.seashellWhite`}
        borderColor={`${colorMode}.separator`}
      >
        <Input
          testID="input_container"
          placeholder={signerText.manuallyEnterContent}
          placeholderTextColor={`${colorMode}.placeHolderTextColor`}
          style={styles.textInput}
          variant="unstyled"
          value={inputText}
          onChangeText={(text) => setInputText(text)}
          onSubmitEditing={() => loadFileData(inputText)}
          blurOnSubmit
          multiline
          _input={
            colorMode === 'dark' && {
              selectionColor: Colors.bodyText,
              cursorColor: Colors.bodyText,
            }
          }
        />
      </Box>
    </>
  );
};
