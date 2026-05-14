import React from 'react';
import { Box, useColorMode } from '@gluestack-ui/themed-native-base';
import { StyleSheet } from 'react-native';
import Buttons from 'src/components/Buttons';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import ConciergeNeedHelpIcon from 'src/assets/images/conciergeNeedHelp.svg';

type HelpAiEntryCardProps = {
  onStartChat: () => void;
  onPromptPress: (value: string) => void;
};

const suggestions = [
  'My signer is not working',
  'I need help with vault setup',
  'I want to report a bug',
  'I have a feature request',
];

const HelpAiEntryCard = ({ onStartChat, onPromptPress }: HelpAiEntryCardProps) => {
  const { colorMode } = useColorMode();

  return (
    <Box style={styles.container}>
      <CircleIconWrapper
        width={wp(60)}
        icon={<ConciergeNeedHelpIcon />}
        backgroundColor={`${colorMode}.separator`}
      />

      <Text style={styles.title} fontSize={22} medium color={`${colorMode}.primaryText`}>
        Keeper Help AI
      </Text>

      <Text style={styles.subtitle} fontSize={13} color={`${colorMode}.secondaryText`}>
        Ask questions, troubleshoot issues, and create bug or feature drafts for developer review.
      </Text>

      <Box style={styles.buttonCtr}>
        <Buttons primaryText={'Open Help Chat'} primaryCallback={onStartChat} fullWidth />
      </Box>

      <Box style={styles.suggestionsCtr}>
        {suggestions.map((suggestion) => (
          <Box
            key={suggestion}
            style={styles.suggestionPill}
            borderColor={`${colorMode}.separator`}
            backgroundColor={`${colorMode}.textInputBackground`}
          >
            <Text
              fontSize={12}
              color={`${colorMode}.secondaryText`}
              onPress={() => onPromptPress(suggestion)}
            >
              {suggestion}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
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
});

export default HelpAiEntryCard;
