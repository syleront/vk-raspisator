import RsBox from "./rs-box";
import MenuElement from "./plains/menu-element";

class Wall {
  constructor(rs) {
    this.rs = rs;
    this.RsBoxInstance = new RsBox(rs);
  }

  postHandler(node) {
    const postId = node.dataset && node.dataset.postId;

    if (typeof postId !== "undefined") {
      const menu = node.querySelector(".ui_actions_menu");
      const button = new MenuElement("Расписатор");

      button.addEventListener("click", () => {
        const { rs } = this;

        const RsBoxInstance = new RsBox(rs);
        RsBoxInstance.load(postId);
      });

      menu.appendChild(button);
    }
  }
}

export default Wall;
