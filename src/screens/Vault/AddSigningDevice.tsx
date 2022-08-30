import { Box, FlatList, Text } from 'native-base';
//Asserts, functions
import { hp, wp } from 'src/common/data/responsiveness/responsive';

import Buttons from 'src/components/Buttons';
// components
import Header from 'src/components/Header';
import Icon from 'src/assets/images/svgs/icon_vault_mac.svg';
// libraries
import React from 'react';
import { SafeAreaView } from 'react-native';
import StatusBarComponent from 'src/components/StatusBarComponent';

const AddSigningDevice = () => {
  const signers = [
    {
      Icon: Icon,
      name: 'Tap Signer',
      date: 'Added on 12 January 2022',
    },
    {
      Icon: Icon,
      name: 'ColdCard',
      date: 'Added on 20 July 2022',
    },
    {
      Icon: Icon,
      name: 'Trezor',
      date: 'Added on 20 July 2022',
    },
    {
      Icon: Icon,
      name: 'Ledger',
      date: 'Added on 20 July 2022',
    },
    {
      Icon: Icon,
      name: 'Mobile Device',
      date: 'Added on 20 July 2022',
    },
  ];
  const InheritancePoint = ({ title, description, Icon }) => {
    return (
      <Box flexDir={'row'} alignItems={'center'} marginBottom={hp(30)}>
        <Icon />
        <Box style={{ marginLeft: wp(2) }}>
          <Text
            color={'light.lightBlack'}
            fontSize={15}
            numberOfLines={2}
            alignItems={'center'}
            letterSpacing={1.12}
          >
            {title}
          </Text>
          <Text color={'light.GreyText'} fontSize={13} letterSpacing={0.6}>
            {description}
          </Text>
        </Box>
      </Box>
    );
  };

  const renderSigner = ({ item }) => {
    return <InheritancePoint title={item?.name} description={item?.date} Icon={item?.Icon} />;
  };
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: 'light.ReceiveBackground',
      }}
    >
      <StatusBarComponent padding={20} />
      <Box
        position="relative"
        flex={1}
        style={{
          paddingHorizontal: wp(20),
        }}
      >
        <Header
          title={'Add Signers'}
          subtitle={'Lorem ipsum dolor sit amet, consectetur'}
          headerTitleColor={'light.textBlack'}
        />

        <FlatList
          data={signers}
          keyExtractor={(item) => item}
          renderItem={renderSigner}
          style={{
            marginTop: hp(52),
          }}
        />
        <Box position={'absolute'} bottom={0} width={'100%'}>
          <Buttons
            primaryText="Next"
            primaryCallback={() => console.log('next')}
            secondaryText={'Cancel'}
            secondaryCallback={() => console.log('Cancel')}
          />
        </Box>
      </Box>
    </SafeAreaView>
  );
};

export default AddSigningDevice;
