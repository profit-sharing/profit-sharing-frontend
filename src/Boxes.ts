import {Box, BoxCandidate, ExplorerOutputBox, Register} from "./types";
import {tokens} from "./constants";
import {ApiNetwork} from "./Network";
import {ConfigBox} from "./models";
let ergolib = import('ergo-lib-wasm-browser')

export class Boxes {
    static getConfigBox = async (configBox: ConfigBox,
                                 lockingCount: string,
                                 stakeCount: number,
                                 ticketCount: number):
        Promise<BoxCandidate> => {
        return {
            value: configBox.value,
            ergoTree: configBox.ergoTree,
            assets: [{tokenId: tokens.configNFT, amount: '1', decimals: 0},
                configBox.assets[1],
                {tokenId: tokens.locking, amount: lockingCount, decimals: 0}],
            additionalRegisters: {
                'R4': (await ergolib).Constant.from_i64_str_array(
                    [configBox.checkPoint.toString(),
                        configBox.minErgShare.toString(),
                        configBox.minTokenShare.toString(),
                        ticketCount.toString(),
                        stakeCount.toString(),
                        configBox.fee.toString(),
                        configBox.minTicketValue.toString(),
                        configBox.minBoxVal.toString(),
                    ]
                ).encode_to_base16()},
            creationHeight: await ApiNetwork.getHeight()
        }
    }

    static getTicketBox = async (value: number,
                                 stake: number,
                                 address: Uint8Array,
                                 reservedId: Uint8Array,
                                 r4: string[]):
        Promise<BoxCandidate> => {
        return {
            value: value.toString(),
            ergoTree: await ApiNetwork.getTicketErgoTree(),
            assets: [{tokenId: tokens.locking, amount: '1', decimals: 0},
                {tokenId: tokens.staking, amount: stake.toString(), decimals: 0}],
            additionalRegisters: {
                'R4': (await ergolib).Constant.from_i64_str_array(r4).encode_to_base16(),
                'R5': (await ergolib).Constant.from_byte_array(address).encode_to_base16(),
                'R6': (await ergolib).Constant.from_byte_array(reservedId).encode_to_base16(),
            },
            creationHeight: await ApiNetwork.getHeight()
        }
    }

    static boxFromExplorer = (inputBox: ExplorerOutputBox): Box => {
        let registers: Register = {}
        Object.entries(inputBox.additionalRegisters)
            .forEach(([k, v]) =>{
                registers[k] = v.serializedValue
            })
        return{
            boxId : inputBox.boxId,
            value : inputBox.value.toString(),
            ergoTree : inputBox.ergoTree,
            assets : inputBox.assets.map(tk => {return {tokenId: tk.tokenId, amount: tk.amount.toString()}}),
            creationHeight : inputBox.creationHeight,
            transactionId : inputBox.transactionId,
            index : inputBox.index,
            additionalRegisters : registers
        }
    }
}
