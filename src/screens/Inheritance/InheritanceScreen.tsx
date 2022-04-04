import React, { Fragment, useRef, useState } from 'react';
import Header from 'src/components/Header';
import { Box, Heading, HStack, Text, useToast, VStack } from 'native-base';
import InheritanceModes from './InheritanceModes';
import HexaBottomSheet from 'src/components/BottomSheet';
import BottomSheet from '@gorhom/bottom-sheet';
import BenificiaryList from './BenificiaryList';
import DeclarationForm from './DeclarationForm';
import TransferState from './TransferState';
import useBottomSheetUtils from 'src/hooks/useBottomSheetUtils';
import { Keyboard } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import SuccessIcon from 'src/assets/images/checkboxfilled.svg';

const InheritanceScreen = () => {
  const [transferState, setTransfer] = useState('Initiate Transfer');
  const [transferDescription, setDescription] = useState(
    'Initiate transfer to Gunther Greene as your benifeciary and transfer access to your funds in Keeper'
  );
  const [primaryText, setPrimary] = useState('Initiate');
  const [secondaryText, setSecondary] = useState('Cancel');
  const navigation = useNavigation();
  const route = useRoute<any>();
  const toast = useToast();
  const assignRef = useRef<BottomSheet>(null);
  const { openSheet: openAssignSheet, closeSheet: closeAssignSheet } =
    useBottomSheetUtils(assignRef);

  const declarationRef = useRef<BottomSheet>(null);
  const { openSheet: _openDeclarationSheet, closeSheet: _closeDeclarationSheet } =
    useBottomSheetUtils(declarationRef);
  const openDeclarationSheet = () => {
    closeAssignSheet();
    _openDeclarationSheet();
    Keyboard.dismiss();
  };
  const closeDeclarationSheet = () => {
    _closeDeclarationSheet();
    toast.show({
      placement: 'top',
      duration: 700,
      render: () => (
        <HStack alignItems={'center'}>
          <SuccessIcon />
          <Box
            bg="#F3EABF"
            px="2"
            borderRadius={'41'}
            _text={{ color: '#073E39', fontSize: 9, fontWeight: '300', letterSpacing: 0.6 }}
          >
            Inheritance Ready
          </Box>
        </HStack>
      ),
    });
    route.params.setInheritance(true);
  };

  const transferRef = useRef<BottomSheet>(null);
  const { openSheet: _openTransferSheet, closeSheet: _closeTransferSheet } =
    useBottomSheetUtils(transferRef);
  const openTransferSheet = () => {
    closeDeclarationSheet();
    _openTransferSheet();
  };

  const initiateTransfer = () => {
    if (transferState == 'Transfer Successful!') {
      _closeTransferSheet();
      navigation.goBack();
    }
    setTransfer('Transfer Successful!');
    setDescription('Gunther Greene now has access to your funds in Keeper!');
    setPrimary('Home');
    setSecondary('');
  };
  return (
    <Fragment>
      <Header />
      <VStack marginX={10}>
        <VStack>
          <Heading fontFamily={'body'} fontWeight={'200'} size={'md'}>
            Setup Inheritance
          </Heading>
          <Text fontFamily={'body'} fontWeight={'100'} size={'sm'} h={'auto'}>
            Hand down your bitcoin
          </Text>
        </VStack>
        <Text
          fontFamily={'body'}
          fontWeight={'100'}
          size={'xs'}
          noOfLines={2}
          marginY={12}
          h={'auto'}
        >
          Make sure your legacy would be alive and glorious. Choose your beneficiary carefully.
        </Text>
        <InheritanceModes
          openAssignSheet={openAssignSheet}
          openDeclarationSheet={openDeclarationSheet}
          openTransferSheet={openTransferSheet}
        />
      </VStack>
      <HexaBottomSheet
        title={'Assign Benificiary'}
        subTitle={'Select who receives your bitcoin inheritance'}
        snapPoints={['60%']}
        bottomSheetRef={assignRef}
        primaryText={'Add'}
        secondaryText={'Add from contacts'}
        primaryCallback={openDeclarationSheet}
      >
        <BenificiaryList />
      </HexaBottomSheet>
      <HexaBottomSheet
        title={'Sign Declaration'}
        subTitle={'Read the text below before signing'}
        snapPoints={['90%']}
        bottomSheetRef={declarationRef}
        primaryText={'Sign'}
        secondaryText={'Cancel'}
        secondaryCallback={closeDeclarationSheet}
        primaryCallback={openTransferSheet}
      >
        <DeclarationForm />
      </HexaBottomSheet>
      <HexaBottomSheet
        title={transferState}
        subTitle={'Are you sure you want to initiate transfer to'}
        snapPoints={['60%']}
        bottomSheetRef={transferRef}
        primaryText={primaryText}
        secondaryText={secondaryText}
        secondaryCallback={_closeTransferSheet}
        primaryCallback={initiateTransfer}
      >
        <TransferState setTransfer={setTransfer} transferDescription={transferDescription} />
      </HexaBottomSheet>
    </Fragment>
  );
};

export default InheritanceScreen;
