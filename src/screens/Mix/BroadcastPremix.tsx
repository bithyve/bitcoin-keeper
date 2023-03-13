// create placeholder ui screen for utxo selection

import { Box } from 'native-base';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import UtxoSummary from './UtxoSummary';
import PageIndicator from 'src/components/PageIndicator';
import KeeperModal from 'src/components/KeeperModal';

const utxos = [{ transactionId: 1, amount: 0.0001 },
{ transactionId: 2, amount: 0.0001 },
{ transactionId: 3, amount: 0.0001 },
{ transactionId: 4, amount: 0.0001 },
{ transactionId: 5, amount: 0.0001 },
]

const broadcastModalContent = (onBroadcastModalCallback) => {
    return (
        <Box>
            <Box>
                <Text color="light.secondaryText" style={styles.textWidth}>Premix, Postmix, Bad bank</Text>
            </Box>
            <Box style={styles.modalFooter}>
                <Buttons
                    primaryText="Proceed"
                    primaryCallback={() => onBroadcastModalCallback()}
                />
            </Box>
        </Box>
    )
}

export default function BroadcastPremix() {
    const navigation = useNavigation();
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);

    useEffect(() => {

    }, []);

    const onBroadcastPremix = () => {
        setShowBroadcastModal(true);
    }

    const closeBroadcastModal = async () => {
        setShowBroadcastModal(false);
    };

    const onBroadcastModalCallback = () => {
        setShowBroadcastModal(false);
        navigation.navigate('WalletDetails');
    }

    return (
        <ScreenWrapper backgroundColor="light.mainBackground" barStyle="dark-content">
            <HeaderTitle
                paddingLeft={25}
                title="Broadcast Premix Transaction"
                subtitle="Your premix transaction is ready to be broadcast. Please review the details below and click the button to broadcast your transaction."
            />
            <UtxoSummary utxoCount={4} totalAmount={0.001} />
            <Box style={styles.textArea}>
                <Text color='#017963' style={styles.textWidth}>Whirlpool Fee</Text>
                <Text color="light.secondaryText">5</Text>
            </Box>
            <Box style={styles.textArea}>
                <Text color='#017963' style={styles.textWidth}>Badbank Change</Text>
                <Text color="light.secondaryText">0.05</Text>
            </Box>
            {utxos && utxos.map((utxo, index) => {
                return (
                    <Box style={styles.textArea}>
                        <Text color='#017963' style={styles.textWidth}>Premix #{index + 1}</Text>
                        <Text color="light.secondaryText">{utxo.amount}</Text>
                    </Box>
                )
            })
            }
            <Box style={styles.textArea}>
                <Text color='#017963' style={styles.textWidth}>Fee</Text>
                <Text color="light.secondaryText">5 Utxos</Text>
            </Box>
            <Box style={styles.footerContainer}>
                <Box style={styles.border} borderColor="light.GreyText" />
                <Box style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Box style={{ alignSelf: 'center', paddingBottom: 4, paddingLeft: 20 }}><PageIndicator currentPage={2} totalPage={2} /></Box>
                    <Box style={styles.footerItemContainer}>
                        <Buttons
                            primaryText="Broadcast Premix"
                            primaryCallback={() => onBroadcastPremix()}
                        />
                    </Box>
                </Box>
            </Box>
            <KeeperModal
                justifyContent='flex-end'
                visible={showBroadcastModal}
                close={closeBroadcastModal}
                title="Broadcast Premix"
                subTitle="Please review the details below and click the button to broadcast your transaction."
                subTitleColor="#5F6965"
                modalBackground={['#F7F2EC', '#F7F2EC']}
                buttonBackground={['#00836A', '#073E39']}
                buttonText=""
                buttonTextColor="#FAFAFA"
                buttonCallback={closeBroadcastModal}
                closeOnOverlayClick={false}
                Content={() => broadcastModalContent(onBroadcastModalCallback)}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    textArea: {
        marginTop: 20,
        marginLeft: 50,
        flexDirection: 'row',
    },
    textWidth: {
        width: '50%'
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
    modalFooter: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
        marginBottom: 10,
    }
});