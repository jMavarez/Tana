const PORT = 12043;
let latestUrl;

chrome.runtime.onMessage.addListener(({ url }) => openUrl(url));

const $ = (query) => {
  return document.querySelectorAll(query);
};

const $icon = $('#icon')[0];
const $text = $('#text')[0];
const $retry = $('#retry')[0];

const hasClass = (el, className) => {
  if (el.classList) {
    return el.classList.contains(className);
  } else {
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
  }
};

const addClass = (el, className) => {
  if (!className) {
    return;
  }

  if (typeof className === 'object') {
    className.forEach((cl) => addClass(el, cl));
    return;
  }

  if (el.classList) {
    el.classList.add(className);
  } else if (!hasClass(el, className))
    el.className += " " + className;
};

const removeClass = (el, className) => {
  if (!className) {
    return;
  }

  if (typeof className === 'object') {
    className.forEach((cl) => removeClass(el, cl));
    return;
  }

  if (el.classList) {
    el.classList.remove(className);
  } else if (hasClass(el, className)) {
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
    el.className = el.className.replace(reg, ' ');
  }
};

$retry.addEventListener('click', () => {
  if (latestUrl) {
    openUrl(latestUrl);
  }
});

const updateUi = (message, status) => {
  $text.innerHTML = message;
  removeClass($icon, 'shake');

  if (status === 'error') {
    removeClass($retry, 'hide');
    addClass($retry, 'show');
  }
};

const openUrl = (url) => {
  latestUrl = url;

  $text.innerHTML = "Opening on Tana...";
  addClass($icon, 'shake');
  removeClass($retry, 'show');
  addClass($retry, 'hide');

  req(url, (error) => {
    if (error) {
      updateUi("Something bad happened :( </br> Are you running Tana?", 'error');
    } else {
      updateUi("Opened on Tana!", 'success');
      setTimeout(() => {
        chrome.tabs.query({
          currentWindow: true,
          active: true,
        }, (tabs) => {
          chrome.windows.remove(tabs[0].windowId);
        });
      }, 2000);
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
