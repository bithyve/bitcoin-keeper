import React, { useContext } from 'react';
import { Box, Pressable, useColorMode } from 'native-base';
import { useDispatch } from 'react-redux';
import KeeperModal from 'src/components/KeeperModal';
import { goToConcierge } from 'src/store/sagaActions/concierge';
import { ConciergeTag } from 'src/models/enums/ConciergeTag';
import BitcoinIllustration from 'src/assets/images/btc-illustration.svg';
import SuccessCircleIllustration from 'src/assets/images/illustration.svg';
import NFCLight from 'src/assets/images/nfc-fade-lines-light.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Text from 'src/components/KeeperText';
import Note from 'src/components/Note/Note';
import { hp, wp } from 'src/constants/responsive';
import { StyleSheet } from 'react-native';
import StackedCirclesList from 'src/screens/Vault/components/StackedCircleList';
import { SignerType } from 'src/services/wallets/enums';
import { SDIcons } from 'src/screens/Vault/SigningDeviceIcons';
import MenuOption from 'src/components/MenuOption';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Signer } from 'src/services/wallets/interfaces/vault';

interface AddKeyOption {
  icon: JSX.Element;
  title: string;
  callback: () => void;
}

interface CollaborativeModalsProps {
  addKeyModal?: boolean;
  setAddKeyModal?: (value: boolean) => void;
  addKeyOptions?: AddKeyOption[];
  learnMoreModal?: boolean;
  setLearnMoreModal?: (value: boolean) => void;
  nfcModal?: boolean;
  setNfcModal?: (value: boolean) => void;
  keyAddedModal?: boolean;
  setKeyAddedModal?: (value: boolean) => void;
  signer?: Signer;
}

function NFCModalContent({ onTryAnotherMethod }: { onTryAnotherMethod: () => void }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultText } = translations;

  const stackItems = [
    {
      Icon: SDIcons(SignerType.KEEPER, true, 20, 20).Icon,
      backgroundColor: `${colorMode}.brownBackground`,
    },
    {
      Icon: SDIcons(SignerType.MY_KEEPER, true, 11, 16).Icon,
      backgroundColor: `${colorMode}.pantoneGreen`,
    },
  ];

  return (
    <Box style={styles.modalContainer}>
      <Box style={styles.modalContentContainer}>
        <NFCLight />
        <StackedCirclesList
          items={stackItems}
          width={wp(38)}
          height={wp(38)}
          itemDistance={wp(-11)}
          borderColor="transparent"
        />
        <Text
          color={`${colorMode}.greenText`}
          style={{ textAlign: 'center', width: wp(270) }}
          fontSize={18}
          medium
        >
          {vaultText.bringCloseToAdd}
        </Text>
      </Box>
      <Pressable onPress={onTryAnotherMethod}>
        <Box style={styles.ctaContainer}>
          <Text medium color={`${colorMode}.greenText`}>
            {vaultText.tryAnotherMethod}
          </Text>
        </Box>
      </Pressable>
    </Box>
  );
}

function AddCoSignerContent() {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultText } = translations;
  return (
    <Box style={styles.contentContainer}>
      <Text color={`${colorMode}.modalGreenContent`} style={styles.addCoSigner}>
        {vaultText.collabModalDescription1}
      </Text>
      <Box style={styles.bitcoinIllustration}>
        <BitcoinIllustration />
      </Box>
      <Text color={`${colorMode}.modalGreenContent`} style={styles.addCoSigner}>
        {vaultText.collabModalDescription2}
      </Text>
    </Box>
  );
}

function AddKeyContent({ addKeyOptions }: { addKeyOptions: AddKeyOption[] }) {
  const { translations } = useContext(LocalizationContext);
  const { common, vault: vaultText } = translations;
  return (
    <Box style={styles.addKeyContent}>
      {addKeyOptions.map((option, index) => (
        <MenuOption
          key={index}
          Icon={option.icon}
          title={option.title}
          callback={option.callback}
          showArrow={false}
        />
      ))}
      <Box style={styles.noteContainer}>
        <Note
          title={common.note}
          subtitleColor="GreyText"
          subtitle={vaultText.addContactNoteSubtitle}
        />
      </Box>
    </Box>
  );
}

