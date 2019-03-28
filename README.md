# DB Grapher

Designer for relational databases. The beta version can be viewed [here](https://dbgrapher.com). For now it has a support for SQLite and PostgreSQL. 

It uses [db-viewer-component](https://github.com/ayeressian/db-viewer-component) web component to render designer view.
It's intended to be used by desktop computer.

To run web version:
  1. npm i
  2. npm start
  3. In chrome browser navigate to http://localhost:9999

To run desktop (electron) version:
  1. npm i
  2. npm run build-electron-dev
  3. npm run start-electron (In separate terminal)
  
Note: The desktop version is not finalized yet. This application doesn't work on Edge browser. Edge browser doesn't have web component support.
