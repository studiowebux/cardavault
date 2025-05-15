export type Method = "GREET" | "INIT" | "ADD_WALLET" | "SIGN_TX";
export type RuntimeMessage = {
  method: Method;
  data?: unknown;
  id: string;
  sender: "webpage" | "extension";
  target: "cardavault";
  error?: string;
};

export type RuntimeSendResponseData = {
  response: string;
};
export type RuntimeSendResponse = (obj: {
  response: string;
}) => RuntimeSendResponseData;

export type Network = "preview" | "preprod" | "mainnet";
export type Configurations = Record<
  Network,
  {
    provider_endpoint: string;
    anvil_api_key: string;
    anvil_api_endpoint: string;
  }
>;

export type SignTransactionPayload = {
  transaction: string;
};

export type Wallet = {
  skey: string; // HEX
  pkey: string; // HEX
  testnet_base_address: string;
  mainnet_base_address: string;
  testnet_reward_address: string;
  mainnet_reward_address: string;
};

export type Wallets = Wallet[];
