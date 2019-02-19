export default class Base extends HTMLElement {
  constructor(dirPath) {
    super();
    this._dirPath = dirPath;

    this._init();
  }

  _init() {
    this._shadowDom = this.attachShadow({
      mode: 'open'
    });

    const templatePromise = import(`../../../${this._dirPath}/template.html`);
    const stylePromise = import(`../../../${this._dirPath}/style.css`);

    Promise.all([templatePromise, stylePromise]).then((result) => {
      this._shadowDom.innerHTML = `
        <style>
          ${result[1].default}
        </style>
        ${result[0].default}
      `;
      this._ready(this._shadowDom);
    });
  }
}
