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
import PlaceHolderImage from 'src/assets/images/chat-image-placeholder-image.png';
import PlusIcon from 'src/assets/images/plus-green-icon.svg';
import SendIcon from 'src/assets/images/send-icon.svg';

const initialMessages = [
  { id: 1, text: 'oy baat sun', sender: 'other', date: '2023-10-01T09:15:00' },
  { id: 2, text: 'hn suna kya howa ', sender: 'me', date: '2023-10-01T09:15:30' },
  { id: 3, text: 'oy baat sun', sender: 'other', date: '2023-10-01T09:16:00' },
  { id: 4, text: 'hn suna kya howa ', sender: 'me', date: '2023-10-03T14:05:00' },
  { id: 7, text: 'hn suna kya howa ', sender: 'me', date: '2025-05-12T14:05:00' },
  {
    id: 5,
    text: 'bs dekh le pata lag gaya mujy ',
    sender: 'other',
    date: new Date().toISOString(),
  },
  { id: 6, text: 'jasoos chory wy hy hm ny bi ', sender: 'other', date: new Date().toISOString() },
  { id: 8, text: 'kya baat hy teri', sender: 'me', date: new Date().toISOString() },
];

const groupMessagesByDate = (msgs) => {
  const groups = {};
  msgs.forEach((msg) => {
    const date = moment(msg.date);
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

const ChatRoom = ({ userProfileImage, receiverProfileImage }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const groupedMessages = groupMessagesByDate(messages);
  const { colorMode } = useColorMode();
  const scrollRef = useRef(null);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const newMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'me',
      date: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
    setTimeout(() => {
      scrollRef?.current?.scrollToEnd({ animated: true });
    }, 0);
  };
  useEffect(() => {
    setTimeout(() => {
      scrollRef?.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);
  console.log('receiverProfileImage', receiverProfileImage);

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
                  const thisMoment = moment(msg.date);
                  const nextMsg = msgs[index + 1];
                  const nextMoment = nextMsg ? moment(nextMsg.date) : null;

                  const isLastInMinuteAndSenderGroup =
                    !nextMoment ||
                    !thisMoment.isSame(nextMoment, 'minute') ||
                    msg.sender !== nextMsg.sender;

                  return (
                    <HStack
                      key={msg.id}
                      justifyContent={msg.sender === 'me' ? 'flex-end' : 'flex-start'}
                      alignItems="flex-end"
                      space={2}
                      style={styles.messageRow}
                    >
                      {msg.sender === 'other' &&
                        isLastInMinuteAndSenderGroup &&
                        (receiverProfileImage ? (
                          <Image
                            source={{ uri: receiverProfileImage }}
                            alt="reciverprofileImage"
                            style={styles.avatar}
                            marginBottom={hp(40)}
                          />
                        ) : (
                          <Image
                            source={PlaceHolderImage}
                            alt="placeHolder"
                            style={styles.avatar}
                            marginBottom={hp(40)}
                          />
                        ))}

                      <VStack style={styles.messageBubble}>
                        <Box
                          backgroundColor={
                            msg.sender === 'me'
                              ? `${colorMode}.separator`
                              : `${colorMode}.modalWhiteBackground`
                          }
                          style={[
                            {
                              borderRadius: msg.sender === 'me' ? 12 : 0,
                              borderBottomRightRadius: msg.sender === 'me' ? 0 : 12,
                              borderTopLeftRadius: msg.sender === 'other' ? 0 : 12,
                              marginRight:
                                msg.sender === 'me' && isLastInMinuteAndSenderGroup ? 0 : wp(32),
                              marginLeft:
                                msg.sender === 'other' && isLastInMinuteAndSenderGroup ? 0 : wp(32),
                            },
                            styles.messageContent,
                          ]}
                          borderColor={`${colorMode}.separator`}
                        >
                          <Text style={styles.messageText} color={`${colorMode}.subchatText`}>
                            {msg.text}
                          </Text>
                        </Box>

                        {isLastInMinuteAndSenderGroup && (
                          <Text
                            color={`${colorMode}.subchatText`}
                            style={[
                              { alignSelf: msg.sender === 'me' ? 'flex-end' : 'flex-start' },
                              styles.timestamp,
                            ]}
                          >
                            {thisMoment.format('hh:mm A')}
                          </Text>
                        )}
                      </VStack>

                      {msg.sender === 'me' &&
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
            <PlusIcon width={20} height={20} />
            <Box style={styles.seperator} backgroundColor={`${colorMode}.separator`} />
            <Input
              flex={1}
              placeholder="Type a message"
              value={inputValue}
              onChangeText={setInputValue}
              variant="filled"
              bg="gray.100"
              px={4}
              borderRadius="full"
              backgroundColor={`${colorMode}.primaryBackground`}
              focusOutlineColor={'transparent'}
              fontSize={14}
            />
            <TouchableOpacity onPress={handleSend}>
              <Box style={styles.sendButton} backgroundColor={`${colorMode}.pantoneGreen`}>
                <SendIcon width={20} height={20} />
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
    marginLeft: hp(4),
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
    width: '95%',
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
