import VKDomChangesListener from "./listener";
import Modifiers from "./modifiers/index.js";

// здесь принмаются элементы из обсервера (листенера)
// и рассылаются по нужным функциям из контроллера
class DomController {
  constructor(rs) {
    this.rs = rs;
    this.modifiers = new Modifiers(rs);
  }

  init() {
    const listener = new VKDomChangesListener();

    listener.on("WallPost", (node) => {
      this.modifiers.wall.postHandler(node);
    });
  }
}

export default DomController;
