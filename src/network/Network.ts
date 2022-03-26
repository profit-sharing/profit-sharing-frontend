import axios from "axios";
import {Box, ExplorerOutputBox} from "../models/types";
import {Boxes} from "../models/Boxes";
import {constants} from "../config/constants";
import {BaseConfig} from "../config/configs";

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
    baseURL: constants.backEndAPI,
    timeout: 8000
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

    static getConfigBox = async (): Promise<Box> => {
        const expBox: ExplorerOutputBox = Object.assign(await ApiNetwork.getBoxWithToken(window.config.token.configNFT).then(res => res.boxes[0]))
        return Boxes.boxFromExplorer(expBox)
    }

    static getTicketBox = async (reservedToken: string): Promise<Box> => {
        const expBox: ExplorerOutputBox = Object.assign(await ApiNetwork.getBoxWithToken(reservedToken).then(res => res.boxes[0]))
        return Boxes.boxFromExplorer(expBox)
    }

    static getBackendConfig = async (): Promise<void> => {
        return Object.assign(backEnd.get('/api/info').then(res => res.data))
    }

    static getTicketErgoTree = async (): Promise<string> => {
        return backEnd.get('/api/info').then(res => res.data.ergoTrees.ticket)
    }
    static getConfigErgoTree = async (): Promise<string> => {
        return backEnd.get('/api/info').then(res => res.data.ergoTrees.config)
    }
    static getConfigNFT = async (): Promise<string> => {
        return backEnd.get('/api/info').then(res => res.data.tokens.configNFT)
    }
    static getDistribution = async (): Promise<string> => {
        return backEnd.get('/api/info').then(res => res.data.tokens.distribution)
    }
    static getLocking = async (): Promise<string> => {
        return backEnd.get('/api/info').then(res => res.data.tokens.locking)
    }
    static getStaking = async (): Promise<string> => {
        return backEnd.get('/api/info').then(res => res.data.tokens.staking)
    }
}

