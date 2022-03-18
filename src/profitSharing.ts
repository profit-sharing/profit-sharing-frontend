import {getWalletBoxes, getWalletAddress, sendTx} from "./walletUtils";
import {ApiNetwork} from "./Network";
import {ConfigBox} from "./models";
import {tokens} from "./constants";
import {Boxes} from "./Boxes";
import {BoxCandidate, Box} from "./types";
let ergolib = import('ergo-lib-wasm-browser')

export const lockingTx = async (stake: number): Promise<string> => {
    let wasm = await ergolib
    const configBox: ConfigBox = await ApiNetwork.getConfigBox()
    const walletBoxes = await getWalletBoxes({['ERG']: (configBox.minTicketValue + configBox.fee*2),
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
        configBox,
        configBox.assets[2].amount + 1,
        configBox.stakeCount + stake,
        configBox.ticketCount+1
    )
    const ticketBox: BoxCandidate = await Boxes.getTicketBox(
        configBox.minTicketValue,
        stake,
        wasm.Address.from_mainnet_str(userAddress).to_ergo_tree().sigma_serialize_bytes(),
        wasm.BoxId.from_str(configBox.boxId).as_bytes(),
        [configBox.checkPoint, configBox.checkPoint, configBox.fee, configBox.minBoxVal]
    )
    const name = "ErgoProfitSharing, Reserved Token"
    const description = "Reserved token, defining " + stake + "stake amount in the ErgoProfitSharing"
    const totalErg = walletBoxes.boxes.map(box => parseInt(box.value)).reduce((a, b) => a + b)
    const changeBox: BoxCandidate = {
        value: (totalErg - configBox.minTicketValue - configBox.fee).toString(),
        ergoTree: wasm.Address.from_mainnet_str(userAddress).to_ergo_tree().to_base16_bytes(),
        assets: walletBoxes.excess.concat({tokenId: configBox.boxId, amount: '1'}),
        additionalRegisters: {},
        creationHeight: await ApiNetwork.getHeight()
    }
    let x: Box = configBox
    let inputs = [x].concat(walletBoxes.boxes)
    const unsigned = {
        inputs: inputs.map(curIn => {
            return {
                ...curIn,
                extension: {}
            }
        }),
        outputs: [outConfigBox, ],
        dataInputs: [],
    }
    let txId = await sendTx(unsigned)
    if(txId != 'Error') console.log("Staking tokens locked successfully")
    return txId
}

