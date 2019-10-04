import RaspisatorBody from "./components/rs-body";
import RsWorker from "./worker";

import Helpers from "../../../../tools/vk-helpers";
import VKBox from "../../../tools/box-controller";

class RsBox {
  constructor(rs) {
    this.rs = rs;
  }

  load(postId) {
    const { rs } = this;

    // создаем тело и основной бокс с ним
    const RsBody = new RaspisatorBody(rs, postId);
    const MainBox = new VKBox({
      title: "Расписатор",
      body: RsBody.body,
      width: 500
    });

    // объект с функциями для боксов аттачей
    const Handlers = {
      onMediaChoose(type, media_id, info) {
        const { boxQueue, cur } = unsafeWindow;

        // костыль, ибо при выборе фото вк не отдает тип
        if (typeof media_id === "object") {
          info = media_id;
          media_id = type;
          type = "photo";
        }

        console.log("MEDIA CHOSEN", arguments, MainBox);
        console.log("TYPE:", type, "ID:", media_id, "INFO:", info);

        // костыль шоб закрывался бокс, при одиночном выборе
        if (!cur.selectedCount || cur.selectedCount() === 0 && boxQueue.curBox !== MainBox.mBox.guid) {
          boxQueue.hideLast();
        }

        RsBody.addAttachment(type, media_id, info);

        // чтобы не было редиректа на аттач, возвращаем false
        return false;
      },
      onMediaProgress(type, order, info) {
        console.log("MEDIA PROGRESS", arguments);

        if (info.total === 0) {
          RsBody.addLoadState(info.fileName);
        } else if (info.total === info.loaded) {
          // снова костыль ибо вк отдает все стейты с именем первого файла -_-
          try {
            RsBody.removeLoadState(info.fileName);
          } catch (e) {
            RsBody.removeLastLoadState();
          }
        }

        return false;
      },
      attachCount() {
        return RsBody.media_stash.length;
      }
    };

    // назначаем функции на кнопки для прикрепления фото/аудио/видео/доков
    RsBody.photo_attach.addEventListener("click", () => {
      if (RsBody.media_stash.length >= 10) {
        Helpers.alertMaxFiles();
      } else {
        Helpers.showPhotoAttachBox(Handlers);
      }
    });

    RsBody.video_attach.addEventListener("click", () => {
      if (RsBody.media_stash.length >= 10) {
        Helpers.alertMaxFiles();
      } else {
        Helpers.showVideoAttachBox(Handlers);
      }
    });

    RsBody.audio_attach.addEventListener("click", () => {
      if (RsBody.media_stash.length >= 10) {
        Helpers.alertMaxFiles();
      } else {
        Helpers.showAudioAttachBox(Handlers);
      }
    });

    RsBody.doc_attach.addEventListener("click", () => {
      if (RsBody.media_stash.length >= 10) {
        Helpers.alertMaxFiles();
      } else {
        Helpers.showDocAttachBox(Handlers);
      }
    });

    // добавляем кнопку для рассылки
    MainBox.addButton("Начать", () => {
      // получаем данные с тела расписатора
      const {
        needSubscribe,
        sendType,
        needWebApi,
        countRecievedUsers,
        needInterval,
        intervalValue
      } = RsBody.getSendParams();
      const sendData = RsBody.getSendData();

      // если ничего нет, то рассылать бессмысленно
      if (sendData.text === "" && sendData.media.length === 0) {
        Helpers.showDoneBox("Нельзя рассылать пустые записи (прикрепите хотя-бы один файл, или напишите один символ)");
      } else {
        // скрываем основной бокс
        MainBox.hide();

        console.log("PARAMS:", RsBody.getSendParams());
        console.log("DATA:", RsBody.getSendData());

        // создаем рассылочный модуль
        const Worker = new RsWorker({
          rs,
          postId,
          needSubscribe,
          sendType,
          sendData,
          needWebApi,
          countRecievedUsers,
          needInterval,
          intervalValue
        });

        // запускаем, и получаем бокс воркера
        const WorkerBox = Worker.start();

        // вешаем евент перед закрытием бокса, для алерта
        WorkerBox.events.on("beforeclose", (evt) => {
          // прерываем дефолтное закрытие
          evt.preventDefault();

          // Если воркер закончил работу - показывать предупреждение незачем, и можно закрыть основной бокс
          if (Worker.endState === true) {
            WorkerBox.close();
            MainBox.close();
          } else {
            // создаем бокс подтверждения выхода
            const ConfirmExitBox = new VKBox({
              title: "Расписатор",
              body: "Вы действительно хотите прервать процесс рассылки?"
            });

            // не закрывать бокс по нажатию на крестик (а то баг будет, лень фиксить)
            ConfirmExitBox.events.on("beforeclose", (evt) => {
              evt.preventDefault();
            });

            // если да - закрываем бокс воркера с подтверждением, и показываем основной
            ConfirmExitBox.addButton("Да", () => {
              Worker.stop();
              ConfirmExitBox.close();
              WorkerBox.close();
              MainBox.show();
            });

            // если нет - закрываем подтверждение, и возвращаем бокс воркера
            ConfirmExitBox.addButton("Нет", () => {
              ConfirmExitBox.close();
              WorkerBox.show();
            });

            // скрываем бокс воркера, и показываем подтверждение выхода
            WorkerBox.hide();
            ConfirmExitBox.show();
          }
        });

        // после того как закрылся бокс воркера, показываем основной
        WorkerBox.events.on("afterclose", () => {
          MainBox.show();
        });
      }
    });

    // показываем основной бокс
    MainBox.show();
  }
}

export default RsBox;
