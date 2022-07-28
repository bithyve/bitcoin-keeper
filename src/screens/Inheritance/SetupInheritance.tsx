import React from 'react';
import { Box, Text, Pressable, FlatList } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
//components and functions
import Header from 'src/components/Header';
import StatusBarComponent from 'src/components/StatusBarComponent';
import { wp, hp } from 'src/common/data/responsiveness/responsive';

import Abc from 'src/assets/images/illustration.svg';
import Inheritance from 'src/assets/images/svgs/inheritance_Inner.svg';
import LinearGradient from 'react-native-linear-gradient';
import Buttons from 'src/components/Buttons';
import Note from 'src/components/Note/Note';

const SetupInheritance = () => {
  const navigtaion = useNavigation();

  const inheritanceData = [
    {
      title: 'Setup Vault',
      subTitle: 'Upgrade the Vault to Elite with 5 Signers'
    },
    {
      title: 'Activate Inheritance',
      subTitle: 'Download documents: Will Addendum for Digital Assets and Recovery Instructions. Understand safekeeping best practices'
    },
    {
      title: 'Independent Recovery (optional)',
      subTitle: 'Understand how you can recover your Vault even without teh Keeper app or any service from the company'
    }
  ]
  const GradientIcon = ({ height, Icon }) => {
    return (
      <LinearGradient
        colors={['#00836A', '#073E39']}
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
  };

  return (
    <Box style={styles.Container} background={'light.ReceiveBackground'}>
      <StatusBarComponent padding={50} />
      <Box>
        <Header
          onPressHandler={() => navigtaion.goBack()}
          headerTitleColor={'light.headerText'}
          fontSize={16}
        />
      </Box>
      <Box
        alignItems={'center'}
        paddingX={1}
      >
        <Box alignItems={'center'}>
          <GradientIcon Icon={Inheritance} height={50} />
          <Text
            color={'light.textWallet'}
            fontSize={16}
            letterSpacing={0.96}
            marginTop={hp(10)}
          >
            Inheritance
          </Text>
          <Text
            color={'light.lightBlack2'}
            fontSize={13}
            letterSpacing={1.13}
            marginTop={hp(4)}
            width={wp(250)}
            textAlign={'center'}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit
          </Text>
        </Box>
      </Box>

      <Box
        marginTop={hp(50)}
        alignItems={'center'}
      >
        <Abc />
        <Text
          color={'light.lightBlack2'}
          fontSize={13}
          letterSpacing={1.13}
          marginTop={hp(36)}
          width={wp(250)}
          textAlign={'center'}
          numberOfLines={2}
        >
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
        </Text>
        <Box marginTop={hp(50)}>
          <Buttons
            primaryText='Setup Inheritance'
            primaryCallback={() => { console.log('Setup Inheritance') }}
          />
        </Box>
      </Box>
      <Box position={'absolute'} bottom={hp(40)} width={wp(320)}>
        <Note
          title={'Note'}
          subtitle={'Make sure that your node is accessible at all times for the app to be able to connect to it'}
          subtitleColor={'GreyText'}
        />
      </Box>
    </Box >
  );
};

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: '20@s',
    position: 'relative',
  },
});
export default SetupInheritance;
