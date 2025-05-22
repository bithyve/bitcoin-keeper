import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useContext, useState } from 'react';

import ConfirmSeedWord from 'src/components/SeedWordBackup/ConfirmSeedWord';
import CustomGreenButton from 'src/components/CustomButton/CustomGreenButton';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ModalWrapper from 'src/components/Modal/ModalWrapper';
import StatusBarComponent from 'src/components/StatusBarComponent';
import { hp, windowHeight } from 'src/constants/responsive';
import WalletHeader from 'src/components/WalletHeader';

function SetupSeedWordSigner({ route }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { login, seed: translationsSeed } = translations;
  const { seed } = route.params;
  const [words] = useState(seed.split(' '));
  const { next } = route.params;
  const { onSuccess } = route.params;
  const [confirmSeedModal, setConfirmSeedModal] = useState(false);
  const [showWordIndex, setShowWordIndex] = useState('');
  const seedText = translations.seed;

  function SeedCard({ item, index }: { item; index }) {
    return (
      <TouchableOpacity
        style={{ width: '50%' }}
        onPress={() => {
          setShowWordIndex(index);
        }}
        testID={`seed_item_${index}`}
      >
        <Box
          backgroundColor={`${colorMode}.seedCard`}
          flexDirection="row"
          justifyContent="space-evenly"
          padding={4}
          borderRadius={10}
          marginX={3}
          marginY={1.5}
          opacity={showWordIndex === index ? 1 : 0.5}
        >
          <Text
            fontSize={18}
            bold
            letterSpacing={1.64}
            // marginRight={3}
            color={`${colorMode}.greenText2`}
          >
            {index < 9 ? '0' : null}
            {index + 1}
          </Text>
          <Text
            fontSize={18}
            backgroundColor="green.700"
            letterSpacing={1}
            color={`${colorMode}.GreyText`}
          >
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
    <Box flex={1} marginTop={hp(30)} padding={5} background={`${colorMode}.textInputBackground`}>
      <StatusBarComponent padding={30} />
      <WalletHeader title={translationsSeed.seedKey} subTitle={seedText.SeedDesc} />

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
        <Text style={styles.seedDescParagraph} color={`${colorMode}.GreyText`}>
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
              onSuccess(seed);
            }}
          />
        </ModalWrapper>
      </Box>
    </Box>
  );
}
const styles = StyleSheet.create({
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
export default SetupSeedWordSigner;
