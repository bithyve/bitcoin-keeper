import React from 'react';
import { StyleSheet } from 'react-native';
import { Box, ScrollView, Text, useColorMode } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import KeeperHeader from 'src/components/KeeperHeader';
import { wp, hp, windowWidth } from 'src/constants/responsive';
import useBalance from 'src/hooks/useBalance';
import Note from 'src/components/Note/Note';
import { genrateOutputDescriptors } from 'src/core/utils';
import Colors from 'src/theme/Colors';
import useVault from 'src/hooks/useVault';
import ScreenWrapper from 'src/components/ScreenWrapper';
import OptionCard from 'src/components/OptionCard';

function VaultCard({ vaultName, vaultBalance, vaultDescription, getSatUnit }) {
  const { colorMode } = useColorMode();
  return (
    <Box
      backgroundColor={`${colorMode}.learnMoreBorder`}
      style={{
        borderRadius: hp(20),
        width: wp(320),
        height: hp(75),
        position: 'relative',
        marginBottom: hp(30),
      }}
    >
      <Box
        marginTop={hp(17)}
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        style={{
          marginHorizontal: wp(20),
        }}
      >
        <Box>
          <Text color={`${colorMode}.white`} letterSpacing={0.28} fontSize={14}>
            {vaultName}
          </Text>
          <Text color={`${colorMode}.white`} letterSpacing={0.24} fontSize={12}>
            {vaultDescription}
          </Text>
        </Box>
        <Text color={`${colorMode}.white`} letterSpacing={1.2} fontSize={hp(24)}>
          {vaultBalance}
          {getSatUnit()}
        </Text>
      </Box>
    </Box>
  );
}

function VaultSettings() {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { getSatUnit, getBalance } = useBalance();
  const { activeVault: vault } = useVault();
  const descriptorString = genrateOutputDescriptors(vault);

  const {
    presentationData: { name, description } = { name: '', description: '' },
    specs: { balances: { confirmed, unconfirmed } } = {
      balances: { confirmed: 0, unconfirmed: 0 },
    },
  } = vault;

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader title="Vault Settings" subtitle="Settings specific to the vault" />
      <Box borderBottomColor={`${colorMode}.divider`} style={styles.vaultCardWrapper}>
        <VaultCard
          vaultName={name}
          vaultDescription={description}
          vaultBalance={getBalance(confirmed + unconfirmed)}
          getSatUnit={getSatUnit}
        />
      </Box>
      <ScrollView contentContainerStyle={styles.optionViewWrapper}>
        <OptionCard
          title="Vault configuration file"
          description="Vault configuration that needs to be stored privately"
          callback={() => {
            navigation.dispatch(
              CommonActions.navigate('GenerateVaultDescriptor', { descriptorString })
            );
          }}
        />
        <OptionCard
          title="Archived vault"
          description="View details of old vaults"
          callback={() => {
            navigation.dispatch(CommonActions.navigate('ArchivedVault'));
          }}
        />
        <OptionCard
          title="Update scheme"
          description="Update your vault configuration and transfer funds"
          callback={() => {
            navigation.dispatch(CommonActions.navigate('VaultSetup'));
          }}
        />
      </ScrollView>
      <Box style={styles.bottomNoteWrapper}>
        <Note
          title="Security Tip"
          subtitle="Recreate the vault on another coordinator software and check if the multisig has the same details"
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
    alignItems: 'center',
  },
  moadalContainer: {
    width: wp(280),
  },
  inputWrapper: {
    borderRadius: 10,
    flexDirection: 'row',
    height: 150,
    width: windowWidth * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  IconText: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    borderColor: Colors.Seashell,
    marginTop: 10,
    paddingTop: 20,
    borderTopWidth: 0.5,
    alignItems: 'center',
  },
  shareText: {
    fontSize: 12,
    letterSpacing: 0.84,
    marginVertical: 2.5,
    paddingLeft: 3,
  },
  vaultCardWrapper: {
    marginTop: hp(30),
  },
  optionViewWrapper: {
    alignItems: 'center',
  },
  bottomNoteWrapper: {
    marginHorizontal: '5%',
  },
  modalNoteWrapper: {
    width: '90%',
  },
});
export default VaultSettings;
