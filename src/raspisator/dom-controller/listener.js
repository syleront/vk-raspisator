class VKDomChangesListener {
  constructor() {
    this.events = [];
    this.init();
  }

  emit(name, data) {
    if (typeof data === "object" && data.dataset && !data.dataset.rsPassed) {
      data.dataset.rsPassed = true;
      this.events.forEach((e) => {
        if (e.name === name) {
          e._cb(data);
        }
      });
    }
  }

  on(name, _cb) {
    this.events.push({ name, _cb });
  }

  init() {
    new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const addedNodes = Array.from(mutation.addedNodes);

        const self = this;
        addedNodes.forEach(function nodeHandler(node) {
          const { classList, dataset } = node;

          if (node.id === "wrap3" || node.id === "wrap2" || node.id === "wrap1" || node.id === "profile_wall") {
            const childList = node.querySelectorAll("*");
            Array.from(childList).forEach(nodeHandler);
          } else if (dataset && dataset.postId && classList && classList.contains("post")) {
            self.emit("WallPost", node);
          }
        });
      });
    }).observe(document, {
      childList: true,
      subtree: true
    });
  }
}

export default VKDomChangesListener;
