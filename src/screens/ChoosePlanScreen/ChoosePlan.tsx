import React, { useContext, useState, useEffect } from 'react';
import { Box, Text, StatusBar } from 'native-base';
import { SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useIAP } from 'react-native-iap';

import { RFValue } from 'react-native-responsive-fontsize';

import BackIcon from 'src/assets/icons/back.svg';
import ChoosePlanCarousel from 'src/components/Carousel/ChoosePlanCarousel';
import Note from 'src/components/Note/Note';
import { LocalizationContext } from 'src/common/content/LocContext';
import RNIap, {
  requestSubscription,
  getSubscriptions,
  purchaseErrorListener,
  purchaseUpdatedListener,
} from 'react-native-iap';
import Basic from 'src/assets/images/svgs/basic.svg';
import Elite from 'src/assets/images/svgs/elitePlan.svg';
import Pro from 'src/assets/images/svgs/expert.svg';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

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
    icon: <Basic />,
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
    icon: <Pro />,
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
    icon: <Elite />,
  },
];

const ChoosePlan = (props) => {
  const { translations } = useContext(LocalizationContext);
  const choosePlan = translations['choosePlan'];
  const [currentPosition, setCurrentPosition] = useState(0);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [items, setItems] = useState([plans[0]]);

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
    init();
  }, []);

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
        });
      });
      setItems([...data]);
      setLoading(false);
      console.log('subscriptions', JSON.stringify(subscriptions));
    } catch (error) {
      console.log('error', error);
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
        <ChoosePlanCarousel
          data={items}
          onPress={async () => {
            try {
              console.log('init');
              await requestSubscription({
                sku: 'io.hexawallet.keeper.development.hodler',
                purchaseTokenAndroid:
                  'AUj/YhhKjEkywRa7lw8TLw1WdTWEDuzHN7kGvmpMJR+YFGkeOYQgeO+zp4xD6whNYErNNfLl15vK4Vp0CXN1O9NdIkOaelW+F4WAE8K1stHRC17ZXgf9MVfq1Xg4xQ+Ubd+Hq5QA0ZSU8SX65CSV',
                subscriptionOffers: [
                  {
                    sku: 'io.hexawallet.keeper.development.hodler',
                    offerToken:
                      'AUj/YhhKjEkywRa7lw8TLw1WdTWEDuzHN7kGvmpMJR+YFGkeOYQgeO+zp4xD6whNYErNNfLl15vK4Vp0CXN1O9NdIkOaelW+F4WAE8K1stHRC17ZXgf9MVfq1Xg4xQ+Ubd+Hq5QA0ZSU8SX65CSV',
                  },
                ],
              });
            } catch (err) {
              console.log(err.code, err.message);
            }
          }}
          onChange={(item) => setCurrentPosition(item)}
        />
        <Box
          alignItems={'center'}
          style={{
            marginTop: hp(30),
            marginBottom: hp(10),
            opacity: 0.1
          }}
        >
          <Box
            borderBottomColor={'light.Border'}
            borderBottomWidth={hp(1)}
            width={wp(318)}
          />
        </Box>

        <Box mx={10} my={5}>
          <Text
            fontSize={RFValue(14)}
            color={'light.lightBlack'}
            fontWeight={200}
            fontFamily={'body'}
            letterSpacing={1.12}
          >
            {`Benefits of going ${items[currentPosition].name}`}
          </Text>
          {/* <Text fontSize={RFValue(12)} color={'light.GreyText'} fontFamily={'body'}>
            {items[currentPosition].subTitle}
          </Text> */}
        </Box>
        <Box mx={12}>
          {items[currentPosition].benifits.map((i) => (
            <Box flexDirection={'row'} alignItems={'center'} marginY={hp(0.7)}>
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
      <Box height={'10%'} justifyContent={'flex-end'} pt={2}>
        <Note title={'Note'} subtitle={choosePlan.noteSubTitle} />
      </Box>
    </SafeAreaView>
  );
};
export default ChoosePlan;
