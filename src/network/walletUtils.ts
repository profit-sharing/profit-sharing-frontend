import {Tx, Box, SignedTx, Token} from "../models/types";

declare namespace ergo{
    const get_balance: (token_id: string) => Promise<number>;
    const get_change_address: () => Promise<string>;
    const get_unused_addresses: () => Promise<Array<string>>;
    const get_utxos: (amount: string, token_id: string) => Promise<Array<Box>>;
    const sign_tx: (tx: Tx) => Promise<SignedTx>
    const submit_tx: (signedTx: SignedTx) => Promise<string>
}

const walletDisconnect = (): void => {
    console.log('Disconnected from Yoroi wallet', true)
    localStorage.removeItem('wallet');
}

export const setupWallet = async (isFirst: Boolean = false): Promise<Boolean> =>{
    if (typeof window.ergo_request_read_access === "undefined") {
        console.log('You must install Yoroi-Ergo dApp Connector to be able to connect to Yoroi', true)
    } else {
        if (isFirst) {
            window.removeEventListener("ergo_wallet_disconnected", walletDisconnect);
            window.addEventListener("ergo_wallet_disconnected", walletDisconnect);
        }
        let hasAccess = await window.ergo_check_read_access()
        if (!hasAccess) {
            let granted = await window.ergo_request_read_access()
            if (!granted) {
                if (isFirst) console.log('Wallet access denied', true)
            } else {
                if (isFirst) console.log('Successfully connected to Yoroi')
                return true
            }
        } else return true
    }
    return false
}

export const getWalletBoxes = async (need: { [key: string]: number }): Promise<{boxes: Box[], covered: Boolean, excess: Token[]}> =>{
    let result: Box[] = []
    const keys = Object.keys(need)
    let setup = await setupWallet()
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

export const sendTx = async (unsignedTx: Tx): Promise<string> => {
    let setup = await setupWallet()
    if (setup) {
        let tx = null
        try {
            console.log(unsignedTx)
            tx = await ergo.sign_tx(unsignedTx)
        } catch (e) {
            console.log(e)
            return "Error"
        }
        let txId = await ergo.submit_tx(tx)
        if (txId != null) return txId
    }
    return "Error"
}

export const getWalletAddress = async (): Promise<string> => {
    let setup = await setupWallet()
    if (setup) {
        let result = await ergo.get_change_address()
        return result
    }
    return "Error"
}
