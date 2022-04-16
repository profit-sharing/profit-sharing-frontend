import {getWalletBoxes, getWalletAddress, sendTx} from "../network/walletUtils";
import {ApiNetwork} from "../network/Network";
import {ConfigBox,TicketBox} from "../models/models";
import {Boxes} from "../models/Boxes";
import {BoxCandidate, Box} from "../models/types";
import {BaseConfig} from "../config/configs";
import * as wasm from 'ergo-lib-wasm-browser';

export const lockingTx = async (stake: number, config: BaseConfig): Promise<string> => {
    const configBox: Box = await ApiNetwork.getConfigBox(config)
    const configBoxInfo: ConfigBox = new ConfigBox(configBox)
    await configBoxInfo.setup()
    const walletBoxes = await getWalletBoxes({
        'ERG': (configBoxInfo.minTicketValue + configBoxInfo.fee * 2),
        [config.tokens.staking]: stake
    })
    if (!walletBoxes.covered) {
        console.log('[profit-sharing] Not enough fund for locking')
        return "Error"
    }
    const userAddress = await getWalletAddress()
    if (userAddress === "Error") {
        console.log('[profit-sharing] Wallet connection failed')
        return "Error"
    }

    const outConfigBox: BoxCandidate = await Boxes.getConfigBox(
        configBoxInfo,
        (parseInt(configBoxInfo.assets[2].amount) - 1).toString(),
        configBoxInfo.stakeCount + stake,
        configBoxInfo.ticketCount + 1,
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
    const name = "ErgoProfitSharing, Reserved Token :" + stake + " stake"
    const description = "Reserved token, defining" + stake + "stake amount in the ErgoProfitSharing"
    const totalErg = walletBoxes.boxes.map(box => parseInt(box.value)).reduce((a, b) => a + b)
    const changeBox: BoxCandidate = {
            value: (totalErg - configBoxInfo.minTicketValue - configBoxInfo.fee).toString(),
            ergoTree: wasm.Address.from_mainnet_str(userAddress).to_ergo_tree().to_base16_bytes(),
            assets: [{tokenId: configBox.boxId, amount: '1'}].concat(walletBoxes.excess),
            additionalRegisters: {
                'R4': wasm.Constant.from_byte_array(Buffer.from(name)).encode_to_base16(),
                'R5': wasm.Constant.from_byte_array(Buffer.from(description)).encode_to_base16(),
                'R6': wasm.Constant.from_byte_array(Buffer.from("0")).encode_to_base16()
            },
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

export const chargingTx = async (reservedToken: string, chargeAmount: number, config: BaseConfig) => {
    let ticketBox: Box;
    try {
        ticketBox = await ApiNetwork.getTicketBox(reservedToken, config)
    } catch (e){
        console.log(e.info)
        return "Error"
    }
    const ticketBoxInfo: TicketBox = new TicketBox(ticketBox)
    await ticketBoxInfo.setup()
    const walletBoxes = await getWalletBoxes({'ERG': (chargeAmount + ticketBoxInfo.fee)})
    if(!walletBoxes.covered) {
        console.log('[profit-sharing] Not enough fund for locking')
        return "Error"
    }
    const changeAddress = await getWalletAddress()
    if(changeAddress === "Error") {
        console.log('[profit-sharing] Wallet connection failed')
        return "Error"
    }

    const outTicketBox: BoxCandidate = await Boxes.getTicketBox(
        parseInt(ticketBoxInfo.value) + chargeAmount,
        ticketBoxInfo.stake,
        ticketBoxInfo.addressErgoTree,
        wasm.BoxId.from_str(ticketBoxInfo.reservedToken).as_bytes(),
        [ticketBoxInfo.initialCheckPoint.toString(), ticketBoxInfo.checkPoint.toString(), ticketBoxInfo.fee.toString(), ticketBoxInfo.minBoxVal.toString()],
        config
    )
    const totalErg = walletBoxes.boxes.map(box => parseInt(box.value)).reduce((a, b) => a + b)
    const changeBox: BoxCandidate = {
        value: (totalErg - chargeAmount - ticketBoxInfo.fee).toString(),
        ergoTree: wasm.Address.from_mainnet_str(changeAddress).to_ergo_tree().to_base16_bytes(),
        assets: walletBoxes.excess,
        additionalRegisters: {},
        creationHeight: await ApiNetwork.getHeight()
    }
    const feeBox: BoxCandidate = {
        value: ticketBoxInfo.fee.toString(),
        creationHeight: await ApiNetwork.getHeight(),
        ergoTree: config.ergoTrees.fee,
        assets: [],
        additionalRegisters: {},
    }
    let inputs = [ticketBox].concat(walletBoxes.boxes)
    const unsigned = {
        inputs: inputs.map(curIn => {
            return {
                ...curIn,
                extension: {}
            }
        }),
        outputs: [outTicketBox, changeBox, feeBox],
        dataInputs: [],
    }
    let txId = await sendTx(unsigned)
    if(txId !== 'Error') console.log("[profit-sharing] Ticket charged successfully")
    return txId
}

export const unlockingTx = async (reservedToken: string, config: BaseConfig) => {
    let ticketBox: Box;
    try {
        ticketBox = await ApiNetwork.getTicketBox(reservedToken, config)
    } catch (e){
        console.log(e.info)
        return "Error"
    }
    const ticketBoxInfo: TicketBox = new TicketBox(ticketBox)
    await ticketBoxInfo.setup()
    const configBox: Box = await ApiNetwork.getConfigBox(config)
    const configBoxInfo: ConfigBox = new ConfigBox(configBox)
    await configBoxInfo.setup()
    const walletBoxes = await getWalletBoxes({[reservedToken]: 1})
    if(!walletBoxes.covered) {
        console.log('[profit-sharing] Not enough fund for locking')
        return "Error"
    }
    const changeAddress = await getWalletAddress()
    if(changeAddress === "Error") {
        console.log('[profit-sharing] Wallet connection failed')
        return "Error"
    }
    const outConfigBox: BoxCandidate = await Boxes.getConfigBox(
        configBoxInfo,
        (parseInt(configBoxInfo.assets[2].amount) + 1).toString(),
        configBoxInfo.stakeCount - ticketBoxInfo.stake,
        configBoxInfo.ticketCount - 1,
        config
    )
    const totalErg = walletBoxes.boxes.map(box => parseInt(box.value)).reduce((a, b) => a + b)
    const changeBox: BoxCandidate = {
        value: (parseInt(ticketBoxInfo.value) + totalErg - ticketBoxInfo.fee).toString(),
        ergoTree: wasm.Address.from_mainnet_str(changeAddress).to_ergo_tree().to_base16_bytes(),
        assets: [{tokenId: config.tokens.staking, amount: ticketBoxInfo.stake.toString()}].concat(walletBoxes.excess),
        additionalRegisters: {},
        creationHeight: await ApiNetwork.getHeight()
    }
    const feeBox: BoxCandidate = {
        value: ticketBoxInfo.fee.toString(),
        creationHeight: await ApiNetwork.getHeight(),
        ergoTree: config.ergoTrees.fee,
        assets: [],
        additionalRegisters: {},
    }
    let inputs = [configBox, ticketBox].concat(walletBoxes.boxes)
    const unsigned = {
        inputs: inputs.map(curIn => {
            return {
                ...curIn,
                extension: {}
            }
        }),
        outputs: [outConfigBox, changeBox, feeBox],
        dataInputs: [],
    }
    let txId = await sendTx(unsigned)
    if(txId !== 'Error') console.log("[profit-sharing] Staking tokens unlocked successfully")
    return txId
}
