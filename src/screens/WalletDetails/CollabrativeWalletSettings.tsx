import React from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import KeeperHeader from 'src/components/KeeperHeader';
import { wp, hp } from 'src/constants/responsive';
import Note from 'src/components/Note/Note';
import { genrateOutputDescriptors } from 'src/services/utils';
import { StyleSheet } from 'react-native';
import OptionCard from 'src/components/OptionCard';
import ScreenWrapper from 'src/components/ScreenWrapper';
import useVault from 'src/hooks/useVault';
import useTestSats from 'src/hooks/useTestSats';

function CollabrativeWalletSettings() {
  const { colorMode } = useColorMode();
  const route = useRoute();
  const { vaultId } = route.params as { vaultId: string };
  const { activeVault } = useVault({ vaultId });
  const navigation = useNavigation();
  const descriptorString = genrateOutputDescriptors(activeVault);
  const TestSatsComponent = useTestSats({ wallet: activeVault });

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title="Collaborative Wallet Settings"
        subtitle={activeVault.presentationData.description}
      />

      <ScrollView
        contentContainerStyle={styles.optionsListContainer}
        showsVerticalScrollIndicator={false}
      >
        <OptionCard
          title="Exporting Wallet Configuration File"
          description="To recreate collaborative wallet"
          callback={() => {
            navigation.dispatch(
              CommonActions.navigate('GenerateVaultDescriptor', { descriptorString })
            );
          }}
        />
        {TestSatsComponent}
      </ScrollView>
      <Box style={styles.note} backgroundColor="light.secondaryBackground">
        <Note
          title="Note"
          subtitle="Keeper only supports one Collaborative wallet, per hot wallet. So if you import another Wallet Configuration File, you will see a new Collaborative Wallet"
          subtitleColor="GreyText"
        />
      </Box>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    padding: 20,
    position: 'relative',
  },
  note: {
    marginHorizontal: '5%',
  },
  walletCardContainer: {
    borderRadius: hp(20),
    width: wp(320),
    paddingHorizontal: 5,
    paddingVertical: 20,
    position: 'relative',
    marginLeft: -wp(20),
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: wp(10),
  },
  walletDetailsWrapper: {
    width: wp(155),
  },
  walletName: {
    letterSpacing: 0.28,
    fontSize: 15,
  },
  walletDescription: {
    letterSpacing: 0.24,
    fontSize: 13,
  },
  walletBalance: {
    letterSpacing: 1.2,
    fontSize: 23,
    padding: 5,
  },
  optionsListContainer: {
    alignItems: 'center',
    marginTop: hp(35),
    height: hp(425),
  },
  optionContainer: {
    marginTop: hp(20),
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  optionTitle: {
    fontSize: 14,
    letterSpacing: 1.12,
  },
  optionSubtitle: {
    fontSize: 12,
    letterSpacing: 0.6,
    width: '90%',
  },
});
export default CollabrativeWalletSettings;
