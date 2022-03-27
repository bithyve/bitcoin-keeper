import React, { useRef } from 'react';
import { View } from 'react-native';
import { Text } from 'native-base';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import BottomSheet from '@gorhom/bottom-sheet';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';

import HexaBottomSheet from 'src/components/BottomSheet';
import HexaPayComponent from 'src/components/HexaPayComponent';
import TransectionSignComponent from 'src/components/TransectionSignComponent';

const SignTransection = ({ }) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  return (
    <HexaBottomSheet
      bottomSheetRef={bottomSheetRef}
      title="Sign transaction"
      subTitle={'Lorem Ipsum Dolor Amet'}
      snapPoints={['25%', '79%']}
      primaryText={'Confirm'}
      secondaryText={'Reject'}
      primaryCallback={null}
      secondaryCallback={null}
    >
      <Text style={styles.text} color={'light.greenText'} fontWeight={200} fontFamily={'body'} numberOfLines={2}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore e
      </Text>
      <TransectionSignComponent />

    </HexaBottomSheet>
  );
};

export default SignTransection;

const styles = ScaledSheet.create({
  text: {
    fontSize: RFValue(12),
    letterSpacing: '0.6@s',
    width: wp('80%'),
    fontWeight: '400',
    paddingHorizontal: wp(2),
    paddingVertical: hp(3)

  }
});
