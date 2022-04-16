import axios from "axios";
import {Box, ExplorerOutputBox, ExplorerTransaction} from "../models/types";
import {Boxes} from "../models/Boxes";
import {BaseConfig, constants} from "../config/configs";

const nodeClient = axios.create({
    baseURL: constants.node,
    timeout: 8000,
    headers: {"Content-Type": "application/json"}
});

const explorerApi = axios.create({
    baseURL: constants.explorerAPI,
    timeout: 8000
})

const backEnd = axios.create({
    baseURL: constants.backendAPI,
    timeout: 8000,
    headers: {"Content-Type": "application/json"}
})

export class ApiNetwork {
    /**
     * Searches the network for boxes with the specified token id
     * @param token, The required token id
     * @param offset, search offset
     * @param limit, search limit
     * @return {total, boxes}: The total number of found boxes, and the boxes
     */
    static getBoxWithToken = (token: string, offset: number = 0, limit: number = 100): Promise<{ total: number, boxes: ExplorerOutputBox[]}> => {
        return explorerApi.get(`/api/v1/boxes/unspent/byTokenId/${token}`).then(res => {
            const data = res.data
            return {
                boxes: data.items,
                total: data.total
            }
        })
    }

    /**
     * Finding all unconfirmed transactions belonging to the specified address
     * @param address The required address
     * @return {total, txs} The total number of unconfirmed transactions, and the transactions
     */
    static getMempoolTransactions = (address: string): Promise<{total: number, txs: ExplorerTransaction}> => {
        try{return explorerApi.get(`/api/v1/mempool/transactions/byAddress/${address}`).then(res => {
            const data = res.data
            return {
                txs: data.items,
                total: data.total
            }
        })}
        catch(e) {throw new Error("not found")}
    }
    /**
     * Searches for a confirmed tx with the specified txId
     * @param txId, the requested txId
     */
    static getConfirmedTx = (txId: string): Promise<ExplorerTransaction | null> => {
        return explorerApi.get(`/api/v1/transactions/${txId}`).then(res => {
            return res.data
        }).catch(e => null)
    }
    /**
     * Searches for a unconfirmed tx with the specified txId
     * @param txId, the requested txId
     */
    static getUnconfirmedTx = (txId: string): Promise<ExplorerTransaction | null> => {
        return explorerApi.get(`/api/v0/transactions/unconfirmed/${txId}`).then(res => {
            return res.data
        }).catch(e => null)
    }
    /**
     * Returns the confirmation count of a transaction
     * @param txId, the requested txId
     * @return -1: Doesn't exist, 0: In mempool, >1: confirmation count
     */
    static getConfNum = async (txId: string): Promise<number> => {
        const tx = await ApiNetwork.getUnconfirmedTx(txId)
        if(tx !== null) return 0
        else {
            const confirmed = await ApiNetwork.getConfirmedTx(txId)
            if (confirmed != null && confirmed.hasOwnProperty('numConfirmations')) return confirmed.numConfirmations
            else return -1
        }
    }

    /**
     * @return the current network height
     */
    static getHeight = async (): Promise<number> => {
        return nodeClient.get("/info").then((info: any) => info.data.fullHeight)
    }

    /**
     * searches for the last config box available in the network (Considers the mempool)
     * @param config, service config that stores the special token ids
     */
    static getConfigBox = async (config: BaseConfig): Promise<Box> => {
        const expBox: ExplorerOutputBox = Object.assign(await ApiNetwork.getBoxWithToken(config.tokens.configNFT).then(res => res.boxes[0]))
        return Boxes.boxFromExplorer(await ApiNetwork.findLastMempoolBox(expBox))
    }

    /**
     * Searches the network to find the last box of self-replicating box in the mempool
     * @param box, the unspent box to start the search
     * @return The last box with the same address of input box
     */
    static findLastMempoolBox = async (box: ExplorerOutputBox): Promise<ExplorerOutputBox> => {
        const mempoolTxs: ExplorerTransaction[] = Object.assign(await ApiNetwork.getMempoolTransactions(box.address).then(res => res.txs))
        let id = box.boxId
        let result: ExplorerOutputBox = box
        let nextIndex = mempoolTxs.findIndex(tx => tx.inputs.findIndex(bx => bx.boxId === id) !== -1)
        while(nextIndex !== -1){
            if(mempoolTxs[nextIndex].outputs.findIndex(bx => bx.address === box.address) !== -1) {
                result = mempoolTxs[nextIndex].outputs.find(bx => bx.address === box.address)!
                id = result.boxId
            } else break
            nextIndex = mempoolTxs.findIndex(tx => tx.inputs.findIndex(bx => bx.boxId === id) !== -1)
        }
        return result
    }

    /**
     * searches for the last ticket box available in the network with the required token (Considers the mempool)
     * @param reservedToken, The ticket identifier
     * @param config, service config that stores the special token ids
     */
    static getTicketBox = async (reservedToken: string, config: BaseConfig): Promise<Box> => {
        const ticketFilter = (ticketBox: ExplorerOutputBox) => {
            return ticketBox.assets[0].tokenId === config.tokens.locking &&
                ticketBox.additionalRegisters['R6'].renderedValue === reservedToken
        }
        let expBoxes: ExplorerOutputBox[] = []
        let offset = 0
        while(expBoxes.length === 0){
            const output = await ApiNetwork.getBoxWithToken(config.tokens.locking, offset, 100)
            if(output.total === 0) {
                throw new Error("[profit-sharing] ticket with specified reserved token not found")
            }
            expBoxes = Object.assign(output.boxes).filter(ticketFilter)
            offset += 100
        }
        return Boxes.boxFromExplorer(await ApiNetwork.findLastMempoolBox(expBoxes[0]))
    }

    /**
     * Gets the backend config consists of the service special token ids, and ergoTrees
     */
    static getBackendConfig = async (): Promise<BaseConfig> => {
        return Object.assign(backEnd.get('/api/info').then(res => res.data))
    }
}

