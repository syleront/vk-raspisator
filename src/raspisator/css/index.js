import MainStyle from "./main.css";

class Css {
  static load() {
    const style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML = MainStyle;
    document.head.appendChild(style);
  }
}

export default Css;
