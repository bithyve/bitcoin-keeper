import React, { useCallback, useRef } from 'react';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  TouchableOpacity,
} from '@gorhom/bottom-sheet';
import { Avatar, Heading, HStack, Text, VStack } from 'native-base';
import { StyleSheet } from 'react-native';
import RightArrow from 'src/assets/images/rightarrow.svg';
import { CommonActions, useNavigation } from '@react-navigation/native';

const SettingItem = ({ name, first, last, callback = null }) => {
  return (
    <TouchableOpacity onPress={callback}>
      <HStack
        paddingX={'4'}
        alignItems={'center'}
        justifyContent={'space-between'}
        h={'10'}
        backgroundColor={'#FFFFFF'}
        borderTopRadius={first ? 10 : 0}
        borderBottomRadius={last ? 10 : 0}
        marginBottom={last ? '5' : '0'}
        borderBottomWidth={1}
        borderBottomColor={'#F0F0F0'}
      >
        <Text>{name}</Text>
        <RightArrow />
      </HStack>
    </TouchableOpacity>
  );
};
const SettingSheet = ({ bottomSheetRef }) => {
  const snapPoints = ['90%'];
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);
  const backdropComponent = useCallback(
    (props) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={1} opacity={1} />
    ),
    []
  );
  const navigation = useNavigation();
  const goToInheritance = () => {
    bottomSheetRef.current?.close();
    navigation.dispatch(CommonActions.navigate({ name: 'Inheritance' }));
  };
  return (
    <BottomSheet
      index={-1}
      ref={bottomSheetRef}
      enablePanDownToClose
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={backdropComponent}
      backgroundStyle={{ backgroundColor: '#F0F0F0', borderRadius: 15 }}
      handleComponent={null}
    >
      <BottomSheetView style={styles.contentContainer}>
        <HStack paddingX={'4'} justifyContent={'space-between'}>
          <Heading fontWeight={'600'} fontSize={'lg'} onPress={() => bottomSheetRef.current.close()}>
            Done
          </Heading>
          <Heading fontWeight={'600'} fontSize={'lg'}>
            Settings
          </Heading>
          <Heading fontWeight={'600'} fontSize={'lg'}>{`      `}</Heading>
        </HStack>
        <VStack paddingX={'2'} backgroundColor="red">
          <HStack
            paddingX={'4'}
            alignItems={'center'}
            justifyContent={'space-between'}
            height={'20'}
            backgroundColor={'#FFFFFF'}
            borderTopRadius={10}
            borderBottomRadius={10}
            marginBottom={'5'}
            borderBottomWidth={1}
            borderBottomColor={'#F0F0F0'}
          >
            <HStack alignItems={'center'}>
              <Avatar bg="#FFFBF7" mr="1">
                AG
              </Avatar>
              <VStack paddingX={'2'}>
                <Heading fontSize={'lg'}>Alex Geller</Heading>
                <Text fontSize={'xs'}>+91 0000 0000</Text>
              </VStack>
            </HStack>
            <RightArrow />
          </HStack>
          <SettingItem name={'Account'} first={true} last={false} />
          <SettingItem name={'Linked Devices'} first={false} last={false} />
          <SettingItem name={'Payments'} first={false} last={false} />
          <SettingItem name={'Inheritance'} first={false} last={true} callback={goToInheritance} />
          <SettingItem name={'Appearance'} first={true} last={false} />
          <SettingItem name={'Chats'} first={false} last={false} />
          <SettingItem name={'Notifications'} first={false} last={false} />
          <SettingItem name={'Privacy'} first={false} last={false} />
          <SettingItem name={'Device Usage'} first={false} last={true} />
          <SettingItem name={'Start sending ad receving bitcoin'} first={true} last={true} />
          <SettingItem name={'Invite your friends'} first={true} last={false} />
          <SettingItem name={'Become a Signal Sustainer'} first={false} last={true} />
        </VStack>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'grey',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
    paddingHorizontal: '3%',
    marginBottom: '10%',
  },
});

export default SettingSheet;
