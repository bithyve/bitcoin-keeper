import React from 'react';
import Text from 'src/components/KeeperText';
import { Box, Pressable, useColorMode } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
import HeaderTitle from 'src/components/HeaderTitle';
import StatusBarComponent from 'src/components/StatusBarComponent';
import InfoBox from 'src/components/InfoBox';
import { wp, hp } from 'src/constants/responsive';
import Arrow from 'src/assets/images/icon_arrow_Wallet.svg';
import Server from 'src/assets/images/server.svg';
import BackupIcon from 'src/assets/images/backupIcon.svg';

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

function SigningServerSettings({ route }) {
  const navigtaion = useNavigation();

  function GradientIcon({ height, Icon }) {
    const { colorMode } = useColorMode();
    return (
      <Box
        backgroundColor={`${colorMode}.coffeeBackground`}
        style={{
          height: hp(height),
          width: hp(height),
          borderRadius: height,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Icon />
      </Box>
    );
  }

  function VaultCard({ signingServerName, addedOn, signingServerDescription }) {
    const { colorMode } = useColorMode();
    return (
      <Box
        backgroundColor={`${colorMode}.coffeeBackground`}
        style={{
          borderRadius: hp(20),
          width: wp(320),
          height: hp(95),
          position: 'relative',
          marginLeft: -wp(20),
          marginBottom: hp(30),
          justifyContent: 'center',
        }}>
        <Box flexDirection="row" alignItems="center" style={{}}>
          <Box
            style={{
              marginHorizontal: wp(20),
              opacity: 0.9,
            }}
          >
            <GradientIcon Icon={Server} height={hp(48)} />
          </Box>
          <Box>
            <Text color="light.white" letterSpacing={0.28} fontSize={14}>
              {signingServerName}
            </Text>
            <Text color="light.vaultCardText" letterSpacing={1} fontSize={10}>
              {addedOn}
            </Text>
            <Text color="light.vaultCardText" letterSpacing={0.6} fontSize={12}>
              {signingServerDescription}
            </Text>
          </Box>
        </Box>
      </Box>
    );
  }
  return (
    <Box style={styles.Container} background="light.secondaryBackground">
      <StatusBarComponent padding={50} />
      <Box>
        <HeaderTitle
          title="Signing Server Settings"
          subtitle="Lorem Ipsum Dolor"
          onPressHandler={() => navigtaion.goBack()}
          headerTitleColor="light.textBlack"
          titleFontSize={20}
          paddingTop={hp(5)}
        />
      </Box>
      <Box borderBottomColor="light.divider" marginTop={hp(40)} paddingX={wp(25)}>
        <VaultCard
          signingServerName="Signing Server"
          signingServerDescription="Lorem ipsum dolor sit amet, "
          addedOn="Added on 12 January 2022"
        />
      </Box>
      <Box alignItems="center" paddingX={wp(25)}>
        <Option
          title="Change Verification & Policy"
          subTitle="Lorem ipsum dolor sit amet, consectetur"
          onPress={() => {
            console.log('Change Verification & Policy');
          }}
          Icon={false}
        />
        <Option
          title="Consectetur"
          subTitle="Lorem ipsum dolor sit amet, consectetur"
          onPress={() => { }}
          Icon={false}
        />
        <Option
          title="Consectetur"
          subTitle="Lorem ipsum dolor sit amet, consectetur"
          onPress={() => { }}
          Icon={false}
        />
      </Box>

      {/* {Bottom note} */}
      <Box position="absolute" bottom={hp(45)} marginX={5}>
        <InfoBox
          title="Note"
          desciption="Lorem ipsum dolor sit amet, consec tetur adi piscing elit, sed do eiusmod tempor incididunt ut labore et"
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
export default SigningServerSettings;
