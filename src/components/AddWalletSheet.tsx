import React from 'react'

import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';

import Fonts from 'src/common/Fonts';
import HexaBottomSheet from './BottomSheet';

const AddWalletSheet = ({
  addWalletSheetRef,
  closeAddWalletSheet,
  addWalletType,
  setAddWalletType,
  accountName,
  setAccountName,
  accountDescription,
  setAccountDescription,
  addWallet,
}) => {
  return (
    <HexaBottomSheet
      title={'Add Wallet Details'}
      subTitle={''}
      snapPoints={['50%']}
      bottomSheetRef={addWalletSheetRef}
      primaryText={'Create'}
      secondaryText={'Cancel'}
      primaryCallback={addWallet}
      secondaryCallback={closeAddWalletSheet}
    >

      <BottomSheetTextInput
        placeholder="Wallet Name"
        placeholderTextColor={'#D8DBD5'}
        value={accountName}
        onChangeText={(value) => setAccountName(value)}
        style={styles.inputField}
      />
      <BottomSheetTextInput
        placeholder="To easily remember wallets purpose"
        placeholderTextColor={'#D8DBD5'}
        value={accountDescription}
        onChangeText={(value) => setAccountDescription(value)}
        style={styles.inputField}
      />
    </HexaBottomSheet>
  );
};


const styles = ScaledSheet.create({

  inputField: {
    padding: 30,
    borderWidth: 0,
    color: '#073E39',
    backgroundColor: '#D8A57210',
    marginVertical: 10,
    fontFamily: Fonts.RobotoCondensedRegular,
    fontSize: RFValue(13),
    letterSpacing: 0.65,
    borderRadius: 10,
  },
});
export default AddWalletSheet;
