import { useColorMode } from 'native-base';
import React from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';

const FilterAdvisor = () => {
  const { colorMode } = useColorMode();

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader title="Filter Advisors" />
    </ScreenWrapper>
  );
};

export default FilterAdvisor;
