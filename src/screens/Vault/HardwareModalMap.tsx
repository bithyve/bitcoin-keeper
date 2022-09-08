import { Box, Text, View } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useContext } from 'react';

import ColdCardSetupImage from 'src/assets/images/ColdCardSetup.svg';
import KeeperModal from 'src/components/KeeperModal';
import { LocalizationContext } from 'src/common/content/LocContext';
import { SignerType } from 'src/core/wallets/enums';
import { StyleSheet } from 'react-native';
import TapsignerSetupImage from 'src/assets/images/TapsignerSetup.svg';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

const BulletPoint = ({ text }) => {
  return (
    <Box
      marginTop={'4'}
      flexDirection={'row'}
      alignItems={'center'}
    >
      <Box
        height={hp(5)}
        width={wp(5)}
        backgroundColor={'light.modalText'}
        borderRadius={10}
        marginRight={wp(5)}
      />
      <Text
        color={'light.modalText'}
        fontSize={13}
        fontFamily={'body'}
        fontWeight={'200'}
        p={1}
        letterSpacing={1.65}
      >
        {text}
      </Text>
    </Box>
  )
}

const TapsignerSetupContent = () => {
  return (
    <View>
      <TapsignerSetupImage />
      <BulletPoint text={'You will need the Pin/CVC at the back of TAPSIGNER'} />
      <BulletPoint text={`Make sure that TAPSIGNER is not used as a Signer on other apps`} />
    </View>
  );
};
const ColdCardSetupContent = () => {
  return (
    <View>
      <Box ml={wp(21)}>
        <ColdCardSetupImage />
      </Box>
      <Box marginTop={'4'}>
        <Box flex={1} flexDirection={'row'} >
          <Box mb={hp(19)} mx={wp(2)}>
            <Text>{'\u2022 Step 1'}</Text>
          </Box>
          <Text
            color={'#073B36'}
            fontSize={13}
            fontWeight={200}
            letterSpacing={0.65}
            style={{
              marginLeft: wp(10),
              width: wp(210)
            }}>
            Send Assigned PSBT Lorem ipsum dolor sit amet, consectetur adipiscing elit
          </Text>
        </Box>
        <Box flex={1} flexDirection={'row'} marginTop={2} >
          <Box mb={hp(19)} mx={wp(2)}>
            <Text>{'\u2022 Step 2'}</Text>
          </Box>
          <Text
            color={'#073B36'}
            fontSize={13}
            fontWeight={200}
            letterSpacing={0.65}
            style={{
              marginLeft: wp(10),
              width: wp(200)
            }}>
            Recieve Assigned PSBT Lorem ipsum dolor sit amet, consectetur
          </Text>
        </Box>
      </Box>
    </View>
  );
};

const HardwareModalMap = ({ type, visible, close }) => {
  const { translations } = useContext(LocalizationContext);
  const tapsigner = translations['tapsigner'];
  const coldcard = translations['coldcard'];
  const ledger = translations['ledger'];
  const navigation = useNavigation();
  const navigateToTapsignerSetup = () => {
    close();
    navigation.dispatch(CommonActions.navigate({ name: 'AddTapsigner', params: {} }));
  };

  const navigateToColdCardSetup = () => {
    close();
    navigation.dispatch(CommonActions.navigate({ name: 'AddColdCard', params: {} }));
  };

  const navigateToLedgerSetup = () => {
    close();
    navigation.dispatch(CommonActions.navigate({ name: 'AddLedger', params: {} }));
  };
  return (
    <>
      <KeeperModal
        visible={visible && type === SignerType.TAPSIGNER}
        close={close}
        title={tapsigner.SetupTitle}
        subTitle={tapsigner.SetupDescription}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText={'Setup'}
        buttonTextColor={'#FAFAFA'}
        buttonCallback={navigateToTapsignerSetup}
        textColor={'#041513'}
        Content={TapsignerSetupContent}
      />
      <KeeperModal
        visible={visible && type === SignerType.COLDCARD}
        close={close}
        title={coldcard.SetupTitle}
        subTitle={coldcard.SetupDescription}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText={'Proceed'}
        buttonTextColor={'#FAFAFA'}
        buttonCallback={navigateToColdCardSetup}
        textColor={'#041513'}
        Content={ColdCardSetupContent}
      />
      <KeeperModal
        visible={visible && type === SignerType.LEDGER}
        close={close}
        title={ledger.SetupTitle}
        subTitle={ledger.SetupDescription}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        buttonBackground={['#00836A', '#073E39']}
        buttonText={'Setup'}
        buttonTextColor={'#FAFAFA'}
        buttonCallback={navigateToLedgerSetup}
        textColor={'#041513'}
        Content={ColdCardSetupContent}
      />
    </>
  );
};

export default HardwareModalMap;

const styles = StyleSheet.create({});
