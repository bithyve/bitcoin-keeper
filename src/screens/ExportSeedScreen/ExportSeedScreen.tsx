import Text from 'src/components/KeeperText';
import { Box, HStack, Pressable, VStack } from 'native-base';
import { FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import BackupSuccessful from 'src/components/SeedWordBackup/BackupSuccessful';
import ConfirmSeedWord from 'src/components/SeedWordBackup/ConfirmSeedWord';
import CustomGreenButton from 'src/components/CustomButton/CustomGreenButton';
import HeaderTitle from 'src/components/HeaderTitle';
import { LocalizationContext } from 'src/common/content/LocContext';
import ModalWrapper from 'src/components/Modal/ModalWrapper';
import StatusBarComponent from 'src/components/StatusBarComponent';
import { seedBackedUp } from 'src/store/sagaActions/bhr';
import { useNavigation } from '@react-navigation/native';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import IconArrowBlack from 'src/assets/images/icon_arrow_black.svg';
import QR from 'src/assets/images/qr.svg';
import { globalStyles } from 'src/common/globalStyles';
import KeeperModal from 'src/components/KeeperModal';
import ShowXPub from 'src/components/XPub/ShowXPub';
import TickIcon from 'src/assets/images/icon_tick.svg';

function ExportSeedScreen({ route, navigation }) {
  const navigtaion = useNavigation();
  const dispatch = useAppDispatch();
  const { translations } = useContext(LocalizationContext);
  const { BackupWallet } = translations;
  const { login } = translations;
  const { seed } = route.params;
  const [words] = useState(seed.split(' '));
  const { next } = route.params;
  const [confirmSeedModal, setConfirmSeedModal] = useState(false);
  const [backupSuccessModal, setBackupSuccessModal] = useState(false);
  const [showQRVisible, setShowQRVisible] = useState(false);
  const [showWordIndex, setShowWordIndex] = useState<string | number>('');
  const { backupMethod } = useAppSelector((state) => state.bhr);
  const seedText = translations.seed;

  useEffect(() => {
    if (backupMethod !== null) {
      setBackupSuccessModal(true);
      setTimeout(() => {
        navigation.replace('WalletBackHistory');
      }, 100);
    }
  }, [backupMethod]);

  function SeedCard({ item, index }: { item; index }) {
    return (
      <TouchableOpacity
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
          backgroundColor="light.primaryBackground"
          opacity={showWordIndex === index ? 1 : 0.5}
          style={styles.seedCardWrapper}
        >
          <Text style={styles.seedTextStyle} color="light.greenText2">
            {index < 9 ? '0' : null}
            {index + 1}
          </Text>
          <Text style={styles.seedTextStyle01} backgroundColor="green.700" color="light.GreyText">
            {showWordIndex === index ? item : '******'}
          </Text>
        </Box>
      </TouchableOpacity>
    );
  }

  const renderSeedCard = ({ item, index }: { item; index }) => (
    <SeedCard item={item} index={index} />
  );

  return (
    <Box style={styles.container} background="light.mainBackground">
      <StatusBarComponent padding={30} />
      <HeaderTitle
        title={seedText.recoveryPhrase}
        subtitle={seedText.SeedDesc}
        onPressHandler={() => navigtaion.goBack()}
      />

      <Box marginTop={windowHeight > 800 ? 10 : 2} height={windowHeight / 1.88}>
        <FlatList
          data={words}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          renderItem={renderSeedCard}
          keyExtractor={(item) => item}
        />
      </Box>
      <Pressable
        onPress={() => {
          setShowQRVisible(true);
        }}
      >
        <Box style={styles.qrItemContainer}>
          <HStack style={styles.qrItem}>
            <HStack alignItems="center">
              <QR />
              <VStack marginX="4" maxWidth="64">
                <Text
                  color="light.primaryText"
                  numberOfLines={2}
                  style={[globalStyles.font14, { letterSpacing: 1.12, alignItems: 'center' }]}
                >
                  Master Recovery Phrase
                </Text>
                <Text color="light.GreyText" style={[globalStyles.font12, { letterSpacing: 0.06 }]}>
                The QR below comprises of your 12 word Recovery Phrase
                </Text>
              </VStack>
            </HStack>
            <Box style={styles.backArrow}>
              <IconArrowBlack />
            </Box>
          </HStack>
        </Box>
      </Pressable>
      <Text
        color="light.GreyText"
        style={[
          globalStyles.font12,
          { letterSpacing: 0.06, paddingHorizontal: 10, paddingBottom: 10 },
        ]}
      >
        Losing your Recovery Phrase may result in permanent loss of funds. Store them carefully.
      </Text>
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
      {!next && (
        <Text style={styles.seedDescParagraph} color="light.GreyText">
          {seedText.desc}
        </Text>
      )}
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
              dispatch(seedBackedUp());
            }}
          />
        </ModalWrapper>
      </Box>
      <Box>
        <ModalWrapper
          visible={backupSuccessModal}
          onSwipeComplete={() => setBackupSuccessModal(false)}
        >
          <BackupSuccessful
            title={BackupWallet.backupSuccessTitle}
            subTitle={BackupWallet.backupSuccessSubTitle}
            paragraph={BackupWallet.backupSuccessParagraph}
            closeBottomSheet={() => {
              setBackupSuccessModal(false);
            }}
            confirmBtnPress={() => {
              navigtaion.navigate('NewHome');
            }}
          />
        </ModalWrapper>
      </Box>
      <KeeperModal
        visible={showQRVisible}
        close={() => setShowQRVisible(false)}
        title="Show as QR"
        subTitleWidth={wp(260)}
        subTitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
        subTitleColor="light.secondaryText"
        textColor="light.primaryText"
        buttonText="Done"
        buttonCallback={() => setShowQRVisible(false)}
        Content={() => (
          <ShowXPub
            data={JSON.stringify(words)}
            subText="Master Recovery Phrase"
            noteSubText="Lorem ipsum dolor sit amet, "
            copyable={false}
          />
        )}
      />
    </Box>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
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
    fontWeight: '500',
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
    marginBottom: hp(25),
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
