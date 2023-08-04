function decode64(str: string) {
    return Uint8Array.from(atob(str), c => c.charCodeAt(0))
}

function encode64(buf: Uint8Array) {
    return btoa(String.fromCharCode(...new Uint8Array(buf)))
}

function decode(str: string) {
    return decode64(str.replaceAll("-", "+").replaceAll("_", "/"));
}

function encode(buf: ArrayBuffer) {
    return encode64(new Uint8Array(buf)).replaceAll("+", "-").replaceAll("/", "_");
}

export {
    decode,
    encode
}
