DROP DATABASE IF EXISTS employee_db;

CREATE DATABASE employee_db;

USE employee_db;

CREATE TABLE employees (
    id INT AUTO_INCREMENT,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    PRIMARY KEY (id),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (manager_id) REFERENCES departments(manager_id)
);

CREATE TABLE roles (
    id INT AUTO_INCREMENT,
    title VARCHAR(30),
    salary DECIMAL,
    PRIMARY KEY (id),
    FOREIGN KEY (department_id)
);

CREATE TABLE departments (
    id INT AUTO_INCREMENT,
    name VARCHAR(30),
    manager VARCHAR(30),
    PRIMARY KEY (id)
);