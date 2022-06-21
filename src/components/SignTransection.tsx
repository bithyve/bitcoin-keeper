import React, { useRef, useContext } from 'react';
import { View } from 'react-native';
import { Text } from 'native-base';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import BottomSheet from '@gorhom/bottom-sheet';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';

import HexaBottomSheet from 'src/components/BottomSheet';
import HexaPayComponent from 'src/components/HexaPayComponent';
import TransectionSignComponent from 'src/components/TransectionSignComponent';
import { LocalizationContext } from 'src/common/content/LocContext';

const SignTransection = ({ }) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'home' ]
  const common = translations [ 'common' ]

  return (
    <HexaBottomSheet
      bottomSheetRef={bottomSheetRef}
      title={strings.Signtransaction}
      subTitle={strings.Authenticatebitcoin}
      snapPoints={['25%', '79%']}
      primaryText={common.confirm}
      secondaryText={common.reject}
      primaryCallback={null}
      secondaryCallback={null}
    >
      <Text style={styles.text} color={'light.greenText'} fontWeight={200} fontFamily={'body'} numberOfLines={2}>
        {strings.Reviewtransaction}
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
