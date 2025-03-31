import { Dimensions, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { Box, Text, useColorMode } from 'native-base';
import Next from 'src/assets/images/icon_arrow.svg';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import { SDIcons } from '../Vault/SigningDeviceIcons';
import { getSignerNameFromType } from 'src/hardware';
import moment from 'moment';
import useSigners from 'src/hooks/useSigners';
import { getKeyUID } from 'src/utils/utilities';
import { SentryErrorBoundary } from 'src/services/sentry';
import KeeperModal from 'src/components/KeeperModal';
import RegisterMultisig from '../SignTransaction/component/RegisterMultisig';
import { SignerType, VaultType } from 'src/services/wallets/enums';
import useVault from 'src/hooks/useVault';

const { width } = Dimensions.get('screen');

function SignerSelectionListScreen() {
  const { params } = useRoute();
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { vaultId, signersMFP, title, description, callback, vaultKeydata } = params as {
    vaultId: string;
    signersMFP: string[];
    title: string;
    description: string;
    vaultKeydata: any;
    callback: (signer, signerName) => void;
  };

  const { vaultSigners } = useSigners(vaultId);
  const [availableSigners] = useState(
    vaultSigners.filter((signer) => signersMFP?.includes(signer.masterFingerprint))
  );

  const [registerSignerModal, setRegisterSignerModal] = useState(false);
  const [selectedSigner, setSelectedSigner] = useState(null);

  const vaultKey = vaultKeydata?.find(
    (item) => item?.masterFingerprint === selectedSigner?.masterFingerprint
  );

  const { activeVault } = useVault({ vaultId, includeArchived: false });

  const handleSignerPress = (signer) => {
    if (signer.type === SignerType.PORTAL) {
      callback(signer, getSignerNameFromType(signer.type));
    } else {
      setSelectedSigner(signer);
      setRegisterSignerModal(true);
    }
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <ActivityIndicatorView visible={false} showLoader />
      <KeeperHeader title={title} subtitle={description} />
      <FlatList
        contentContainerStyle={{ paddingTop: '5%' }}
        data={availableSigners}
        keyExtractor={(item) => getKeyUID(item)}
        renderItem={({ item }) => (
          <SignerCard onPress={() => handleSignerPress(item)} signer={item} />
        )}
      />

      <KeeperModal
        visible={registerSignerModal}
        close={() => setRegisterSignerModal(false)}
        title="Register multisig"
        subTitle="Register your active vault"
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => (
          <RegisterMultisig
            isUSBAvailable={
              selectedSigner?.type === SignerType.COLDCARD ||
              (selectedSigner?.type === SignerType.JADE &&
                activeVault.type === VaultType.MINISCRIPT)
            }
            signer={selectedSigner || {}}
            vaultId={vaultId}
            vaultKey={vaultKey}
            setRegisterSignerModal={setRegisterSignerModal}
            activeVault={activeVault}
            navigation={navigation}
            CommonActions={CommonActions}
          />
        )}
      />
    </ScreenWrapper>
  );
}

export default SentryErrorBoundary(SignerSelectionListScreen);

const styles = StyleSheet.create({
  inheritenceView: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    backgroundColor: '#E3E3E3',
    borderRadius: 30,
    marginRight: 20,
    alignSelf: 'center',
  },
});

const SignerCard = ({ onPress, signer }) => {
  const { colorMode } = useColorMode();
  const signerName = getSignerNameFromType(signer.type, signer.isMock, false);

  return (
    <TouchableOpacity testID={`btn_transactionSigner`} onPress={onPress}>
      <Box margin={5}>
        <Box flexDirection="row" borderRadius={10} justifyContent="space-between">
          <Box flexDirection="row">
            <View style={styles.inheritenceView}>
              <Box
                width={30}
                height={30}
                borderRadius={30}
                backgroundColor={`${colorMode}.accent`}
                justifyContent="center"
                alignItems="center"
                marginX={1}
              >
                {SDIcons(signer.type).Icon}
              </Box>
            </View>
            <View style={{ flexDirection: 'column' }}>
              <Text
                color={`${colorMode}.textBlack`}
                fontSize={14}
                letterSpacing={1.12}
                maxWidth={width * 0.6}
              >
                {`${signerName} (${signer.masterFingerprint})`}
              </Text>
              {signer.signerDescription ? (
                <Text
                  numberOfLines={1}
                  color={`${colorMode}.greenText`}
                  fontSize={12}
                  letterSpacing={0.6}
                  maxWidth={width * 0.6}
                >
                  {signer.signerDescription}
                </Text>
              ) : (
                <Text
                  color={`${colorMode}.GreyText`}
                  fontSize={12}
                  marginRight={10}
                  letterSpacing={0.6}
                >
                  {`Added on ${moment(signer.addedOn).calendar().toLowerCase()}`}
                </Text>
              )}
            </View>
          </Box>
          <Box alignItems="center" justifyContent="center">
            <Next />
          </Box>
        </Box>
      </Box>
    </TouchableOpacity>
  );
};
