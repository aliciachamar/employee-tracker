const express = require("express");
const inquirer = require("inquirer");
const mysql = require('mysql2');
const cTable = require('console.table');

const connection = mysql.createConnection({
    host: 'localhost',
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: 'root',
  
    // Be sure to update with your own MySQL password!
    password: 'password',
    database: 'employee_db',
});

const rootMenu = [
    {
        type: "list",
        name: "rootMenuChoice",
        message: "What would you like to do?",
        choices: [
            "View",
            "Add",
            "Update"
        ]
    }
];

const viewMenu = [
    {
        type: "list",
        name: "viewMenuChoice",
        message: "What would you like to do?",
        choices: [
            "View all employees",
            "View employees by department",
            "View employees by role",
            "View all departments",
            "View all roles",
        ]
    }
];

const addMenu = [
    {
        type: "list",
        name: "addMenuChoice",
        message: "What would you like to do?",
        choices: [
            "Add a department",
            "Add a role",
            "Add an employee",
        ]
    }
];

const updateMenu = [
    {
        type: "list",
        name: "updateMenuChoice",
        message: "What would you like to do?",
        choices: [
            "Update an employee's role"
        ]
    }
];

const runQuery = (query, insertions) => {
    connection.query(query, insertions, (err, result) => {
        if (err) throw err;
        console.table(result);
        runMenu();
    })
};

