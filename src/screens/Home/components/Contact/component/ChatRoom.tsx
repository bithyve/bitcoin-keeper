import React, { useEffect, useRef, useState } from 'react';
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
// import PlusIcon from 'src/assets/images/plus-green-icon.svg';
// import PlusWhiteIcon from 'src/assets/images/add-plus-white.svg';
import SendWhiteIcon from 'src/assets/images/send-white-icon.svg';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { ChatEncryptionManager } from 'src/utils/service-utilities/ChatEncryptionManager';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { v4 as uuidv4 } from 'uuid';
import ChatPeerManager from 'src/services/p2p/ChatPeerManager';

const groupMessagesByDate = (msgs) => {
  const groups = {};

  const filteredMessages = msgs.filter((msg) => msg.type !== 'Alert');
  const sortedMessages = filteredMessages.sort((a, b) => a.createdAt - b.createdAt);
  sortedMessages.forEach((msg) => {
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

const ChatRoom = ({ userProfileImage, receiverProfileImage, messages, community }) => {
  const [inputValue, setInputValue] = useState('');
  const groupedMessages = groupMessagesByDate(messages);
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const scrollRef = useRef(null);
  const app: KeeperApp = dbManager.getObjectByIndex(RealmSchema.KeeperApp) as any as KeeperApp;
  const chatManager = ChatPeerManager.getInstance();
  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const text = inputValue.trim();
    setInputValue('');

    try {
      const messageData = {
        id: uuidv4(),
        text,
        createdAt: Date.now(),
        type: 'TEXT',
        sender: app.contactsKey.publicKey,
        communityId: community.id,
        unread: false,
        fileUrl: '',
      };

      dbManager.createObject(RealmSchema.Message, messageData);

      const encryptedMessage = ChatEncryptionManager.encryptMessage(
        JSON.stringify({ ...messageData }),
        community.key
      );

      await chatManager.sendMessage(
        community.with,
        JSON.stringify({ ...encryptedMessage, communityId: community.id })
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setInputValue(text);
    }

    setTimeout(() => {
      scrollRef?.current?.scrollToEnd({ animated: true });
    }, 0);
  };

  useEffect(() => {
    setTimeout(() => {
      scrollRef?.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, scrollRef]);

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
                {(msgs as any[]).map((msg, index) => {
                  const thisMoment = moment(msg.createdAt);
                  const nextMsg = (msgs as any[])[index + 1];
                  const nextMoment = nextMsg ? moment(nextMsg.createdAt) : null;
                  const isMyMessage = msg.sender === app.contactsKey.publicKey;

                  const isLastInMinuteAndSenderGroup =
                    !nextMoment ||
                    !thisMoment.isSame(nextMoment, 'minute') ||
                    msg.sender !== nextMsg.sender;

                  const prevMsg = (msgs as any[])[index - 1];
                  const prevMoment = prevMsg ? moment(prevMsg.createdAt) : null;

                  const isFirstInGroup =
                    !prevMoment ||
                    !thisMoment.isSame(prevMoment, 'minute') ||
                    msg.sender !== prevMsg.sender;

                  return (
                    <HStack
                      key={msg.id}
                      justifyContent={isMyMessage ? 'flex-end' : 'flex-start'}
                      alignItems={isMyMessage ? 'flex-end' : 'flex-start'}
                      space={2}
                      style={styles.messageRow}
                    >
                      {!isMyMessage &&
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
                            isMyMessage
                              ? `${colorMode}.separator`
                              : `${colorMode}.textInputBackground`
                          }
                          borderColor={`${colorMode}.separator`}
                          style={[
                            {
                              borderRadius: isMyMessage ? 12 : 0,
                              borderBottomRightRadius: isMyMessage ? 0 : 12,
                              borderTopLeftRadius: !isMyMessage ? 0 : 12,
                              marginRight: isMyMessage && isLastInMinuteAndSenderGroup ? 0 : wp(32),
                              marginLeft: !isMyMessage && isFirstInGroup ? 0 : wp(32),
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
                                alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
                                marginLeft: !isMyMessage && isFirstInGroup ? 0 : wp(32),
                              },
                              styles.timestamp,
                            ]}
                          >
                            {thisMoment.format('hh:mm A')}
                          </Text>
                        )}
                      </VStack>

                      {isMyMessage &&
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
            {/* For the future if needed  */}
            {/* {isDarkMode ? (
              <PlusWhiteIcon width={18} height={18} />
            ) : (
              <PlusIcon width={20} height={20} />
            )}
            <Box style={styles.seperator} backgroundColor={`${colorMode}.separator`} /> */}
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
    // paddingLeft: wp(12),
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
    borderWidth: 1,
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
