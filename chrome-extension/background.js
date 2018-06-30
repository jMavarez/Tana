const SIZE = 300;

const open = () => {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  },
    (tabs) => openWindow(tabs[0].url)
  );
};

const openWindow = (url) => {
  chrome.windows.create({
    width: SIZE,
    height: SIZE,
    url: 'loader/loader.html',
    type: 'panel',
  }, (win) => {
    setTimeout(() => {
      chrome.tabs.sendMessage(win.tabs[0].id, { url });
    }, 100);
  });
}

chrome.contextMenus.removeAll(() => {
  chrome.contextMenus.create({
    id: 'tana-link',
    title: 'Open in Tana',
    contexts: ['link']
  }, () => {
    chrome.contextMenus.onClicked.addListener(({ linkUrl }) => openUrl(linkUrl));
  });
});

chrome.browserAction.onClicked.addListener(open);
