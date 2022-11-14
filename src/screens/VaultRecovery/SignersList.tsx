import { Box, ScrollView, Text, View } from 'native-base';
import React, { useState } from 'react';
import { hp, windowHeight, windowWidth, wp } from 'src/common/data/responsiveness/responsive';

import ColdCardSetupImage from 'src/assets/images/ColdCardSetup.svg';
import HeaderTitle from 'src/components/HeaderTitle';
import KeeperModal from 'src/components/KeeperModal';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { SignerType } from 'src/core/wallets/enums';
import TapsignerSetupImage from 'src/assets/images/TapsignerSetup.svg';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { WalletMap } from '../Vault/WalletMap';
import { useNavigation } from '@react-navigation/native';

const TapsignerSetupContent = () => {
  return (
    <View>
      <TapsignerSetupImage />
      <Box marginTop={'4'}>
        <Text color={'#073B36'} fontSize={13} fontFamily={'body'} fontWeight={'100'} p={1}>
          {`\u2022 You will need the Pin/CVC at the back of TAPSIGNER`}
        </Text>
        <Text color={'#073B36'} fontSize={13} fontFamily={'body'} fontWeight={'100'} p={1}>
          {'\u2022 Make sure that TAPSIGNER is not used as a Signer on other apps'}
        </Text>
      </Box>
    </View>
  );
};

const ColdCardSetupContent = () => {
  return (
    <View justifyContent={'flex-start'} width={wp(300)}>
      <Box ml={wp(21)}>
        <ColdCardSetupImage />
      </Box>
      <Box marginTop={'4'} alignItems={'flex-start'}>
        <Box flex={1} flexDirection={'row'} alignItems={'space-between'} justifyContent={'center'}>
          <Box mb={hp(19)} mx={wp(10)} flexDirection={'row'}>
            <Text color={'#073B36'} fontSize={13} fontFamily={'body'} fontWeight={'100'} ml={3}>
              {`\u2022 Export the xPub by going to Settings > Multisig wallet > Export xPub. From here choose the NFC option to make the transfer and remember the account you had chosen (This is important for recovering your vault).\n`}
            </Text>
          </Box>
        </Box>
        <Box flex={1} flexDirection={'row'} alignItems={'space-between'} justifyContent={'center'}>
          <Box mb={hp(19)} mx={wp(10)} flexDirection={'row'}>
            <Text color={'#073B36'} fontSize={13} fontFamily={'body'} fontWeight={'100'} ml={3}>
              {`\u2022 Make sure you enable Testnet mode on the coldcard if you are running the app in the Testnet more from Advance option > Danger Zone > Testnet and enable it`}
            </Text>
          </Box>
        </Box>
      </Box>
    </View>
  );
};

const SignersList = () => {
  type HWProps = {
    type: SignerType;
    first?: boolean;
    last?: boolean;
  };

  const { navigate } = useNavigation();

  const HardWareWallet = ({ type, first = false, last = false }: HWProps) => {
    const [visible, setVisible] = useState(false);
    const onPress = () => {
      open();
    };

    const open = () => setVisible(true);
    const close = () => setVisible(false);

    return (
      <>
        <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
          <Box
            backgroundColor={'light.lightYellow'}
            borderTopRadius={first ? 15 : 0}
            borderBottomRadius={last ? 15 : 0}
          >
            <Box
              alignItems={'center'}
              height={windowHeight * 0.08}
              flexDirection={'row'}
              style={{
                paddingVertical: hp(25),
                paddingLeft: wp(40),
              }}
            >
              <Box
                style={{
                  marginRight: wp(20),
                  width: wp(15),
                }}
              >
                {WalletMap(type).Icon}
              </Box>
              <Box opacity={0.3} backgroundColor={'light.divider'} height={hp(24)} width={0.5} />
              <Box
                style={{
                  marginLeft: wp(23),
                }}
              >
                {WalletMap(type).Logo}
              </Box>
            </Box>
            <Box
              opacity={0.1}
              backgroundColor={'light.divider'}
              width={windowWidth * 0.8}
              height={0.5}
            />
          </Box>
        </TouchableOpacity>
        <KeeperModal
          visible={visible && type === SignerType.TAPSIGNER}
          close={close}
          title={'Verify TAPSIGNER'}
          subTitle={'Keep you TAPSIGNER ready'}
          modalBackground={['#F7F2EC', '#F7F2EC']}
          buttonBackground={['#00836A', '#073E39']}
          buttonText={'Verify'}
          buttonTextColor={'#FAFAFA'}
          buttonCallback={() => {
            navigate('TapSignerRecovery');
            close();
          }}
          textColor={'#041513'}
          Content={TapsignerSetupContent}
        />
        <KeeperModal
          visible={visible && type === SignerType.COLDCARD}
          close={close}
          title={'Verify Coldcard'}
          subTitle={'Keep you Coldcard ready'}
          modalBackground={['#F7F2EC', '#F7F2EC']}
          buttonBackground={['#00836A', '#073E39']}
          buttonText={'Proceed'}
          buttonTextColor={'#FAFAFA'}
          buttonCallback={() => {
            navigate('ColdCardReocvery');
            close();
          }}
          textColor={'#041513'}
          Content={ColdCardSetupContent}
        />
      </>
    );
  };

  return (
    <ScreenWrapper>
      <HeaderTitle
        title={'Select Signing Device'}
        subtitle={'To recover your vault'}
        headerTitleColor={'light.textBlack'}
        paddingTop={hp(5)}
      />
      <ScrollView style={{ height: hp(520) }} showsVerticalScrollIndicator={false}>
        <Box paddingY={'4'}>
          {['TAPSIGNER', 'COLDCARD'].map((type: SignerType, index: number) => (
            <HardWareWallet type={type} first={index === 0} last={index === 1} />
          ))}
        </Box>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default SignersList;
