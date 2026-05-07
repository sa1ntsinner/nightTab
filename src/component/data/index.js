import { message } from '../message';

import { state } from '../state';
import { bookmark } from '../bookmark';
import { menu } from '../menu';
import { version } from '../version';
import { update } from '../update';
import { APP_NAME } from '../../constant';

import { Modal } from '../modal';
import { ImportForm } from '../importForm';

import { dateTime } from '../../utility/dateTime';
import { node } from '../../utility/node';
import { complexNode } from '../../utility/complexNode';
import { isJson } from '../../utility/isJson';
import { clearChildNode } from '../../utility/clearChildNode';

const data = {};

data.set = (key, data) => {
  window.localStorage.setItem(key, data);
};

data.get = (key) => {
  return window.localStorage.getItem(key);
};

data.import = {
  state: {
    setup: { include: true },
    bookmark: { include: true, type: 'restore' },
    theme: { include: true }
  },
  reset: () => {
    data.import.state.setup.include = true;

    data.import.state.bookmark.include = true;

    data.import.state.bookmark.type = 'restore';

    data.import.state.theme.include = true;
  },
  file: ({
    fileList = false,
    feedback = false,
    input = false
  } = {}) => {
    if (fileList.length > 0) {
      data.validate.file({
        fileList: fileList,
        feedback: feedback,
        input: input
      });
    }
  },
  drop: ({
    fileList = false,
    feedback = false
  }) => {
    if (fileList.length > 0) {
      data.validate.file({
        fileList: fileList,
        feedback: feedback
      });
    }
  },
  paste: ({
    clipboardData = false,
    feedback = false
  }) => {
    data.validate.paste({
      clipboardData: clipboardData,
      feedback: feedback
    });
  },
  render: (dataToImport) => {
    let dataToCheck = JSON.parse(dataToImport);

    if (dataToCheck.version !== version.number) {
      dataToCheck = data.update(dataToCheck);
    }

    const importForm = new ImportForm({
      dataToImport: dataToCheck,
      state: data.import.state
    });

    const importModal = new Modal({
      heading: message.get('dataRestoreHeading'),
      content: importForm.form(),
      successText: message.get('dataRestoreSuccessText'),
      cancelText: message.get('dataRestoreCancelText'),
      width: 'small',
      successAction: () => {
        if (data.import.state.setup.include || data.import.state.theme.include || data.import.state.bookmark.include) {
          let dataToRestore = JSON.parse(dataToImport);

          if (dataToRestore.version !== version.number) {
            data.backup(dataToRestore);

            dataToRestore = data.update(dataToRestore);
          }

          data.restore(dataToRestore);

          // Single-shot import: force the write to disk before the reload
          // tears the page down, so the trailing-edge of the debounce can't
          // be lost on slow systems.
          data.save.flush();

          data.reload.render();
        }

        data.import.reset();
      },
      cancelAction: () => { data.import.reset(); },
      closeAction: () => { data.import.reset(); }
    });

    importModal.open();
  }
};

data.validate = {
  paste: ({
    feedback = false
  } = {}) => {
    navigator.clipboard.readText().then(clipboardData => {
      // is the data a JSON object
      if (isJson(clipboardData)) {
        // is this JSON from this app
        if (JSON.parse(clipboardData)[APP_NAME] || JSON.parse(clipboardData)[APP_NAME.toLowerCase()]) {
          data.feedback.clear.render(feedback);

          data.feedback.success.render(feedback, 'Clipboard data', () => {
            menu.close();

            data.import.render(clipboardData);
          });
        } else {
          data.feedback.clear.render(feedback);

          data.feedback.fail.notClipboardJson.render(feedback, 'Clipboard data');
        }
      } else {
        // not a JSON object

        data.feedback.clear.render(feedback);

        data.feedback.fail.notClipboardJson.render(feedback, 'Clipboard data');
      }
    }).catch(() => {
      data.feedback.clear.render(feedback);

      data.feedback.fail.notClipboardJson.render(feedback, 'Clipboard data');
    });
  },
  file: ({
    fileList = false,
    feedback = false,
    input = false
  } = {}) => {
    // make new file reader
    const reader = new window.FileReader();

    // define the on load event for the reader
    reader.onload = (event) => {
      // is this a JSON file
      if (isJson(event.target.result)) {
        // is this JSON from this app
        if (JSON.parse(event.target.result)[APP_NAME] || JSON.parse(event.target.result)[APP_NAME.toLowerCase()]) {
          data.feedback.clear.render(feedback);

          data.feedback.success.render(feedback, fileList[0].name, () => {
            menu.close();

            data.import.render(event.target.result);
          });

          if (input) { input.value = ''; }
        } else {
          data.feedback.clear.render(feedback);

          data.feedback.fail.notAppJson.render(feedback, fileList[0].name);

          if (input) { input.value = ''; }
        }
      } else {
        // not a JSON file

        data.feedback.clear.render(feedback);

        data.feedback.fail.notJson.render(feedback, fileList[0].name);

        if (input) {
          input.value = '';
        }
      }
    };

    // invoke the reader
    reader.readAsText(fileList.item(0));
  }
};

