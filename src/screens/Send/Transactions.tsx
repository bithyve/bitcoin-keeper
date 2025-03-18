import { Box, useColorMode, View } from 'native-base';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import IconWallet from 'src/assets/images/icon_wallet.svg';
import Close from 'src/assets/images/modal_close.svg';
import { hp, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';

function Transactions({ transactions, addTransaction = () => {} }) {
  const { colorMode } = useColorMode();
  const renderTranscation = ({ item }: { item; index }) => {
    const { address, amount } = item;
    return (
      <Box
        justifyContent="space-between"
        alignItems="center"
        style={{ marginRight: wp(10) }}
        flexDirection="row"
        backgroundColor={`${colorMode}.primaryBackground`}
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
              color={`${colorMode}.hexagonIconBackColor`}
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

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    padding: 20,
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
