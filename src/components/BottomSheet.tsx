import React, { RefCallback, RefObject, useCallback, useMemo, useState } from 'react';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Heading, HStack, Text, VStack } from 'native-base';
import { StyleSheet } from 'react-native';
import Buttons from './Buttons';
import Fonts from 'src/common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import { customTheme } from 'src/common/themes';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';

const Colors = customTheme.colors.light;

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
  const backdropComponent = useCallback(
    (props) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={1} opacity={1} />
    ),
    []
  );
  const [mounted, setMounted] = useState(false);
  const onAnimate = useCallback((fromIndex: number) => {
    if (fromIndex === -1) {
      setMounted(true);
    }
  }, []);
  const onClose = useCallback(() => {
    setMounted(false);
  }, []);
  return (
    <BottomSheet
      index={-1}
      ref={bottomSheetRef}
      enablePanDownToClose
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={backdropComponent}
      backgroundStyle={{ backgroundColor: '#FFFBF7', borderRadius: 15 }}
      onAnimate={onAnimate}
      onClose={onClose}
    >
      <BottomSheetView style={styles.contentContainer}>
        <VStack paddingX={'2'} backgroundColor="red">
          <Heading style={styles.heading} fontSize={'lg'}>
            {title}
          </Heading>
          <Text
            style={{
              fontWeight: '100',
              letterSpacing: 0.6,
              fontSize: RFValue(12),
              marginTop: hp(0.7),
            }}
            fontWeight={'200'}
            color="light.textBlack"
            fontFamily={'body'}
          >
            {subTitle}
          </Text>
        </VStack>
        {mounted && children}
        <HStack alignSelf={'flex-end'} marginBottom="3">
          <Buttons
            secondaryText={secondaryText}
            secondaryCallback={secondaryCallback}
            primaryText={primaryText}
            primaryCallback={primaryCallback}
          />
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
  heading: {
    fontFamily: Fonts.RobotoCondensedRegular,
    fontSize: RFValue(18),
    letterSpacing: 0.9,
    color: Colors.textBlack,
  },
});

export default HexaBottomSheet;
