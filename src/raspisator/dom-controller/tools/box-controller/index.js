import isElement from "../../../tools/is-element";
import EventEmitter from "../../../tools/event-emitter";

import BoxHTML from "./plains/box.html";
import ButtonHTML from "./plains/button.html";

class BoxController {
  constructor() {
    return this.createBox(...arguments);
  }

  createBox(params = {}) {
    const events = new EventEmitter();

    const { width, height, title, body } = params;
    const { MessageBox, boxQueue } = unsafeWindow;

    const mBox = MessageBox();

    const container = BoxHTML.createElement();
    container.setAttribute("tabindex", "0");
    container.style.width = typeof width !== "undefined" ? width + "px" : 450 + "px";
    container.style.height = typeof height !== "undefined" ? height + "px" : "auto";
    container.addEventListener("click", () => {
      boxQueue.skip = true;
    });

    const mContainer = mBox.bodyNode.parentNode;
    const box_layer = mContainer.parentNode;
    box_layer.replaceChild(container, mContainer);

    const x_button = container.querySelector(".box_x_button");
    const box_title = container.querySelector(".box_title");
    const box_body = container.querySelector(".box_body");
    const box_title_wrap = container.querySelector(".box_title_wrap");
    const box_controls_wrap = container.querySelector(".box_controls_wrap");

    box_controls_wrap.style.display = "none";

    mBox.titleWrap = box_title_wrap;
    mBox.bodyNode = box_body;

    const controls = {
      events,
      mBox,
      get body() {
        return mBox.bodyNode;
      },
      show() {
        mBox._show();
        boxQueue.curBox = mBox.guid;

        if (!boxQueue._boxes.includes(mBox.guid)) {
          boxQueue._boxes.push(mBox.guid);
        }

        this.updateOffset();
      },
      close(needEvent) {
        let closeFlag = true;

        if (needEvent) {
          events.emit("beforeclose", {
            preventDefault() {
              closeFlag = false;
            }
          });
        }

        if (closeFlag === true) {
          x_button.removeEventListener("click", this.close);
          boxQueue._boxes.splice(boxQueue._boxes.indexOf(mBox.guid, 1));

          mBox._show();
          mBox._hide();

          events.emit("afterclose");
        }
      },
      hide() {
        mBox._hide(null, true);
      },
      updateOffset() {
        const calculated = (window.innerHeight / 2 - container.clientHeight / 2);
        box_layer.style.marginTop = calculated > 80 ? calculated + "px" : "80px";
      },
      setTitle(inner) {
        box_title.innerHTML = inner;
        this.updateOffset();
      },
      setBody(inner) {
        if (typeof inner === "string") {
          box_body.innerHTML = inner;
        } else if (isElement(inner)) {
          box_body.innerHTML = "";
          box_body.appendChild(inner);
        }

        this.updateOffset();
      },
      addButton(text, func) {
        const row = box_controls_wrap.querySelector(".box_controls > table > tbody > tr");

        const td = ButtonHTML.createElement();
        const button = td.querySelector("button");
        button.innerHTML = text || "TEXT";
        button.addEventListener("click", () => {
          func();
        });

        if (box_controls_wrap.style.display === "none") {
          box_controls_wrap.style.display = "block";
        }

        row.appendChild(button);
      }
    };

    x_button.addEventListener("click", controls.close);
    controls.setTitle(title || "BOX TITLE");
    controls.setBody(body || "BOX BODY");

    return controls;
  }
}

export default BoxController;
