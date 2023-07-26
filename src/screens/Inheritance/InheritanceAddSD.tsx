import React, { useState } from 'react'
import { Box, FlatList, HStack, Pressable, VStack } from 'native-base'
import { ScaledSheet } from 'react-native-size-matters';
import moment from 'moment';
import { Dimensions } from 'react-native';
import HeaderTitle from 'src/components/HeaderTitle';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import { useAppSelector } from 'src/store/hooks';
import useSignerIntel from 'src/hooks/useSignerIntel';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import Text from 'src/components/KeeperText';
import IconArrowBlack from 'src/assets/images/icon_arrow_black.svg';
import ScreenWrapper from 'src/components/ScreenWrapper';
import AddIcon from 'src/assets/images/green_add.svg';
import { getPlaceholder } from 'src/common/utilities';
import { globalStyles } from 'src/common/globalStyles';
import { useDispatch } from 'react-redux';
import usePlan from 'src/hooks/usePlan';
import { removeSigningDevice, updateSigningDevice } from 'src/store/reducers/vaults';
import { getSignerSigTypeInfo } from 'src/hardware';
import { SubscriptionTier } from 'src/common/data/enums/SubscriptionTier';
import Note from 'src/components/Note/Note';
import Arrow from 'src/assets/images/icon_arrow_Wallet.svg';
import TimeIcon from 'src/assets/images/time.svg'
import Add from 'src/assets/images/addWallet.svg';
import InheritanceIcon from 'src/assets/images/inheritanceBrown.svg'
import Buttons from 'src/components/Buttons';
import { SDIcons } from '../Vault/SigningDeviceIcons';
import DescriptionModal from '../Vault/components/EditDescriptionModal';


const { width } = Dimensions.get('screen');

function SignerItem({
    signer,
    index,
    setInheritanceInit,
}: {
    signer: VaultSigner | undefined;
    index: number;
    setInheritanceInit: any;
}) {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { plan } = usePlan();
    const [visible, setVisible] = useState(false);

    const removeSigner = () => dispatch(removeSigningDevice(signer));
    const navigateToSignerList = () =>
        navigation.dispatch(CommonActions.navigate('SigningDeviceList'));

    const callback = () => {
        if (index === 5) {
            setInheritanceInit(true);
        } else {
            navigateToSignerList();
        }
    };
    const openDescriptionModal = () => setVisible(true);
    const closeDescriptionModal = () => setVisible(false);

    if (!signer) {
        return (
            <Pressable onPress={callback}>
                <Box style={styles.signerItemContainer}>
                    <HStack style={styles.signerItem}>
                        <HStack alignItems="center">
                            <AddIcon />
                            <VStack marginX="4" maxWidth="64">
                                <Text
                                    color="light.primaryText"
                                    numberOfLines={2}
                                    style={[globalStyles.font15, { letterSpacing: 1.12, alignItems: 'center' }]}
                                >
                                    {`Add ${getPlaceholder(index)} Signing Device`}
                                </Text>
                                <Text color="light.GreyText" style={[globalStyles.font13, { letterSpacing: 0.06 }]}>
                                    Select signing device
                                </Text>
                            </VStack>
                        </HStack>
                        <Box style={styles.backArrow}>
                            <IconArrowBlack />
                        </Box>
                    </HStack>
                </Box>
            </Pressable>
        );
    }
    const { isSingleSig, isMultiSig } = getSignerSigTypeInfo(signer);
    let shouldReconfigure = false;
    if (
        (plan === SubscriptionTier.L1.toUpperCase() && !isSingleSig) ||
        (plan !== SubscriptionTier.L1.toUpperCase() && !isMultiSig)
    ) {
        shouldReconfigure = true;
    }
    return (
        <Box
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginHorizontal: 10,
                marginBottom: hp(windowHeight < 700 ? 5 : 25),
            }}
        >
            <HStack style={styles.signerItem}>
                <HStack>
                    <Box
                        width="8"
                        height="8"
                        borderRadius={30}
                        backgroundColor="#725436"
                        justifyContent="center"
                        alignItems="center"
                        alignSelf="center"
                    >
                        {SDIcons(signer.type, true).Icon}
                    </Box>
                    <VStack marginLeft="4" maxWidth="80%">
                        <Text
                            color="light.primaryText"
                            numberOfLines={1}
                            style={[
                                globalStyles.font15,
                                { alignItems: 'center', letterSpacing: 1.12, maxWidth: width * 0.5 },
                            ]}
                        >
                            {`${signer.signerName}`}
                            <Text style={[globalStyles.font12]}>{` (${signer.masterFingerprint})`}</Text>
                        </Text>
                        <Text color="light.GreyText" style={[globalStyles.font12, { letterSpacing: 0.6 }]}>
                            {`Added ${moment(signer.lastHealthCheck).calendar()}`}
                        </Text>
                        <Pressable onPress={openDescriptionModal}>
                            <Box style={styles.descriptionBox}>
                                <Text
                                    numberOfLines={1}
                                    color={signer.signerDescription ? '#6A7772' : '#387F6A'}
                                    style={[
                                        globalStyles.font12,
                                        { letterSpacing: 0.6, fontStyle: signer.signerDescription ? null : 'italic' },
                                    ]}
                                    bold={!signer.signerDescription}
                                >
                                    {signer.signerDescription ? signer.signerDescription : 'Add Description'}
                                </Text>
                            </Box>
                        </Pressable>
                    </VStack>
                </HStack>
                <Pressable style={styles.remove} onPress={() => removeSigner()}>
                    <Text color="light.GreyText" style={[globalStyles.font12, { letterSpacing: 0.6 }]}>
                        {shouldReconfigure ? 'Re-configure' : 'Remove'}
                    </Text>
                </Pressable>
            </HStack>
            <DescriptionModal
                visible={visible}
                close={closeDescriptionModal}
                signer={signer}
                callback={(value: any) =>
                    dispatch(updateSigningDevice({ signer, key: 'signerDescription', value }))
                }
            />
        </Box>
    );
}
type Props = {
    title: string;
    subTitle: string;
    onPress: () => void;
    icon: any;
    arrowIcon: any;
};

