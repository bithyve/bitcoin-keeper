import React from 'react';
import { Box, Text } from 'native-base';
import { ScaledSheet } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
// components and functions
import { wp, hp, windowHeight } from 'src/common/data/responsiveness/responsive';
import HeaderTitle from 'src/components/HeaderTitle';
import Buttons from 'src/components/Buttons';
import Note from 'src/components/Note/Note';
import KeeperModal from 'src/components/KeeperModal';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import useToastMessage from 'src/hooks/useToastMessage';
import { setInheritance } from 'src/store/reducers/settings';
// icons and asserts
import Assert from 'src/assets/images/illustration.svg';
import Vault from 'src/assets/images/svgs/vault.svg';
import SettingUp from 'src/assets/images/svgs/settingup.svg';
import Recovery from 'src/assets/images/svgs/recovery.svg';
import Inheritance from 'src/assets/images/svgs/inheritance_Inner.svg';
import ScreenWrapper from 'src/components/ScreenWrapper';
import openLink from 'src/utils/OpenLink';

function SetupInheritance() {
  const navigtaion = useNavigation();
  const dispatch = useAppDispatch();
  const introModal = useAppSelector((state) => state.settings.inheritanceModal);
  const { showToast } = useToastMessage();

  const inheritanceData = [
    {
      title: 'Safeguarding Tips',
      subTitle: 'For yourself',
      description:
        'Consists of tips on things to consider while storing your signing devices for the purpose of inheritance (when it will be needed by someone else)',
      Icon: Vault,
    },
    {
      title: 'Letter to the Attorney',
      subTitle: 'For the estate management company',
      description:
        'A partly pre-filled pdf template uniquely identifying the vault and ability to add the beneficiary details',
      Icon: SettingUp,
    },
    {
      title: 'Recovery Instructions',
      subTitle: 'For the heir or beneficiary',
      description:
        'A document that will help the beneficiary recover the vault with or without the Keeper app',
      Icon: Recovery,
    },
  ];

  function InheritancePoint({ title, subTitle, description, Icon }) {
    return (
      <Box
        style={{
          marginBottom: hp(25),
        }}
      >
        <Box width={wp(300)} flexDir="row" alignItems="center">
          <Icon />
          <Box marginLeft={wp(15)}>
            <Text color="light.white1" fontSize={15} numberOfLines={2} fontWeight={200}>
              {title}
            </Text>
            <Text
              color="light.white1"
              fontSize={12}
              numberOfLines={2}
              fontWeight={200}
              opacity={0.7}
            >
              {subTitle}
            </Text>
          </Box>
        </Box>
        <Text
          color="light.white1"
          fontSize={14}
          style={{ marginTop: hp(16) }}
          alignItems="center"
          width={wp(280)}
          fontWeight={200}
          letterSpacing={0.65}
        >
          {description}
        </Text>
      </Box>
    );
  }

  function InheritanceContent() {
    return (
      <Box>
        {inheritanceData.map((item) => (
            <InheritancePoint
              title={item.title}
              description={item.description}
              subTitle={item.subTitle}
              Icon={item.Icon}
            />
          ))}
      </Box>
    );
  }

  function GradientIcon({ height, Icon }) {
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
  }

  return (
    <ScreenWrapper>
      <Box marginBottom={-7}>
        <HeaderTitle
          onPressHandler={() => navigtaion.goBack()}
          learnMore
          learnMorePressed={() => {
            dispatch(setInheritance(true));
          }}
        />
      </Box>
      <Box alignItems="center" paddingX={1}>
        <Box alignItems="center">
          <GradientIcon Icon={Inheritance} height={50} />
          <Text
            color="light.textWallet"
            fontSize={16}
            letterSpacing={0.96}
            marginTop={hp(10)}
            fontWeight={200}
          >
            Inheritance Support
          </Text>
          <Text
            color="light.lightBlack2"
            fontSize={13}
            letterSpacing={1.3}
            marginTop={hp(4)}
            width={wp(250)}
            textAlign="center"
            fontWeight={200}
          >
            Keeper provides you with the tips and tools you need to include the vault in your estate
            planning
          </Text>
        </Box>
      </Box>

      <Box marginTop={hp(50)} alignItems="center" flex={1}>
        <Assert />
        <Text
          fontSize={12}
          letterSpacing={0.6}
          marginTop={hp(36)}
          width={wp(220)}
          textAlign="center"
          numberOfLines={2}
          opacity={0.85}
          fontWeight={100}
        >
          This can be activated once you are at the Diamond Hands level
        </Text>
        <Box marginTop={hp(windowHeight > 700 ? 50 : 0)}>
          <Buttons
            primaryText="Select Country"
            primaryCallback={() => {
              showToast('Inheritance flow coming soon');
            }}
            paddingHorizontal={wp(20)}
          />
        </Box>
        <Box position="absolute" bottom={hp(10)} width={wp(320)} justifyContent="center">
          <Note
            title="Note"
            subtitle="Consult your estate planning company to ensure the documents provided here are suitable for your needs and are as per your jurisdiction"
            subtitleColor="GreyText"
          />
        </Box>
      </Box>
      <KeeperModal
        visible={introModal}
        close={() => {
          dispatch(setInheritance(false));
        }}
        title="Inheritance"
        subTitle="Securely bequeath your bitcoin"
        modalBackground={['#00836A', '#073E39']}
        textColor="#FFFFFF"
        buttonText="Proceed"
        buttonTextColor="#073E39"
        buttonBackground={['#FFFFFF', '#80A8A1']}
        Content={InheritanceContent}
        DarkCloseIcon
        learnMore
        learnMoreCallback={() => openLink('https://www.bitcoinkeeper.app/')}
      />
    </ScreenWrapper>
  );
}

const styles = ScaledSheet.create({});
export default SetupInheritance;
