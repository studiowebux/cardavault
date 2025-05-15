import { browserAPI } from "./browser.ts";

const injectScript = () => {
  console.log("injectScript");
  const script = document.createElement("script");
  script.async = false;
  script.src = browserAPI.runtime.getURL("injected.js");
  script.onload = function () {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
};

// Listen to messages from the webpage
globalThis.addEventListener("message", (event) => {
  console.log("event", event);
  // Only accept messages from the same page
  if (event.source !== window) return;
  if (!event.data) return;

  if (event.data.sender !== "webpage") return;
  if (event.data.target !== "cardavault") return;

  console.log(
    "[Content] Received window.postMessage:",
    event.data,
    event.data.data,
  );

  // Forward the message to the background
  browserAPI.runtime.sendMessage(event.data, (response) => {
    console.log("[Content] Got response from background:", response);

    globalThis.postMessage(
      { ...event.data, sender: "extension", response: response },
      globalThis.origin,
    );
  });
});

injectScript();
