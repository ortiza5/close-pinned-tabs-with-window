chrome.tabs.onDetached.addListener((tabId, detachInfo) => {
  chrome.tabs.get(tabId, (tab) => {
    if (tab.pinned) {
      chrome.storage.local.set({ [tabId]: detachInfo.oldWindowId });
    }
  });
});

chrome.tabs.onAttached.addListener((tabId, attachInfo) => {
  chrome.storage.local.get(tabId.toString(), (result) => {
    // if tab wasn't pinned won't be in storage, so ignore this attach event
    if (Object.keys(result).length === 0) return;

    let oldWindowId = result[tabId];

    // if movement was in the same window, ignore it
    if (oldWindowId === attachInfo.newWindowId) {
      chrome.storage.local.remove(tabId);
    }
  });
});

chrome.windows.onRemoved.addListener((windowId) => {
  chrome.storage.local.get(null, (storage) => {
    console.log(storage);
    // get all pinned tabs moved from the closing window
    const tabs = Object.keys(storage).filter((k) => storage[k] === windowId);
    console.log(tabs);
    tabs.forEach((tabId) => {
      chrome.tabs.get(parseInt(tabId), (tab) => {
        if (chrome.runtime.lastError) return;
        chrome.tabs.remove(tab.id);
      });
    });

    chrome.storage.local.clear();
  });
});
