import { useColorMode } from '@gluestack-ui/themed-native-base';
import { View } from 'react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import { HelpAiThread } from 'src/store/reducers/helpAi';
import ChatBubbleIcon from 'src/assets/images/chatBubble.svg';
import Colors from 'src/theme/Colors';

type HelpAiChatHistoryListProps = {
  threads: HelpAiThread[];
  onOpenChat: (conversationId: string) => void;
  onStartNewChat: () => void;
};

const formatRelativeTime = (isoDate: string) => {
  const time = new Date(isoDate).getTime();
  if (Number.isNaN(time)) return '';

  const diffMs = Date.now() - time;
  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;

  if (diffMs < minuteMs) return 'Just now';
  if (diffMs < hourMs) return `${Math.floor(diffMs / minuteMs)}m ago`;
  if (diffMs < dayMs) return `${Math.floor(diffMs / hourMs)}h ago`;
  if (diffMs < dayMs * 7) return `${Math.floor(diffMs / dayMs)}d ago`;

  return new Date(isoDate).toLocaleDateString();
};

const HelpAiChatHistoryList = ({
  threads,
  onOpenChat,
  onStartNewChat,
}: HelpAiChatHistoryListProps) => {
  const { colorMode } = useColorMode();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.listContent}>
        {threads.map((thread) => (
          <Pressable
            key={thread.conversationId}
            onPress={() => onOpenChat(thread.conversationId)}
            style={({ pressed }) => [styles.itemPressable, { opacity: pressed ? 0.75 : 1 }]}
          >
            <View
              style={[
                styles.itemCard,
                {
                  borderColor: colorMode === 'dark' ? '#2e2e2e' : '#ece9e3',
                },
              ]}
            >
              <View style={styles.iconWrap}>
                <ChatBubbleIcon width={wp(18)} height={wp(18)} />
              </View>
              <View style={styles.cardBody}>
                {/* Icon + header row */}
                <View style={styles.itemHeader}>
                  <View style={styles.iconAndTitle}>
                    <Text
                      medium
                      fontSize={17}
                      color={colorMode === 'dark' ? '#e7e7e7' : '#272421'}
                      numberOfLines={1}
                      style={styles.threadTitle}
                    >
                      {thread.title || 'New chat'}
                    </Text>
                  </View>
                  <Text fontSize={11} color={colorMode === 'dark' ? '#696969' : '#677e7c'}>
                    {formatRelativeTime(thread.updatedAt)}
                  </Text>
                </View>

                {/* Preview */}
                <Text
                  fontSize={12}
                  color={colorMode === 'dark' ? '#7a7a7a' : '#9a9590'}
                  numberOfLines={1}
                  style={styles.previewText}
                >
                  {thread.lastMessage || 'No messages yet'}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.spacer,
                {
                  backgroundColor: colorMode === 'dark' ? '#2e2e2e' : '#ece9e3',
                },
              ]}
            />
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.ctaCtr}>
        <Buttons primaryText={'Start New Chat'} primaryCallback={onStartNewChat} fullWidth />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(12),
  },
  title: {},
  listContent: {
    paddingBottom: hp(20),
  },
  itemPressable: {
    width: '100%',
  },
  itemCard: {
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  accentBar: {
    width: 4,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  cardBody: {
    flex: 1,
    gap: hp(0),
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: wp(8),
  },
  iconAndTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
    flex: 1,
  },
  iconWrap: {
    width: wp(32),
    height: wp(32),
    marginRight: wp(8),
    borderRadius: wp(100),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryGreen,
  },
  threadTitle: {
    flex: 1,
    maxWidth: '70%',
  },
  previewText: {
    lineHeight: hp(18),
  },
  ctaCtr: {
    paddingBottom: hp(12),
    paddingTop: hp(6),
  },
  spacer: {
    height: hp(2),
    width: '100%',
    marginVertical: hp(5),
  },
});

export default HelpAiChatHistoryList;
