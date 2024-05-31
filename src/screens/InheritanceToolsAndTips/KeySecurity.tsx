import React, { useContext } from 'react';
import { Box, ScrollView } from 'native-base';
import OptionCard from 'src/components/OptionCard';
import ServerIcon from 'src/assets/images/server-network.svg';
import ServerGreyIcon from 'src/assets/images/server-network-grey.svg';
import VaultGreenIcon from 'src/assets/images/vault_green.svg';
import BirdIcon from 'src/assets/images/bird.svg';
import BirdDisabledIcon from 'src/assets/images/bird_disabled.svg';

import { updateLastVisitedTimestamp } from 'src/store/reducers/storage';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import {
  ASSISTED_KEYS,
  CANARY_WALLETS,
  SAFE_KEEPING_TIPS,
  SECURE_USAGE_TIPS,
} from 'src/services/channel/constants';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import { getTimeDifferenceInWords } from 'src/utils/utilities';
import usePlan from 'src/hooks/usePlan';
import UpgradeSubscription from './components/UpgradeSubscription';
import CardPill from 'src/components/CardPill';
import Colors from 'src/theme/Colors';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function KeySecurity({ navigation }) {
  const dispatch = useAppDispatch();
  const { plan } = usePlan();
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning } = translations;
  const isHodlerAndDiamondHand =
    plan === SubscriptionTier.L3.toUpperCase() || plan === SubscriptionTier.L2.toUpperCase();

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
      {!isHodlerAndDiamondHand && <UpgradeSubscription type={SubscriptionTier.L2} />}
      <OptionCard
        disabled={!isHodlerAndDiamondHand}
        preTitle={`${getTimeDifferenceInWords(inheritanceToolVisitedHistory?.[CANARY_WALLETS])}`}
        title="Canary Wallets"
        description="Alert on key compromise"
        LeftIcon={!isHodlerAndDiamondHand ? <BirdDisabledIcon /> : <BirdIcon />}
        callback={() => navigate('CanaryWallets', CANARY_WALLETS)}
      />
      <OptionCard
        disabled={!isHodlerAndDiamondHand}
        title={inheritancePlanning.assistedKeys}
        description={inheritancePlanning.assistedKeysDesp}
        LeftIcon={!isHodlerAndDiamondHand ? <ServerGreyIcon /> : <ServerIcon />}
        callback={() => navigate('AssistedKeys', ASSISTED_KEYS)}
      />
      <Box paddingTop={4}>
        <OptionCard
          preTitle={`${getTimeDifferenceInWords(
            inheritanceToolVisitedHistory?.[SECURE_USAGE_TIPS]
          )}`}
          title={inheritancePlanning.secureUsageTips}
          description={inheritancePlanning.secureUsageTipsDesp}
          LeftIcon={<VaultGreenIcon />}
          callback={() => navigate('SafeGuardingTips', SECURE_USAGE_TIPS)}
        />
        <OptionCard
          preTitle={`${getTimeDifferenceInWords(
            inheritanceToolVisitedHistory?.[SAFE_KEEPING_TIPS]
          )}`}
          title={inheritancePlanning.safeKeepingTips}
          description={inheritancePlanning.safeKeepingTipsDesp}
          LeftIcon={<VaultGreenIcon />}
          callback={() => navigate('SafeKeepingTips', SAFE_KEEPING_TIPS)}
        />
      </Box>
    </ScrollView>
  );
}

export default KeySecurity;
