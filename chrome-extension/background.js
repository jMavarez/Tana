const PORT = 12043;

const open = () => {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  },
    (tabs) => openUrl(tabs[0].url)
  );
};

const openUrl = (url) => {
  req(url, (e) => {
    if (e) {
      alert("Something bad happened :(. Are you running Tana?");
    } else {
      alert("Opening on Tana!");
    }
  });
};

const req = (url, cb) => {
  const req = new XMLHttpRequest();

  req.onreadystatechange = (e) => {
    const target = e.target;
    if (target.readyState === XMLHttpRequest.DONE) {
      if (target.status === 200) {
        return cb();
      } else {
        return cb(target);
      }
    }
  };

  req.onError = (e) => cb(e);

  req.open('GET', `http://127.0.0.1:${PORT}/open?url=${encodeURIComponent(url)}`, true);
  req.send();
};

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
