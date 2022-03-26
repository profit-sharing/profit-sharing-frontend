import {ApiNetwork} from "../network/Network";
import {getEnv} from "./constants";

interface Tokens {
    locking: string,
    staking: string,
    distribution: string,
    configNFT: string
}
interface ErgoTrees {
    config: string,
    ticket:string,
    fee: string,
}

export type BaseConfig = {
    token: Tokens,
    ergoTrees: ErgoTrees,
}

export const createConfig = async () => {
    const backEndData = await ApiNetwork.getBackendConfig()
    console.log("creating config ...")
    console.log(backEndData)
    const resultConfig: BaseConfig = {
        token: {
            locking: await ApiNetwork.getLocking(),
            staking: await ApiNetwork.getStaking(),
            distribution: await ApiNetwork.getDistribution(),
            configNFT: await ApiNetwork.getConfigNFT()
        },
        ergoTrees: {
            fee: getEnv("FEE_ERGO_TREE", "1005040004000e36100204a00b08cd0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798ea02d192a39a8cc7a701730073011001020402d19683030193a38cc7b2a57300000193c2b2a57301007473027303830108cdeeac93b1a57304"),
            config: await ApiNetwork.getConfigErgoTree(),
            ticket: await ApiNetwork.getTicketErgoTree()
        }
    }
    return resultConfig
}


