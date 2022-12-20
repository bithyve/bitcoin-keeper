import React, { useContext, useState } from 'react';
import { Box, Text, View } from 'native-base';
import { Alert } from 'react-native';

import BtcInput from 'src/assets/images/svgs/btc_input.svg';

import { LocalizationContext } from 'src/common/content/LocContext';
import { wp } from 'src/common/data/responsiveness/responsive';
import DeleteIcon from 'src/assets/icons/deleteBlack.svg';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { WalletSpecs } from 'src/core/wallets/interfaces/wallet';
import KeyPadView from '../AppNumPad/KeyPadView';
import Buttons from '../Buttons';

function TransferPolicy({ wallet, close }) {
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const [policyText, setPolicyText] = useState('');

  const onPressNumber = (digit) => {
    let temp = policyText;
    if (digit != 'x') {
      temp += digit;
      setPolicyText(temp);
    }
  };

  const onDeletePressed = () => {
    if (policyText) {
      setPolicyText(policyText.slice(0, -1));
    }
  };
  const presshandler = () => {
    const specs: WalletSpecs = JSON.parse(JSON.stringify(wallet.specs));
    specs.transferPolicy = Number(policyText);
    dbManager.updateObjectById(RealmSchema.Wallet, wallet.id, { specs });
    Alert.alert('Transfer Policy Changed');
  };

  return (
    <Box bg="light.ReceiveBackground" width={wp(275)} borderRadius={10}>
      <Box justifyContent="center" alignItems="center">
        <View
          marginX="5%"
          flexDirection="row"
          width="100%"
          justifyContent="center"
          alignItems="center"
          borderRadius={5}
          backgroundColor="light.lightYellow"
          padding={3}
        >
          <View marginLeft={4}>
            <BtcInput />
          </View>
          <View marginLeft={2} width={0.5} backgroundColor="#BDB7B1" opacity={0.3} height={5} />
          <Text
            fontWeight={300}
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
        <Text
          fontSize={13}
          color="light.modalText"
          fontFamily="body"
          fontWeight={200}
          letterSpacing={0.65}
        >
          This will only trigger a transfer request which you need to approve before the transfer is
          done
        </Text>
      </Box>

      <Buttons
        primaryCallback={presshandler}
        primaryText={common.confirm}
        secondaryCallback={close}
        secondaryText={common.cancel}
        paddingHorizontal={wp(30)}
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
