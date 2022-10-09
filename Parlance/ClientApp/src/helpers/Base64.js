function decode64(str) {
    return Uint8Array.from(atob(str), c => c.charCodeAt(0))
}

function encode64(buf) {
    return btoa(String.fromCharCode(...new Uint8Array(buf)))
}

function decode(str) {
    return decode64(str.replaceAll("-", "+").replaceAll("_", "/"));
}

function encode(buf) {
    return encode64(buf).replaceAll("+", "-").replaceAll("/", "_");
}

export {
    decode,
    encode
}
