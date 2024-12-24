import React, { useContext } from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import OptionCard from 'src/components/OptionCard';
import IKGreenIcon from 'src/assets/images/ik-green.svg';
import IKGreyIcon from 'src/assets/images/ik-grey.svg';
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
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { hp } from 'src/constants/responsive';
import { StyleSheet } from 'react-native';

function KeySecurity({ navigation }) {
  const dispatch = useAppDispatch();
  const { plan } = usePlan();
  const { colorMode } = useColorMode();
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
        title={inheritancePlanning.inheritanceKey}
        description={inheritancePlanning.inheritanceKeyOptionDesc}
        LeftIcon={!isHodlerAndDiamondHand ? <IKGreyIcon /> : <IKGreenIcon />}
        callback={() => navigate('AssistedKeys', ASSISTED_KEYS)}
      />
      <OptionCard
        disabled={!isHodlerAndDiamondHand}
        preTitle={`${getTimeDifferenceInWords(inheritanceToolVisitedHistory?.[CANARY_WALLETS])}`}
        title="Canary Wallets"
        description="Alert on key compromise"
        LeftIcon={!isHodlerAndDiamondHand ? <BirdDisabledIcon /> : <BirdIcon />}
        callback={() => navigate('CanaryWallets', CANARY_WALLETS)}
      />
      {!isHodlerAndDiamondHand && (
        <Box
          borderColor={`${colorMode}.lightSkin`}
          style={StyleSheet.flatten([{ borderWidth: 1, marginTop: hp(10) }])}
        />
      )}
      <Box paddingTop={!isHodlerAndDiamondHand && hp(20)}>
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
