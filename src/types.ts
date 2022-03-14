type Register = { [key: string]: string };

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
