import React from 'react';
import { Box, Text, Pressable } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
// components and functions
import HeaderTitle from 'src/components/HeaderTitle';
import StatusBarComponent from 'src/components/StatusBarComponent';
import InfoBox from 'src/components/InfoBox';
import { wp, hp } from 'src/common/data/responsiveness/responsive';
// icons
import Arrow from 'src/assets/images/svgs/icon_arrow_Wallet.svg';
import Server from 'src/assets/images/svgs/server.svg';
import BackupIcon from 'src/assets/icons/backup.svg';
import LinearGradient from 'react-native-linear-gradient';

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
        <Box w="16%">
          <BackupIcon />
        </Box>
      )}
      <Box w={Icon ? '80%' : '96%'}>
        <Text
          color="light.lightBlack"
          fontFamily="body"
          fontWeight={200}
          fontSize={RFValue(14)}
          letterSpacing={1.12}
        >
          {title}
        </Text>
        <Text
          color="light.GreyText"
          fontFamily="body"
          fontWeight={200}
          fontSize={RFValue(12)}
          letterSpacing={0.6}
        >
          {subTitle}
        </Text>
      </Box>
      <Box w="4%">
        <Arrow />
      </Box>
    </Pressable>
  );
}

function SigningServerSettings({ route }) {
  const navigtaion = useNavigation();

  function GradientIcon({ height, Icon }) {
    return (
      <LinearGradient
        colors={['#694B2E', '#694B2E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          height: hp(height),
          width: hp(height),
          borderRadius: height,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Icon />
      </LinearGradient>
    );
  }

  function VaultCard({ signingServerName, addedOn, signingServerDescription }) {
    return (
      <LinearGradient
        colors={['#B17F44', '#6E4A35']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: hp(20),
          width: wp(320),
          height: hp(95),
          position: 'relative',
          marginLeft: -wp(20),
          marginBottom: hp(30),
          justifyContent: 'center',
        }}
      >
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
            <Text
              color="light.white"
              letterSpacing={0.28}
              fontSize={RFValue(14)}
              fontWeight={200}
            >
              {signingServerName}
            </Text>
            <Text
              color="light.vaultCardText"
              letterSpacing={1}
              fontSize={RFValue(10)}
              fontWeight={200}
            >
              {addedOn}
            </Text>
            <Text
              color="light.vaultCardText"
              letterSpacing={0.6}
              fontSize={RFValue(12)}
              fontWeight={200}
            >
              {signingServerDescription}
            </Text>
          </Box>
        </Box>
      </LinearGradient>
    );
  }
  return (
    <Box style={styles.Container} background="light.ReceiveBackground">
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
          onPress={() => {}}
          Icon={false}
        />
        <Option
          title="Consectetur"
          subTitle="Lorem ipsum dolor sit amet, consectetur"
          onPress={() => {}}
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
