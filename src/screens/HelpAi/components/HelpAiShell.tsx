import React from 'react';
import { useColorMode } from '@gluestack-ui/themed-native-base';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';

type HelpAiShellProps = {
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
  onInfoPress?: () => void;
};

const HelpAiShell = ({ title, children, onBack, onInfoPress }: HelpAiShellProps) => {
  const { colorMode } = useColorMode();

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`} paddingHorizontal={0}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled={Platform.OS === 'ios'}
        keyboardVerticalOffset={Platform.select({ ios: 8, android: 0 })}
        style={{ flex: 1 }}
      >
        <View style={{ paddingHorizontal: 24 }}>
          <WalletHeader
            title={title}
            onPressHandler={onBack}
            learnMore={!!onInfoPress}
            learnMorePressed={onInfoPress}
          />
        </View>
        <View style={{ flex: 1 }}>{children}</View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default HelpAiShell;
