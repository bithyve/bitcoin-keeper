export enum MessageType {
  Alert = 'Alert',
  Text = 'Text',
  Image = 'Image',
  RequestSats = 'RequestSats',
  SendSats = 'SendSats',
  RequestAsset = 'RequestAsset',
  SendAsset = 'SendAsset',
}

export enum CommunityType {
  Peer = 'Peer',
  Group = 'Group',
  Broadcast = 'Broadcast',
}

export interface Message {
  id: string;
  communityId: string;
  type: MessageType;
  text: string;
  createdAt: number;
  sender: string;
  block: number;
  unread: boolean;
  fileUrl?: string;
}

export interface Community {
  id: string;
  name: string;
  type: CommunityType;
  createdAt: number;
  updatedAt: number;
  with?: string;
  key?: string;
}

export interface Contact {
  appID: string;
  contactKey: string;
  imageUrl?: string;
  name: string;
}

export enum deeplinkType {
  Contact = 'contact',
  Group = 'group',
  Broadcast = 'broadcast',
}
