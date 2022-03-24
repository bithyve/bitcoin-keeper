import React, { useCallback, useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Heading, HStack, Text, VStack } from 'native-base';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

const HexaBottomSheet: React.FunctionComponent<{
  children: React.FunctionComponent | Element;
  title: string;
  subTitle: string;
  snapPoints: string[];
}> = ({ children, title, subTitle, snapPoints: snaps }) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => snaps, []);
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  return (
    <BottomSheet
      index={1}
      ref={bottomSheetRef}
      enablePanDownToClose
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
    >
      <BottomSheetView style={styles.contentContainer}>
        <VStack>
          <Heading fontSize={'lg'}>{title}</Heading>
          <Text fontSize={'xs'}>{subTitle}</Text>
        </VStack>
        {children}
        <HStack alignSelf={'flex-end'}>
          <SecondaryButton text={'Later'} callback={null} />
          <PrimaryButton text={'Proceed'} callback={null} />
        </HStack>
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
    justifyContent: 'space-between',
    padding: '8%',
    marginBottom: '10%',
  },
});

export default HexaBottomSheet;
