import { Box, ScrollView } from 'native-base';
import React from 'react';
import OptionCard from 'src/components/OptionCard';
import WalletGreenIcon from 'src/assets/images/wallet_green.svg';
import VaultGreenIcon from 'src/assets/images/vault_green.svg';
import Bird from 'src/assets/images/bird.svg';
import { updateLastVisitedTimestamp } from 'src/store/reducers/storage';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import {
  ASSISTED_KEYS,
  BUY_NEW_HARDWARE_SIGNER,
  CANARY_WALLETS,
  SAFE_KEEPING_TIPS,
  SECURE_USAGE_TIPS,
} from 'src/services/channel/constants';
import { getTimeDifferenceInWords } from 'src/utils/utilities';

function KeySecurity({ navigation }) {
  const dispatch = useAppDispatch();
  const { inheritanceToolVisitedHistory } = useAppSelector((state) => state.storage);
  const navigate = (path, value) => {
    navigation.navigate(path);
    dispatch(updateLastVisitedTimestamp({ option: value }));
  };
  return (
    <ScrollView>
      <OptionCard
        preTitle={`${
          inheritanceToolVisitedHistory[BUY_NEW_HARDWARE_SIGNER] === undefined
            ? 'Never accessed'
            : `${getTimeDifferenceInWords(inheritanceToolVisitedHistory[BUY_NEW_HARDWARE_SIGNER])}`
        }`}
        title="Buy new Hardware Signers"
        description="Overview and discount codes"
        LeftIcon={<WalletGreenIcon />}
        callback={() => navigate('DiscountCodes', BUY_NEW_HARDWARE_SIGNER)}
      />
      <OptionCard
        preTitle={`${
          inheritanceToolVisitedHistory[CANARY_WALLETS] === undefined
            ? 'Never accessed'
            : `${getTimeDifferenceInWords(inheritanceToolVisitedHistory[BUY_NEW_HARDWARE_SIGNER])}`
        }`}
        title="Canary Wallets"
        description="Alert on key compromise"
        LeftIcon={<Bird />}
        callback={() => navigate('CanaryWallets', CANARY_WALLETS)}
      />
      <OptionCard
        preTitle={`${
          inheritanceToolVisitedHistory[ASSISTED_KEYS] === undefined ? 'Never accessed' : 'just now'
        }`}
        title="Assisted Keys"
        description="Assisted Keys"
        LeftIcon={<VaultGreenIcon />}
        callback={() => navigate('AssistedKeys', ASSISTED_KEYS)}
      />
      <Box paddingTop={10}>
        <OptionCard
          preTitle={`${
            inheritanceToolVisitedHistory[SECURE_USAGE_TIPS] === undefined
              ? 'Never accessed'
              : `${getTimeDifferenceInWords(
                  inheritanceToolVisitedHistory[BUY_NEW_HARDWARE_SIGNER]
                )}`
          }`}
          title="Secure Usage Tips"
          description="Recommendations while transacting"
          LeftIcon={<VaultGreenIcon />}
          callback={() => navigate('SafeGuardingTips', SECURE_USAGE_TIPS)}
        />
        <OptionCard
          preTitle={`${
            inheritanceToolVisitedHistory[SAFE_KEEPING_TIPS] === undefined
              ? 'Never accessed'
              : `${getTimeDifferenceInWords(
                  inheritanceToolVisitedHistory[BUY_NEW_HARDWARE_SIGNER]
                )}`
          }`}
          title="Safekeeping Tips"
          description="Key storage best practices"
          LeftIcon={<VaultGreenIcon />}
          callback={() => navigate('SafeKeepingTips', SAFE_KEEPING_TIPS)}
        />
      </Box>
    </ScrollView>
  );
}

export default KeySecurity;
