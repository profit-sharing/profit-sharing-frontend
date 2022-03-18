
import axios from "axios";
import {config, tokens} from "./constants";
import {Box, ExplorerOutputBox} from "./types";
import {BoxImpl, ConfigBox} from "./models";

const nodeClient = axios.create({
    baseURL: config.nodeUrl,
    timeout: 8000,
    headers: {"Content-Type": "application/json"}
});

const explorerApi = axios.create({
    baseURL: config.explorerApi,
    timeout: 8000
})

const backEnd = axios.create({
    baseURL: config.backEnd,
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

    static getConfigBox = async (): Promise<ConfigBox> => {
        const x = await ApiNetwork.getBoxWithToken(tokens.configNFT).then(res => res.boxes[0])
        console.log(x)
        const expBox: ExplorerOutputBox = Object.assign(await ApiNetwork.getBoxWithToken(tokens.configNFT).then(res => res.boxes[0]))
        const box = new BoxImpl().from_json(expBox)
        let configBox = new ConfigBox(box)
        await configBox.setup(box)
        return configBox
    }

    // static getTicketBox = async (reservedToken: string): Promise<Box> => {
    //     return Object.assign(await ApiNetwork.getBoxWithToken(reservedToken).then(res => res.boxes[0]))
    // }

    static getConfigErgoTree = async (): Promise<string> => {
        return backEnd.get('/api/ergotree').then(res => res.data.configErgoTree)
    }
    static getTicketErgoTree = async (): Promise<string> => {
        return backEnd.get('/api/ergotree').then(res => res.data.ticketErgoTree)
    }
}

