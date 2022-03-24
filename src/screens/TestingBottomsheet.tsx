import { StyleSheet, View } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import HexaBottomSheet from 'src/components/BottomSheet';
import { Heading } from 'native-base';

const TestingBottomsheet = () => {
  return (
    <SafeAreaView style={styles.container}>
      <HexaBottomSheet
        title="Assign Beneficiary"
        subTitle={'Lorem Ipsum Dolor Amet...'}
        snapPoints={['25%', '50%']}
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
