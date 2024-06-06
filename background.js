chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "update") {
    const previousVersion = details.previousVersion;
    const thisVersion = chrome.runtime.getManifest().version;

    if (previousVersion !== thisVersion) {
      chrome.storage.local.set({previousVersion: thisVersion}, () => {
        chrome.tabs.create({ url: chrome.runtime.getURL("update.html") });
      });
    }
  }
});
