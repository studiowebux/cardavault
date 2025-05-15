import {
  createAndAddWallet,
  initializeConfigurations,
  signTransaction,
} from "./bg_wrapper.ts";
import { browserAPI } from "./browser.ts";
import {
  RuntimeMessage,
  RuntimeSendResponse,
  SignTransactionPayload,
} from "./type.ts";

browserAPI.runtime.onInstalled.addListener(() => {
  console.log("Extension installed!");
});

// Listen for messages from other parts of the extension
browserAPI.runtime.onMessage.addListener(
  (
    message: RuntimeMessage,
    _sender: unknown,
    sendResponse: RuntimeSendResponse,
  ) => {
    console.log("[Background] Received message:", message);

    if (message.method === "GREET") {
      sendResponse({ response: "Hello from background!" });
    }

    if (message.method === "INIT") {
      initializeConfigurations(sendResponse);
    }

    if (message.method === "ADD_WALLET") {
      createAndAddWallet(sendResponse);
    }

    if (message.method === "SIGN_TX") {
      signTransaction(sendResponse, message.data as SignTransactionPayload);
    }

    // Always return true if you want to respond asynchronously
    return true;
  },
);
