import {lockingTx} from "../../profitSharing/profitSharing";
import {WalletUtils} from "../../network/walletUtils";
import {ApiNetwork} from "../../network/Network";
import {Tx, Box} from "../../models/types";
import {BaseConfig} from "../../config/configs";

const backConfig = require('../dataset/backConfig.json')
const configBox = require('../dataset/configBox.json')
const ergUtxo = require('../dataset/ergUtxo.json');

const txId = "f3b22a1e7cf50a0e479265025288a761f226c46850794ec37d7d46469a1cbdba"
const address = "9fmJR3EPK75tu9D3d4D9gf7McZ5Lc7Qx1CDApe3RtrvMqFQ2mwQ"

describe('Testing ProfitSharing Transactions', () => {
    it("Tests the locking transaction", async () => {
        const spyWalletBoxes = jest.spyOn(WalletUtils, 'getWalletBoxes')
            .mockImplementation(async (need: { [key: string]: number}) => {
                const boxes: Box[] = ergUtxo
                boxes.forEach(box => {
                    box.assets.forEach(ass => {
                        if (!Object.keys(need).includes(ass.tokenId)) need[ass.tokenId] = 0
                        need[ass.tokenId] -= parseInt(ass.amount)
                    })
                })
                return {
                    boxes: ergUtxo,
                    covered: true,
                    excess: Object.keys(need).filter(key => key !== 'ERG')
                        .filter(key => need[key] < 0)
                        .map(key => {
                            return {
                                tokenId: key,
                                amount: (-need[key]).toString(),
                            }
                        })
                }
            });
        const spyWalletAddress = jest.spyOn(WalletUtils, 'getWalletAddress')
            .mockImplementation(async () => address);
        const spyWalletSend = jest.spyOn(WalletUtils, 'sendTx')
            .mockImplementation(async (unsigned: Tx) => txId);
        const spyConfigBox = jest.spyOn(ApiNetwork, 'getConfigBox')
            .mockImplementation(async (c: BaseConfig)=> configBox);
        expect(await lockingTx(5, backConfig)).toBe(txId)
    })
})

