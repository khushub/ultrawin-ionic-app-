class Crypto {
    constructor() {
        // Pre-obfuscated AES key (generated from your original key)
        this.ob_Key = '016e347a636851233d31790a492d515c183e1c0d22055d695a3e593633703a35372d340b3c14210f66484948';
       
        // Obfuscation layers
        this.layers = {
            layer1: "qP7z9mY4x2Wv1Jk8Tn6sQb3Lr0hG5VfXcDoE",
            layer2: "Z2t9bX6pF0wQy8vR1nH7jM3sLk5uA4eCdoIf",
            layer3: "mB5xJ8k1Vq3Zr7gN2wS9tL6cP0oF4yUeDhTa",
        };
       
        // Deobfuscate the key on initialization
        this.key = this.deObfuscate_key();
    }
 
    // Method to obfuscate a plain text key (for generating ob_Key)
    obfuscate_Key(plainKey) {
        if (!plainKey || !plainKey.trim()) {
            console.error("Please provide a key to obfuscate");
            return null;
        }
 
        try {
            let obfuscated = "";
            for (let i = 0; i < plainKey.length; i++) {
                let char = plainKey.charCodeAt(i);
                char ^= this.layers.layer1.charCodeAt(i % this.layers.layer1.length);
                char ^= this.layers.layer2.charCodeAt(i % this.layers.layer2.length);
                char ^= this.layers.layer3.charCodeAt(i % this.layers.layer3.length);
                obfuscated += String.fromCharCode(char);
            }
 
            const obfuscatedHex = obfuscated
                .split("")
                .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
                .join("");
            return obfuscatedHex;
        } catch (error) {
            console.error("Obfuscation failed:", error);
            return null;
        }
    }
 
    // Deobfuscate the stored key
    deObfuscate_key() {
        try {
            const obfuscated = this.ob_Key
                .match(/.{2}/g)
                .map((hex) => String.fromCharCode(parseInt(hex, 16)))
                .join("");
 
            let deobfuscated = "";
            for (let i = 0; i < obfuscated.length; i++) {
                let char = obfuscated.charCodeAt(i);
                char ^= this.layers.layer1.charCodeAt(i % this.layers.layer1.length);
                char ^= this.layers.layer2.charCodeAt(i % this.layers.layer2.length);
                char ^= this.layers.layer3.charCodeAt(i % this.layers.layer3.length);
                deobfuscated += String.fromCharCode(char);
            }
 
            if (deobfuscated) {
                return deobfuscated;
            }
            return '';
        } catch (error) {
            console.error("Deobfuscation failed:", error);
            return '';
        }
    }
 
    // Convert ArrayBuffer to base64 (browser-compatible)
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
 
    // Convert base64 to ArrayBuffer (browser-compatible)
    base64ToArrayBuffer(base64) {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }
 
    // Encrypt data using AES-GCM
    async encryptWithAESGCM(data) {
        try {
            const plaintext = JSON.stringify(data);
            const enc = new TextEncoder();
            const keyData = enc.encode(this.key.padEnd(32, '\0').slice(0, 32)); // Ensure 256-bit (32 bytes)
           
            const key = await crypto.subtle.importKey(
                "raw",
                keyData,
                { name: "AES-GCM" },
                false,
                ["encrypt"]
            );
 
            const iv = crypto.getRandomValues(new Uint8Array(12)); // GCM requires 96-bit IV
            const encrypted = await crypto.subtle.encrypt(
                {
                    name: "AES-GCM",
                    iv: iv
                },
                key,
                enc.encode(plaintext)
            );
 
            return {
                data: this.arrayBufferToBase64(encrypted),
                iv: this.arrayBufferToBase64(iv)
            };
        } catch (err) {
            console.error("Encryption failed:", err);
            return null;
        }
    }
 
    // Decrypt data using AES-GCM
    async decryptWithAESGCM(result) {
        try {
            const enc = new TextEncoder();
            const dec = new TextDecoder();
            const keyData = enc.encode(this.key.padEnd(32, '\0').slice(0, 32));
           
            const key = await crypto.subtle.importKey(
                "raw",
                keyData,
                { name: "AES-GCM" },
                false,
                ["decrypt"]
            );
 
            const iv = new Uint8Array(this.base64ToArrayBuffer(result.iv));
            const ciphertext = this.base64ToArrayBuffer(result.data);
 
            const decrypted = await crypto.subtle.decrypt(
                {
                    name: "AES-GCM",
                    iv: iv
                },
                key,
                ciphertext
            );
 
            const decryptedText = dec.decode(decrypted);
            return JSON.parse(decryptedText);
        } catch (err) {
            console.error("Decryption failed:", err);
            return null;
        }
    }
 
    // API wrapper with automatic encryption/decryption (using fetch)
    async encryptedFetch(url, options = {}) {
        try {
            // Encrypt request body if present
            if (options.body) {
                const encryptedData = await this.encryptWithAESGCM(options.body);
                if (!encryptedData) {
                    throw new Error('Failed to encrypt request data');
                }
               
                options.body = JSON.stringify(encryptedData);
                options.headers = {
                    'Content-Type': 'application/json',
                    ...options.headers
                };
            }
 
            // Make the API call
            const response = await fetch(url, options);
           
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
 
            // Decrypt response if it's encrypted
            const responseData = await response.json();
            if (responseData && responseData.data && responseData.iv) {
                const decryptedData = await this.decryptWithAESGCM(responseData);
                return decryptedData;
            }
 
            return responseData;
        } catch (error) {
            console.error('Encrypted fetch failed:', error);
            throw error;
        }
    }
}
 
export const CryptoInstance = new Crypto();
