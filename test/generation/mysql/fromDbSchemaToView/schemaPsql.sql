CREATE TABLE school(
  id INT PRIMARY KEY,
  cpacity INT,
  name VARCHAR(64),
  address VARCHAR(64)
);

CREATE TABLE class(
  id INT,
  grade INT,
  school_id int REFERENCES school(id),
  PRIMARY KEY (id)
);

CREATE TABLE student(
  id INT PRIMARY KEY,
  firstname VARCHAR(64),
  lastname VARCHAR(64),
  age int,
  class_id INT REFERENCES class(id),
  friend INT REFERENCES student(id),
  friend1 INT REFERENCES student(id),
  friend2 INT REFERENCES student(id),
  friend3 INT,
  CONSTRAINT student_id_student_id_fkey FOREIGN KEY (friend3)
      REFERENCES student (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
);
