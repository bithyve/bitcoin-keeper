import React, { Fragment, useCallback } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import RightArrow from 'src/assets/images/rightarrow.svg';
import Benificiary from 'src/assets/images/Beneficiary.svg';
import Declaration from 'src/assets/images/Declaration.svg';
import Transfer from 'src/assets/images/Transfer.svg';
import { HStack, VStack, Text } from 'native-base';
const { height } = Dimensions.get('screen');

const Wrapper: React.FunctionComponent<{ children: Element[]; Icon }> = ({ children, Icon }) => {
  return (
    <LinearGradient
      colors={['#ECD1B600', '#ECD1B6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.card}
    >
      <HStack
        borderRadius={10}
        alignItems={'center'}
        justifyContent={'space-between'}
        height={height * 0.13}
        paddingLeft={'5%'}
        paddingRight={'10%'}
      >
        <HStack alignItems={'center'}>
          {Icon}
          <VStack marginX={3}>{children}</VStack>
        </HStack>
        <RightArrow />
      </HStack>
    </LinearGradient>
  );
};
const InheritanceModes = ({ assignRef, declarationRef }) => {
  const expandBeneficiaries = useCallback(() => {
    assignRef.current?.expand();
  }, []);
  const expandDecalarations = useCallback(() => {
    declarationRef.current?.expand();
  }, []);
  return (
    <Fragment>
      <TouchableOpacity onPress={expandBeneficiaries}>
        <Wrapper Icon={<Benificiary />}>
          <Text fontFamily={'body'} fontWeight={'200'} fontSize={'13'}>
            Assign Beneficiary
          </Text>
          <Text fontFamily={'body'} fontWeight={'100'} fontSize={'xs'}>
            Lorem ipsum dolor sit, amet
          </Text>
        </Wrapper>
      </TouchableOpacity>
      <TouchableOpacity onPress={expandDecalarations}>
        <Wrapper Icon={<Declaration />}>
          <Text fontFamily={'body'} fontWeight={'200'} fontSize={'13'}>
            Sign Declaration
          </Text>
          <Text fontFamily={'body'} fontWeight={'100'} fontSize={'xs'}>
            Lorem ipsum dolor sit, amet
          </Text>
        </Wrapper>
      </TouchableOpacity>
      <Wrapper Icon={<Transfer />}>
        <Text fontFamily={'body'} fontWeight={'200'} fontSize={'13'}>
          Activate Transfer
        </Text>
        <Text fontFamily={'body'} fontWeight={'100'} fontSize={'xs'}>
          Lorem ipsum dolor sit, amet
        </Text>
      </Wrapper>
    </Fragment>
  );
};

export default InheritanceModes;

const styles = StyleSheet.create({
  card: { marginBottom: '7%', borderRadius: 10 },
});
