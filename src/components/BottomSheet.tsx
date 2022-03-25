import React, { RefCallback, RefObject, useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Heading, HStack, Text, VStack } from 'native-base';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';
// import Close from 'src/assets/images/svgs/close.svg';
// import Close from 'src/assets/images/svgs/close.svg';
type Ref<T> = RefCallback<T> | RefObject<T> | null;
const HexaBottomSheet: React.FunctionComponent<{
  children: React.FunctionComponent | Element;
  title: string;
  subTitle: string;
  snapPoints: string[];
  bottomSheetRef: Ref<BottomSheet>;
  primaryText?: string;
  secondaryText?: string;
  primaryCallback?: () => void;
  secondaryCallback?: () => void;
}> = ({
  children,
  title,
  subTitle,
  snapPoints: snaps,
  bottomSheetRef,
  primaryText,
  secondaryText,
  primaryCallback,
  secondaryCallback,
}) => {
  const snapPoints = useMemo(() => snaps, []);
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  return (
    <BottomSheet
      index={-1}
      ref={bottomSheetRef}
      enablePanDownToClose
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
    >
      {/* <HStack justifyContent="flex-end" paddingX={'10'}>
        <Close />
      </HStack> */}
      <BottomSheetView style={styles.contentContainer}>
        <VStack>
          <Heading fontSize={'lg'}>{title}</Heading>
          <Text fontSize={'xs'}>{subTitle}</Text>
        </VStack>
        {children}
        <HStack alignSelf={'flex-end'}>
          <SecondaryButton text={secondaryText} callback={secondaryCallback} />
          <PrimaryButton text={primaryText} callback={primaryCallback} />
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
