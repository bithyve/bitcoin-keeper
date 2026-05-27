import React, { useContext } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Fonts from 'src/constants/Fonts';
import Colors from 'src/theme/Colors';
import LockIcon from 'src/assets/images/lockLightGreen.svg';
import PencilWhite from 'src/assets/images/edit_white.svg';
import ChatBubble from 'src/assets/images/chatBubble.svg';
import Fab from 'src/components/Fab';

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

const LOCK_ICON_SIZE = hp(15);

const HelpAiEntryCard = ({ onStartChat, onPromptPress }: HelpAiEntryCardProps) => {
  const { translations } = useContext(LocalizationContext);
  const { askAi } = translations;

  return (
    <View style={styles.container}>
      <View style={styles.chatBubbleBox}>
        <ChatBubble width={wp(64)} height={hp(64)} />
      </View>
      <Text style={styles.title}>{askAi.noConversationsYet}</Text>
      <Text style={styles.subtitle}>{askAi.subtitle}</Text>

      <View style={styles.hrCtr}>
        <View style={styles.hr} />
        <Text style={styles.tryText}>Try asking about</Text>
        <View style={styles.hr} />
      </View>
      <View style={styles.suggestionCtr}>
        <View style={styles.suggestionsCtr}>
          {suggestions.map((suggestion, idx) => (
            <View
              style={[
                styles.suggestionPill,
                idx != suggestions.length - 1 && { borderBottomWidth: 2 },
              ]}
              key={suggestion}
            >
              <Text style={styles.suggestionText} onPress={() => onPromptPress(suggestion)}>
                {suggestion}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.warningCtr}>
          <View style={styles.warningIconBox}>
            <LockIcon height={LOCK_ICON_SIZE} width={LOCK_ICON_SIZE} />
          </View>
          <Text style={styles.warningText}>{askAi.neverShareSeedWarning}</Text>
        </View>
      </View>
      <Fab
        icon={<PencilWhite height={hp(22)} width={wp(22)} />}
        onPress={onStartChat}
        containerStyle={{ right: wp(-10) }}
      />
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
    fontSize: 24,
    fontFamily: Fonts.LoraSemiBold,
    color: '#213b39',
  },
  subtitle: {
    marginTop: hp(8),
    fontSize: 14,
    fontFamily: Fonts.InterRegular,
    textAlign: 'center',
    color: Colors.DarkSlateGray,
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
    paddingHorizontal: wp(14),
    paddingVertical: hp(4),
    width: '90%',
    paddingBottom: 15,
    borderStyle: 'dashed',
    alignItems: 'center',
    borderBottomColor: Colors.greyBorder,
  },
  suggestionText: {
    fontSize: 15,
    fontFamily: Fonts.InterRegular,
    color: Colors.DarkSlateGray,
  },
  warningText: {
    marginBottom: hp(20),
    textAlign: 'center',
    color: Colors.DarkSlateGray,
    fontFamily: Fonts.InterRegular,
    fontSize: 14,
  },
  suggestionCtr: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
  },
  warningCtr: {
    flexDirection: 'row',

    gap: wp(8),
  },
  warningIconBox: {
    width: LOCK_ICON_SIZE,
    height: LOCK_ICON_SIZE,
    overflow: 'hidden',
  },
  chatBubbleBox: {
    width: wp(64),
    height: hp(64),
    marginVertical: hp(20),
    overflow: 'hidden',
  },
  hrCtr: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    gap: wp(8),
    paddingTop: hp(30),
    paddingBottom: hp(5),
  },
  hr: {
    width: '20%',
    height: 1,
    backgroundColor: Colors.greyBorder,
  },
  tryText: {
    fontSize: 13,
    fontFamily: Fonts.InterRegular,
    color: Colors.DarkSlateGray,
  },
});

export default HelpAiEntryCard;
