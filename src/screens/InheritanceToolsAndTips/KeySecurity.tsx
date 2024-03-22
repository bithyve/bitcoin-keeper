import { Box, ScrollView } from 'native-base';
import React from 'react';
import OptionCard from 'src/components/OptionCard';
import CouponIcon from 'src/assets/images/cupon.svg';
import ServerIcon from 'src/assets/images/server-network.svg';

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
import usePlan from 'src/hooks/usePlan';
import UpgradeSubscription from './components/UpgradeSubscription';

function KeySecurity({ navigation }) {
  const dispatch = useAppDispatch();
  const { plan } = usePlan();

  const { inheritanceToolVisitedHistory } = useAppSelector((state) => state.storage);
  const navigate = (path, value) => {
    navigation.navigate(path);
    dispatch(updateLastVisitedTimestamp({ option: value }));
  };
  return (
    <ScrollView>
      <OptionCard
        disabled
        //---for future use---
        // preTitle={`${
        //   inheritanceToolVisitedHistory[BUY_NEW_HARDWARE_SIGNER] === undefined
        //     ? 'Never accessed'
        //     : `${getTimeDifferenceInWords(inheritanceToolVisitedHistory[BUY_NEW_HARDWARE_SIGNER])}`
        // }`}
        preTitle="Coming soon"
        title="Buy new Hardware Signers"
        description="Overview and discount codes"
        LeftIcon={<CouponIcon />}
        callback={() => navigate('DiscountCodes', BUY_NEW_HARDWARE_SIGNER)}
      />
      <OptionCard
        disabled
        //---for future use---
        // preTitle={`${
        //   inheritanceToolVisitedHistory[CANARY_WALLETS] === undefined
        //     ? 'Never accessed'
        //     : `${getTimeDifferenceInWords(inheritanceToolVisitedHistory[CANARY_WALLETS])}`
        // }`}
        preTitle="Coming soon"
        title="Canary Wallets"
        description="Alert on key compromise"
        LeftIcon={<Bird />}
        callback={() => navigate('CanaryWallets', CANARY_WALLETS)}
      />
      {plan !== 'DIAMOND HANDS' && plan !== 'HODLER' && <UpgradeSubscription type={'HODLER'} />}

      <OptionCard
        preTitle={`${getTimeDifferenceInWords(inheritanceToolVisitedHistory?.[ASSISTED_KEYS])}`}
        disabled={plan === 'DIAMOND HANDS' || plan === 'HODLER' ? false : true}
        title="Assisted Keys"
        description="Server hosted signers"
        LeftIcon={<ServerIcon />}
        callback={() => navigate('AssistedKeys', ASSISTED_KEYS)}
      />
      <Box paddingTop={4}>
        <OptionCard
          preTitle={`${getTimeDifferenceInWords(
            inheritanceToolVisitedHistory?.[SECURE_USAGE_TIPS]
          )}`}
          title="Secure Usage Tips"
          description="Recommendations while transacting"
          LeftIcon={<VaultGreenIcon />}
          callback={() => navigate('SafeGuardingTips', SECURE_USAGE_TIPS)}
        />
        <OptionCard
          preTitle={`${getTimeDifferenceInWords(
            inheritanceToolVisitedHistory?.[SAFE_KEEPING_TIPS]
          )}`}
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
