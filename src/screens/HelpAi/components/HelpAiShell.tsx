import React from 'react';
import { Box, useColorMode } from '@gluestack-ui/themed-native-base';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';

type HelpAiShellProps = {
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
};

const HelpAiShell = ({ title, children, onBack }: HelpAiShellProps) => {
  const { colorMode } = useColorMode();

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`} paddingHorizontal={0}>
      <Box px={6}>
        <WalletHeader title={title} onPressHandler={onBack} />
      </Box>
      <Box flex={1}>{children}</Box>
    </ScreenWrapper>
  );
};

export default HelpAiShell;
