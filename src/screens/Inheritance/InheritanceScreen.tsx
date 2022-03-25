import React, { Fragment, useRef } from 'react';
import Header from 'src/components/Header';
import { Heading, Text, VStack } from 'native-base';
import InheritanceModes from './InheritanceModes';
import HexaBottomSheet from 'src/components/BottomSheet';
import BottomSheet from '@gorhom/bottom-sheet';

const InheritanceScreen = () => {
  const assignRef = useRef<BottomSheet>(null);
  return (
    <Fragment>
      <Header />
      <VStack marginX={10}>
        <VStack>
          <Heading size={'md'}>Setup Inheritance</Heading>
          <Text>Lorem ipsum dolor sit, amet</Text>
        </VStack>
        <Text noOfLines={2} marginY={12}>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Totam assumenda, quibusdam
          consectetur sapiente incidunt saepe qui, ullam facilis unde est fugiat cupiditate dolorem
          sint eum distinctio et similique minus. Rerum.
        </Text>
        <InheritanceModes assignRef={assignRef} />
      </VStack>
      <HexaBottomSheet
        title={'Assign Benificiary'}
        subTitle={'Lorem ipsum dolor sit, amet'}
        snapPoints={['90%']}
        bottomSheetRef={assignRef}
        primaryText={'Proceed'}
        secondaryText={'Setup Later'}
      >
        <Text noOfLines={2} marginY={12}>
          Yet to implement
        </Text>
      </HexaBottomSheet>
    </Fragment>
  );
};

export default InheritanceScreen;
