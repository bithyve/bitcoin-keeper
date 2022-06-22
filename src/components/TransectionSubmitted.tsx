import React, { useRef, useContext } from 'react';
import { Text } from 'native-base';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import BottomSheet from '@gorhom/bottom-sheet';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';

import HexaBottomSheet from 'src/components/BottomSheet';
import TransectionSubmittedComponent from 'src/components/TransectionSubmittedComponent';
import { LocalizationContext } from 'src/common/content/LocContext';

const TransectionSubmitted = ({ }) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'transactions' ]
  const common = translations [ 'common' ]
  return (
    <HexaBottomSheet
      bottomSheetRef={bottomSheetRef}
      title={strings.TransactionConfirmed}
      subTitle={''}
      snapPoints={['25%', '65%']}
      primaryText={common.confirm}
      secondaryText={common.reject}
      primaryCallback={null}
      secondaryCallback={null}
    >
      <Text style={styles.text} color={'light.greenText'} fontWeight={200} fontFamily={'body'} numberOfLines={2}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore e
      </Text>
      <TransectionSubmittedComponent />

    </HexaBottomSheet>
  );
};

export default TransectionSubmitted;

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
