CREATE TABLE school(
  id int PRIMARY KEY,
  cpacity int,
  name varchar(64),
  address varchar(64)
);

CREATE TABLE class(
  id int,
  grade int,
  school_id int REFERENCES school(id),
  PRIMARY KEY (id)
);

CREATE TABLE student(
  id int PRIMARY KEY,
  firstname varchar(64),
  lastname varchar(64),
  age int,
  class_id int REFERENCES class(id),
  friend int REFERENCES student(id),
  friend1 int REFERENCES student(id),
  friend2 int REFERENCES student(id),
  friend3 int,
  CONSTRAINT student_id_student_id_fkey FOREIGN KEY (friend3)
      REFERENCES student (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
);

-- Should ignore select statements
SELECT * FROM student;
Create table student_2 as Select * from student where 1=2;
--should create statement within ignore comment
/*
CREATE TABLE cities (
  name       text,
  population real,
  altitude   int
);
*/

CREATE TABLE cities (
  name       text,
  population real,
  altitude   int
);

CREATE TABLE capitals (
  state      char(2)
) INHERITS (cities);
