import { Alert, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import HeaderTitle from 'src/components/HeaderTitle';
import { Box } from 'native-base';
import { Tile } from '../NewKeeperAppScreen/NewKeeperAppScreen';
import { useNavigation } from '@react-navigation/native';

const OtherRecoveryMethods = () => {
  const { navigate } = useNavigation();
  return (
    <ScreenWrapper>
      <HeaderTitle
        title="Other methods for restoring the vault"
        subtitle="This method can only be used for restoring the Vault"
      />
      <Box>
        <Tile
          title={'All Signing Devices'}
          subTitle={
            'If you have all the signing devices that were initially used to create the Vault'
          }
          onPress={() => {
            navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' });
          }}
        />
        <Tile
          title={'Vault Configuration File (Coming Soon!)'}
          subTitle={'Use this method if you have the vault configuration file.'}
          onPress={() => {
            Alert.alert('Coming Soon!');
          }}
        />

        <Tile
          title={'Signing Device with Vault details (Coming Soon!)'}
          subTitle={'These are the signing devices where you may have registered the Vault'}
          onPress={() => {
            Alert.alert('Coming Soon!');
          }}
        />
      </Box>
    </ScreenWrapper>
  );
};

export default OtherRecoveryMethods;

const styles = StyleSheet.create({});
