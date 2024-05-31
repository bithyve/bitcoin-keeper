import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { StyleSheet, TouchableOpacity, View, ScrollView, Keyboard } from 'react-native';
import { Box, Input, useColorMode } from 'native-base';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { UTXO } from 'src/services/wallets/interfaces';
import { NetworkType } from 'src/services/wallets/enums';
import { useDispatch } from 'react-redux';
import { bulkUpdateLabels } from 'src/store/sagaActions/utxos';
import LinkIcon from 'src/assets/images/link.svg';
import BtcBlack from 'src/assets/images/btc_black.svg';
import Text from 'src/components/KeeperText';
import openLink from 'src/utils/OpenLink';
import config from 'src/utils/service-utilities/config';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import { useAppSelector } from 'src/store/hooks';
import useExchangeRates from 'src/hooks/useExchangeRates';
import { getAmt, getCurrencyImageByRegion, getUnit } from 'src/constants/Bitcoin';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import useLabelsNew from 'src/hooks/useLabelsNew';
import { resetState } from 'src/store/reducers/utxos';
import LabelItem from './components/LabelItem';
import KeeperModal from 'src/components/KeeperModal';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Edit from 'src/assets/images/edit.svg';
import Buttons from 'src/components/Buttons';
import Done from 'src/assets/images/selected.svg';

