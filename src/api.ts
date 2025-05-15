import {
  FixedTransaction,
  make_vkey_witness,
  PrivateKey,
} from "@emurgo/cardano-serialization-lib-asmjs";
import { Tag, encode } from "cbor2";
import { Buffer } from "buffer";

import { browserAPI } from "./browser.ts";
import { Configurations, Network, Wallet, Wallets } from "./type.ts";

//
// Configurations
//

export async function getConfigurations(): Promise<Configurations> {
  const data = await browserAPI.storage.sync.get("configurations");
  return data.configurations;
}

export async function getConfigurationPerNetwork(
  network: Network,
): Promise<Configurations> {
  const data = await browserAPI.storage.sync.get("configurations");
  return data.configurations[network];
}

export async function saveConfigurations(configurations: {
  configurations: Configurations;
}): Promise<void> {
  await browserAPI.storage.sync.set(configurations);
}

//
// Account / Wallet management
//

export async function addWallet(wallet: Wallet): Promise<Wallets> {
  let wallets = [];
  const response = await browserAPI.storage.sync.get("wallets");
  console.log("Wallets", response);
  if (
    response.wallets ||
    Array.isArray(response.wallets) ||
    response.wallets.length > 0
  ) {
    wallets = response.wallets;
  }
  const newWallet = { wallets: [...wallets, wallet] };
  await browserAPI.storage.sync.set(newWallet);
  return newWallet.wallets;
}

export async function getWalletByIndex(index: number): Promise<Wallet | null> {
  let wallets = [];
  const response = await browserAPI.storage.sync.get("wallets");
  console.log("Wallets", response);
  if (
    response.wallets ||
    Array.isArray(response.wallets) ||
    response.wallets.length > 0
  ) {
    wallets = response.wallets;
  }
  return wallets.at(index) || null;
}

//
// CIP-30
//

export function signTx(
  tx: string,
  privateKey: PrivateKey,
  publicKeyHash: string,
) {
  console.debug("signTx", tx, privateKey.to_hex(), publicKeyHash);
  const unsigned_tx = FixedTransaction.from_hex(tx);
  const hash = unsigned_tx.transaction_hash();
  const vkeyWitness = make_vkey_witness(hash, privateKey);
  const pkRawKey = Buffer.from(publicKeyHash, "hex"); // Convert keyhash to Buffer
  const signaturePrefix = Buffer.from(vkeyWitness.signature().to_hex(), "hex"); // Convert signature to Buffer
  const witnessSet = new Map([
    [
      0,
      new Tag(258, [
        [new Uint8Array(pkRawKey), new Uint8Array(signaturePrefix)],
      ]),
    ],
  ]);

  const encoded = encode(witnessSet);
  console.debug(encoded);
  return Buffer.from(encoded).toString("hex");
}