function CollaborativeModals({
  addKeyModal,
  setAddKeyModal,
  addKeyOptions = [],
  learnMoreModal,
  setLearnMoreModal,
  nfcModal,
  setNfcModal,
  keyAddedModal,
  setKeyAddedModal,
  signer,
}: CollaborativeModalsProps) {
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { common, vault: vaultText } = translations;
  const isDarkMode = colorMode === 'dark';

  const handleTryAnotherMethod = () => {
    setNfcModal?.(false);
    setAddKeyModal?.(true);
  };

  return (
    <>
      {learnMoreModal && (
        <KeeperModal
          visible={learnMoreModal}
          close={() => setLearnMoreModal?.(false)}
          DarkCloseIcon
          title={vaultText.collaborativeVaultTitle}
          subTitle={vaultText.collaborativeVaultSubtitle}
          modalBackground={`${colorMode}.modalGreenBackground`}
          textColor={`${colorMode}.modalGreenContent`}
          Content={AddCoSignerContent}
          buttonText={common.Okay}
          secondaryButtonText={common.needHelp}
          buttonTextColor={`${colorMode}.modalWhiteButtonText`}
          buttonBackground={`${colorMode}.modalWhiteButton`}
          secButtonTextColor={`${colorMode}.modalGreenSecButtonText`}
          secondaryCallback={() => {
            setLearnMoreModal?.(false);
            dispatch(
              goToConcierge([ConciergeTag.COLLABORATIVE_Wallet], 'setup-collaborative-vault')
            );
          }}
          buttonCallback={() => setLearnMoreModal?.(false)}
        />
      )}

      {addKeyModal && (
        <KeeperModal
          visible={addKeyModal}
          close={() => setAddKeyModal?.(false)}
          DarkCloseIcon={colorMode === 'dark'}
          title={vaultText.addContactModalTitle}
          subTitle={vaultText.addContactModalSubtitle}
          modalBackground={`${colorMode}.modalWhiteBackground`}
          subTitleColor={`${colorMode}.secondaryText`}
          textColor={`${colorMode}.primaryText`}
          buttonTextColor={`${colorMode}.buttonText`}
          Content={() => <AddKeyContent addKeyOptions={addKeyOptions} />}
        />
      )}

      {nfcModal && (
        <KeeperModal
          visible={nfcModal}
          close={() => setNfcModal?.(false)}
          DarkCloseIcon={colorMode === 'dark'}
          modalBackground={`${colorMode}.modalWhiteBackground`}
          subTitleColor={`${colorMode}.secondaryText`}
          textColor={`${colorMode}.primaryText`}
          buttonTextColor={`${colorMode}.buttonText`}
          Content={() => <NFCModalContent onTryAnotherMethod={handleTryAnotherMethod} />}
        />
      )}

      {keyAddedModal && (
        <KeeperModal
          visible={keyAddedModal}
          title="Contact Added Successfully!"
          subTitle={'The new contact has been added to your collaborative wallet.'}
          close={() => {
            setKeyAddedModal?.(false);
          }}
          showCloseIcon
          modalBackground={`${colorMode}.modalWhiteBackground`}
          textColor={`${colorMode}.modalWhiteContent`}
          buttonText={'Add Details'}
          buttonCallback={() => {
            setKeyAddedModal?.(false);
            navigation.dispatch(
              CommonActions.navigate({
                name: 'AddContact',
                params: { signer, showContactButton: true, isWalletFlow: true },
              })
            );
          }}
          DarkCloseIcon={isDarkMode}
          secondaryButtonText={'Skip'}
          secondaryCallback={() => {
            setKeyAddedModal?.(false);
          }}
          Content={() => (
            <Box style={styles.externalKeyModal}>
              <SuccessCircleIllustration style={styles.externalKeyIllustration} />
              <Text color={`${colorMode}.secondaryText`}>
                You can also edit contact details from add details section
              </Text>
            </Box>
          )}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    gap: 20,
  },
  bitcoinIllustration: {
    alignSelf: 'center',
    marginTop: hp(20),
    marginBottom: hp(30),
  },
  addCoSigner: {
    width: wp(295),
  },
  addKeyContent: {
    gap: hp(10),
  },
  noteContainer: {
    marginTop: hp(10),
  },
  ctaContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(10),
    marginTop: hp(20),
    marginBottom: hp(5),
  },
  modalContainer: {
    gap: hp(20),
  },
  modalContentContainer: {
    alignItems: 'center',
    gap: hp(15),
  },
  externalKeyModal: {
    alignItems: 'center',
  },
  externalKeyIllustration: {
    marginBottom: hp(35),
    marginRight: wp(15),
  },
  externalKeyText: {
    marginBottom: hp(30),
  },
});

export default CollaborativeModals;
