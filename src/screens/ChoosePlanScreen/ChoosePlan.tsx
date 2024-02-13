import { ActivityIndicator, Platform, ScrollView, Alert, Linking, StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, useColorMode, Pressable } from 'native-base';
import RNIap, {
  getSubscriptions,
  purchaseErrorListener,
  purchaseUpdatedListener,
  getAvailablePurchases,
  SubscriptionPurchase,
  requestSubscription,
} from 'react-native-iap';
import React, { useContext, useEffect, useState } from 'react';
import ChoosePlanCarousel from 'src/components/Carousel/ChoosePlanCarousel';
import KeeperHeader from 'src/components/KeeperHeader';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Note from 'src/components/Note/Note';
import { RealmSchema } from 'src/storage/realm/enum';
import ScreenWrapper from 'src/components/ScreenWrapper';
import SubScription, { SubScriptionPlan } from 'src/models/interfaces/Subscription';
import dbManager from 'src/storage/realm/dbManager';
import { wp } from 'src/constants/responsive';
import Relay from 'src/services/operations/Relay';
import moment from 'moment';
import { getBundleId } from 'react-native-device-info';
import { useDispatch } from 'react-redux';
import { uaiChecks } from 'src/store/sagaActions/uai';
import { uaiType } from 'src/models/interfaces/Uai';
import useToastMessage from 'src/hooks/useToastMessage';
import KeeperModal from 'src/components/KeeperModal';
import LoadingAnimation from 'src/components/Loader';
import { useQuery } from '@realm/react';
import SettingsIcon from 'src/assets/images/settings_white.svg';
import TierUpgradeModal from './TierUpgradeModal';
import { useNavigation, useRoute } from '@react-navigation/native';
import CircleIconWrapper from 'src/components/CircleIconWrapper';

