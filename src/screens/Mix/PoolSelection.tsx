
import { Box } from 'native-base';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import KeeperModal from 'src/components/KeeperModal';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useAppSelector } from 'src/store/hooks';
import { SatsToBtc } from 'src/common/constants/Bitcoin';
import UtxoSummary from './UtxoSummary';
import PageIndicator from 'src/components/PageIndicator';
import Fonts from 'src/common/Fonts';
import { mixingPools } from './tempPoolData';

const poolContent = (pools, onPoolSelectionCallback, satsEnabled) => {
    return (
        <Box style={styles.poolContent}>
            {pools && pools.map((pool) => {
                return (
                    <TouchableOpacity onPress={() => onPoolSelectionCallback(pool)}>
                        <Box style={styles.poolItem}>
                            <Text style={styles.poolItemText} color='#073e39'>{satsEnabled ? pool?.denomination : SatsToBtc(pool?.denomination)}</Text>
                            <Text style={styles.poolItemUnitText} color='#073e39'>{satsEnabled ? 'sats' : 'btc'}</Text>
                        </Box>
                    </TouchableOpacity>
                )
            })}
        </Box>
    )
}

export default function PoolSelection({ route, navigation }) {
    const { scode, fee } = route.params;
    const [showPools, setShowPools] = useState(false);
    const [availablePools, setAvailablePools] = useState([]);
    const [selectedPool, setSelectedPool] = useState('');
    const [poolSelectionText, setPoolSelectionText] = useState('');
    const { satsEnabled } = useAppSelector((state) => state.settings);

    useEffect(() => {
        setPools();
        console.log(scode, fee)
    }, []);

    const setPools = async () => {
        try {
            setPoolSelectionText('Fetching Pools...');
            const response: any = await mixingPools();
            setAvailablePools(response?.sort((a, b) => a.denomination - b.denomination));
            setPoolSelectionText('Select Pool');
        } catch (error) {
            console.log(error);
        }
    };

    const closePoolSelectionModal = async () => {
        setShowPools(false);
    };

    const onPreviewMix = () => {
        navigation.navigate('BroadcastPremix');
    }

    const onPoolSelectionCallback = (pool) => {
        setSelectedPool(pool);
        console.log(pool);
        setShowPools(false);
    }
    return (
        <ScreenWrapper backgroundColor="light.mainBackground" barStyle="dark-content">
            <HeaderTitle
                paddingLeft={25}
                title="Selecting Pool"
                subtitle="Choose which pool to use below. You will then be able to preview your premix transaction."
            />
            <UtxoSummary utxoCount={4} totalAmount={0.001} />
            <Box backgroundColor="light.primaryBackground" style={styles.poolSelection}>
                <Text color='#017963'>Pool</Text>
                <TouchableOpacity onPress={() => setShowPools(true)}>
                    <Box style={{ flexDirection: 'row' }}>
                        <Box style={styles.poolTextDirection}>
                            <Text style={styles.poolText}>{
                                selectedPool
                                    ? (satsEnabled ? selectedPool?.denomination : SatsToBtc(selectedPool?.denomination))
                                    : poolSelectionText}
                            </Text>
                            <Text style={styles.denominatorText}>{selectedPool ? (satsEnabled && selectedPool?.denomination ? 'sats' : 'btc') : ''}</Text>
                        </Box>
                        <Box style={styles.arrowIcon}> <RightArrowIcon /></Box>
                    </Box>
                </TouchableOpacity>
            </Box>
            <Box style={styles.textArea}>
                <Text color='#017963'>Anonset</Text>
                <Text color="light.secondaryText">{selectedPool?.min_anonymity_set || '--'}</Text>
            </Box>
            <Box style={styles.textArea}>
                <Text color='#017963'>Pool Fee</Text>
                <Box style={styles.poolTextDirection}>
                    <Text color="light.secondaryText">{
                        selectedPool ?
                            (satsEnabled ? selectedPool?.fee_value : SatsToBtc(selectedPool?.fee_value))
                            : ''}</Text>
                    <Text color="light.secondaryText" style={{ paddingLeft: selectedPool ? 5 : 0 }}>{
                        selectedPool ? (satsEnabled && selectedPool?.denomination ? 'sats' : 'btc') : '--'}</Text>
                </Box>
            </Box>
            <Box style={styles.textArea}>
                <Text color='#017963'>Premix Outputs</Text>
                <Text color="light.secondaryText">5 Utxos</Text>
            </Box>
            <Box style={styles.footerContainer}>
                <Box style={styles.border} borderColor="light.GreyText" />
                <Box style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Box style={{ alignSelf: 'center', paddingBottom: 4, paddingLeft: 20 }}><PageIndicator currentPage={1} totalPage={2} /></Box>
                    <Box style={styles.footerItemContainer}>
                        <Buttons
                            // secondaryText="Cancel"
                            // secondaryCallback={() => {
                            //     navigation.goBack();
                            // }}
                            primaryText="Preview Pre-Mix"
                            primaryCallback={() => onPreviewMix()}
                        />
                    </Box>
                </Box>
            </Box>
            <KeeperModal
                justifyContent='flex-end'
                visible={showPools}
                close={closePoolSelectionModal}
                title="Select Pool"
                subTitle="Select a pool to use for your premix transaction."
                subTitleColor="#5F6965"
                modalBackground={['#F7F2EC', '#F7F2EC']}
                buttonBackground={['#00836A', '#073E39']}
                buttonText=""
                buttonTextColor="#FAFAFA"
                buttonCallback={closePoolSelectionModal}
                closeOnOverlayClick={false}
                Content={() => poolContent(availablePools, onPoolSelectionCallback, satsEnabled)}
            />
        </ScreenWrapper >
    );
}

const styles = StyleSheet.create({
    poolSelection: {
        marginLeft: 40,
        marginTop: 30,
        marginBottom: 10,
        padding: 10,
        borderRadius: 10,
    },
    textArea: {
        marginTop: 20,
        marginLeft: 50,
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
    poolTextDirection: {
        flexDirection: 'row',
        width: '100%'
    },
    poolText: {
        paddingTop: 4,
        fontSize: 16,
        fontFamily: Fonts.RobotoCondensedRegular
    },
    denominatorText: {
        fontSize: 12,
        paddingTop: 5,
        paddingLeft: 5
    },
    arrowIcon: {
        width: 10,
        alignItems: 'center',
        transform: [{ rotate: '90deg' }],
        marginRight: 20
    },
    poolContent: {
        marginBottom: 20,
        width: '100%',
    },
    poolItem: {
        fontSize: 18,
        padding: 15,
        backgroundColor: '#FDF7F0',
        borderRadius: 10,
        marginBottom: 5,
        flexDirection: 'row',
        width: '100%',
    },
    poolItemText: {
        fontSize: 18,
        textAlign: 'left',
    },
    poolItemUnitText: {
        fontSize: 12,
        width: '100%',
        paddingLeft: 5,
        paddingTop: 2,
        textAlign: 'left',
    }
});