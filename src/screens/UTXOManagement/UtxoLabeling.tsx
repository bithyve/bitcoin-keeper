/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/function-component-definition */
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { FlatList, Box, Text, Input, ScrollView } from 'native-base';
import { StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import Buttons from 'src/components/Buttons';
import { hp, windowWidth, wp } from 'src/common/data/responsiveness/responsive';
import KeeperModal from 'src/components/KeeperModal';

const UtxoLabels = [
    {
        id: 1,
        label: 'Work Expenses'
    },
    {
        id: 2,
        label: 'Salary Txns'
    },
    {
        id: 3,
        label: 'Petty Cash'
    },
    {
        id: 4,
        label: 'Family'
    },
    {
        id: 5,
        label: 'Personal'
    },
    {
        id: 6,
        label: 'Traveling'
    },
]
const labelRenderItem = ({ item }) => (
    <Box style={styles.itemWrapper}>
        <Box>
            <Text>{item.label}</Text>
        </Box>
        <Box>
            <Text>X</Text>
        </Box>
    </Box>
)


function UtxoLabeling() {
    const navigation = useNavigation();
    const [label, setLabel] = useState('')
    const [addLabelModal, setAddLabelModal] = useState(false)

    const closeLabelModal = () => {
        setAddLabelModal(false)
    }
    function AddLabelInput() {
        return (
            <Box>
                <Input
                    onChangeText={(text) => {
                        setLabel(text)
                    }}
                    style={styles.inputLabelBox}
                    width={wp(300)}
                    height={hp(40)}
                    placeholderTextColor="#2F2F2F"
                    placeholder="Enter label Word"
                    color="#000000"
                    backgroundColor="light.primaryBackground"
                    value={label}
                    autoCorrect={false}
                />
            </Box>
        )
    }
    return (
        <ScreenWrapper>
            <HeaderTitle
                title="Select UTXOs Label"
                subtitle="Lorem ipsum sit"
                onPressHandler={() => navigation.goBack()}
            />
            <TouchableOpacity style={styles.addnewWrapper} onPress={() => setAddLabelModal(true)}>
                <Box style={[styles.addNewIcon, { backgroundColor: 'rgba(7,62,57,1)' }]}>
                    <Text style={styles.plusText}>+</Text>
                </Box>
                <Box>
                    <Text style={styles.addnewText}>Add new label</Text>
                </Box>
            </TouchableOpacity>
            <FlatList
                style={{ marginTop: 20 }}
                data={UtxoLabels}
                renderItem={labelRenderItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
            />
            <Box style={styles.ctaBtnWrapper}>
                <Box ml={windowWidth * -0.09}>
                    <Buttons
                        primaryText="Save Changes"
                    />
                </Box>
            </Box>
            <KeeperModal
                visible={addLabelModal}
                close={closeLabelModal}
                title="Add New Label"
                subTitle="Lorem ipsum sit"
                buttonText="Add"
                buttonTextColor="light.white"
                textColor="light.primaryText"
                Content={AddLabelInput}
                justifyContent="center"
            />
        </ScreenWrapper>
    )
}

const styles = StyleSheet.create({
    scrollViewWrapper: {
        flex: 1,
    },
    itemWrapper: {
        flexDirection: 'row',
        backgroundColor: '#FDF7F0',
        justifyContent: 'space-between',
        marginVertical: 5,
        borderRadius: 10,
        padding: 20
    },
    ctaBtnWrapper: {
        marginBottom: hp(5),
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    addnewWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: hp(30),
        marginBottom: hp(10),
    },
    addNewIcon: {
        height: 25,
        width: 25,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10
    },
    addnewText: {
        fontSize: 16,
        fontWeight: '400'
    },
    plusText: {
        fontSize: 18,
        color: 'white'
    },
    inputLabelBox: {
        borderRadius: 10,
        borderWidth: 0,
        fontSize: 13,
        fontWeight: "bold"
    }
})

export default UtxoLabeling