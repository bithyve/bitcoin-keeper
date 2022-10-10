import React, { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform
} from 'react-native';
import { Box, StatusBar, Text } from 'native-base';
import RNIap, {
  getSubscriptions,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestSubscription,
} from 'react-native-iap';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import ChoosePlanCarousel from 'src/components/Carousel/ChoosePlanCarousel';
import DiamondHands from 'src/assets/images/svgs/ic_diamond_hands.svg';
import DiamondHandsFocused from 'src/assets/images/svgs/ic_diamond_hands_focused.svg';
import HeaderTitle from 'src/components/HeaderTitle';
import Hodler from 'src/assets/images/svgs/ic_hodler.svg';
import HodlerFocused from 'src/assets/images/svgs/ic_hodler_focused.svg';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { LocalizationContext } from 'src/common/content/LocContext';
import Note from 'src/components/Note/Note';
import Pleb from 'src/assets/images/svgs/ic_pleb.svg';
import PlebFocused from 'src/assets/images/svgs/ic_pleb_focused.svg';
import { RFValue } from 'react-native-responsive-fontsize';
import { RealmSchema } from 'src/storage/realm/enum';
import ScreenWrapper from 'src/components/ScreenWrapper';
import SubScription from 'src/common/data/models/interfaces/Subscription';
import { Subscription } from 'react-native-iap';
import dbManager from 'src/storage/realm/dbManager';
import TierUpgradeModal from './TierUpgradeModal';
import { SubscriptionTier } from 'src/common/data/enums/SubscriptionTier';
import { useNavigation } from '@react-navigation/native';

const plans = [
  {
    description: 'A good place to start',
    benifits: [
      'Add multiple BIP-85 wallets',
      'Autotransfer to Vault',
      'Add one air gapped Signing Device',
      'Community support',
    ],
    name: 'Pleb',
    productId: 'Pleb',
    productType: 'free',
    subTitle: 'Always free',
    icon: <Pleb />,
    iconFocused: <PlebFocused />,
    price: '',
  },
  {
    benifits: [
      'All features of Pleb tier',
      'Link wallets',
      'Add three Signing Devices',
      '2 of 3 multi-sig Vault',
      'Email support',
    ],
    subTitle: 'Multi-sig security',
    icon: <Hodler />,
    iconFocused: <HodlerFocused />,
    price: '',
    name: 'Hodler',
    productId: 'hodler',
  },
  {
    benifits: [
      'All features of the Hodler tier',
      'Add five Signing Devices',
      '3 of 5 multi-sig Vault',
      'Inheritance support',
      'Dedicated email support',
    ],
    subTitle: 'Includes Inheritance',
    icon: <DiamondHands />,
    iconFocused: <DiamondHandsFocused />,
    price: '',
    name: 'Diamond Hands',
    productId: 'diamondhands',
  },
];

