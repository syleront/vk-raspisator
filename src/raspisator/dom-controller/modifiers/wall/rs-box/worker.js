import VKBox from "../../../tools/box-controller";
import Events from "../../../../tools/event-emitter";

import WorkerBody from "./components/worker-body";

class RsWorker {
  constructor(params = {}) {
    const {
      rs,
      postId,
      needSubscribe,
      sendType,
      sendData,
      needWebApi,
      countRecievedUsers
    } = params;

    this.rs = rs;
    this.postId = postId;
    this.needSubscribe = needSubscribe;
    this.sendType = sendType;
    this.sendData = sendData;
    this.needWebApi = needWebApi;
    this.countRecievedUsers = countRecievedUsers;

    this.stopState = false;
    this.endState = false;
    this.events = new Events();

    // костыли, из-за моего любимого this в жс
    this.events.on("stop", () => {
      this.stopState = true;
    });

    this.events.on("end", () => {
      this.endState = true;
    });
  }

  start() {
    const { vk } = unsafeWindow;

    const {
      rs,
      postId,
      needSubscribe,
      sendType,
      sendData,
      needWebApi,
      countRecievedUsers,
      events
    } = this;

    const { Api, WebBindings, Storage } = rs;

    // тот же this костыль
    let isStopped = false;
    events.on("stop", () => {
      isStopped = true;
    });

    const [owner_id, item_id] = postId.split("_");

    const WrBody = new WorkerBody();
    const WrBox = new VKBox({
      title: "Расписатор",
      body: WrBody.body,
      width: 500
    });

    // основная каша, где творится магия
    (async function main() {
      let userList = []; // список, по которому будет рассылка
      let isStopDetected; // переменная для проверки, если рассылка была прервана

      WrBody.logOk(`Рассылка по ${sendType === "repost" ? "репостам" : "лайкам"}`);
      WrBody.logOk("Получение списка...");

      isStopDetected = await (async function getAll(offset) {
        if (isStopped === true) {
          return true;
        } else {
          const stepCount = 1000;

          try {
            const r = await Api.req("likes.getList", {
              count: stepCount,
              type: "post",
              filter: sendType === "like" ? "likes" : "copies",
              owner_id,
              item_id,
              offset
            });

            userList.push(...r.items);
            WrBody.logOk(`Получение списка [${userList.length}/${r.count}]`);

            if (r.count > offset + stepCount) {
              return await getAll(offset + stepCount);
            } else {
              return false;
            }
          } catch (e) {
            WrBody.logError(e);
          }
        }
      })(0);

      if (isStopDetected === true) {
        console.log("STOP DETECTED");
        return;
      }

      if (userList.length === 0) {
        WrBody.logError("Список пуст! Рассылка невозможна!");
      } else {
        WrBody.logOk("Список получен");

        if (needSubscribe === true && owner_id.startsWith("-")) {
          const stepCount = 500;
          const subscribedList = [];

          isStopDetected = await (async function getAllSubscribers(offset) {
            if (isStopped === true) {
              return true;
            } else {
              const r = await Api.req("groups.isMember", {
                count: stepCount,
                user_ids: userList.slice(offset, offset + stepCount),
                group_id: owner_id.substr(1)
              });

              const tempList = r.filter((e) => e.member === 1).map((e) => e.user_id);
              subscribedList.push(...tempList);

              if (r.count > offset + stepCount) {
                return await getAllSubscribers(offset + stepCount);
              } else {
                return false;
              }
            }
          })(0);

          if (isStopDetected === true) {
            console.log("STOP DETECTED");
            return;
          }

          const typeString = sendType === "like" ? "лайкнувших" : "репостнувших";
          const unsubCount = userList.length - subscribedList.length;

          if (unsubCount > 0) {
            WrBody.logWarn(`${unsubCount} человек(а) из ${typeString} не подписан(ы)`);
          }

          userList = subscribedList;
        } else if (needSubscribe === false && !owner_id.startsWith("-")) {
          WrBody.logWarn("Подписки можно учитывать только в группе");
        }

        if (countRecievedUsers === true) {
          const recievedList = Object.keys(Storage.saved[postId].recievedList);

          if (recievedList.length > 0) {
            const filteredList = userList.filter((user) => !recievedList.includes(user.toString()));
            WrBody.logOk(`Пропущено ${userList.length - filteredList.length} из ${userList.length} (получившие роспись)`);
            userList = filteredList;
          }
        } else {
          Storage.saved[postId].recievedList = {};
          Storage.save();
        }

        WrBody.logOk(`Итого пользователей: ${userList.length}`);
        WrBody.logOk("Начинаем рассылку...");

        isStopDetected = await (async function dispatchAll() {
          for (let i = 0; i < userList.length; i++) {
            const id = userList[i];

            // чтобы не отправлять пост самому себе
            if (id == vk.id) {
              continue;
            } else {
              if (isStopped === true) {
                return true;
              } else {
                WrBody.setProgress(Math.floor(i / userList.length * 100), `[${i + 1}/${userList.length}]`);

                try {
                  if (needWebApi === true) {
                    await WebBindings.wallPost({
                      owner_id: id,
                      message: sendData.text,
                      attachments: sendData.media
                    });
                  } else {
                    await Api.req("wall.post", {
                      owner_id: id,
                      message: sendData.text,
                      attachments: sendData.media.join(",")
                    });
                  }

                  Storage.saved[postId].recievedList[id] = true;
                  Storage.save();

                  WrBody.logOk(`Пользователь <a href="/id${id}">${id}</a> - запись сделана`);
                } catch (e) {
                  if (needWebApi === true && e[4] === "8") {
                    WrBody.logError(`Пользователь <a href="/id${id}">${id}</a> - ${e[5]}`);
                  } else if (e.error && e.error.error_msg) {
                    WrBody.logError(`Пользователь <a href="/id${id}">${id}</a> - ${e.error.error_msg} (${e.error.error_code})`);
                  } else {
                    WrBody.logError(`Пользователь <a href="/id${id}">${id}</a> - запись не сделана`);
                    WrBody.logError(e);
                  }
                }
              }
            }
          }
        })();

        if (isStopDetected === true) {
          console.log("STOP DETECTED");
          return;
        }

        WrBody.logOk("Рассылка завершена!");
      }

      WrBody.end();

      WrBox.addButton("Закрыть", () => {
        WrBox.close(true);
      });

      events.emit("end");
    })();

    WrBox.show();
    return WrBox;
  }
}

export default RsWorker;
