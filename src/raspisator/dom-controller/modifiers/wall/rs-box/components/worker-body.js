import WorkerBodyHTML from "./plains/worker-body.html";

class WorkerBody {
  constructor() {
    const body = WorkerBodyHTML.createElement();

    const Controls = {
      body,
      progress_bar: body.querySelector(".ui_progress_bar"),
      percents_bar: body.querySelector(".percents-bar"),
      worker_log: body.querySelector(".worker-body > .log"),
      setProgress(percents, string) {
        const { progress_bar, percents_bar } = this;
        percents_bar.innerHTML = `${percents}%${string ? " " + string : ""}`;
        progress_bar.style.width = `${percents}%`;
      },
      log(string) {
        const { worker_log } = this;

        const div = document.createElement("div");
        div.innerHTML += string;

        worker_log.appendChild(div);

        if (worker_log.scrollHeight - worker_log.scrollTop < 260) {
          worker_log.scrollTop = worker_log.scrollHeight - worker_log.clientHeight;
        }
      },
      logOk(string) {
        this.log(`[ОК] -> ${string}`);
      },
      logWarn(string) {
        this.log(`[ВНИМАНИЕ] -> ${string}`);
      },
      logError(e) {
        this.log(`[ОШИБКА] -> ${e.message ? "MESSAGE: " + e.message + (e.stack ? ", STACK: " + e.stack : "") : (typeof e === "object" ? JSON.stringify(e) : e)}`);
      },
      end() {
        const { progress_bar, percents_bar } = this;
        percents_bar.innerHTML = "100% - Готово!";
        progress_bar.parentNode.style.display = "none";
      }
    };

    return Controls;
  }
}

export default WorkerBody;