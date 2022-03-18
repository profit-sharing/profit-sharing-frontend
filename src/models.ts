import {Box, Token, Register, ExplorerOutputBox, ExplorerRegister} from "./types";
let ergolib = import('ergo-lib-wasm-browser')

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
    from_json = (json: ExplorerOutputBox): Box =>{
        let bx :BoxImpl = new BoxImpl();
        bx.boxId = json.boxId;
        bx.value = json.value.toString();
        bx.ergoTree = json.ergoTree;
        bx.assets = json.assets;
        bx.creationHeight = json.creationHeight;
        bx.transactionId = json.transactionId;
        bx.index = json.index;
        // TODO
        // bx.additionalRegisters = Object.entries(json.additionalRegisters)
        //     .map(([k, v]) =>{
        //         let r: Register = Object.assign({
        //             [k] : v.serializedValue
        //         })
        //         return r
        //     });
        return bx
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

    setup = async (box: Box): Promise<void> => {
        console.log(box)
        const configRegister = (await ergolib).Constant.decode_from_base16(box.additionalRegisters['R4'])
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