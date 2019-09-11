import VKDomChangesListener from "./listener";
import Modifiers from "./modifiers/index.js";

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
