import * as dotenv from 'dotenv';
let ergolib = import('ergo-lib-wasm-browser')

type BaseConstant = {
    node: string,
    explorerAPI: string,
    backEndAPI: string,
    txFee: Number,
}


const conf = dotenv.config().parsed
export const getEnv = (key: string, fallback: string): string => {
    if(conf) {
        if (conf.hasOwnProperty(key)) {
            return conf[key]
        }
    }
    return fallback
}

const createConstants = () => {
    const result: BaseConstant = {
        node: getEnv("ERGO-NODE", "http://213.239.193.208:9053"),
        explorerAPI: getEnv("EXPLORER_API", "https://api.ergoplatform.com"),
        backEndAPI: getEnv("BACKEND_API", "http://localhost:9000"),
        txFee: parseInt(getEnv("FEE", "1100000"))
    }
    return result
}

export const constants = createConstants()
