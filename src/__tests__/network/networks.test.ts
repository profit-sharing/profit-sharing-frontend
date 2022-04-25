import {ApiNetwork} from "../../network/Network";
import {backEnd, explorerApi, nodeClient} from "../../network/Network";
import {Boxes} from "../../models/Boxes";
import {Box, ExplorerOutputBox} from "../../models/types"
import MockAdapter from 'axios-mock-adapter'

const byTokenId = require('../dataset/byTokenId.json');
const byTokenIdLimit = require('../dataset/byTokenIdLimit.json');
const backConfig = require('../dataset/backConfig.json')
const nodeClientInfo = require('../dataset/nodeClientInfo.json')
const mempoolTxs = require('../dataset/mempoolTxs.json')
const unconfirmedTx = require('../dataset/unconfirmedTx.json')
const confirmedTx = require('../dataset/confirmedTx.json')
const unconfirmedReplicated = require('../dataset/unconfirmedReplicated.json')
const utxoBox = require('../dataset/utxoBox.json')
const ticketByToken = require(`../dataset/ticketToken.json`)
const configByToken = require(`../dataset/configToken.json`)

const tokenId = "efb83829b204779f65e28dd1b11d9f70aedb7c19f5cbdeb215933ac67dba1367"
const mempoolAddress = "9hrUEzX9ouAuEZAWP4MaTaWzw33xtbdB88xFpQxSHApmUUJbcbb"
const unconfirmedTxId = "ebb5aa196e64e28a04eda4f5e25ac9e2bf883af1f5a1e63b1429b2e14c6b0dcb"
const confirmedTxId = "55ba303658d4054cfa235320ee09193c8e1b6c96b3e5473f660dbb5f1b99c2b7"
const unconfirmedReplicatedAddress = "5vSUZRZbdVbnk4sJWjg2uhL94VZWRg4iatK9VgMChufzUgdihgvhR8yWSUEJKszzV7Vmi6K8hCyKTNhUaiP8p5ko6YEU9yfHpjVuXdQ4i5p4cRCzch6ZiqWrNukYjv7Vs5jvBwqg5hcEJ8u1eerr537YLWUoxxi1M4vQxuaCihzPKMt8NDXP4WcbN6mfNxxLZeGBvsHVvVmina5THaECosCWozKJFBnscjhpr3AJsdaL8evXAvPfEjGhVMoTKXAb2ZGGRmR8g1eZshaHmgTg2imSiaoXU5eiF3HvBnDuawaCtt674ikZ3oZdekqswcVPGMwqqUKVsGY4QuFeQoGwRkMqEYTdV2UDMMsfrjrBYQYKUBFMwsQGMNBL1VoY78aotXzdeqJCBVKbQdD3ZZWvukhSe4xrz8tcF3PoxpysDLt89boMqZJtGEHTV9UBTBEac6sDyQP693qT3nKaErN8TCXrJBUmHPqKozAg9bwxTqMYkpmb9iVKLSoJxG7MjAj72SRbcqQfNCVTztSwN3cRxSrVtz4p87jNFbVtFzhPg7UqDwNFTaasySCqM"
const ticketReserved = "e77af40ef9729643fa1e7dc3731f97b62bc1d59de483f5a29767136eb10df001"

const mockedBackEnd = new MockAdapter(backEnd)
const mockedExplorer = new MockAdapter(explorerApi)
const mockedClient = new MockAdapter(nodeClient)