const ChoosePlan = (props) => {
  const { translations } = useContext(LocalizationContext);
  const choosePlan = translations['choosePlan'];
  const [currentPosition, setCurrentPosition] = useState(0);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([plans[0]]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [isUpgrade, setIsUpgrade] = useState(false)
  const { useQuery } = useContext(RealmWrapperContext);
  const { subscription }: KeeperApp = useQuery(RealmSchema.KeeperApp)[0];
  const navigation = useNavigation()

  useEffect(() => {
    let purchaseUpdateSubscription;
    let purchaseErrorSubscription;
    RNIap.initConnection()
      .then((connected) => {
        purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
          console.log('purchaseUpdatedListener', purchase);
          const receipt = purchase.transactionReceipt;
          const { id }: KeeperApp = dbManager.getObjectByIndex(RealmSchema.KeeperApp);
          const sub = await getSubscriptions([purchase.productId]);
          const subscription: SubScription = {
            productId: purchase.productId,
            receipt: receipt,
            name: sub[0].title.split(' ')[0],
            level: 1 // todo get level
          };

          dbManager.updateObjectById(RealmSchema.KeeperApp, id, {
            subscription,
          });
          const finish = await RNIap.finishTransaction(purchase, false);
        });
        purchaseErrorSubscription = purchaseErrorListener((error) => {
          console.log('purchaseErrorListener', error);
        });
      })
      .catch((e) => {
        console.log(e);
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

  useEffect(() => {
    init();
  }, []);

  function getAmt(subscription: Subscription) {
    try {
      if (Platform.OS === 'ios') {
        return subscription.localizedPrice;
      } else {
        return subscription.subscriptionOfferDetails[0].pricingPhases.pricingPhaseList[0]
          .formattedPrice;
      }
    } catch (error) {
      console.log('error', error);
    }
  }

  async function init() {
    try {
      /* const subscriptions = await getSubscriptions([
         'io.hexawallet.keeper.development.hodler',
         'io.hexawallet.keeper.development.whale',
       ]);
       const data = [plans[0]];
 
       subscriptions.forEach((subscription, index) => {
         data.push({
           ...subscription,
           ...plans[index + 1],
           price: getAmt(subscription),
           name: subscription.title.split(' (')[0],
         });
       });*/
      setItems(plans);
      setLoading(false);
      // console.log('subscriptions', JSON.stringify(data));
    } catch (error) {
      console.log('error', error);
    }
  }

  async function processSubscription(item: Subscription, level: number) {
    try {
      const { id }: KeeperApp = dbManager.getObjectByIndex(RealmSchema.KeeperApp);
      const sub: SubScription = {
        productId: item.productId,
        receipt: 'mock-purchase',
        name: item.name.split(' (')[0],
        level,
      };
      dbManager.updateObjectById(RealmSchema.KeeperApp, id, {
        subscription: sub,
      });
      if (item.productId === SubscriptionTier.PLEB) {
        setIsUpgrade(false)
      } else if (
        item.name.split(' ')[0] === SubscriptionTier.HODLER &&
        subscription.name === SubscriptionTier.DIAMOND_HANDS
      ) {
        setIsUpgrade(false)
      } else {
        setIsUpgrade(true)
      }
      setShowUpgradeModal(true)
      return;
      if (__DEV__) {
        const { id }: KeeperApp = dbManager.getObjectByIndex(RealmSchema.KeeperApp);
        const sub: SubScription = {
          productId: subscription.productId,
          receipt: 'free',
          name: subscription.name.split(' ')[0],
        };
        dbManager.updateObjectById(RealmSchema.KeeperApp, id, {
          subscription: sub,
        });
      } else {
        if (Platform.OS === 'android') {
          await requestSubscription({
            sku: subscription.productId,
            ...(subscription.subscriptionOfferDetails[0].offerToken && {
              subscriptionOffers: [
                {
                  sku: subscription.productId,
                  offerToken: subscription.subscriptionOfferDetails[0].offerToken,
                },
              ],
            }),
          });
        } else {
          await requestSubscription({
            sku: subscription.productId,
          });
        }
      }
    } catch (err) {
      console.log(err.code, err.message);
    }
  }

  const onPressModalBtn = () => {
    setShowUpgradeModal(false)
    navigation.navigate('AddSigningDevice')
  }

  const getBenifitsTitle = (name) => {
    if (name === 'Diamond Hands') {
      return `${name} means`
    } else {
      return `A ${name} gets`
    }
  }

  return (
    <ScreenWrapper barStyle="dark-content">
      <HeaderTitle title={choosePlan.choosePlantitle} subtitle={choosePlan.choosePlanSubTitle} />

      <TierUpgradeModal
        visible={showUpgradeModal}
        close={() => setShowUpgradeModal(false)}
        onPress={onPressModalBtn}
        isUpgrade={isUpgrade}
      />
      {loading ? (
        <ActivityIndicator style={{ height: '70%' }} size="large" />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ height: '70%', marginVertical: 20 }}
        >
          <ChoosePlanCarousel
            data={items}
            onPress={(item, level) => processSubscription(item, level)}
            onChange={(item) => setCurrentPosition(item)}
          />
          <Box mx={5} my={5}>
            <Text
              fontSize={RFValue(14)}
              color={'light.lightBlack'}
              fontWeight={'bold'}
              fontFamily={'body'}
            >
              {getBenifitsTitle(items[currentPosition].name)}
            </Text>
            {/* <Text fontSize={RFValue(12)} color={'light.GreyText'} fontFamily={'body'}>
            {items[currentPosition].subTitle}
          </Text> */}
          </Box>
          <Box mx={7}>
            {items[currentPosition].benifits.map((i) => (
              <Box flexDirection={'row'} alignItems={'center'}>
                <Text
                  fontSize={RFValue(13)}
                  color={'light.GreyText'}
                  mb={2}
                  ml={3}
                  fontFamily={'body'}
                >
                  {`• ${i}`}
                </Text>
              </Box>
            ))}
          </Box>
        </ScrollView>
      )}
      <Box height={'10%'} justifyContent={'flex-end'} pt={1}>
        <Note title={'Note'} subtitle={choosePlan.noteSubTitle} />
      </Box>
    </ScreenWrapper>
  );
};
export default ChoosePlan;
