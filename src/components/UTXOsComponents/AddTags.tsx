import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Box, Input, KeyboardAvoidingView } from 'native-base';
// import { useDispatch } from 'react-redux';

import DeleteCross from 'src/assets/images/deletelabel.svg';
import Done from 'src/assets/images/selected.svg';
import { LabelType } from 'src/core/wallets/enums';
// import { bulkUpdateLabels } from 'src/store/sagaActions/utxos';
// import useLabels from 'src/hooks/useLabels';
// import { useRoute } from '@react-navigation/native';
// import { UTXO } from 'src/core/wallets/interfaces';
import { hp, windowWidth } from 'src/common/data/responsiveness/responsive';

import Buttons from '../Buttons';
import Text from '../KeeperText';
import ScreenWrapper from '../ScreenWrapper';

function AddTags() {
    // const dispatch = useDispatch();
    // const {
    //     params: { utxo },
    // } = useRoute() as { params: { utxo: UTXO; wallet: any } };

    const [existingLabels, setExistingLabels] = useState([]);
    const [editingIndex, setEditingIndex] = useState(-1);
    const [label, setLabel] = useState('');
    // const { labels } = useLabels(null);
    // const lablesUpdated =
    //     labels[`${utxo.txId}${utxo.vout}`].reduce((a, c) => {
    //         a += c.name;
    //         return a;
    //     }, '') !==
    //     existingLabels.reduce((a, c) => {
    //         a += c.name;
    //         return a;
    //     }, '');

    useEffect(() => {
        // setExistingLabels(labels ? labels[`${utxo.txId}${utxo.vout}`] || [] : []);
    }, []);

    const onCloseClick = (index) => {
        existingLabels.splice(index, 1);
        setExistingLabels([...existingLabels]);
    };
    const onEditClick = (item, index) => {
        setLabel(item.name);
        setEditingIndex(index);
    };

    const onAdd = () => {
        if (editingIndex !== -1) {
            existingLabels[editingIndex] = { name: label, type: LabelType.USER };
        } else {
            existingLabels.push({ name: label, type: LabelType.USER });
        }
        setEditingIndex(-1);
        setExistingLabels(existingLabels);
        setLabel('');
    };

    const onSaveChangeClick = () => {
        // const finalLabels = existingLabels.filter(
        //     (label) => !(label.type === LabelType.SYSTEM && label.name === wallet.presentationData.name) // ignore the wallet label since they are internal references
        // );
        // dispatch(bulkUpdateLabels({ labels: finalLabels, UTXO: utxo }));
    };
    return (
        <ScreenWrapper>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : null}
                enabled
                keyboardVerticalOffset={Platform.select({ ios: 8, android: 500 })}
                style={styles.scrollViewWrapper}
            >
                <View style={styles.listContainer}>
                    <View>
                        <Text style={styles.listHeader}>Labels</Text>
                    </View>
                    <View style={styles.listSubContainer}>
                        {existingLabels.map((item, index) => (
                            <View
                                key={`${item}`}
                                style={[
                                    styles.labelView,
                                    {
                                        backgroundColor: item.type === LabelType.SYSTEM ? '#23A289' : ((editingIndex !== index) ? '#E0B486' : '#A88763'),
                                    },
                                ]}
                            >
                                <TouchableOpacity
                                    style={styles.labelEditContainer}
                                    activeOpacity={item.type === LabelType.USER ? 0.5 : 1}
                                    onPress={() => (item.type === LabelType.USER ? onEditClick(item, index) : null)}
                                >
                                    <Text style={styles.itemText} bold>
                                        {item.name.toUpperCase()}
                                    </Text>
                                    {item.type === LabelType.USER ? (
                                        <TouchableOpacity onPress={() => onCloseClick(index)} style={styles.deleteContainer}>
                                            <DeleteCross />
                                        </TouchableOpacity>
                                    ) : null}
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                    <Box style={styles.inputLabeWrapper}>
                        <Box style={styles.inputLabelBox}>
                            <Input
                                onChangeText={(text) => {
                                    setLabel(text);
                                }}
                                style={styles.inputLabel}
                                borderWidth={0}
                                height={hp(40)}
                                placeholder="Type to add label or Select to edit"
                                color="#E0B486"
                                value={label}
                                autoCorrect={false}
                                autoCapitalize="characters"
                            />
                        </Box>
                        <TouchableOpacity style={styles.addBtnWrapper} onPress={onAdd}>
                            <Done />
                        </TouchableOpacity>
                    </Box>
                </View>
            </KeyboardAvoidingView>
            <Box style={styles.ctaBtnWrapper}>
                <Box ml={windowWidth * -0.09}>
                    <Buttons
                        primaryDisable={false}
                        primaryCallback={onSaveChangeClick}
                        primaryText="Confirm"
                        // secondaryCallback={}
                        secondaryText="Cancel"
                    />
                </Box>
            </Box>
        </ScreenWrapper>
    )
}
const styles = StyleSheet.create({
    scrollViewWrapper: {
        flex: 1,
    },
    listHeader: {
        flex: 1,
        color: '#00715B',
        fontSize: 14,
    },
    listContainer: {
        padding: 6,
        backgroundColor: '#FDF7F0',
        borderRadius: 10,
    },
    labelView: {
        borderRadius: 5,
        padding: 4,
        flexDirection: 'row',
        marginTop: 15,
        marginEnd: 10,
    },
    listSubContainer: {
        flexWrap: 'wrap',
        marginBottom: 20,
        flexDirection: 'row',
    },
    labelEditContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemText: {
        color: '#fff',
        fontSize: 11,
    },
    deleteContainer: {
        paddingHorizontal: 4,
    },
    inputLabeWrapper: {
        flexDirection: 'row',
        height: 50,
        width: '100%',
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: '#F7F2EC',
    },
    inputLabelBox: {
        width: '88%',
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '900',
    },
    addBtnWrapper: {
        width: '10%',
    },
    ctaBtnWrapper: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
})
export default AddTags