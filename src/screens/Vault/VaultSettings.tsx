import React from 'react';
import { Box, Text, Pressable, useColorMode } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import { CommonActions, useNavigation } from '@react-navigation/native';
import HeaderTitle from 'src/components/HeaderTitle';
import StatusBarComponent from 'src/components/StatusBarComponent';
import { wp, hp, windowWidth } from 'src/common/data/responsiveness/responsive';
import Arrow from 'src/assets/images/icon_arrow_Wallet.svg';
import BackupIcon from 'src/assets/images/backup.svg';
import LinearGradient from 'react-native-linear-gradient';
import useBalance from 'src/hooks/useBalance';
import Note from 'src/components/Note/Note';
import { genrateOutputDescriptors } from 'src/core/utils';
import Colors from 'src/theme/Colors';
import useVault from 'src/hooks/useVault';

type Props = {
  title: string;
  subTitle: string;
  onPress: () => void;
  Icon: boolean;
};

function Option({ title, subTitle, onPress, Icon }: Props) {
  const { colorMode } = useColorMode();
  return (
    <Pressable
      flexDirection="row"
      alignItems="center"
      width="100%"
      style={{ marginVertical: hp(20) }}
      onPress={onPress}
    >
      {Icon && (
        <Box width="16%">
          <BackupIcon />
        </Box>
      )}
      <Box width={Icon ? '80%' : '96%'}>
        <Text color={`${colorMode}.primaryText`} fontSize={14} letterSpacing={1.12}>
          {title}
        </Text>
        <Text color={`${colorMode}.GreyText`} fontSize={12} letterSpacing={0.6}>
          {subTitle}
        </Text>
      </Box>
      <Box width="4%">
        <Arrow />
      </Box>
    </Pressable>
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
  function VaultCard({ vaultName, vaultBalance, vaultDescription }) {
    return (
      <LinearGradient
        colors={['#B17F44', '#6E4A35']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: hp(20),
          width: wp(320),
          height: hp(75),
          position: 'relative',
          marginLeft: -wp(20),
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
            <Text color="light.white" letterSpacing={0.28} fontSize={14}>
              {vaultName}
            </Text>
            <Text color="light.white" letterSpacing={0.24} fontSize={12} light>
              {vaultDescription}
            </Text>
          </Box>
          <Text color="light.white" letterSpacing={1.2} fontSize={hp(24)}>
            {vaultBalance}
            {getSatUnit()}
          </Text>
        </Box>
      </LinearGradient>
    );
  }
  return (
    <Box style={styles.Container} backgroundColor={`${colorMode}.primaryBackground`}>
      <StatusBarComponent padding={50} />
      <Box>
        <HeaderTitle
          title="Vault Settings"
          subtitle="Settings specific to the Vault"
          onPressHandler={() => navigtaion.goBack()}
          headerTitleColor={`${colorMode}.black`}
          titleFontSize={20}
          paddingTop={hp(5)}
          paddingLeft={hp(25)}
        />
      </Box>
      <Box borderBottomColor={`${colorMode}.divider`} style={styles.vaultCardWrapper}>
        <VaultCard
          vaultName={name}
          vaultDescription={description}
          vaultBalance={getBalance(confirmed + unconfirmed)}
        />
      </Box>
      <Box style={styles.optionViewWrapper}>
        <Option
          title="Generate Descriptors"
          subTitle="Vault configuration that needs to be stored privately"
          onPress={() => {
            navigation.dispatch(
              CommonActions.navigate('GenerateVaultDescriptor', { descriptorString })
            );
          }}
          Icon={false}
        />
        <Option
          title="Archived Vault"
          subTitle="View details of old vaults"
          onPress={() => navigtaion.navigate('ArchivedVault')}
          Icon={false}
        />
      </Box>

      {/* {Bottom note} */}
      <Box style={styles.bottomNoteWrapper}>
        <Note
          title="Security Tip"
          subtitle="Recreate the Vault on another coordinator software and check if the multisig has the same details"
          width={windowWidth * 0.8}
          subtitleColor="GreyText"
        />
      </Box>
    </Box>
  );
}

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: '20@s',
    position: 'relative',
  },
  moadalContainer: {
    // flex: 1,
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
    borderBottomWidth: 0.2,
    marginTop: hp(30),
    paddingHorizontal: wp(25),
  },
  optionViewWrapper: {
    alignItems: 'center',
    paddingHorizontal: wp(25),
  },
  bottomNoteWrapper: {
    position: 'absolute',
    bottom: hp(45),
    marginHorizontal: 15,
  },
  modalNoteWrapper: {
    width: '90%',
  },
});
export default VaultSettings;
