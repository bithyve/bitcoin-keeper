import React, { useState } from 'react';
import { Box, StatusBar, Text, Pressable } from 'native-base';
import { FlatList, SafeAreaView } from 'react-native';
// Icons, Ui stuff
import TapsignerIcon from 'src/assets/images/svgs/tapsignerGragient.svg';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
// Components
import Signer from './Signer';
import Header from 'src/components/Header';
import Note from 'src/components/Note/Note';
import KeeperModal from 'src/components/KeeperModal';

const SignTransactionScreen = () => {

  const [modalVisiblity, setModalVisiblity] = useState(true);
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

  const PSTBCard = ({ message, buttonText, buttonCallBack }) => {
    return (
      <Box
        backgroundColor={'light.lightYellow'}
        height={hp(100)}
        width={wp(295)}
        borderRadius={10}
        justifyContent={'center'}
        marginY={3}
      >
        <Box style={{
          paddingHorizontal: wp(20),
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}>
          <Text
            color={'light.modalText'}
            fontSize={13}
            letterSpacing={0.65}
            fontWeight={200}
            noOfLines={2}
            width={wp(175)}
          >
            {message}
          </Text>
          <Pressable
            bg={'light.yellow1'}
            justifyContent={'center'}
            borderRadius={5}
            width={wp(60)}
            height={hp(25)}
            alignItems={'center'}
            onPress={buttonCallBack}
          >
            <Text
              fontSize={12}
              letterSpacing={0.65}
              fontWeight={200}
            >
              {buttonText}
            </Text>
          </Pressable>
        </Box>
      </Box>
    );
  }
  const ModalContent = () => {
    return (
      <Box>
        <PSTBCard
          message={'Send Assigned PSBT Lorem ipsum dolor sit amet, consectetur adipiscing elit'}
          buttonText={'Send'}
          buttonCallBack={() => console.log('Send')}
        />
        <PSTBCard
          message={'Recieve Assigned PSBT Lorem ipsum dolor sit amet, consectetur adipiscing elit'}
          buttonText={'Recieve'}
          buttonCallBack={() => console.log('Recieve')}
        />
        <Box
          marginTop={2}
          width={wp(220)}
        >
          <Text
            color={'light.modalText'}
            fontSize={13}
            letterSpacing={0.65}
            noOfLines={2}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          </Text>
        </Box>
      </Box>
    )
  }

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

      <KeeperModal
        visible={modalVisiblity}
        close={() => { setModalVisiblity(false) }}
        title={'Upload Multi-sig data'}
        subTitle={'Keep your ColdCard ready before proceeding'}
        modalBackground={['#F7F2EC', '#F7F2EC']}
        Content={ModalContent}
      />
    </SafeAreaView>
  );
};
export default SignTransactionScreen;