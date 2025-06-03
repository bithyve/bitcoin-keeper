import { Box, TextArea, useColorMode } from 'native-base';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Pressable,
  ScrollView,
} from 'react-native';
import ConciergeHeader from './components/ConciergeHeader';
import ConciergeScreenWrapper from './components/ConciergeScreenWrapper';
import ContentWrapper from '../../components/ContentWrapper';
import { hp, wp } from 'src/constants/responsive';
import CTAFooter from './components/CTAFooter';
import ImagePreview from './components/ImagePreview';
import useVault from 'src/hooks/useVault';
import useWallets from 'src/hooks/useWallets';
import useSignerMap from 'src/hooks/useSignerMap';
import { useDispatch } from 'react-redux';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import Zendesk from 'src/services/backend/Zendesk';
import { loadConciergeTickets, updateTicketCommentsCount } from 'src/store/reducers/concierge';
import { getKeyUID } from 'src/utils/utilities';
import KeeperModal from 'src/components/KeeperModal';
import { useAppSelector } from 'src/store/hooks';
import Text from 'src/components/KeeperText';
import DeviceInfo from 'react-native-device-info';
import usePlan from 'src/hooks/usePlan';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { TorContext } from 'src/context/TorContext';
import { useNetInfo } from '@react-native-community/netinfo';
import Node from 'src/services/electrum/node';
import { NodeDetail } from 'src/services/wallets/interfaces';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import CheckBoxActive from 'src/assets/images/checkbox_active.svg';
import CheckBoxInactive from 'src/assets/images/checkbox_inactive.svg';
import CheckBoxOutlineActive from 'src/assets/images/checkbox_outline_active.svg';
import CheckBoxOutlineInActive from 'src/assets/images/checkbox_outline_inactive.svg';
import SuccessCircleIllustration from 'src/assets/images/illustration.svg';

const DEFAULT_SELECTED_DETAILS = {
  walletInfo: false,
  deviceInfo: false,
  appData: false,
  networkInfo: false,
};

const br = '\n------------------------------------\n';

