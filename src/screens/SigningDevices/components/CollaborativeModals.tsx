import React, { useContext } from 'react';
import { Box, Pressable, useColorMode } from 'native-base';
import { useDispatch } from 'react-redux';
import KeeperModal from 'src/components/KeeperModal';
import { goToConcierge } from 'src/store/sagaActions/concierge';
import { ConciergeTag } from 'src/models/enums/ConciergeTag';
import BitcoinIllustration from 'src/assets/images/btc-illustration.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Text from 'src/components/KeeperText';
import Note from 'src/components/Note/Note';
import { hp, wp } from 'src/constants/responsive';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import { StyleSheet } from 'react-native';

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
        <Note title={common.note} subtitleColor="GreyText" subtitle={vaultText.addKeyNote} />
      </Box>
    </Box>
  );
}

function AddKeyOptions({
  icon,
  title,
  callback,
}: {
  icon: any;
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
}) {
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const { translations } = useContext(LocalizationContext);
  const { common, vault: vaultText } = translations;

  return (
    <>
      <KeeperModal
        visible={learnMoreModal}
        close={() => {
          setLearnMoreModal(false);
        }}
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
        buttonCallback={() => {
          setLearnMoreModal(false);
        }}
      />

      <KeeperModal
        visible={addKeyModal}
        close={() => {
          setAddKeyModal(false);
        }}
        DarkCloseIcon={colorMode === 'dark'}
        title={vaultText.addAKey}
        subTitle={vaultText.selectMedium}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        buttonTextColor={`${colorMode}.buttonText`}
        Content={() => <AddKeyContent addKeyOptions={addKeyOptions} />}
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
});

export default CollaborativeModals;
