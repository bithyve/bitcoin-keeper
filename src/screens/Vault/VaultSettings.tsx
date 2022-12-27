import React, { useContext } from 'react';
import Text from 'src/components/KeeperText';
import { Box, Pressable } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';

// components and functions
import HeaderTitle from 'src/components/HeaderTitle';
import StatusBarComponent from 'src/components/StatusBarComponent';
import InfoBox from 'src/components/InfoBox';
import { wp, hp } from 'src/common/data/responsiveness/responsive';
// icons
import Arrow from 'src/assets/images/icon_arrow_Wallet.svg';
import BackupIcon from 'src/assets/images/backupIcon.svg';
import LinearGradient from 'src/components/KeeperGradient';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { getAmount } from 'src/common/constants/Bitcoin';

type Props = {
  title: string;
  subTitle: string;
  onPress: () => void;
  Icon: boolean;
};

function Option({ title, subTitle, onPress, Icon }: Props) {
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
        <Text color="light.primaryText" fontSize={14} letterSpacing={1.12}>
          {title}
        </Text>
        <Text color="light.GreyText" fontSize={12} letterSpacing={0.6}>
          {subTitle}
        </Text>
      </Box>
      <Box width="4%">
        <Arrow />
      </Box>
    </Pressable>
  );
}

function VaultSettings({ route }) {
  const navigtaion = useNavigation();
  const { useQuery } = useContext(RealmWrapperContext);

  const vault: Vault = useQuery(RealmSchema.Vault)
    .map(getJSONFromRealmObject)
    .filter((vault) => !vault.archived)[0];

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
        start={[0, 0]}
        end={[1, 1]}
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
            {vaultBalance}sats
          </Text>
        </Box>
      </LinearGradient>
    );
  }
  return (
    <Box style={styles.Container} background="light.secondaryBackground">
      <StatusBarComponent padding={50} />
      <Box>
        <HeaderTitle
          title="Vault Settings"
          subtitle="See the app settings screen and the items that will go in here."
          onPressHandler={() => navigtaion.goBack()}
          headerTitleColor="light.textBlack"
          titleFontSize={20}
          paddingTop={hp(5)}
        />
      </Box>
      <Box
        borderBottomColor="light.divider"
        borderBottomWidth={0.2}
        marginTop={hp(60)}
        paddingX={wp(25)}
      >
        <VaultCard
          vaultName={name}
          vaultDescription={description}
          vaultBalance={getAmount(confirmed + unconfirmed)}
        />
      </Box>
      <Box alignItems="center" paddingX={wp(25)}>
        <Option
          title="Timelock Vault"
          subTitle="Lorem ipsum dolor sit amet, consectetur"
          onPress={() => {
            console.log('Wallet Details');
          }}
          Icon={false}
        />
        <Option
          title="Generate Descriptors"
          subTitle="Lorem ipsum dolor sit amet, consectetur"
          onPress={() => {}}
          Icon={false}
        />
        <Option
          title="Consectetur"
          subTitle="Lorem ipsum dolor sit amet, consectetur"
          onPress={() => {}}
          Icon={false}
        />
        <Option
          title="Archived Vaults"
          subTitle="Lorem ipsum dolor sit amet, consectetur"
          onPress={() => {
            navigtaion.navigate('ArchivedVault');
          }}
          Icon={false}
        />
      </Box>

      {/* {Bottom note} */}
      <Box position="absolute" bottom={hp(45)} marginX={5}>
        <InfoBox
          title="Note"
          desciption="These settings are for your active wallet only and does not affect other wallets"
          width={250}
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
});
export default VaultSettings;
