import Css from "./css";
import DomController from "./dom-controller";
import Api from "./api";
import Storage from "./storage";

import WebBindings from "./api/web-bindings";

class Raspisator {
  constructor() {
    this.Storage = Storage;
    this.Api = new Api();
    this.WebBindings = new WebBindings();
    this.Controller = new DomController(this);
  }

  start() {
    console.log("VVK-Raspisator Started");
    Css.load();
    this.Controller.init();

    unsafeWindow.webBindings = new WebBindings();
  }
}

export default Raspisator;
