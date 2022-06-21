import React, {useContext} from 'react';

import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';

import Fonts from 'src/common/Fonts';
import HexaBottomSheet from '../../components/BottomSheet';
import { LocalizationContext } from 'src/common/content/LocContext';

const AddWalletSheet = ({
  addWalletSheetRef,
  closeAddWalletSheet,
  addWalletType,
  setAddWalletType,
  walletName,
  setWalletName,
  walletDescription,
  setWalletDescription,
  addWallet,
}) => {

  const { translations } = useContext( LocalizationContext )
  const wallet = translations[ 'wallet' ]
  const common = translations[ 'common' ]

  return (
    <HexaBottomSheet
      title={wallet.AddWalletDetails}
      subTitle={''}
      snapPoints={['50%']}
      bottomSheetRef={addWalletSheetRef}
      primaryText={common.create}
      secondaryText={common.cancel}
      primaryCallback={addWallet}
      secondaryCallback={closeAddWalletSheet}
    >
      <BottomSheetTextInput
        placeholder={wallet.WalletName}
        placeholderTextColor={'#D8DBD5'}
        value={walletName}
        onChangeText={(value) => setWalletName(value)}
        style={styles.inputField}
      />
      <BottomSheetTextInput
        placeholder={wallet.rememberwalletspurpose}
        placeholderTextColor={'#D8DBD5'}
        value={walletDescription}
        onChangeText={(value) => setWalletDescription(value)}
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
