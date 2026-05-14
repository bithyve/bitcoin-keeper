import { useColorMode } from '@gluestack-ui/themed-native-base';
import { View } from 'react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import { HelpAiThread } from 'src/store/reducers/helpAi';

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
      <Text color={colorMode === 'dark' ? '#a5a5a5' : '#878787'} fontSize={13} style={styles.title}>
        Recent chats
      </Text>

      <ScrollView contentContainerStyle={styles.listContent}>
        {threads.map((thread) => (
          <Pressable
            key={thread.conversationId}
            onPress={() => onOpenChat(thread.conversationId)}
            style={styles.itemPressable}
          >
            <View
              style={[
                styles.itemCard,
                {
                  borderWidth: 1,
                  borderColor: colorMode === 'dark' ? '#3a3a3a' : '#d8d8d8',
                  backgroundColor: colorMode === 'dark' ? '#1f1f1f' : '#ffffff',
                },
              ]}
            >
              <View style={styles.itemHeader}>
                <Text
                  medium
                  color={colorMode === 'dark' ? '#e7e7e7' : '#272421'}
                  numberOfLines={1}
                  style={{ maxWidth: '70%' }}
                >
                  {thread.title || 'New chat'}
                </Text>
                <Text fontSize={11} color={colorMode === 'dark' ? '#a5a5a5' : '#878787'}>
                  {formatRelativeTime(thread.updatedAt)}
                </Text>
              </View>

              <Text
                fontSize={12}
                color={colorMode === 'dark' ? '#a5a5a5' : '#878787'}
                numberOfLines={2}
              >
                {thread.lastMessage || 'No messages yet'}
              </Text>
            </View>
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
    paddingHorizontal: wp(18),
    paddingTop: hp(14),
  },
  title: {
    marginBottom: hp(10),
  },
  listContent: {
    paddingBottom: hp(20),
    gap: hp(10),
  },
  itemPressable: {
    width: '100%',
  },
  itemCard: {
    borderRadius: 12,
    paddingVertical: hp(12),
    paddingHorizontal: wp(12),
    gap: hp(6),
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: wp(10),
  },
  ctaCtr: {
    paddingBottom: hp(12),
    paddingTop: hp(6),
  },
});

export default HelpAiChatHistoryList;
