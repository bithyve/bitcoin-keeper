import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@realm/react';
import ChatPeerManager from '../services/p2p/ChatPeerManager';
import { Message, Community, Contact, CommunityType } from '../services/p2p/interface';
import { RealmSchema } from '../storage/realm/enum';
import { captureError } from '../services/sentry';
import dbManager from '../storage/realm/dbManager';
import { getJSONFromRealmObject } from '../storage/realm/utils';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import idx from 'idx';

export interface UseChatPeerOptions {
  autoInit?: boolean;
  enableMessageListener?: boolean;
  enableConnectionListener?: boolean;
}

export interface UseChatPeerReturn {
  // State
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  communities: Community[];
  contacts: Contact[];
  peers: any[];

  // Chat operations
  initChatPeer: () => Promise<boolean>;
  sendMessage: (pubKey: string, message: string) => Promise<string>;
  joinPeer: (pubKey: string) => Promise<string>;
  loadPendingMessages: (lastBlock?: number) => Promise<void>;

  // Data fetching
  getPeers: () => Promise<any>;
  getKeys: () => {
    [key: string]: string;
  };
  getPeerMessages: (pubKey: string, lastBlock: number) => Promise<any>;

  // Contact management
  syncContacts: () => Promise<void>;

  // Message operations (lazy loaded)
  getMessagesByCommunity: (communityId: string) => Message[];
  getAllMessages: () => Message[];
  getUnreadMessages: () => Message[];
  getUnreadCount: (communityId?: string) => number;
  markMessageAsRead: (messageId: string) => Promise<boolean>;
  markCommunityAsRead: (communityId: string) => Promise<boolean>;

  // Community helpers
  getPeerCommunities: () => Community[];
  getCommunityById: (communityId: string) => Community | null;

  // Contact helpers
  getContactByKey: (contactKey: string) => Contact | null;

  // Listeners
  setMessageListener: (callback: (data: any) => void) => void;
  setConnectionListener: (callback: (data: any) => void) => void;
}

