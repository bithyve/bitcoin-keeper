import React, { Fragment } from 'react';
import Header from 'src/components/Header';
import { Heading, Text, VStack } from 'native-base';
import InheritanceModes from './InheritanceModes';

const InheritanceScreen = () => {
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
        <InheritanceModes />
      </VStack>
    </Fragment>
  );
};

export default InheritanceScreen;
