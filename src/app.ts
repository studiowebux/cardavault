// Client Side
import { browserAPI } from "./browser.ts";
import { RuntimeSendResponseData } from "./type.ts";



document.getElementById("initBtn")?.addEventListener("click", () => {
  browserAPI.runtime.sendMessage(
    { type: "INIT" },
    (response: RuntimeSendResponseData) => {
      console.log("Background replied:", response.response);
    },
  );
});

document.getElementById("newWalletBtn")?.addEventListener("click", () => {
  browserAPI.runtime.sendMessage(
    { type: "ADD_WALLET" },
    (response: RuntimeSendResponseData) => {
      console.log("Background replied:", response.response);
    },
  );
});
