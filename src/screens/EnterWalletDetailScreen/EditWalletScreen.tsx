import React, { useState, useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Input, View } from 'native-base';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';

import Fonts from 'src/common/Fonts';
import HeaderTitle from 'src/components/HeaderTitle';
import StatusBarComponent from 'src/components/StatusBarComponent';
import { windowHeight } from 'src/common/data/responsiveness/responsive';
import Buttons from 'src/components/Buttons';
import { LocalizationContext } from 'src/common/content/LocContext';
// import { newWalletsInfo } from 'src/store/sagas/wallets';
// import { WalletType } from 'src/core/wallets/interfaces/enum';
// import { useDispatch } from 'react-redux';
// import { addNewWallets } from 'src/store/sagaActions/wallets';

const EditWalletScreen = () => {
  const navigtaion = useNavigation();
  const [walletName, setWalletName] = useState('');
  const [walletDescription, setWalletDescription] = useState('');

  const { translations } = useContext(LocalizationContext)
  const wallet = translations['wallet']
  const common = translations['common']

  return (
    <View style={styles.Container} background={'light.ReceiveBackground'}>
      <StatusBarComponent padding={50} />
      <HeaderTitle
        title={common.EditDetails}
        subtitle={'Lorem ipsum dolor sit amet'}
        onPressHandler={() => navigtaion.goBack()}
        paddingTop={3}
      />
      <View marginX={4} marginY={windowHeight / 12}>
        <Input
          placeholder={'Maldives Funds'}
          placeholderTextColor={'light.greenText'}
          backgroundColor={'light.lightYellow'}
          value={walletName}
          onChangeText={(value) => setWalletName(value)}
          style={styles.inputField}
          borderRadius={10}
          marginY={2}
          borderWidth={'0'}
        />
        <Input
          placeholder={wallet.SinglesigWallet}
          placeholderTextColor={'light.greenText'}
          backgroundColor={'light.lightYellow'}
          value={walletDescription}
          onChangeText={(value) => setWalletDescription(value)}
          style={styles.inputField}
          borderRadius={10}
          borderWidth={'0'}
          marginY={2}
        />
        <View marginY={20}>
          <Buttons
            secondaryText={common.cancel}
            secondaryCallback={() => {
              console.log('Cancel');
            }}
            primaryText={common.create}
            primaryCallback={() => { }}
            primaryDisable={!walletName || !walletDescription}
          />
        </View>
      </View>
    </View>
  );
};

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: '20@s',
  },
  addWalletText: {
    fontSize: RFValue(22),
    lineHeight: '20@s',
    letterSpacing: '0.7@s',
    marginTop: hp(5),
  },
  addWalletDescription: {
    fontSize: RFValue(12),
    lineHeight: '15@s',
    letterSpacing: '0.5@s',
  },
  inputField: {
    padding: 30,
    color: '#073E39',
    marginVertical: 10,
    fontFamily: Fonts.RobotoCondensedRegular,
    fontSize: RFValue(13),
    letterSpacing: 0.96,
  },
});
export default EditWalletScreen;
