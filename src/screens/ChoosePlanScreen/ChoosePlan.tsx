import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Alert,
  Linking,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
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
import { RealmSchema } from 'src/storage/realm/enum';
import ScreenWrapper from 'src/components/ScreenWrapper';
import SubScription, { SubScriptionPlan } from 'src/models/interfaces/Subscription';
import dbManager from 'src/storage/realm/dbManager';
import { wp, hp } from 'src/constants/responsive';
import Relay from 'src/services/backend/Relay';
import moment from 'moment';
import { getBundleId } from 'react-native-device-info';
import { useDispatch } from 'react-redux';
import { uaiChecks } from 'src/store/sagaActions/uai';
import { uaiType } from 'src/models/interfaces/Uai';
import useToastMessage from 'src/hooks/useToastMessage';
import KeeperModal from 'src/components/KeeperModal';
import LoadingAnimation from 'src/components/Loader';
import { useQuery } from '@realm/react';
import { useNavigation, useRoute } from '@react-navigation/native';
import MonthlyYearlySwitch from 'src/components/Switch/MonthlyYearlySwitch';
import KeeperTextInput from 'src/components/KeeperTextInput';
import CustomGreenButton from 'src/components/CustomButton/CustomGreenButton';
import Colors from 'src/theme/Colors';
import TierUpgradeModal from './TierUpgradeModal';
import PlanCheckMark from 'src/assets/images/planCheckMark.svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Buttons from 'src/components/Buttons';
const { width } = Dimensions.get('window');

