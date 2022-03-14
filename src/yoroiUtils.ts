import {Tx, Box, SignedTx} from "./types"

declare global {
    interface Window {
        ergo_request_read_access: () => Promise<Boolean>;
        ergo_check_read_access: () => Promise<Boolean>;
    }
}

declare namespace ergo{
    const get_balance: (token_id: string) => Promise<number>;
    const get_change_address: () => Promise<string>;
    const get_unused_addresses: () => Promise<Array<string>>;
    const get_utxos: (amount: string, token_id: string) => Promise<Array<Box>>;
    const sign_tx: (tx: Tx) => Promise<SignedTx>
    const submit_tx: (signedTx: SignedTx) => Promise<string>
}

const yoroiDisconnect = (): void => {
    console.log('Disconnected from Yoroi wallet', true)
    localStorage.removeItem('wallet');
}

export const setupYoroi = async (isFirst: Boolean = false): Promise<Boolean> =>{
    if (typeof window.ergo_request_read_access === "undefined") {
        console.log('You must install Yoroi-Ergo dApp Connector to be able to connect to Yoroi', true)
    } else {
        if (isFirst) {
            window.removeEventListener("ergo_wallet_disconnected", yoroiDisconnect);
            window.addEventListener("ergo_wallet_disconnected", yoroiDisconnect);
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

export const getBoxes = async (need: { [key: string]: number }) =>{
    let result: Box[] = []
    const keys = Object.keys(need)
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
    }
    return result
}

export const sendTx = async (unsignedTx: Tx): Promise<string> => {
    let tx = null
    try {
        tx = await ergo.sign_tx(unsignedTx)
    } catch (e) {
        console.log('Error while sending funds from Yoroi!', true)
        return "Error"
    }
    let txId = await ergo.submit_tx(tx)
    if(txId != null) return txId
    return "Error"
}
