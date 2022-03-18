import {BoxCandidate} from "./types";
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
                ['R4']: (await ergolib).Constant.from_i32_array(Int32Array.from(
                    [configBox.checkPoint,
                        configBox.minErgShare,
                        configBox.minTokenShare,
                        ticketCount,
                        stakeCount,
                        configBox.fee,
                        configBox.minTicketValue,
                        configBox.minBoxVal,
                    ]
                )).encode_to_base16()},
            creationHeight: await ApiNetwork.getHeight()
        }
    }

    static getTicketBox = async (value: number,
                                 stake: number,
                                 address: Uint8Array,
                                 reservedId: Uint8Array,
                                 r4: number[]):
        Promise<BoxCandidate> => {
        return {
            value: value.toString(),
            ergoTree: await ApiNetwork.getTicketErgoTree(),
            assets: [{tokenId: tokens.locking, amount: '1', decimals: 0},
                {tokenId: tokens.staking, amount: stake.toString(), decimals: 0}],
            additionalRegisters: {
                ['R4']: (await ergolib).Constant.from_i32_array(Int32Array.from(r4)).encode_to_base16(),
                ['R5']: (await ergolib).Constant.from_byte_array(address).encode_to_base16(),
                ['R6']: (await ergolib).Constant.from_byte_array(reservedId).encode_to_base16(),
            },
            creationHeight: await ApiNetwork.getHeight()
        }
    }
}
