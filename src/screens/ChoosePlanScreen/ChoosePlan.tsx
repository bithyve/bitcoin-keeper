import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Box, StatusBar, Text } from 'native-base';
import RNIap, {
  getSubscriptions,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestSubscription,
} from 'react-native-iap';
import React, { useContext, useEffect, useState } from 'react';

import BackIcon from 'src/assets/icons/back.svg';
import ChoosePlanCarousel from 'src/components/Carousel/ChoosePlanCarousel';
import Hodler from 'src/assets/images/svgs/ic_hodler.svg';
import HodlerFocused from 'src/assets/images/svgs/ic_hodler_focused.svg';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { LocalizationContext } from 'src/common/content/LocContext';
import Note from 'src/components/Note/Note';
import Pleb from 'src/assets/images/svgs/ic_pleb.svg';
import PlebFocused from 'src/assets/images/svgs/ic_pleb_focused.svg';
import { RFValue } from 'react-native-responsive-fontsize';
import { RealmSchema } from 'src/storage/realm/enum';
import SubScription from 'src/common/data/models/interfaces/Subscription';
import { Subscription } from 'react-native-iap';
import DiamondHands from 'src/assets/images/svgs/ic_diamond_hands.svg';
import DiamondHandsFocused from 'src/assets/images/svgs/ic_diamond_hands_focused.svg';
import dbManager from 'src/storage/realm/dbManager';

const plans = [
  {
    description: 'A good place to start',
    benifits: [
      'Add multiple wallets',
      'Encrypted iCloud/ Google Drive backup for wallets',
      'Add one hardware signer',
      'Air-gapped Vault (single-sig)',
      'Community support',
    ],
    name: 'PLEB',
    productId: 'pleb',
    productType: 'free',
    subTitle: 'Always free',
    icon: <Pleb />,
    iconFocused: <PlebFocused />,
    price: '',
  },
  {
    benifits: [
      'All features of Pleb tier',
      'Import wallets',
      'Add up to 3 hardware signers',
      '2 of 3 multi-sig Vault',
      'Email support',
    ],
    subTitle: 'Multi-sig security',
    icon: <Hodler />,
    iconFocused: <HodlerFocused />,
    price: '',
  },
  {
    benifits: [
      'All features of Whale tier',
      'Add up to 5 hardware wallets',
      '3 of 5 multi-sig Vault',
      'Inheritance and independent recovery',
      'Dedicated email support',
    ],
    subTitle: 'Includes Inheritance',
    icon: <DiamondHands />,
    iconFocused: <DiamondHandsFocused />,
    price: '',
  },
];

const ChoosePlan = (props) => {
  const { translations } = useContext(LocalizationContext);
  const choosePlan = translations['choosePlan'];
  const [currentPosition, setCurrentPosition] = useState(0);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([plans[0]]);

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
      const subscriptions = await getSubscriptions([
        'io.hexawallet.keeper.development.hodler',
        'io.hexawallet.keeper.development.whale',
      ]);
      const data = [plans[0]];

      subscriptions.forEach((subscription, index) => {
        data.push({
          ...subscription,
          ...plans[index + 1],
          price: getAmt(subscription),
          name: subscription.title,
        });
      });
      setItems([...data]);
      setLoading(false);
      // console.log('subscriptions', JSON.stringify(data));
    } catch (error) {
      console.log('error', error);
    }
  }

  async function processSubscription(subscription: Subscription) {
    try {
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

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#F7F2EC',
      }}
    >
      <StatusBar backgroundColor={'#F7F2EC'} barStyle="dark-content" />
      <Box height={'20%'} mt={4}>
        <Box mx={7} my={5}>
          <TouchableOpacity onPress={() => props.navigation.goBack()}>
            <BackIcon />
          </TouchableOpacity>
        </Box>
        <Box ml={10} mb={5} flexDirection={'row'} w={'100%'} alignItems={'center'}>
          <Box w={'60%'}>
            <Text fontSize={RFValue(20)} color={'light.textBlack'} fontFamily={'heading'}>
              {choosePlan.choosePlantitle}
            </Text>
            <Text fontSize={RFValue(12)} color={'light.GreyText'} fontFamily={'body'}>
              {choosePlan.choosePlanSubTitle}{' '}
            </Text>
          </Box>
        </Box>
      </Box>
      {loading ? (
        <ActivityIndicator style={{ height: '70%' }} size="large" />
      ) : (
        <ScrollView style={{ height: '70%' }}>
          <ChoosePlanCarousel
            data={items}
            onPress={async (item) => processSubscription(item)}
            onChange={(item) => setCurrentPosition(item)}
          />
          <Box mx={10} my={5}>
            <Text
              fontSize={RFValue(14)}
              color={'light.lightBlack'}
              fontWeight={'bold'}
              fontFamily={'body'}
            >
              {`Benefits of going ${items[currentPosition].name}`}
            </Text>
            {/* <Text fontSize={RFValue(12)} color={'light.GreyText'} fontFamily={'body'}>
            {items[currentPosition].subTitle}
          </Text> */}
          </Box>
          <Box mx={12}>
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

      <Box height={'10%'} justifyContent={'flex-end'} pt={2}>
        <Note title={'Note'} subtitle={choosePlan.noteSubTitle} />
      </Box>
    </SafeAreaView>
  );
};
export default ChoosePlan;
