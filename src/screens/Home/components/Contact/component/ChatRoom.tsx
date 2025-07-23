import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  ScrollView,
  Input,
  Image,
  useColorMode,
  KeyboardAvoidingView,
} from 'native-base';
import moment from 'moment';
import Text from 'src/components/KeeperText';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import PlaceHolderImage from 'src/assets/images/contact-placeholder-image.png';
import PlusIcon from 'src/assets/images/plus-green-icon.svg';
import PlusWhiteIcon from 'src/assets/images/add-plus-white.svg';
import SendWhiteIcon from 'src/assets/images/send-white-icon.svg';
import { useChatPeer } from 'src/hooks/useChatPeer';
import { Message } from 'src/services/p2p/interface';

interface ChatRoomProps {
  userProfileImage: any;
  receiverProfileImage: any;
  communityId: string;
  contactKey?: string;
}

const groupMessagesByDate = (msgs: Message[]) => {
  const groups: { [key: string]: Message[] } = {};
  msgs.forEach((msg) => {
    const date = moment(msg.createdAt);
    const label = moment().isSame(date, 'day')
      ? 'Today'
      : moment().subtract(1, 'day').isSame(date, 'day')
      ? 'Yesterday'
      : date.format('MMMM D, YYYY');
    if (!groups[label]) groups[label] = [];
    groups[label].push(msg);
  });
  return groups;
};

