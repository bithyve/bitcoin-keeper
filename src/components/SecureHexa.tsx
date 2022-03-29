import React, { useCallback, useRef } from 'react';
import { View } from 'react-native';
import { Text } from 'native-base';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import BottomSheet from '@gorhom/bottom-sheet';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';

import HexaBottomSheet from 'src/components/BottomSheet';
import HexaPayComponent from 'src/components/HexaPayComponent';
import { importNewAccount } from 'src/store/actions/accounts';
import { useDispatch } from 'react-redux';

const SecureHexa = ({ bottomSheetRef, secureData }) => {
  const dispatch = useDispatch()

  const closeSheet = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const secureWithHexa = useCallback(() => {
      const mnemonic = secureData?.mnemonic
      if(mnemonic){
        dispatch(importNewAccount(mnemonic));
        bottomSheetRef.current.close();  
      }
    }, [secureData]);

  return (
    <HexaBottomSheet
      bottomSheetRef={bottomSheetRef}
      title="Secure Hexa Pay"
      subTitle={'Lorem Ipsum Dolor Amet'}
      snapPoints={['65%']}
      primaryText={'Confirm'}
      secondaryText={'Reject'}
      primaryCallback={secureWithHexa}
      secondaryCallback={closeSheet}
    >
      <View>
        <View style={styles.item}>
          <HexaPayComponent />
        </View>
        <View style={styles.item}>
          <Text style={styles.text} color={'light.lightBlack'} fontWeight={200} fontFamily={'body'} numberOfLines={2}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore e
          </Text>
        </View>
      </View>
    </HexaBottomSheet>
  );
};

export default SecureHexa;

const styles = ScaledSheet.create({
  text: {
    fontSize: RFValue(12),
    letterSpacing: '0.6@s',
    width: wp('80%'),
    fontWeight: '400'
  },
  item: {
    marginVertical: hp(2)
  }
});
