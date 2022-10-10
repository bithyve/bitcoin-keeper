import React, { useState } from 'react';
import { Box, Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
//components and functions
import { wp, hp } from 'src/common/data/responsiveness/responsive';
import StatusBarComponent from 'src/components/StatusBarComponent';
import Header from 'src/components/Header';
import Buttons from 'src/components/Buttons';
import Note from 'src/components/Note/Note';
import KeeperModal from 'src/components/KeeperModal';
// icons and asserts
import Assert from 'src/assets/images/illustration.svg';
import Vault from 'src/assets/images/svgs/vault.svg';
import SettingUp from 'src/assets/images/svgs/settingup.svg';
import Recovery from 'src/assets/images/svgs/recovery.svg';
import Inheritance from 'src/assets/images/svgs/inheritance_Inner.svg';

const SetupInheritance = () => {
  const navigtaion = useNavigation();
  const [modalVisiblity, setModalVisiblity] = useState(true);
  const inheritanceData = [
    {
      title: 'Setup Vault',
      subTitle: 'Upgrade the Vault to Elite with 5 Signing Devices Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt',
      Icon: Vault
    },
    {
      title: 'Activate Inheritance',
      subTitle: 'Download documents: Will Addendum for Digital Assets and Recovery Instructions. Understand safekeeping best practices',
      Icon: SettingUp
    },
    {
      title: 'Independent Recovery (optional)',
      subTitle: 'Understand how you can recover your Vault even without teh Keeper app or any service from the company',
      Icon: Recovery

    }
  ]

  const InheritancePoint = ({ title, description, Icon }) => {
    return (
      <Box marginBottom={hp(20)}>
        <Box
          width={hp(300)}
          flexDir={'row'}
          alignItems={'center'}
        >
          <Icon />
          <Text
            color={'light.white1'}
            fontSize={15}
            marginLeft={wp(15)}
            numberOfLines={2}
            alignItems={'center'}
          >
            {title}
          </Text>
        </Box>
        <Text
          color={'light.white1'}
          fontSize={15}
          marginTop={wp(16)}
          alignItems={'center'}
          width={wp(300)}
        >
          {description}
        </Text>
      </Box>
    )
  }

  const InheritanceContent = () => {
    return (
      <Box >
        {inheritanceData.map((item) => {
          return (
            <InheritancePoint
              title={item.title}
              description={item.subTitle}
              Icon={item.Icon}
            />
          );
        })}
      </Box>
    )
  }

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
        <Assert />
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
            primaryText='comming soon'
            primaryCallback={() => { console.log('comming soon') }}
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
      <KeeperModal
        visible={modalVisiblity}
        close={() => { setModalVisiblity(false) }}
        title={'Inheritance'}
        subTitle={'Securely bequeath your bitcoin'}
        modalBackground={['#00836A', '#073E39']}
        textColor={'#FFFFFF'}
        buttonText={'Add Now'}
        buttonTextColor={'#073E39'}
        buttonBackground={['#FFFFFF', '#80A8A1']}
        Content={InheritanceContent}
        DarkCloseIcon={true}
      />
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
