import React, { useCallback, useState } from 'react';
import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import UTXOList from 'src/components/UTXOsComponents/UTXOList';
import NoVaultTransactionIcon from 'src/assets/images/emptystate.svg';
import NoTransactionIcon from 'src/assets/images/noUtxos.svg';
import VaultIcon from 'src/assets/images/icon_vault.svg';
import LinkedWallet from 'src/assets/images/walletUtxos.svg';
import { Box, HStack, VStack } from 'native-base';
import UTXOFooter from 'src/components/UTXOsComponents/UTXOFooter';
import FinalizeFooter from 'src/components/UTXOsComponents/FinalizeFooter';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { StyleSheet } from 'react-native';
import UTXOSelectionTotal from 'src/components/UTXOsComponents/UTXOSelectionTotal';
import { AccountSelectionTab, AccountTypes } from 'src/components/AccountSelectionTab';

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

    const [selectedAccount, setSelectedAccount] = useState<AccountTypes>(AccountTypes.DEPOSIT)

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
            <HeaderTitle learnMore />
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
            <Footer vault={data} setEnableSelection={setEnableSelection} enableSelection={enableSelection} selectedUTXOs={selectedUTXOs} />
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