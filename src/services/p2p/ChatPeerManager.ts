import RPC from 'bare-rpc';
import b4a from 'b4a';
import { Worklet } from 'react-native-bare-kit';
import bundle from './app.bundle.mjs';
import axios from 'axios';
import {
  GET_KEYS,
  GET_PEERS,
  JOIN_PEER,
  ON_CONNECTION,
  ON_MESSAGE,
  RPC_KEY,
  SEND_MESSAGE,
} from './rpc-commands.mjs';
import { CommunityType, Contact, Message } from './interface';
import { RealmSchema } from 'src/storage/realm/enum';
import dbManager from 'src/storage/realm/dbManager';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';

export default class ChatPeerManager {
  static instance: ChatPeerManager;

  worklet: Worklet;
  IPC: any;
  rpc: any;
  onMessageCallback: ((data: any) => void) | null = null;
  onConnectionCallback: ((data: any) => void) | null = null;
  app: KeeperApp;

  private constructor() {
    this.worklet = new Worklet();
    this.IPC = this.worklet.IPC;
    this.app = dbManager.getObjectByIndex(RealmSchema.KeeperApp) as any as KeeperApp;
  }

  static getInstance(): ChatPeerManager {
    if (!ChatPeerManager.instance) {
      ChatPeerManager.instance = new ChatPeerManager();
    }
    return ChatPeerManager.instance;
  }

  async init(seed: string): Promise<boolean> {
    await this.worklet.start('/app.bundle', bundle, [seed]);

    this.rpc = new RPC(this.IPC, async (req) => {
      const data = b4a.toString(req.data);

      if (req.command === RPC_KEY) {
      } else if (req.command === ON_MESSAGE) {
        this.storeMessage(JSON.parse(data));
        if (this.onMessageCallback) {
          this.onMessageCallback(JSON.parse(data));
        }
      } else if (req.command === ON_CONNECTION) {
        if (this.onConnectionCallback) {
          this.onConnectionCallback(JSON.parse(data));
        }
      }
    });
    return true;
  }

  async getKeys() {
    const request = this.rpc.request(GET_KEYS);
    request.send(`${GET_KEYS}`);
    const replyBuffer = await request.reply();
    const response = b4a.toString(replyBuffer);
    return JSON.parse(response);
  }

  async getPeers() {
    const request = this.rpc.request(GET_PEERS);
    request.send(`${GET_PEERS}`);
    const replyBuffer = await request.reply();
    const response = b4a.toString(replyBuffer);
    return JSON.parse(response);
  }

  async joinPeers(pubKey: string) {
    const request = this.rpc.request(JOIN_PEER);
    request.send(pubKey);
    const replyBuffer = await request.reply();
    const response = b4a.toString(replyBuffer);
    return response;
  }

  async sendMessage(pubKey: string, message: string) {
    const request = this.rpc.request(SEND_MESSAGE);
    request.send(JSON.stringify({ pubKey, message }));
    const replyBuffer = await request.reply();
    const response = b4a.toString(replyBuffer);
    return response;
  }

  setOnMessageListener(callback: (data: object) => void) {
    this.onMessageCallback = callback;
  }

  setOnConnectionListener(callback: (data: object) => void) {
    this.onConnectionCallback = callback;
  }

  async getPeerMessages(pubKey: string, lastBlock: number) {
    try {
      const response = await axios.get(
        `https://api.bitcointribe.app/api/v1/chat/getmessages?publicKey=${pubKey}&from=${lastBlock}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching peer messages:', error);
      throw error;
    }
  }

  async loadPendingMessages(lastBlock = 0) {
    try {
      const response = await this.getPeerMessages(this.app.contactsKey.publicKey, lastBlock + 1);
      if (response.messages.length > 0) {
        const communities = dbManager.getCollection(RealmSchema.Community);
        for (const msg of response.messages) {
          const message: Message = JSON.parse(msg.message);
          const communityId = [this.app.contactsKey.publicKey, message.sender].sort().join('-');
          if (!communities.find((c) => c.id === communityId)) {
            // const contact = await Relay.getWalletProfiles([message.sender]);
            const contact = await this.mockGetWalletProfiles([message.sender]);

            if (contact.results.length > 0) {
              dbManager.createObject(RealmSchema.Contact, contact.results[0]);
              dbManager.createObject(RealmSchema.Community, {
                id: communityId,
                communityId: communityId,
                name: contact.results[0].name,
                type: CommunityType.Peer,
                createdAt: msg.timestamp,
                updatedAt: msg.timestamp,
                with: message.sender,
              });
            }
          }
          dbManager.createObject(RealmSchema.Message, {
            id: message.id,
            communityId: communityId,
            type: message.type,
            text: message.text,
            createdAt: msg.timestamp,
            sender: message.sender,
            block: msg.blockNumber,
            unread: true,
            fileUrl: message?.fileUrl,
            request: (message as any)?.request,
          });
        }
      }
    } catch (error) {
      console.error('Error loading pending messages:', error);
    }
  }

  storeMessage = async (payload: any) => {
    try {
      const communities = dbManager.getCollection(RealmSchema.Community);
      const data = JSON.parse(payload.data);
      const message = JSON.parse(data.message);
      const community = communities.find((c) => c.id === message.communityId);
      if (!community) {
        // const contact = await Relay.getWalletProfiles([message.sender]);
        const contact = await this.mockGetWalletProfiles([message.sender]);

        if (contact.results.length > 0) {
          dbManager.createObject(RealmSchema.Contact, contact.results[0]);
          dbManager.createObject(RealmSchema.Community, {
            id: message.communityId,
            name: contact.results[0].name,
            type: CommunityType.Peer,
            createdAt: data.timestamp,
            updatedAt: data.timestamp,
            with: message.sender,
          });
        }
      }

      dbManager.createObject(RealmSchema.Message, {
        id: message.id,
        communityId: message.communityId,
        type: message.type,
        text: message.text,
        createdAt: data.timestamp,
        sender: message.sender,
        block: data.blockNumber,
        unread: true,
        fileUrl: message?.fileUrl,
        request: message?.request,
      });
    } catch (error) {
      console.error('Error storing messages:', error);
    }
  };

  // Mock method for testing - returns random contact objects
  mockGetWalletProfiles(contactKeys: string[]) {
    const mockNames = [
      'Alice Johnson',
      'Bob Smith',
      'Charlie Brown',
      'Diana Prince',
      'Eve Davis',
      'Frank Miller',
      'Grace Lee',
      'Henry Wilson',
      'Ivy Chen',
      'Jack Turner',
    ];

    const mockImageUrls = [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Eve',
    ];

    const results = contactKeys.map((contactKey) => ({
      appID: `app_${Math.random().toString(36).substr(2, 9)}`,
      contactKey,
      name: mockNames[Math.floor(Math.random() * mockNames.length)],
      imageUrl: mockImageUrls[Math.floor(Math.random() * mockImageUrls.length)],
    }));

    return {
      results,
      success: true,
      message: 'Mock wallet profiles retrieved successfully',
    };
  }

  async syncContacts() {
    try {
      const contacts: Contact[] = dbManager.getCollection(RealmSchema.Contact) as any;
      // const response = await Relay.getWalletProfiles(contacts.map((c) => c.contactKey));
      const response = await this.mockGetWalletProfiles(contacts.map((c) => c.contactKey));

      if (response.results.length > 0) {
        dbManager.createObjectBulk(
          RealmSchema.Contact,
          response.results,
          Realm.UpdateMode.Modified
        );
      }
    } catch (error) {
      console.error('Error syncing contacts:', error);
    }
  }
}
