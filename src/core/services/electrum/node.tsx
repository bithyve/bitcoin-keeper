/* eslint-disable consistent-return */
import { isTestnet } from 'src/common/constants/Bitcoin';
import ElectrumClient from 'src/core/services/electrum/client';
import { NodeDetail } from 'src/core/wallets/interfaces';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';

export const predefinedTestnetNodes: NodeDetail[] = [
  {
    id: 333, // sequence 3-x-x; avoids collision w/ own node
    host: 'testnet.qtornado.com',
    port: '51002',
    isConnected: false,
    useKeeperNode: false,
    useSSL: true,
    isDefault: true,
  },
];

export const predefinedMainnetNodes: NodeDetail[] = [
  {
    id: 444, // sequence 4-x-x; avoids collision w/ own node
    host: 'electrumx-core.1209k.com',
    port: '50002',
    isConnected: false,
    useKeeperNode: false,
    useSSL: true,
    isDefault: true,
  },
  {
    id: 445,
    host: 'bitcoin.lukechilds.co',
    port: '50002',
    isConnected: false,
    useKeeperNode: false,
    useSSL: true,
    isDefault: true,
  },
  {
    id: 446,
    host: 'electrum1.bluewallet.io',
    port: '443',
    isConnected: false,
    useKeeperNode: false,
    useSSL: true,
    isDefault: true,
  },
  {
    id: 447,
    host: 'electrum.jochen-hoenicke.de',
    port: '50006',
    isConnected: false,
    useKeeperNode: false,
    useSSL: true,
    isDefault: true,
  },
];

export default class Node {
  public static async save(nodeDetail: NodeDetail, nodeList: NodeDetail[]) {
    if (
      nodeDetail.host === null ||
      nodeDetail.host.length === 0 ||
      nodeDetail.port === null ||
      nodeDetail.port.length === 0
    )
      return null;

    if (nodeDetail.isDefault) return null; // default nodes are not stored in realm

    const node = { ...nodeDetail };
    if (node.id === null) {
      // case: save new node
      node.id = nodeList.length + 1;
      dbManager.createObject(RealmSchema.NodeConnect, node);
    } else {
      // case: update existing node
      dbManager.updateObjectById(RealmSchema.NodeConnect, node.id.toString(), {
        host: node.host,
        port: node.port,
        useSSL: node.useSSL,
        useKeeperNode: node.useKeeperNode,
        isConnected: node.isConnected,
      });
    }

    return { nodes: Node.getNodes(), node };
  }

  public static update(nodeDetail: NodeDetail, propsToUpdate: any) {
    if (!nodeDetail) return null;
    if (nodeDetail.isDefault) return null; // default nodes are not stored in realm

    dbManager.updateObjectById(RealmSchema.NodeConnect, nodeDetail.id.toString(), {
      ...propsToUpdate,
    });
  }

  public static delete(nodeDetail: NodeDetail) {
    if (!nodeDetail) return null;
    if (nodeDetail.isDefault) return null; // default nodes are not stored in realm

    const status: boolean = dbManager.deleteObjectById(
      RealmSchema.NodeConnect,
      nodeDetail.id.toString()
    );
    return status;
  }

  public static getNodes(): NodeDetail[] {
    const defaultNodes: NodeDetail[] = isTestnet()
      ? predefinedTestnetNodes
      : predefinedMainnetNodes;
    const nodes: NodeDetail[] = dbManager.getCollection(RealmSchema.NodeConnect);
    return [...defaultNodes, ...nodes];
  }

  public static async connect(selectedNode: NodeDetail) {
    ElectrumClient.setActivePeer([], selectedNode);
    const { connected, connectedTo, error } = await ElectrumClient.connect();
    return { connected, connectedTo, error };
  }

  public static async disconnect(selectedNode: NodeDetail) {
    const activePeer = ElectrumClient.getActivePeer();
    if (selectedNode.host === activePeer?.host && selectedNode.port === activePeer?.port)
      ElectrumClient.forceDisconnect();
  }

  public static nodeConnectionStatus = (node: NodeDetail) => {
    const activePeer = ElectrumClient.getActivePeer();

    if (activePeer?.host === node.host && activePeer?.port === node.port && activePeer?.isConnected)
      return true;

    return false;
  };

  public static getModalParams(selectedNodeItem) {
    return {
      id: selectedNodeItem?.id || null,
      host: selectedNodeItem?.host || null,
      port: selectedNodeItem?.port || null,
      useKeeperNode: selectedNodeItem?.useKeeperNode || false,
      isConnected: selectedNodeItem?.isConnected || false,
      useSSL: selectedNodeItem?.useSSL || false,
    };
  }
}
