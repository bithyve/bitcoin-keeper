import React, { useState } from 'react';
import { Box, Text, Pressable } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
import Modal from 'react-native-modal';

//components and functions
import ShowXPub from 'src/components/XPub/ShowXPub';
import SeedConfirmPasscode from 'src/components/XPub/SeedConfirmPasscode';
import Header from 'src/components/Header';
import StatusBarComponent from 'src/components/StatusBarComponent';
import InfoBox from 'src/components/InfoBox';
import { wp, hp } from 'src/common/data/responsiveness/responsive';
// icons
import Arrow from 'src/assets/images/svgs/icon_arrow_Wallet.svg';
import BackupIcon from 'src/assets/icons/backup.svg';
import ModalWrapper from 'src/components/Modal/ModalWrapper';

type Props = {
  title: string;
  subTitle: string;
  onPress: () => void;
  Icon: boolean;
};

const WalletSettings = () => {
  const navigtaion = useNavigation();
  //
  const [xpubVisible, setXPubVisible] = useState(false);
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);

  const Option = ({ title, subTitle, onPress, Icon }: Props) => {
    return (
      <Pressable
        flexDirection={'row'}
        alignItems={'center'}
        width={'100%'}
        style={{ marginVertical: hp(20) }}
        onPress={onPress}
      >
        {Icon && (
          <Box w={'16%'}>
            <BackupIcon />
          </Box>
        )}
        <Box w={Icon ? '80%' : '96%'}>
          <Text
            color={'light.lightBlack'}
            fontFamily={'body'}
            fontWeight={200}
            fontSize={RFValue(14)}
            letterSpacing={1.12}
          >
            {title}
          </Text>
          <Text
            color={'light.GreyText'}
            fontFamily={'body'}
            fontWeight={200}
            fontSize={RFValue(12)}
            letterSpacing={0.6}
          >
            {subTitle}
          </Text>
        </Box>
        <Box w={'4%'}>
          <Arrow />
        </Box>
      </Pressable>
    );
  };

  return (
    <Box style={styles.Container} background={'light.ReceiveBackground'}>
      <StatusBarComponent padding={50} />
      <Box>
        <Header
          title={'Wallet Settings'}
          subtitle={'Lorem Ipsum Dolor'}
          onPressHandler={() => navigtaion.goBack()}
          headerTitleColor={'light.textBlack'}
          fontSize={20}
        />
      </Box>
      <Box
        borderBottomColor={'light.divider'}
        borderBottomWidth={0.2}
        marginTop={hp(60)}
        paddingX={wp(25)}
      >
        <Option
          title={'Wallet Backup'}
          subTitle={'Setup backup for Wallet'}
          onPress={() => {
            navigtaion.navigate('BackupWallet');
          }}
          Icon={true}
        />
      </Box>
      <Box alignItems={'center'} paddingX={wp(25)}>
        <Option
          title={'Wallet Details'}
          subTitle={'Change wallet name & description'}
          onPress={() => {
            console.log('Wallet Details');
          }}
          Icon={false}
        />
        <Option
          title={'Show xPub'}
          subTitle={'Use to create a external watch-only wallet'}
          onPress={() => {
            setXPubVisible(true);
          }}
          Icon={false}
        />
        <Option
          title={'Wallet seed words'}
          subTitle={'Use to link external wallets to Keeper'}
          onPress={() => {
            setConfirmPassVisible(true);
          }}
          Icon={false}
        />
      </Box>

      {/* {Bottom note} */}
      <Box position={'absolute'} bottom={hp(45)} marginX={5}>
        <InfoBox
          title={'Note'}
          desciption={
            'These settings are for your Default Wallet only and does not affect other wallets'
          }
          width={250}
        />
      </Box>
      {/* Modals */}
      <Box>
        <ModalWrapper visible={xpubVisible} onSwipeComplete={() => setXPubVisible(false)}>
          <ShowXPub
            closeBottomSheet={() => {
              setXPubVisible(false);
            }}
          />
        </ModalWrapper>
        <ModalWrapper
          visible={confirmPassVisible}
          onSwipeComplete={() => setConfirmPassVisible(false)}
        >
          <SeedConfirmPasscode
            closeBottomSheet={() => {
              setConfirmPassVisible(false);
            }}
          />
        </ModalWrapper>
      </Box>
      {/* end */}
    </Box>
  );
};

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: '20@s',
    position: 'relative',
  },
});
export default WalletSettings;
