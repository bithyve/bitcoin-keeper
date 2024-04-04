import React, { useContext } from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
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
import CardPill from 'src/components/CardPill';
import Colors from 'src/theme/Colors';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function KeySecurity({ navigation }) {
  const dispatch = useAppDispatch();
  const colorMode = useColorMode();
  const { plan } = usePlan();
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning } = translations;
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
        CardPill={
          <CardPill
            heading={inheritancePlanning.commingSoon}
            backgroundColor={Colors.LightPurple}
          />
        }
        title={inheritancePlanning.BuyNewHardwareSigner}
        description={inheritancePlanning.BuyNewHardwareSignerDesp}
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
        CardPill={
          <CardPill
            heading={inheritancePlanning.commingSoon}
            backgroundColor={Colors.LightPurple}
          />
        }
        title={inheritancePlanning.canaryWallet}
        description={inheritancePlanning.canaryWalletDesp}
        LeftIcon={<Bird />}
        callback={() => navigate('CanaryWallets', CANARY_WALLETS)}
      />
      {plan !== 'DIAMOND HANDS' && plan !== 'HODLER' && <UpgradeSubscription type={'HODLER'} />}

      <OptionCard
        preTitle={`${getTimeDifferenceInWords(inheritanceToolVisitedHistory?.[ASSISTED_KEYS])}`}
        disabled={plan === 'DIAMOND HANDS' || plan === 'HODLER' ? false : true}
        title={inheritancePlanning.assistedKeys}
        description={inheritancePlanning.assistedKeysDesp}
        LeftIcon={<ServerIcon />}
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