function ChoosePlan() {
  const route = useRoute();
  const navigation = useNavigation();
  const initialPosition = route.params?.planPosition || 0;
  const { colorMode } = useColorMode();
  const { translations, formatString } = useContext(LocalizationContext);
  const { choosePlan, common } = translations;
  const [currentPosition, setCurrentPosition] = useState(initialPosition);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const { showToast } = useToastMessage();
  const {
    id,
    publicId,
    subscription: appSubscription,
  }: KeeperApp = dbManager.getObjectByIndex(RealmSchema.KeeperApp);
  const [items, setItems] = useState<SubScriptionPlan[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isUpgrade, setIsUpgrade] = useState(false);
  const [isMonthly, setIsMonthly] = useState(true);
  const { subscription }: KeeperApp = useQuery(RealmSchema.KeeperApp)[0];
  const disptach = useDispatch();
  const [isServiceUnavailible, setIsServiceUnavailible] = useState(false);

  useEffect(() => {
    const purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
      processPurchase(purchase);
    });
    const purchaseErrorSubscription = purchaseErrorListener((error) => {
      console.log('purchaseErrorListener', error);
      setRequesting(false);
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
    let data = [];
    try {
      const getPlansResponse = await Relay.getSubscriptionDetails(id, publicId);
      if (getPlansResponse.plans) {
        data = getPlansResponse.plans;
        const skus = [];
        getPlansResponse.plans.forEach((plan) => skus.push(...plan.productIds));
        const subscriptions = await getSubscriptions({ skus });
        subscriptions.forEach((subscription, i) => {
          const index = data.findIndex((plan) => plan.productIds.includes(subscription.productId));
          const monthlyPlans = [];
          const yearlyPlans = [];
          if (Platform.OS === 'android') {
            subscription.subscriptionOfferDetails.forEach((offer) => {
              const monthly = offer.pricingPhases.pricingPhaseList.filter(
                (list) => list.billingPeriod === 'P1M' && list.formattedPrice !== 'Free'
              );
              const yearly = offer.pricingPhases.pricingPhaseList.filter(
                (list) => list.billingPeriod === 'P1Y' && list.formattedPrice !== 'Free'
              );
              if (monthly.length) monthlyPlans.push(offer);
              if (yearly.length) yearlyPlans.push(offer);
            });
            data[index].monthlyPlanDetails = {
              ...getPlanData(monthlyPlans),
              productId: subscription.productId,
            };
            data[index].yearlyPlanDetails = {
              ...getPlanData(yearlyPlans),
              productId: subscription.productId,
            };
          } else if (Platform.OS === 'ios') {
            const planDetails = {
              price: subscription.localizedPrice,
              currency: subscription.currency,
              offerToken: null,
              productId: subscription.productId,
              trailPeriod: `${
                subscription.introductoryPriceNumberOfPeriodsIOS
              } ${subscription.introductoryPriceSubscriptionPeriodIOS.toLowerCase()} free`,
            };
            if (subscription.subscriptionPeriodUnitIOS === 'MONTH') {
              data[index].monthlyPlanDetails = planDetails;
            } else if (subscription.subscriptionPeriodUnitIOS === 'YEAR') {
              data[index].yearlyPlanDetails = planDetails;
            }
          }
        });
        data[0].monthlyPlanDetails = { productId: data[0].productIds[0] };
        data[0].yearlyPlanDetails = { productId: data[0].productIds[0] };
        setItems(data);
        setLoading(false);
      }
    } catch (error) {
      console.log('error', error);
      if (error.message.includes('Billing is unavailable.')) {
        setItems(data);
        setLoading(false);
        showToast(error.message);
        setIsServiceUnavailible(true);
      } else {
        navigation.goBack();
        showToast(error.message);
      }
    }
  }

  async function processPurchase(purchase: SubscriptionPurchase) {
    setRequesting(true);
    try {
      const receipt = purchase.transactionReceipt;
      const plan = items.filter((item) => item.productIds.includes(purchase.productId));
      const response = await Relay.updateSubscription(id, publicId, purchase);
      setRequesting(false);
      if (response.updated) {
        const subscription: SubScription = {
          productId: purchase.productId,
          receipt,
          name: plan[0].name,
          level: response.level,
          icon: plan[0].icon,
        };
        setIsUpgrade(response.level > appSubscription.level);
        dbManager.updateObjectById(RealmSchema.KeeperApp, id, {
          subscription,
        });
        setShowUpgradeModal(true);
      } else if (response.error) {
        showToast(response.error);
      }
      if (receipt) await RNIap.finishTransaction({ purchase, isConsumable: false });
    } catch (error) {
      setRequesting(false);
      console.log(error);
    }
  }

  function getPlanData(offers) {
    let offer;
    if (offers.length > 1) {
      offers.sort(
        (a, b) => a.pricingPhases.pricingPhaseList.length < b.pricingPhases.pricingPhaseList.length
      );
      offer = offers[0];
    } else if (offers.length === 0) {
      return null;
    } else {
      offer = offers[0];
    }
    const trailPlan = offer.pricingPhases.pricingPhaseList.filter(
      (list) => list.formattedPrice === 'Free'
    );
    const paidPlan = offer.pricingPhases.pricingPhaseList.filter(
      (list) => list.formattedPrice !== 'Free'
    );
    if (trailPlan.length) {
      return {
        currency: offer.pricingPhases.pricingPhaseList[0].priceCurrencyCode,
        offerToken: offer.offerToken,
        trailPeriod: `${moment.duration(trailPlan[0].billingPeriod).asMonths()} months free`,
        price: paidPlan[0].formattedPrice,
      };
    }
    return {
      currency: offer.pricingPhases.pricingPhaseList[0].priceCurrencyCode,
      offerToken: offer.offerToken,
      trailPeriod: '',
      price: paidPlan[0].formattedPrice,
    };
  }

  function manageSubscription(sku: string) {
    if (Platform.OS === 'ios') {
      Linking.openURL('https://apps.apple.com/account/subscriptions');
    } else if (Platform.OS === 'android') {
      Linking.openURL(
        `https://play.google.com/store/account/subscriptions?package=${getBundleId()}&sku=${sku}`
      );
    }
  }

  async function processSubscription(subscription: SubScriptionPlan, level: number) {
    try {
      if (subscription.productType === 'free') {
        setRequesting(true);
        const response = await Relay.updateSubscription(id, publicId, {
          productId: subscription.productIds[0],
        });
        setRequesting(false);
        if (response.updated) {
          const updatedSubscription: SubScription = {
            productId: subscription.productIds[0],
            receipt: '',
            name: subscription.name,
            level: response.level,
            icon: subscription.icon,
          };
          setIsUpgrade(response.level > appSubscription.level);
          dbManager.updateObjectById(RealmSchema.KeeperApp, id, {
            subscription: updatedSubscription,
          });
          disptach(uaiChecks([uaiType.VAULT_MIGRATION]));
          // disptach(resetVaultMigration());
          setShowUpgradeModal(true);
        } else {
          Alert.alert('', response.error, [
            {
              text: 'Cancel',
              onPress: () => {},
              style: 'cancel',
            },
            {
              text: 'Manage',
              onPress: () => manageSubscription(response.productId),
            },
          ]);
        }
      } else {
        if (isServiceUnavailible) {
          showToast(
            'It seems that you don’t have Google services for app subscriptions. Ability to pay using bitcoin coming soon'
          );
          return;
        }
        setRequesting(true);
        const plan = isMonthly ? subscription.monthlyPlanDetails : subscription.yearlyPlanDetails;
        const sku = plan.productId;
        const { offerToken } = plan;
        let purchaseTokenAndroid = null;
        if (Platform.OS === 'android' && appSubscription.receipt) {
          purchaseTokenAndroid = JSON.parse(appSubscription.receipt).purchaseToken;
        }
        requestSubscription({
          sku,
          subscriptionOffers: [{ sku, offerToken }],
          purchaseTokenAndroid,
        });
      }
    } catch (err) {
      setRequesting(false);
      console.log(err);
    }
  }

  const onPressModalBtn = () => {
    setShowUpgradeModal(false);
  };

  const getBenifitsTitle = (name) => {
    if (name === 'Diamond Hands') {
      return `${name}`;
    }
    return `A ${name}`;
  };

  const getPlanNote = (plan) => {
    if (plan.name === 'Pleb') return '';
    let trial = '';
    let amount = '';
    if (plan.monthlyPlanDetails || plan.yearlyPlanDetails) {
      if (isMonthly) {
        trial = plan.monthlyPlanDetails.trailPeriod;
        amount = plan.monthlyPlanDetails.price;
      } else {
        trial = plan.yearlyPlanDetails.trailPeriod;
        amount = plan.yearlyPlanDetails.price;
      }
    }
    if (trial) {
      return `Start your ${trial} FREE trial now! Then ${amount} per ${
        isMonthly ? 'month' : 'year'
      }, cancel anytime`;
    } else {
      return ` ${amount} per ${isMonthly ? 'month' : 'year'}, cancel anytime`;
    }
  };

  const restorePurchases = async () => {
    try {
      setRequesting(true);
      const purchases = await getAvailablePurchases();
      setRequesting(false);
      if (purchases.length === 0) {
        showToast('No purchases found');
      } else {
        for (let i = 0; i < purchases.length; i++) {
          const purchase = purchases[i];
          if (purchase.productId === subscription.productId) {
            showToast(`Already subscribed to ${subscription.name}`);
          } else {
            const validPurchase = items.find((item) =>
              item.productIds.includes(purchase.productId)
            );
            if (validPurchase) {
              processPurchase(purchase);
              break;
            }
          }
        }
      }
    } catch (error) {
      setRequesting(false);
      console.log(error);
    }
  };

  function LoginModalContent() {
    const { colorMode } = useColorMode();
    return (
      <Box>
        <LoadingAnimation />
        <Text color={`${colorMode}.greenText`} fontSize={13}>
          {choosePlan.youCanChange}
        </Text>
      </Box>
    );
  }

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={choosePlan.choosePlantitle}
        subtitle={'Upgrade or downgrade'}
        //To-Do-Learn-More
      />
      <KeeperModal
        visible={requesting}
        close={() => {}}
        title={choosePlan.confirming}
        subTitle={choosePlan.pleaseStay}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        DarkCloseIcon={colorMode === 'dark'}
        showCloseIcon={false}
        buttonText={null}
        buttonCallback={() => {}}
        Content={LoginModalContent}
        subTitleWidth={wp(210)}
      />

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
          style={{ height: '70%', marginVertical: 0 }}
        >
          <ChoosePlanCarousel
            data={items}
            onPress={(item, level) => processSubscription(item, level)}
            onChange={(item) => setCurrentPosition(item)}
            isMonthly={isMonthly}
            requesting={requesting}
            currentPosition={currentPosition}
          />

          <Box
            opacity={0.1}
            backgroundColor={`${colorMode}.Border`}
            width="100%"
            height={0.5}
            my={5}
          />

          <Box ml={5}>
            <Box>
              <Text fontSize={14} color={`${colorMode}.pantoneGreen`} letterSpacing={1.12}>
                {getBenifitsTitle(items[currentPosition].name)}:
              </Text>
            </Box>
            <Box mt={1}>
              {items[currentPosition].benifits.map((i) => (
                <Box flexDirection="row" alignItems="center" key={i}>
                  <Text
                    fontSize={13}
                    color={`${colorMode}.GreyText`}
                    mb={2}
                    ml={3}
                    letterSpacing={0.65}
                  >
                    {`• ${i}`}
                  </Text>
                </Box>
              ))}
            </Box>
            <Text fontSize={11} color={`${colorMode}.GreyText`} my={2} ml={2} letterSpacing={0.65}>
              {getPlanNote(items[currentPosition])}
            </Text>
          </Box>
        </ScrollView>
      )}

      <Box style={styles.noteWrapper}>
        <Box width="65%">
          <Note
            title={common.note}
            subtitle={formatString(choosePlan.noteSubTitle)}
            subtitleColor="GreyText"
          />
        </Box>
        <Pressable
          width="35%"
          activeOpacity={0.6}
          onPress={restorePurchases}
          testID="btn_restorePurchases"
        >
          <Box
            borderColor={`${colorMode}.learnMoreBorder`}
            backgroundColor={`${colorMode}.RussetBrown`}
            style={styles.restorePurchaseWrapper}
          >
            <Text fontSize={12} color={colorMode === 'light' ? 'light.white' : '#24312E'}>
              {choosePlan.restorePurchases}
            </Text>
          </Box>
        </Pressable>
      </Box>
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  noteWrapper: {
    bottom: 1,
    margin: 1,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  restorePurchaseWrapper: {
    padding: 1,
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 0.7,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default ChoosePlan;
