import {
    setupWallet,
    getWalletAddress,
    sendTx,
    getWalletBoxes,
    ergo
} from "../../network/walletUtils";
import rewire from "rewire";

const exampleModule = rewire("../../network/walletUtils.ts");
const mockedErgo = {
    get_change_address: () => address,
}
exampleModule.__set__("ergo", mockedErgo)

const address = "9i4bn2bqn7yYXuM7RQGHqB9kGqqWWiqBaSmU9HvKb3UhTbaTCN3"

describe('67041178', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    it("Tests the setup wallet", async () => {
        window.ergo_check_read_access = async () => {return true};
        window.ergo_request_read_access = async () => {return true};
        expect(await setupWallet()).toBe(true)
        window.ergo_check_read_access = async () => {return false};
        window.ergo_request_read_access = async () => {return true};
        expect(await setupWallet()).toBe(true)
        window.ergo_check_read_access = async () => {return false};
        window.ergo_request_read_access = async () => {return false};
        expect(await setupWallet()).toBe(false)
    })

    it("Tests the get wallet address", async () => {
        // ergo.get_change_address = async () => address
        // jest.spyOn(ergo, "get_change_address").mockImplementation(jest.fn(async () => address));
        // jest.mock('../../network/walletUtils/ergo', () => ({get_change_address: async () => "hi"}))

        jest.mock('../../network/walletUtils', () => ({ setupWallet: () => true }));
        expect(await getWalletAddress()).toBe(address)
    })
})