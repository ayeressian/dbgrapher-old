export default class UndoRedo {
  constructor() {
    this._states = [];
    this._index = -1;
  }

  addState(state) {
    this._index++;
    this._states.splice(this._index, this._states.length - this._index, state);
  }

  undo() {
    if (this._index > 0) {
      this._index--;
      return this._states[this._index];
    }
  }

  redo() {
    if (this._index < this._states.length - 1) {
      this._index++;
      return this._states[this._index];
    }
  }
}
