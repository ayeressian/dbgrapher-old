const supportsAdoptingStyleSheets =
    ('adoptedStyleSheets' in Document.prototype) &&
    ('replace' in CSSStyleSheet.prototype);

const styleSheets = new Map();

interface IShadowRootExtra extends ShadowRoot {
  adoptedStyleSheets: CSSStyleSheet[];
}

export default abstract class Base extends HTMLElement {
  private dirPath: string;
  private shadowDom: IShadowRootExtra;

  constructor(dirPath) {
    super();
    this.dirPath = dirPath;

    this.init();
  }

  protected abstract ready(shadowDom: ShadowRoot): void;

  private init() {
    this.shadowDom = this.attachShadow({
      mode: 'open',
    }) as IShadowRootExtra;

    const styleSheetPath = `../../../${this.dirPath}/style.css`;
    const templatePromise = import(`../../../${this.dirPath}/template.html`);
    // TODO replace string with variable onece webpack bug fixed
    const stylePromise = import(`../../../${this.dirPath}/style.css`);

    Promise.all([templatePromise, stylePromise]).then((result) => {
      if (supportsAdoptingStyleSheets) {
        this.shadowDom.innerHTML = result[0].default;
        let styleSheet;
        if (styleSheets.has(styleSheetPath)) {
          styleSheet = styleSheets.get(styleSheetPath);
        } else {
          styleSheet = new CSSStyleSheet();
          styleSheet.replaceSync(result[1].default);
          styleSheets.set(styleSheetPath, styleSheet);
        }
        this.shadowDom.adoptedStyleSheets = [styleSheet];
      } else {
        this.shadowDom.innerHTML = `
          <style>
            ${result[1].default}
          </style>
          ${result[0].default}
        `;
      }
      this.ready(this.shadowDom);
    });
  }
}
