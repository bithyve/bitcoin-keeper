import { Box, useColorMode } from '@gluestack-ui/themed-native-base';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import useToastMessage from 'src/hooks/useToastMessage';
import {
  HelpChatMessage,
  HelpChatMetadata,
  HelpChatResponse,
  HelpEscalationCard,
} from 'src/models/interfaces/HelpAi';
import Relay from 'src/services/backend/Relay';
import HelpAiDraftCard from './components/HelpAiDraftCard';
import HelpAiShell from './components/HelpAiShell';
import PaperPlaneLight from 'src/assets/images/paper-plane-light.svg';
import PaperPlaneDark from 'src/assets/images/paper-plane-dark.svg';
import Colors from 'src/theme/Colors';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import {
  appendHelpAiMessage,
  createHelpAiThread,
  incrementHelpAiIssueCount,
  setHelpAiChatMeta,
  setHelpAiDraft,
  setHelpAiDraftStatus,
  setHelpAiEscalationStage,
  setHelpAiRawMessages,
  type HelpAiDraftStatus,
  type HelpAiRenderMessage,
} from 'src/store/reducers/helpAi';

const SENSITIVE_INPUT_PATTERN = /(seed\s*phrase|mnemonic|xpriv|private\s*key|passphrase)/i;

const nowId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const buildMetadata = async (): Promise<HelpChatMetadata> => {
  const appVersion = DeviceInfo.getVersion();
  const device = await DeviceInfo.getDeviceName();
  return {
    appVersion,
    platform: Platform.OS === 'ios' ? 'ios' : 'android',
    device,
    currentScreen: 'HelpAiChat',
    locale: Intl.DateTimeFormat().resolvedOptions().locale,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
};

const HelpAiChat = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const { showToast } = useToastMessage();
  const listRef = useRef<FlatList>(null);
  const generatedConversationId = useMemo(() => `conv_${Date.now().toString(36)}`, []);
  const conversationId = route?.params?.conversationId || generatedConversationId;
  const initialPrompt = route?.params?.prefillText || '';
  const persistedThread = useAppSelector((state) =>
    state.helpAi.threads.find((thread) => thread.conversationId === conversationId)
  );

  const defaultIntro: HelpAiRenderMessage = {
    id: 'help-ai-intro',
    type: 'ai',
    text: 'Hi. I am Keeper Help. Ask your question and I will help with troubleshooting, bug drafts, or feature drafts.',
  };
  const messages = persistedThread?.messages?.length ? persistedThread.messages : [defaultIntro];
  const rawChatMessages = persistedThread?.rawMessages || [];
  const draft = persistedThread?.draft || null;
  const draftStatus: HelpAiDraftStatus = persistedThread?.draftStatus || 'pending_review';
  const lastEscalationStage = persistedThread?.lastEscalationStage || 'none';
  const chatMeta = persistedThread?.chatMeta || null;
  const issueCount = persistedThread?.issueCount || 1;

  const [input, setInput] = useState(initialPrompt);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [lastFailedText, setLastFailedText] = useState<string | null>(null);

  useEffect(() => {
    dispatch(createHelpAiThread({ conversationId }));
  }, [conversationId, dispatch]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  const appendMessage = (message: HelpAiRenderMessage) => {
    dispatch(appendHelpAiMessage({ conversationId, message }));
    scrollToBottom();
  };

  const handleEscalationCardAction = async (card: HelpEscalationCard) => {
    try {
      if (card.type === 'telegram' && card.ctaAction.url) {
        await Linking.openURL(card.ctaAction.url);
      } else if (card.type === 'advisor') {
        navigation.navigate('Advisors');
      } else if (card.type === 'developer_email' && card.ctaAction.mailto) {
        await Linking.openURL(card.ctaAction.mailto);
      }
    } catch (error) {
      showToast('Unable to open this action right now');
    }
  };

  const sendToChat = async (text: string) => {
    if (!text.trim()) return;
    if (SENSITIVE_INPUT_PATTERN.test(text)) {
      showToast('Please remove any secret data like seed phrases or private keys before sending.');
      return;
    }

    const outboundText = text.trim();
    setInput('');
    setSending(true);
    setTyping(true);
    appendMessage({ id: nowId(), type: 'user', text: outboundText });

    try {
      const metadata = chatMeta || (await buildMetadata());
      if (!chatMeta) {
        dispatch(setHelpAiChatMeta({ conversationId, chatMeta: metadata }));
      }

      const nextHistory: HelpChatMessage[] = [
        ...rawChatMessages,
        { role: 'user' as const, text: outboundText, time: new Date().toISOString() },
      ].slice(-20);

      const response: HelpChatResponse = await Relay.helpChat({
        conversationId,
        messages: nextHistory,
        userText: outboundText,
        metadata,
      });

      const aiMsg: HelpChatMessage = {
        role: 'ai',
        text: response.reply,
        time: new Date().toISOString(),
      };
      dispatch(
        setHelpAiRawMessages({ conversationId, messages: [...nextHistory, aiMsg].slice(-20) })
      );
      appendMessage({
        id: nowId(),
        type: 'ai',
        text: response.reply,
        sources: response.sources,
      });

      if (response.draft && (response.intent === 'bug' || response.intent === 'feature')) {
        dispatch(setHelpAiDraft({ conversationId, draft: response.draft }));
        dispatch(setHelpAiDraftStatus({ conversationId, draftStatus: 'pending_review' }));
      }

      if (
        response.escalationCard &&
        response.conversationState?.escalationStage !== lastEscalationStage
      ) {
        dispatch(
          setHelpAiEscalationStage({
            conversationId,
            escalationStage: response.conversationState.escalationStage,
          })
        );
        appendMessage({ id: nowId(), type: 'escalation', card: response.escalationCard });
      }

      setLastFailedText(null);
    } catch (error) {
      setLastFailedText(outboundText);
      appendMessage({
        id: nowId(),
        type: 'system_error',
        text: 'Message failed to send. Please retry.',
        retryText: outboundText,
      });
    } finally {
      setSending(false);
      setTyping(false);
    }
  };

  const submitDraftIssue = async () => {
    if (!draft || !chatMeta) return;

    try {
      dispatch(setHelpAiDraftStatus({ conversationId, draftStatus: 'submitting' }));
      const idempotencyKey = `issue-${conversationId}-${issueCount}`;
      const response = await Relay.submitHelpIssue({
        conversationId,
        kind: draft.kind,
        confirm: true,
        idempotencyKey,
        draft,
        metadata: chatMeta,
      });

      dispatch(incrementHelpAiIssueCount({ conversationId }));
      dispatch(setHelpAiDraftStatus({ conversationId, draftStatus: 'submitted' }));
      appendMessage({
        id: nowId(),
        type: 'issue',
        issueUrl: response.issueUrl,
        issueNumber: response.issueNumber,
        text: response.thankYouMessage,
      });
      appendMessage({
        id: nowId(),
        type: 'ai',
        text: response.thankYouMessage,
      });
    } catch (error) {
      dispatch(setHelpAiDraftStatus({ conversationId, draftStatus: 'failed_retryable' }));
      showToast(error?.message || 'Issue submission failed. Please retry.');
    }
  };

  const renderMessage = ({ item }: { item: HelpAiRenderMessage }) => {
    if (item.type === 'escalation') {
      return (
        <Box
          style={styles.card}
          backgroundColor={`${colorMode}.textInputBackground`}
          borderColor={`${colorMode}.separator`}
        >
          <Text medium color={`${colorMode}.primaryText`}>
            {item.card.title}
          </Text>
          <Text fontSize={12} color={`${colorMode}.secondaryText`}>
            {item.card.description}
          </Text>
          <Box mt={hp(8)}>
            <Buttons
              primaryText={item.card.ctaLabel}
              primaryCallback={() => handleEscalationCardAction(item.card)}
              fullWidth
            />
          </Box>
        </Box>
      );
    }

    if (item.type === 'issue') {
      return (
        <Box
          style={styles.card}
          backgroundColor={`${colorMode}.textInputBackground`}
          borderColor={`${colorMode}.separator`}
        >
          <Text medium color={`${colorMode}.primaryText`}>
            {`Issue #${item.issueNumber} created`}
          </Text>
          <Text fontSize={12} color={`${colorMode}.secondaryText`}>
            {item.text}
          </Text>
          <Pressable onPress={() => Linking.openURL(item.issueUrl)}>
            <Text fontSize={12} color={`${colorMode}.pantoneGreen`} style={styles.linkText}>
              {item.issueUrl}
            </Text>
          </Pressable>
        </Box>
      );
    }

    if (item.type === 'system_error') {
      return (
        <Box style={styles.systemErrorCtr}>
          <Text fontSize={12} color={`${colorMode}.error`}>
            {item.text}
          </Text>
          {item.retryText ? (
            <Pressable onPress={() => sendToChat(item.retryText)}>
              <Text fontSize={12} color={`${colorMode}.pantoneGreen`} medium>
                Retry
              </Text>
            </Pressable>
          ) : null}
        </Box>
      );
    }

    const isUser = item.type === 'user';
    const sources = item.type === 'ai' ? item.sources : undefined;
    return (
      <Box
        alignSelf={isUser ? 'flex-end' : 'flex-start'}
        maxWidth={'86%'}
        borderRadius={12}
        px={wp(12)}
        py={hp(10)}
        mb={hp(8)}
        backgroundColor={isUser ? `${colorMode}.pantoneGreen` : `${colorMode}.dullGreen`}
        borderWidth={1}
        borderColor={isUser ? `${colorMode}.pantoneGreen` : `${colorMode}.separator`}
      >
        <Text color={isUser ? `${colorMode}.buttonText` : `${colorMode}.primaryText`} fontSize={13}>
          {item.text}
        </Text>
        {sources?.length > 0 && (
          <Box mt={hp(6)}>
            {sources.map((source, idx) => (
              <Pressable key={idx} onPress={() => Linking.openURL(source.url)}>
                <Text fontSize={11} color={`${colorMode}.pantoneGreen`} style={styles.linkText}>
                  {source.title}
                </Text>
              </Pressable>
            ))}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <HelpAiShell title={'Help AI Chat'}>
      <Box style={styles.container}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={scrollToBottom}
        />

        {typing ? (
          <Box style={styles.typingCtr}>
            <ActivityIndicator size="small" />
            <Text fontSize={12} color={`${colorMode}.secondaryText`}>
              Assistant is typing...
            </Text>
          </Box>
        ) : null}

        {draft && draftStatus !== 'submitted' ? (
          <HelpAiDraftCard
            draft={draft}
            draftStatus={draftStatus}
            onReview={() =>
              dispatch(
                setHelpAiDraftStatus({
                  conversationId,
                  draftStatus: 'confirming_public_submission',
                })
              )
            }
            onConfirm={submitDraftIssue}
            onCancel={() =>
              dispatch(setHelpAiDraftStatus({ conversationId, draftStatus: 'pending_review' }))
            }
            onRetry={submitDraftIssue}
          />
        ) : null}

        <View
          style={[
            styles.inputBar,
            {
              borderColor: colorMode === 'dark' ? '#3a3a3a' : '#d8d8d8',
              backgroundColor: colorMode === 'dark' ? '#1f1f1f' : '#ffffff',
            },
          ]}
        >
          <TextInput
            style={[styles.input, { color: colorMode === 'dark' ? '#ffffff' : '#101010' }]}
            value={input}
            onChangeText={setInput}
            placeholder={'Type your message'}
            placeholderTextColor={colorMode === 'dark' ? '#9b9b9b' : '#8a8a8a'}
            editable={!sending}
            multiline
          />
          <Pressable
            style={[
              styles.sendBtn,
              { opacity: sending ? 0.6 : 1, backgroundColor: Colors.primaryGreen },
            ]}
            onPress={() => sendToChat(input)}
            disabled={sending}
          >
            {isDarkMode ? (
              <PaperPlaneDark height={hp(15)} width={hp(15)} />
            ) : (
              <PaperPlaneLight height={hp(15)} width={hp(15)} />
            )}
          </Pressable>
        </View>

        {lastFailedText ? (
          <Pressable style={styles.retryBar} onPress={() => sendToChat(lastFailedText)}>
            <Text fontSize={12} color={`${colorMode}.pantoneGreen`} medium>
              Retry last failed message
            </Text>
          </Pressable>
        ) : null}
      </Box>
    </HelpAiShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(16),
    paddingBottom: hp(12),
  },
  messagesContainer: {
    paddingVertical: hp(14),
  },
  inputBar: {
    borderWidth: 1,
    borderRadius: 12,
    padding: wp(8),
    flexDirection: 'row',
    gap: wp(8),
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    maxHeight: hp(100),
    minHeight: hp(42),
    fontSize: 13,
  },
  sendBtn: {
    borderRadius: 100,
    height: hp(38),
    width: hp(38),
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingCtr: {
    flexDirection: 'row',
    gap: wp(8),
    alignItems: 'center',
    marginBottom: hp(8),
  },
  card: {
    borderWidth: 1,
    borderRadius: 10,
    padding: wp(12),
    marginBottom: hp(8),
    gap: hp(4),
  },
  linkText: {
    marginTop: hp(6),
    textDecorationLine: 'underline',
  },
  systemErrorCtr: {
    alignSelf: 'center',
    marginBottom: hp(8),
    alignItems: 'center',
    gap: hp(3),
  },
  retryBar: {
    alignSelf: 'center',
    marginTop: hp(8),
  },
});

export default HelpAiChat;
