import React, { useContext, useEffect, useState } from 'react';
import { Box, useColorMode } from 'native-base';

import BtcInput from 'src/assets/images/btc_input.svg';
import BtcWhiteInput from 'src/assets/images/btc_white.svg';

import { LocalizationContext } from 'src/context/Localization/LocContext';
import { wp } from 'src/constants/responsive';
import DeleteDarkIcon from 'src/assets/images/delete.svg';
import DeleteIcon from 'src/assets/images/deleteLight.svg';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import Text from 'src/components/KeeperText';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'src/store/hooks';
import { resetRealyWalletState } from 'src/store/reducers/bhr';
import { updateWalletProperty } from 'src/store/sagaActions/wallets';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { v4 as uuidv4 } from 'uuid';
import Buttons from 'src/components/Buttons';
import KeyPadView from '../AppNumPad/KeyPadView';
import ActivityIndicatorView from '../AppActivityIndicator/ActivityIndicatorView';

function TransferPolicy({
  wallet,
  close,
  secondaryBtnPress,
}: {
  wallet: Wallet;
  close: () => void;
  secondaryBtnPress: () => void;
}) {
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();
  const { relayWalletUpdateLoading, relayWalletUpdate, relayWalletError, realyWalletErrorMessage } =
    useAppSelector((state) => state.bhr);
  const { translations } = useContext(LocalizationContext);
  const { common, wallet: walletTranslation, settings } = translations;
  const [policyText, setPolicyText] = useState(wallet?.transferPolicy?.threshold?.toString());
  const dispatch = useDispatch();

  const onPressNumber = (digit) => {
    let temp = policyText;
    if (digit !== 'x') {
      temp += digit;
      setPolicyText(temp);
    }
  };

  useEffect(() => {
    if (relayWalletError) {
      showToast(common.somethingWrong);
      dispatch(resetRealyWalletState());
    }
    if (relayWalletUpdate) {
      close();
      showToast(walletTranslation.TransPolicyChange, <TickIcon />);
      dispatch(resetRealyWalletState());
    }
  }, [relayWalletUpdate, relayWalletError, realyWalletErrorMessage]);

  const onDeletePressed = () => {
    if (policyText) {
      setPolicyText(policyText.slice(0, -1));
    }
  };
  const presshandler = () => {
    if (Number(policyText) > 0) {
      wallet.transferPolicy.threshold = Number(policyText);
      dispatch(
        updateWalletProperty({
          walletId: wallet.id,
          key: 'transferPolicy',
          value: {
            id: uuidv4(),
            threshold: Number(policyText),
          },
        })
      );
    } else {
      showToast(walletTranslation.transPolicyCantZero);
    }
  };
  return (
    <Box backgroundColor={`${colorMode}.modalWhiteBackground`} width={wp(300)}>
      <Box justifyContent="center" alignItems="center">
        <Box
          marginX="5%"
          flexDirection="row"
          width="100%"
          justifyContent="center"
          alignItems="center"
          borderRadius={10}
          backgroundColor={`${colorMode}.seashellWhite`}
          padding={3}
          height={50}
        >
          <Box pl={5}>{colorMode === 'light' ? <BtcInput /> : <BtcWhiteInput />}</Box>
          <Box ml={2} width={0.5} backgroundColor="#BDB7B1" opacity={0.3} height={5} />
          <Text
            bold
            fontSize={15}
            color={`${colorMode}.greenText`}
            marginLeft={3}
            width="100%"
            letterSpacing={3}
          >
            {policyText && `${policyText} sats`}
          </Text>
        </Box>
      </Box>
      <Box py={25}>
        <Text fontSize={13} color={`${colorMode}.secondaryText`} letterSpacing={0.65}>
          {walletTranslation.editTransPolicyInfo}
        </Text>
      </Box>
      <Buttons
        primaryCallback={presshandler}
        primaryText={settings.SaveChanges}
        secondaryCallback={secondaryBtnPress}
        secondaryText={common.cancel}
        paddingHorizontal={wp(15)}
        primaryDisable={relayWalletUpdateLoading || relayWalletUpdate}
      />
      {/* keyboardview start */}
      <KeyPadView
        onPressNumber={onPressNumber}
        onDeletePressed={onDeletePressed}
        keyColor={colorMode === 'light' ? '#041513' : '#FFF'}
        ClearIcon={colorMode === 'dark' ? <DeleteIcon /> : <DeleteDarkIcon />}
      />
      {relayWalletUpdateLoading && <ActivityIndicatorView visible={relayWalletUpdateLoading} />}
    </Box>
  );
}

export default TransferPolicy;
