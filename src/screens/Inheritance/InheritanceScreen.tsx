import React, { Fragment, useCallback, useRef } from 'react';
import Header from 'src/components/Header';
import { Heading, Text, VStack } from 'native-base';
import InheritanceModes from './InheritanceModes';
import HexaBottomSheet from 'src/components/BottomSheet';
import BottomSheet from '@gorhom/bottom-sheet';
import BenificiaryList from './BenificiaryList';
import DeclarationForm from './DeclarationForm';

const InheritanceScreen = () => {
  const assignRef = useRef<BottomSheet>(null);
  const declarationRef = useRef<BottomSheet>(null);
  const closeDecalarationSheet = useCallback(() => {
    declarationRef.current?.close();
  }, []);
  const closeBeneficiarySheet = useCallback(() => {
    assignRef.current?.close();
  }, []);
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
        <InheritanceModes assignRef={assignRef} declarationRef={declarationRef} />
      </VStack>
      <HexaBottomSheet
        title={'Assign Benificiary'}
        subTitle={'Lorem ipsum dolor sit, amet'}
        snapPoints={['90%']}
        bottomSheetRef={assignRef}
        primaryText={'Proceed'}
        secondaryText={'Setup Later'}
        secondaryCallback={closeBeneficiarySheet}
      >
        <BenificiaryList />
      </HexaBottomSheet>
      <HexaBottomSheet
        title={'Sign Declaration'}
        subTitle={'Lorem ipsum dolor sit, amet'}
        snapPoints={['90%']}
        bottomSheetRef={declarationRef}
        primaryText={'Sign'}
        secondaryText={'Cancel'}
        secondaryCallback={closeDecalarationSheet}
      >
        <DeclarationForm />
      </HexaBottomSheet>
    </Fragment>
  );
};

export default InheritanceScreen;
