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

const menu = [
    {
        type: "list",
        name: "menuChoice",
        message: "What would you like to do?",
        choices: [
            "View",
            "Add",
            "Update",
            "Delete"
        ]
    }
];

const viewMenu = [
    {
        type: "list",
        name: "menuChoice",
        message: "What would you like to do?",
        choices: [
            "View all employees",
            "View employees by department",
            "View employees by role",
            "View employees by manager",
            "View budget by department",
        ]
    }
];

const addMenu = [
    {
        type: "list",
        name: "menuChoice",
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
        name: "menuChoice",
        message: "What would you like to do?",
        choices: [
            "Update an employee's role",
            "Update an employee's manager",
        ]
    }
];

const deleteMenu = [
    {
        type: "list",
        name: "menuChoice",
        message: "What would you like to do?",
        choices: [
            "Delete an employee",
            "Delete a role",
            "Delete a department",
        ]
    }
];

const runQuery = (query, insertions) => {
    connection.query(query, insertions, (err, result) => {
        if (err) throw err;
        console.log("/n")
        console.table(result);
        runMenu();
    })
};

const runMenu = async () => {
    const userChoice = await inquirer.prompt(menu);
    let choice;
    let query;
    switch (userChoice.menuChoice) {
        case "View": 
            choice = await inquirer.prompt(viewMenu);
            switch (choice.menuChoice) {
                case "View all employees":
                    try {
                        query = "SELECT id, first_name, last_name FROM employees INNER JOIN roles ON employees.role_id = roles.id INNER JOIN departments ON employees.department = departments.id;";    
                        runQuery(query);
                    } catch (error) {
                        console.log(error);
                    }
                    break;
                case "View employees by department":
                    connection.query("SELECT name FROM departments", async (err, departments) => {
                        if (err) throw err;
                        try {
                            const departmentChoice = await inquirer.prompt([
                                {
                                    type: "list",
                                    name: "department",
                                    message: "Which department would you like to see?",
                                    choices: departments.map(department => department.name)
                                }
                            ])
                            query = "SELECT * from employees WHERE department = ?";
                            runQuery(query, departmentChoice.department);
                            runMenu();
                        } catch (error) {
                            connection.end();
                        }
                    })  
                    break;
                case "View employees by role":
                    break;
                case "View employees by manager":
                    break;
                case "View budget by department":
                    break;
            }
        case "Add":
            choice = await inquirer.prompt(addMenu);
            switch (choice.menuChoice) {
                case "Add a department":
                    const department = await inquirer.prompt([
                        {
                            type: "input",
                            name: "name",
                            message: "Please input a new department name."
                        },
                        {
                            type: "input",
                            name: "manager_id",
                            message: "Please input a manager ID for this department."
                        }
                    ])
                    query = "INSERT INTO departments (name, manager_id) VALUES (?, ?)";
                    let { name, manager_id } = department;
                    try {
                        runQuery(query, [name, manager_id]);
                        return console.log("Department successfully added.");
                    } catch (error) {
                       console.log(error); 
                    }
                    break;
                case "Add a role":
                    connection.query("SELECT * FROM departments", async (err, departments) => {
                        if (err) throw err;
                        let ids = departments.map(({ id }) => id);
                        let names = departments.map(({ name }) => name);
                        let combined = [];
                        for (let i = 0; ids.length; i++) {
                            let newCombined = `${ids[i]}: ${names[i]}`;
                            combined.push(newCombined);
                        }
                        console.log(combined);
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
                            let { title, salary, department_id } = role;
                            try {
                                runQuery(query, [title, parseInt(salary), parseInt(department_id)]);
                                return console.log("Role successfully added.");
                                runMenu();
                            } catch (error) {
                                console.log(error); 
                            }
                        } catch (error) {
                            console.log(error);
                        }
                    })
                    break;
                case "Add an employee":
                    const employee = await inquirer.prompt([
                        {
                            type: "input",
                            name: "first_name",
                            message: "Please input the employee's first name."
                        },
                        {
                            type: "input",
                            name: "last_name",
                            message: "Please input the employee's last name."
                        },
                        {
                            type: "list",

                        }
                    ])
                    query = "INSERT INTO departments (name, manager_id) VALUES (?, ?)";
                    let { name: name2, manager_id: manager_id2 } = department;
                    try {
                        runQuery(query, [name2, manager_id2]);
                        return console.log("Department successfully added.");
                    } catch (error) {
                       console.log(error); 
                    }  
                    break;   
            }
    }
};

connection.connect(async (err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}\n`);
    try {
        await runMenu();
    } catch (error) {
        console.log(error);
        connection.end();
    }
  });