export const useChatPeer = (options: UseChatPeerOptions = {}): UseChatPeerReturn => {
  const {
    autoInit = false,
    enableMessageListener = true,
    enableConnectionListener = true,
  } = options;

  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [peers, setPeers] = useState<any[]>([]);

  // Realm queries - only for communities and contacts, not messages
  const allCommunities = useQuery(RealmSchema.Community);
  const allContacts = useQuery(RealmSchema.Contact);
  const keeperApp: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0] as any;

  // Convert Realm objects to plain objects
  const communities: Community[] = allCommunities.map((c) => (c.toJSON ? c.toJSON() : c)) as any;
  const contacts: Contact[] = allContacts.map((c) => (c.toJSON ? c.toJSON() : c)) as any;

  const chatManager = ChatPeerManager.getInstance();

  // Initialize chat peer
  const initChatPeer = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const success = await chatManager.init(keeperApp.primarySeed);
      setIsInitialized(success);

      if (success && enableMessageListener) {
        chatManager.setOnMessageListener((data) => {
          // console.log('New message received:', data);
        });
      }

      if (success && enableConnectionListener) {
        chatManager.setOnConnectionListener((data) => {
          console.log('New connection:', data);
        });
      }

      const secretKey = idx(keeperApp, (app) => app.contactsKey.secretKey);
      // Get keys from ChatPeerManager and update KeeperApp if contactsKey is missing
      if (success && !secretKey) {
        try {
          const keys = await chatManager.getKeys();
          if (keys && keys.publicKey && keys.secretKey) {
            // Update the KeeperApp with the contacts key in Realm database
            await dbManager.updateObjectById(RealmSchema.KeeperApp, keeperApp.id, {
              contactsKey: {
                publicKey: keys.publicKey,
                secretKey: keys.secretKey,
              },
            });
            console.log('Database updated with peer keys');
            // TODO: update the backend (using Relay.createNewApp alternate route)
          }
        } catch (keyError) {
          console.warn('Failed to get or update contacts key:', keyError);
          captureError(keyError);
          return false;
        }
      }

      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize chat peer');
      captureError(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [keeperApp, enableMessageListener, enableConnectionListener]);

  // Send message
  const sendMessage = useCallback(async (pubKey: string, message: string): Promise<string> => {
    try {
      setError(null);
      return await chatManager.sendMessage(pubKey, message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      captureError(err);
      throw err;
    }
  }, []);

  // Join peer
  const joinPeer = useCallback(async (pubKey: string): Promise<string> => {
    try {
      setError(null);
      return await chatManager.joinPeers(pubKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join peer');
      captureError(err);
      throw err;
    }
  }, []);

  // Load pending messages
  const loadPendingMessages = useCallback(async (lastBlock = 0): Promise<void> => {
    try {
      setError(null);
      await chatManager.loadPendingMessages(lastBlock);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pending messages');
      captureError(err);
    }
  }, []);

  // Get peers
  const getPeers = useCallback(async (): Promise<any> => {
    try {
      setError(null);
      const result = await chatManager.getPeers();
      setPeers(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get peers');
      captureError(err);
      throw err;
    }
  }, []);

  // Get keys
  const getKeys = useCallback((): {
    [key: string]: string;
  } => {
    try {
      setError(null);
      if (keeperApp.contactsKey) return keeperApp.contactsKey;
      // chatPeer.getKeys() is only used during initialization for fetching the
      // keys directly from the chat peer manager and storing them in KeeperApp
      else throw new Error('Contacts key not found. Initialize chat peer first.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get keys');
      captureError(err);
      throw err;
    }
  }, []);

  // Get peer messages
  const getPeerMessages = useCallback(async (pubKey: string, lastBlock: number): Promise<any> => {
    try {
      setError(null);
      return await chatManager.getPeerMessages(pubKey, lastBlock);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get peer messages');
      captureError(err);
      throw err;
    }
  }, []);

  // Sync contacts
  const syncContacts = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await chatManager.syncContacts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync contacts');
      captureError(err);
    }
  }, []);

  // Lazy-loaded message operations
  const getAllMessages = useCallback((): Message[] => {
    try {
      const allMessages = dbManager.getCollection(RealmSchema.Message);
      return allMessages.map((m: any) => (m.toJSON ? m.toJSON() : m)) as Message[];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get messages');
      captureError(err);
      return [];
    }
  }, []);

  const getMessagesByCommunity = useCallback(
    (communityId: string): Message[] => {
      try {
        const allMessages = getAllMessages();
        return allMessages.filter((message) => message.communityId === communityId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get messages by community');
        captureError(err);
        return [];
      }
    },
    [getAllMessages]
  );

  const getUnreadMessages = useCallback((): Message[] => {
    try {
      const allMessages = getAllMessages();
      return allMessages.filter((message) => message.unread);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get unread messages');
      captureError(err);
      return [];
    }
  }, [getAllMessages]);

  const getUnreadCount = useCallback(
    (communityId?: string): number => {
      try {
        const unreadMessages = getUnreadMessages();
        if (communityId) {
          return unreadMessages.filter((message) => message.communityId === communityId).length;
        }
        return unreadMessages.length;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get unread count');
        captureError(err);
        return 0;
      }
    },
    [getUnreadMessages]
  );

  // Mark message as read
  const markMessageAsRead = useCallback(async (messageId: string): Promise<boolean> => {
    try {
      setError(null);
      await dbManager.updateObjectById(RealmSchema.Message, messageId, { unread: false });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark message as read');
      captureError(err);
      return false;
    }
  }, []);

  // Mark all messages in a community as read
  const markCommunityAsRead = useCallback(
    async (communityId: string): Promise<boolean> => {
      try {
        setError(null);
        const communityMessages = getMessagesByCommunity(communityId);
        const unreadMessages = communityMessages.filter((msg) => msg.unread);

        for (const message of unreadMessages) {
          await dbManager.updateObjectById(RealmSchema.Message, message.id, { unread: false });
        }
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to mark community as read');
        captureError(err);
        return false;
      }
    },
    [getMessagesByCommunity]
  );

  // Community helpers
  const getPeerCommunities = useCallback((): Community[] => {
    return communities.filter((community) => community.type === CommunityType.Peer);
  }, [communities]);

  const getCommunityById = useCallback(
    (communityId: string): Community | null => {
      return communities.find((community) => community.id === communityId) || null;
    },
    [communities]
  );

  // Contact helpers
  const getContactByKey = useCallback(
    (contactKey: string): Contact | null => {
      return contacts.find((contact) => contact.contactKey === contactKey) || null;
    },
    [contacts]
  );

  // Set listeners
  const setMessageListener = useCallback((callback: (data: any) => void): void => {
    chatManager.setOnMessageListener(callback);
  }, []);

  const setConnectionListener = useCallback((callback: (data: any) => void): void => {
    chatManager.setOnConnectionListener(callback);
  }, []);

  // Auto-initialize if requested
  useEffect(() => {
    if (autoInit && !isInitialized) {
      initChatPeer();
    }
  }, [autoInit, isInitialized, initChatPeer]);

  return {
    // State
    isInitialized,
    isLoading,
    error,
    communities,
    contacts,
    peers,

    // Chat operations
    initChatPeer,
    sendMessage,
    joinPeer,
    loadPendingMessages,

    // Data fetching
    getPeers,
    getKeys,
    getPeerMessages,

    // Contact management
    syncContacts,

    // Message operations (lazy loaded)
    getMessagesByCommunity,
    getAllMessages,
    getUnreadMessages,
    getUnreadCount,
    markMessageAsRead,
    markCommunityAsRead,

    // Community helpers
    getPeerCommunities,
    getCommunityById,

    // Contact helpers
    getContactByKey,

    // Listeners
    setMessageListener,
    setConnectionListener,
  };
};
