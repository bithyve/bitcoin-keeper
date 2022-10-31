import React, { useState, useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Input, View } from 'native-base';
import { useDispatch } from 'react-redux';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import { Alert } from 'react-native';

import Fonts from 'src/common/Fonts';
import HeaderTitle from 'src/components/HeaderTitle';
import StatusBarComponent from 'src/components/StatusBarComponent';
import { windowHeight } from 'src/common/data/responsiveness/responsive';
import Buttons from 'src/components/Buttons';
import { updateWalletDetails } from 'src/store/sagaActions/wallets';
import { LocalizationContext } from 'src/common/content/LocContext';
import { Wallet } from 'src/core/wallets/interfaces/wallet';

const EditWalletSettings = ({ route }) => {
  const navigtaion = useNavigation();
  const dispatch = useDispatch();
  const { translations } = useContext(LocalizationContext);
  const walletText = translations['wallet'];
  const common = translations['common'];

  const wallet: Wallet = route.params.wallet;

  const [walletName, setWalletName] = useState(wallet.presentationData.name);
  const [walletDescription, setWalletDescription] = useState(wallet.presentationData.description);

  const editWallet = () => {
    const details = {
      name: walletName,
      description: walletDescription,
    };
    dispatch(updateWalletDetails(wallet, details));
    Alert.alert('Wallet details updated');
    navigtaion.goBack();
  };

  return (
    <View style={styles.Container} background={'light.ReceiveBackground'}>
      <StatusBarComponent padding={50} />
      <HeaderTitle
        title={walletText.WalletDetails}
        subtitle={walletText.EditWalletDeatils}
        onPressHandler={() => navigtaion.goBack()}
        paddingTop={3}
      />
      <View marginX={4} marginY={windowHeight / 12}>
        <Input
          //   placeholder={walletText.WalletName}
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
          //   placeholder={walletText.SinglesigWallet}
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
              navigtaion.goBack();
            }}
            primaryText={'Save'}
            primaryCallback={editWallet}
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
export default EditWalletSettings;
