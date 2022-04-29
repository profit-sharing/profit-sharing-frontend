import { enableFetchMocks } from "jest-fetch-mock";
import { readFileSync } from "fs";

enableFetchMocks();
const file = readFileSync("./ergo_lib_wasm_bg.wasm");

fetch.mockResponse(async request => {
    if (request.url.endsWith("ergo_lib_wasm_bg.wasm")) {
        return {
            status: 200,
            body: file
        };
    } else {
        return {
            status: 404,
            body: "Not Found"
        };
    }
});

const ergUtxo = require('./__tests__/dataset/ergUtxo.json');
const tokenUtxo = require('./__tests__/dataset/tokenUtxo.json');
const signedTx = require('./__tests__/dataset/signedTx.json');

const address = "9i4bn2bqn7yYXuM7RQGHqB9kGqqWWiqBaSmU9HvKb3UhTbaTCN3"
const tokenId = "efb83829b204779f65e28dd1b11d9f70aedb7c19f5cbdeb215933ac67dba1367"
const txId = "f3b22a1e7cf50a0e479265025288a761f226c46850794ec37d7d46469a1cbdba"

global.ergo = {
    get_change_address: () => address,
    get_utxos: (amount, token_id) => {
        if(token_id === 'ERG'){
            return ergUtxo
        } else if(token_id === tokenId){
            return tokenUtxo
        }
    },
    sign_tx: () => signedTx,
    submit_tx: () => txId
};

