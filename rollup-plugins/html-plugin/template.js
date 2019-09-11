class Template {
  static create(html) {
    return `
export default class cElement {
  static createElement() {
    let template = document.createElement("template");
    template.innerHTML = ${html}.trim();
    return template.content.firstChild;
  }
}
     `.trim();
  }
}

export default Template;