import React, { useState, useContext } from 'react';
import { Box, Text } from 'native-base';
import { FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Modal from 'react-native-modal';

import StatusBarComponent from 'src/components/StatusBarComponent';
import HeaderTitle from 'src/components/HeaderTitle';
import { windowHeight } from 'src/common/data/responsiveness/responsive';
import { LocalizationContext } from 'src/common/content/LocContext';
import CustomGreenButton from 'src/components/CustomButton/CustomGreenButton';
import ConfirmSeedWord from 'src/components/SeedWordBackup/ConfirmSeedWord';
import BackupSuccessful from 'src/components/SeedWordBackup/BackupSuccessful';

const ExportSeedScreen = ({ route }) => {
  const navigtaion = useNavigation();

  const { translations } = useContext(LocalizationContext);
  const login = translations['login'];

  const seed = route.params.seed;
  const next = route.params.next;

  const [showSeedWord, setShowSeedWord] = useState('');
  const [showHideStatus, setShowHideStatus] = useState(false);
  const [confirmSeedModal, setConfirmSeedModal] = useState(false);
  const [backupSuccessModal, setBackupSuccessModal] = useState(false);

  const seedText = translations['seed'];

  const SeedCard = ({ item, index }: { item; index }) => {
    return (
      <TouchableOpacity
        style={{ width: '50%' }}
        onPress={() => {
          setShowSeedWord(item), setShowHideStatus(!showHideStatus);
        }}
      >
        <Box
          backgroundColor={'light.lightYellow'}
          flexDirection={'row'}
          padding={4}
          borderRadius={10}
          marginX={3}
          marginY={1.5}
          opacity={showHideStatus && showSeedWord == item ? 1 : 0.5}
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
            {showHideStatus && showSeedWord == item ? item : '******'}
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
          data={seed.split(' ')}
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
                // setBackupSuccessModal(true);
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
        <Modal
          isVisible={confirmSeedModal}
          onSwipeComplete={() => setConfirmSeedModal(false)}
          swipeDirection={['down']}
          style={{
            justifyContent: 'center',
            marginHorizontal: 15,
            marginBottom: 25,
          }}
        >
          <ConfirmSeedWord
            closeBottomSheet={() => {
              setConfirmSeedModal(false);
            }}
            confirmBtnPress={() => {
              // setConfirmSeedModal(false);
              setTimeout(() => {
                setBackupSuccessModal(true);
              }, 2000);
            }}
          />
        </Modal>
      </Box>
      <Box>
        <Modal
          isVisible={backupSuccessModal}
          onSwipeComplete={() => setBackupSuccessModal(false)}
          swipeDirection={['down']}
          style={{
            justifyContent: 'flex-end',
            marginHorizontal: 15,
            marginBottom: 25,
          }}
        >
          <BackupSuccessful
            closeBottomSheet={() => {
              setBackupSuccessModal(false);
            }}
            confirmBtnPress={() => {
              navigtaion.navigate('NewHome');
            }}
          />
        </Modal>
      </Box>
    </Box>
  );
};

export default ExportSeedScreen;
