import { Platform, SafeAreaView, TouchableOpacity } from 'react-native';
import { Box, Pressable, ScrollView, StatusBar, Text, VStack } from 'native-base';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import Header from 'src/components/Header';
import { RFValue } from 'react-native-responsive-fontsize';
import { useNavigation } from '@react-navigation/native';
import CustomGreenButton from 'src/components/CustomButton/CustomGreenButton';
import React, { useContext, useState } from 'react';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { RealmSchema } from 'src/storage/realm/enum';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { WalletMap } from '../Vault/WalletMap';

const AddSigners = ({ props }) => {
  const navigation = useNavigation();
  const { useQuery } = useContext(RealmWrapperContext);
  const vaults: Vault[] = useQuery(RealmSchema.Vault);
  const Signers = vaults[0]?.signers;
  console.log(JSON.stringify(Signers));

  const [list, setList] = useState(Signers);

  const RemoveIcon = () => {
    return (
      <Box
        backgroundColor={'#FAC48B'}
        height={hp(30)}
        width={wp(85)}
        borderRadius={'3'}
        justifyContent={'center'}
        alignItems={'center'}
      >
        <Text
          color={'#4F5955'}
          fontFamily={'body'}
          fontWeight={200}
          letterSpacing={0.36}
          fontSize={RFValue(11)}
        >
          Remove
        </Text>
      </Box>
    );
  };

  const removeSigner = (signer) => {
    // console.log('--> signer');
    // const newList = list.filter((item) => item != signer.signerId);
    // return setList(newList);
    const newList = list.findIndex(({ signerId }) => signerId === signer.xpubInfo);
    if (newList !== -1) {
      setList([...list.slice(0, newList), ...list.slice(newList + 1)]);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#F7F2EC',
      }}
    >
      <StatusBar backgroundColor={'#F7F2EC'} barStyle="dark-content" />
      <Box ml={3} mt={Platform.OS == 'ios' ? 3 : 10}>
        <Header title={'Add Signers'} subtitle={'Lorem ipsum dolor sit amet'} />
      </Box>
      <ScrollView>
        <Box mx={wp(18)} my={hp(10)}>
          {Signers.map((signer) => {
            return (
              <Box
                flex={1}
                flexDirection={'row'}
                justifyContent={'space-between'}
                alignItems={'center'}
                p={4}
                {...props}
              >
                <Box
                  height={9}
                  width={9}
                  borderRadius={18}
                  bg={'#725436'}
                  justifyContent={'center'}
                  alignItems={'center'}
                  alignSelf={'center'}
                  mr={wp(20)}
                >
                  {WalletMap(signer.type, true).Icon}
                </Box>
                <VStack flex={1}>
                  <Text
                    color={'#041513'}
                    fontWeight={200}
                    fontSize={RFValue(13)}
                    letterSpacing={1.04}
                    fontFamily={'body'}
                  >
                    {signer.signerName}
                  </Text>
                  <Text
                    color={'#4F5955'}
                    fontFamily={'body'}
                    fontWeight={200}
                    letterSpacing={0.36}
                    fontSize={RFValue(12)}
                    justifyContent={'space-between'}
                  >
                    {signer.type}
                  </Text>
                </VStack>
                <TouchableOpacity onPress={() => removeSigner(signer)}>
                  <Box flex={1} justifyContent={'center'} alignItems={'center'} ml={wp(10)}>
                    <RemoveIcon />
                  </Box>
                </TouchableOpacity>
              </Box>
            );
          })}
        </Box>
      </ScrollView>
      <Box
        alignSelf={'flex-end'}
        flex={0.1}
        flexDirection={'row'}
        mx={wp(10)}
        alignItems={'center'}
        justifyContent={'center'}
      >
        <TouchableOpacity>
          <Text
            mx={'7%'}
            fontSize={13}
            fontFamily={'body'}
            fontWeight={'300'}
            letterSpacing={1}
            color={'#073E39'}
          >
            Cancel
          </Text>
        </TouchableOpacity>
        <CustomGreenButton value={'Next'} />
      </Box>
    </SafeAreaView>
  );
};

export default AddSigners;
