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
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import { StyleSheet } from 'react-native';
import StackedCirclesList from 'src/screens/Vault/components/StackedCircleList';
import { SignerType } from 'src/services/wallets/enums';
import { SDIcons } from 'src/screens/Vault/SigningDeviceIcons';

function NFCModalContent({ onTryAnotherMethod }) {
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

function AddKeyContent({ addKeyOptions }) {
  const { translations } = useContext(LocalizationContext);
  const { common, vault: vaultText } = translations;
  return (
    <Box style={styles.addKeyContent}>
      {addKeyOptions.map((option, index) => (
        <AddKeyOptions
          key={index}
          icon={option.icon}
          title={option.title}
          callback={option.callback}
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

function AddKeyOptions({
  icon,
  title,
  callback,
}: {
  icon: Element;
  title: string;
  callback: () => void;
}) {
  const { colorMode } = useColorMode();
  return (
    <Pressable onPress={callback}>
      <Box
        style={styles.keyOptionContainer}
        backgroundColor={`${colorMode}.boxSecondaryBackground`}
        borderColor={`${colorMode}.dullGreyBorder`}
      >
        <Box style={styles.keyOptionContent}>
          <CircleIconWrapper
            icon={icon}
            backgroundColor={`${colorMode}.pantoneGreen`}
            width={wp(39)}
          />
          <Text medium numberOfLines={1} color={`${colorMode}.primaryText`}>
            {title}
          </Text>
        </Box>
      </Box>
    </Pressable>
  );
}

function CollaborativeModals({
  addKeyModal,
  setAddKeyModal,
  addKeyOptions,
  learnMoreModal,
  setLearnMoreModal,
  nfcModal,
  setNfcModal,
  keyAddedModal,
  setKeyAddedModal,
}) {
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const { translations } = useContext(LocalizationContext);
  const { common, vault: vaultText } = translations;

  const handleTryAnotherMethod = () => {
    setNfcModal(false);
    setAddKeyModal(true);
  };

  return (
    <>
      <KeeperModal
        visible={learnMoreModal}
        close={() => setLearnMoreModal(false)}
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
          setLearnMoreModal(false);
          dispatch(goToConcierge([ConciergeTag.COLLABORATIVE_Wallet], 'setup-collaborative-vault'));
        }}
        buttonCallback={() => setLearnMoreModal(false)}
      />

      <KeeperModal
        visible={addKeyModal}
        close={() => setAddKeyModal(false)}
        DarkCloseIcon={colorMode === 'dark'}
        title={vaultText.addContactModalTitle}
        subTitle={vaultText.addContactModalSubtitle}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        buttonTextColor={`${colorMode}.buttonText`}
        Content={() => <AddKeyContent addKeyOptions={addKeyOptions} />}
      />

      <KeeperModal
        visible={nfcModal}
        close={() => setNfcModal(false)}
        DarkCloseIcon={colorMode === 'dark'}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        buttonTextColor={`${colorMode}.buttonText`}
        Content={() => <NFCModalContent onTryAnotherMethod={handleTryAnotherMethod} />}
      />

      <KeeperModal
        visible={keyAddedModal}
        title="Contact Added Successfully!"
        subTitle={'The new contact has been added to your collaborative wallet.'}
        close={() => {
          setKeyAddedModal(false);
        }}
        showCloseIcon
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.modalWhiteContent`}
        buttonText={'Add Details'}
        // buttonCallback={buttonCallback}
        secondaryButtonText={'Skip'}
        secondaryCallback={() => {
          setKeyAddedModal(false);
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
  keyOptionContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(20),
    paddingVertical: hp(16),
    borderWidth: 1,
    borderRadius: 10,
  },
  keyOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