data.export = () => {
  let timestamp = dateTime();

  const leadingZero = (value) => {
    if (value < 10) {
      value = '0' + value;
    }
    return value;
  };

  timestamp.hours = leadingZero(timestamp.hours);
  timestamp.minutes = leadingZero(timestamp.minutes);
  timestamp.seconds = leadingZero(timestamp.seconds);
  timestamp.date = leadingZero(timestamp.date);
  timestamp.month = leadingZero(timestamp.month + 1);
  timestamp.year = leadingZero(timestamp.year);
  timestamp = timestamp.year + '.' + timestamp.month + '.' + timestamp.date + ' - ' + timestamp.hours + ' ' + timestamp.minutes + ' ' + timestamp.seconds;

  const fileName = APP_NAME + ' ' + message.get('dataExportBackup') + ' - ' + timestamp + '.json';

  const dataToExport = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data.load()));

  const link = document.createElement('a');

  link.setAttribute('href', dataToExport);

  link.setAttribute('download', fileName);

  link.addEventListener('click', () => { link.remove(); });

  document.querySelector('body').appendChild(link);

  link.click();
};

data.remove = (key) => {
  window.localStorage.removeItem(key);
};

data.backup = (dataToBackup) => {
  if (dataToBackup) {
    data.set(APP_NAME + 'Backup', JSON.stringify(dataToBackup));

    console.log('data version ' + dataToBackup.version + ' backed up');
  }
};

data.update = (dataToUpdate) => {
  if (dataToUpdate.version !== version.number) {
    dataToUpdate = update.run(dataToUpdate);
  } else {
    console.log('data version:', version.number, 'no need to run update');
  }

  return dataToUpdate;
};

data.restore = (dataToRestore) => {
  if (dataToRestore) {
    console.log('data found to load');

    if (data.import.state.setup.include) {
      state.set.restore.setup(dataToRestore);
    }

    if (data.import.state.theme.include) {
      state.set.restore.theme(dataToRestore);
    }

    if (data.import.state.bookmark.include) {
      switch (data.import.state.bookmark.type) {
        case 'restore':
          bookmark.restore(dataToRestore);
          break;

        case 'append':
          bookmark.append(dataToRestore);
          break;
      }
    }
  } else {
    console.log('no data found to load');

    state.set.default();
  }
};

// Debounced save. Heavy because it serialises the entire state + every
// bookmark to localStorage; with 218 callsites across the codebase, naive
// per-event saves were a measurable hot path during settings spam.
//
// Strategy: leading-edge save (so the first action persists immediately),
// then a 250 ms trailing flush that catches any further calls in the window.
// 250 ms still coalesces slider/colour-picker spam (UI events are <=60 Hz)
// while keeping the at-risk window short for Safari Cmd+Q quits.
// `data.save.flush()` forces an immediate write — call it from import/export
// paths and any spot that needs the on-disk state before yielding control.
const _doSave = () => {
  data.set(APP_NAME, JSON.stringify({
    [APP_NAME]: true,
    version: version.number,
    state: state.get.current(),
    bookmark: bookmark.all
  }));
};

let _saveTimer = null;
let _savePending = false;

data.save = () => {
  if (_saveTimer === null) {
    _doSave();
    _saveTimer = setTimeout(() => {
      _saveTimer = null;
      if (_savePending) {
        _savePending = false;
        _doSave();
      }
    }, 250);
  } else {
    _savePending = true;
  }
};

data.save.flush = () => {
  if (_saveTimer !== null) {
    clearTimeout(_saveTimer);
    _saveTimer = null;
  }
  _savePending = false;
  _doSave();
};

// Page-lifecycle flush hooks. Safari is well known to skip `beforeunload`
// when the app quits (Cmd+Q) — the kill is too fast and modern WebKit
// deprioritises the event for extension new-tab pages. We listen to all
// three events so at least one fires before the page is torn down, with
// a `_flushIfPending` guard so each Cmd+Q triggers at most one `_doSave`.
if (typeof window !== 'undefined') {
  const _flushIfPending = () => {
    if (_saveTimer !== null || _savePending) data.save.flush();
  };
  // pagehide: Safari's preferred event for tab/window close.
  window.addEventListener('pagehide', _flushIfPending);
  // visibilitychange -> hidden: WebKit's "save now, you may not get
  // another tick"; fires before pagehide on quit/hide.
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') _flushIfPending();
    });
  }
  // beforeunload: kept for the cross-browser build (same dist/web/ ships
  // as the Chrome/Firefox extension).
  window.addEventListener('beforeunload', _flushIfPending);
}

