import ElectrumClient from 'src/services/electrum/client';
import { NodeDetail } from 'src/services/wallets/interfaces';
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
      // case: save new node (first 1000 IDs reserved to predefined nodes)
      node.id = nodeList.length + 1001;
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

    dbManager.updateObjectById(RealmSchema.NodeConnect, nodeDetail.id.toString(), {
      ...propsToUpdate,
    });
  }

  public static delete(nodeDetail: NodeDetail) {
    if (!nodeDetail) return null;

    const status: boolean = dbManager.deleteObjectById(
      RealmSchema.NodeConnect,
      nodeDetail.id.toString()
    );
    return status;
  }

  public static getAllNodes(): NodeDetail[] {
    return dbManager.getCollection(RealmSchema.NodeConnect) as unknown as NodeDetail[];
  }

  public static async connectToSelectedNode(selectedNode: NodeDetail) {
    // connects to the selected node
    ElectrumClient.setActivePeer([], selectedNode);
    const { connected, connectedTo, error } = await ElectrumClient.connect();
    return { connected, connectedTo, error };
  }

  public static disconnect(selectedNode: NodeDetail) {
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
