import MenuHTML from "./menu-element.html";

class MenuElement {
  constructor(text) {
    const element = MenuHTML.createElement();
    element.innerHTML = text || "null";

    return element;
  }
}

export default MenuElement;
