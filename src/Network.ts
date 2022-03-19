
import axios from "axios";
import {config, tokens} from "./constants";
import {Box, ExplorerOutputBox} from "./types";
import {Boxes} from "./Boxes";

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
    timeout: 8000,
    headers: {"Access-Control-Allow-Origin": "*"}
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
        const expBox: ExplorerOutputBox = Object.assign(await ApiNetwork.getBoxWithToken(tokens.configNFT).then(res => res.boxes[0]))
        return Boxes.boxFromExplorer(expBox)
    }

    static getTicketBox = async (reservedToken: string): Promise<Box> => {
        const expBox: ExplorerOutputBox = Object.assign(await ApiNetwork.getBoxWithToken(reservedToken).then(res => res.boxes[0]))
        return Boxes.boxFromExplorer(expBox)
    }

    static getTicketErgoTree = async (): Promise<string> => {
        // TODO: CORS problem
        // return backEnd.get('/api/ergotree').then(res => res.data.ticketErgoTree)
        return "101f0404040604060400040004000402040204020402040204040e202be1809d0e914e31f90b86eeb567e286c1a5484de18d10e986f15e16183c0f220400040004020402050204040406040004000402040204000402040004000e20fc3d9aae301593d1d6b61994316b2cc911f6fb75cdb175e1a040126e720341d404040400d804d601e4c6a70411d602e4c6a7060ed603b27201730000d604b27201730100958fb1a47302d805d605b2a5730300d606db63087205d6078cb2720673040001d608db6308a7d6098cb2720873050001959372077209d802d60ab27206730600d60bb27208730700d19683060193e4c672050411720193e4c67205060e720291c17205c1a7938c720a018c720b01938c720a028c720b0293c27205c2a7d807d60ab2a5730800d60be4c6720a0411d60cdb6308720ad60db2720c730900d60eb27208730a00d60f8c720e02d610b2a5730b00d196830d01937207730c93b2720b730d00b27201730e0090b2720b730f009ab27201731000731193b2720b731200720393b2720b731300720493e4c6720a060e720293c1720a9999c1a772037204938cb2720c731400017209938c720d018c720e01938c720d02720f93c2720ac2a793c27210e4c6a7050e93c172109a9c720fb2e4c6b2a473150004117316007204d802d605b2db6308b2a5731700731800d606b2db6308a7731900d196830401938cb2db6308b2a4731a00731b0001731c938cb2db6308b2a4731d00731e00017202938c7205018c720601938c7205028c720602"
    }
}