function ChoosePlan() {
  const inset = useSafeAreaInsets();
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
  const [showPromocodeModal, setShowPromocodeModal] = useState(false);

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

  useEffect(() => {
    // To calculate same index as in ChoosePlanCarousel
    setCurrentPosition(initialPosition !== 0 ? initialPosition : subscription.level - 1);
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
              offers: monthlyPlans,
            };
            data[index].yearlyPlanDetails = {
              ...getPlanData(yearlyPlans),
              productId: subscription.productId,
              offers: yearlyPlans,
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
              text: common.cancel,
              onPress: () => {},
              style: 'cancel',
            },
            {
              text: common.manage,
              onPress: () => manageSubscription(response.productId),
            },
          ]);
        }
      } else {
        if (isServiceUnavailible) {
          showToast(choosePlan.serviceUnavailableMesage);
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

  const restorePurchases = async () => {
    try {
      setRequesting(true);
      const purchases = await getAvailablePurchases();
      setRequesting(false);
      if (purchases.length === 0) {
        showToast(choosePlan.noAvailablePurchaseMessage);
      } else {
        for (let i = 0; i < purchases.length; i++) {
          const purchase = purchases[i];
          if (purchase.productId === subscription.productId) {
            showToast(`${choosePlan.currentSubscriptionMessage} ${subscription.name}`);
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

  function PromocodeModalContent() {
    const { colorMode } = useColorMode();
    const [code, setcode] = useState('');
    const [isInvalidCode, setIsInvalidCode] = useState(false);
    const [activeOffer, setActiveOffer] = useState(null);

    const validateOnFocusLost = async () => {
      setActiveOffer(null);
      const plan = isMonthly
        ? items[currentPosition].monthlyPlanDetails
        : items[currentPosition].yearlyPlanDetails;

      if (Platform.OS === 'android') {
        const promoCode = code.trim().toLowerCase();
        if (items[currentPosition].promoCodes || items[currentPosition].promoCodes[promoCode]) {
          const offerId = items[currentPosition].promoCodes[promoCode];
          const offer = plan.offers.find((offer) => {
            return offer.offerId === offerId;
          });
          if (offer) {
            let purchaseTokenAndroid = null;
            if (appSubscription.receipt) {
              purchaseTokenAndroid = JSON.parse(appSubscription.receipt).purchaseToken;
            }
            setActiveOffer({
              ...offer,
              purchaseTokenAndroid,
            });
          } else {
            setIsInvalidCode(true);
          }
        } else {
          setIsInvalidCode(true);
        }
      } else {
        // For iOS
        const offer = await Relay.getOffer(plan.productId, code.trim().toLowerCase());
        if (offer && offer.signature) {
          setActiveOffer(offer);
        } else {
          setIsInvalidCode(true);
        }
      }
    };

    const onSubscribe = () => {
      const plan = isMonthly
        ? items[currentPosition].monthlyPlanDetails
        : items[currentPosition].yearlyPlanDetails;
      if (Platform.OS === 'android') {
        setShowPromocodeModal(false);
        requestSubscription({
          sku: plan.productId,
          subscriptionOffers: [{ sku: plan.productId, offerToken: activeOffer.offerToken }],
          purchaseTokenAndroid: activeOffer.purchaseTokenAndroid,
        });
      } else {
        setShowPromocodeModal(false);
        requestSubscription({
          sku: plan.productId,
          subscriptionOffers: [{ sku: plan.productId, offerToken: activeOffer.offerToken }],
          withOffer: activeOffer,
        });
      }
    };

    return (
      <Box>
        <Text>Enter Code</Text>
        <KeeperTextInput
          onBlur={validateOnFocusLost}
          placeholder="Promo Code"
          value={code}
          isError={isInvalidCode}
          onChangeText={(value) => {
            setcode(value.trim());
            setIsInvalidCode(false);
            setActiveOffer(null);
          }}
          onFocus={() => setIsInvalidCode(false)}
          testID="input_setcode"
        />
        <Box alignItems={'flex-end'} mt={hp(20)}>
          <Buttons
            primaryText="Subscribe Now"
            primaryDisable={!activeOffer}
            primaryCallback={onSubscribe}
            paddingHorizontal={wp(20)}
            secondaryText="Cancel"
            secondaryCallback={() => setShowPromocodeModal(false)}
          />
        </Box>
      </Box>
    );
  }

  const getActionBtnTitle = () => {
    const isSubscribed = items[currentPosition].productIds.includes(
      subscription.productId.toLowerCase()
    );
    if (isSubscribed) return 'Subscribed';
    return (
      'Continue - ' +
      (isMonthly
        ? items[currentPosition]?.monthlyPlanDetails.price ?? 'Free'
        : items[currentPosition]?.yearlyPlanDetails.price ?? 'Free')
    );
  };

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={choosePlan.choosePlantitle}
        mediumTitle
        subtitle={choosePlan.choosePlanSubtitle}
        rightComponent={
          <MonthlyYearlySwitch value={isMonthly} onValueChange={() => setIsMonthly(!isMonthly)} />
        }
        // To-Do-Learn-More
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
      <KeeperModal
        visible={showPromocodeModal}
        close={() => setShowPromocodeModal(false)}
        title="Subscribe with Promo code"
        subTitle={`Please enter the code to redeem discount`}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        DarkCloseIcon={colorMode === 'dark'}
        showCloseIcon={false}
        buttonText={null}
        buttonCallback={() => {}}
        Content={PromocodeModalContent}
        subTitleWidth={wp(250)}
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
          style={{ height: '100%', marginVertical: 0 }}
        >
          <ChoosePlanCarousel
            data={items}
            onPress={(item, level) => processSubscription(item, level)}
            onChange={(item) => setCurrentPosition(item)}
            isMonthly={isMonthly}
            requesting={requesting}
            currentPosition={currentPosition}
          />

          <Box mt={10}>
            <Box ml={5}>
              <Box>
                <Text
                  fontSize={15}
                  medium={true}
                  color={`${colorMode}.headerText`}
                  letterSpacing={0.16}
                >
                  {`Included in ${items[currentPosition].name}`}
                </Text>
              </Box>

              <Pressable
                onPress={restorePurchases}
                testID="btn_restorePurchases"
                style={styles.restorePurchaseWrapper}
              >
                <Text style={styles.restorePurchase} medium color={`${colorMode}.brownColor`}>
                  {choosePlan.restorePurchases}
                </Text>
              </Pressable>

              <Box mt={1}>
                {items?.[currentPosition]?.benifits.map(
                  (i) =>
                    i !== '*Coming soon' && (
                      <Box style={styles.benefitContainer} key={i}>
                        <PlanCheckMark />
                        <Text
                          fontSize={12}
                          color={`${colorMode}.GreyText`}
                          ml={2}
                          letterSpacing={0.65}
                        >
                          {` ${i}`}
                        </Text>
                      </Box>
                    )
                )}
              </Box>
            </Box>
            {items?.[currentPosition]?.comingSoon && (
              <Text style={styles.comingSoonText} color={`${colorMode}.secondaryText`}>
                * {common.commingSoon}
              </Text>
            )}
          </Box>
        </ScrollView>
      )}

      {/* BTM CTR */}

      {!loading &&
        items &&
        !items[currentPosition].productIds.includes(subscription.productId.toLowerCase()) && (
          <>
            <Box style={[styles.noteWrapper, { paddingBottom: inset.bottom }]}>
              <Text style={{ fontSize: 11, marginLeft: 20 }} color={`${colorMode}.GreyText`}>
                {formatString(choosePlan.noteSubTitle)}
              </Text>

              <Box style={styles.divider} />
              <Box
                backgroundColor={`${colorMode}.ChampagneBliss`}
                style={{ paddingBottom: 30, paddingTop: 26, paddingHorizontal: 32 }}
              >
                <CustomGreenButton
                  onPress={() => processSubscription(items[currentPosition], currentPosition)}
                  value={getActionBtnTitle()}
                  fullWidth
                />
                <TextActionBtn
                  value="Subscribe with Promo Code"
                  onPress={() => setShowPromocodeModal(true)}
                  visible={
                    currentPosition != 0 &&
                    !items[currentPosition].productIds.includes(
                      subscription.productId.toLowerCase()
                    )
                  }
                />
              </Box>
            </Box>
          </>
        )}
    </ScreenWrapper>
  );
}

const TextActionBtn = ({ value, onPress, visible }) => {
  return (
    <TouchableOpacity
      onPress={() => visible && onPress()}
      style={{ alignSelf: 'center', opacity: visible ? 1 : 0, marginTop: 20 }}
    >
      <Box>
        <Text style={styles.ctaText} color="light.headerText" medium>
          {value}
        </Text>
      </Box>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  noteWrapper: {
    flexDirection: 'column',
    bottom: 0,
    margin: 1,
    width,
    position: 'absolute',
  },
  restorePurchaseWrapper: {
    marginTop: 5,
    marginBottom: 15,
  },
  comingSoonText: {
    fontSize: 10,
    letterSpacing: 0.1,
    marginLeft: 10,
  },
  benefitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 5 / 2,
    alignSelf: 'center',
  },
  restorePurchase: {
    fontSize: 13,
    letterSpacing: 0.24,
    textDecorationLine: 'underline',
  },
  ctaText: {
    fontSize: 13,
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    width,
    backgroundColor: Colors.GrayX11,
    alignSelf: 'center',
    marginTop: 20,
  },
});
export default ChoosePlan;
