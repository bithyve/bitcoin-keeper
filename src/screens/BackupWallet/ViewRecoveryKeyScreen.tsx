import React, { useContext, useEffect, useState } from 'react';
import { Box, useColorMode } from '@gluestack-ui/themed-native-base';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { hp } from 'src/constants/responsive';
import WalletHeader from 'src/components/WalletHeader';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import Text from 'src/components/KeeperText';
import ThemedColor from 'src/components/ThemedColor/ThemedColor';
import Buttons from 'src/components/Buttons';
import ModalWrapper from 'src/components/Modal/ModalWrapper';
import ConfirmSeedWord from 'src/components/SeedWordBackup/ConfirmSeedWord';
import { backupAllSignersAndVaults, seedBackedUp } from 'src/store/sagaActions/bhr';
import { useDispatch } from 'react-redux';
import { setRecoveryKeyBackedUp, setRecoveryKeyStatus } from 'src/store/reducers/account';
import useToastMessage from 'src/hooks/useToastMessage';
import { useAppSelector } from 'src/store/hooks';

type KeeperApp = {
  id: string;
  primaryMnemonic: string;
};

export const ViewRecoveryKeyScreen = ({ navigation }) => {
  const { colorMode } = useColorMode();
  const { common, BackupWallet: backupTxt } = useContext(LocalizationContext).translations;
  const { primaryMnemonic, id: appId } = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0] as KeeperApp;
  const [words] = useState(primaryMnemonic.split(' '));
  const [showWordIndex, setShowWordIndex] = useState<string | number>('');
  const seedTextColor = ThemedColor({ name: 'seedTextColor' });
  const [confirmSeedModal, setConfirmSeedModal] = useState(false);
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();
  const { recoveryKeyBackedUpByAppId, recoveryKeyStatusByAppId } = useAppSelector(
    (state) => state.account
  );
  const recoveryKeyStatus = recoveryKeyStatusByAppId?.[appId]
    || (recoveryKeyBackedUpByAppId?.[appId] ? 'confirmed' : 'generated');
  const ordinalSuffixByIndex = {
    1: 'st',
    2: 'nd',
    3: 'rd',
    4: 'th',
    5: 'th',
    6: 'th',
    7: 'th',
    8: 'th',
    9: 'th',
    10: 'th',
    11: 'th',
    12: 'th',
  } as const;

  useEffect(() => {
    if (recoveryKeyStatus !== 'confirmed') {
      dispatch(setRecoveryKeyStatus({ appId, status: 'viewed' }));
    }
  }, [appId, dispatch, recoveryKeyStatus]);

  const SeedCard = ({ item, index }: { item; index }) => {
    return (
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
          <Text style={styles.seedTextStyle} color={seedTextColor}>
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
    );
  };

  const renderSeedCard = ({ item, index }: { item; index }) => (
    <SeedCard item={item} index={index} />
  );

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader title={backupTxt.recoveryKeyScreenHeader} enableBack />
      <Box style={styles.ctr}>
        <Box>
          <Box style={styles.desc}>
            <Text style={styles.screenHeading}>{backupTxt.recoveryKeyScreenTitle}</Text>
            <Text>{backupTxt.recoveryKeyScreenBody}</Text>
          </Box>

          <Box
            style={[styles.messageCard, styles.warningCard]}
            backgroundColor={`${colorMode}.seashellWhite`}
          >
            <Text style={styles.messageCardTitle}>{backupTxt.recoveryKeyWarningTitle}</Text>
            <Text>{backupTxt.recoveryKeyWarningBody}</Text>
          </Box>

          {/* Seed Words */}
          <FlatList
            data={words}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            renderItem={renderSeedCard}
            keyExtractor={(item) => item}
          />

          <Box
            style={[styles.messageCard, styles.infoCard]}
            backgroundColor={`${colorMode}.seashellWhite`}
          >
            <Text>{backupTxt.recoveryKeyScreenInfo}</Text>
          </Box>
        </Box>
        <Buttons
          primaryText={backupTxt.iHaveWrittenItDown}
          primaryCallback={() => setConfirmSeedModal(true)}
          secondaryText={common.back}
          secondaryCallback={() => navigation.goBack()}
        />
      </Box>
      <Box>
        <ModalWrapper
          visible={confirmSeedModal}
          onSwipeComplete={() => setConfirmSeedModal(false)}
          position="center"
        >
          <ConfirmSeedWord
            title={backupTxt.confirmRecoveryKeyTitle}
            subtitle={backupTxt.confirmRecoveryKeyBody}
            errorMessage={backupTxt.recoveryKeyConfirmError}
            secondaryText={common.back}
            primaryText={backupTxt.confirmRecoveryKeyCTA}
            inputPlaceholder={backupTxt.recoveryKeyConfirmInputPlaceholder}
            footerText={backupTxt.confirmRecoveryKeyFooter}
            promptLabelBuilder={(indexOneBased: number) =>
              `${backupTxt.enterThe} ${indexOneBased}${ordinalSuffixByIndex[indexOneBased] || 'th'} ${
                backupTxt.recoveryKeyWordPromptSuffix
              }`
            }
            closeBottomSheet={() => {
              setConfirmSeedModal(false);
            }}
            words={words}
            confirmBtnPress={() => {
              setConfirmSeedModal(false);
              dispatch(seedBackedUp());
              dispatch(setRecoveryKeyBackedUp({ appId, status: true }));
              dispatch(setRecoveryKeyStatus({ appId, status: 'confirmed' }));
              dispatch(backupAllSignersAndVaults());
              showToast(backupTxt.recoveryKeyConfirmSuccessToast, undefined, undefined, 2000);
              navigation.goBack();
            }}
          />
        </ModalWrapper>
      </Box>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  ctr: {
    flex: 1,
    justifyContent: 'space-between',
  },

  desc: {
    marginVertical: hp(10),
    gap: hp(10),
  },
  screenHeading: {
    fontSize: 38,
    marginBottom: hp(8),
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
  messageCard: {
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 8,
    marginTop: hp(8),
  },
  messageCardTitle: {
    fontSize: 23,
    marginBottom: hp(2),
  },
  warningCard: {
    marginBottom: hp(10),
  },
  infoCard: {
    marginTop: hp(10),
    marginBottom: hp(15),
  },
});
