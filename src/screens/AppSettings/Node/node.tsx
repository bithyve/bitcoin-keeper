import ElectrumClient from 'src/core/services/electrum/client';
import { NodeDetail } from 'src/core/wallets/interfaces';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';

export default class Node {
  public static async connect(selectedNode: NodeDetail) {
    const node = { ...selectedNode };

    ElectrumClient.setActivePeer([], node);
    const { connected } = await ElectrumClient.connect();

    const activePeer = ElectrumClient.getActivePeer();
    if (
      connected &&
      node.host === activePeer?.host &&
      (node.port === activePeer?.ssl || node.port === activePeer?.tcp)
    )
      node.isConnected = true;
    else node.isConnected = false;

    return node;
  }

  public static async disconnect(selectedNode: NodeDetail) {
    const activePeer = ElectrumClient.getActivePeer();
    if (
      selectedNode.host === activePeer?.host &&
      (selectedNode.port === activePeer?.ssl || selectedNode.port === activePeer?.tcp)
    )
      ElectrumClient.forceDisconnect();
  }

  public static getNodes(): NodeDetail[] {
    const nodes: NodeDetail[] = dbManager.getCollection(RealmSchema.NodeConnect);
    return nodes;
  }

  public static async save(nodeDetail: NodeDetail, nodeList: NodeDetail[]) {
    if (
      nodeDetail.host === null ||
      nodeDetail.host.length === 0 ||
      nodeDetail.port === null ||
      nodeDetail.port.length === 0
    )
      return null;

    const node = { ...nodeDetail };
    if (node.id === null) {
      node.id = nodeList.length + 1;
      dbManager.createObject(RealmSchema.NodeConnect, node);
    } else {
      dbManager.updateObjectById(RealmSchema.NodeConnect, node.id.toString(), {
        host: node.host,
        port: node.port,
        useSSL: node.useSSL,
        useKeeperNode: node.useKeeperNode,
        isConnected: node.isConnected,
      });
    }

    const nodes = Node.getNodes();
    return { nodes, node };
  }

  public static update(id: string, propsToUpdate: any) {
    if (id === null) return;
    dbManager.updateObjectById(RealmSchema.NodeConnect, id.toString(), { ...propsToUpdate });
  }

  public static delete(id) {
    const status: boolean = dbManager.deleteObjectById(RealmSchema.NodeConnect, id.toString());
    return status;
  }

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

  public static nodeConnectionStatus = (node: any) => {
    const activePeer = ElectrumClient.getActivePeer();
    if (
      activePeer?.host === node.host &&
      (activePeer?.ssl === node.port || activePeer?.tcp === node.port) &&
      node.isConnected
    )
      return true;

    return false;
  };
}
