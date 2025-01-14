import { Box, TextArea, useColorMode } from 'native-base';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Pressable,
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
import { CommonActions } from '@react-navigation/native';
import Zendesk from 'src/services/backend/Zendesk';
import { updateTicketCommentsCount } from 'src/store/reducers/concierge';
import { getKeyUID } from 'src/utils/utilities';
import KeeperModal from 'src/components/KeeperModal';
import { useAppSelector } from 'src/store/hooks';
import DeviceDetailsIcon from 'src/assets/images/details-device.svg';
import WalletInfoIcon from 'src/assets/images/details-wallet.svg';
import AppDataIcon from 'src/assets/images/details-app.svg';
import NetworkInfoIcon from 'src/assets/images/details-network.svg';
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

const CreateTicket = ({ navigation, route }) => {
  const { screenName, tags } = route.params;
  const { concierge: conciergeText } = useContext(LocalizationContext).translations;
  const { colorMode } = useColorMode();
  const textAreaRef = useRef(null);
  const { allVaults } = useVault({});
  const { wallets } = useWallets();
  const { signerMap } = useSignerMap();
  const { conciergeUser } = useAppSelector((state) => state?.concierge);
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [imageUri, setImageUri] = useState(null);
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const isiOS = Platform.OS === 'ios';
  const { plan } = usePlan();
  const appVersionHistory = useQuery(RealmSchema.VersionHistory).map(getJSONFromRealmObject);
  const { torStatus } = useContext(TorContext);
  const { type: networkType } = useNetInfo();
  const nodes: NodeDetail[] = Node.getAllNodes();

  const DETAIL_OPTIONS = [
    { label: 'Device Details', icon: <DeviceDetailsIcon />, onPress: () => addDeviceInfo() },
    { label: 'Wallets Info', icon: <WalletInfoIcon />, onPress: () => addWalletInfo() },
    { label: 'App Data', icon: <AppDataIcon />, onPress: () => addAppData() },
    { label: 'Network Info', icon: <NetworkInfoIcon />, onPress: () => addNetworkInfo() },
  ];

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height - (isiOS ? hp(32) : 0));
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
    const timer = setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleAttachScreenshot = (uri) => {
    setImageUri(uri);
  };

  const handleRemoveImage = () => {
    setImageUri(null);
  };

  const addWalletInfo = () => {
    setShowDetails(false);

    let details = `${desc}\nI have ${allVaults?.length} vault(s) and ${wallets?.length} wallet(s) with following attributes:\n\n`;

    allVaults.forEach((vault) => {
      details += `Vault Name:\n${vault.presentationData.name}\n`;
      details += `${vault.scheme.m} of ${vault.scheme.n}, Multisig\nKeys:\n`;
      vault.signers.forEach((signer, index) => {
        details += `${index + 1}.${signerMap[getKeyUID(signer)].signerName}  `;
      });
      details += '\n\n';
    });

    wallets.forEach((wallet) => {
      details += `Wallet Name:\n${wallet.presentationData.name}\n1 of 1, SingleSig\n\n`;
    });
    details += '\n';
    if (screenName) details += `\nScreen Name: ${screenName}`;
    if (tags.length) details += `\nTags: ${tags.join(', ')}`;
    setDesc(details.trim() + `\n*****\n`);
  };

  const addDeviceInfo = async () => {
    setShowDetails(false);
    const data = DeviceInfo.getDeviceId();
    const os = DeviceInfo.getSystemVersion();

    let details = `${desc}\nI have a ${data} running on OS version ${os}\n*****\n`;
    setDesc(details);
  };

  const addAppData = async () => {
    setShowDetails(false);
    const isAppUpgraded = appVersionHistory.length > 1;
    const currentVersion = appVersionHistory.pop().version;
    const installedVersion = appVersionHistory[0].version;
    const details = `${desc}\nMy Keeper app in on ${currentVersion} version${
      isAppUpgraded ? ` upgraded from version ${installedVersion}` : ''
    } on ${plan} tier\n*****\n`;
    setDesc(details);
  };

  const addNetworkInfo = async () => {
    setShowDetails(false);
    const activeNode = nodes.find((node) => node.isConnected);
    let details = `${desc}\nMy app is connected to ${
      activeNode?.host || 'unknown'
    } node over a ${networkType} network ${torStatus === 'OFF' ? '' : 'over Tor'}\n*****\n`;
    setDesc(details);
  };

  const onNext = async () => {
    if (!desc.length) {
      showToast('Please provide the issue description', <ToastErrorIcon />);
      return;
    }
    if (!conciergeUser) {
      showToast('Something went wrong. Please try again', <ToastErrorIcon />);
      return;
    }
    try {
      setLoading(true);
      let imageToken = null;
      if (imageUri) {
        imageToken = await uploadFile();
      }
      const res = await Zendesk.createZendeskTicket({
        desc: desc.trim(),
        imageToken,
        conciergeUser,
      });
      if (res.status === 201) {
        dispatch(updateTicketCommentsCount({ [res.data.ticket.id.toString()]: 1 }));
        navigation.dispatch(
          CommonActions.navigate({
            name: 'TechnicalSupport',
            params: {
              ticketCreated: true,
              newTicketId: res.data.ticket.id,
            },
          })
        );
      } else {
        showToast('Something went wrong. Please try again!', <ToastErrorIcon />);
        return;
      }
    } catch (error) {
      console.log('🚀 ~ onNext ~ error:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async () => {
    const res = await Zendesk.uploadMedia(imageUri);
    if (res.status === 201 && res.data.upload.token) {
      return res.data.upload.token;
    }
    throw new Error('Something went wrong');
  };

  const closeDetailsModal = () => {
    setShowDetails(false);
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
                placeholder={' Please tell us about your question or the issue you are facing?'}
                color={`${colorMode}.primaryText`}
                fontSize={12}
                h={hp(281)}
                onChangeText={setDesc}
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
            {imageUri && (
              <Box style={styles.imagePreviewContainer}>
                <ImagePreview imageUri={imageUri} onRemoveImage={handleRemoveImage} />
              </Box>
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
          Content={() => (
            <Box style={styles.modal}>
              {DETAIL_OPTIONS.map((option, index) => (
                <OptionItem key={index} option={option} colorMode={colorMode} />
              ))}
            </Box>
          )}
        />
      </ContentWrapper>
    </ConciergeScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    flex: 1,
    paddingHorizontal: wp(25),
    paddingVertical: hp(25),
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
  },
  modal: {
    gap: hp(10),
  },
  modalDesc: {
    fontSize: 14,
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
    paddingHorizontal: wp(12),
    paddingVertical: hp(16),
    alignItems: 'center',
    gap: wp(16),
    borderRadius: 12,
    borderWidth: 1,
  },
});

const OptionItem = ({ option, colorMode }) => (
  <Pressable onPress={option.onPress}>
    <Box
      style={styles.optionCTR}
      backgroundColor={`${colorMode}.boxSecondaryBackground`}
      borderColor={`${colorMode}.greyBorder`}
    >
      <Box style={styles.optionIconCtr} backgroundColor={`${colorMode}.greyBorder`}>
        {option.icon}
      </Box>
      <Text color={`${colorMode}.secondaryText`} fontSize={14} medium>
        {option.label}
      </Text>
    </Box>
  </Pressable>
);



export default CreateTicket;
