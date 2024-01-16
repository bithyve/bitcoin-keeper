import { StyleSheet } from 'react-native';
import React from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperHeader from 'src/components/KeeperHeader';
import { Box } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { hp } from 'src/constants/responsive';
import { Tile } from '../NewKeeperAppScreen/NewKeeperAppScreen';

function OtherRecoveryMethods() {
  const { navigate } = useNavigation();
  return (
    <ScreenWrapper>
      <KeeperHeader
        title="Other methods for restoring the vault"
        subtitle="This method can only be used for restoring the vault"
      />
      <Box style={{ marginTop: hp(30) }} testID="view_allOtherMethods">
        <Tile
          title="All signers"
          subTitle="If you have all the signers that were initially used to create the vault"
          onPress={() => {
            navigate('LoginStack', { screen: 'VaultSetup', params: { isRecreation: true } });
          }}
        />
        <Tile
          title="Vault Configuration File"
          subTitle="Use this method if you have the vault configuration file."
          onPress={() => {
            navigate('LoginStack', { screen: 'VaultConfigurationRecovery' });
          }}
        />

        <Tile
          title="Signer with vault details"
          subTitle="These are the signers where you may have registered the vault"
          onPress={() => {
            navigate('LoginStack', { screen: 'SigningDeviceConfigRecovery' });
          }}
        />
      </Box>
    </ScreenWrapper>
  );
}

export default OtherRecoveryMethods;

const styles = StyleSheet.create({});
