const { compactDecrypt, importJWK } = require("jose");

// JWEトークン
const jweToken = "";

// 暗号化キー
const encryptionKey = Buffer.from("", "hex");

async function decryptJWE() {
  try {
    // JWK形式に変換
    const jwk = {
      kty: "oct",
      k: encryptionKey.toString("base64url"),
    };

    // JWKをインポート
    const key = await importJWK(jwk, "A256GCM");

    // JWEトークンを復号化
    const { plaintext, protectedHeader } = await compactDecrypt(jweToken, key);

    console.log("Payload:", new TextDecoder().decode(plaintext));
    console.log("Protected Header:", protectedHeader);
  } catch (err) {
    console.error("Decryption failed:", err);
  }
}

decryptJWE();
