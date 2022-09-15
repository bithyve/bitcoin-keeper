import { Alert, Box, HStack, Pressable, VStack } from 'native-base';
import { FlatList, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import AddIcon from 'src/assets/images/green_add.svg';
import AddSignerIcon from 'src/assets/icons/addSigner.svg';
import Buttons from 'src/components/Buttons';
import Header from 'src/components/Header';
import IconArrowBlack from 'src/assets/images/svgs/icon_arrow_black.svg';
import Relay from 'src/core/services/operations/Relay';
import { ScaledSheet } from 'react-native-size-matters';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { WalletMap } from '../Vault/WalletMap';
import { hp } from 'src/common/data/responsiveness/responsive';
import { reoverVault } from 'src/store/sagaActions/bhr';
import { setVaultMetaData } from 'src/store/reducers/bhr';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

const SignerItem = ({ signer, index }: { signer: any | undefined; index: number }) => {
  const { navigate } = useNavigation();
  if (!signer) {
    return (
      <Pressable onPress={() => navigate('LoginStack', { screen: 'SignersList' })}>
        <Box flexDir={'row'} alignItems={'center'} marginX={'3'} marginBottom={'12'}>
          <HStack style={styles.signerItem}>
            <HStack alignItems={'center'}>
              <AddIcon />
              <VStack marginX={'4'} maxW={'64'}>
                <Text
                  color={'light.lightBlack'}
                  fontSize={15}
                  numberOfLines={2}
                  alignItems={'center'}
                  letterSpacing={1.12}
                >
                  {`Verify Signer ${index + 1}`}
                </Text>
                <Text color={'light.GreyText'} fontSize={13} letterSpacing={0.6}>
                  {`Lorem ipsum dolor sit amet, consectetur`}
                </Text>
              </VStack>
            </HStack>
            <Box w={'15%'} alignItems={'center'}>
              <IconArrowBlack />
            </Box>
          </HStack>
        </Box>
      </Pressable>
    );
  }
  return (
    <Box flexDir={'row'} alignItems={'center'} marginX={'3'} marginBottom={'12'}>
      <HStack style={styles.signerItem}>
        <HStack>
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
              {signer.type}
            </Text>
          </VStack>
        </HStack>
        <Pressable style={styles.remove}>
          <Text color={'light.GreyText'} fontSize={12} letterSpacing={0.6}>
            {`Remove`}
          </Text>
        </Pressable>
      </HStack>
    </Box>
  );
};

const VaultRecovery = () => {
  const { navigate } = useNavigation();
  const dispatch = useDispatch();
  const { vaultMetaData, signingDevices } = useAppSelector((state) => state.bhr);
  const { appId } = useAppSelector((state) => state.storage);
  const [signersList, setsignersList] = useState([]);
  const [disable, setDisable] = useState(false);

  const getVaultMetaDataRelay = async (signerId) => {
    const data = await Relay.getVaultMetaData(signerId);
    if (data.vaultMetaData) {
      dispatch(setVaultMetaData(data.vaultMetaData));
    }
  };
  const startRecovery = () => {
    setDisable(true);
    dispatch(reoverVault());
  };

  useEffect(() => {
    if (signingDevices && signingDevices.length === 1) {
      getVaultMetaDataRelay(signingDevices[0].signerId);
    }
  }, [signingDevices]);

  useEffect(() => {
    if (vaultMetaData.m && signingDevices) {
      let fills = new Array(vaultMetaData.m - signingDevices.length).fill(null);
      setsignersList(signingDevices.concat(fills));
    }
  }, [vaultMetaData, signingDevices]);

  useEffect(() => {
    if (appId) {
      navigate('App');
    }
  }, [appId]);

  const renderSigner = ({ item, index }) => <SignerItem signer={item} index={index} />;
  return (
    <ScreenWrapper>
      <Header
        title={'Verify Signing Devices'}
        subtitle={'to recover your vault'}
        headerTitleColor={'light.textBlack'}
      />
      {vaultMetaData.m ? (
        <FlatList
          data={signersList}
          keyExtractor={(item, index) => item?.signerId ?? index}
          renderItem={renderSigner}
          style={{
            marginTop: hp(52),
          }}
        />
      ) : (
        <TouchableOpacity onPress={() => navigate('LoginStack', { screen: 'SignersList' })}>
          <Box alignSelf={'center'} alignItems={'center'}>
            <AddSignerIcon />
          </Box>
        </TouchableOpacity>
      )}
      {signingDevices && signingDevices.length === vaultMetaData.m && (
        <Box position={'absolute'} bottom={10} width={'100%'}>
          <Buttons
            primaryText="Recover Vault"
            primaryDisable={disable}
            primaryCallback={startRecovery}
          />
        </Box>
      )}
    </ScreenWrapper>
  );
};

const styles = ScaledSheet.create({
  signerItem: {
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  remove: {
    height: 26,
    paddingHorizontal: 12,
    borderRadius: 5,
    backgroundColor: '#FAC48B',
    justifyContent: 'center',
  },
});

export default VaultRecovery;
