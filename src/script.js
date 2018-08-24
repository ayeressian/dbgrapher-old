if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('../service-worker.js')
    .then(() => console.log('Service Worker Registered'));
}

document.addEventListener('DOMContentLoaded', () => {
  const menuBar = document.querySelector('menu-bar');
  menuBar.config = {
    items: [
      {
        id: 'file',
        title: 'File',
        items: [
          {
            id: 'open',
            title: 'Open'
          },
          {
            id: 'save',
            title: 'Save'
          }
        ]
      },
      {
        id: 'help',
        title: 'Help',
        items: [
          {
            id: 'about',
            title: 'About'
          }
        ]
      }
    ]
  };

  const dbDesigner = document.querySelector('db-designer');
  const fileOpenElem = document.getElementById('file_open');
  const createEditDialog = document.getElementById('create_edit_dialog');
  const createTableBtn = document.querySelector('.create_table');
  const createRelationBtn = document.querySelector('.create_relation');

  fileOpenElem.addEventListener('change', (event) => {
    const reader = new FileReader();
    reader.readAsText(event.target.files[0]);
    reader.onload = (event) => {
      const schema = JSON.parse(event.target.result);
      dbDesigner.schema = schema;
    };
  });

  menuBar.addEventListener('select', (event) => {
    switch (event.detail) {
      case 'open':
      fileOpenElem.click();
      break;
    }
  });

  dbDesigner.addEventListener('click', (event) => {
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    console.log(x, y);
  });

  createTableBtn.addEventListener('click', () => {
    createEditDialog.showModal();
  });
});
