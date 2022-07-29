import { Box } from 'native-base';
import COLDCARDICON from 'src/assets/images/coldcard_icon.svg';
import JADEICON from 'src/assets/images/jade_icon.svg';
import KEYSTONEICON from 'src/assets/images/keystone_icon.svg';
import LEDGERICON from 'src/assets/images/ledger_icon.svg';
import PASSPORTICON from 'src/assets/images/passport_icon.svg';
import React from 'react';
import { SignerType } from 'src/core/wallets/enums';
import TAPSIGNERICON from 'src/assets/images/tapsigner_icon.svg';
import TREZORICON from 'src/assets/images/trezor_icon.svg';

const Wrapper = ({ children }) => {
  return (
    <Box
      width={30}
      height={30}
      borderRadius={30}
      bg={'#FAC48B'}
      justifyContent={'center'}
      alignItems={'center'}
      marginX={1}
    >
      {children}
    </Box>
  );
};
export const SignerMap = ({ type }: { type: SignerType }) => {
  switch (type) {
    case SignerType.COLDCARD:
      return (
        <Wrapper>
          <COLDCARDICON />
        </Wrapper>
      );
    case SignerType.JADE:
      return (
        <Wrapper>
          <JADEICON />
        </Wrapper>
      );
    case SignerType.KEYSTONE:
      return (
        <Wrapper>
          <KEYSTONEICON />
        </Wrapper>
      );
    case SignerType.LEDGER:
      return (
        <Wrapper>
          <LEDGERICON />
        </Wrapper>
      );
    case SignerType.TAPSIGNER:
      return (
        <Wrapper>
          <TAPSIGNERICON />
        </Wrapper>
      );
    case SignerType.TREZOR:
      return (
        <Wrapper>
          <TREZORICON />
        </Wrapper>
      );
    case SignerType.PASSPORT:
      return (
        <Wrapper>
          <PASSPORTICON />
        </Wrapper>
      );
    case SignerType.POLICY_SERVER:
      return <Wrapper>{null}</Wrapper>;
    case SignerType.MOBILE_KEY:
      return <Wrapper>{null}</Wrapper>;
    case SignerType.KEEPER:
      return <Wrapper>{null}</Wrapper>;
    default:
      return null;
  }
};
