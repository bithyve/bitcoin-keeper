
import { Box, Input } from 'native-base';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import KeeperModal from 'src/components/KeeperModal';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import { TouchableOpacity } from 'react-native-gesture-handler';
import UtxoSummary from './UtxoSummary';
import PageIndicator from 'src/components/PageIndicator';
import { useAppSelector } from 'src/store/hooks';
import openLink from 'src/utils/OpenLink';
import { setWhirlpoolModal } from 'src/store/reducers/wallets';
import { useDispatch } from 'react-redux';
import config from 'src/core/config';
import { TxPriority } from 'src/core/wallets/enums';
import { AverageTxFees } from 'src/core/wallets/interfaces';

const feesContent = (fees, onFeeSelectionCallback) => {
    return (
        <Box style={styles.feeContent}>
            <Box style={styles.feeHeaderItem}>
                <Text style={styles.feeItemHeader}>Priority</Text>
                <Text style={styles.feeItemHeader}>Arrival Time</Text>
                <Text style={styles.feeItemHeader}>Fee</Text>
            </Box>
            {fees && fees.map((fee) => {
                return (
                    <TouchableOpacity onPress={() => onFeeSelectionCallback(fee)}>
                        <Box style={styles.feeItem}>
                            <Text style={styles.feeItemText}>{fee?.priority}</Text>
                            <Text style={styles.feeItemText}>{fee?.time}</Text>
                            <Text style={styles.feeItemText}>{fee?.fee} {fee?.fee > 1 ? "sats" : "sat"}/vB</Text>
                        </Box>
                        <Box style={styles.feeItemBorder} />
                    </TouchableOpacity>
                )
            })}
        </Box>
    )
}

function WhirlpoolContent() {
    return (
        <View>
            <Text>Whirlpool content</Text>
        </View>
    );
}

export default function WhirlpoolConfiguration() {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const whirlpoolModal = useAppSelector((state) => state.wallet.whirlpoolModal) || false;
    const averageTxFees: AverageTxFees = useAppSelector((state) => state.network.averageTxFees);
    const [fees, setFees] = useState([]);
    const [showWhirlpoolModal, setShowWhirlpoolModal] = useState(false);
    const networkType = config.NETWORK_TYPE;

    const [showFee, setShowFee] = useState(false);
    const [scode, setScode] = useState('');
    const [selectedFee, setSelectedFee] = useState(null);

    useEffect(() => {
        if (whirlpoolModal) {
            setShowWhirlpoolModal(true);
        }

        getFees(averageTxFees[networkType]);
    }, []);

    const getFees = (fees: AverageTxFees) => {
        if (fees) {
            const feeStructure = [];
            feeStructure.push(
                {
                    priority: TxPriority.HIGH,
                    time: '10 -20 minutes',
                    fee: fees[TxPriority.HIGH].feePerByte,
                },
                {
                    priority: TxPriority.MEDIUM,
                    time: '20 - 40 minutes',
                    fee: fees[TxPriority.MEDIUM].feePerByte,
                },
                {
                    priority: TxPriority.LOW,
                    time: '20 - 40 minutes',
                    fee: fees[TxPriority.LOW].feePerByte,
                }
            );

            setFees(feeStructure);
            setSelectedFee(feeStructure[0]);
        }
    };

    const closeFeeSelectionModal = async () => {
        setShowFee(false);
    };

    const onProceed = () => {
        navigation.navigate('PoolSelection', { scode, fee: selectedFee });
    }

    const onFeeSelectionCallback = (fee) => {
        setSelectedFee(fee);
        console.log(fee);
        setShowFee(false);
    }

    return (
        <ScreenWrapper backgroundColor="light.mainBackground" barStyle="dark-content">
            <HeaderTitle
                paddingLeft={25}
                title="Configure Whirlpool"
                subtitle="Configure Whirlpool using the fields below. You can enter a Samurai SCODE for reduced cost mixing."
            />
            <UtxoSummary utxoCount={4} totalAmount={0.001} />

            <Box style={styles.scode}>
                <Input
                    placeholderTextColor="grey"
                    backgroundColor="light.primaryBackground"
                    placeholder="Enter SCODE"
                    borderRadius={10}
                    borderWidth={0}
                    height="12"
                    fontSize={13}
                    value={scode}
                    autoCorrect={false}
                    autoComplete="off"
                    onChangeText={(text) => {
                        setScode(text);
                    }}
                />
            </Box>
            <Box style={styles.feeSelection}>
                <Box style={styles.feeDetail}>
                    <Box style={styles.column}>
                        <Text style={styles.feeHeader}>Priority</Text>
                        <Text style={styles.feeValue}>{selectedFee?.priority}</Text>
                    </Box>
                    <Box style={styles.column}>
                        <Text style={styles.feeHeader}>Arrival Time</Text>
                        <Text style={styles.feeValue}>{selectedFee?.time}</Text>
                    </Box>
                    <Box style={styles.column}>
                        <Text style={styles.feeHeader}>Fee</Text>
                        <Text style={styles.feeValue}>{selectedFee?.fee} {selectedFee?.fee > 1 ? "sats" : "sat"}/vB</Text>
                    </Box>
                </Box>
            </Box>
            <Box backgroundColor="light.primaryBackground" style={styles.changePriority}>
                <TouchableOpacity onPress={() => setShowFee(true)}>
                    <Box style={styles.changePriorityDirection}>
                        <Text style={styles.changePriorityText}>Change Priority</Text>
                        <RightArrowIcon />
                    </Box>
                </TouchableOpacity>
            </Box>
            <Box style={styles.footerContainer}>
                <Box style={styles.border} borderColor="light.GreyText" />
                <Box style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Box style={{ alignSelf: 'center', paddingBottom: 4, paddingLeft: 20 }}><PageIndicator currentPage={0} totalPage={2} /></Box>
                    <Box style={styles.footerItemContainer}>
                        <Buttons
                            primaryText="Proceed"
                            primaryCallback={() => onProceed()}
                        />
                    </Box>
                </Box>
            </Box>
            <KeeperModal
                justifyContent='flex-end'
                visible={showFee}
                close={closeFeeSelectionModal}
                title="Change Priority"
                subTitle="Select a priority for your transaction"
                subTitleColor="#5F6965"
                modalBackground={['#F7F2EC', '#F7F2EC']}
                buttonBackground={['#00836A', '#073E39']}
                buttonText=""
                buttonTextColor="#FAFAFA"
                buttonCallback={closeFeeSelectionModal}
                closeOnOverlayClick={false}
                Content={() => feesContent(fees, onFeeSelectionCallback)}
            />

            <KeeperModal
                visible={showWhirlpoolModal}
                close={() => {
                    setShowWhirlpoolModal(false);
                    dispatch(setWhirlpoolModal(false));
                }}
                title="Whirlpool"
                subTitle="Mix transactions to improve privacy and obfuscate your transaction history"
                modalBackground={['light.gradientStart', 'light.gradientEnd']}
                textColor="light.white"
                Content={WhirlpoolContent}
                DarkCloseIcon
                learnMore
                learnMoreCallback={() => openLink('https://www.bitcoinkeeper.app/')}
            />
        </ScreenWrapper >
    );
}

