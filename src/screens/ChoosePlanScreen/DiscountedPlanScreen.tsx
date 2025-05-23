import { Box, useColorMode } from 'native-base';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Linking, Platform } from 'react-native';
import {
  getSubscriptions,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestSubscription,
} from 'react-native-iap';
import Buttons from 'src/components/Buttons';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import { hp, wp } from 'src/constants/responsive';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { capitalizeEachWord, getLocalizedDiscountedPrice } from 'src/utils/utilities';
import Text from 'src/components/KeeperText';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import Relay from 'src/services/backend/Relay';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { useSettingKeeper } from 'src/hooks/useSettingKeeper';
import PlanCheckMark from 'src/assets/images/planCheckMark.svg';
import PlanCheckMarkWhite from 'src/assets/images/plan-white-check.svg';
import Discount25 from 'src/assets/images/discount25.svg';
const isIOS = Platform.OS === 'ios';

export const DiscountedPlanScreen = ({ processPurchase, navigation }) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const { subscription: appSubscription, id: appId }: any = dbManager.getObjectByIndex(
    RealmSchema.KeeperApp
  );
  const sku = useRef();
  const [details, setDetails] = useState(null);
  const { showToast } = useToastMessage();
  const { planData } = useSettingKeeper();

  useEffect(() => {
    loadSubscription();
  }, []);

  useEffect(() => {
    const purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
      processPurchase(purchase);
      navigation.pop();
    });
    const purchaseErrorSubscription = purchaseErrorListener((error) => {
      console.log('purchaseErrorListener', error);
    });

    return () => {
      if (purchaseUpdateSubscription) {
        purchaseUpdateSubscription.remove();
      }
      if (purchaseErrorSubscription) {
        purchaseErrorSubscription.remove();
      }
    };
  }, []);

  const loadSubscription = async () => {
    const activeCampaign = await Relay.getActiveCampaign(appId);
    if (activeCampaign) {
      sku.current = isIOS ? activeCampaign.iosSKU : activeCampaign.androidSKU;
      const [subscription]: any = await getSubscriptions({ skus: [sku.current] });
      let details = {
        planName: activeCampaign.planName,
        benefits: activeCampaign.benefits,
        plan: activeCampaign.plan,
        darkIcon: planData.find((plan) => plan.plan === activeCampaign.plan).subDarkIcon,
        icon: planData.find((plan) => plan.plan === activeCampaign.plan).sublightIcon,
      };

      if (isIOS) {
        details['regularPrice'] = subscription.localizedPrice;
        details['offerPrice'] = getLocalizedDiscountedPrice(
          subscription.price,
          subscription.localizedPrice,
          activeCampaign.discount
        );
        details['iosRedeemCode'] = activeCampaign.iosRedeemCode;
        setDetails(details);
      } else {
        // for android
        const offer = subscription.subscriptionOfferDetails.find(
          (subs) => subs.offerId == activeCampaign.androidIdentifier
        );
        details['offerToken'] = offer.offerToken;
        details['regularPrice'] = offer.pricingPhases.pricingPhaseList[1].formattedPrice;
        details['offerPrice'] = offer.pricingPhases.pricingPhaseList[0].formattedPrice;
        setDetails(details);
      }
    } else {
      navigation.pop();
      showToast('Not ongoing active campaign', <ToastErrorIcon />);
    }
  };

  const purchaseIos = () => Linking.openURL(details.iosRedeemCode);
  const purchaseAndroid = () => {
    let purchaseTokenAndroid = null;
    if (Platform.OS === 'android' && appSubscription.receipt) {
      purchaseTokenAndroid = JSON.parse(appSubscription.receipt).purchaseToken;
    }
    requestSubscription({
      sku: sku.current,
      subscriptionOffers: [{ sku: sku.current, offerToken: details.offerToken }],
      purchaseTokenAndroid,
    });
  };

  const AmountCard = ({ parameter, value }) => {
    return (
      <Box style={styles.cardCtr}>
        <Text medium>{capitalizeEachWord(parameter)}</Text>
        <Text fontSize={16} light>
          {value}
        </Text>
      </Box>
    );
  };

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader title={'Discounted Plan'} />
      {details ? (
        <Box position={'relative'}>
          <Box style={styles.ribbonCtr}>
            <Discount25 />
          </Box>

          <Box
            borderColor={`${colorMode}.separator`}
            backgroundColor={`${colorMode}.textInputBackground`}
            style={styles.ctr}
          >
            {/* Icon */}
            <Box backgroundColor={`${colorMode}.lightSkin`} style={styles.iconCtr}>
              {isDarkMode ? details.darkIcon : details.icon}
            </Box>
            {/* PLan Name */}
            <Text color={`${colorMode}.GreyText`} style={styles.title}>
              {details.planName}
            </Text>

            <Box style={styles.divider} backgroundColor={`${colorMode}.BrownNeedHelp`} />

            {/* Benefits */}
            {details.benefits.map((benefit) => {
              return (
                <Box style={styles.benefitContainer} key={benefit}>
                  <Box style={styles.iconContainer}>
                    {isDarkMode ? <PlanCheckMarkWhite /> : <PlanCheckMark />}
                  </Box>
                  <Text fontSize={13} color={`${colorMode}.modalWhiteContent`}>
                    {`${benefit}`}
                  </Text>
                </Box>
              );
            })}

            <Box style={styles.divider} backgroundColor={`${colorMode}.BrownNeedHelp`} />

            <AmountCard parameter={'Regular Price'} value={details.regularPrice} />
            <AmountCard parameter={'Offer Price'} value={details.offerPrice} />

            <Box style={styles.divider} />

            <Buttons
              fullWidth
              primaryText="Subscription"
              primaryCallback={isIOS ? purchaseIos : purchaseAndroid}
            />
          </Box>
        </Box>
      ) : (
        <ActivityIndicatorView visible />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  ctr: {
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 12,
    borderWidth: 2,
  },
  iconCtr: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    padding: wp(7),
    alignSelf: 'flex-start',
  },

  cardCtr: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(10),
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: hp(15),
  },
  divider: {
    height: 1,
    marginTop: hp(20),
    marginBottom: hp(10),
    opacity: 0.2,
  },
  benefitContainer: {
    flexDirection: 'row',
    gap: 10,
    width: wp(260),
    alignItems: 'flex-start',
    marginVertical: hp(6),
  },
  iconContainer: {
    marginTop: 6,
  },
  ribbonCtr: {
    position: 'absolute',
    zIndex: 10,
    right: -wp(11),
    top: -hp(11),
  },
});
