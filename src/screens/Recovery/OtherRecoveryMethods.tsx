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
        title="Other methods for restoring the Vault"
        subtitle="This method can only be used for restoring the Vault"
      />
      <Box style={{ marginTop: hp(30) }}>
        <Tile
          title="All Signing Devices"
          subTitle="If you have all the signing devices that were initially used to create the Vault"
          onPress={() => {
            navigate('LoginStack', { screen: 'VaultRecoveryAddSigner' });
          }}
        />
        <Tile
          title="Vault Configuration File"
          subTitle="Use this method if you have the Vault configuration file."
          onPress={() => {
            navigate('LoginStack', { screen: 'VaultConfigurationRecovery' });
          }}
        />

        <Tile
          title="Signing Device with Vault details"
          subTitle="These are the signing devices where you may have registered the Vault"
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
