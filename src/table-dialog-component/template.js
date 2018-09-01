export default /* html*/ `
<dialog id="create_edit_dialog">
  <style>
    dialog menu {
      display: flex;
      justify-content: center;
      padding-left: 0;
    }

    dialog menu button:not(:first-child) {
      margin-left: 10px;
    }

    dialog table th {
      text-align: left;
    }

    dialog .errors p {
      color: #cc0000;
    }
  </style>
  <h3 id="dialog_title"></h3>
  <form method="dialog">
    <div>
      <label>Name:
        <input type="text" id="name_input" required/>
      </label>
    </div>
    <div>
      <table>
        <thead>
          <tr>
            <th>Columns</th>
          </tr>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>PK</th>
            <th>UQ</th>
            <th>NN</th>
          </tr>
        </thead>
        <tbody id="columns">
        </tbody>
      </table>
      <button>Add column</button>
    </div>
    <div>
      <table>
        <thead>
          <tr>
            <th>Foreign Key Columns</th>
          </tr>
          <tr>
            <th>Name</th>
            <th>PK</th>
            <th>UQ</th>
            <th>NN</th>
            <th>Foreign Table</th>
            <th>Foreign Column</th>
          </tr>
        </thead>
        <tbody id="fk_columns">
        </tbody>
      </table>
      <button>Add relation</button>
    </div>
    <div class="errors">

    </div>
    <menu>
      <button id="cancel">Cancel</button>
      <button id="create_edit_button"></button>
    </menu>
  </form>
</dialog>`;
