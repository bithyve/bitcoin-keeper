import React, { Fragment, useRef, useState } from 'react';

import { Keyboard } from 'react-native';
import { Box, Heading, HStack, Text, useToast, VStack } from 'native-base';
import BottomSheet from '@gorhom/bottom-sheet';
import { useNavigation, useRoute } from '@react-navigation/native';

import HeaderTitle from 'src/components/HeaderTitle';
import InheritanceModes from './InheritanceModes';
import HexaBottomSheet from 'src/components/BottomSheet';
import BenificiaryList from './BenificiaryList';
import DeclarationForm from './DeclarationForm';
import TransferState from './TransferState';
import useBottomSheetUtils from 'src/hooks/useBottomSheetUtils';
import SuccessIcon from 'src/assets/images/checkboxfilled.svg';
import StatusBarComponent from 'src/components/StatusBarComponent';

const InheritanceScreen = () => {

  const navigation = useNavigation();
  const route = useRoute<any>();
  const toast = useToast();
  const assignRef = useRef<BottomSheet>(null);
  const declarationRef = useRef<BottomSheet>(null);
  const transferRef = useRef<BottomSheet>(null);
  const { openSheet: openAssignSheet, closeSheet: closeAssignSheet } =
    useBottomSheetUtils(assignRef);
  const { openSheet: _openDeclarationSheet, closeSheet: _closeDeclarationSheet } =
    useBottomSheetUtils(declarationRef);
  const { openSheet: _openTransferSheet, closeSheet: _closeTransferSheet } =
    useBottomSheetUtils(transferRef);

  const [transferState, setTransfer] = useState('Initiate Transfer');
  const [transferDescription, setDescription] = useState(
    'Initiate transfer to Gunther Greene as your benifeciary and transfer access to your funds in Keeper'
  );
  const [primaryText, setPrimary] = useState('Initiate');
  const [secondaryText, setSecondary] = useState('Cancel');


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
      <StatusBarComponent padding={80} extraPadding={30} />
      <VStack marginX={8}>
        <HeaderTitle
          title="Setup Inheritance"
          subtitle="Hand down your bitcoin"
          onPressHandler={() => navigation.goBack()}
        />
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
