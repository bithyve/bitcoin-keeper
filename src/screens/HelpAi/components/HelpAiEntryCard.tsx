import React, { useContext } from 'react';
import { useColorMode } from '@gluestack-ui/themed-native-base';
import { View } from 'react-native';
import { StyleSheet } from 'react-native';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';

type HelpAiEntryCardProps = {
  onStartChat: () => void;
  onPromptPress: (value: string) => void;
};

const suggestions = [
  'Why is my transaction pending?',
  'How do I backup my wallet?',
  "Something isn't working",
  'I have an idea for Keeper',
];

const HelpAiEntryCard = ({ onStartChat, onPromptPress }: HelpAiEntryCardProps) => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { askAi } = translations;

  return (
    <View style={styles.container}>
      <Text
        style={styles.title}
        fontSize={22}
        medium
        color={colorMode === 'dark' ? '#e7e7e7' : '#272421'}
      >
        {askAi.noConversationsYet}
      </Text>

      <Text
        style={styles.subtitle}
        fontSize={13}
        color={colorMode === 'dark' ? '#a5a5a5' : '#878787'}
      >
        {askAi.subtitle}
      </Text>

      <View style={styles.buttonCtr}>
        <Buttons primaryText={askAi.openHelpChat} primaryCallback={onStartChat} fullWidth />
      </View>

      <View style={styles.suggestionCtr}>
        <View style={styles.suggestionsCtr}>
          {suggestions.map((suggestion) => (
            <View
              key={suggestion}
              style={[
                styles.suggestionPill,
                {
                  borderColor: colorMode === 'dark' ? '#3a3a3a' : '#d8d8d8',
                  backgroundColor: colorMode === 'dark' ? '#1f1f1f' : '#ffffff',
                },
              ]}
            >
              <Text
                fontSize={12}
                color={colorMode === 'dark' ? '#a5a5a5' : '#878787'}
                onPress={() => onPromptPress(suggestion)}
              >
                {suggestion}
              </Text>
            </View>
          ))}
        </View>
        <Text style={styles.warningText} color={colorMode === 'dark' ? '#a5a5a5' : '#878787'}>
          {askAi.neverShareSeedWarning}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(24),
  },
  title: {
    marginTop: hp(16),
  },
  subtitle: {
    marginTop: hp(8),
    textAlign: 'center',
  },
  buttonCtr: {
    width: wp(280),
    marginTop: hp(20),
  },
  suggestionsCtr: {
    marginTop: hp(16),
    gap: hp(8),
    alignItems: 'center',
  },
  suggestionPill: {
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: wp(14),
    paddingVertical: hp(8),
  },
  warningText: {
    marginBottom: hp(20),
    textAlign: 'center',
  },
  suggestionCtr: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
  },
});

export default HelpAiEntryCard;