const CreateTicket = ({ navigation, route }) => {
  const { screenName, tags, errorDetails } = route.params;
  const {
    concierge: conciergeText,
    error: errorText,
    common,
  } = useContext(LocalizationContext).translations;
  const { colorMode } = useColorMode();
  const textAreaRef = useRef(null);
  const { allVaults } = useVault({});
  const { wallets } = useWallets();
  const { signerMap } = useSignerMap();
  const { conciergeUser } = useAppSelector((state) => state?.concierge);
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [imageUris, setImageUris] = useState(null);
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const isiOS = Platform.OS === 'ios';
  const { plan } = usePlan();
  const appVersionHistory = useQuery(RealmSchema.VersionHistory).map(getJSONFromRealmObject);
  const { torStatus } = useContext(TorContext);
  const { type: networkType } = useNetInfo();
  const nodes: NodeDetail[] = Node.getAllNodes();
  const [selectedDetails, setSelectedDetails] = useState(DEFAULT_SELECTED_DETAILS);
  const allKeysTrue = Object.values(selectedDetails).every((value) => value);
  const [showModal, setShowModal] = useState(false);
  const [modalTicketId, setModalTicketId] = useState('');

  const DETAIL_OPTIONS = [
    {
      label: conciergeText.deviceDetails,
      onPress: () =>
        setSelectedDetails({
          ...selectedDetails,
          deviceInfo: !selectedDetails.deviceInfo,
        }),
      id: 'deviceInfo',
    },
    {
      label: conciergeText.walletInfo,
      onPress: () =>
        setSelectedDetails({
          ...selectedDetails,
          walletInfo: !selectedDetails.walletInfo,
        }),
      id: 'walletInfo',
    },
    {
      label: conciergeText.appData,
      onPress: () =>
        setSelectedDetails({
          ...selectedDetails,
          appData: !selectedDetails.appData,
        }),
      id: 'appData',
    },
    {
      label: conciergeText.networkInfo,
      onPress: () =>
        setSelectedDetails({
          ...selectedDetails,
          networkInfo: !selectedDetails.networkInfo,
        }),
      id: 'networkInfo',
    },
  ];

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height - (isiOS ? hp(10) : 0));
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', (e) => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    if (errorDetails) {
      setDesc(
        `${conciergeText.encounteredError}:\n${errorDetails}\n\n${conciergeText.atAppNavigationState}: ${screenName}\n*****\n`
      );
    } else if (!desc.length && screenName.length) {
      setDesc(`${conciergeText.needSomeHelp} ${screenName}(${tags.join(', ')})\n*****\n`);
    }
    const timer = setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleAttachScreenshot = (uri) => {
    setImageUris(uri);
  };

  const handleRemoveImage = (indexToDelete) => {
    const updatedImagesUri = imageUris.filter((_, idx) => idx !== indexToDelete);
    setImageUris(updatedImagesUri);
  };

  const addWalletInfo = () => {
    const heading = `\nI have ${allVaults?.length} ${
      allVaults.length > 1 ? 'vaults' : 'vault'
    } and ${wallets?.length} ${
      wallets.length > 1 ? 'wallets' : 'wallet'
    } with following attributes:\n\n`;
    const vaultDetails = allVaults.map(
      (vault) =>
        `Vault Name:      ${vault.presentationData.name}\nLabels:              ${
          vault.scheme.m
        }-of-${vault.scheme.n} | Multisig\nKeys:                 ${vault.signers
          .map((signer, index) => `${index + 1}. ${signerMap[getKeyUID(signer)].signerName}  `)
          .join('')}\n${br}\n`
    );
    const walletDetails = wallets.map(
      (wallet) =>
        `Wallet Name:     ${wallet.presentationData.name}\nLabels:               1-of-1 | Singlesig`
    );
    return heading + (vaultDetails.concat(walletDetails).join('') + '\n') + br;
  };

  const addDeviceInfo = async () => {
    let device;
    if (isiOS) device = DeviceInfo.getDeviceId();
    else device = await DeviceInfo.getDevice();
    const osVersion = DeviceInfo.getSystemVersion();
    const osName = DeviceInfo.getSystemName();
    return `\nPhone Type:    ${device}\nOS Version:     ${osName} ${osVersion}\n${br}`;
  };

  const addAppData = () => {
    const isAppUpgraded = appVersionHistory.length > 1;
    const currentVersion = appVersionHistory.pop().version;
    const installedVersion = appVersionHistory?.[0]?.version;
    return `\nMy Keeper app is on ${currentVersion} version${
      isAppUpgraded ? ` upgraded from version ${installedVersion}` : ' with first-time setup and'
    } on ${plan} tier\n${br}`;
  };

  const addNetworkInfo = () => {
    const activeNode = nodes.find((node) => node.isConnected);
    return `\nMy app is connected to ${
      activeNode?.host || 'unknown'
    } node over a ${networkType} network ${torStatus === 'CONNECTED' ? 'over Tor' : ''}\n${br}`;
  };

  const onNext = async () => {
    if (!desc.length) {
      showToast(errorText.provideIssueDescription, <ToastErrorIcon />);
      return;
    }
    if (!conciergeUser) {
      showToast(errorText.somethingWentWrong, <ToastErrorIcon />);
      return;
    }
    try {
      setLoading(true);
      let imageToken = null;
      if (imageUris) {
        imageToken = await uploadFile();
      }
      const res = await Zendesk.createZendeskTicket({
        desc: desc.trim(),
        imageToken,
        conciergeUser,
      });
      if (res.status === 201) {
        dispatch(updateTicketCommentsCount({ [res.data.ticket.id.toString()]: 1 }));
        const tickets = await Zendesk.fetchZendeskTickets(conciergeUser.id);
        if (tickets.status === 200) dispatch(loadConciergeTickets(tickets.data.tickets));
        setModalTicketId(res.data.ticket.id);
        Keyboard.dismiss();
        setShowModal(true);
      } else {
        showToast(errorText.somethingWentWrong, <ToastErrorIcon />);
        return;
      }
    } catch (error) {
      console.log('🚀 ~ onNext ~ error:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async () => {
    const responses = await Promise.all(imageUris.map((uri) => Zendesk.uploadMedia(uri)));
    const imageTokens = await Promise.all(
      responses.map((res) => {
        if (res.status === 201 && res.data.upload.token) return res.data.upload.token;
      })
    );
    return imageTokens;
  };

  const closeDetailsModal = () => {
    setShowDetails(false);
    setSelectedDetails(DEFAULT_SELECTED_DETAILS);
  };

  const handleModelSelectAll = () => {
    console.log({ allKeysTrue });
    if (allKeysTrue) {
      setSelectedDetails(DEFAULT_SELECTED_DETAILS);
    } else {
      setSelectedDetails({
        walletInfo: true,
        deviceInfo: true,
        appData: true,
        networkInfo: true,
      });
    }
  };

  const handleAddDetails = async () => {
    setShowDetails(false);
    let finalDetails = desc;
    if (selectedDetails.deviceInfo) finalDetails += await addDeviceInfo();
    if (selectedDetails.walletInfo) finalDetails += addWalletInfo();
    if (selectedDetails.appData) finalDetails += addAppData();
    if (selectedDetails.networkInfo) finalDetails += addNetworkInfo();
    setDesc(finalDetails);
    setSelectedDetails(DEFAULT_SELECTED_DETAILS);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalTicketId('');
    navigation.pop();
  };

  return (
    <ConciergeScreenWrapper
      backgroundcolor={`${colorMode}.pantoneGreen`}
      barStyle="light-content"
      loading={loading}
    >
      <ConciergeHeader title={conciergeText.conciergeTitle} />
      <ContentWrapper backgroundColor={`${colorMode}.primaryBackground`}>
        <KeyboardAvoidingView style={styles.container} behavior={isiOS ? 'padding' : undefined}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <Box style={styles.inputContainer}>
              <TextArea
                value={desc}
                ref={textAreaRef}
                variant={'unstyled'}
                autoCompleteType={'off'}
                placeholderTextColor={`${colorMode}.placeHolderTextColor`}
                placeholder={conciergeText.tellUsAboutYourQuestion}
                color={`${colorMode}.primaryText`}
                h={hp(281)}
                onChangeText={setDesc}
                style={styles.textArea}
              />
            </Box>
          </TouchableWithoutFeedback>

          <Box
            style={[
              styles.footerCTR,
              isiOS && {
                paddingBottom: keyboardHeight,
              },
            ]}
          >
            {imageUris && (
              <ScrollView
                horizontal
                contentContainerStyle={styles.imagePreviewContainer}
                showsHorizontalScrollIndicator={false}
              >
                {imageUris.map((uri, index) => (
                  <ImagePreview
                    key={index + uri}
                    imageUri={uri}
                    onRemoveImage={handleRemoveImage}
                    index={index}
                  />
                ))}
              </ScrollView>
            )}
            <CTAFooter
              onAttachScreenshot={handleAttachScreenshot}
              addAttributes={() => {
                Keyboard.dismiss();
                setTimeout(() => setShowDetails(true), 300);
              }}
              onNext={onNext}
            />
          </Box>
        </KeyboardAvoidingView>
        <KeeperModal
          visible={showDetails}
          title={conciergeText.conciergeAdditionDetailTitle}
          subTitle={conciergeText.conciergeAdditionDetailSubTitle}
          close={closeDetailsModal}
          showCloseIcon
          modalBackground={`${colorMode}.modalWhiteBackground`}
          textColor={`${colorMode}.modalWhiteContent`}
          buttonText={common.share}
          buttonCallback={handleAddDetails}
          Content={() => (
            <>
              <Pressable onPress={handleModelSelectAll} style={styles.modalActionCtr}>
                {allKeysTrue ? (
                  <CheckBoxOutlineActive width={wp(18)} height={wp(18)} />
                ) : (
                  <CheckBoxOutlineInActive width={wp(18)} height={wp(18)} />
                )}
                <Text fontSize={14} semiBold color={`${colorMode}.pantoneGreen`}>
                  {allKeysTrue ? common.unSelectAll : common.SelectAll}
                </Text>
              </Pressable>
              <Box style={styles.optionsWrapper}>
                {DETAIL_OPTIONS.map((option, index) => (
                  <OptionItem
                    key={index}
                    option={option}
                    colorMode={colorMode}
                    active={selectedDetails[option.id]}
                  />
                ))}
              </Box>
            </>
          )}
        />
      </ContentWrapper>
      <KeeperModal
        visible={showModal}
        title={conciergeText.supportTicketRaised}
        subTitle={`${conciergeText.yourTicketReferenceNumber} #${modalTicketId}`}
        close={closeModal}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.modalWhiteContent`}
        buttonText={'Okay'}
        buttonCallback={closeModal}
        Content={() => (
          <Box style={styles.modal}>
            <SuccessCircleIllustration style={styles.illustration} />
            <Text color={`${colorMode}.secondaryText`} style={styles.modalDesc}>
              {conciergeText.AcknowledgingYourMessage}
            </Text>
          </Box>
        )}
      />
    </ConciergeScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    flex: 1,
    paddingHorizontal: wp(12),
    paddingVertical: hp(16),
  },
  footerCTR: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  imagePreviewContainer: {
    paddingHorizontal: wp(25),
    paddingTop: hp(10),
    paddingBottom: hp(10),
    flexDirection: 'row',
    gap: wp(10),
  },
  modalActionCtr: {
    flexDirection: 'row',
    gap: wp(10),
    marginBottom: hp(16),
    alignItems: 'center',
  },
  modalDesc: {
    fontSize: 14,
  },
  optionsWrapper: {
    gap: hp(10),
  },
  optionIconCtr: {
    height: hp(35),
    width: wp(35),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
  optionCTR: {
    flexDirection: 'row',
    paddingHorizontal: wp(16),
    paddingVertical: hp(19),
    alignItems: 'center',
    gap: wp(20),
    borderRadius: 12,
    borderWidth: 1,
  },
  illustration: {
    marginBottom: hp(20),
    marginRight: wp(15),
    alignSelf: 'center',
  },
  modal: {
    alignItems: 'center',
  },
  textArea: {
    fontSize: 13,
    fontWeight: '400',
  },
});

const OptionItem = ({ option, colorMode, active }) => {
  return (
    <Pressable onPress={option.onPress}>
      <Box
        style={styles.optionCTR}
        backgroundColor={`${colorMode}.boxSecondaryBackground`}
        borderColor={`${colorMode}.greyBorder`}
      >
        {active ? (
          <CheckBoxActive width={wp(18)} height={wp(18)} />
        ) : (
          <CheckBoxInactive width={wp(18)} height={wp(18)} />
        )}
        <Text color={`${colorMode}.secondaryText`} fontSize={14} medium>
          {option.label}
        </Text>
      </Box>
    </Pressable>
  );
};

export default CreateTicket;
