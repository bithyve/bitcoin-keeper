import ElectrumClient from "src/core/services/electrum/client";
import { NodeDetail } from "src/core/wallets/interfaces";
import dbManager from "src/storage/realm/dbManager";
import { RealmSchema } from "src/storage/realm/enum";
import { updateAppImageWorker } from "src/store/sagas/bhr";

export default class Node {
    public static async connect(selectedNode, nodeList) {
        const node = { ...selectedNode };
        let isElectrumClientConnected = false;
        let activePeer = null;
        const isValidNode = await ElectrumClient.testConnection(node.host, node.useSSL ? null : node.port, node.useSSL ? node.port : null);
        if (isValidNode) {
            node.isConnected = true;
            ElectrumClient.setActivePeer(nodeList, node);
            await ElectrumClient.connect();
            isElectrumClientConnected = await ElectrumClient.ping();
        } else {
            ElectrumClient.setActivePeer([]);
            await ElectrumClient.connect();
        }

        activePeer = ElectrumClient.getActivePeer();
        if (
            isElectrumClientConnected &&
            node.host === activePeer?.host &&
            (node.port === activePeer?.ssl || node.port === activePeer?.tcp)
        ) {
            node.isConnected = true;
        } else {
            node.isConnected = false;
        }
        return node;
    }

    public static async connectToDefaultNode() {
        ElectrumClient.setActivePeer([]);
        await ElectrumClient.connect();
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

        let node = { ...nodeDetail };
        if (node.id === null) {
            node.id = nodeList.length + 1;
            dbManager.createObject(RealmSchema.NodeConnect, node);
        } else {
            dbManager.updateObjectById(RealmSchema.NodeConnect, node.id.toString(), {
                host: node.host,
                port: node.port,
                useSSL: node.useSSL,
                useKeeperNode: node.useKeeperNode,
                isConnected: node.isConnected
            });
        }

        console.log("update app image worker");
        updateAppImageWorker(null);
        console.log("app image worker updated");

        const nodes = Node.getNodes();
        if (node.id !== null && node.isConnected) {
            node = await Node.connect(node, nodes);
        }

        return { nodes, node };
    }

    public static update(id: string, propsToUpdate: any) {
        if (id === null) return;
        dbManager.updateObjectById(RealmSchema.NodeConnect, id.toString(), { ...propsToUpdate });
        console.log("update app image worker");
        updateAppImageWorker(null);
        console.log("app image worker updated");
    }

    public static delete(id) {
        const status: boolean = dbManager.deleteObjectById(RealmSchema.NodeConnect, id.toString());
        console.log("update app image worker");
        updateAppImageWorker(null);
        console.log("app image worker updated"); return status;
    }

    public static getModalParams(selectedNodeItem) {
        return {
            id: selectedNodeItem?.id || null,
            host: selectedNodeItem?.host || null,
            port: selectedNodeItem?.port || null,
            useKeeperNode: selectedNodeItem?.useKeeperNode || false,
            isConnected: selectedNodeItem?.isConnected || false,
            useSSL: selectedNodeItem?.useSSL || false
        }
    }

    public static nodeConnectionStatus = (node: any) => {
        const activePeer = ElectrumClient.getActivePeer();
        if (
            activePeer?.host === node.host &&
            (activePeer?.ssl === node.port || activePeer?.tcp === node.port)
            && node.isConnected
        ) {
            return true;
        }
        return false;
    };
}