function UTXOLabeling() {
  const processDispatched = useRef(false);
  const navigation = useNavigation();
  const {
    params: { utxo, wallet },
  } = useRoute() as { params: { utxo: UTXO; wallet: any } };
  const { labels } = useLabelsNew({ utxos: [utxo], wallet });
  const [existingLabels, setExistingLabels] = useState([]);
  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const exchangeRates = useExchangeRates();
  const { satsEnabled } = useAppSelector((state) => state.settings);
  const { colorMode } = useColorMode();
  const [isEditMode, setIsEditMode] = useState(false);
  const { translations } = useContext(LocalizationContext);

  const { common } = translations;

  function EditLabelsContent({ existingLabels, setExistingLabels }) {
    const { colorMode } = useColorMode();
    const [editingIndex, setEditingIndex] = useState(-1);
    const [label, setLabel] = useState('');

    const onCloseClick = (index) => {
      existingLabels.splice(index, 1);
      setExistingLabels([...existingLabels]);
    };

    const onEditClick = (item, index) => {
      setLabel(item.name);
      setEditingIndex(index);
    };

    const onAdd = () => {
      if (label) {
        if (editingIndex !== -1) {
          existingLabels[editingIndex] = { name: label, isSystem: false };
        } else {
          existingLabels.push({ name: label, isSystem: false });
        }
        setEditingIndex(-1);
        setExistingLabels(existingLabels);
        setLabel('');
      }
    };

    const onSaveChangeClick = async () => {
      Keyboard.dismiss();
      const finalLabels = existingLabels.filter(
        (label) => !label.isSystem // ignore the system label since they are internal references
      );
      const initialLabels = labels[`${utxo.txId}:${utxo.vout}`].filter((label) => !label.isSystem);
      const labelChanges = getLabelChanges(initialLabels, finalLabels);
      processDispatched.current = true;
      dispatch(bulkUpdateLabels({ labelChanges, UTXO: utxo, wallet }));
    };

    const lablesUpdated =
      getSortedNames(labels[`${utxo.txId}:${utxo.vout}`]) !== getSortedNames(existingLabels);

    return (
      <Box>
        <Box style={styles.editLabelsContainer} backgroundColor={`${colorMode}.seashellWhite`}>
          <Box style={styles.editLabelsSubContainer}>
            {existingLabels.map((item, index) => (
              <LabelItem
                item={item}
                index={index}
                key={`${item.name}:${item.isSystem}`}
                editingIndex={editingIndex}
                onCloseClick={onCloseClick}
                onEditClick={onEditClick}
              />
            ))}
          </Box>
          <Box
            style={styles.editLabelsInputWrapper}
            backgroundColor={`${colorMode}.primaryBackground`}
          >
            <Box style={styles.editLabelsInputBox}>
              <Input
                testID="input_utxoLabel"
                onChangeText={(text) => {
                  setLabel(text);
                }}
                onSubmitEditing={onAdd}
                style={styles.editLabelsInput}
                variant={'unstyled'}
                placeholder="Type to add label or select to edit"
                value={label}
                autoCorrect={false}
                autoCapitalize="characters"
                backgroundColor={`${colorMode}.primaryBackground`}
              />
            </Box>
            <Box>
              <TouchableOpacity
                style={styles.addBtnWrapper}
                onPress={onAdd}
                testID="btn_addUtxoLabel"
              >
                <Done />
              </TouchableOpacity>
            </Box>
          </Box>
        </Box>
        <Box style={styles.ctaBtnWrapper}>
          <Box ml={windowWidth * -0.09}>
            <Buttons
              primaryLoading={syncingUTXOs}
              primaryDisable={!lablesUpdated}
              primaryCallback={onSaveChangeClick}
              primaryText={common.saveChanges}
              secondaryCallback={() => setIsEditMode(false)}
              secondaryText={common.cancel}
            />
          </Box>
        </Box>
      </Box>
    );
  }

  const getSortedNames = (labels) =>
    labels
      .sort((a, b) =>
        a.isSystem < b.isSystem ? 1 : a.isSystem > b.isSystem ? -1 : a.name > b.name ? 1 : -1
      )
      .reduce((a, c) => {
        a += c.name;
        return a;
      }, '');
  getSortedNames(existingLabels);

  const dispatch = useDispatch();
  const { showToast } = useToastMessage();

  const { syncingUTXOs, apiError } = useAppSelector((state) => state.utxos);

  useEffect(() => {
    setExistingLabels(labels ? labels[`${utxo.txId}:${utxo.vout}`] || [] : []);
    return () => {
      dispatch(resetState());
    };
  }, []);

  function InfoCard({
    title,
    describtion = '',
    width = 320,
    showIcon = false,
    letterSpacing = 1,
    numberOfLines = 1,
    Icon = null,
    Content = null,
  }) {
    return (
      <Box
        backgroundColor={`${colorMode}.seashellWhite`}
        width={wp(width)}
        style={styles.infoCardContainer}
      >
        <Box style={[showIcon && { flexDirection: 'row', width: '100%', alignItems: 'center' }]}>
          <Box width={showIcon ? '90%' : '100%'}>
            <Text color={`${colorMode}.headerText`} style={styles.titleText} numberOfLines={1}>
              {title}
            </Text>
            {Content ? (
              <Content />
            ) : (
              <Text
                style={styles.descText}
                letterSpacing={letterSpacing}
                color={`${colorMode}.GreyText`}
                width={showIcon ? '60%' : '90%'}
                numberOfLines={numberOfLines}
              >
                {describtion}
              </Text>
            )}
          </Box>
          {showIcon && Icon}
        </Box>
      </Box>
    );
  }

  useEffect(() => {
    if (apiError) {
      showToast(apiError.toString(), <ToastErrorIcon />);
      processDispatched.current = false;
    }
    if (processDispatched.current && !syncingUTXOs) {
      processDispatched.current = false;
      navigation.goBack();
    }
  }, [apiError, syncingUTXOs]);

  function getLabelChanges(existingLabels, updatedLabels) {
    const existingNames = new Set(existingLabels.map((label) => label.name));
    const updatedNames = new Set(updatedLabels.map((label) => label.name));

    const addedLabels = updatedLabels.filter((label) => !existingNames.has(label.name));
    const deletedLabels = existingLabels.filter((label) => !updatedNames.has(label.name));

    const labelChanges = {
      added: addedLabels,
      deleted: deletedLabels,
    };

    return labelChanges;
  }

  const redirectToBlockExplorer = () => {
    openLink(
      `https://mempool.space${config.NETWORK_TYPE === NetworkType.TESTNET ? '/testnet' : ''}/tx/${
        utxo.txId
      }`
    );
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title="UTXO Details"
        subtitle="Easily identify specific aspects of various UTXOs"
      />
      <ScrollView
        style={styles.scrollViewWrapper}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >
        <View style={styles.subHeader} testID="view_utxosLabelSubHeader">
          <View style={{ flex: 1 }}>
            <Text style={styles.subHeaderTitle}>Transaction ID</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.subHeaderValue} numberOfLines={1}>
                {utxo.txId}
              </Text>
              <TouchableOpacity style={{ margin: 5 }} onPress={redirectToBlockExplorer}>
                <LinkIcon />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.subHeaderTitle}>UTXO Value</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Box style={{ marginHorizontal: 5 }}>
                {getCurrencyImageByRegion(currencyCode, 'dark', currentCurrency, BtcBlack)}
              </Box>
              <Text style={styles.subHeaderValue} numberOfLines={1}>
                {getAmt(utxo.value, exchangeRates, currencyCode, currentCurrency, satsEnabled)}
                <Text color={`${colorMode}.dateText`} style={styles.unitText}>
                  {getUnit(currentCurrency, satsEnabled)}
                </Text>
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.listContainer}
          testID="btn_transactionNote"
          onPress={() => setIsEditMode(!isEditMode)}
        >
          <InfoCard
            title={'Labels'}
            Content={() => (
              <Box style={styles.listSubContainer}>
                {existingLabels.map((item, index) => (
                  <LabelItem
                    item={item}
                    index={index}
                    key={`${item.name}:${item.isSystem}`}
                    editable={false}
                  />
                ))}
              </Box>
            )}
            showIcon
            Icon={<Edit />}
          />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
      </ScrollView>
      <KeeperModal
        visible={isEditMode}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.primaryText`}
        subTitleColor={`${colorMode}.secondaryText`}
        DarkCloseIcon={colorMode === 'dark'}
        close={() => setIsEditMode(false)}
        showCloseIcon={false}
        title={'Edit Labels'}
        subTitle={'Easily identify and manage transactions'}
        justifyContent="center"
        Content={() => (
          <EditLabelsContent
            existingLabels={existingLabels}
            setExistingLabels={setExistingLabels}
          />
        )}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollViewWrapper: {
    flex: 1,
  },
  unitText: {
    letterSpacing: 0.6,
    fontSize: hp(12),
  },
  subHeader: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 38,
  },
  subHeaderTitle: {
    fontSize: 14,
    color: '#00715B',
    marginEnd: 5,
  },
  subHeaderValue: {
    color: '#4F5955',
    fontSize: 12,
    marginEnd: 5,
    letterSpacing: 2.4,
    width: '50%',
  },
  listContainer: {
    alignSelf: 'center',
    marginTop: 18,
    marginHorizontal: 5,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
  },
  listSubContainer: {
    flexWrap: 'wrap',
    marginBottom: 20,
    flexDirection: 'row',
  },
  editLabelsContainer: {
    margin: 0,
    width: '100%',
    borderRadius: 10,
    marginBottom: 8,
    overflow: 'hidden',
    paddingHorizontal: 5,
    paddingBottom: 10,
    paddingTop: 0,
  },
  editLabelsSubContainer: {
    marginHorizontal: wp(5),
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  editLabelsInputWrapper: {
    flexDirection: 'row',
    alignSelf: 'center',
    width: '98%',
    alignItems: 'center',
    borderRadius: 10,
    padding: 5,
    marginTop: hp(30),
  },
  editLabelsInputBox: {
    width: '90%',
    paddingVertical: 8,
  },
  editLabelsInput: {
    fontSize: 13,
    fontWeight: '400',
  },
  infoCardContainer: {
    marginVertical: hp(7),
    justifyContent: 'center',
    paddingLeft: wp(15),
    borderRadius: 10,
    paddingHorizontal: 3,
    paddingVertical: 10,
  },
  titleText: {
    fontSize: 14,
    letterSpacing: 1.12,
    width: '90%',
  },
  descText: {
    fontSize: 12,
  },
  ctaBtnWrapper: {
    marginBottom: hp(5),
    marginTop: hp(25),
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  addBtnWrapper: {
    width: '10%',
  },
});

export default UTXOLabeling;
