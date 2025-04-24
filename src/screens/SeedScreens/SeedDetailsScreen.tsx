import React, { useContext } from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import ShowXPub from 'src/components/XPub/ShowXPub';
import { wp } from 'src/constants/responsive';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Note from 'src/components/Note/Note';
import { StyleSheet } from 'react-native';
import WalletHeader from 'src/components/WalletHeader';

function SeedDetailsScreen({ route }) {
  const { seed } = route.params;
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common, seed: seedTranslation } = translations;

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader
        title={seedTranslation.mobileKeySeedWordsTitle}
        subTitle={seedTranslation.mobileKeySeedNoteSubTitle}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Box style={styles.QRWrapper}>
          <ShowXPub
            data={seed.toString().replace(/,/g, ' ')}
            subText={seedTranslation.mobileKey}
            copyable={false}
          />
        </Box>
      </ScrollView>
      <Note title={common.note} subtitle={seedTranslation.mobileKeySeedNote} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  QRWrapper: {
    paddingTop: wp(50),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SeedDetailsScreen;
