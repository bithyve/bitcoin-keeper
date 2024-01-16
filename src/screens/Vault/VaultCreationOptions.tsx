import React from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperHeader from 'src/components/KeeperHeader';
import { Box } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { hp } from 'src/constants/responsive';
import { Tile } from '../NewKeeperAppScreen/NewKeeperAppScreen';

function VaultCreationOptions() {
  const { navigate } = useNavigation();
  return (
    <ScreenWrapper>
      <KeeperHeader
        title="Methods for creating the Vault"
        subtitle="This method can only be used for creating or restoring the Vault"
      />
      <Box style={{ marginTop: hp(30) }}>
        <Tile
          title="All Signing Devices"
          subTitle="If you have all the signing devices that were initially used to create the Vault"
          onPress={() => {
            navigate('VaultSetup');
          }}
        />
        <Tile
          title="Vault Configuration File"
          subTitle="Use this method if you have the Vault configuration file."
          onPress={() => {
            navigate('VaultConfigurationCreation');
          }}
        />

        <Tile
          title="Signing Device with Vault details"
          subTitle="These are the signing devices where you may have registered the Vault"
          onPress={() => {
            navigate('SigningDeviceConfigRecovery');
          }}
        />
      </Box>
    </ScreenWrapper>
  );
}

export default VaultCreationOptions;