const runMenu = async () => {
    const userChoice = await inquirer.prompt(rootMenu);
    let query;
    switch (userChoice.rootMenuChoice) {
        case "View": 
            let viewChoice = await inquirer.prompt(viewMenu);
            switch (viewChoice.viewMenuChoice) {
                case "View all employees":
                    query = "SELECT * FROM employees INNER JOIN roles ON employees.role_id = roles.id";
                    runQuery(query);
                    break;
                case "View employees by department":
                    connection.query("SELECT id, name FROM departments", async (err, departments) => {
                        if (err) throw err;
                        const departmentIds = departments.map(department => department.id);
                        const names = departments.map(department => department.name);
                        let combined = [];
                        for (let i = 0; i < departmentIds.length; i++) {
                            let newCombined = `${departmentIds[i]}: ${names[i]}`;
                            combined.push(newCombined);
                        }
                        try {
                            const departmentChoice = await inquirer.prompt([
                                {
                                    type: "list",
                                    name: "department",
                                    message: "Which department would you like to see?",
                                    choices: combined
                                }
                            ])
                            query = "SELECT * from employees INNER JOIN roles ON employees.role_id = roles.id WHERE department_id = ?";
                            let idChoice = departmentChoice.department.substring(0, 1);
                            runQuery(query, idChoice);
                            runMenu();
                        } catch (error) {
                            console.log(error);
                            connection.end();
                        }
                    })  
                    break;
                case "View employees by role":
                    connection.query("SELECT id, title FROM roles", async (err, roles) => {
                        if (err) throw err;
                        const roleIds = roles.map(role => role.id);
                        const titles = roles.map(role => role.title);
                        combined = [];
                        for (let i = 0; i < roleIds.length; i++) {
                            let newCombined = `${roleIds[i]}: ${titles[i]}`;
                            combined.push(newCombined);
                        }
                        try {
                            const roleChoice = await inquirer.prompt([
                                {
                                    type: "list",
                                    name: "role",
                                    message: "Which role would you like to see?",
                                    choices: combined
                                }
                            ])
                            query = "SELECT * from employees INNER JOIN roles ON employees.role_id = roles.id WHERE role_id = ?";
                            idChoice = roleChoice.role.substring(0, 1);
                            runQuery(query, idChoice);
                            runMenu();
                        } catch (error) {
                            console.log(error);
                            connection.end();
                        }
                    })
                    break;
                case "View all departments":
                    query = "SELECT * FROM departments";
                    runQuery(query);
                    break;
                case "View all roles":
                    query = "SELECT * FROM roles";
                    runQuery(query);
                    break;
            }
            break;
        case "Add":
            let addChoice = await inquirer.prompt(addMenu);
            switch (addChoice.addMenuChoice) {
                case "Add a department":
                    const department = await inquirer.prompt([
                        {
                            type: "input",
                            name: "name",
                            message: "Please input a new department name."
                        }
                    ])
                    query = "INSERT INTO departments (name) VALUES (?)";
                    let { name } = department;
                    try {
                        runQuery(query, name);
                        return console.log("Department successfully added.");
                    } catch (error) {
                       console.log(error); 
                    }
                    console.log("Department successfully added.");
                    break;
                case "Add a role":
                    connection.query("SELECT * FROM departments", async (err, departments) => {
                        if (err) throw err;
                        const departmentIds2 = departments.map(department => department.id);
                        const names2 = departments.map(department => department.name);
                        combined = [];
                        for (let i = 0; i < departmentIds2.length; i++) {
                            let newCombined = `${departmentIds2[i]}: ${names2[i]}`;
                            combined.push(newCombined);
                        }
                        try {
                            const role = await inquirer.prompt([
                                {
                                    type: "input",
                                    name: "title",
                                    message: "Please input a new role title."
                                },
                                {
                                    type: "input",
                                    name: "salary",
                                    message: "Please input a salary for this role."
                                },
                                {
                                    type: "list",
                                    name: "department_id",
                                    message: "Please choose the department for this role.",
                                    choices: combined
                                }
                            ])
                            query = "INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)";
                            idChoice = role.department_id.substring(0, 1);
                            let { title, salary } = role;
                            try {
                                runQuery(query, [title, parseInt(salary), parseInt(idChoice)]);
                                return console.log("Role successfully added.");
                                runMenu();
                            } catch (error) {
                                console.log(error); 
                            }
                        } catch (error) {
                            console.log(error);
                        }
                    })
                    console.log("Role successfully added.");
                    break;
                case "Add an employee":
                    connection.query("SELECT id, first_name, last_name FROM employees", (err, employees) => {
                        connection.query("SELECT * FROM roles", async (err, roles) => {
                            if (err) throw err;
                            let employeeInfo = await inquirer.prompt([
                                {
                                    type: "input",
                                    name: "first_name",
                                    message: "Please enter the employee's first name.",
                                },
                                {
                                    type: "input",
                                    name: "last_name",
                                    message: "Please enter the employee's last name."
                                },
                                {
                                    type: "list",
                                    name: "role_id",
                                    message: "Please choose the employee's role.",
                                    choices: roles.map(role => `${role.id}: ${role.title}`)
                                },
                                {
                                    type: "list",
                                    name: "manager_id",
                                    message: "Please choose the employee's manager.",
                                    choices: employees.map(employee => `${employee.id}: ${employee.first_name} ${employee.last_name}`)
                                }
                            ])
                            query = "INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)"
                            runQuery(query, [employeeInfo.first_name, employeeInfo.last_name, employeeInfo.role_id.substring(0, 1), employeeInfo.manager_id.substring(0, 1)]);
                            console.log("Employee successfully added.");
                        }) 
                    })
                    break;
            }
            break;
        case "Update":
            let updateChoice = await inquirer.prompt(updateMenu);
            switch (updateChoice.updateMenuChoice) {
                case "Update an employee's role": 
                    connection.query("SELECT id, first_name, last_name FROM employees", async (err, employees) => {
                        if (err) throw err;
                        let { employeeChoice } = await inquirer.prompt([
                            {
                                type: "list",
                                name: "employeeChoice",
                                message: "Whose role would you like to update?",
                                choices: employees.map(employee => `${employee.id}: ${employee.first_name} ${employee.last_name}`)
                            }
                        ])
                        connection.query("SELECT * FROM roles", async (err, roles) => {
                            if (err) throw err;
                            let { role } = await inquirer.prompt([
                                {
                                    type: "list",
                                    name: "role",
                                    message: "Please choose the employee's new role.",
                                    choices: roles.map(roles => `${roles.id}: ${roles.title}`)
                                }
                            ])
                            query = "UPDATE employees SET role_id = ? WHERE id = ?";
                            console.log(employeeChoice);
                            runQuery(query, [role.substring(0, 1), employeeChoice.substring(0, 1)]);
                        })
                    })  
                    break;     
            }
    }
};

connection.connect(async (err) => {
    if (err) throw err;
    try {
        await runMenu();
    } catch (error) {
        console.log(error);
        connection.end();
    }
  });
