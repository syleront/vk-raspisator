import FormatSeconds from "../../../../../tools/format-seconds";

import RsBodyHTML from "./plains/rs-body.html";
import RsPhotoHTML from "./plains/rs-image.html";
import RsAudioHTML from "./plains/rs-audio.html";
import RsVideoHTML from "./plains/rs-video.html";
import RsDocHTML from "./plains/rs-doc.html";

class RsBody {
  constructor(rs, postId) {
    const { stManager, checkbox } = unsafeWindow;
    const { Storage, Api } = rs;

    // для нормальной работы элементов интерфейса
    stManager.add(["docs.css", "settings.css", "tooltips.js"]);

    // создаем элемент из html темплейта
    const body = RsBodyHTML.createElement();

    // собираем все в одну кучу, шоб удобно было
    const Controls = {
      body,
      media_stash: [],
      input: body.querySelector("textarea"),
      photo_attach: body.querySelector(".ms_item_photo"),
      video_attach: body.querySelector(".ms_item_video"),
      audio_attach: body.querySelector(".ms_item_audio"),
      doc_attach: body.querySelector(".ms_item_doc"),
      checkboxes: Array.from(body.querySelectorAll(".checkbox")),
      interval_options: Array.from(body.querySelectorAll(".rs-select.interval > option")),
      saveData(type, data, isRemove) {
        // если нет данных в Storage - создаем
        if (!Storage.saved[postId]) {
          Storage.saved[postId] = {
            media: [],
            text: "",
            params: {},
            recievedList: {}
          };
        }

        // проверяем тип данных и сохраняем
        if (type === "media") {
          // если isRemove = true, то сохраняем снова
          // без того медиа, что пришло в data
          if (isRemove === true) {
            Storage.saved[postId].media = Storage.saved[postId].media.filter((e) => e[1] !== data[1]);
          } else {
            Storage.saved[postId].media.push(data);
          }
        } else if (type === "text") {
          Storage.saved[postId].text = data;
        } else if (type === "params") {
          Storage.saved[postId].params = data;
        }

        Storage.save();
      },
      getSendData() {
        const { input, media_stash } = this;

        return {
          text: input.value,
          media: media_stash
        };
      },
      getSendParams() {
        const { checkboxes, interval_options } = this;

        const sendType = checkboxes.filter((e) => e.dataset.paramType === "sendBy" && e.getAttribute("aria-checked") === "true")[0].dataset.sendType;
        const needSubscribe = checkboxes.filter((e) => e.dataset.paramType === "needSubscribe")[0].getAttribute("aria-checked") === "true";
        const countRecievedUsers = checkboxes.filter((e) => e.dataset.paramType === "countRecievedUsers")[0].getAttribute("aria-checked") === "true";
        const needWebApi = checkboxes.filter((e) => e.dataset.paramType === "needWebApi")[0].getAttribute("aria-checked") === "true";
        const needInterval = checkboxes.filter((e) => e.dataset.paramType === "needInterval")[0].getAttribute("aria-checked") === "true";
        const intervalValue = parseInt(interval_options.filter((e) => e.selected === true)[0].dataset.interval) * 1000;

        return { sendType, needSubscribe, needWebApi, countRecievedUsers, needInterval, intervalValue };
      },
      addToStash(attachment) {
        this.media_stash.push(attachment);
      },
      removeFromStash(attachment) {
        this.media_stash.splice(this.media_stash.indexOf(attachment), 1);
      },
      async addAttachment(type, media_id, info) {
        // основная функция, для добавления аттачей из аттач боксов

        const attachment = type + media_id;

        // если медиа уже есть в списке - пропускаем
        if (this.media_stash.includes(attachment)) {
          return;
        } else {
          this.addToStash(attachment);
        }

        // функция удаления аттачей
        const closeBtnFunc = (el) => {
          // удаляем из списка аттачей и сохраняем с isRemove = true
          this.removeFromStash(attachment);
          this.saveData("media", [type, media_id, info], true);
          el.remove();
        };

        if (type === "photo") {
          const photo = RsPhotoHTML.createElement();
          photo.style.backgroundImage = "url(" + info.thumb_m + ")";
          photo.dataset.info = JSON.stringify(info);
          photo.addEventListener("click", (evt) => {
            if (evt.target === photo) {
              // открываем в другом окне, чтобы не было конфликтов с основным боксом
              window.open(location.pathname + "?z=photo" + media_id + "%2F" + info.list);
            }
          });

          const close_btn = photo.querySelector("._close_btn");
          close_btn.addEventListener("click", () => {
            closeBtnFunc(photo);
          });

          body.querySelector(".attachment-container > .photos").appendChild(photo);
        } else if (type === "video") {
          const video = RsVideoHTML.createElement();
          video.dataset.info = JSON.stringify(info);
          video.style.backgroundImage = "url(" + info.thumb + ")";
          video.addEventListener("click", (evt) => {
            if (evt.target === video) {
              // открываем в другом окне, чтобы не было конфликтов с основным боксом
              window.open("/video" + media_id);
            }
          });

          const time_label = video.querySelector(".video_thumb_label_item");
          time_label.innerHTML = info.editable.duration;

          const close_btn = video.querySelector("._close_btn");
          close_btn.addEventListener("click", () => {
            closeBtnFunc(video);
          });

          body.querySelector(".attachment-container > .videos").appendChild(video);
        } else if (type === "audio") {
          const [, , , title, artist, duration] = info;

          const row = RsAudioHTML.createElement();

          const audio = row.querySelector("div");
          audio.dataset.fullId = media_id;
          audio.dataset.audio = JSON.stringify(info);
          audio.classList.add("_audio_row_" + media_id);

          const audio_artist = row.querySelector(".artist_link");
          audio_artist.innerHTML = artist;
          audio_artist.dataset.performer = artist;
          audio_artist.addEventListener("click", () => {
            const href = "/audio?performer=1&q=" + encodeURIComponent(artist);
            window.open(href);
          });

          const audio_title = row.querySelector("._audio_row__title_inner");
          audio_title.innerHTML = title;

          const audio_duration = row.querySelector("._audio_row__duration");
          audio_duration.innerHTML = FormatSeconds(duration);

          const close_btn = row.querySelector("._close_btn");
          close_btn.addEventListener("click", () => {
            closeBtnFunc(row);
          });

          body.querySelector(".attachment-container > .audios").appendChild(row);
        } else if (type === "doc") {
          let { title, ext, type } = info;

          // вк отдает нужную инфу не для всех типов, получаем ее сами
          if (typeof title === "undefined" || typeof ext === "undefined") {
            const [res] = await Api.req("docs.getById", { docs: media_id });
            title = res.title;
            ext = res.ext;
          }

          const row = RsDocHTML.createElement();

          const item = row.querySelector(".doc > div");
          item.id = "docs_file_" + media_id;

          const item_a = item.querySelector("a");
          item_a.setAttribute("ext", ext);
          item_a.setAttribute("aria-label", title);
          item_a.classList.add("docs_icon_type" + type);
          item_a.addEventListener("click", () => {
            window.open("/doc" + media_id);
          });

          const cont_a = item.querySelector(".docs_item_cont > a");
          cont_a.setAttribute("title", title);
          cont_a.innerHTML = title;
          cont_a.addEventListener("click", () => {
            window.open("/doc" + media_id);
          });

          const close_btn = row.querySelector("._close_btn");
          close_btn.addEventListener("click", () => {
            closeBtnFunc(row);
          });

          body.querySelector(".attachment-container > .docs").appendChild(row);
        }

        this.saveData("media", [type, media_id, info]);
      },
      addLoadState(filename = "") {
        const div = document.createElement("div");
        div.classList.add("state");
        div.dataset.filename = filename;
        div.innerHTML = "Загрузка " + filename + "...";

        return body.querySelector(".attachment-states").appendChild(div);
      },
      removeLoadState(filename = "") {
        const state_nodes = body.querySelector(".attachment-states").childNodes;

        const removed = Array.from(state_nodes).some((node) => {
          if (node.dataset === filename) {
            node.remove();
            return true;
          }
        });

        if (removed) {
          return true;
        } else {
          throw new Error();
        }
      },
      removeLastLoadState() {
        return body.querySelector(".attachment-states").firstChild.remove();
      }
    };

    // проверяем и восстанавливаем сохраненные данные для поста
    if (Storage.saved[postId]) {
      const { media, text, params } = Storage.saved[postId];

      // посылаем сохраненные медиа в тело
      media.forEach(([type, media_id, info]) => {
        Controls.addAttachment(type, media_id, info);
      });

      // меняем текст на сохраненный ранее
      Controls.input.value = text;

      // восстанавливаем стейты чекбоксов
      Controls.checkboxes.forEach((el) => {
        const { paramType, sendType } = el.dataset;
        const isChecked = el.getAttribute("aria-checked") === "true";

        if (paramType === "sendBy") {
          if (sendType === params.sendType) {
            if (isChecked === false) {
              checkbox(el);
            } else {
              return;
            }
          } else if (isChecked === true) {
            checkbox(el);
          }
        } else if (paramType && params[paramType] === true && isChecked === false) {
          checkbox(el);
        } else if (paramType && params[paramType] === false && isChecked === true) {
          checkbox(el);
        }
      });
    }

    // делаем чекбоксы функциональными
    Controls.checkboxes.forEach((target) => {
      target.addEventListener("click", () => {
        const { paramType } = target.dataset;
        const isTargetChecked = target.getAttribute("aria-checked") === "true";

        // один из send_by обязательно долден быть true
        if (paramType === "sendBy" && isTargetChecked === true) {
          return;
        } else {
          // убираем стейт с другого такого же paramType чекбокса, если он есть
          Controls.checkboxes.filter((e) => e.dataset.paramType === paramType).forEach((el) => {
            const isChecked = el.getAttribute("aria-checked") === "true";
            if (isChecked === true && el !== target) {
              checkbox(el);
            }
          });

          // меняем стейт чекбокса
          checkbox(target);

          // сохраняем обновленные параметры
          const updatedParams = Controls.getSendParams();
          Controls.saveData("params", updatedParams);
        }
      });
    });

    // сохранение текста
    // используется таймер, чтобы не сохранять после каждого введенного символа
    Controls.input.addEventListener("input", () => {
      // если таймер уже есть - обнуляем его
      if (Controls._inputTimeout) {
        clearTimeout(Controls._inputTimeout);
      }

      // устанавливаем новый таймер для сохранения
      Controls._inputTimeout = setTimeout(() => {
        Controls._inputTimeout = null;
        Controls.saveData("text", Controls.input.value);
      }, 500);
    });

    // сохраняем данные
    Controls.saveData("params", Controls.getSendParams());

    body.querySelector(".header").addEventListener("click", () => {
      console.log("DATA:", Controls.getSendData(), "PARAMS:", Controls.getSendParams());
    });

    return Controls;
  }
}

export default RsBody;
