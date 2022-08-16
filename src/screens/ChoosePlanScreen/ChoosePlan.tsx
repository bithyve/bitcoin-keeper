import React, { useContext, useState, useEffect } from 'react';
import { Box, Text, StatusBar } from 'native-base';
import { SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useIAP } from 'react-native-iap';

import { RFValue } from 'react-native-responsive-fontsize';

import BackIcon from 'src/assets/icons/back.svg';
import ChoosePlanCarousel from 'src/components/Carousel/ChoosePlanCarousel';
import Note from 'src/components/Note/Note';
import DotView from 'src/components/DotView';
import { LocalizationContext } from 'src/common/content/LocContext';
import RNIap, {
  requestSubscription,
  getSubscriptions,
  purchaseErrorListener,
  purchaseUpdatedListener,
} from 'react-native-iap';

const ChoosePlan = (props) => {
  const { translations } = useContext(LocalizationContext);
  const choosePlan = translations['choosePlan'];
  const [currentPosition, setCurrentPosition] = useState(0);
  const [items, setItems] = useState([
    {
      id: '1',
      title: 'Benefits of Basic tier',
      subTitle: 'A good place to start',
      point1: 'Add multiple wallets',
      point2: 'Encrypted iCloud/ Google Drive backup for wallets',
      point3: 'Add one hardware signer',
      point4: 'Air-gapped Vault (single-sig)',
      point5: 'Community support',
    },
    {
      id: '2',
      title: 'Benefits of Pro tier',
      subTitle: 'Suggested for up to $50,000 in total funds',
      point1: 'All features of Basic tier',
      point2: 'Import wallets',
      point3: 'Add up to 3 hardware signers',
      point4: '2 of 3 multi-sig Vault',
      point5: 'Email support',
    },
    {
      id: '3',
      title: 'Benefits of Elite tier',
      subTitle: 'Suggested for up to $100,000,000 in total funds',
      point1: 'All features of Pro tier',
      point2: 'Add up to 5 hardware wallets',
      point3: '3 of 5 multi-sig Vault',
      point4: 'Inheritance and independent recovery',
      point5: 'Dedicated email support',
    },
  ]);

  useEffect(() => {
    let purchaseUpdateSubscription;
    let purchaseErrorSubscription;
    RNIap.initConnection()
      .then((connected) => {
        purchaseUpdateSubscription = purchaseUpdatedListener((purchase) => {
          console.log('purchaseUpdatedListener', purchase);
          const receipt = purchase.transactionReceipt;
          console.log('receipt', receipt);
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
    init()
  }, [])

  async function init() {
    try {
      const subscriptions = await getSubscriptions(['io.hexawallet.keeper.development.hodler'])
      console.log('subscriptions', JSON.stringify(subscriptions))
    } catch (error) {
      console.log('error', error)
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
      <ScrollView style={{ height: '70%' }}>
        <ChoosePlanCarousel onPress={async () => {
          try {
            console.log('init')
            await requestSubscription({
              sku: 'io.hexawallet.keeper.development.hodler',
              purchaseTokenAndroid: "AUj/YhhKjEkywRa7lw8TLw1WdTWEDuzHN7kGvmpMJR+YFGkeOYQgeO+zp4xD6whNYErNNfLl15vK4Vp0CXN1O9NdIkOaelW+F4WAE8K1stHRC17ZXgf9MVfq1Xg4xQ+Ubd+Hq5QA0ZSU8SX65CSV",
              subscriptionOffers: [{
                sku: 'io.hexawallet.keeper.development.hodler',
                offerToken: "AUj/YhhKjEkywRa7lw8TLw1WdTWEDuzHN7kGvmpMJR+YFGkeOYQgeO+zp4xD6whNYErNNfLl15vK4Vp0CXN1O9NdIkOaelW+F4WAE8K1stHRC17ZXgf9MVfq1Xg4xQ+Ubd+Hq5QA0ZSU8SX65CSV",
              }]
            })
          } catch (err) {
            console.log(err.code, err.message);
          }
        }
        }
          onChange={(item) => setCurrentPosition(item)} />
        <Box mx={10} my={5}>
          <Text
            fontSize={RFValue(14)}
            color={'light.lightBlack'}
            fontWeight={'bold'}
            fontFamily={'body'}
          >
            {items[currentPosition].title}
          </Text>
          <Text fontSize={RFValue(12)} color={'light.GreyText'} fontFamily={'body'}>
            {items[currentPosition].subTitle}
          </Text>
        </Box>
        <Box mx={12}>
          <Box flexDirection={'row'} alignItems={'center'}>
            <DotView height={2} width={2} color={'black'} />
            <Text fontSize={RFValue(13)} color={'light.GreyText'} mb={2} ml={3} fontFamily={'body'}>
              {items[currentPosition].point1}
            </Text>
          </Box>
          <Box flexDirection={'row'} alignItems={'center'}>
            <DotView height={2} width={2} color={'black'} />
            <Text fontSize={RFValue(13)} color={'light.GreyText'} mb={2} ml={3}>
              {items[currentPosition].point2}
            </Text>
          </Box>
          <Box flexDirection={'row'} alignItems={'center'}>
            <DotView height={2} width={2} color={'black'} />
            <Text fontSize={RFValue(13)} color={'light.GreyText'} mb={2} ml={3}>
              {items[currentPosition].point3}
            </Text>
          </Box>
          <Box flexDirection={'row'} alignItems={'center'}>
            <DotView height={2} width={2} color={'black'} />
            <Text fontSize={RFValue(13)} color={'light.GreyText'} mb={2} ml={3}>
              {items[currentPosition].point4}
            </Text>
          </Box>
          <Box flexDirection={'row'} alignItems={'center'}>
            <DotView height={2} width={2} color={'black'} />
            <Text fontSize={RFValue(13)} color={'light.GreyText'} mb={2} ml={3}>
              {items[currentPosition].point5}
            </Text>
          </Box>
        </Box>
      </ScrollView>
      <Box height={'10%'} justifyContent={'flex-end'} pt={2}>
        <Note title={'Note'} subtitle={choosePlan.noteSubTitle} />
      </Box>
    </SafeAreaView>
  );
};
export default ChoosePlan;
