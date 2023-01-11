/* eslint-disable prefer-destructuring */
import { ActivityIndicator, Platform, ScrollView } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box } from 'native-base';
import RNIap, {
  getSubscriptions,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestSubscription,
} from 'react-native-iap';
import React, { useContext, useEffect, useState } from 'react';
import ChoosePlanCarousel from 'src/components/Carousel/ChoosePlanCarousel';
import HeaderTitle from 'src/components/HeaderTitle';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { LocalizationContext } from 'src/common/content/LocContext';
import Note from 'src/components/Note/Note';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import ScreenWrapper from 'src/components/ScreenWrapper';
import SubScription, { SubScriptionPlan } from 'src/common/data/models/interfaces/Subscription';
import dbManager from 'src/storage/realm/dbManager';
import { useNavigation } from '@react-navigation/native';
import { wp } from 'src/common/data/responsiveness/responsive';
import Relay from 'src/core/services/operations/Relay';
import MonthlyYearlySwitch from 'src/components/Switch/MonthlyYearlySwitch';
import moment from 'moment'
import TierUpgradeModal from './TierUpgradeModal';

function ChoosePlan(props) {
  const { translations } = useContext(LocalizationContext);
  const { choosePlan } = translations;
  const [currentPosition, setCurrentPosition] = useState(0);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<SubScriptionPlan[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isUpgrade, setIsUpgrade] = useState(false);
  const [isMonthly, setIsMonthly] = useState(true);
  const { useQuery } = useContext(RealmWrapperContext);
  const { subscription }: KeeperApp = useQuery(RealmSchema.KeeperApp)[0];
  const navigation = useNavigation();

  useEffect(() => {
    const purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
      const receipt = purchase.transactionReceipt;
      const { id, appID, subscription: appSubscription }: KeeperApp = dbManager.getObjectByIndex(RealmSchema.KeeperApp);
      const plan = items.filter(item => item.productIds.includes(purchase.productId));
      const response = await Relay.updateSubscription(id, appID, purchase)
      if (response.updated) {
        try {
          const subscription: SubScription = {
            productId: purchase.productId,
            receipt,
            name: plan[0].name,
            level: response.level,
            icon: plan[0].icon
          };
          setIsUpgrade(response.level > appSubscription.level)
          dbManager.updateObjectById(RealmSchema.KeeperApp, id, {
            subscription,
          });
          setShowUpgradeModal(true)
        } catch (error) {
          console.log(error)
        }
      }
      const finish = await RNIap.finishTransaction(purchase, false);
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
  }, [items]);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    try {
      const { id, appID }: KeeperApp = dbManager.getObjectByIndex(RealmSchema.KeeperApp);
      const getPlansResponse = await Relay.getSubscriptionDetails(id, appID)
      if (getPlansResponse.plans) {
        const skus = []
        getPlansResponse.plans
          .forEach(plan => skus.push(...plan.productIds))
        const subscriptions = await getSubscriptions(skus);
        const data = getPlansResponse.plans
        subscriptions.forEach((subscription, i) => {
          const index = data.findIndex(plan => plan.productIds.includes(subscription.productId))
          const monthlyPlans = []
          const yearlyPlans = []
          if (Platform.OS === 'android') {
            subscription.subscriptionOfferDetails.forEach(offer => {
              const monthly = offer.pricingPhases.pricingPhaseList.filter(list => (list.billingPeriod === 'P1M' && list.formattedPrice !== 'Free'))
              const yearly = offer.pricingPhases.pricingPhaseList.filter(list => (list.billingPeriod === 'P1Y' && list.formattedPrice !== 'Free'))
              if (monthly.length) monthlyPlans.push(offer)
              if (yearly.length) yearlyPlans.push(offer)
            })
            data[index].monthlyPlanDetails = {
              ...getPlanData(monthlyPlans),
              productId: subscription.productId
            }
            data[index].yearlyPlanDetails = {
              ...getPlanData(yearlyPlans),
              productId: subscription.productId
            }
          } else if (Platform.OS === 'ios') {
            const planDetails = {
              price: subscription.localizedPrice,
              currency: subscription.currency,
              offerToken: null,
              productId: subscription.productId,
              trailPeriod: `${subscription.introductoryPriceNumberOfPeriodsIOS} ${subscription.introductoryPriceSubscriptionPeriodIOS.toLowerCase()} free`
            }
            if (subscription.subscriptionPeriodUnitIOS === 'MONTH') {
              data[index].monthlyPlanDetails = planDetails
            } else if (subscription.subscriptionPeriodUnitIOS === 'YEAR') {
              data[index].yearlyPlanDetails = planDetails
            }
          }
        });
        setItems(data);
        setLoading(false);
      }
    } catch (error) {
      console.log('error', error);
    }
  }

  function getPlanData(offers) {
    let offer
    if (offers.length > 1) {
      offers.sort((a, b) => a.pricingPhases.pricingPhaseList.length < b.pricingPhases.pricingPhaseList.length);
      offer = offers[0]
    } else {
      offer = offers[0]
    }
    const trailPlan = offer.pricingPhases.pricingPhaseList.filter(list => list.formattedPrice === 'Free')
    const paidPlan = offer.pricingPhases.pricingPhaseList.filter(list => list.formattedPrice !== 'Free')
    if (trailPlan.length) {
      return {
        currency: offer.pricingPhases.pricingPhaseList[0].priceCurrencyCode,
        offerToken: offer.offerToken,
        trailPeriod: `${moment.duration(trailPlan[0].billingPeriod).asMonths()} months free`,
        price: paidPlan[0].formattedPrice
      }
    }
    return {
      currency: offer.pricingPhases.pricingPhaseList[0].priceCurrencyCode,
      offerToken: offer.offerToken,
      trailPeriod: '',
      price: paidPlan[0].formattedPrice
    }
  }

  async function processSubscription(subscription: SubScriptionPlan, level: number) {
    try {
      /* const { id }: KeeperApp = dbManager.getObjectByIndex(RealmSchema.KeeperApp);
      const sub: SubScription = {
        productId: item.productId,
        receipt: 'mock-purchase',
        name: item.name.split(' (')[0],
        level,
      };
      dbManager.updateObjectById(RealmSchema.KeeperApp, id, {
        subscription: sub,
      });
      if (item.productId === SubscriptionTier.L1) {
        setIsUpgrade(false);
      } else if (
        item.name.split(' ')[0] === SubscriptionTier.L2 &&
        subscription.name === SubscriptionTier.L3
      ) {
        setIsUpgrade(false);
      } else {
        setIsUpgrade(true);
      }
      setShowUpgradeModal(true);
      */
      const plan = isMonthly ? subscription.monthlyPlanDetails : subscription.yearlyPlanDetails
      const sku = plan.productId
      const { offerToken } = plan
      requestSubscription(
        { sku, subscriptionOffers: [{ sku, offerToken }] },
      );
    } catch (err) {
      console.log(err);
    }
  }

  const onPressModalBtn = () => {
    setShowUpgradeModal(false);
    navigation.navigate('AddSigningDevice');
  };

  const getBenifitsTitle = (name) => {
    if (name === 'Diamond Hands') {
      return `${name} means`;
    }
    return `A ${name} gets`;
  };

  return (
    <ScreenWrapper barStyle="dark-content">
      <Box position="relative" flex={1}>
        <Box justifyContent='space-between' flexDirection="row">
          <HeaderTitle
            title={choosePlan.choosePlantitle}
            subtitle={
              subscription.name === 'Diamond Hands'
                ? `You are currently a ${subscription.name}`
                : `You are currently a ${subscription.name}`
            }
            headerTitleColor="light.primaryText"
          />
          <MonthlyYearlySwitch value={isMonthly} onValueChange={() => setIsMonthly(!isMonthly)} />
        </Box>

        <TierUpgradeModal
          visible={showUpgradeModal}
          close={() => setShowUpgradeModal(false)}
          onPress={onPressModalBtn}
          isUpgrade={isUpgrade}
          plan={subscription.name}
        />
        {loading ? (
          <ActivityIndicator style={{ height: '70%' }} size="large" />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ height: '80%', marginVertical: 0 }}
          >
            <ChoosePlanCarousel
              data={items}
              onPress={(item, level) => processSubscription(item, level)}
              onChange={(item) => setCurrentPosition(item)}
              isMonthly={isMonthly}
            />

            <Box opacity={0.1} backgroundColor="light.Border" width="100%" height={0.5} my={5} />

            <Box ml={5}>
              <Box>
                <Text fontSize={14} color="light.primaryText" letterSpacing={1.12}>
                  {getBenifitsTitle(items[currentPosition].name)}:
                </Text>
              </Box>
              <Box mt={3}>
                {items[currentPosition].benifits.map((i) => (
                  <Box flexDirection="row" alignItems="center">
                    <Text fontSize={13} color="light.GreyText" mb={2} ml={3} letterSpacing={0.65}>
                      {`• ${i}`}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>
          </ScrollView>
        )}

        <Box
          backgroundColor="light.secondaryBackground"
          position="absolute"
          bottom={-10}
          justifyContent="flex-end"
          width={wp(340)}
        >
          <Note title="Note" subtitle={choosePlan.noteSubTitle} subtitleColor="GreyText" />
        </Box>
      </Box>
    </ScreenWrapper>
  );
}
export default ChoosePlan;
