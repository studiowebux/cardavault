import { Buffer } from "node:buffer";
import { CardanoQueryClient } from "npm:@utxorpc/sdk";
import {
  TransactionUnspentOutputs,
  TransactionUnspentOutput,
  TransactionInput,
  TransactionHash,
  TransactionOutput,
} from "npm:@emurgo/cardano-serialization-lib-nodejs@14.1.1";

export const replacer = (_key: unknown, value: unknown): unknown =>
  typeof value === "bigint" ? value.toString() : value;

export function stringify(input: object): string {
  return JSON.stringify(input, (key, value) => replacer(key, value));
}

const DOLOS_URL = Deno.env.get("DOLOS_URL");

async function searchUtxosByAddress(address: string) {
  const queryClient = new CardanoQueryClient({
    uri: DOLOS_URL,
  });

  const utxos = await queryClient.searchUtxosByAddress(
    Buffer.from(address, "hex"),
  );

  const parsedUtxo: TransactionUnspentOutputs = TransactionUnspentOutputs.new();

  for (const utxo of utxos) {
    // UTXOs from dolos
    const bytes = utxo.nativeBytes;
    if (!bytes) {
      throw new Error("No native bytes");
    }
    parsedUtxo.add(
      TransactionUnspentOutput.new(
        TransactionInput.new(
          TransactionHash.from_bytes(utxo.txoRef.hash),
          utxo.txoRef.index,
        ),
        TransactionOutput.from_bytes(bytes),
      ),
    );
  }

  const utxoHexes: string[] = [];
  for (let i = 0; i < parsedUtxo.len(); i++) {
    utxoHexes.push(parsedUtxo.get(i).to_hex());
  }

  return utxoHexes;
}

async function getBalance(address: string) {
  const queryClient = new CardanoQueryClient({
    uri: DOLOS_URL,
  });

  let utxos = await queryClient.searchUtxosByAddress(
    Buffer.from(address, "hex"),
  );

  utxos = utxos.map((utxo) => ({
    ...utxo,
    txoRef: {
      ...utxo.txoRef,
      hash: Buffer.from(utxo.txoRef.hash).toString("hex"),
    },
    parsedValued: {
      ...utxo.parsedValued,
      address: Buffer.from(utxo.parsedValued.address).toString("hex"),
    },
    nativeBytes: Buffer.from(utxo.nativeBytes).toString("hex"),
  }));

  return utxos.reduce(
    (sum, utxo) => sum + BigInt(utxo.parsedValued.coin),
    BigInt(0),
  );
}

Deno.serve({ port: 9000, onError: onError }, async (req) => {
  const { method, url } = req;
  const { pathname, searchParams } = new URL(url);

  // Preflight request (OPTIONS)
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  if (method === "GET" && pathname === "/utxos") {
    return new Response(
      stringify({
        utxos: await searchUtxosByAddress(searchParams.get("address")),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }

  if (method === "GET" && pathname === "/balance") {
    return new Response(
      stringify({ balance: await getBalance(searchParams.get("address")) }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }

  throw new Error("Not Found");
});

function onError(err: Error) {
  return new Response((err as Error).message);
}
