// libraries
import { Box, Text, View } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { FlatList, TouchableOpacity } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
//asserts
import IconWallet from 'src/assets/images/svgs/icon_wallet.svg';
import { ScaledSheet } from 'react-native-size-matters';
import Close from 'src/assets/icons/modal_close.svg';
// components
import { hp, wp } from 'src/common/data/responsiveness/responsive';

const Transactions = ({ transactions, addTransaction = () => {} }) => {
  const navigation = useNavigation();

  const GradientIcon = ({ height, Icon }) => {
    return (
      <LinearGradient
        colors={['#B17F44', '#6E4A35']}
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
  const renderTranscation = ({ item, index }: { item; index }) => {
    const { address, amount } = item;
    return (
      <>
        <Box
          justifyContent={'space-between'}
          alignItems={'center'}
          style={{ marginRight: wp(10) }}
          flexDirection={'row'}
          backgroundColor={'light.lightYellow'}
          width={wp(215)}
          height={hp(54)}
          borderRadius={10}
        >
          <Box flexDirection={'row'}>
            <TouchableOpacity style={styles.buttonBackground}>
              <IconWallet />
            </TouchableOpacity>
            <Box marginLeft={wp(10)}>
              <Text
                fontFamily={'body'}
                fontWeight={'200'}
                fontSize={14}
                mt={'1'}
                numberOfLines={1}
                letterSpacing={1.12}
                color={'light.sendCardHeading'}
                width={wp(100)}
              >
                {address}
              </Text>
              <Text
                fontFamily={'body'}
                fontWeight={'200'}
                fontStyle={'italic'}
                fontSize={10}
                numberOfLines={1}
              >
                {amount}
              </Text>
            </Box>
          </Box>
          <TouchableOpacity
            style={{
              marginRight: wp(5),
            }}
          >
            {/* { Do not have right assert in xd} */}
            <Close />
          </TouchableOpacity>
        </Box>

        {/* {index == transactions.length - 1 &&
          <TouchableOpacity onPress={addTransaction} activeOpacity={0.5}>
            <Box
              alignItems={'center'}
              style={{ marginRight: wp(10) }}
              flexDirection={'row'}
              backgroundColor={'light.yellow1'}
              width={wp(215)}
              height={hp(54)}
              borderRadius={10}
            >
              <Box style={styles.buttonBackground}>
                <GradientIcon Icon={AddIcon} height={hp(30)} />
              </Box>
              <Box marginLeft={wp(10)}>
                <Text
                  fontWeight={200}
                  fontSize={14}
                  mt={'1'}
                  numberOfLines={1}
                  letterSpacing={0.6}
                  color={'light.addTransactionText'}
                >
                  Add Transaction
                </Text>
              </Box>
            </Box>
          </TouchableOpacity>
        } */}
      </>
    );
  };
  return (
    <View flexDirection={'row'}>
      {transactions && (
        <FlatList
          data={transactions}
          renderItem={renderTranscation}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: '20@s',
  },

  buttonBackground: {
    backgroundColor: '#FAC48B',
    width: 40,
    height: 40,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: wp(10),
  },
});
export default Transactions;
