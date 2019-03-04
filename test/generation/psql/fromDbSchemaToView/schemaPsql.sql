CREATE TABLE school(
  id int PRIMARY KEY,
  cpacity int,
  name string,
  address string
);

CREATE TABLE class(
  id int PRIMARY KEY,
  grade int,
  school_id int REFERENCES school(id)
);

CREATE TABLE student(
  id int PRIMARY KEY,
  firstname string,
  lastname string,
  age int,
  class_id int REFERENCES class(id),
  friend int REFERENCES student(id),
  friend1 int REFERENCES student(id),
  friend2 int REFERENCES student(id),
  friend3 int REFERENCES student(id)
);
