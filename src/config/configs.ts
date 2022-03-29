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
    tokens: Tokens,
    ergoTrees: ErgoTrees,
}

export const constants = {
    txFee: 1100000,
    node : "http://10.10.9.3:9064",
    explorerAPI : "http://10.10.9.3:7000",
    backendAPI : "http://localhost:9000"
}

