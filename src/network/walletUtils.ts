import {Tx, Box, SignedTx, Token} from "../models/types";

export declare namespace ergo{
    let get_balance: (token_id: string) => Promise<number>;
    let get_change_address: () => Promise<string>;
    let get_unused_addresses: () => Promise<Array<string>>;
    let get_utxos: (amount: string, token_id: string) => Promise<Array<Box>>;
    let sign_tx: (tx: Tx) => Promise<SignedTx>
    let submit_tx: (signedTx: SignedTx) => Promise<string>
}

export class WalletUtils{
    static setupWallet = async (): Promise<Boolean> =>{
        if (typeof window.ergo_request_read_access === "undefined") {
            console.log('[profit-sharing] You must install Ergo-wallet dApp Connector to be able to connect to your wallet')
        } else {
            let hasAccess = await window.ergo_check_read_access()
            if (!hasAccess) {
                let granted = await window.ergo_request_read_access()
                if (!granted) {
                    console.log('[profit-sharing] Wallet access denied')
                } else {
                    console.log('[profit-sharing] Successfully connected to Wallet')
                    return true
                }
            } else return true
        }
        return false
    }

    static getWalletBoxes = async (need: { [key: string]: number }): Promise<{boxes: Box[], covered: Boolean, excess: Token[]}> =>{
        let result: Box[] = []
        const keys = Object.keys(need)
        let setup = await WalletUtils.setupWallet()
        let covered: Boolean = true
        if (setup) {
            for (let i = 0; i < keys.length; i++) {
                if (need[keys[i]] <= 0) continue
                const curIns = await ergo.get_utxos(need[keys[i]].toString(), keys[i]);
                if (curIns !== undefined) {
                    curIns.forEach(bx => {
                        need['ERG'] -= parseInt(bx.value)
                        bx.assets.forEach(ass => {
                            if (!Object.keys(need).includes(ass.tokenId)) need[ass.tokenId] = 0
                            need[ass.tokenId] -= parseInt(ass.amount)
                        })
                    })
                    result = result.concat(curIns)
                }
                if (need[keys[i]] > 0) covered = false
            }
        }
        return {
            boxes: result,
            covered: covered,
            excess: Object.keys(need).filter(key => key !== 'ERG')
                .filter(key => need[key] < 0)
                .map(key => {
                    return {
                        tokenId: key,
                        amount: (-need[key]).toString(),
                    }
                })
        }
    }

    static sendTx = async (unsignedTx: Tx): Promise<string> => {
        let setup = await WalletUtils.setupWallet()
        if (setup) {
            let tx = null
            try {
                tx = await ergo.sign_tx(unsignedTx)
            } catch (e) {
                console.log("[profit-sharing] wallet error: " + e.info)
                return "Error"
            }
            let txId = await ergo.submit_tx(tx)
            if (txId != null) return txId
        }
        return "Error"
    }

    static getWalletAddress = async (): Promise<string> => {
        let setup = await WalletUtils.setupWallet()
        if (setup) {
            let result = await ergo.get_change_address()
            return result
        }
        return "Error"
    }
}
