import Text from 'src/components/KeeperText';
import { Box, HStack, Pressable, VStack } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { FlatList, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import AddIcon from 'src/assets/images/green_add.svg';
import AddSignerIcon from 'src/assets/images/addSigner.svg';
import Buttons from 'src/components/Buttons';
import HeaderTitle from 'src/components/HeaderTitle';
import IconArrowBlack from 'src/assets/images/icon_arrow_black.svg';
import KeeperModal from 'src/components/KeeperModal';
import Note from 'src/components/Note/Note';
import Relay from 'src/core/services/operations/Relay';
import { ScaledSheet } from 'react-native-size-matters';
import ScreenWrapper from 'src/components/ScreenWrapper';
import SuccessSvg from 'src/assets/images/successSvg.svg';
import { hp } from 'src/common/data/responsiveness/responsive';
import { reoverVault } from 'src/store/sagaActions/bhr';
import { setVaultMetaData } from 'src/store/reducers/bhr';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { WalletMap } from '../Vault/WalletMap';

function SignerItem({ signer, index }: { signer: any | undefined; index: number }) {
  const { navigate } = useNavigation();
  if (!signer) {
    return (
      <Pressable onPress={() => navigate('LoginStack', { screen: 'SignersList' })}>
        <Box flexDir="row" alignItems="center" marginX="3" marginBottom="12">
          <HStack style={styles.signerItem}>
            <HStack alignItems="center">
              <AddIcon />
              <VStack marginX="4" maxWidth="64">
                <Text
                  color="light.primaryText"
                  fontSize={15}
                  numberOfLines={2}
                  alignItems="center"
                  letterSpacing={1.12}
                >
                  {`Verify Signer ${index + 1}`}
                </Text>
                <Text color="light.GreyText" fontSize={13} letterSpacing={0.6}>
                  Lorem ipsum dolor sit amet, consectetur
                </Text>
              </VStack>
            </HStack>
            <Box width="15%" alignItems="center">
              <IconArrowBlack />
            </Box>
          </HStack>
        </Box>
      </Pressable>
    );
  }
  return (
    <Box flexDir="row" alignItems="center" marginX="3" marginBottom="12">
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
            {WalletMap(signer.type, true).Icon}
          </Box>
          <VStack marginX="4" maxWidth="80%">
            <Text
              color="light.primaryText"
              fontSize={15}
              numberOfLines={2}
              alignItems="center"
              letterSpacing={1.12}
            >
              {signer.type}
            </Text>
          </VStack>
        </HStack>
        <Pressable style={styles.remove}>
          <Text color="light.GreyText" fontSize={12} letterSpacing={0.6}>
            Remove
          </Text>
        </Pressable>
      </HStack>
    </Box>
  );
}

function VaultRecovery() {
  const { navigate } = useNavigation();
  const dispatch = useDispatch();
  const { vaultMetaData, signingDevices } = useAppSelector((state) => state.bhr);
  const { appId } = useAppSelector((state) => state.storage);
  const [signersList, setsignersList] = useState([]);
  const [disable, setDisable] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

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
      const fills = new Array(vaultMetaData.m - signingDevices.length).fill(null);
      setsignersList(signingDevices.concat(fills));
    }
  }, [vaultMetaData, signingDevices]);

  useEffect(() => {
    if (appId) {
      setSuccessModal(true);
    }
  }, [appId]);

  function SuccessModalContent() {
    return (
      <View>
        <Box alignSelf="center">
          <SuccessSvg />
        </Box>
        <Text color="light.greenText" fontSize={13} padding={2}>
          The BIP-85 wallets in the app are new as they can’t be recovered using this method
        </Text>
      </View>
    );
  }

  const renderSigner = ({ item, index }) => <SignerItem signer={item} index={index} />;
  const navigation = useNavigation();
  return (
    <ScreenWrapper>
      <HeaderTitle
        title="Add signing devices"
        subtitle="To recover your inherited vault"
        headerTitleColor="light.textBlack"
        paddingTop={hp(5)}
      />
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
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
          <Box alignItems="center" style={{ flex: 1, justifyContent: 'center' }}>
            <TouchableOpacity onPress={() => navigate('LoginStack', { screen: 'SignersList' })}>
              <Box alignItems="center">
                <AddSignerIcon />
              </Box>
            </TouchableOpacity>
            <Text style={{ textAlign: 'center', width: '70%', marginTop: 20 }}>
              You can use any one of the signing devices to start with
            </Text>
          </Box>
        )}
        {signingDevices && signingDevices.length === vaultMetaData.m && (
          <Box position="absolute" bottom={10} width="100%" marginBottom={10}>
            <Buttons
              primaryText="Recover Vault"
              primaryDisable={disable}
              primaryCallback={startRecovery}
            />
          </Box>
        )}
        <Note
          title="Note"
          subtitle="Signing Server cannot be used as the first signing device while recovering"
        />
      </View>
      <KeeperModal
        visible={successModal}
        title="Vault Recovered!"
        subTitle="Your Keeper vault has successfully been recovered."
        buttonText="View Vault"
        Content={SuccessModalContent}
        close={() => setSuccessModal(false)}
        buttonCallback={() =>
          navigation.dispatch(CommonActions.navigate('App', { name: 'VaultDetails', params: {} }))
        }
      />
    </ScreenWrapper>
  );
}

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