data.load = () => {
  if (data.get(APP_NAME) !== null && data.get(APP_NAME) !== undefined) {
    let dataToLoad = JSON.parse(data.get(APP_NAME));

    if (dataToLoad.version !== version.number) {
      data.backup(dataToLoad);

      dataToLoad = data.update(dataToLoad);
    }

    return dataToLoad;
  } else {
    return false;
  }
};

data.wipe = {
  all: () => {
    data.remove(APP_NAME);

    data.reload.render();
  },
  partial: () => {
    bookmark.reset();

    data.set(APP_NAME, JSON.stringify({
      [APP_NAME]: true,
      version: version.number,
      state: state.get.default(),
      bookmark: bookmark.all
    }));

    data.reload.render();
  }
};

data.reload = {
  render: () => {
    window.location.reload();
  }
};

data.clear = {
  all: {
    render: () => {
      const clearModal = new Modal({
        heading: message.get('dataClearAllHeading'),
        content: node('div', [
          node(`p:${message.get('dataClearAllContentPara1')}`),
          node(`p:${message.get('dataClearAllContentPara2')}`)
        ]),
        successText: message.get('dataClearAllSuccessText'),
        cancelText: message.get('dataClearAllCancelText'),
        width: 'small',
        successAction: () => {
          data.wipe.all();
        }
      });

      clearModal.open();
    }
  },
  partial: {
    render: () => {
      const clearModal = new Modal({
        heading: message.get('dataClearPartialHeading'),
        content: node('div', [
          node(`p:${message.get('dataClearPartialContentPara1')}`),
          node(`p:${message.get('dataClearPartialContentPara2')}`)
        ]),
        successText: message.get('dataClearPartialSuccessText'),
        cancelText: message.get('dataClearPartialCancelText'),
        width: 35,
        successAction: () => {
          data.wipe.partial();
        }
      });

      clearModal.open();
    }
  }
};

data.feedback = {};

data.feedback.empty = {
  render: (feedback) => {
    feedback.appendChild(node(`p:${message.get('dataFeedbackEmpty') || 'Text'}|class:muted small`));
  }
};

data.feedback.clear = {
  render: (feedback) => {
    clearChildNode(feedback);
  }
};

data.feedback.success = {
  render: (feedback, filename, action) => {
    feedback.appendChild(node(`p:${message.get('dataFeedbackSuccess')}|class:muted small`));

    feedback.appendChild(node('p:' + filename));

    if (action) {
      data.feedback.animation.set.render(feedback, 'is-pop', action);
    }
  }
};

data.feedback.fail = {
  notJson: {
    render: (feedback, filename) => {
      feedback.appendChild(node(`p:${message.get('dataFeedbackFailNotJson')}|class:small muted`));
      feedback.appendChild(complexNode({ tag: 'p', text: filename }));
      data.feedback.animation.set.render(feedback, 'is-shake');
    }
  },
  notAppJson: {
    render: (feedback, filename) => {
      feedback.appendChild(node(`p:${message.get('dataFeedbackFailNotAppJson')}|class:small muted`));
      feedback.appendChild(complexNode({ tag: 'p', text: filename }));
      data.feedback.animation.set.render(feedback, 'is-shake');
    }
  },
  notClipboardJson: {
    render: (feedback, name) => {
      feedback.appendChild(node(`p:${message.get('dataFeedbackFailNotClipboardJson')}|class:small muted`));
      feedback.appendChild(node('p:' + name));
      data.feedback.animation.set.render(feedback, 'is-shake');
    }
  }
};

data.feedback.animation = {
  set: {
    render: (feedback, animationClass, action) => {
      feedback.classList.add(animationClass);

      const animationEndAction = () => {
        if (action) {
          action();
        }
        data.feedback.animation.reset.render(feedback);
      };

      feedback.addEventListener('animationend', animationEndAction);
    }
  },
  reset: {
    render: (feedback) => {
      feedback.classList.remove('is-shake');
      feedback.classList.remove('is-pop');
      feedback.classList.remove('is-jello');
      feedback.removeEventListener('animationend', data.feedback.animation.reset.render);
    }
  }
};

data.init = () => {
  data.restore(data.load());
};

export { data };
