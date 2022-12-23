import { Box, Input, Text } from 'native-base';
import { View, StyleSheet } from 'react-native';
import React, { useContext, useState } from 'react';

import { wp, hp } from 'src/common/data/responsiveness/responsive';
import { LocalizationContext } from 'src/common/content/LocContext';
import { NodeDetail } from 'src/core/wallets/interfaces';
import CheckBox from 'src/components/Checkbox';
import Buttons from 'src/components/Buttons';
import Switch from 'src/components/Switch/Switch';

function AddNode(params: NodeDetail, onSaveCallback: (nodeDetails: NodeDetail) => void) {
    const { translations } = useContext(LocalizationContext);
    const { common } = translations;
    const { settings } = translations;

    const [useKeeperNode, setuseKeeperNode] = useState(params?.useKeeperNode);
    const [useSSL, setUseSSL] = useState(params?.useSSL);
    const [host, setHost] = useState(params?.host);
    const [port, setPort] = useState(params?.port);
    const [isHostValid, setIsHostValid] = useState(true);
    const [isPortValid, setIsPortValid] = useState(true);

    const onValidateAndSave = () => {
        if (host == null || host.length == 0) {
            setIsHostValid(false);
        }

        if (port == null || port.length == 0) {
            setIsPortValid(false);
        }

        if (isHostValid && isPortValid) {
            const nodeDetails: NodeDetail = {
                id: params.id, host: host, port: port, useKeeperNode: useKeeperNode, isConnected: params.isConnected, useSSL: useSSL
            };
            onSaveCallback(nodeDetails);
        }
    }

    return (
        <View style={styles.container}>
            <Box style={styles.box}>
                <Box style={!isHostValid ? [styles.error, { borderColor: '#ff0033' }] : null}>
                    <Input placeholderTextColor="grey"
                        backgroundColor="light.lightYellow"
                        placeholder={settings.host}
                        borderRadius={5}
                        height="12"
                        value={host}
                        autoCorrect={false}
                        autoComplete="off"
                        keyboardType="name-phone-pad"
                        onChangeText={(text) => {
                            setIsHostValid(text == null || text.length == 0 ? false : true);
                            setHost(text);
                        }}
                    />
                </Box>
                <Box style={styles.spacer} />
                <Box style={[styles.port, !isPortValid ? [styles.error, { borderColor: '#ff0033' }] : null]}>
                    <Box w="55%">
                        <Input placeholderTextColor="grey"
                            backgroundColor="light.lightYellow"
                            placeholder={settings.portNumberPlaceholder}
                            keyboardType="number-pad"
                            borderRadius={5}
                            height="12"
                            value={port}
                            autoCorrect={false}
                            autoComplete="off"
                            onChangeText={(text) => {
                                setIsPortValid(text == null || text.length == 0 ? false : true);
                                setPort(text);
                            }}
                        />
                    </Box>
                    <Box style={styles.useSSL}>
                        <Text style={styles.useSSLText}>{settings.useSSL}</Text>
                        <Switch value={useSSL} onValueChange={(value) => setUseSSL(value)} />
                    </Box>
                </Box>
                <Box style={styles.checkbox}>
                    <CheckBox
                        onPress={() => {
                            setuseKeeperNode(!useKeeperNode);
                        }}
                        title={settings.useKeeperNode}
                        isChecked={useKeeperNode}
                    />
                </Box>
                <Box style={styles.saveButton}>
                    <Buttons
                        primaryText={common.save}
                        primaryCallback={() => onValidateAndSave()}
                    />
                </Box>
            </Box>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 0,
        width: '100%',
        flexDirection: 'row',
    },
    box: {
        width: '100%'
    },
    spacer: {
        marginTop: 10
    },
    checkbox: {
        paddingTop: 15,
        marginBottom: 25
    },
    saveButton: {
        alignSelf: 'flex-end'
    },
    cta: {
        borderRadius: 10,
        width: wp(110),
        height: hp(45),
        justifyContent: 'center',
        alignItems: 'center',
    },
    ctaText: {
        fontSize: 13,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    error: {
        borderWidth: 2,
        borderRadius: 7
    },
    port: {
        flexDirection: 'row',
    },
    useSSL: {
        flexDirection: 'row',
        paddingLeft: 15,
        paddingTop: 5
    },
    useSSLText: {
        paddingTop: 7,
        paddingRight: 10
    }
})

export default AddNode;