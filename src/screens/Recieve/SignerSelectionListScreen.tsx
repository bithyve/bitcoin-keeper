import { Dimensions, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
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
import useSigners from 'src/hooks/useSigners';

const { width } = Dimensions.get('screen');

function SignerSelectionListScreen() {
  const { params } = useRoute();
  const { colorMode } = useColorMode();
  const { vaultId, signersMFP, title, description, callback } = params as {
    vaultId: string;
    signersMFP: string[];
    title: string;
    description: string;
    callback: (signer, signerName) => void;
  };

  const { vaultSigners } = useSigners(vaultId);
  const [availableSigners] = useState(
    vaultSigners.filter((signer) => signersMFP?.includes(signer.masterFingerprint))
  );

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <ActivityIndicatorView visible={false} showLoader />
      <KeeperHeader title={title} subtitle={description} />
      <FlatList
        contentContainerStyle={{ paddingTop: '5%' }}
        data={availableSigners}
        keyExtractor={(item) => item.masterFingerprint}
        renderItem={({ item }) => (
          <SignerCard
            onPress={(signer, signerName) => {
              callback(signer, signerName);
            }}
            signer={item}
          />
        )}
      />
    </ScreenWrapper>
  );
}

export default Sentry.withErrorBoundary(SignerSelectionListScreen, errorBourndaryOptions);

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
          {/* TODO: Move to a component as it is the same as in SignerList.tsx */}
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
                {`${getSignerNameFromType(signer.type, signer.isMock, false)} (${
                  signer.masterFingerprint
                })`}
              </Text>
              {signer.signerDescription ? (
                <Text
                  numberOfLines={1}
                  color={`${colorMode}.greenText`}
                  fontSize={12}
                  letterSpacing={0.6}
                  fontStyle={null}
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
