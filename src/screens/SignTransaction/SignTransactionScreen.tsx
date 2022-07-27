import React from 'react';
import { Box, StatusBar } from 'native-base';
import { FlatList, SafeAreaView } from 'react-native';

import TapsignerIcon from 'src/assets/images/svgs/tapsignerGragient.svg';

import Signer from './Signer';
import Header from 'src/components/Header';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import Note from 'src/components/Note/Note';

const SignTransactionScreen = () => {

  const signers = [
    {
      id: 1,
      name: 'TapSigner',
      date: '12 January 2022',
      Icon: TapsignerIcon
    },
    {
      id: 2,
      name: 'ColdCard',
      date: '12 January 2022',
      Icon: TapsignerIcon
    },
    {
      id: 3,
      name: 'Trezor',
      date: '12 January 2022',
      Icon: TapsignerIcon
    },
    {
      id: 4,
      name: 'Add 4th Signer',
      date: '12 January 2022',
      Icon: TapsignerIcon
    },
    {
      id: 5,
      name: 'Add 5th Signer',
      date: '12 January 2022',
      Icon: TapsignerIcon
    }
  ]
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: 'light.ReceiveBackground',
        paddingHorizontal: 100
      }}
    >
      <StatusBar backgroundColor={'light.ReceiveBackground'} barStyle="dark-content" />
      <Box
        paddingX={5}
        marginTop={hp(5)}
      >
        <Box
          marginY={5}
        >
          <Header
            title='Sign Transaction'
            subtitle='Lorem ipsum dolor sit amet,'
          />
        </Box>
        <FlatList
          data={signers}
          keyExtractor={({ item }) => item?.id}
          renderItem={({ item }) => <Signer title={item.name} Icon={item.Icon} description={item.date} />}
        />

      </Box>
      <Box alignItems={'flex-start'} marginY={5}>
        <Note
          title={'Note'}
          subtitle={'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et'}
          subtitleColor={'GreyText'}
          width={wp(300)}
        />
      </Box>
    </SafeAreaView>
  );
};
export default SignTransactionScreen;