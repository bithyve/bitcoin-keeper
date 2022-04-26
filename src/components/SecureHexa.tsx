import React, {
  useCallback,
} from 'react';

import { View } from 'react-native';
import { Text } from 'native-base';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import HardWare from 'src/assets/images/svgs/hardware.svg';
import HexaBottomSheet from 'src/components/BottomSheet';
import HexaPayComponent from 'src/components/HexaPayComponent';
import { importNewAccount } from 'src/store/actions/accounts';
import { useDispatch } from 'react-redux';

type Props = {
  bottomSheetRef: any,
  secureData: any
};

const SecureHexa = ({ bottomSheetRef, secureData }: Props) => {
  const dispatch = useDispatch();

  const closeSheet = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const secureWithHexa = useCallback(() => {
    const mnemonic = secureData?.mnemonic;
    if (mnemonic) {
      const accountDetails = {
        name: secureData?.walletName,
      };
      dispatch(importNewAccount(mnemonic, accountDetails));
      bottomSheetRef.current.close();
    }
  }, [secureData]);

  return (
    <HexaBottomSheet
      bottomSheetRef={bottomSheetRef}
      title="Secure Hexa Pay"
      subTitle={'Adding additional security'}
      snapPoints={['65%']}
      primaryText={'Confirm'}
      secondaryText={'Reject'}
      primaryCallback={secureWithHexa}
      secondaryCallback={closeSheet}
    >
      <View>
        <View style={styles.item}>
          <HexaPayComponent
            Icon={HardWare}
            title={'Hexa Pay'}
            subtitle={''}
            body={'Alice’s Wallet'}
          />
        </View>
        <View style={styles.item}>
          <Text
            style={styles.text}
            color={'light.lightBlack'}
            fontWeight={200}
            fontFamily={'body'}
            numberOfLines={2}
          >
            You are about the enhance your Hexa Pay wallet's security
          </Text>
        </View>
      </View>
    </HexaBottomSheet>
  );
};

const styles = ScaledSheet.create({
  text: {
    fontSize: RFValue(12),
    letterSpacing: '0.6@s',
    width: wp('80%'),
    fontWeight: '400',
  },
  item: {
    marginVertical: hp(2),
  },
});

export default SecureHexa;