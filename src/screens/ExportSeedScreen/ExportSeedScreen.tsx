import Text from 'src/components/KeeperText';
import { Box, HStack, Pressable, useColorMode, VStack } from 'native-base';
import { FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import ConfirmSeedWord from 'src/components/SeedWordBackup/ConfirmSeedWord';
import CustomGreenButton from 'src/components/CustomButton/CustomGreenButton';
import KeeperHeader from 'src/components/KeeperHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ModalWrapper from 'src/components/Modal/ModalWrapper';
import StatusBarComponent from 'src/components/StatusBarComponent';
import { healthCheckSigner, seedBackedUp } from 'src/store/sagaActions/bhr';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { hp, wp } from 'src/constants/responsive';
import IconArrowBlack from 'src/assets/images/icon_arrow_black.svg';
import QR from 'src/assets/images/qr.svg';
import { globalStyles } from 'src/constants/globalStyles';
import KeeperModal from 'src/components/KeeperModal';
import ShowXPub from 'src/components/XPub/ShowXPub';
import TickIcon from 'src/assets/images/icon_tick.svg';
import useToastMessage from 'src/hooks/useToastMessage';
import { SignerType } from 'src/core/wallets/enums';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import Illustration from 'src/assets/images/illustration.svg';
import Note from 'src/components/Note/Note';

function ExportSeedScreen({ route, navigation }) {
  const { colorMode } = useColorMode();
  const navigtaion = useNavigation();
  const dispatch = useAppDispatch();
  const { translations } = useContext(LocalizationContext);
  const { BackupWallet, common, seed: seedTranslation } = translations;
  const { login } = translations;
  const {
    seed,
    wallet,
    isHealthCheck,
    signer,
  }: { seed: string; wallet: Wallet; isHealthCheck: boolean; signer: VaultSigner } = route.params;
  const { showToast } = useToastMessage();
  const [words, setWords] = useState(seed.split(' '));
  const { next, viewRecoveryKeys } = route.params;
  const [confirmSeedModal, setConfirmSeedModal] = useState(false);
  const [backupSuccessModal, setBackupSuccessModal] = useState(false);
  const [showQRVisible, setShowQRVisible] = useState(false);
  const [showWordIndex, setShowWordIndex] = useState<string | number>('');
  const { backupMethod } = useAppSelector((state) => state.bhr);
  const seedText = translations.seed;
  useEffect(() => {
    if (backupMethod !== null && next) {
      setBackupSuccessModal(true);
    }
  }, [backupMethod]);

  function SeedCard({ item, index }: { item; index }) {
    return (
      <>
        {viewRecoveryKeys ? (
          <Box style={styles.seedCardContainer}>
            <Box
              backgroundColor={`${colorMode}.seashellWhite`}
              opacity={showWordIndex === index ? 1 : 0.5}
              style={styles.seedCardWrapper}
            >
              <Text style={styles.seedTextStyle} medium color={`${colorMode}.greenText2`}>
                {index < 9 ? '0' : null}
                {index + 1}
              </Text>
              <Text
                testID={`text_seed_word_${index}`}
                style={styles.seedTextStyle01}
                color={`${colorMode}.GreyText`}
              >
                {item}
              </Text>
            </Box>
          </Box>
        ) : (
          <TouchableOpacity
            testID={`btn_seed_word_${index}`}
            style={styles.seedCardContainer}
            onPress={() => {
              setShowWordIndex((prev) => {
                if (prev === index) {
                  return '';
                }
                return index;
              });
            }}
          >
            <Box
              backgroundColor={`${colorMode}.seashellWhite`}
              opacity={showWordIndex === index ? 1 : 0.5}
              style={styles.seedCardWrapper}
            >
              <Text style={styles.seedTextStyle} color={`${colorMode}.greenText2`}>
                {index < 9 ? '0' : null}
                {index + 1}
              </Text>
              <Text
                testID={`text_seed_word_${index}`}
                style={styles.seedTextStyle01}
                color={`${colorMode}.GreyText`}
              >
                {showWordIndex === index ? item : '******'}
              </Text>
            </Box>
          </TouchableOpacity>
        )}
      </>
    );
  }

  const renderSeedCard = ({ item, index }: { item; index }) => (
    <SeedCard item={item} index={index} />
  );

  return (
    <Box style={styles.container} backgroundColor={`${colorMode}.primaryBackground`}>
      <StatusBarComponent padding={30} />
      <KeeperHeader title={seedText.backupPhrase} subtitle={seedText.SeedDesc} />

      <Box style={{ flex: 1 }}>
        <FlatList
          data={words}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          renderItem={renderSeedCard}
          keyExtractor={(item) => item}
        />
      </Box>
      <Box m={2}>
        <Note
          title={common.note}
          subtitle={BackupWallet.recoveryPhraseNote}
          subtitleColor="GreyText"
        />
      </Box>
      {!viewRecoveryKeys && !next && (
        <Pressable
          onPress={() => {
            // setShowQRVisible(true);
            navigation.navigate('UpdateWalletDetails', { wallet, isFromSeed: true, words });
          }}
        >
          <Box style={styles.qrItemContainer}>
            <HStack style={styles.qrItem}>
              <HStack alignItems="center">
                <QR />
                <VStack marginX="4" maxWidth="64">
                  <Text
                    color={`${colorMode}.primaryText`}
                    numberOfLines={2}
                    style={[globalStyles.font14, { letterSpacing: 1.12, alignItems: 'center' }]}
                  >
                    {common.showAsQR}
                  </Text>
                  {/* <Text color="light.GreyText" style={[globalStyles.font12, { letterSpacing: 0.06 }]}>

                </Text> */}
                </VStack>
              </HStack>
              <Box style={styles.backArrow}>
                <IconArrowBlack />
              </Box>
            </HStack>
          </Box>
        </Pressable>
      )}
      <Box style={styles.nextButtonWrapper}>
        {next && (
          <Box>
            <CustomGreenButton
              onPress={() => {
                setConfirmSeedModal(true);
              }}
              value={login.Next}
            />
          </Box>
        )}
      </Box>
      {/* Modals */}
      <Box>
        <ModalWrapper
          visible={confirmSeedModal}
          onSwipeComplete={() => setConfirmSeedModal(false)}
          position="center"
        >
          <ConfirmSeedWord
            closeBottomSheet={() => {
              setConfirmSeedModal(false);
            }}
            words={words}
            confirmBtnPress={() => {
              setConfirmSeedModal(false);
              if (isHealthCheck) {
                if (signer.type === SignerType.MOBILE_KEY) {
                  dispatch(healthCheckSigner([signer]));
                  navigation.dispatch(CommonActions.goBack());
                  showToast(seedTranslation.mobileKeyVerified, <TickIcon />);
                }
                if (signer.type === SignerType.SEED_WORDS) {
                  dispatch(healthCheckSigner([signer]));
                  navigation.dispatch(CommonActions.goBack());
                  showToast(seedTranslation.seedWordVerified, <TickIcon />);
                }
              } else {
                dispatch(seedBackedUp());
              }
            }}
          />
        </ModalWrapper>
      </Box>
      <KeeperModal
        visible={backupSuccessModal}
        dismissible={false}
        close={() => {}}
        title={BackupWallet.backupSuccessTitle}
        subTitleColor="light.secondaryText"
        textColor="light.primaryText"
        buttonText="Done"
        buttonCallback={() => navigation.replace('WalletBackHistory')}
        Content={() => (
          <Box>
            <Box>
              <Illustration />
            </Box>
            <Box>
              <Text>{BackupWallet.backupSuccessParagraph}</Text>
            </Box>
          </Box>
        )}
      />

      <KeeperModal
        visible={showQRVisible}
        close={() => setShowQRVisible(false)}
        title={BackupWallet.recoveryPhrase}
        subTitleWidth={wp(260)}
        subTitle={BackupWallet.recoveryPhraseSubTitle}
        subTitleColor="light.secondaryText"
        textColor="light.primaryText"
        buttonText={common.done}
        buttonCallback={() => setShowQRVisible(false)}
        Content={() => (
          <ShowXPub
            data={JSON.stringify(words)}
            subText={seedTranslation.walletRecoveryPhrase}
            noteSubText={seedTranslation.showXPubNoteSubText}
            copyable={false}
          />
        )}
      />
      <SafeAreaView />
    </Box>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  seedCardContainer: {
    width: '50%',
  },
  seedCardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    marginHorizontal: 8,
    marginVertical: 10,
  },
  seedTextStyle: {
    fontSize: 19,
    letterSpacing: 1.64,
    marginRight: 5,
  },
  seedTextStyle01: {
    fontSize: 19,
    fontWeight: '400',
    letterSpacing: 1,
  },
  nextButtonWrapper: {
    alignItems: 'flex-end',
    marginBottom: 5,
  },
  seedDescParagraph: {
    marginHorizontal: 2,
    marginTop: 5,
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.6,
    marginRight: 10,
  },
  qrItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: hp(15),
  },
  qrItem: {
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  backArrow: {
    width: '15%',
    alignItems: 'center',
  },
});
export default ExportSeedScreen;
