import Base from '../Base.js';

class AboutDialog extends Base {
  constructor() {
    super(__dirname);
  }

  _ready(shadowDom) {
    
  }
}

customElements.define('about-dialog', AboutDialog);
