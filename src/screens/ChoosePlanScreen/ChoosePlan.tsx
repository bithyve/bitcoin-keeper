import { ActivityIndicator, Platform, ScrollView } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box } from 'native-base';
import RNIap, {
  Subscription,
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
import { SubscriptionTier } from 'src/common/data/enums/SubscriptionTier';
import dbManager from 'src/storage/realm/dbManager';
import { useNavigation } from '@react-navigation/native';
import { wp } from 'src/common/data/responsiveness/responsive';
import Relay from 'src/core/services/operations/Relay';
import TierUpgradeModal from './TierUpgradeModal';

function ChoosePlan(props) {
  const { translations } = useContext(LocalizationContext);
  const { choosePlan } = translations;
  const [currentPosition, setCurrentPosition] = useState(0);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<SubScriptionPlan[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isUpgrade, setIsUpgrade] = useState(false);
  const { useQuery } = useContext(RealmWrapperContext);
  const { subscription }: KeeperApp = useQuery(RealmSchema.KeeperApp)[0];
  const navigation = useNavigation();

  useEffect(() => {
    const purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
      const receipt = purchase.transactionReceipt;
      const { id, appID }: KeeperApp = dbManager.getObjectByIndex(RealmSchema.KeeperApp);
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
          dbManager.updateObjectById(RealmSchema.KeeperApp, id, {
            subscription,
          });
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

  function getAmt(subscription: Subscription) {
    try {
      if (Platform.OS === 'ios') {
        return subscription.localizedPrice;
      }
      return subscription.subscriptionOfferDetails[0].pricingPhases.pricingPhaseList[0]
        .formattedPrice;
    } catch (error) {
      console.log('error', error);
    }
  }

  async function init() {
    try {
      const { id, appID }: KeeperApp = dbManager.getObjectByIndex(RealmSchema.KeeperApp);
      const getPlansRespone = await Relay.getSubscriptionDetails(id, appID)
      if (getPlansRespone.plans) {
        const skus = []
        getPlansRespone.plans.filter(plan => plan.isActive)
          .forEach(plan => skus.push(...plan.productIds))
        const subscriptions = await getSubscriptions(skus);
        const data = getPlansRespone.plans
        subscriptions.forEach((subscription, i) => {
          const index = data.findIndex(plan => plan.productIds.includes(subscription.productId))
          data[index].planDetails = subscription
        });
        // console.log('subscriptions', JSON.stringify(data))
        setItems(data);
        setLoading(false);
      }
    } catch (error) {
      console.log('error', error);
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
      const sku = subscription.planDetails.productId
      const offerToken = subscription.planDetails.subscriptionOfferDetails ? subscription.planDetails.subscriptionOfferDetails[1].offerToken : null;
      requestSubscription(
        { sku: subscription.planDetails.productId, subscriptionOffers: [{ sku, offerToken }] },
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
        <HeaderTitle
          title={choosePlan.choosePlantitle}
          subtitle={
            subscription.name === 'Diamond Hands'
              ? `You are currently a ${subscription.name.slice(0, -1)}`
              : `You are currently a ${subscription.name}`
          }
          headerTitleColor="light.primaryText"
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
            style={{ height: '80%', marginVertical: 0 }}
          >
            <ChoosePlanCarousel
              data={items}
              onPress={(item, level) => processSubscription(item, level)}
              onChange={(item) => setCurrentPosition(item)}
            />

            <Box opacity={0.1} backgroundColor="light.Border" width="100%" height={0.5} my={5} />

            <Box ml={8}>
              <Box>
                <Text fontSize={14} color="light.primaryText" letterSpacing={1.12}>
                  {getBenifitsTitle(items[currentPosition].name)}:
                </Text>
                {/* <Text fontSize={(12)} color={'light.GreyText'} >
            {items[currentPosition].subTitle}
          </Text> */}
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
