import React from 'react';
import HelpAiEntryCard from './components/HelpAiEntryCard';
import { CommonActions, useNavigation } from '@react-navigation/core';
import { useAppSelector } from 'src/store/hooks';
import HelpAiChatHistoryList from './components/HelpAiChatHistoryList';

const HelpAiEntry = () => {
  const navigation = useNavigation();
  const threads = useAppSelector((state) => state.helpAi.threads);
  const chatThreads = threads.filter((thread) => thread.messages.length > 0);

  const hasChats = chatThreads.length > 0;

  if (hasChats) {
    return (
      <HelpAiChatHistoryList
        threads={chatThreads}
        onOpenChat={(conversationId) =>
          navigation.dispatch(CommonActions.navigate('HelpAiChat', { conversationId }))
        }
        onStartNewChat={() =>
          navigation.dispatch(CommonActions.navigate('HelpAiChat', { startFresh: true }))
        }
      />
    );
  }

  return (
    <HelpAiEntryCard
      onStartChat={() => navigation.dispatch(CommonActions.navigate('HelpAiChat', { startFresh: true }))}
      onPromptPress={(prefillText) =>
        navigation.dispatch(CommonActions.navigate('HelpAiChat', { prefillText, startFresh: true }))
      }
    />
  );
};

export default HelpAiEntry;
