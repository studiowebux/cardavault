import { Address } from "@emurgo/cardano-serialization-lib-asmjs";
import { Method, RuntimeMessage } from "./type.ts";

// TODO: again to avoid dealing with local storage
const cardano_address_bech32 =
  "addr_test1vra369fzgacfz9edsnel4kcpx8r9d7dqc8rfhvqmpajzn6q9gwum3";

console.log(cardano_address_bech32);

const cardano_address_hex = Address.from_bech32(
  cardano_address_bech32,
).to_hex();
console.log(cardano_address_hex);

async function getBalance() {
  console.debug("getBalance");
  const response = await fetch(
    `http://127.0.0.1:9000/balance?address=${cardano_address_hex}`,
  );
  const result = await response.json();
  console.log(result);
  return Number(result.balance);
}


async function getUtxos(amount, paginate) {
  const response = await fetch(
    `http://127.0.0.1:9000/utxos?address=${cardano_address_hex}`,
  );

  const result = await response.json();

  console.log("UTXOS", result, typeof result);

  return result.utxos;
}

export const getCurrentAccount = async () => {
  const network = "preprod";
  return {
    paymentAddr:
      "addr_test1vra369fzgacfz9edsnel4kcpx8r9d7dqc8rfhvqmpajzn6q9gwum3",
    rewardAddr:
      "stake_test1uq7rcdc44v6yye5cflg4rm834kuhjz9m0yfew7726p9v0aqxgyx7l",
    assets: [],
    lovelace: 100_000_666,
    network,
  };
};

function messageHandler(method: Method, data: unknown) {
  const requestId = new Date().getTime().toString();
  return new Promise((resolve, reject) => {
    globalThis.addEventListener("message", function responseHandler(e) {
      const response: RuntimeMessage = e.data;
      console.log("Validate format ?", response);
      if (
        typeof response !== "object" ||
        response === null ||
        !response.target ||
        response.target !== "cardavault" ||
        !response.id ||
        response.id !== requestId ||
        !response.sender ||
        response.sender !== "extension"
      )
        return;
      globalThis.removeEventListener("message", responseHandler);
      if (response.error) reject(response.error);
      else resolve(response);
    });

    // post to the content -> background
    globalThis.postMessage(
      {
        method,
        data,
        target: "cardavault",
        sender: "webpage",
        id: requestId,
      },
      globalThis.origin,
    );
  });
}

globalThis.cardano = {
  ...(globalThis.cardano || {}),
  cardavault: {
    enable: async () => {
      return {
        getBalance: () => getBalance(),
        signData: (address, payload) => {
          console.log("Address", address, "Payload", payload);
        },
        signTx: async (tx, partialSign) => {
          const response = await messageHandler("SIGN_TX", {
            transaction: tx,
            partialSign,
          });
          console.log("PROCESSING DONE, RECEIVED", response);
          return response.response.response;
        },
        submitTx: (tx) => {
          console.log("Tx", tx);
        },
        getUtxos: (amount, paginate) => getUtxos(),
        getUsedAddresses: async () => [
          "addr_test1vra369fzgacfz9edsnel4kcpx8r9d7dqc8rfhvqmpajzn6q9gwum3",
        ],
        getUnusedAddresses: async () => [],
        getChangeAddress: () =>
          "addr_test1vra369fzgacfz9edsnel4kcpx8r9d7dqc8rfhvqmpajzn6q9gwum3",
        getRewardAddresses: async () => [
          "stake_test1uq7rcdc44v6yye5cflg4rm834kuhjz9m0yfew7726p9v0aqxgyx7l",
        ],
        getNetworkId: () => {},
        experimental: {
          on: (eventName, callback) => {
            console.log("EventName", eventName, "callback", callback);
          },
          off: (eventName, callback) => {
            console.log("EventName", eventName, "callback", callback);
          },
          getCollateral: () => {},
        },
      };
    },
    isEnabled: () => {},
    apiVersion: "0.0.0",
    name: "Cardavault",
    icon: "",
    _events: {},
  },
};

console.log("Wallet loaded:", globalThis.cardano.cardavault);
