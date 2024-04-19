import React from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import OptionCard from 'src/components/OptionCard';
import CouponIcon from 'src/assets/images/cupon.svg';
import ServerIcon from 'src/assets/images/server-network.svg';
import ServerGreyIcon from 'src/assets/images/server-network-grey.svg';
import VaultGreenIcon from 'src/assets/images/vault_green.svg';
import BirdIcon from 'src/assets/images/bird.svg';

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
import CardPill from 'src/components/CardPill';
import Colors from 'src/theme/Colors';

function KeySecurity({ navigation }) {
  const dispatch = useAppDispatch();
  const colorMode = useColorMode();
  const { plan } = usePlan();
  const isHodlerAndDiamondHand = plan === 'DIAMOND HANDS' || plan === 'HODLER';

  const { inheritanceToolVisitedHistory } = useAppSelector((state) => state.storage);
  const navigate = (path, value) => {
    navigation.navigate(path);
    dispatch(updateLastVisitedTimestamp({ option: value }));
  };
  return (
    <ScrollView>
      {/* 
       //---for future use---
      <OptionCard
        disabled
        // preTitle={`${
        //   inheritanceToolVisitedHistory[BUY_NEW_HARDWARE_SIGNER] === undefined
        //     ? 'Never accessed'
        //     : `${getTimeDifferenceInWords(inheritanceToolVisitedHistory[BUY_NEW_HARDWARE_SIGNER])}`
        // }`}
        CardPill={<CardPill heading="COMING SOON" backgroundColor={Colors.LightPurple} />}
        title="Buy new Hardware Signers"
        description="Overview and discount codes"
        LeftIcon={<CouponIcon />}
        callback={() => navigate('DiscountCodes', BUY_NEW_HARDWARE_SIGNER)}
      /> */}
      <OptionCard
        disabled
        //---for future use---
        // preTitle={`${
        //   inheritanceToolVisitedHistory[CANARY_WALLETS] === undefined
        //     ? 'Never accessed'
        //     : `${getTimeDifferenceInWords(inheritanceToolVisitedHistory[CANARY_WALLETS])}`
        // }`}
        CardPill={<CardPill heading="COMING SOON" backgroundColor={Colors.LightPurple} />}
        title="Canary Wallets"
        description="Alert on key compromise"
        LeftIcon={<BirdIcon />}
        callback={() => navigate('CanaryWallets', CANARY_WALLETS)}
      />
      {!isHodlerAndDiamondHand && <UpgradeSubscription type={'HODLER'} />}

      <OptionCard
        preTitle={`${getTimeDifferenceInWords(inheritanceToolVisitedHistory?.[ASSISTED_KEYS])}`}
        disabled={!isHodlerAndDiamondHand}
        title="Assisted Keys"
        description="Server hosted signers"
        LeftIcon={!isHodlerAndDiamondHand ? <ServerGreyIcon /> : <ServerIcon />}
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
