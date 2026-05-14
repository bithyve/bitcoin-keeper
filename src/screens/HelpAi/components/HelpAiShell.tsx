import React from 'react';
import { useColorMode } from '@gluestack-ui/themed-native-base';
import { View } from 'react-native';
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
      <View style={{ paddingHorizontal: 24 }}>
        <WalletHeader title={title} onPressHandler={onBack} />
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </ScreenWrapper>
  );
};

export default HelpAiShell;
