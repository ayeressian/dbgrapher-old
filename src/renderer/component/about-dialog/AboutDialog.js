import Base from '../Base';

class AboutDialog extends Base {
  constructor() {
    super(__dirname);
  }

  ready(shadowDom) {  
  }
}

customElements.define('about-dialog', AboutDialog);
