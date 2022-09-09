import { View, Text } from 'react-native';
import React from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import Header from 'src/components/Header';
import { Box } from 'native-base';
import AddSignerIcon from 'src/assets/icons/addSigner.svg';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';

const VaultRecovery = () => {
  const { navigate } = useNavigation();
  return (
    <ScreenWrapper>
      <Header
        title={'Add Signing Devices'}
        subtitle={'to recover your vault'}
        headerTitleColor={'light.textBlack'}
      />
      <TouchableOpacity onPress={() => navigate('LoginStack', { screen: 'SignersList' })}>
        <Box alignSelf={'center'} alignItems={'center'}>
          <AddSignerIcon />
        </Box>
      </TouchableOpacity>
    </ScreenWrapper>
  );
};

export default VaultRecovery;
