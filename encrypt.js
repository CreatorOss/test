/*
 encrypt.js
 Usage: node encrypt.js
 Reads index_protected.html and writes page.sym.enc (IV|TAG|CIPHERTEXT)
 Generates master_key.hex if missing.
*/
const crypto = require('crypto');
const fs = require('fs');

const PLAIN = 'index_protected.html';
const OUT = 'page.sym.enc';
const MASTER_KEY_FILE = 'master_key.hex';

if(!fs.existsSync(PLAIN)){
  console.error('ERROR: create file index_protected.html (symbol sequence) first.');
  process.exit(1);
}

let masterKeyHex;
if(fs.existsSync(MASTER_KEY_FILE)){
  masterKeyHex = fs.readFileSync(MASTER_KEY_FILE,'utf8').trim();
} else {
  masterKeyHex = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(MASTER_KEY_FILE, masterKeyHex);
  console.log('Generated master key in', MASTER_KEY_FILE);
}

const key = Buffer.from(masterKeyHex, 'hex');
const iv = crypto.randomBytes(12);
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const plaintext = fs.readFileSync(PLAIN);
const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
const tag = cipher.getAuthTag();
fs.writeFileSync(OUT, Buffer.concat([iv, tag, encrypted]));
console.log('Wrote', OUT);