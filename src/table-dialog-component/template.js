export default /* html*/ `
  <style>
    .modal {
      display: none; /* Hidden by default */
      position: fixed; /* Stay in place */
      z-index: 1; /* Sit on top */
      padding-top: 100px; /* Location of the box */
      left: 0;
      top: 0;
      width: 100%; /* Full width */
      height: 100%; /* Full height */
      overflow: auto; /* Enable scroll if needed */
      background-color: rgb(0,0,0); /* Fallback color */
      background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
    }

    .modal-content {
      background-color: #fefefe;
      margin: auto;
      padding: 20px;
      border: 1px solid #888;
      width: 80%;
    }

    .modal-content menu {
      display: flex;
      justify-content: center;
      padding-left: 0;
    }

    .modal-content menu button:not(:first-child) {
      margin-left: 10px;
    }

    .modal-content table th {
      text-align: left;
    }

    .modal-content .errors p {
      color: #cc0000;
    }

    table {
      margin-top: 20px;
    }
  </style>
  <div id="myModal" class="modal">
    <!-- Modal content -->
    <div class="modal-content">
      <h3 id="dialog_title"></h3>
      <form onSubmit="return false">
        <div>
          <label>Name:
          <input type="text" id="name_input" required/>
          </label>
        </div>
        <table>
          <thead>
              <tr>
                <th colspan="6">Columns</th>
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
        <button id="add_column">Add column</button>
        <table>
          <thead>
              <tr>
                <th colspan="7">Foreign Key Columns</th>
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
        <button id="add_relation">Add relation</button>
        <div class="errors">
        </div>
        <menu>
          <button id="cancel" type="button">Cancel</button>
          <button id="create_edit_button"></button>
        </menu>
      </form>
    </div>
  </div>
  `;
