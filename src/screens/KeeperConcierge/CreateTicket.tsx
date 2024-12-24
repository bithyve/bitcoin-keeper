import { Box, TextArea, useColorMode } from 'native-base';
import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
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
import { useDispatch, useSelector } from 'react-redux';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { CommonActions } from '@react-navigation/native';
import Zendesk from 'src/services/backend/Zendesk';
import { updateTicketCommentsCount } from 'src/store/reducers/concierge';
import { getKeyUID } from 'src/utils/utilities';

const CreateTicket = ({ navigation }) => {
  const { colorMode } = useColorMode();
  const textAreaRef = useRef(null);
  const { allVaults } = useVault({});
  const { wallets } = useWallets();
  const { signerMap } = useSignerMap();
  const { conciergeUser } = useSelector((state) => state?.concierge);
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [imageUri, setImageUri] = useState(null);
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const isiOS = Platform.OS === 'ios';

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

  const addAttributes = () => {
    let details = desc + '\n';
    details += `I have ${allVaults?.length} vault(s) and ${wallets?.length} wallet(s) with following attributes:\n\n`;

    allVaults.forEach((vault) => {
      details += `Vault Name:\n${vault.presentationData.name}\n`;
      details += `${vault.scheme.m} of ${vault.scheme.n}, Multisig\nKeys:\n`;
      vault.signers.forEach((signer, index) => {
        details += `${index + 1}.${signerMap[getKeyUID(signer)].signerName}  `;
      });
      details += '\n\n';
    });

    wallets.forEach((wallet) => {
      details += `Wallet Name:\n${wallet.presentationData.name}\n1 of 1, SingleSig`;
    });

    setDesc(details + '\n');
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

  return (
    <ConciergeScreenWrapper
      backgroundcolor={`${colorMode}.pantoneGreen`}
      barStyle="light-content"
      loading={loading}
    >
      <ConciergeHeader title={'Technical Support'} />
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
              addAttributes={addAttributes}
              onNext={onNext}
            />
          </Box>
        </KeyboardAvoidingView>
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
});

export default CreateTicket;
