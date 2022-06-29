import React from 'react';
import { Box, Text, Pressable } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
//components and functions
import Header from 'src/components/Header';
import StatusBarComponent from 'src/components/StatusBarComponent';
import InfoBox from 'src/components/InfoBox';
import { wp, hp } from 'src/common/data/responsiveness/responsive';
// icons
import Arrow from 'src/assets/images/svgs/icon_arrow_Wallet.svg';

type Props = {
  title: string,
  subTitle: string,
  onPress: () => void
}

const WalletSettings = () => {
  const navigtaion = useNavigation();

  const Option = ({
    title,
    subTitle,
    onPress
  }: Props) => {
    return (
      <Pressable
        flexDirection={'row'}
        justifyContent={'space-between'}
        alignItems={'center'}
        width={'100%'}
        style={{ marginVertical: hp(20) }}
        onPress={onPress}
      >
        <Box>
          <Text
            color={'light.lightBlack'}
            fontFamily={'body'}
            fontWeight={200}
            fontSize={RFValue(14)}
            letterSpacing={1.12}
          >
            {title}
          </Text>
          <Text
            color={'light.GreyText'}
            fontFamily={'body'}
            fontWeight={200}
            fontSize={RFValue(12)}
            letterSpacing={0.6}
          >
            {subTitle}
          </Text>
        </Box>
        <Box>
          <Arrow />
        </Box>
      </Pressable>
    );
  }

  return (
    <Box style={styles.Container} background={'light.ReceiveBackground'}>
      <StatusBarComponent padding={50} />
      <Box>
        <Header
          title={'Wallet Settings'}
          subtitle={'Lorem Ipsum Dolor'}
          onPressHandler={() => navigtaion.goBack()}
          headerTitleColor={'light.textBlack'}
          fontSize={20}
        />
      </Box>
      <Box
        marginTop={hp(60)}
        alignItems={'center'}
        paddingX={wp(25)}
      >
        <Option
          title={'Wallet Details'}
          subTitle={'Change wallet name & description'}
          onPress={() => { console.log('Wallet Details') }}
        />
        <Option
          title={'Show xPub'}
          subTitle={'Use to create a external watch-only wallet'}
          onPress={() => { console.log('Show xPub') }}
        />
        <Option
          title={'Wallet seed words'}
          subTitle={'Use to link external wallets to Keeper'}
          onPress={() => { console.log('Wallet seed words') }}
        />
      </Box>

      {/* {Bottom note} */}
      <Box position={'absolute'} bottom={hp(45)} marginX={5}>
        <InfoBox
          title={'Note'}
          desciption={'These settings are for your Default Wallet only and does not affect other wallets'}
          width={250}
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
export default WalletSettings;
