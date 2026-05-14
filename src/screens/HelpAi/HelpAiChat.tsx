import { useColorMode } from '@gluestack-ui/themed-native-base';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  InteractionManager,
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
import { batch } from 'react-redux';
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
  const uiColors = useMemo(
    () => ({
      surface: isDarkMode ? '#1f1f1f' : '#ffffff',
      separator: isDarkMode ? '#3a3a3a' : '#d8d8d8',
      primaryText: isDarkMode ? Colors.bodyText : Colors.secondaryBlack,
      secondaryText: isDarkMode ? Colors.darkGrey : Colors.secondaryDarkGrey,
      buttonText: '#ffffff',
      link: Colors.primaryGreen,
      error: isDarkMode ? Colors.CrimsonRed : Colors.redAlert,
      userBubble: Colors.primaryGreen,
      aiBubble: isDarkMode ? Colors.SecondaryBlack : Colors.dullGreen,
      inputText: isDarkMode ? '#ffffff' : '#101010',
      placeholderText: isDarkMode ? '#9b9b9b' : '#8a8a8a',
    }),
    [isDarkMode]
  );
  const { showToast } = useToastMessage();
  const listRef = useRef<FlatList<HelpAiRenderMessage>>(null);
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
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    });
  };

  useEffect(() => {
    if (!messages.length) return;
    scrollToBottom();
  }, [messages.length]);

  const appendMessage = (message: HelpAiRenderMessage) => {
    dispatch(appendHelpAiMessage({ conversationId, message }));
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
      const aiRenderMsg: HelpAiRenderMessage = {
        id: nowId(),
        type: 'ai',
        text: response.reply,
        sources: response.sources,
      };
      const escalationRenderMsg: HelpAiRenderMessage | null =
        response.escalationCard &&
        response.conversationState?.escalationStage !== lastEscalationStage
          ? { id: nowId(), type: 'escalation', card: response.escalationCard }
          : null;

      batch(() => {
        dispatch(
          setHelpAiRawMessages({ conversationId, messages: [...nextHistory, aiMsg].slice(-20) })
        );
        dispatch(appendHelpAiMessage({ conversationId, message: aiRenderMsg }));
        if (response.draft && (response.intent === 'bug' || response.intent === 'feature')) {
          dispatch(setHelpAiDraft({ conversationId, draft: response.draft }));
          dispatch(setHelpAiDraftStatus({ conversationId, draftStatus: 'pending_review' }));
        }
        if (escalationRenderMsg) {
          dispatch(
            setHelpAiEscalationStage({
              conversationId,
              escalationStage: response.conversationState.escalationStage,
            })
          );
          dispatch(appendHelpAiMessage({ conversationId, message: escalationRenderMsg }));
        }
      });

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
        <View
          style={[
            styles.card,
            {
              backgroundColor: uiColors.surface,
              borderColor: uiColors.separator,
            },
          ]}
        >
          <Text medium color={uiColors.primaryText}>
            {item.card.title}
          </Text>
          <Text fontSize={12} color={uiColors.secondaryText}>
            {item.card.description}
          </Text>
          <View style={styles.cardCtaCtr}>
            <Buttons
              primaryText={item.card.ctaLabel}
              primaryCallback={() => handleEscalationCardAction(item.card)}
              fullWidth
            />
          </View>
        </View>
      );
    }

    if (item.type === 'issue') {
      return (
        <View
          style={[
            styles.card,
            {
              backgroundColor: uiColors.surface,
              borderColor: uiColors.separator,
            },
          ]}
        >
          <Text medium color={uiColors.primaryText}>
            {`Issue #${item.issueNumber} created`}
          </Text>
          <Text fontSize={12} color={uiColors.secondaryText}>
            {item.text}
          </Text>
          <Pressable onPress={() => Linking.openURL(item.issueUrl)}>
            <Text fontSize={12} color={uiColors.link} style={styles.linkText}>
              {item.issueUrl}
            </Text>
          </Pressable>
        </View>
      );
    }

    if (item.type === 'system_error') {
      return (
        <View style={styles.systemErrorCtr}>
          <Text fontSize={12} color={uiColors.error}>
            {item.text}
          </Text>
          {item.retryText ? (
            <Pressable onPress={() => sendToChat(item.retryText)}>
              <Text fontSize={12} color={uiColors.link} medium>
                Retry
              </Text>
            </Pressable>
          ) : null}
        </View>
      );
    }

    const isUser = item.type === 'user';
    const sources = item.type === 'ai' ? item.sources : undefined;
    return (
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.aiBubble,
          {
            backgroundColor: isUser ? uiColors.userBubble : uiColors.aiBubble,
            borderColor: isUser ? uiColors.userBubble : uiColors.separator,
          },
        ]}
      >
        <Text color={isUser ? uiColors.buttonText : uiColors.primaryText} fontSize={13}>
          {item.text}
        </Text>
        {sources?.length > 0 && (
          <View style={styles.sourcesCtr}>
            {sources.map((source, idx) => (
              <Pressable
                key={`${source.url}-${source.title}-${idx}`}
                onPress={() => Linking.openURL(source.url)}
              >
                <Text fontSize={11} color={uiColors.link} style={styles.linkText}>
                  {source.title}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <HelpAiShell title={'Help AI Chat'}>
      <View style={styles.container}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesContainer}
        />

        <View style={[styles.typingCtr, { display: typing ? 'flex' : 'none' }]}>
          <ActivityIndicator size="small" />
          <Text fontSize={12} color={uiColors.secondaryText}>
            Assistant is typing...
          </Text>
        </View>

        <View style={{ display: draft && draftStatus !== 'submitted' ? 'flex' : 'none' }}>
          {draft ? (
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
        </View>

        <View
          style={[
            styles.inputBar,
            {
              borderColor: uiColors.separator,
              backgroundColor: uiColors.surface,
            },
          ]}
        >
          <TextInput
            style={[styles.input, { color: uiColors.inputText }]}
            value={input}
            onChangeText={setInput}
            placeholder={'Type your message'}
            placeholderTextColor={uiColors.placeholderText}
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

        <Pressable
          style={[styles.retryBar, { display: lastFailedText ? 'flex' : 'none' }]}
          onPress={() => lastFailedText && sendToChat(lastFailedText)}
        >
          <Text fontSize={12} color={uiColors.link} medium>
            Retry last failed message
          </Text>
        </Pressable>
      </View>
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
  cardCtaCtr: {
    marginTop: hp(8),
  },
  bubble: {
    maxWidth: '86%',
    borderRadius: 12,
    paddingHorizontal: wp(12),
    paddingVertical: hp(10),
    marginBottom: hp(8),
    borderWidth: 1,
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  aiBubble: {
    alignSelf: 'flex-start',
  },
  sourcesCtr: {
    marginTop: hp(6),
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
