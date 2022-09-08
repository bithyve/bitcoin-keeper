import React, { useState, useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Box, Text, View } from 'native-base';
import DeviceSelectionScreen from './DeviceSelectionScreen';
import { SafeAreaView } from 'react-native';
import ShowAddressScreen from './ShowAddressScreen';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import KeeperModal from 'src/components/KeeperModal';
import { LocalizationContext } from 'src/common/content/LocContext';
import LedgerImage from 'src/assets/images/ledger_image.svg';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

// This is helpful if you want to see BLE logs. (only to use in dev mode)

const AddLedger = ({}) => {
  const [transport, setTransport] = useState(null);
  const [visible, setVisible] = useState(true);
  const { translations } = useContext(LocalizationContext);
  const ledger = translations['ledger'];
  const onSelectDevice = async (device) => {
    const transport = await TransportBLE.open(device);
    // A better way is to pass in the device.id and handle the connection internally.
    transport.on('disconnect', () => {
      setTransport(null);
    });
    setTransport(transport);
  };

  const navigation = useNavigation();

  const open = () => setVisible(true);
  const close = () => navigation.goBack();

  const LedgerSetupContent = () => {
    return (
      <View>
        {/* this is a dummy logo, Summi will update the asset in sprint 9 */}
        <Box ml={wp(21)}>
          <LedgerImage />
        </Box>
        <Box marginTop={'4'}>
          <Text color={'#073B36'} fontSize={13} fontFamily={'body'} fontWeight={'100'} p={1}>
            {`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do`}
          </Text>
        </Box>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {!transport ? (
        <KeeperModal
          visible={visible}
          close={close}
          title={ledger.ScanningBT}
          subTitle={ledger.KeepLedgerReady}
          modalBackground={['#F7F2EC', '#F7F2EC']}
          buttonBackground={['#00836A', '#073E39']}
          textColor={'#041513'}
          Content={LedgerSetupContent}
        />
      ) : (
        // <DeviceSelectionScreen onSelectDevice={onSelectDevice} />
        <ShowAddressScreen transport={transport} />
      )}
    </SafeAreaView>
  );
};

export default AddLedger;
