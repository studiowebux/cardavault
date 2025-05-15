import { PrivateKey } from "@emurgo/cardano-serialization-lib-asmjs";
import {
  addWallet,
  getWalletByIndex,
  saveConfigurations,
  signTx,
} from "./api.ts";
import { RuntimeSendResponse, SignTransactionPayload } from "./type.ts";

export function initializeConfigurations(sendResponse: RuntimeSendResponse) {
  saveConfigurations({
    configurations: {
      mainnet: {
        anvil_api_endpoint: "https://prod.api.ada-anvil.app/v2/services",
        anvil_api_key: process.env.X_API_KEY_MAINNET!,
        provider_endpoint: "http://127.0.0.1:9000",
      },
      preprod: {
        anvil_api_endpoint: "https://preprod.api.ada-anvil.app/v2/services",
        anvil_api_key: process.env.X_API_KEY_TESTNET!,
        provider_endpoint: "http://127.0.0.1:9000",
      },
      preview: {
        anvil_api_endpoint: "https://preview.api.ada-anvil.app/v2/services",
        anvil_api_key: process.env.X_API_KEY_TESTNET!,
        provider_endpoint: "http://127.0.0.1:9000",
      },
    },
  });
  sendResponse({ response: "Configurations initialized!" });
}

export async function createAndAddWallet(sendResponse: RuntimeSendResponse) {
  // TODO: Lazy test to avoid dealing with local storage for now.
  const wallets = await addWallet({
    skey: process.env.SKEY!,
    pkey: process.env.PKEY!,
    mainnet_base_address: process.env.MAINNET_BASE_ADDRESS!,
    testnet_base_address: process.env.TESTNET_BASE_ADDRESS!,
    mainnet_reward_address: process.env.MAINNET_REWARD_ADDRESS!,
    testnet_reward_address: process.env.TESTNET_REWARD_ADDRESS!,
  });
  sendResponse({ response: `Wallet added at index ${wallets.length - 1}` });
}

export async function signTransaction(
  sendResponse: RuntimeSendResponse,
  data: SignTransactionPayload,
) {
  console.log("signTransaction");
  const wallet = await getWalletByIndex(0);
  console.debug("Wallet", wallet);
  const privateKey = PrivateKey.from_hex(wallet!.skey);
  console.debug("Private Key", privateKey);
  const signatureCbor = signTx(data.transaction, privateKey, wallet!.pkey);
  console.log("signatureCbor", signatureCbor);
  sendResponse({ response: signatureCbor });
}
