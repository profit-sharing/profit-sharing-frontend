import axios from "axios";
import {Box, ExplorerOutputBox} from "../models/types";
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
    static getBoxWithToken = (token: string, offset: number = 0, limit: number = 100): Promise<{ total: number, boxes: ExplorerOutputBox[]}> => {
        return explorerApi.get(`/api/v1/boxes/unspent/byTokenId/${token}`).then(res => {
            const data = res.data
            return {
                boxes: data.items,
                total: data.total
            }
        })
    }
    static getHeight = async (): Promise<number> => {
        return nodeClient.get("/info").then((info: any) => info.data.fullHeight)
    }

    static getConfigBox = async (config: BaseConfig): Promise<Box> => {
        const expBox: ExplorerOutputBox = Object.assign(await ApiNetwork.getBoxWithToken(config.tokens.configNFT).then(res => res.boxes[0]))
        return Boxes.boxFromExplorer(expBox)
    }

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
        return Boxes.boxFromExplorer(expBoxes[0])
    }

    static getBackendConfig = async (): Promise<BaseConfig> => {
        return Object.assign(backEnd.get('/api/info').then(res => res.data))
    }
}

