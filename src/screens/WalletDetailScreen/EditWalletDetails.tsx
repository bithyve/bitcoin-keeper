import React, { useState, useContext, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Input, View, Box } from 'native-base';
import { useDispatch } from 'react-redux';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ScaledSheet } from 'react-native-size-matters';

import KeeperText from 'src/components/KeeperText';
import Fonts from 'src/common/Fonts';
import HeaderTitle from 'src/components/HeaderTitle';
import StatusBarComponent from 'src/components/StatusBarComponent';
import { windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import Buttons from 'src/components/Buttons';
import { updateWalletDetails } from 'src/store/sagaActions/wallets';
import { LocalizationContext } from 'src/common/content/LocContext';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { useAppSelector } from 'src/store/hooks';
import { resetRealyWalletState } from 'src/store/reducers/bhr';

function EditWalletSettings({ route }) {
  const navigtaion = useNavigation();
  const dispatch = useDispatch();
  const { translations } = useContext(LocalizationContext);
  const walletText = translations.wallet;
  const { common } = translations;

  const { wallet } = route.params;
  const { showToast } = useToastMessage();
  const { relayWalletUpdateLoading, relayWalletUpdate, relayWalletError, realyWalletErrorMessage } =
    useAppSelector((state) => state.bhr);

  const [walletName, setWalletName] = useState(wallet.presentationData.name);
  const [walletDescription, setWalletDescription] = useState(wallet.presentationData.description);

  const editWallet = () => {
    const details = {
      name: walletName,
      description: walletDescription,
    };
    dispatch(updateWalletDetails(wallet, details));
  };

  useEffect(() => {
    if (relayWalletError) {
      showToast(realyWalletErrorMessage, <ToastErrorIcon />);
      dispatch(resetRealyWalletState());
    }
    if (relayWalletUpdate) {
      showToast('Wallet details updated', <TickIcon />);
      dispatch(resetRealyWalletState());
      navigtaion.goBack();
    }
  }, [relayWalletUpdate, relayWalletError, realyWalletErrorMessage]);

  return (
    <View style={styles.Container} background="light.mainBackground">
      <StatusBarComponent padding={50} />
      <HeaderTitle
        title={walletText.WalletDetails}
        subtitle={walletText.EditWalletDeatils}
        onPressHandler={() => navigtaion.goBack()}
        paddingTop={3}
      />
      <View style={styles.inputWrapper}>
        <Box backgroundColor="light.primaryBackground" style={styles.inputFieldWrapper}>
          <Input
            //   placeholder={walletText.WalletName}
            placeholderTextColor="light.greenText"
            value={walletName}
            onChangeText={(value) => setWalletName(value)}
            style={styles.inputField}
            width={wp(260)}
            marginY={2}
            borderWidth="0"
            maxLength={28}
          />
          <KeeperText color="light.GreyText" style={styles.limitText}>
            {walletName && walletName.length}/28
          </KeeperText>
        </Box>
        <Box backgroundColor="light.primaryBackground" style={styles.inputFieldWrapper}>
          <Input
            //   placeholder={walletText.SinglesigWallet}
            placeholderTextColor="light.greenText"
            value={walletDescription}
            onChangeText={(value) => setWalletDescription(value)}
            style={styles.inputField}
            width={wp(260)}
            borderWidth="0"
            marginY={2}
            maxLength={40}
          />
          <KeeperText color="light.GreyText" style={styles.limitText}>
            {walletDescription && walletDescription.length}/40
          </KeeperText>
        </Box>
        <View style={styles.buttonWrapper}>
          <Buttons
            secondaryText={common.cancel}
            secondaryCallback={() => {
              navigtaion.goBack();
            }}
            primaryText="Save"
            primaryCallback={editWallet}
            primaryLoading={relayWalletUpdateLoading}
            primaryDisable={!walletName || !walletDescription}
          />
        </View>
      </View>
    </View>
  );
}

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: '20@s',
  },
  addWalletText: {
    fontSize: 22,
    lineHeight: '20@s',
    letterSpacing: '0.7@s',
    marginTop: hp(5),
  },
  addWalletDescription: {
    fontSize: 12,
    lineHeight: '15@s',
    letterSpacing: '0.5@s',
  },
  inputField: {
    padding: 30,
    color: '#073E39',
    marginVertical: 10,
    fontFamily: Fonts.RobotoCondensedRegular,
    fontSize: 13,
    letterSpacing: 0.96,
  },
  inputFieldWrapper: {
    flexDirection: 'row',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  inputWrapper: {
    marginHorizontal: 4,
    marginVertical: windowHeight / 15,
  },
  limitText: {
    marginRight: 10,
    fontSize: 10,
    alignSelf: 'flex-end',
  },
  buttonWrapper: {
    marginVertical: 25,
  },
});
export default EditWalletSettings;
