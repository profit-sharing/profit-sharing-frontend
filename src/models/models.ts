import {Box, Token, Register} from "./types";
import * as wasm from 'ergo-lib-wasm-browser/ergo_lib_wasm';

export class BoxImpl implements Box{
    boxId: string;
    value: string;
    ergoTree: string;
    assets: Token[];
    additionalRegisters: Register;
    creationHeight: number;
    transactionId: string;
    index: number;
    constructor(bx?: Box) {
        this.boxId = bx?.boxId ?? "";
        this.value = bx?.value ?? "";
        this.ergoTree = bx?.ergoTree ?? "";
        this.assets = bx?.assets ?? [];
        this.additionalRegisters = bx?.additionalRegisters?? {};
        this.creationHeight = bx?.creationHeight?? 0;
        this.transactionId = bx?.transactionId?? "";
        this.index = bx?.index?? 0;
    }
}

export class ConfigBox extends BoxImpl{
    checkPoint: number;
    minErgShare: number;
    minTokenShare: number;
    ticketCount: number;
    stakeCount:number;
    fee: number;
    minTicketValue: number;
    minBoxVal: number;
    constructor(bx: Box) {
        super(bx)
        this.checkPoint = 0
        this.minErgShare = 0
        this.minTokenShare = 0
        this.ticketCount = 0
        this.stakeCount = 0
        this.fee = 0
        this.minTicketValue = 0
        this.minBoxVal = 0
    }
    setup = async (): Promise<void> => {
        const configRegister = wasm.Constant.decode_from_base16(this.additionalRegisters['R4'])
            .to_i64_str_array().map(cur => parseInt(cur))
        this.checkPoint = configRegister[0]
        this.minErgShare = configRegister[1]
        this.minTokenShare = configRegister[2]
        this.ticketCount = configRegister[3]
        this.stakeCount = configRegister[4]
        this.fee = configRegister[5]
        this.minTicketValue = configRegister[6]
        this.minBoxVal = configRegister[7]
    }
}

export class TicketBox extends BoxImpl{
    addressErgoTree: Uint8Array;
    reservedToken: string;
    initialCheckPoint: number;
    checkPoint: number;
    fee: number;
    minBoxVal: number;
    stake: number;
    constructor(bx: Box) {
        super(bx)
        this.addressErgoTree = Uint8Array.from([])
        this.reservedToken = ""
        this.initialCheckPoint = 0
        this.checkPoint = 0
        this.fee = 0
        this.minBoxVal = 0
        this.stake = 0
    }
    setup = async (): Promise<void> => {
        const configRegister = wasm.Constant.decode_from_base16(this.additionalRegisters['R4'])
            .to_i64_str_array().map(cur => parseInt(cur))
        this.initialCheckPoint = configRegister[0]
        this.checkPoint = configRegister[1]
        this.fee = configRegister[2]
        this.minBoxVal = configRegister[3]
        this.addressErgoTree = wasm.Constant.decode_from_base16(this.additionalRegisters['R5']).to_byte_array()
        this.reservedToken = Buffer.from(wasm.Constant.decode_from_base16(this.additionalRegisters['R6']).to_byte_array()).toString('hex')
        this.stake = parseInt(this.assets[1].amount)
    }
}
