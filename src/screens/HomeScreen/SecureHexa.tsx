import React, { useCallback, useContext } from 'react';

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
import { importNewWallet } from 'src/store/sagaActions/wallets';
import { useDispatch } from 'react-redux';
import { LocalizationContext } from 'src/common/content/LocContext';

type Props = {
  bottomSheetRef: any;
  secureData: any;
};

const SecureHexa = ({ bottomSheetRef, secureData }: Props) => {
  const dispatch = useDispatch();

  const { translations } = useContext( LocalizationContext )
  const home = translations[ 'home' ]
  const common = translations[ 'common' ]

  const closeSheet = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const secureWithHexa = useCallback(() => {
    const mnemonic = secureData?.mnemonic;
    if (mnemonic) {
      const walletDetails = {
        name: secureData?.walletName,
      };
      dispatch(importNewWallet(mnemonic, walletDetails));
      bottomSheetRef.current.close();
    }
  }, [secureData]);

  return (
    <HexaBottomSheet
      bottomSheetRef={bottomSheetRef}
      title={home.SecureHexaPay}
      subTitle={home.Addingadditionalsecurity}
      snapPoints={['65%']}
      primaryText={common.confirm}
      secondaryText={common.reject}
      primaryCallback={secureWithHexa}
      secondaryCallback={closeSheet}
    >
      <View>
        <View style={styles.item}>
          <HexaPayComponent
            Icon={HardWare}
            title={home.HexaPay}
            subtitle={''}
            body={home.AliceWallet}
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
            {home.HexaPaywalletsecurity}
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
