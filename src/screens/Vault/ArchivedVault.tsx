import React, { useContext } from 'react';
import { Pressable, FlatList, Box, Text } from 'native-base';
import moment from 'moment';
// data
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
// components and asserts
import HeaderTitle from 'src/components/HeaderTitle';
import BTC from 'src/assets/images/svgs/btc_black.svg';
import Arrow from 'src/assets/images/svgs/icon_arrow.svg';

const ArchivedVault = () => {

  const { useQuery } = useContext(RealmWrapperContext);
  const vault: Vault = useQuery(RealmSchema.Vault)
    .map(getJSONFromRealmObject)
    .filter((vault) => vault.archived)[0];

  console.log('sdfsd', vault);

  const SignerItem = ({ signer, index }: { signer: any | undefined; index: number }) => {
    return (
      <Pressable
        backgroundColor={'light.lightYellow'}
        height={hp(135)}
        width={wp(300)}
        flexDirection={'row'}
        justifyContent={'space-between'}
        alignItems={'center'}
        style={{
          paddingHorizontal: 20,
          borderRadius: hp(10),
          marginBottom: hp(16)
        }}
      >
        <Box>
          <Box
            flexDirection={'row'}
            alignItems={'center'}
            style={{
              marginBottom: hp(10)
            }}
          >
            <Text
              color={'light.headerText'}
              fontSize={16}
              fontWeight={300}
              fontFamily={'body'}
            >
              12
            </Text>
            <Text
              color={'light.textBlack'}
              fontSize={12}
              fontWeight={200}
              marginLeft={1}
              letterSpacing={0.72}
            >
              Transactions
            </Text>
          </Box>
          <Box
            flexDirection={'row'}
            style={{
              marginBottom: hp(10)
            }}>
            <Box justifyContent={'center'} marginTop={2}>
              <BTC />
            </Box>
            <Text
              color={'light.textBlack'}
              fontSize={24}
              fontWeight={200}
              letterSpacing={1.12}
              style={{
                marginLeft: wp(4)
              }}
            >
              0.00
            </Text>
          </Box>
          <Box
            flexDirection={'row'}>
            <Text
              color={'light.textBlack'}
              fontSize={12}
              fontWeight={100}
              letterSpacing={0.02}
            >
              Archived On
            </Text>
            <Text
              color={'light.textBlack'}
              fontSize={12}
              fontWeight={300}
              letterSpacing={0.02}
              fontStyle={'italic'}
            >
              {` ${'12 December, 2021'}`}
            </Text>
          </Box>
        </Box>
        <Box>
          <Arrow />
        </Box>
      </Pressable>
    );
  };

  const renderSigner = ({ item, index }) => <SignerItem signer={item} index={index} />;

  return (
    <ScreenWrapper>
      <HeaderTitle
        title={'Archived Vaults'}
        subtitle={'Lorem ipsum dolor sit amet, consectetur'}
        headerTitleColor={'light.headerText'}
        paddingLeft={4}
        paddingTop={5}
      />

      <Box alignItems={'center'}>
        <FlatList
          data={[1, 2, 3]}
          keyExtractor={(item, index) => item}
          renderItem={renderSigner}
          style={{
            marginTop: hp(44),
          }}
        />
      </Box>
    </ScreenWrapper>
  );
};

export default ArchivedVault;
