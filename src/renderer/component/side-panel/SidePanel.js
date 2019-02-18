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
    this._actions = shadowDom.querySelectorAll('.action');

    this._activeAction;
    this._actions.forEach((action) => {
      action.addEventListener('click', () => {
        if (action === this._activeAction) {
          action.classList.remove('active');
          this._selectedActionName = null;
          this._activeAction = null;
        } else {
          this._actions.forEach((action) => action.classList.remove('active'));
          if (action.classList.contains('create_table')) {
            this._selectedActionName = 'createTable';
          } else if (action.classList.contains('create_relation')) {
            this._selectedActionName = 'createRelation';
          }
          action.classList.add('active');
          this._activeAction = action;
        }
        this.dispatchEvent(new CustomEvent('change', {detail: {selectedAction: this._selectedActionName}}));
      });
    });
  }

  get selectedAction() {
    return this._selectedActionName;
  }

  selectNone() {
    this._actions.forEach((action) => action.classList.remove('active'));
    this._selectedActionName = null;
    this._activeAction = null;
  }
}

customElements.define('side-panel', SidePanel);
