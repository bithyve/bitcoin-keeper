import React, { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Box, HStack, VStack } from 'native-base';

import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import UTXOList from 'src/components/UTXOsComponents/UTXOList';
import NoVaultTransactionIcon from 'src/assets/images/emptystate.svg';
import NoTransactionIcon from 'src/assets/images/noUtxos.svg';
import VaultIcon from 'src/assets/images/icon_vault.svg';
import LinkedWallet from 'src/assets/images/walletUtxos.svg';
import UTXOFooter from 'src/components/UTXOsComponents/UTXOFooter';
import FinalizeFooter from 'src/components/UTXOsComponents/FinalizeFooter';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import UTXOSelectionTotal from 'src/components/UTXOsComponents/UTXOSelectionTotal';

import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { setWhirlpoolIntro } from 'src/store/reducers/vaults';
import LearnMoreModal from './components/LearnMoreModal';
import InitiateWhirlpoolModal from './components/InitiateWhirlpoolModal';
import ErrorCreateTxoModal from './components/ErrorCreateTXOModal';

// import { AccountSelectionTab, AccountTypes } from 'src/components/AccountSelectionTab';

function Footer({ vault, setEnableSelection, enableSelection, selectedUTXOs }) {
    return enableSelection ? (
        <FinalizeFooter
            currentWallet={vault}
            selectedUTXOs={selectedUTXOs}
            setEnableSelection={setEnableSelection}
        />
    ) : (
        <UTXOFooter setEnableSelection={setEnableSelection} enableSelection={enableSelection} />
    );
}
function UTXOManagement({ route }) {
    const dispatch = useAppDispatch();
    const styles = getStyles();
    const { data, routeName } = route.params || {};
    const [enableSelection, _setEnableSelection] = useState(false);
    const { confirmedUTXOs, unconfirmedUTXOs } = data?.specs || {
        confirmedUTXOs: [],
        unconfirmedUTXOs: [],
    };
    const utxos =
        confirmedUTXOs
            .map((utxo) => {
                utxo.confirmed = true;
                return utxo;
            })
            .concat(
                unconfirmedUTXOs.map((utxo) => {
                    utxo.confirmed = false;
                    return utxo;
                })
            ) || [];

    const [selectionTotal, setSelectionTotal] = useState(0);
    const [selectedUTXOMap, setSelectedUTXOMap] = useState({});
    const selectedUTXOs = utxos.filter((utxo) => selectedUTXOMap[`${utxo.txId}${utxo.vout}`]);
    const [learnModalVisible, setLearnModalVisible] = useState(false);
    const [txoErrorModalVisible, setTxoErrorModalVisible] = useState(false);

    const whirlpoolIntroModal = useAppSelector((state) => state.vault.whirlpoolIntro);
    // const [selectedAccount, setSelectedAccount] = useState<AccountTypes>(AccountTypes.DEPOSIT)

    const cleanUp = useCallback(() => {
        setSelectedUTXOMap({});
        setSelectionTotal(0);
    }, []);

    const setEnableSelection = useCallback(
        (value) => {
            _setEnableSelection(value);
            if (!value) {
                cleanUp();
            }
        },
        [cleanUp]
    );
    return (
        <ScreenWrapper>
            <HeaderTitle learnMore learnMorePressed={() => setLearnModalVisible(true)} />
            <Box style={styles.dailySpendingWrapper}>
                <HStack style={styles.dailySpendingView}>
                    <Box paddingRight={3}>
                        {routeName === 'Vault' ? <VaultIcon /> : <LinkedWallet />}
                    </Box>
                    <VStack>
                        <Text color="light.greenText" style={[styles.vaultInfoText, { fontSize: 16 }]} >
                            Daily Spending
                        </Text>
                        <Text color="light.grayText" style={[styles.vaultInfoText, { fontSize: 12 }]}>
                            Manage your UTXOs here
                        </Text>
                    </VStack>
                </HStack>
                {/* this is account switch tab */}
                {/* <AccountSelectionTab selectedAccount={selectedAccount} setSelectedAccount={setSelectedAccount} /> */}
            </Box>
            <Box style={{ height: '65%' }}>
                {Object.values(selectedUTXOMap).length ?
                    <UTXOSelectionTotal selectionTotal={selectionTotal} selectedUTXOs={selectedUTXOs} /> : null
                }
                <UTXOList
                    utxoState={utxos}
                    enableSelection={enableSelection}
                    setSelectionTotal={setSelectionTotal}
                    selectedUTXOMap={selectedUTXOMap}
                    setSelectedUTXOMap={setSelectedUTXOMap}
                    currentWallet={data}
                    emptyIcon={routeName === 'Vault' ? NoVaultTransactionIcon : NoTransactionIcon}
                />
            </Box>
            {utxos.length ? <Footer vault={data} setEnableSelection={setEnableSelection} enableSelection={enableSelection} selectedUTXOs={selectedUTXOs} /> : null}
            <LearnMoreModal visible={learnModalVisible} closeModal={() => setLearnModalVisible(false)} />
            <InitiateWhirlpoolModal visible={whirlpoolIntroModal} closeModal={() => dispatch(setWhirlpoolIntro(false))} />
            <ErrorCreateTxoModal visible={txoErrorModalVisible} closeModal={() => setTxoErrorModalVisible(false)} />
        </ScreenWrapper>
    )
}
const getStyles = () =>
    StyleSheet.create({
        vaultInfoText: {
            marginLeft: wp(3),
            letterSpacing: 1.28,
        },
        dailySpendingWrapper: {
            marginLeft: wp(20),
            marginVertical: hp(20),
        },
        dailySpendingView: {
            alignItems: 'center'
        }
    });
export default UTXOManagement