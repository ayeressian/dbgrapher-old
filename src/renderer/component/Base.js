const supportsAdoptingStyleSheets =
    ('adoptedStyleSheets' in Document.prototype) &&
    ('replace' in CSSStyleSheet.prototype);

const styleSheets = new Map();

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

    const styleSheetPath = `../../../${this._dirPath}/style.css`;
    const templatePromise = import(`../../../${this._dirPath}/template.html`);
    // TODO replace string with variable onece webpack bug fixed
    const stylePromise = import(`../../../${this._dirPath}/style.css`);

    Promise.all([templatePromise, stylePromise]).then((result) => {
      if (supportsAdoptingStyleSheets) {
        this._shadowDom.innerHTML = result[0].default;
        let styleSheet;
        if (styleSheets.has(styleSheetPath)) {
          styleSheet = styleSheets.get(styleSheetPath);
        } else {
          styleSheet = new CSSStyleSheet();
          styleSheet.replaceSync(result[1].default);
          styleSheets.set(styleSheetPath, styleSheet);
        }
        this._shadowDom.adoptedStyleSheets = [styleSheet];
      } else {
        this._shadowDom.innerHTML = `
          <style>
            ${result[1].default}
          </style>
          ${result[0].default}
        `;
      }
      this._ready(this._shadowDom);
    });
  }
}
