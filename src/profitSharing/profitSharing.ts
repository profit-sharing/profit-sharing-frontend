import {getWalletBoxes, getWalletAddress, sendTx} from "../network/walletUtils";
import {ApiNetwork} from "../network/Network";
import {ConfigBox} from "../models/models";
import {Boxes} from "../models/Boxes";
import {BoxCandidate, Box} from "../models/types";
import {BaseConfig} from "../config/configs";
let ergolib = import('ergo-lib-wasm-browser')

export const lockingTx = async (stake: number, config: BaseConfig): Promise<string> => {
    let wasm = await ergolib
    const configBox: Box = await ApiNetwork.getConfigBox(config)
    const configBoxInfo: ConfigBox = new ConfigBox(configBox)
    await configBoxInfo.setup()
    const walletBoxes = await getWalletBoxes({'ERG': (configBoxInfo.minTicketValue + configBoxInfo.fee*2),
        [config.tokens.staking]: stake})
    if(!walletBoxes.covered) {
        console.log('[profit-sharing] Not enough fund for locking')
        return "Not enough fund"
    }
    const userAddress = await getWalletAddress()
    if(userAddress === "Error") {
        console.log('[profit-sharing] Wallet connection failed')
        return "Wallet connection failed"
    }

    const outConfigBox: BoxCandidate = await Boxes.getConfigBox(
        configBoxInfo,
        (parseInt(configBoxInfo.assets[2].amount) - 1).toString(),
        configBoxInfo.stakeCount + stake,
        configBoxInfo.ticketCount+1,
        config
    )
    const ticketBox: BoxCandidate = await Boxes.getTicketBox(
        configBoxInfo.minTicketValue,
        stake,
        wasm.Address.from_mainnet_str(userAddress).to_ergo_tree().sigma_serialize_bytes(),
        wasm.BoxId.from_str(configBoxInfo.boxId).as_bytes(),
        [configBoxInfo.checkPoint.toString(), configBoxInfo.checkPoint.toString(), configBoxInfo.fee.toString(), configBoxInfo.minBoxVal.toString()],
        config
    )
    // TODO: Add name and description to reserved token
    const totalErg = walletBoxes.boxes.map(box => parseInt(box.value)).reduce((a, b) => a + b)
    const changeBox: BoxCandidate = {
        value: (totalErg - configBoxInfo.minTicketValue - configBoxInfo.fee).toString(),
        ergoTree: wasm.Address.from_mainnet_str(userAddress).to_ergo_tree().to_base16_bytes(),
        assets: [{tokenId: configBox.boxId, amount: '1'}].concat(walletBoxes.excess),
        additionalRegisters: {},
        creationHeight: await ApiNetwork.getHeight()
    }
    const feeBox: BoxCandidate = {
        value: configBoxInfo.fee.toString(),
        creationHeight: await ApiNetwork.getHeight(),
        ergoTree: config.ergoTrees.fee,
        assets: [],
        additionalRegisters: {},
    }
    let inputs = [configBox].concat(walletBoxes.boxes)
    const unsigned = {
        inputs: inputs.map(curIn => {
            return {
                ...curIn,
                extension: {}
            }
        }),
        outputs: [outConfigBox, ticketBox, changeBox, feeBox],
        dataInputs: [],
    }
    let txId = await sendTx(unsigned)
    if(txId !== 'Error') console.log("[profit-sharing] Staking tokens locked successfully")
    return txId
}
