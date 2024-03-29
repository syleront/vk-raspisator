import querystring from "../tools/querystring";
import request from "../tools/request";

import Cart from "./cart";

class Api {
  constructor(vvk) {
    this.vvk = vvk;
    this.hash = null;
    this.cart = new Cart(334);
  }

  async req(method, params = {}) {
    if (!this.hash) {
      let b = await request.get("https://vk.com/dev/execute");
      let matchedHash = b.match(/Dev\.methodRun\('([A-z0-9:]+)/i);

      if (matchedHash) {
        this.hash = matchedHash[1];
        return this.req(method, params);
      } else {
        throw "user isn't logged";
      }
    } else {
      let data = {
        act: "a_run_method",
        al: 1,
        method: "execute",
        param_v: "5.101",
        hash: this.hash,
      };

      if (method == "execute") {
        for (let x in params) {
          data["param_" + x] = params[x];
        }
      } else {
        data.param_code = "return API." + method + "(" + JSON.stringify(params) + ");";
      }

      let f = async () => {
        let r = await request.post("https://vk.com/dev", {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: querystring.stringify(data)
        });

        let callInfo = r.replace(/^<!-+/, "").split("<!>");

        let payload;
        if (callInfo.length === 1) {
          payload = JSON.parse(callInfo[0]).payload;
        } else {
          callInfo.splice(callInfo.indexOf(callInfo[4]), 1);
          callInfo.splice(callInfo.indexOf(callInfo[5]), 1);
          payload = [callInfo[4], callInfo];
        }

        console.log("PAYLOAD:", payload);

        if (payload[0] == 0) {
          let json = JSON.parse(payload[1]);

          if (json.payload && json.payload[1]) {
            json = JSON.parse(json.payload[1][0]);
          }

          if (json.error) {
            throw json;
          } else {
            return json.response || json;
          }
        } else if (payload[0] == 8) {
          this.hash = null;
          return this.req(method, params);
        } else {
          console.log("UNKNOWN API ERROR: ", r);
          throw "unknown api error";
        }
      };

      return new Promise((resolve, reject) => {
        this.cart.addToQueue(f, resolve, reject);
      });
    }
  }
}

export default Api;
