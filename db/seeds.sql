DROP DATABASE IF EXISTS employee_db;

CREATE DATABASE employee_db;

USE employee_db;

CREATE TABLE departments (
    id INT AUTO_INCREMENT,
    name VARCHAR(30),
    manager_id INT UNIQUE,
    PRIMARY KEY (id)
);

CREATE TABLE roles (
    id INT AUTO_INCREMENT,
    title VARCHAR(30),
    salary DECIMAL,
    department_id INT,
    PRIMARY KEY (id),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE employees (
    id INT AUTO_INCREMENT,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    role_id INT,
    manager_id INT,
    department VARCHAR(30),
    PRIMARY KEY (id),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (manager_id) REFERENCES departments(manager_id)
);

INSERT INTO roles (title, salary, department_id)
VALUES ("Salesperson", 100000, 1),
("Tier 1 IT Support", 100000, 2),
("Mechanical Engineer", 100000, 3),
("Controller", 100000, 4),
("CEO", 100000, 5);

INSERT INTO employees (first_name, last_name, role_id)
VALUES ("Bob", "Managerman", 5);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Sasha", "Salesgirl", 1, 1),
("Ingrid", "Infowoman", 2, 1),
("Ethan", "Engineerman", 3, 1),
("Fancy", "Financewoman", 4, 1);