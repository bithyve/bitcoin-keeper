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
import { CommunityType } from './interface';
import { RealmSchema } from 'src/storage/realm/enum';
import dbManager from 'src/storage/realm/dbManager';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { ChatEncryptionManager } from 'src/utils/service-utilities/ChatEncryptionManager';
import Relay from '../backend/Relay';

export default class ChatPeerManager {
  static instance: ChatPeerManager;
  static isInitialized: boolean = false;
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

  static resetInstance() {
    ChatPeerManager.instance = null;
  }

  async init(seed: string): Promise<boolean> {
    try {
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
      ChatPeerManager.isInitialized = true;

      const keeperApp = dbManager.getObjectByIndex(RealmSchema.KeeperApp) as any as KeeperApp;
      if (!keeperApp?.contactsKey?.secretKey) {
        const keys = await this.getKeys();
        if (keys && keys.publicKey && keys.secretKey) {
          const updated = await Relay.updateContactsKey(keeperApp.id, keys.secretKey);
          console.log('updated', updated);
          if (updated) {
            await dbManager.updateObjectById(RealmSchema.KeeperApp, keeperApp.id, {
              contactsKey: {
                publicKey: keys.publicKey,
                secretKey: keys.secretKey,
              },
            });
          }
        }
      }
      return true;
    } catch (error) {
      console.error('Error initializing chat peer manager:', error);
      return false;
    }
  }

  async getKeys() {
    if (!ChatPeerManager.isInitialized || !this.rpc) {
      throw new Error('ChatPeerManager not initialized. Call init() first.');
    }
    const request = this.rpc.request(GET_KEYS);
    request.send(`${GET_KEYS}`);
    const replyBuffer = await request.reply();
    const response = b4a.toString(replyBuffer);
    return JSON.parse(response);
  }

  async getPeers() {
    if (!ChatPeerManager.isInitialized || !this.rpc) {
      throw new Error('ChatPeerManager not initialized. Call init() first.');
    }
    const request = this.rpc.request(GET_PEERS);
    request.send(`${GET_PEERS}`);
    const replyBuffer = await request.reply();
    const response = b4a.toString(replyBuffer);
    return JSON.parse(response);
  }

  async joinPeers(pubKey: string) {
    if (!ChatPeerManager.isInitialized || !this.rpc) {
      throw new Error('ChatPeerManager not initialized. Call init() first.');
    }
    const request = this.rpc.request(JOIN_PEER);
    request.send(pubKey);
    const replyBuffer = await request.reply();
    const response = b4a.toString(replyBuffer);
    return response;
  }

  async sendMessage(pubKey: string, message: string) {
    if (!ChatPeerManager.isInitialized || !this.rpc) {
      throw new Error('ChatPeerManager not initialized. Call init() first.');
    }
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
        `https://dev-api.bitcointribe.app/api/v1/chat/getmessages?publicKey=${pubKey}&from=${lastBlock}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching peer messages:', error);
      throw error;
    }
  }

  async loadPendingMessages(lastBlock = 0) {
    try {
      const response = await this.getPeerMessages(
        this.app.contactsKey.publicKey,
        lastBlock === 0 ? 0 : lastBlock - 1
      );
      if (response.messages.length > 0) {
        for (const msg of response.messages) {
          const message = JSON.parse(msg.message);
          const communityId = message.communityId;
          let community = dbManager.getObjectByPrimaryId(RealmSchema.Community, 'id', communityId);
          if (!community) {
            const sharedSecret = ChatEncryptionManager.deriveSharedSecret(
              this.app.contactsKey.secretKey,
              message.pubKey
            );
            const decryptedKey = ChatEncryptionManager.decryptKeys(
              message.encryptedKeys,
              sharedSecret
            );
            const communityData = {
              id: communityId,
              communityId: communityId,
              name: message.senderName || 'Unknown Contact',
              type: CommunityType.Peer,
              createdAt: msg.timestamp,
              updatedAt: msg.timestamp,
              with: message.sender,
              key: decryptedKey.aesKey,
            };
            dbManager.createObject(RealmSchema.Community, communityData);

            dbManager.createObject(RealmSchema.Message, {
              id: message.id,
              communityId: message.communityId,
              type: message.type,
              text: message.text,
              createdAt: msg.timestamp,
              sender: message.sender,
              block: msg.blockNumber,
              unread: true,
              fileUrl: message?.fileUrl,
              request: message?.request,
            });
          } else {
            const decryptedMessage = ChatEncryptionManager.decryptMessage(
              message,
              (community as any).key
            );
            const messageData = JSON.parse(decryptedMessage);
            dbManager.createObject(RealmSchema.Message, {
              id: messageData.id,
              communityId: messageData.communityId,
              type: messageData.type,
              text: messageData.text,
              createdAt: msg.timestamp,
              sender: messageData.sender,
              block: msg.blockNumber,
              unread: true,
              fileUrl: message?.fileUrl,
              request: message?.request,
            });
          }
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
      console.log('message', message);
      let community: any = communities.find((c) => c.id === message.communityId);
      if (!community && message.encryptedKeys) {
        const sharedSecret = ChatEncryptionManager.deriveSharedSecret(
          this.app.contactsKey.secretKey,
          message.pubKey
        );
        console.log('sharedSecret', sharedSecret);
        const decryptedKeys = ChatEncryptionManager.decryptKeys(
          message.encryptedKeys,
          sharedSecret
        );
        console.log('decryptedKeys', decryptedKeys);

        const communityData = {
          id: message.communityId,
          name: message.senderName || 'Unknown Contact',
          type: CommunityType.Peer,
          createdAt: data.timestamp,
          updatedAt: data.timestamp,
          with: message.sender,
          key: decryptedKeys.aesKey,
        };
        dbManager.createObject(RealmSchema.Community, communityData);
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
        });
      } else {
        const decryptedMessage = ChatEncryptionManager.decryptMessage(
          message,
          (community as any).key
        );
        const messageData = JSON.parse(decryptedMessage);
        dbManager.createObject(RealmSchema.Message, {
          id: messageData.id,
          communityId: messageData.communityId,
          type: messageData.type,
          text: messageData.text,
          createdAt: data.timestamp,
          sender: messageData.sender,
          block: data.blockNumber,
          unread: true,
          fileUrl: messageData?.fileUrl,
        });
      }
    } catch (error) {
      console.error('Error storing messages:', error);
    }
  };
}
