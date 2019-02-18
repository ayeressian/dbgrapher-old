import template from './template.js';

class SidePanel extends HTMLElement {
  constructor() {
    super();

    const shadowDom = this.attachShadow({
      mode: 'open'
    });
    shadowDom.innerHTML = template;

    this._dialogTableSameFkOptions = [];

    this._ready(shadowDom);
  }

  _ready(shadowDom) {
    const actions = shadowDom.querySelectorAll('.action');

    let activeAction;
    actions.forEach((action) => {
      action.addEventListener('click', () => {
        if (action === activeAction) {
          action.classList.remove('active');
        } else {
          actions.forEach((action) => action.classList.remove('active'));
          this.dispatchEvent(new CustomEvent('tableMove', {detail: tableData}));
          action.classList.add('active');
          activeAction = action;
        }
      });
    });
  }
}

customElements.define('side-panel', SidePanel);
