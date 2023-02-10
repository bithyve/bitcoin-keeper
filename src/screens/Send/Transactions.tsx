// libraries
import { Box, View } from 'native-base';
import { FlatList, TouchableOpacity } from 'react-native';
import React from 'react';
// asserts
import IconWallet from 'src/assets/images/icon_wallet.svg';
import { ScaledSheet } from 'react-native-size-matters';
import Close from 'src/assets/images/modal_close.svg';
// components
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import Text from 'src/components/KeeperText';

function Transactions({ transactions, addTransaction = () => {} }) {
  const renderTranscation = ({ item }: { item; index }) => {
    const { address, amount } = item;
    return (
      <Box
        justifyContent="space-between"
        alignItems="center"
        style={{ marginRight: wp(10) }}
        flexDirection="row"
        backgroundColor="light.primaryBackground"
        width={wp(215)}
        height={hp(54)}
        borderRadius={10}
      >
        <Box flexDirection="row">
          <TouchableOpacity style={styles.buttonBackground}>
            <IconWallet />
          </TouchableOpacity>
          <Box marginLeft={wp(10)}>
            <Text
              fontSize={14}
              mt="1"
              numberOfLines={1}
              letterSpacing={1.12}
              color="light.sendCardHeading"
              width={wp(100)}
            >
              {address}
            </Text>
            <Text fontSize={10} numberOfLines={1} style={styles.amount}>
              {amount}
            </Text>
          </Box>
        </Box>
        <TouchableOpacity
          style={{
            marginRight: wp(5),
          }}
        >
          <Close />
        </TouchableOpacity>
      </Box>
    );
  };
  return (
    <View flexDirection="row">
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
}

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
  amount: {
    fontStyle: 'italic',
  },
});
export default Transactions;
