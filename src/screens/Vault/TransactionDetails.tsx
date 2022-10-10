import { Box, Text } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import { useDispatch } from 'react-redux';
// components, interfaces
import HeaderTitle from 'src/components/HeaderTitle';
import StatusBarComponent from 'src/components/StatusBarComponent';
// asserts
import IconRecieve from 'src/assets/images/svgs/icon_received_lg.svg';

const TransactionDetails = ({ }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const InfoCard = ({ title, describtion, width = 300 }) => {
    return (
      <Box
        backgroundColor={'light.lightYellow'}
        style={{
          height: hp(58),
          width: wp(width),
          marginVertical: hp(7),
          justifyContent: 'center',
          paddingLeft: wp(15),
          borderRadius: 10
        }}
      >
        <Text
          fontWeight={200}
          fontSize={15}
          letterSpacing={1.12}
          color={'light.headerText'}
        >
          {title}
        </Text>
        <Text
          fontWeight={200}
          fontSize={12}
          letterSpacing={2.4}
          color={'light.GreyText'}
        >
          {describtion}
        </Text>
      </Box>
    );
  };

  return (
    <Box
      style={styles.Container}
    >
      <StatusBarComponent padding={50} />
      <Box marginX={3} >
        <Box width={wp(200)}>
          <HeaderTitle
            onPressHandler={() => navigation.goBack()}
            title={'Transaction Details'}
            subtitle={'Lorem ipsum dolor sit amet'}
            paddingTop={hp(20)}
          />
        </Box>
        {/* {card} */}
        <Box
          flexDirection={'row'}
          alignItems={'center'}
          marginTop={hp(40)}
          width={320}
          justifyContent={'center'}
        >
          <IconRecieve />
          <Box marginLeft={wp(10)} width={wp(100)}>
            <Text
              fontWeight={200}
              fontSize={14}
              letterSpacing={0.7}
              color={'light.headerText'}
            >
              bjkdfie79583…
            </Text>
            <Text
              fontWeight={200}
              fontSize={10}
              letterSpacing={0.5}
              color={'light.dateText'}
            >
              30 May 22 11:00am
            </Text>
          </Box>
          <Box marginLeft={wp(50)}>
            <Text
              fontWeight={200}
              fontSize={19}
              letterSpacing={0.95}
            >
              0.00015
            </Text>
          </Box>
        </Box>
        {/* {flatlist} */}
        <Box
          alignItems={'center'}
          marginTop={hp(40)}
          width={320}
          justifyContent={'center'}
        >
          <InfoCard title={'To Address'} describtion={'8572308235034623'} />
          <InfoCard title={'From Address'} describtion={'8572308235034623'} />
          <InfoCard title={'Transaction ID'} describtion={'asdfth3242533466d…'} />
          <Box flexDirection={'row'} justifyContent={'space-between'} width={'103%'}>
            <InfoCard title={'From Address'} describtion={'8572308235034623'} width={145} />
            <InfoCard title={'Transaction ID'} describtion={'asdfth3242533466d…'} width={145} />
          </Box>
          <Box flexDirection={'row'} justifyContent={'space-between'} width={'103%'}>
            <InfoCard title={'Privacy'} describtion={'Peer'} width={145} />
            <InfoCard title={'Confirmations'} describtion={'6+'} width={145} />
          </Box>

        </Box>
      </Box>
    </Box >
  );
};

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: '20@s',
    backgroundColor: 'light.ReceiveBackground',
  },
  linearGradient: {
    borderRadius: 6,
    marginTop: hp(3),
  },
  cardContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: RFValue(12),
    letterSpacing: '0.24@s',
  },
  subtitle: {
    fontSize: RFValue(10),
    letterSpacing: '0.20@s',
  },

  textInput: {
    width: '100%',
    backgroundColor: '#FDF7F0',
    borderRadius: 10,
    opacity: 0.5,
    padding: 15,
  },



});
export default TransactionDetails;
