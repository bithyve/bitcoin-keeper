// libraries
import { Box, Text } from 'native-base';
import { FlatList, RefreshControl } from 'react-native';
import React, { useContext, useState } from 'react';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

// components, interfaces
import HeaderTitle from 'src/components/HeaderTitle';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { ScaledSheet } from 'react-native-size-matters';
import StatusBarComponent from 'src/components/StatusBarComponent';
import TransactionElement from 'src/components/TransactionElement';
import { Vault } from 'src/core/wallets/interfaces/vault';
// asserts
import VaultIcon from 'src/assets/images/svgs/icon_vault_brown.svg';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

const VaultTransactions = ({ route }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { useQuery } = useContext(RealmWrapperContext);
  const [pullRefresh, setPullRefresh] = useState(false);

  const vault: Vault = useQuery(RealmSchema.Vault)
    .map(getJSONFromRealmObject)
    .filter((vault) => !vault.archived)[0];
  const transactions = vault?.specs?.transactions || [];
  const title = route?.params?.title;
  const subtitle = route?.params?.subtitle;

  const renderTransactionElement = ({ item }) => {
    return <TransactionElement transaction={item} />;
  };

  const pullDownRefresh = () => {
    setPullRefresh(true);
    refreshVault();
    setPullRefresh(false);
  };

  const refreshVault = () => {
    dispatch(refreshWallets([vault], { hardRefresh: true }));
  };

  return (
    <Box style={styles.Container}>
      <StatusBarComponent padding={50} />
      <Box marginX={3}>
        <Box width={wp(200)}>
          <HeaderTitle onPressHandler={() => navigation.goBack()} />
        </Box>

        <Box flexDirection={'row'} alignItems={'center'}>
          <VaultIcon />
          <Box>
            <Text fontWeight={200} fontSize={16} letterSpacing={0.8} color={'light.headerText'}>
              {title}
            </Text>
            <Text fontWeight={200} fontSize={12} letterSpacing={0.6} color={'light.modalText'}>
              {subtitle}
            </Text>
          </Box>
        </Box>

        <Box marginTop={hp(10)} paddingBottom={hp(300)}>
          <FlatList
            data={transactions}
            refreshControl={<RefreshControl onRefresh={pullDownRefresh} refreshing={pullRefresh} />}
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
