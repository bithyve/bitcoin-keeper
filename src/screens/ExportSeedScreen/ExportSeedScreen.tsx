import React, { useState, useContext, useEffect } from 'react';
import { Box, Text } from 'native-base';
import { FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import StatusBarComponent from 'src/components/StatusBarComponent';
import HeaderTitle from 'src/components/HeaderTitle';
import { windowHeight } from 'src/common/data/responsiveness/responsive';
import { LocalizationContext } from 'src/common/content/LocContext';
import CustomGreenButton from 'src/components/CustomButton/CustomGreenButton';
import ConfirmSeedWord from 'src/components/SeedWordBackup/ConfirmSeedWord';
import BackupSuccessful from 'src/components/SeedWordBackup/BackupSuccessful';
import ModalWrapper from 'src/components/Modal/ModalWrapper';
import { seedBackedUp } from 'src/store/sagaActions/bhr';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';

const ExportSeedScreen = ({ route, navigation }) => {
  const navigtaion = useNavigation();
  const dispatch = useAppDispatch();
  const { translations } = useContext(LocalizationContext);
  const BackupWallet = translations['BackupWallet'];
  const login = translations['login'];
  const seed = route.params.seed;
  const [words] = useState(seed.split(' '));
  const next = route.params.next;
  const [confirmSeedModal, setConfirmSeedModal] = useState(false);
  const [backupSuccessModal, setBackupSuccessModal] = useState(false);
  const [showWordIndex, setShowWordIndex] = useState('');
  const { backupMethod } = useAppSelector((state) => state.bhr);
  const seedText = translations['seed'];

  useEffect(() => {
    if (backupMethod !== null) {
      setBackupSuccessModal(true);
      setTimeout(() => {
        navigation.replace('WalletBackHistory');
      }, 100);
    }
  }, [backupMethod]);

  const SeedCard = ({ item, index }: { item; index }) => {
    return (
      <TouchableOpacity
        style={{ width: '50%' }}
        onPress={() => {
          setShowWordIndex(index);
        }}
      >
        <Box
          backgroundColor={'light.lightYellow'}
          flexDirection={'row'}
          padding={4}
          borderRadius={10}
          marginX={3}
          marginY={1.5}
          opacity={showWordIndex === index ? 1 : 0.5}
        >
          <Text
            fontSize={20}
            fontWeight={300}
            letterSpacing={1.64}
            marginRight={5}
            color={'light.greenText2'}
          >
            {index < 9 ? '0' : null}
            {index + 1}
          </Text>
          <Text
            fontSize={20}
            fontWeight={200}
            backgroundColor={'green.700'}
            letterSpacing={1}
            color={'light.seedText'}
          >
            {showWordIndex === index ? item : '******'}
          </Text>
        </Box>
      </TouchableOpacity>
    );
  };

  const renderSeedCard = ({ item, index }: { item; index }) => {
    return <SeedCard item={item} index={index} />;
  };

  return (
    <Box flex={1} padding={5} background={'light.ReceiveBackground'}>
      <StatusBarComponent padding={30} />
      <HeaderTitle
        title={seedText.ExportSeed}
        subtitle={seedText.SeedDesc}
        color="light.ReceiveBackground"
        onPressHandler={() => navigtaion.goBack()}
      />

      <Box marginTop={10} height={windowHeight / 1.5}>
        <FlatList
          data={words}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          renderItem={renderSeedCard}
          keyExtractor={(item) => item}
        />
      </Box>
      <Box alignItems={'flex-end'} mb={5}>
        {next && (
          <Box>
            <CustomGreenButton
              onPress={() => {
                //setBackupSuccessModal(true);
                setConfirmSeedModal(true);
              }}
              value={login.Next}
            />
          </Box>
        )}
      </Box>
      {!next && (
        <Text
          marginX={2}
          marginTop={5}
          fontSize={12}
          fontWeight={200}
          letterSpacing={0.6}
          marginRight={10}
          color={'light.GreyText'}
        >
          {seedText.desc}
        </Text>
      )}
      {/* Modals */}
      <Box>
        <ModalWrapper
          visible={confirmSeedModal}
          onSwipeComplete={() => setConfirmSeedModal(false)}
          position={'center'}
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
};

export default ExportSeedScreen;
