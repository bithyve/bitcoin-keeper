import ElectrumClient from 'src/services/electrum/client';
import { NodeDetail } from 'src/core/wallets/interfaces';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';

export default class Node {
  public static async save(nodeDetail: NodeDetail, nodeList: NodeDetail[]) {
    if (
      nodeDetail.host === null ||
      nodeDetail.host.length === 0 ||
      nodeDetail.port === null ||
      nodeDetail.port.length === 0
    ) {
      return { saved: false };
    }

    // test connection before saving
    const isConnectable = await ElectrumClient.testConnection(nodeDetail);
    if (!isConnectable) return { saved: false };

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
    return { saved: true };
  }

  public static update(nodeDetail: NodeDetail, propsToUpdate: any) {
    if (!nodeDetail) return null;

    const schema = nodeDetail.isDefault ? RealmSchema.DefaultNodeConnect : RealmSchema.NodeConnect;
    dbManager.updateObjectById(schema, nodeDetail.id.toString(), {
      ...propsToUpdate,
    });
  }

  public static delete(nodeDetail: NodeDetail) {
    if (!nodeDetail) return null;

    const schema = nodeDetail.isDefault ? RealmSchema.DefaultNodeConnect : RealmSchema.NodeConnect;
    const status: boolean = dbManager.deleteObjectById(schema, nodeDetail.id.toString());
    return status;
  }

  public static getAllNodes(): NodeDetail[] {
    const defaultNodes: NodeDetail[] = dbManager.getCollection(RealmSchema.DefaultNodeConnect);
    const personalNodes: NodeDetail[] = dbManager.getCollection(RealmSchema.NodeConnect);
    return [...defaultNodes, ...personalNodes];
  }

  public static async connectToSelectedNode(selectedNode: NodeDetail) {
    // connects to the selected node(in case of failure, won't have default/private nodes as fallback)
    ElectrumClient.setActivePeer([], [], selectedNode);
    const { connected, connectedTo, error } = await ElectrumClient.connect();
    return { connected, connectedTo, error };
  }

  public static async disconnect(selectedNode: NodeDetail) {
    const activePeer = ElectrumClient.getActivePeer();
    if (selectedNode.host === activePeer?.host && selectedNode.port === activePeer?.port) {
      ElectrumClient.forceDisconnect();
    }
  }

  public static nodeConnectionStatus = (node: NodeDetail) => {
    const activePeer = ElectrumClient.getActivePeer();

    if (
      activePeer?.host === node.host &&
      activePeer?.port === node.port &&
      activePeer?.isConnected
    ) {
      return true;
    }

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
