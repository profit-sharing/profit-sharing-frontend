export type Register = { [key: string]: string };

declare global {
    interface Window {
        ergo_request_read_access: () => Promise<Boolean>;
        ergo_check_read_access: () => Promise<Boolean>;
    }
}

export type Token = {
    tokenId: string;
    amount: string;
    name?: string;
    decimals?: number;
};
export type Box = {
    boxId: string,
    value: string,
    ergoTree: string,
    assets: Token[],
    additionalRegisters: Register,
    creationHeight: number,
    transactionId: string,
    index: number,
};
export type BoxCandidate = {
    value: string,
    ergoTree: string,
    assets: Token[],
    additionalRegisters: Register,
    creationHeight: number,
};
export type UnsignedInput = {
    extension: { [key: string]: string },
    boxId: string,
    value: string,
    ergoTree: string,
    assets: Token[],
    additionalRegisters: Register,
    creationHeight: number,
    transactionId: string,
    index: number,
};
export type SignedInput = {
    boxId: string,
    spendingProof: string,
};
export type DataInput = {
    boxId: string,
};
export type SignedTx = {
    id: string,
    inputs: SignedInput[],
    dataInputs: DataInput[],
    outputs: Box[],
    size: number,
};
export type Tx = {
    inputs: Box[],
    dataInputs: DataInput[],
    outputs: BoxCandidate[],
};

export type ExplorerRegister = {
    serializedValue: string,
    sigmaType: string,
    renderedValue: string
}

export type ExplorerToken = {
    tokenId: string;
    index: number;
    amount: number;
    name: string;
    decimals: number;
    type: string;
};

export type ExplorerInputBox = {
    boxId: string;
    value: number;
    outputTransactionId: string;
    outputBlockId: string,
    outputIndex: number;
    creationHeight: number;
    ergoTree: string;
    address: string;
    assets: ExplorerToken[];
    additionalRegisters: {[key: string]: ExplorerRegister};
    spentTransactionId: string;
};

export type ExplorerOutputBox = {
    boxId: string;
    transactionId: string;
    blockId: string,
    value: number;
    index: number;
    creationHeight: number;
    ergoTree: string;
    address: string;
    assets: ExplorerToken[];
    additionalRegisters: {[key: string]: ExplorerRegister};
    spentTransactionId: string;
};

export type ExplorerTransaction = {
    id: string,
    creationTimestamp: number,
    numConfirmations: number,
    inputs: ExplorerInputBox[],
    outputs: ExplorerOutputBox[],
}
