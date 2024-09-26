import React, { useEffect, useState, useRef } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  StyleSheet,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  View,
  TouchableOpacity,
} from 'react-native';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import Buttons from 'src/components/Buttons';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { useAppSelector } from 'src/store/hooks';
import Text from 'src/components/KeeperText';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import DefaultLabelList from 'src/components/Labels/DefaultLabelList';
import CustomLabelList from 'src/components/Labels/CustomLabelList';
import { useDispatch } from 'react-redux';
import { defaultLabels, MAX_TAGS } from 'src/components/Labels/constants';
import { resetState } from 'src/store/reducers/utxos';
import { bulkUpdateLabels } from 'src/store/sagaActions/utxos';
import { Box, useColorMode } from 'native-base';
import useTransactionLabels from 'src/hooks/useTransactionLabels';
import { getAmt, getCurrencyImageByRegion, getUnit } from 'src/constants/Bitcoin';
import openLink from 'src/utils/OpenLink';
import LinkIcon from 'src/assets/images/share-grey.svg';
import BtcBlack from 'src/assets/images/btc_black.svg';
import { NetworkType } from 'src/services/wallets/enums';
import useExchangeRates from 'src/hooks/useExchangeRates';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import config from 'src/utils/service-utilities/config';

function TransactionLabeling() {
  const navigation = useNavigation();
  const {
    params: { transaction, wallet },
  } = useRoute() as { params: { transaction: any; wallet: any } };
  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const { satsEnabled } = useAppSelector((state) => state.settings);
  const exchangeRates = useExchangeRates();
  const { labels: txnLabels } = useTransactionLabels({ txid: transaction.txid, wallet });
  const [selectedDefaultLabels, setSelectedDefaultLabels] = useState<string[]>([]);
  const [customLabels, setCustomLabels] = useState<string[]>([]);
  const [existingLabels, setExistingLabels] = useState([]);
  const [systemLabelCount, setSystemLabelCount] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const processDispatched = useRef(false);
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();
  const { syncingUTXOs, apiError } = useAppSelector((state) => state.utxos);

  useEffect(() => {
    if (txnLabels && txnLabels) {
      setExistingLabels(txnLabels);

      const defaultSelected = txnLabels
        .filter((label) => defaultLabels.includes(label.name))
        .map((label) => label.name);
      setSelectedDefaultLabels(defaultSelected);

      const customSelected = txnLabels
        .filter((label) => !defaultLabels.includes(label.name) && !label.isSystem)
        .map((label) => label.name);
      setCustomLabels(customSelected);
    }

    return () => {
      dispatch(resetState());
    };
  }, []);

  useEffect(() => {
    const systemLabels = existingLabels.filter((label) => label.isSystem);
    setSystemLabelCount(systemLabels.length);
  }, [existingLabels]);

  useEffect(() => {
    const initialLabels = existingLabels.filter((label) => !label.isSystem);
    const initialDefaultLabels = initialLabels
      .filter((label) => defaultLabels.includes(label.name))
      .map((label) => label.name);
    const initialCustomLabels = initialLabels
      .filter((label) => !defaultLabels.includes(label.name))
      .map((label) => label.name);

    const defaultLabelsChanged =
      JSON.stringify(selectedDefaultLabels) !== JSON.stringify(initialDefaultLabels);
    const customLabelsChanged =
      JSON.stringify(customLabels) !== JSON.stringify(initialCustomLabels);

    setHasChanges(defaultLabelsChanged || customLabelsChanged);
  }, [selectedDefaultLabels, customLabels, existingLabels]);

  useEffect(() => {
    if (apiError) {
      showToast(apiError.toString(), <ToastErrorIcon />);
      processDispatched.current = false;
    }
    if (processDispatched.current && !syncingUTXOs) {
      processDispatched.current = false;
      navigation.goBack();
    }
  }, [apiError, syncingUTXOs, navigation, showToast]);

  const totalSelectedTags = () => {
    return systemLabelCount + selectedDefaultLabels.length + customLabels.length;
  };

  const getLabelChanges = (existingLabels, updatedLabels) => {
    const existingNames = new Set(existingLabels.map((label) => label.name));
    const updatedNames = new Set(updatedLabels.map((label) => label.name));

    const addedLabels = updatedLabels.filter((label) => !existingNames.has(label.name));
    const deletedLabels = existingLabels.filter((label) => !updatedNames.has(label.name));

    return { added: addedLabels, deleted: deletedLabels };
  };

  const onSaveChangeClick = () => {
    Keyboard.dismiss();

    const initialLabels = existingLabels.filter((label) => !label.isSystem);
    const updatedLabels = [
      ...selectedDefaultLabels.map((name) => ({ name, isSystem: false })),
      ...customLabels.map((name) => ({ name, isSystem: false })),
    ];

    const labelChanges = getLabelChanges(initialLabels, updatedLabels);

    if (labelChanges.added.length > 0 || labelChanges.deleted.length > 0) {
      processDispatched.current = true;
      dispatch(bulkUpdateLabels({ labelChanges, txId: transaction.txid, wallet }));
    }
  };

  const handleSelectDefaultLabel = (label: string) => {
    if (selectedDefaultLabels.includes(label)) {
      setSelectedDefaultLabels(selectedDefaultLabels.filter((item) => item !== label));
    } else if (totalSelectedTags() < MAX_TAGS) {
      setSelectedDefaultLabels([...selectedDefaultLabels, label]);
    } else {
      showToast(`You can only select up to ${MAX_TAGS} tags in total.`);
    }
  };

  const handleAddCustomLabel = (label: string) => {
    if (totalSelectedTags() < MAX_TAGS) {
      setCustomLabels([...customLabels, label]);
    } else {
      showToast(`You can only add up to ${MAX_TAGS} tags in total.`);
    }
  };

  const handleDeleteCustomLabel = (label: string) => {
    setCustomLabels(customLabels.filter((item) => item !== label));
  };

  const handleEditCustomLabel = (updatedLabel: string, index: number) => {
    const updatedLabels = [...customLabels];
    updatedLabels[index] = updatedLabel;
    setCustomLabels(updatedLabels);
  };

  const redirectToBlockExplorer = () => {
    openLink(
      `https://mempool.space${config.NETWORK_TYPE === NetworkType.TESTNET ? '/testnet' : ''}/tx/${
        transaction.txid
      }`
    );
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader title="Transaction Labeling" subtitle="Assign labels to your transaction" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollViewWrapper} showsVerticalScrollIndicator={false}>
          <View style={styles.subHeader}>
            <View style={{ width: '50%' }}>
              <Text style={styles.subHeaderTitle} color={`${colorMode}.greenText`}>
                Transaction ID
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={styles.subHeaderValue}
                  numberOfLines={1}
                  color={`${colorMode}.primaryText`}
                >
                  {transaction.txid}
                </Text>
                <TouchableOpacity style={{ margin: 5 }} onPress={redirectToBlockExplorer}>
                  <LinkIcon />
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ width: '50%', marginLeft: wp(30) }}>
              <Text style={styles.subHeaderTitle} color={`${colorMode}.greenText`}>
                Amount
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Box style={{ marginRight: 5 }}>
                  {getCurrencyImageByRegion(currencyCode, 'dark', currentCurrency, BtcBlack)}
                </Box>
                <Text
                  style={styles.subHeaderValue}
                  numberOfLines={1}
                  color={`${colorMode}.primaryText`}
                >
                  {getAmt(
                    transaction.amount,
                    exchangeRates,
                    currencyCode,
                    currentCurrency,
                    satsEnabled
                  )}
                  <Text color={`${colorMode}.primaryText`} style={styles.unitText}>
                    {getUnit(currentCurrency, satsEnabled)}
                  </Text>
                </Text>
              </View>
            </View>
          </View>
          <Box style={styles.listHeader}>
            <Text medium style={styles.listHeaderTitle} color={`${colorMode}.secondaryText`}>
              Add or Create New Labels
            </Text>
            <Text style={styles.listHeaderDesc} color={`${colorMode}.secondaryText`}>
              {' (Maximum 5 tags)'}
            </Text>
          </Box>
          <Box style={styles.listHeaderWrapper}>
            <DefaultLabelList
              defaultLabels={defaultLabels}
              selectedLabels={selectedDefaultLabels}
              onSelect={handleSelectDefaultLabel}
            />
            <CustomLabelList
              customLabels={customLabels}
              onAdd={handleAddCustomLabel}
              onDelete={handleDeleteCustomLabel}
              onEdit={handleEditCustomLabel}
            />
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
      <Box style={styles.ctaBtnWrapper}>
        <Box ml={windowWidth * -0.09}>
          <Buttons
            primaryLoading={syncingUTXOs}
            primaryDisable={!hasChanges}
            primaryCallback={onSaveChangeClick}
            primaryText="Save Changes"
            secondaryCallback={navigation.goBack}
            secondaryText="Cancel"
          />
        </Box>
      </Box>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollViewWrapper: {
    flex: 1,
  },
  subHeader: {
    width: '100%',
    flexDirection: 'row',
    marginHorizontal: wp(10),
    marginTop: 38,
    justifyContent: 'space-between',
  },
  subHeaderTitle: {
    fontSize: 14,
    marginEnd: 5,
  },
  subHeaderValue: {
    fontSize: 12,
    letterSpacing: 2.4,
    width: '50%',
  },
  listHeaderWrapper: {
    marginHorizontal: wp(10),
    marginTop: hp(15),
    gap: 25,
  },
  listHeader: {
    flexDirection: 'row',
    marginHorizontal: wp(10),
    marginTop: hp(32),
  },
  listHeaderTitle: {
    fontSize: 14,
  },
  listHeaderDesc: {
    fontSize: 14,
    opacity: 0.6,
  },
  ctaBtnWrapper: {
    marginBottom: hp(5),
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  unitText: {
    letterSpacing: 0.6,
    fontSize: hp(12),
  },
});

export default TransactionLabeling;
