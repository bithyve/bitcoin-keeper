import React, { useContext } from 'react';
import { Box, Pressable, useColorMode } from 'native-base';
import { useDispatch, useSelector } from 'react-redux';
import KeeperModal from 'src/components/KeeperModal';
import { ConciergeTag } from 'src/models/enums/ConciergeTag';
import BitcoinIllustration from 'src/assets/images/btc-illustration.svg';
import PrivateBitcoinIllustration from 'src/assets/privateImages/Bitcoin-Illustration.svg';
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
import ConciergeNeedHelp from 'src/assets/images/conciergeNeedHelp.svg';

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
  const { vault: vaultText, signer: signerText } = translations;

  const stackItems = [
    {
      Icon: SDIcons({ type: SignerType.KEEPER, light: true, width: 20, height: 20 }).Icon,
      backgroundColor: `${colorMode}.brownBackground`,
    },
    {
      Icon: SDIcons({ type: SignerType.MY_KEEPER, light: true, width: 11, height: 16 }).Icon,
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

function AddCoSignerContent({ privateTheme }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultText } = translations;

  return (
    <Box style={styles.contentContainer}>
      <Text color={`${colorMode}.headerWhite`} style={styles.addCoSigner}>
        {vaultText.collabModalDescription1}
      </Text>
      <Box style={styles.bitcoinIllustration}>
        {privateTheme ? <PrivateBitcoinIllustration /> : <BitcoinIllustration />}
      </Box>
      <Text color={`${colorMode}.headerWhite`} style={styles.addCoSigner}>
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
  const { common, vault: vaultText, signer: signerText, importWallet } = translations;
  const isDarkMode = colorMode === 'dark';
  const themeMode = useSelector((state: any) => state?.settings?.themeMode);
  const privateTheme = themeMode === 'PRIVATE';

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
          modalBackground={
            privateTheme ? `${colorMode}.primaryBackground` : `${colorMode}.pantoneGreen`
          }
          textColor={`${colorMode}.headerWhite`}
          Content={() => <AddCoSignerContent privateTheme={privateTheme} />}
          buttonText={common.Okay}
          secondaryButtonText={common.needHelp}
          buttonTextColor={`${colorMode}.textGreen`}
          buttonBackground={
            privateTheme ? `${colorMode}.pantoneGreen` : `${colorMode}.modalWhiteButton`
          }
          secButtonTextColor={
            privateTheme ? `${colorMode}.pantoneGreen` : `${colorMode}.modalGreenSecButtonText`
          }
          secondaryIcon={<ConciergeNeedHelp />}
          secondaryCallback={() => {
            setLearnMoreModal?.(false);
            navigation.dispatch(
              CommonActions.navigate({
                name: 'CreateTicket',
                params: {
                  tags: [ConciergeTag.COLLABORATIVE_Wallet],
                  screenName: 'setup-collaborative-vault',
                },
              })
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
          textColor={`${colorMode}.textGreen`}
          subTitleColor={`${colorMode}.modalSubtitleBlack`}
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
          textColor={`${colorMode}.textGreen`}
          subTitleColor={`${colorMode}.modalSubtitleBlack`}
          buttonTextColor={`${colorMode}.buttonText`}
          Content={() => <NFCModalContent onTryAnotherMethod={handleTryAnotherMethod} />}
        />
      )}

      {keyAddedModal && (
        <KeeperModal
          visible={keyAddedModal}
          title={signerText.contactAdded}
          subTitle={signerText.contactAddedDesc}
          close={() => {
            setKeyAddedModal?.(false);
          }}
          showCloseIcon
          modalBackground={`${colorMode}.modalWhiteBackground`}
          textColor={`${colorMode}.modalWhiteContent`}
          buttonText={importWallet.addDetails}
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
              <Text color={`${colorMode}.secondaryText`}>{signerText.editContactDetail}</Text>
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
