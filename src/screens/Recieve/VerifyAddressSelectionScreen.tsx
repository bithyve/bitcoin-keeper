import { Dimensions, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import React, { useContext, useState } from 'react';
import { Box, Image, Text, useColorMode } from 'native-base';
import Next from 'src/assets/images/icon_arrow.svg';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import * as Sentry from '@sentry/react-native';
import { errorBourndaryOptions } from 'src/screens/ErrorHandler';
import { SDIcons } from '../Vault/SigningDeviceIcons';
import { getSignerNameFromType } from 'src/hardware';
import moment from 'moment';
import { InteracationMode } from '../Vault/HardwareModalMap';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import useSigners from 'src/hooks/useSigners';

const { width } = Dimensions.get('screen');

function VerifyAddressSelectionScreen() {
  const { params } = useRoute();
  const { colorMode } = useColorMode();
  const { vaultId, signersMFP } = params as {
    vaultId: string;
    signersMFP: string[];
  };

  const { vaultSigners } = useSigners(vaultId);
  const [availableSigners] = useState(
    vaultSigners.filter((signer) => signersMFP?.includes(signer.masterFingerprint))
  );

  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultText } = translations;

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <ActivityIndicatorView visible={false} showLoader />
      <KeeperHeader title="Verify Address" subtitle={vaultText.SelectSigner} />
      <FlatList
        contentContainerStyle={{ paddingTop: '5%' }}
        data={availableSigners}
        keyExtractor={(item) => item.masterFingerprint}
        renderItem={({ item }) => (
          <SignerCard
            onPress={(signer, signerName) => {
              navigation.dispatch(
                CommonActions.navigate('ConnectChannel', {
                  signer,
                  vaultId,
                  type: signer.type,
                  mode: InteracationMode.ADDRESS_VERIFICATION,
                  title: `Connecting to ${signerName}`,
                  subtitle: vaultText.verifyAddDesc,
                })
              );
            }}
            signer={item}
          />
        )}
      />
    </ScreenWrapper>
  );
}

export default Sentry.withErrorBoundary(VerifyAddressSelectionScreen, errorBourndaryOptions);

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
  associatedContactImage: {
    width: '70%',
    height: '70%',
    borderRadius: 100,
    alignSelf: 'center',
    justifyContent: 'center',
  },
});

const SignerCard = ({ onPress, signer }) => {
  const { colorMode } = useColorMode();
  const signerName = getSignerNameFromType(signer.type, signer.isMock, false);
  return (
    <TouchableOpacity testID={`btn_transactionSigner`} onPress={() => onPress(signer, signerName)}>
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
                {signer.extraData.thumbnailPath ? (
                  <Image
                    src={signer.extraData.thumbnailPath}
                    style={styles.associatedContactImage}
                  />
                ) : (
                  SDIcons(signer.type).Icon
                )}
              </Box>
            </View>
            <View style={{ flexDirection: 'column' }}>
              <Text fontSize={14} letterSpacing={1.12} maxWidth={width * 0.6}>
                {`${signerName}`}
              </Text>
              <Text
                color={`${colorMode}.GreyText`}
                fontSize={12}
                marginRight={10}
                letterSpacing={0.6}
              >
                {`Added on ${moment(signer.addedOn).calendar().toLowerCase()}`}
              </Text>
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
