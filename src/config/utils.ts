let ergolib = import('ergo-lib-wasm-browser')

export const toHexString = (byteArray: Uint8Array): string => {
    return Array.from(byteArray, function (byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
}

export async function decodeString(encoded: string) {
    return toHexString((await ergolib).Constant.decode_from_base16(encoded).to_byte_array())
}

