import {
  FlatList,
} from 'react-native';
// libraries
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
import TransactionElement from 'src/components/TransactionElement';
// asserts
import VaultIcon from 'src/assets/images/svgs/icon_vault_brown.svg';

const VaultTransactions = () => {
  const navigation = useNavigation();

  const renderTransactionElement = ({ item }) => {
    return <TransactionElement transaction={item} />;
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
          />
        </Box>
        {/* {card} */}
        <Box
          flexDirection={'row'}
          alignItems={'center'}
        >
          <VaultIcon />
          <Box>
            <Text
              fontWeight={200}
              fontSize={16}
              letterSpacing={0.8}
              color={'light.headerText'}
            >
              Vault Transactions
            </Text>
            <Text
              fontWeight={200}
              fontSize={12}
              letterSpacing={0.6}
              color={'light.modalText'}
            >
              All incoming and outgoing transactions
            </Text>
          </Box>
        </Box>
        {/* {flatlist} */}
        <Box
          marginTop={hp(10)}
          paddingBottom={hp(300)}
        >
          <FlatList
            data={[1, 2, 3]}
            renderItem={renderTransactionElement}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
          />
        </Box>
      </Box>
    </Box>
  );
};

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: '20@s',
    backgroundColor: 'light.ReceiveBackground',
  },
});
export default VaultTransactions;
