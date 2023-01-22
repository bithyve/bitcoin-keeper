import { StyleSheet, Text, View } from 'react-native';
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
          title={'Vault Configuration File'}
          subTitle={'Use this method if you have the vault configuration file.'}
          onPress={() => {}}
        />
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
          title={'Signing Device with Vault details'}
          subTitle={'These are the signing devices where you may have registered the Vault'}
          onPress={() => {}}
        />
      </Box>
    </ScreenWrapper>
  );
};

export default OtherRecoveryMethods;

const styles = StyleSheet.create({});