const ChatRoom: React.FC<ChatRoomProps> = ({
  userProfileImage,
  receiverProfileImage,
  communityId,
  contactKey,
}) => {
  const [inputValue, setInputValue] = useState('');
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const scrollRef = useRef<any>(null);

  const { getMessagesByCommunity, sendMessage, getKeys, markCommunityAsRead } = useChatPeer();

  // Get current user's public key to determine message direction
  const userKeys = useMemo(() => getKeys(), []);
  const currentUserPubKey = userKeys?.publicKey;

  // Get messages for this community
  const messages = useMemo(() => {
    try {
      const msgs = getMessagesByCommunity(communityId);
      // Sort messages by creation time
      return msgs.sort((a, b) => a.createdAt - b.createdAt);
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }, [communityId]);

  const groupedMessages = useMemo(() => groupMessagesByDate(messages), [messages]);

  // Handle sending a new message
  const handleSend = async () => {
    if (!inputValue.trim() || !contactKey) return;

    try {
      await sendMessage(contactKey, inputValue.trim());
      setInputValue('');
      // The message will appear automatically when the hook updates
      setTimeout(() => {
        scrollRef?.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Could add error handling UI here
    }
  };

  // Don't render if we don't have a communityId
  if (!communityId) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Text>Loading chat...</Text>
      </Box>
    );
  }

  // Mark messages as read when component mounts or messages change
  useEffect(() => {
    if (messages.length > 0) {
      markCommunityAsRead(communityId);
    }
  }, [communityId, messages.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollRef?.current?.scrollToEnd({ animated: true });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [messages.length]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Box style={styles.container} backgroundColor={`${colorMode}.primaryBackground`}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          ref={scrollRef}
        >
          <VStack>
            {Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
              <VStack key={dateLabel} space={2}>
                {/* Date Label */}
                <HStack alignItems="center" justifyContent="center" space={2}>
                  <Box style={styles.dateLine} borderBottomColor={`${colorMode}.separator`} />
                  <Text style={styles.dateLabel} color={`${colorMode}.secondaryText`}>
                    {dateLabel}
                  </Text>
                  <Box style={styles.dateLine} borderBottomColor={`${colorMode}.separator`} />
                </HStack>
                {/* Messages */}
                {msgs.map((msg, index) => {
                  const thisMoment = moment(msg.createdAt);
                  const nextMsg = msgs[index + 1];
                  const nextMoment = nextMsg ? moment(nextMsg.createdAt) : null;

                  const isLastInMinuteAndSenderGroup =
                    !nextMoment ||
                    !thisMoment.isSame(nextMoment, 'minute') ||
                    msg.sender !== nextMsg.sender;

                  const prevMsg = msgs[index - 1];
                  const prevMoment = prevMsg ? moment(prevMsg.createdAt) : null;

                  const isFirstInGroup =
                    !prevMoment ||
                    !thisMoment.isSame(prevMoment, 'minute') ||
                    msg.sender !== prevMsg.sender;

                  // Determine if this message is from current user
                  const isFromCurrentUser = msg.sender === currentUserPubKey;

                  return (
                    <HStack
                      key={msg.id}
                      justifyContent={isFromCurrentUser ? 'flex-end' : 'flex-start'}
                      alignItems={isFromCurrentUser ? 'flex-end' : 'flex-start'}
                      space={2}
                      style={styles.messageRow}
                    >
                      {!isFromCurrentUser &&
                        isFirstInGroup &&
                        (receiverProfileImage ? (
                          <Image
                            source={{ uri: receiverProfileImage }}
                            alt="reciverprofileImage"
                            style={styles.avatar}
                          />
                        ) : (
                          <Image
                            source={PlaceHolderImage}
                            alt="placeHolder"
                            style={styles.avatar}
                          />
                        ))}

                      <VStack style={styles.messageBubble}>
                        <Box
                          backgroundColor={
                            isFromCurrentUser
                              ? `${colorMode}.separator`
                              : `${colorMode}.modalWhiteBackground`
                          }
                          style={[
                            {
                              borderRadius: isFromCurrentUser ? 12 : 0,
                              borderBottomRightRadius: isFromCurrentUser ? 0 : 12,
                              borderTopLeftRadius: !isFromCurrentUser ? 0 : 12,
                              marginRight:
                                isFromCurrentUser && isLastInMinuteAndSenderGroup ? 0 : wp(32),
                              marginLeft: !isFromCurrentUser && isFirstInGroup ? 0 : wp(32),
                            },
                            styles.messageContent,
                          ]}
                        >
                          <Text style={styles.messageText} color={`${colorMode}.subchatText`}>
                            {msg.text}
                          </Text>
                        </Box>

                        {isLastInMinuteAndSenderGroup && (
                          <Text
                            color={`${colorMode}.subchatText`}
                            style={[
                              {
                                alignSelf: isFromCurrentUser ? 'flex-end' : 'flex-start',
                                marginLeft: !isFromCurrentUser && isFirstInGroup ? 0 : wp(32),
                              },
                              styles.timestamp,
                            ]}
                          >
                            {thisMoment.format('hh:mm A')}
                          </Text>
                        )}
                      </VStack>

                      {isFromCurrentUser &&
                        isLastInMinuteAndSenderGroup &&
                        (userProfileImage ? (
                          <Image
                            source={{ uri: userProfileImage }}
                            alt="userprofileImage"
                            style={styles.avatar}
                            marginBottom={hp(20)}
                          />
                        ) : (
                          <Image
                            source={PlaceHolderImage}
                            alt="placeHolder"
                            style={styles.avatar}
                            marginBottom={hp(20)}
                          />
                        ))}
                    </HStack>
                  );
                })}
              </VStack>
            ))}
          </VStack>
        </ScrollView>

        <HStack style={styles.inputContainer} space={2}>
          <Box style={styles.inputBar} borderColor={`${colorMode}.separator`}>
            {isDarkMode ? (
              <PlusWhiteIcon width={18} height={18} />
            ) : (
              <PlusIcon width={20} height={20} />
            )}
            <Box style={styles.seperator} backgroundColor={`${colorMode}.separator`} />
            <Input
              flex={1}
              placeholder="Type your Message here"
              placeholderTextColor={`${colorMode}.placeHolderTextColor`}
              value={inputValue}
              onChangeText={setInputValue}
              variant="filled"
              bg="gray.100"
              px={4}
              borderRadius="full"
              backgroundColor={`${colorMode}.primaryBackground`}
              focusOutlineColor={'transparent'}
              fontSize={14}
              selectionColor={colorMode === 'dark' ? 'white' : 'black'}
            />
            <TouchableOpacity onPress={handleSend}>
              <Box style={styles.sendButton} backgroundColor={`${colorMode}.pantoneGreen`}>
                <SendWhiteIcon width={20} height={20} />
              </Box>
            </TouchableOpacity>
          </Box>
        </HStack>
      </Box>
    </KeyboardAvoidingView>
  );
};

export default ChatRoom;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: wp(20),
    paddingBottom: wp(10),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(22),
    paddingBottom: wp(20),
  },
  dateLabel: {
    textAlign: 'center',
    fontSize: 12,
    marginVertical: hp(12),
  },
  messageRow: {
    marginVertical: 2,
  },
  messageBubble: {
    maxWidth: '90%',
    borderRadius: 12,
  },
  timestamp: {
    fontSize: 10,
    marginTop: hp(4),
  },
  avatar: {
    borderRadius: 999,
    width: wp(25),
    height: wp(25),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputBar: {
    flexDirection: 'row',
    paddingLeft: wp(12),
    paddingRight: wp(5),
    paddingVertical: hp(5),
    marginBottom: wp(10),
    width: '90%',
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 15,
  },
  dateLine: {
    borderBottomWidth: 1,
    flex: 1,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 19,
  },
  messageContent: {
    paddingVertical: wp(10),
    paddingHorizontal: wp(14),
    borderRadius: 12,
  },
  seperator: {
    height: 30,
    borderLeftWidth: 0.2,
    paddingHorizontal: 0.4,
    opacity: 0.5,
    marginLeft: wp(12),
  },
  sendButton: {
    width: wp(40),
    height: wp(40),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
