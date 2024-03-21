import { Box, useColorMode } from "native-base"
import React from 'react';
import { StyleSheet } from "react-native";
import { wp } from "src/constants/responsive";
import { EntityKind, VaultType, WalletType } from "src/services/wallets/enums";
import Colors from "src/theme/Colors";
import HexagonIcon from "../HexagonIcon";
import KeeperModal from "../KeeperModal"
import Text from "../KeeperText";
import WalletIcon from 'src/assets/images/daily_wallet.svg';
import CollaborativeIcon from 'src/assets/images/collaborative_vault_white.svg';
import VaultIcon from 'src/assets/images/vault_icon.svg';
import CardPill from "../CardPill";
import { Vault } from "src/services/wallets/interfaces/vault";
import idx from "idx";

const getWalletIcon = (walletType) => {
    if (walletType === EntityKind.VAULT) {
        return walletType === VaultType.COLLABORATIVE ? <CollaborativeIcon /> : <VaultIcon />;
    } else {
        return <WalletIcon />;
    }
};
const getWalletTags = (walletType) => {
    if (walletType === EntityKind.VAULT) {
        return [
            `${walletType === VaultType.COLLABORATIVE ? 'COLLABORATIVE' : 'VAULT'}`,
            `${(walletType as Vault).scheme.m} of ${(walletType as Vault).scheme.n}`,
        ];
    } else {
        let walletKind;
        if (walletType === WalletType.DEFAULT) walletKind = 'HOT WALLET';
        else if (walletType === WalletType.IMPORTED) {
            const isWatchOnly = !idx(walletType as Wallet, (_) => _.specs.xpriv);
            if (isWatchOnly) walletKind = 'WATCH ONLY';
            else walletKind = 'IMPORTED WALLET';
        }

        return ['SINGLE-KEY', walletKind];
    }
};
function WalletCreatedModalContent(props) {
    const { colorMode } = useColorMode();
    return (
        <Box>
            <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.walletVaultInfoContainer}>
                <Box style={styles.pillsContainer}>
                    {props.tags?.map((tag, index) => {
                        return (
                            <CardPill
                                key={tag}
                                heading={tag}
                                backgroundColor={index % 2 !== 0 ? null : `${colorMode}.SignleSigCardPillBackColor`}
                            />
                        );
                    })}
                </Box>
                <Box style={styles.walletVaultInfoWrapper}>
                    <Box style={styles.iconWrapper}>
                        <HexagonIcon width={44} height={38} backgroundColor={Colors.DarkGreen} icon={getWalletIcon(props.walletType)} />
                    </Box>
                    <Box>
                        {props.walletDescription ? <Text color={`${colorMode}.secondaryText`}>{props.walletDescription}</Text> : null}
                        <Text color={`${colorMode}.greenText`} medium style={styles.titleText}>{props.walletName}</Text>
                    </Box>
                </Box>
            </Box>
            <Box>
                <Text color={`${colorMode}.secondaryText`} style={styles.descText}>{props.descriptionMessage}</Text>
            </Box>
        </Box>
    )
}
function WalletVaultCreationModal(props) {
    const { colorMode } = useColorMode();
    return (
        <KeeperModal
            dismissible
            close={() => { }}
            visible={props.visible}
            title={props.title}
            subTitle={props.subTitle}
            Content={() => (<WalletCreatedModalContent descriptionMessage={props.descriptionMessage} walletType={props.walletType} walletName={props.walletName} walletDescription={props.walletDescription} tags={getWalletTags(props.walletType)} />)}
            buttonText={props.buttonText}
            buttonCallback={() => {
                props.buttonCallback()
            }}
            showButtons
            modalBackground={`${colorMode}.modalWhiteBackground`}
            textColor={`${colorMode}.primaryText`}
            subTitleColor={`${colorMode}.secondaryText`}
            subTitleWidth={wp(280)}
            showCloseIcon={false}
        />
    )
}
const styles = StyleSheet.create({
    descText: {
        fontSize: 13,
        width: wp(300),
    },
    walletVaultInfoContainer: {
        padding: 15,
        marginVertical: 20,
        borderRadius: 10
    },
    walletVaultInfoWrapper: {
        flexDirection: 'row',
    },
    iconWrapper: {
        marginRight: 10
    },
    titleText: {
        fontSize: 14,
    },
    pillsContainer: {
        flexDirection: 'row',
        gap: 5,
        justifyContent: 'flex-end',
    },
})
export default WalletVaultCreationModal