import React, { useContext, useState } from 'react';
import { Box, View } from 'native-base';
import { Alert } from 'react-native';

import BtcInput from 'src/assets/images/btc_input.svg';

import { LocalizationContext } from 'src/common/content/LocContext';
import { wp } from 'src/common/data/responsiveness/responsive';
import DeleteIcon from 'src/assets/images/deleteBlack.svg';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { WalletSpecs } from 'src/core/wallets/interfaces/wallet';
import Text from 'src/components/KeeperText';
import KeyPadView from '../AppNumPad/KeyPadView';
import Buttons from '../Buttons';

function TransferPolicy({ wallet, close }) {
  const specs: WalletSpecs = JSON.parse(JSON.stringify(wallet.specs));

  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const [policyText, setPolicyText] = useState(specs.transferPolicy);

  const onPressNumber = (digit) => {
    let temp = policyText;
    if (digit !== 'x') {
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
    if (Number(policyText) > 0) {
      specs.transferPolicy = Number(policyText);
      dbManager.updateObjectById(RealmSchema.Wallet, wallet.id, { specs });
      close();
      Alert.alert('Transfer Policy Changed');
    } else {
      Alert.alert('Transfer Policy cannot be zero');
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
