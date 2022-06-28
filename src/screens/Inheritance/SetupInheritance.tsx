import React from 'react';
import { Box, Text, Pressable, FlatList } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
//components and functions
import Header from 'src/components/Header';
import StatusBarComponent from 'src/components/StatusBarComponent';
import { wp, hp } from 'src/common/data/responsiveness/responsive';

type Props = {
  title: string,
  subTitle: string,
  onPress: () => void,
  num: number
}

const SetupInheritance = () => {
  const navigtaion = useNavigation();

  const inheritanceData = [
    {
      title: 'Setup Inheritance',
      subTitle: 'Upgrade to Elite tier and setup the Vault with 5 Signers'
    },
    {
      title: 'Activate Inheritance',
      subTitle: 'Download and safely keep inheritance documents. Safekeeping best practices. Will template for digital assets. Inheritance recovery instructions'
    },
    {
      title: 'Setup false recovery alert (optional)',
      subTitle: 'If someone is trying to recover your wallet, make sure you get notified to approve or deny the recovery'
    },
    {
      title: 'Independent Recovery',
      subTitle: 'Understand how you can recover your Vault even without the Keeper app or any service from the company'
    },
    {
      title: 'Practice health check',
      subTitle: 'Make sure you signers are accessible. Change them if that is not the case'
    }
  ]

  const Bullet = ({ num }: { num: number }) => {
    return (
      <Box
        height={25}
        width={25}
        borderRadius={25}
        backgroundColor={'light.inheritanceBullet'}
        justifyContent={'center'}
        alignItems={'center'}
      >
        <Text
          color={'light.greenText'}
          fontWeight={300}
          fontSize={RFValue(14)}
        >
          {num}
        </Text>
      </Box>
    );
  }
  const Option = ({
    title,
    subTitle,
    onPress,
    num
  }: Props) => {
    return (
      <Pressable
        flexDirection={'row'}
        alignItems={'center'}
        width={'100%'}
        style={{ marginTop: hp(10) }}
        onPress={onPress}
      >
        <Bullet num={num} />
        <Box
          backgroundColor={'light.lightYellow'}
          style={{
            marginLeft: wp(12),
            paddingVertical: hp(20),
            paddingLeft: wp(24),
            borderRadius: hp(10),
            width: wp(275)
          }}
        >
          <Text
            color={'light.inheritanceTitle'}
            fontFamily={'body'}
            fontWeight={200}
            fontSize={RFValue(13)}
            letterSpacing={0.65}
            width={wp(233)}
          >
            {title}
          </Text>
          <Text
            color={'light.GreyText'}
            fontFamily={'body'}
            fontWeight={200}
            fontSize={RFValue(12)}
            letterSpacing={0.6}
            width={wp(240)}
            marginTop={hp(5)}
          >
            {subTitle}
          </Text>
        </Box>
      </Pressable>
    );
  }

  const renderInheritanceOptions = ({ item, index }: { item, index: number }) => {
    return (
      <Option
        title={item?.title}
        subTitle={item?.subTitle}
        num={index + 1}
        onPress={() => { }}
      />
    )
  }
  return (
    <Box style={styles.Container} background={'light.ReceiveBackground'}>
      <StatusBarComponent padding={50} />
      <Box>
        <Header
          title={'Setup Inheritance'}
          onPressHandler={() => navigtaion.goBack()}
          headerTitleColor={'light.headerText'}
          fontSize={16}
        />
      </Box>
      <Box
        alignItems={'center'}
        paddingX={1}
        marginTop={hp(15)}
        paddingBottom={hp(122)}
      >
        <FlatList
          data={inheritanceData}
          renderItem={renderInheritanceOptions}
          keyExtractor={item => item}
          showsVerticalScrollIndicator={false}
        />
      </Box>

    </Box>
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
