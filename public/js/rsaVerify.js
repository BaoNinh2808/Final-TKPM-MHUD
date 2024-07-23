// Load the public key
const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBITANBgkqhkiG9w0BAQEFAAOCAQ4AMIIBCQKCAQBf3GMKLhdIHul+ZM/DTu6U
Q/FgjhP79x3HL0fQhwwwiv6QIkq/MlpnvVZw7GbAQCcnctVuTZFnfpj2+vxGio3W
4ENdd256QVWphDDJUdMKbx+RtCKmxuSSDXTukicZyfi/KydcIA6zGJzm29SGxGaW
v0uq88VIePlmjQnTg9ivaxreSpIMKSOvgCYD/Kcs41UP1ZRhqCdAoPIkjcjoxO83
q01f0fzGvwjlmvWLk83rckxdBo6236uuQ/N/hQ/9ubFhXWCzvZWhjgZ+5jahgM2k
C1JY44oibU15BGsseG0Fop0yGl/TOZp9fEu2HPcmJx+iNe4b7zfaBbRJesttI+Wh
AgMBAAE=
-----END PUBLIC KEY-----`;

// Function to verify the signature
function verifySignature(publicKey, signature, data) {
    var verify = new JSEncrypt();
    verify.setPublicKey(publicKey);
    return verify.verify(data, signature, CryptoJS.SHA256);
}