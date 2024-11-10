import { StyleSheet, TouchableOpacity, Keyboard, Vibration } from 'react-native';
import { View, useColorMode, Box, Input } from 'native-base';
import Buttons from 'src/components/Buttons';
import ConfirmSquare from 'src/assets/images/confirm-square.svg';
import ConfirmSquareGreen from 'src/assets/images/confirm-square-green.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { resetState, setSyncingUTXOError } from 'src/store/reducers/utxos';
import LabelItem from './LabelItem';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import useLabelsNew from 'src/hooks/useLabelsNew';
import { useAppSelector } from 'src/store/hooks';
import useToastMessage from 'src/hooks/useToastMessage';
import { useContext, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { hp, wp } from 'src/constants/responsive';
import { bulkUpdateLabels } from 'src/store/sagaActions/utxos';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function LabelsEditor({ utxo = null, address = null, wallet, onLabelsSaved }) {
  const { labels } = useLabelsNew({ address, utxos: utxo ? [utxo] : [], wallet });
  const { syncingUTXOs, apiError } = useAppSelector((state) => state.utxos);
  const { showToast } = useToastMessage();
  const processDispatched = useRef(false);
  const dispatch = useDispatch();
  const labelsKey = address ? address : `${utxo.txId}:${utxo.vout}`;

  const getSortedNames = (labels) =>
    labels
      .sort((a, b) =>
        a.isSystem < b.isSystem ? 1 : a.isSystem > b.isSystem ? -1 : a.name > b.name ? 1 : -1
      )
      .reduce((a, c) => {
        a += c.name;
        return a;
      }, '');

  const [existingLabels, setExistingLabels] = useState([]);
  const [label, setLabel] = useState('');
  const [editingIndex, setEditingIndex] = useState(-1);
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const lablesUpdated = getSortedNames(labels[labelsKey]) !== getSortedNames(existingLabels);

  useEffect(() => {
    setExistingLabels(labels ? labels[labelsKey] || [] : []);
    return () => {
      dispatch(resetState());
    };
  }, []);

  useEffect(() => {
    // Clean up any existing error when first loading the component
    dispatch(setSyncingUTXOError(null));
  }, []);

  useEffect(() => {
    if (apiError) {
      showToast(apiError.toString(), <ToastErrorIcon />);
      dispatch(setSyncingUTXOError(null));
      processDispatched.current = false;
    }
    if (processDispatched.current && !syncingUTXOs) {
      processDispatched.current = false;

      onLabelsSaved();
    }
  }, [apiError, syncingUTXOs]);

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
      Vibration.vibrate(50);
      Keyboard.dismiss();
    }
  };

  const onSaveChangeClick = async () => {
    Keyboard.dismiss();
    const finalLabels = existingLabels.filter(
      (label) => !label.isSystem // ignore the system label since they are internal references
    );
    const initialLabels = labels[labelsKey].filter((label) => !label.isSystem);
    const labelChanges = getLabelChanges(initialLabels, finalLabels);
    processDispatched.current = true;
    if (address) {
      dispatch(bulkUpdateLabels({ labelChanges, address, wallet }));
    } else {
      dispatch(bulkUpdateLabels({ labelChanges, UTXO: utxo, wallet }));
    }
  };

  return (
    <Box>
      <Box
        style={[
          styles.listContainer,
          colorMode === 'dark' && { borderWidth: 1, borderColor: 'rgba(31, 31, 31, 0.2)' },
        ]}
        backgroundColor={`${colorMode}.boxBackground`}
      >
        <Box
          style={styles.inputLabeWrapper}
          backgroundColor={`${colorMode}.seashellWhite`}
          borderColor={`${colorMode}.borderBrown`}
        >
          <Box style={styles.inputLabelBox}>
            <Input
              testID="input_utxoLabel"
              onChangeText={(text) => {
                setLabel(text);
              }}
              style={styles.inputLabel}
              height={hp(38)}
              borderWidth={0}
              placeholder={`+ ${translations.wallet.AddLabels}`}
              value={label}
              autoCorrect={false}
              backgroundColor={`${colorMode}.seashellWhite`}
              _input={
                colorMode === 'dark' && {
                  selectionColor: Colors.SecondaryWhite,
                  cursorColor: Colors.SecondaryWhite,
                }
              }
            />
          </Box>
          <TouchableOpacity style={styles.addBtnWrapper} onPress={onAdd} testID="btn_addUtxoLabel">
            {label && label !== '' ? <ConfirmSquareGreen /> : <ConfirmSquare />}
          </TouchableOpacity>
        </Box>
        {existingLabels && existingLabels.length > 0 && (
          <View style={styles.listSubContainer}>
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
          </View>
        )}
      </Box>
      {lablesUpdated && (
        <Box style={styles.ctaBtnWrapper}>
          <Buttons
            primaryLoading={syncingUTXOs}
            primaryCallback={onSaveChangeClick}
            primaryText="Save Labels"
            fullWidth
          />
        </Box>
      )}
    </Box>
  );
}

export function getLabelChanges(existingLabels, updatedLabels) {
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

const styles = StyleSheet.create({
  ctaBtnWrapper: {
    marginTop: wp(20),
    marginHorizontal: wp(5),
  },
  inputLabeWrapper: {
    flexDirection: 'row',
    height: hp(40),
    width: '98%',
    alignItems: 'center',
    borderRadius: 10,
    paddingLeft: wp(5),
    borderWidth: 1,
  },
  inputLabelBox: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
  },
  addBtnWrapper: {
    width: wp(32),
    height: hp(32),
    alignItems: 'center',
    marginRight: 3,
  },
  listContainer: {
    marginTop: 18,
    marginHorizontal: 5,
    paddingHorizontal: 15,
    paddingTop: hp(26),
    paddingBottom: hp(21),
    borderRadius: 10,
  },
  listSubContainer: {
    flexWrap: 'wrap',
    marginTop: hp(15),
    marginBottom: hp(5),
    flexDirection: 'row',
  },
});

export default LabelsEditor;
