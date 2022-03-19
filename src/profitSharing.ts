import {getWalletBoxes, getWalletAddress, sendTx} from "./walletUtils";
import {ApiNetwork} from "./Network";
import {ConfigBox} from "./models";
import {tokens} from "./constants";
import {Boxes} from "./Boxes";
import {BoxCandidate, Box} from "./types";
let ergolib = import('ergo-lib-wasm-browser')

export const lockingTx = async (stake: number): Promise<string> => {
    let wasm = await ergolib
    const configBox: Box = await ApiNetwork.getConfigBox()
    const configBoxInfo: ConfigBox = new ConfigBox(configBox)
    await configBoxInfo.setup()
    const walletBoxes = await getWalletBoxes({['ERG']: (configBoxInfo.minTicketValue + configBoxInfo.fee*2),
        [tokens.staking]: stake})
    if(!walletBoxes.covered) {
        console.log('Not enough fund for locking')
        return "Not enough fund"
    }
    const userAddress = await getWalletAddress()
    if(userAddress == "Error") {
        console.log('Wallet connection failed')
        return "Wallet connection failed"
    }

    const outConfigBox: BoxCandidate = await Boxes.getConfigBox(
        configBoxInfo,
        (parseInt(configBoxInfo.assets[2].amount) - 1).toString(),
        configBoxInfo.stakeCount + stake,
        configBoxInfo.ticketCount+1
    )
    const ticketBox: BoxCandidate = await Boxes.getTicketBox(
        configBoxInfo.minTicketValue,
        stake,
        wasm.Address.from_mainnet_str(userAddress).to_ergo_tree().sigma_serialize_bytes(),
        wasm.BoxId.from_str(configBoxInfo.boxId).as_bytes(),
        [configBoxInfo.checkPoint, configBoxInfo.checkPoint, configBoxInfo.fee, configBoxInfo.minBoxVal]
    )
    const name = "ErgoProfitSharing, Reserved Token"
    const description = "Reserved token, defining " + stake + "stake amount in the ErgoProfitSharing"
    const totalErg = walletBoxes.boxes.map(box => parseInt(box.value)).reduce((a, b) => a + b)
    const changeBox: BoxCandidate = {
        value: (totalErg - configBoxInfo.minTicketValue - configBoxInfo.fee).toString(),
        ergoTree: wasm.Address.from_mainnet_str(userAddress).to_ergo_tree().to_base16_bytes(),
        assets: [{tokenId: configBox.boxId, amount: '1'}].concat(walletBoxes.excess),
        additionalRegisters: {
            "R4": new Buffer(name, 'utf-8').toString(),
            "R5": new Buffer(description, 'utf-8').toString(),
            "R6": new Buffer("0", 'utf-8').toString()},
        creationHeight: await ApiNetwork.getHeight()
    }
    let inputs = [configBox].concat(walletBoxes.boxes)
    const unsigned = {
        inputs: inputs.map(curIn => {
            return {
                ...curIn,
                extension: {}
            }
        }),
        outputs: [outConfigBox, ticketBox, changeBox],
        dataInputs: [],
    }
    let txId = await sendTx(unsigned)
    if(txId != 'Error') console.log("Staking tokens locked successfully")
    return txId
}

