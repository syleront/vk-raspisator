class Querystring {
  static stringify(obj, bool) {
    if (typeof obj == "object") {
      return Object.entries(obj).map((a) => {
        if (!bool) {
          a[1] = encodeURIComponent(a[1]);
        }
        return a.join("=");
      }).join("&");
    } else {
      throw "Error: parameter must be an object";
    }
  }

  static parse(string) {
    const params = string.match(/[A-z%0-9\-.]+=[A-z%0-9\-.]+/g);
    if (!params) {
      return null;
    } else {
      const obj = {};
      params.forEach((e) => {
        const param = e.split("=");
        obj[param[0]] = param[1];
      });
      return obj;
    }
  }
}

export default Querystring;
