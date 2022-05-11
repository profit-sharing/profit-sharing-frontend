import {WalletUtils} from "../../network/walletUtils";

const unsignedTx = require('../dataset/unsignedTx.json');

const address = "9i4bn2bqn7yYXuM7RQGHqB9kGqqWWiqBaSmU9HvKb3UhTbaTCN3"
const tokenId = "efb83829b204779f65e28dd1b11d9f70aedb7c19f5cbdeb215933ac67dba1367"
const txId = "f3b22a1e7cf50a0e479265025288a761f226c46850794ec37d7d46469a1cbdba"

describe('Testing WalletUtils', () => {
    it("Tests the setup wallet", async () => {
        window.ergo_check_read_access = async () => {return true};
        window.ergo_request_read_access = async () => {return true};
        expect(await WalletUtils.setupWallet()).toBe(true)
        window.ergo_check_read_access = async () => {return false};
        window.ergo_request_read_access = async () => {return true};
        expect(await WalletUtils.setupWallet()).toBe(true)
        window.ergo_check_read_access = async () => {return false};
        window.ergo_request_read_access = async () => {return false};
        expect(await WalletUtils.setupWallet()).toBe(false)
    })

    it("Tests the get wallet address", async () => {
        const spy = jest.spyOn(WalletUtils, 'setupWallet').mockImplementation(async () => true);
        expect(await WalletUtils.getWalletAddress()).toBe(address)
        expect(spy).toBeCalledTimes(1)
    })

    it("Tests getting the Wallet Boxes", async () => {
        const spy = jest.spyOn(WalletUtils, 'setupWallet').mockImplementation(async () => true);
        let data = await WalletUtils.getWalletBoxes({ERG: 100000})
        expect(data.covered).toBe(true)
        expect(data.boxes.length).toBe(1)
        expect(spy).toBeCalledTimes(1)
        data = await WalletUtils.getWalletBoxes({ERG: 100000, [tokenId]: 1})
        expect(data.covered).toBe(true)
        expect(data.boxes.length).toBe(1)
        data = await WalletUtils.getWalletBoxes({ERG: 100000, [tokenId]: 70})
        expect(data.covered).toBe(false)
        expect(data.boxes.length).toBe(2)
    })

    it("Tests sending a transaction", async () => {
        const spy = jest.spyOn(WalletUtils, 'setupWallet').mockImplementation(async () => true);
        expect(await WalletUtils.sendTx(unsignedTx)).toBe(txId)
        expect(spy).toBeCalledTimes(1)
    })
})