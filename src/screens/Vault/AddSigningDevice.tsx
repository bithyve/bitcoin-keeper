import { Box, FlatList, HStack, Text, VStack } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { VaultScheme, VaultSigner } from 'src/core/wallets/interfaces/vault';

import AddIcon from 'src/assets/images/green_add.svg';
import Buttons from 'src/components/Buttons';
import Header from 'src/components/Header';
import IconArrowBlack from 'src/assets/images/svgs/icon_arrow_black.svg';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { Pressable } from 'react-native';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { SUBSCRIPTION_SCHEME_MAP } from 'src/common/constants';
import { ScaledSheet } from 'react-native-size-matters';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { VaultType } from 'src/core/wallets/enums';
import { WalletMap } from './WalletMap';
import { addNewVault } from 'src/store/sagaActions/vaults';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { getString } from 'src/storage';
import { hp } from 'src/common/data/responsiveness/responsive';
import moment from 'moment';
import { newVaultInfo } from 'src/store/sagas/wallets';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';

const AddSigningDevice = () => {
  const { useQuery } = useContext(RealmWrapperContext);
  const keeper: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];

  // const signerLimit = SUBSCRIPTION_SCHEME_MAP[keeper.subscription.name].n;
  const signerLimit = SUBSCRIPTION_SCHEME_MAP.HODLER.n;
  const vaultSigners = useAppSelector((state) => state.vault.signers);
  const [signersState, setSignersState] = useState(
    vaultSigners.concat(new Array(signerLimit - vaultSigners.length).fill(null))
  );
  const navigation = useNavigation();
  const navigateToSignerList = () =>
    navigation.dispatch(CommonActions.navigate('SigningDeviceList'));

  useEffect(() => {
    console.log(vaultSigners);
    setSignersState(vaultSigners.concat(new Array(signerLimit - vaultSigners.length).fill(null)));
  }, [vaultSigners]);

  const SignerItem = ({ signer, index }: { signer: VaultSigner | undefined; index: number }) => {
    if (!signer) {
      return (
        <Pressable onPress={navigateToSignerList}>
          <Box flexDir={'row'} alignItems={'center'} marginX={'3'} marginBottom={'8'}>
            <HStack style={styles.signerItem}>
              <AddIcon />
              <VStack marginX={'4'} maxW={'80%'}>
                <Text
                  color={'light.lightBlack'}
                  fontSize={15}
                  numberOfLines={2}
                  alignItems={'center'}
                  letterSpacing={1.12}
                >
                  {`Add Signer ${index + 1}`}
                </Text>
                <Text color={'light.GreyText'} fontSize={13} letterSpacing={0.6}>
                  {`Lorem ipsum dolor sit amet, consectetur`}
                </Text>
              </VStack>
              <IconArrowBlack />
            </HStack>
          </Box>
        </Pressable>
      );
    }
    return (
      <Box flexDir={'row'} alignItems={'center'} marginX={'3'} marginBottom={'8'}>
        <HStack style={styles.signerItem}>
          <Box
            width={'8'}
            height={'8'}
            borderRadius={30}
            bg={'#725436'}
            justifyContent={'center'}
            alignItems={'center'}
            alignSelf={'center'}
          >
            {WalletMap(signer.type, true).Icon}
          </Box>
          <VStack marginX={'4'} maxW={'80%'}>
            <Text
              color={'light.lightBlack'}
              fontSize={15}
              numberOfLines={2}
              alignItems={'center'}
              letterSpacing={1.12}
            >
              {signer.signerName}
            </Text>
            <Text color={'light.GreyText'} fontSize={13} letterSpacing={0.6}>
              {`Added ${moment(signer.lastHealthCheck).calendar()}`}
            </Text>
          </VStack>
        </HStack>
      </Box>
    );
  };

  const renderSigner = ({ item, index }) => <SignerItem signer={item} index={index} />;

  const dispatch = useDispatch();
  const createVault = useCallback((signers: VaultSigner[], scheme: VaultScheme) => {
    try {
      const newVaultInfo: newVaultInfo = {
        vaultType: VaultType.DEFAULT,
        vaultScheme: scheme,
        vaultSigners: signers,
        vaultDetails: {
          name: 'Vault',
          description: 'Secure your sats',
        },
      };
      dispatch(addNewVault(newVaultInfo));
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }, []);

  const onProceed = () => {
    const scheme = SUBSCRIPTION_SCHEME_MAP.HODLER;
    const isVaultCreated = createVault(signersState, scheme);
    if (isVaultCreated) {
      navigation.dispatch(CommonActions.navigate('NewHome'));
    }
  };

  return (
    <ScreenWrapper>
      <Header
        title={'Add Signers'}
        subtitle={'Lorem ipsum dolor sit amet, consectetur'}
        headerTitleColor={'light.textBlack'}
      />
      <FlatList
        extraData={vaultSigners}
        data={signersState}
        keyExtractor={(item, index) => item?.signerId ?? index}
        renderItem={renderSigner}
        style={{
          marginTop: hp(52),
        }}
      />
      {signersState.every((signer) => {
        return !!signer;
      }) && (
        <Box position={'absolute'} bottom={0} width={'100%'}>
          <Buttons
            primaryText="Next"
            primaryCallback={onProceed}
            secondaryText={'Cancel'}
            secondaryCallback={navigation.goBack}
          />
        </Box>
      )}
    </ScreenWrapper>
  );
};

const styles = ScaledSheet.create({
  signerItem: {
    alignItems: 'center',
  },
});

export default AddSigningDevice;