mockedBackEnd.onGet("/api/info").reply(200, backConfig)
mockedClient.onGet("/info").reply(200, nodeClientInfo)
mockedExplorer.onGet(`/api/v1/boxes/unspent/byTokenId/${tokenId}`, {params: {offset: 0, limit: 10}}).reply(200, byTokenIdLimit)
mockedExplorer.onGet(`/api/v1/mempool/transactions/byAddress/${mempoolAddress}`).reply(200, mempoolTxs)
mockedExplorer.onGet(`/api/v0/transactions/unconfirmed/${unconfirmedTxId}`).reply(200, unconfirmedTx)
mockedExplorer.onGet(`/api/v1/transactions/${unconfirmedTxId}`).reply(404, {"status": 404})
mockedExplorer.onGet(`/api/v0/transactions/unconfirmed/${unconfirmedTxId}`).reply(404, {"status": 404})
mockedExplorer.onGet(`/api/v1/transactions/${confirmedTxId}`).reply(200, confirmedTx)
mockedExplorer.onGet(`/api/v1/mempool/transactions/byAddress/${unconfirmedReplicatedAddress}`).reply(200, unconfirmedReplicated)
mockedExplorer.onGet(`/api/v1/boxes/unspent/byTokenId/${backConfig.tokens.locking}`, {params: {offset: 0, limit: 100}}).reply(200, ticketByToken)
mockedExplorer.onGet(`/api/v1/boxes/unspent/byTokenId/${backConfig.tokens.configNFT}`, {params: {offset: 0, limit: 100}}).reply(200, configByToken)

describe("Network APIs", () => {
    it("Service backend config test", async () => {
        const data = await ApiNetwork.getBackendConfig()
        expect(data).toHaveProperty('tokens')
        expect(data).toHaveProperty('ergoTrees')
    });

    it("Service node client api height", async () => {
        const data = await ApiNetwork.getHeight()
        expect(data).toBe(190020)
    });

    it("Tests getting boxes with the same token", async () => {
        const data = await ApiNetwork.getBoxWithToken(tokenId, 0, 10)
        expect(data.boxes.length).toBe(10)
        expect(data.total).toBe(17)
        for(const box of data.boxes) expect(box.assets.map(b => b.tokenId).indexOf(tokenId)).not.toEqual(-1)
    })

    it("Tests getting mempool transactions for an address", async () => {
        const data = await ApiNetwork.getMempoolTransactions(mempoolAddress)
        expect(data.txs.length).toBe(1)
        expect(data.total).toBe(1)
    })

    it("Tests mempool transaction status", async () => {
        const confirmed = await ApiNetwork.getConfirmedTx(unconfirmedTxId)
        expect(confirmed).toBeNull()
        const unconfirmed = await ApiNetwork.getUnconfirmedTx(unconfirmedTxId)
        expect(unconfirmed).toHaveProperty("id")
        const confNum = await ApiNetwork.getConfNum(unconfirmedTxId)
        expect(confNum).toBe(0)
    })

    it("Tests confirmed transaction status", async () => {
        const confirmed = await ApiNetwork.getConfirmedTx(confirmedTxId)
        expect(confirmed).toHaveProperty("id")
        const unconfirmed = await ApiNetwork.getUnconfirmedTx(confirmedTxId)
        expect(unconfirmed).toBeNull()
        const confNum = await ApiNetwork.getConfNum(confirmedTxId)
        expect(confNum).toBe(6539)
    })

    it("Tests finding last mempool box for a self-replicated box", async () => {
        const data = await ApiNetwork.findLastMempoolBox(utxoBox)
        expect(data.boxId).toBe("64eaf43881675abac3691efc382eeb5dff50d7adf2355fa7bff8a7d3397a9715")
    })

    it("Tests ticket finding", async () => {
        const spy = jest.spyOn(ApiNetwork, 'findLastMempoolBox').mockImplementation(async (a: ExplorerOutputBox)=> a);
        const data = await ApiNetwork.getTicketBox(ticketReserved, backConfig)
        expect(spy).toHaveBeenCalled();
        expect(data.assets[1].amount).toBe("2")
    })

    it("Tests config box finding", async () => {
        const spy = jest.spyOn(ApiNetwork, 'findLastMempoolBox').mockImplementation(async (a: ExplorerOutputBox)=> a);
        const data = await ApiNetwork.getConfigBox(backConfig)
        expect(spy).toHaveBeenCalled();
        expect(data.assets.length).toBe(3)
        expect(data.assets[0].tokenId).toBe(backConfig.tokens.configNFT)
    })
})

export const x = 0

