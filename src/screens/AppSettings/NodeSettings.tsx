import { Box } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, FlatList } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { hp } from 'src/common/data/responsiveness/responsive';
import { LocalizationContext } from 'src/common/content/LocContext';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { setConnectToMyNode, setNodeDetails } from 'src/store/reducers/settings';
import { NodeDetail } from 'src/core/wallets/interfaces';
import HeaderTitle from 'src/components/HeaderTitle';
import Note from 'src/components/Note/Note';
import ScreenWrapper from 'src/components/ScreenWrapper';
import Switch from 'src/components/Switch/Switch';
import AddIcon from 'src/assets/images/svgs/icon_add_plus.svg';
import KeeperModal from 'src/components/KeeperModal';
import AddNode from './AddNodeModal';


function NodeSettings() {
    const dispatch = useAppDispatch();
    const { translations } = useContext(LocalizationContext);
    const { common } = translations;
    const { settings } = translations;
    const { connectToMyNodeEnabled, nodeDetails } = useAppSelector((state) => state.settings);
    const [nodeList, setNodeList] = useState(nodeDetails || []);
    const [ConnectToNode, setConnectToNode] = useState(connectToMyNodeEnabled);
    const [visible, setVisible] = useState(false);
    const [selectedNodeItem, setSelectedNodeItem] = useState(null);

    useEffect(() => {
        setNodeList(nodeList);
    }, []);

    const openAddNodeModal = () => {
        setVisible(true);
    }

    const closeAddNodeModal = () => {
        if (nodeList.length == 0 || nodeList.filter(item => item.isConnected == true).length == 0) {
            setConnectToNode(false);
            dispatch(setConnectToMyNode(false));
        }
        setVisible(false);
    };

    const onSave = async (nodeDetail: NodeDetail) => {
        if (nodeDetail.host == null || nodeDetail.host.length == 0 || nodeDetail.port == null || nodeDetail.port.length == 0)
            return;

        let nodes = [...nodeList];

        if (nodeDetail.id == null) {
            nodeDetail.id = nodeList.length + 1;
            nodes.push(nodeDetail);
        }
        else {
            const index = nodes.findIndex(item => item.id == nodeDetail.id);
            nodes[index] = nodeDetail;
        }
        setNodeList(nodes);
        dispatch(setNodeDetails(nodes));
        closeAddNodeModal();
    }

    const onAdd = () => {
        setSelectedNodeItem(null);
        openAddNodeModal();
    }

    const onEdit = async (selectedItem: NodeDetail) => {
        setSelectedNodeItem(selectedItem);
        openAddNodeModal();
    }

    const onConnectToNode = async (selectedItem: NodeDetail) => {
        // TODO: Connect the node to electrum client logic goes here
    }

    const onHandleNodeItemSelection = (selectedItem: NodeDetail) => {
        setSelectedNodeItem(selectedItem);
    }

    const onChangeConnectToMyNode = (value: boolean) => {
        setConnectToNode(value);
        dispatch(setConnectToMyNode(value));
        if (value)
            openAddNodeModal();
    }

    const paramsToPass: NodeDetail = {
        id: selectedNodeItem?.id || null,
        host: selectedNodeItem?.host || '',
        port: selectedNodeItem?.port || '',
        useKeeperNode: selectedNodeItem?.useKeeperNode || false,
        isConnected: selectedNodeItem?.isConnected || false,
    }

    return (
        <ScreenWrapper barStyle="dark-content">
            <HeaderTitle />
            <Box style={styles.appSettingTitleWrapper}>
                <Box w="70%">
                    <Text style={[styles.appSettingTitle, { color: '#017963' }]}>{settings.nodeSettings}</Text>
                    <Text style={styles.appSettingSubTitle}>{settings.nodeSettingUsedSoFar}</Text>
                </Box>
            </Box>
            <Box style={styles.nodeConnectSwitchWrapper}>
                <Box w="70%">
                    <Text style={styles.connectToMyNodeTitle}>{settings.connectToMyNode}</Text>
                    <Text style={styles.appSettingSubTitle}>{settings.connectToMyNodeSubtitle}</Text>
                </Box>
                <Box>
                    <Switch value={ConnectToNode} onValueChange={onChangeConnectToMyNode} />
                </Box>
            </Box>
            <Box borderColor="light.GreyText" style={styles.splitter}></Box>
            <Box style={styles.nodeListHeader}>
                <Text style={styles.nodeListTitle}>{settings.nodesUsedPreviously}</Text>
            </Box>
            <Box style={styles.nodesListWrapper}>
                <FlatList
                    data={nodeList}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => onHandleNodeItemSelection(item)}
                            style={item.id === selectedNodeItem?.id ? [styles.selectedItem, { borderColor: '#017963' }] : null} >
                            <Box backgroundColor="light.lightYellow" style={styles.nodeList}>
                                <Box style={styles.nodeDetail}>
                                    <Text style={[styles.nodeTextHeader, { color: '#4F5955' }]}>{settings.host}</Text>
                                    <Text style={styles.nodeTextValue}>{item.host}</Text>
                                    <Text style={[styles.nodeTextHeader, { color: '#4F5955' }]}>{settings.portNumber}</Text>
                                    <Text style={styles.nodeTextValue}>{item.port}</Text>
                                </Box>
                                <TouchableOpacity onPress={() => onEdit(item)}>
                                    <Text style={[styles.editText, { color: '#017963' }]}>{common.edit}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={onConnectToNode}>
                                    <Box borderColor="light.brownborder"
                                        backgroundColor="light.yellow2"
                                        style={styles.connectButton}>
                                        <Text>{common.connect}</Text>
                                    </Box>
                                </TouchableOpacity>
                            </Box>
                        </TouchableOpacity>
                    )}
                />
            </Box>
            <TouchableOpacity onPress={onAdd}>
                <Box backgroundColor="light.lightYellow" style={styles.addNewNode}>
                    <AddIcon />
                    <Text style={styles.addNewNodeText}>{settings.addNewNode}</Text>
                </Box>
            </TouchableOpacity>
            <Box style={styles.note} backgroundColor={'light.ReceiveBackground'}>
                <Note
                    title={common.note}
                    subtitle={settings.nodeSettingsNote}
                />
            </Box>
            <KeeperModal
                visible={visible}
                close={closeAddNodeModal}
                title={settings.nodeDetailsTitle}
                subTitle={settings.nodeDetailsSubtitle}
                subTitleColor="#5F6965"
                modalBackground={['#F7F2EC', '#F7F2EC']}
                buttonBackground={['#00836A', '#073E39']}
                buttonText=""
                buttonTextColor="#FAFAFA"
                buttonCallback={closeAddNodeModal}
                textColor="#041513"
                closeOnOverlayClick={false}
                Content={() => AddNode(paramsToPass, onSave)}
            />
        </ScreenWrapper >
    );
}
const styles = StyleSheet.create({
    appSettingTitleWrapper: {
        marginHorizontal: 50,
        marginBottom: 4,
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
    },
    nodeConnectSwitchWrapper: {
        marginHorizontal: 50,
        marginBottom: 4,
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        marginTop: 30,
    },
    appSettingTitle: {
        fontSize: RFValue(18),
        fontWeight: '400',
        letterSpacing: 1.2,
        paddingBottom: 5
    },
    appSettingSubTitle: {
        fontSize: RFValue(12),
        fontWeight: '300',
        letterSpacing: 0.6,
    },
    connectToMyNodeTitle: {
        fontSize: RFValue(18),
        fontWeight: '300',
        letterSpacing: 0.5,
        paddingBottom: 5
    },
    note: {
        position: 'absolute',
        bottom: hp(35),
        marginLeft: 26,
        width: '100%',
        paddingTop: hp(10),
    },
    splitter: {
        marginTop: 35,
        marginBottom: 25,
        borderBottomWidth: 0.2,
    },
    nodesListWrapper: {
        marginBottom: 4,
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        maxHeight: 250
    },
    nodeListTitle: {
        fontSize: RFValue(16),
        fontWeight: '300',
        letterSpacing: 0.5,
    },
    nodeListHeader: {
        marginHorizontal: 30,
        marginBottom: 15,
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
    },
    nodeDetail: {
        width: '50%',
        padding: 10
    },
    nodeList: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 4,
        alignItems: 'center',
        borderRadius: 5,
        justifyContent: 'space-between'
    },
    selectedItem: {
        borderWidth: 1,
        borderRadius: 5
    },
    editText: {
        fontSize: RFValue(12),
        letterSpacing: 0.6,
        fontWeight: '600'
    },
    connectButton: {
        fontSize: RFValue(11),
        letterSpacing: 0.6,
        padding: 5,
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 5,
        marginRight: 25
    },
    nodeTextHeader: {
        marginHorizontal: 20,
        fontSize: RFValue(11),
        letterSpacing: 0.6,
        paddingTop: 2,
        paddingBottom: 2
    },
    nodeTextValue: {
        fontSize: RFValue(12),
        letterSpacing: 0.6,
        marginHorizontal: 20,
        paddingTop: 2,
        paddingBottom: 5
    },
    addNewNode: {
        marginTop: 10,
        paddingTop: 10,
        paddingBottom: 10,
        borderRadius: 5,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%'
    },
    addNewNodeText: {
        fontSize: RFValue(15),
        fontWeight: '300',
        letterSpacing: 0.6,
        paddingLeft: 10
    },
});

export default NodeSettings;