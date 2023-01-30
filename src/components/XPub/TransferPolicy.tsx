import React, { useContext, useEffect, useState } from 'react';
import { Box, View } from 'native-base';

import BtcInput from 'src/assets/images/btc_input.svg';

import { LocalizationContext } from 'src/common/content/LocContext';
import { wp } from 'src/common/data/responsiveness/responsive';
import DeleteIcon from 'src/assets/images/deleteBlack.svg';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import Text from 'src/components/KeeperText';
import KeyPadView from '../AppNumPad/KeyPadView';
import Buttons from '../Buttons';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'src/store/hooks';
import { resetRealyWalletState } from 'src/store/reducers/bhr';
import { updateWalletProperty } from 'src/store/sagaActions/wallets';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { v4 as uuidv4 } from 'uuid';

function TransferPolicy({ wallet, close }: { wallet: Wallet; close: () => void }) {
  const { showToast } = useToastMessage();
  const { relayWalletUpdateLoading, relayWalletUpdate, relayWalletError, realyWalletErrorMessage } =
    useAppSelector((state) => state.bhr);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const [policyText, setPolicyText] = useState(wallet.transferPolicy.threshold.toString());
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
      showToast('Something went wrong');
      dispatch(resetRealyWalletState());
    }
    if (relayWalletUpdate) {
      showToast('Transfer Policy Changed', <TickIcon />);
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
      close();
      wallet.transferPolicy.threshold = Number(policyText);
      dispatch(
        updateWalletProperty({
          wallet,
          key: 'transferPolicy',
          value: {
            id: uuidv4(),
            threshold: Number(policyText),
          },
        })
      );
    } else {
      showToast('Transfer Policy cannot be zero');
    }
  };

  return (
    <Box backgroundColor="light.secondaryBackground" width={wp(275)} borderRadius={10}>
      <Box justifyContent="center" alignItems="center">
        <View
          marginX="5%"
          flexDirection="row"
          width="100%"
          justifyContent="center"
          alignItems="center"
          borderRadius={5}
          backgroundColor="light.primaryBackground"
          padding={3}
        >
          <View marginLeft={4}>
            <BtcInput />
          </View>
          <View marginLeft={2} width={0.5} backgroundColor="#BDB7B1" opacity={0.3} height={5} />
          <Text
            bold
            fontSize={15}
            color="light.greenText"
            marginLeft={3}
            width="100%"
            letterSpacing={3}
          >
            {policyText && `${policyText} sats`}
          </Text>
        </View>
      </Box>
      <Box py={5}>
        <Text fontSize={13} color="light.greenText" letterSpacing={0.65}>
          This will trigger a transfer request which you need to approve
        </Text>
      </Box>

      <Buttons
        primaryCallback={presshandler}
        primaryLoading={relayWalletUpdateLoading}
        primaryText={common.confirm}
        secondaryCallback={close}
        secondaryText={common.cancel}
        paddingHorizontal={wp(30)}
        touchDisable={true}
      />
      {/* keyboardview start */}
      <KeyPadView
        onPressNumber={onPressNumber}
        onDeletePressed={onDeletePressed}
        keyColor="#041513"
        ClearIcon={<DeleteIcon />}
      />
    </Box>
  );
}
export default TransferPolicy;
