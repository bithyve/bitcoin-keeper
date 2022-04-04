import { StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import HexaBottomSheet from 'src/components/BottomSheet';
import { Heading } from 'native-base';
import BottomSheet from '@gorhom/bottom-sheet';

const TestingBottomsheet = () => {
  const bottomSheetRef = React.useRef<BottomSheet>(null);
  useEffect(() => {
    bottomSheetRef.current.expand();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <HexaBottomSheet
        bottomSheetRef={bottomSheetRef}
        title="Assign Beneficiary"
        snapPoints={['25%', '50%']}
        primaryText={'Primary'}
        secondaryText={'Secondary'}
        primaryCallback={null}
        secondaryCallback={null}
      >
        <Heading>Hola!</Heading>
      </HexaBottomSheet>
    </SafeAreaView>
  );
};

export default TestingBottomsheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 200,
  },
});
