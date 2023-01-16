import React, { useContext, useState } from 'react';
import { Box, Text, Pressable, View } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
import { Share } from 'react-native';
// components and functions
import HeaderTitle from 'src/components/HeaderTitle';
import StatusBarComponent from 'src/components/StatusBarComponent';
import InfoBox from 'src/components/InfoBox';
import { wp, hp } from 'src/common/data/responsiveness/responsive';
// icons
import IconShare from 'src/assets/images/icon_share.svg';
import Arrow from 'src/assets/images/icon_arrow_Wallet.svg';
import BackupIcon from 'src/assets/images/backup.svg';
import LinearGradient from 'react-native-linear-gradient';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { getAmount } from 'src/common/constants/Bitcoin';
import KeeperModal from 'src/components/KeeperModal';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Note from 'src/components/Note/Note';
import { genrateOutputDescriptors } from 'src/core/utils';
import Colors from 'src/theme/Colors';

type Props = {
  title: string;
  subTitle: string;
  onPress: () => void;
  Icon: boolean;
};

const DescritporsModalContent = ({ descriptorString }) => {
  const onShare = async () => {
    try {
      await Share.share({
        message: descriptorString,
      });
    } catch (error: any) {
      console.log(error.message);
    }
  };

  return (
    <View width={'80%'}>
      <TouchableOpacity
        onPress={async () => {
          await onShare();
        }}
      >
        <Box style={styles.inputWrapper} backgroundColor="light.textInputBackground">
          <Text width="100%" padding={10} noOfLines={4}>
            {descriptorString}
          </Text>
        </Box>
      </TouchableOpacity>
      <Box>
        <Note subtitle="The above contains xPub, address type, path and script type, for the vault" />
      </Box>
      <Box
        flexDirection="row"
        justifyContent="space-around"
        alignItems="center"
        style={styles.buttonContainer}
      >
        <TouchableOpacity
          style={styles.IconText}
          onPress={async () => {
            await onShare();
          }}
        >
          <Box>
            <IconShare />
          </Box>
          <Text color="light.primaryText" fontSize={12} letterSpacing={0.84} marginY={2.5}>
            Share
          </Text>
        </TouchableOpacity>
      </Box>
    </View>
  );
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
  const [genratorModalVisible, setGenratorModalVisible] = useState(false);
  const vault: Vault = useQuery(RealmSchema.Vault)
    .map(getJSONFromRealmObject)
    .filter((vault) => !vault.archived)[0];
  const descriptorString = genrateOutputDescriptors(vault.isMultiSig, vault.signers, vault.scheme);
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
          subtitle="Settings specific to the Vault"
          onPressHandler={() => navigtaion.goBack()}
          headerTitleColor="light.textBlack"
          titleFontSize={20}
          paddingTop={hp(5)}
        />
      </Box>
      <Box
        borderBottomColor="light.divider"
        borderBottomWidth={0.2}
        marginTop={hp(30)}
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
          title="Generate Descriptors"
          subTitle="Vault configuration that needs to be stored privately"
          onPress={() => setGenratorModalVisible(true)}
          Icon={false}
        />
      </Box>

      {/* {Bottom note} */}
      <Box position="absolute" bottom={hp(45)} marginX={5}>
        <InfoBox
          title="Note"
          desciption="These settings are for your active vault only and does not affect other vaults"
          width={250}
        />
      </Box>
      <KeeperModal
        close={() => setGenratorModalVisible(false)}
        visible={genratorModalVisible}
        title="Generate Vault Descriptor"
        Content={() => <DescritporsModalContent descriptorString={descriptorString} />}
        subTitle="A descriptor contains sensitive information. Please use with caution"
        showButtons={false}
      />
    </Box>
  );
}

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: '20@s',
    position: 'relative',
  },
  inputWrapper: {
    borderRadius: 10,
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
});
export default VaultSettings;
