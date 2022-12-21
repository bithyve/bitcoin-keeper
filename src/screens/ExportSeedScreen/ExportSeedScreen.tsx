import { Box, Text } from 'native-base';
import { FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { RFValue } from 'react-native-responsive-fontsize';

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
import { windowHeight } from 'src/common/data/responsiveness/responsive';

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
          backgroundColor="light.lightYellow"
          opacity={showWordIndex === index ? 1 : 0.5}
          style={styles.seedCardWrapper}
        >
          <Text style={styles.seedTextStyle} color="light.greenText2">
            {index < 9 ? '0' : null}
            {index + 1}
          </Text>
          <Text style={styles.seedTextStyle01} backgroundColor="green.700" color="light.seedText">
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
    <Box style={styles.container} background="light.ReceiveBackground">
      <StatusBarComponent padding={30} />
      <HeaderTitle
        title={seedText.recoveryPhrase}
        subtitle={seedText.SeedDesc}
        onPressHandler={() => navigtaion.goBack()}
      />

      <Box marginTop={windowHeight > 800 ? 10 : 2} height={windowHeight / 1.5}>
        <FlatList
          data={words}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          renderItem={renderSeedCard}
          keyExtractor={(item) => item}
        />
      </Box>
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
            closeBottomSheet={() => {
              setBackupSuccessModal(false);
            }}
            confirmBtnPress={() => {
              navigtaion.navigate('NewHome');
            }}
            title={BackupWallet.backupSuccessTitle}
            subTitle={BackupWallet.backupSuccessSubTitle}
            paragraph={BackupWallet.backupSuccessParagraph}
          />
        </ModalWrapper>
      </Box>
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
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 8,
    marginVertical: 10,
  },
  seedTextStyle: {
    fontSize: RFValue(19),
    fontWeight: '500',
    letterSpacing: 1.64,
    marginRight: 5,
  },
  seedTextStyle01: {
    fontSize: RFValue(19),
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
});
export default ExportSeedScreen;
