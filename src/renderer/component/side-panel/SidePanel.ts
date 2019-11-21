import Base from '../Base';

class SidePanel extends Base {

  get selectedAction() {
    return this.selectedActionName;
  }

  private actions: any;
  private activeAction: any;
  private selectedActionName: any;

  constructor() {
    super(__dirname);
  }

  public selectNone() {
    this.actions.forEach((action) => action.classList.remove('active'));
    this.selectedActionName = null;
    this.activeAction = null;
  }

  protected ready(shadowDom) {
    this.actions = shadowDom.querySelectorAll('.action');

    this.actions.forEach((action) => {
      action.addEventListener('click', () => {
        if (action === this.activeAction) {
          action.classList.remove('active');
          this.selectedActionName = null;
          this.activeAction = null;
        } else {
          this.actions.forEach((actionToRemove) => actionToRemove.classList.remove('active'));
          if (action.classList.contains('create_table')) {
            this.selectedActionName = 'createTable';
          } else if (action.classList.contains('create_relation')) {
            this.selectedActionName = 'createRelation';
          }
          action.classList.add('active');
          this.activeAction = action;
        }
        this.dispatchEvent(new CustomEvent('change', {detail: {selectedAction: this.selectedActionName}}));
      });
    });
  }
}

customElements.define('side-panel', SidePanel);