const styles = StyleSheet.create({
    scode: {
        marginTop: 20,
        marginLeft: 40,
    },
    feeSelection: {
        marginLeft: 40,
        marginTop: 40,
        padding: 10,
        borderRadius: 10,
    },
    feeDetail: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    column: {
        flexDirection: 'column',
        marginLeft: 0,
        marginTop: 10,
    },
    feeHeader: {
        fontSize: 12,
        color: '#656565',
    },
    feeValue: {
        marginTop: 5,
        fontSize: 12,
        color: '#656565',
    },
    changePriority: {
        marginLeft: 40,
        borderRadius: 10,
    },
    changePriorityDirection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 20
    },
    changePriorityText: {
        color: '#00836A',
        fontSize: 15,
        fontStyle: 'italic',
        padding: 10,
    },
    arrowIcon: {
        marginBottom: 5,
        alignItems: 'flex-start',
        marginRight: 20
    },
    footerContainer: {
        position: 'absolute',
        bottom: 0,
        width: wp(375),
        paddingHorizontal: 5,
    },
    border: {
        borderWidth: 0.5,
        borderRadius: 20,
        opacity: 0.2,
    },
    footerItemContainer: {
        flexDirection: 'row',
        marginTop: windowHeight > 800 ? 5 : 5,
        marginBottom: windowHeight > 800 ? hp(10) : 0,
        paddingBottom: 15,
        justifyContent: 'flex-end',
        marginHorizontal: 16,
    },

    feeContent: {
        width: '100%',
    },
    feeHeaderItem: {
        width: '90%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
    },
    feeItemHeader: {
        color: '#656565',
        fontSize: 13,
        textAlign: 'left',
        width: 120,
    },

    feeItem: {
        width: '80%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        marginBottom: 2,
        marginTop: 2,
    },
    feeItemBorder: {
        width: '80%',
        borderWidth: 0.5,
        borderColor: '#005545',
        opacity: 0.5
    },
    feeItemText: {
        color: '#656565',
        width: 120,
        fontSize: 13,
        textAlign: 'left',
    },
});