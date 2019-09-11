import Config from "./config";

const data = Object.assign(Config.defaults, JSON.parse(unsafeWindow.localStorage.getItem(Config.settingsName)) || {});

const Storage = new Proxy(data, {
  get(target, prop) {
    if (prop === "save") {
      return () => {
        unsafeWindow.localStorage.setItem(Config.settingsName, JSON.stringify(data));
      };
    } else {
      return target[prop];
    }
  },
  set(target, prop, value) {
    data[prop] = value;
    return true;
  }
});

export default Storage;
