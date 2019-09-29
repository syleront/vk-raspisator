import Request from "../tools/request";

class WebBindings {
  constructor() { }

  async req(path, data) {
    const url = `https://vk.com${path.startsWith("/") ? path : "/" + path}`;
    const res = await Request.post(url, { formData: true, body: data });

    let callInfo = res.replace(/^<!-+/, "").split("<!>");

    let payload;
    if (callInfo.length === 1) {
      payload = JSON.parse(callInfo[0]).payload;
    } else {
      callInfo.splice(callInfo.indexOf(callInfo[4]), 1);
      callInfo.splice(callInfo.indexOf(callInfo[5]), 1);
      payload = [callInfo[4], callInfo];
    }

    if (payload[0] == "8") {
      throw payload;
    } else {
      return payload;
    }
  }

  async wallPost(params = {}) {
    let { owner_id, attachments, message } = params;

    const data = {
      act: "post",
      to_id: owner_id,
      type: "all",
      mark_as_ads: 0,
      update_admin_tips: 0,
      hash: null,
      Message: message,
      al: 1
    };

    if (typeof attachments === "string") {
      attachments = attachments.split(",");
    }

    if (typeof attachments === "object" && attachments !== null) {
      attachments.forEach((attachment, i) => {
        const type = attachment.match(/^[A-z]+/)[0];
        const id = attachment.replace(type, "");
        const index = i + 1;

        data["attach" + index + "_type"] = type;
        data["attach" + index] = id;
      });
    }

    let prefix;
    const ownerIdInt = parseInt(owner_id);
    if (ownerIdInt < 0) {
      prefix = "club";
    } else {
      prefix = "id";
    }

    const body = await Request.get(`https://vk.com/${prefix}${owner_id}`);
    const postHash = body.match(/"post_hash":"(.+?)"/);

    if (postHash !== null) {
      data.hash = postHash[1];
      return this.req("/al_wall.php", data);
    } else {
      throw {
        message: "Post hash is not defined"
      };
    }
  }
}

export default WebBindings;
