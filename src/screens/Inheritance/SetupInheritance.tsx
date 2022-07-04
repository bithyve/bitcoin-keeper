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

  const Bullet = ({ num }: { num: number }) => {
    return (
      <Box
        height={25}
        width={25}
        borderRadius={25}
        marginLeft={4}
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
        backgroundColor={'light.lightYellow'}
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
          subtitle={'Securely bequeath your bitcoin'}
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