function Option({ title, subTitle, onPress, icon, arrowIcon }: Props) {
    return (
        <Pressable
            style={styles.optionContainer}
            onPress={onPress}
            testID={`btn_${title.replace(/ /g, '_')}`}
        >
            <Box style={{ width: '18%', alignItems: 'center' }}>
                {icon}
            </Box>
            <Box style={{ width: '75%' }}>
                <Text
                    color="light.primaryText"
                    style={styles.optionTitle}
                    testID={`text_${title.replace(/ /g, '_')}`}
                >
                    {title}
                </Text>
                <Text
                    color="light.GreyText"
                    style={styles.optionSubtitle}
                    numberOfLines={2}
                    testID={`text_${subTitle.replace(/ /g, '_')}`}
                >
                    {subTitle}
                </Text>
            </Box>
            <Box style={{ width: '4%', alignItems: 'center' }}>
                {arrowIcon}
            </Box>
        </Pressable>
    );
}
function InheritanceAddSD() {
    const navigtaion = useNavigation();
    const route = useRoute() as { params: { isInheritance: boolean } };
    const isInheritance = route?.params?.isInheritance || false;
    const vaultSigners = useAppSelector((state) => state.vault.signers);
    const { signersState } = useSignerIntel({ isInheritance });
    const [setInheritanceInit] = useState(false);

    const renderSigner = ({ item, index }) => (
        <SignerItem signer={item} index={index} setInheritanceInit={setInheritanceInit} />
    );
    return (
        <ScreenWrapper>
            <HeaderTitle
                title="Add Signing Devices"
                subtitle='You will need all the Signing Devices used'
                onPressHandler={() => navigtaion.goBack()}
                learnMore
                learnMorePressed={() => {
                }}
                paddingLeft={wp(25)}
            />
            <FlatList
                keyboardShouldPersistTaps="always"
                showsVerticalScrollIndicator={false}
                extraData={vaultSigners}
                data={signersState}
                keyExtractor={(item, index) => item?.signerId ?? index}
                renderItem={renderSigner}
                style={{
                    marginTop: hp(52),
                }}
            />
            <Box style={{ marginBottom: hp(20) }}>
                <Option
                    title="Inheritance Key Request Sent"
                    subTitle="3 weeks remaning"
                    icon={<InheritanceIcon />}
                    onPress={() => {
                        console.log('inheritance');
                    }}
                    arrowIcon={<TimeIcon />}
                />
                <Option
                    title="Add Another"
                    subTitle="Select signing device"
                    icon={<Add />}
                    onPress={() => {
                        console.log('inheritance');
                    }}
                    arrowIcon={<Arrow />}
                />
            </Box>
            <Box style={styles.noteContainer}>
                <Note
                    title="Note"
                    subtitle='Lorem ipsum dolor sit amet, consectetur adipiscing'
                    subtitleColor="GreyText"
                />
            </Box>
            <Buttons
                primaryText="Restore"
                paddingHorizontal={wp(30)}
            />
        </ScreenWrapper>
    )
}

const styles = ScaledSheet.create({
    signerItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
        marginBottom: hp(25),
    },
    signerItem: {
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    backArrow: {
        width: '15%',
        alignItems: 'center',
    },
    descriptionBox: {
        height: 24,
        backgroundColor: '#FDF7F0',
        borderRadius: 8,
        paddingHorizontal: 10,
        justifyContent: 'center',
    },
    remove: {
        height: 26,
        paddingHorizontal: 12,
        borderRadius: 5,
        backgroundColor: '#FAC48B',
        justifyContent: 'center',
    },
    noteContainer: {
        width: wp(330),
    },
    optionContainer: {
        marginTop: hp(20),
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    optionTitle: {
        fontSize: 14,
        letterSpacing: 1.12,
    },
    optionSubtitle: {
        fontSize: 12,
        letterSpacing: 0.6,
        width: '90%',
    },
})

export default InheritanceAddSD