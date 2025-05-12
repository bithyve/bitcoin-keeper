import { Box, useColorMode } from 'native-base';
import React from 'react';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import Text from 'src/components/KeeperText';
import AirDropIcon from 'src/assets/images/airdrop-circle-icon.svg';
import QR_Icon from 'src/assets/images/qr-scan-icon.svg';
import ShowQrIcon from 'src/assets/images/show-qr-icon.svg';
import { StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import { TouchableOpacity } from 'react-native-gesture-handler';

function NewContactModalContent({ setAddNewContact, navigation }) {
  const { colorMode } = useColorMode();

  const walletOptions = [
    {
      id: 1,
      label: 'Show QR',
      icon: <ShowQrIcon />,
      onPress: () => {
        navigation.navigate('ContactScanQr');
        setAddNewContact(false);
      },
    },
    {
      id: 2,
      label: 'Share QR',
      icon: <QR_Icon />,
      onPress: () => {
        console.log('Share QR pressed');
        navigation.navigate('ContactShareQr');
        setAddNewContact(false);
      },
    },
    {
      id: 3,
      label: `Share Link`,
      icon: <AirDropIcon />,
      onPress: () => {
        console.log('Share Link pressed');
        setAddNewContact(false);
      },
    },
  ];

  return (
    <Box>
      {walletOptions.map((option) => (
        <TouchableOpacity key={option.id} onPress={option.onPress}>
          <Box
            style={styles.container}
            backgroundColor={`${colorMode}.textInputBackground`}
            borderColor={`${colorMode}.separator`}
            borderWidth={1}
          >
            <CircleIconWrapper
              width={40}
              icon={option.icon}
              backgroundColor={`${colorMode}.pantoneGreen`}
            />
            <Text>{option.label}</Text>
          </Box>
        </TouchableOpacity>
      ))}
    </Box>
  );
}

export default NewContactModalContent;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(20),
    paddingHorizontal: wp(20),
    paddingVertical: hp(16),
    borderRadius: 10,
    marginBottom: hp(10),
  },
});
