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
import { useSelector } from 'react-redux';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { CommonActions } from '@react-navigation/native';
import Zendesk from 'src/services/backend/Zendesk';

const CreateTicket = ({ navigation }) => {
  const { colorMode } = useColorMode();
  const textAreaRef = useRef(null);
  const { allVaults } = useVault({});
  const { wallets } = useWallets();
  const { signerMap } = useSignerMap();
  const { conciergeUser } = useSelector((state) => state?.concierge);
  const { showToast } = useToastMessage();

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
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
        details += `${index + 1}.${signerMap[signer.masterFingerprint].signerName}  `;
      });
      details += '\n\n';
    });

    wallets.forEach((wallet) => {
      details += `Wallet Name:\n${wallet.presentationData.name}\n1 of 1, SingleSig`;
    });

    setDesc(details + '\n');
  };

  const onNext = async () => {
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
      const res = await Zendesk.createZendeskTicket({ desc, imageToken, conciergeUser });
      if (res.status === 201) {
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
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
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

          {imageUri && (
            <Box style={styles.imagePreviewContainer}>
              <ImagePreview imageUri={imageUri} onRemoveImage={handleRemoveImage} />
            </Box>
          )}

          <Box style={keyboardVisible ? styles.footerWithKeyboard : styles.footer}>
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
  footer: {
    marginBottom: 0,
  },
  footerWithKeyboard: {
    marginBottom: hp(123),
  },
  imagePreviewContainer: {
    paddingHorizontal: wp(25),
    paddingTop: hp(10),
    paddingBottom: hp(10),
  },
});

export default CreateTicket;
