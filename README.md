# Wolt Recommendation System

A product recommendation engine implemented as a Client-Server architecture over TCP. The system allows users to track viewed products and receive suggestions based on similar user behavior.

## Checking the exercise
The exercise solution is saved in the branch called **'ex2'**.

---

# Pictures of the Program

## Build Process
<img width="811" height="397" alt="image" src="https://github.com/user-attachments/assets/f0805e5f-af15-4bca-993d-f86aa74dbe74" />

## Test Results
<img width="1167" height="831" alt="image" src="https://github.com/user-attachments/assets/386c670e-af5d-414b-a64a-f37205811a89" />
<img width="962" height="836" alt="image" src="https://github.com/user-attachments/assets/a0b1f581-1f56-466c-b298-a3e53beb3485" />
<img width="973" height="837" alt="image" src="https://github.com/user-attachments/assets/b361c374-e005-41bb-80cf-98f50b9b1257" />
<img width="836" height="831" alt="image" src="https://github.com/user-attachments/assets/8fab0114-ca63-4521-bc58-a48303a17a91" />
<img width="706" height="684" alt="image" src="https://github.com/user-attachments/assets/6b1941ce-0913-4de3-b97c-ceb26edefade" />

## Demo for the app 
<img width="1294" height="327" alt="image" src="https://github.com/user-attachments/assets/982db06a-8acd-4a37-b889-25aca9a7e30a" />

---

# Protocol & Functionality

The system consists of a **C++ Server** handling the logic and a **Python Client** for the user interface. Communications happen over a persistent TCP connection. All commands and responses are terminated by a newline (`\n`).

### Available Commands

| Command | Arguments | Description | Success Response |
| :--- | :--- | :--- | :--- |
| **POST** | `[userid] [prodID1] [prodID2]...` | Add a **new** user and their viewed products. | `201 Created` |
| **PATCH** | `[userid] [prodID1] [prodID2]...` | Add products to an **existing** user. | `204 No Content` |
| **DELETE** | `[userid] [prodID1] [prodID2]...` | Remove specific product views for a user. | `204 No Content` |
| **GET** | `[userid] [productid]` | Request up to 10 recommendations. | `200 Ok \n\n [Data]` |
| **help** | (none) | List available commands in alphabetical order. | List of commands |

### Status Codes
* **200 Ok**: Request successful (used for GET and help).
* **201 Created**: Successfully added a new user (POST).
* **204 No Content**: Successfully updated or deleted data (PATCH/DELETE).
* **400 Bad Request**: Invalid command syntax or unrecognized command.
* **404 Not Found**: Logical error (e.g., PATCH on non-existent user or DELETE on unviewed product).

---

# Setup and Execution

## Build using Docker
To build the server environment:
```bash
docker build -t wolt-app .
```

## Run using Docker
The server requires a port number as a command-line argument.

Run server on port 8080
```bash
docker run -it -p 8080:8080 wolt-app 8080
```

## Running the Client
Run the client from your local machine using Python 3:

Usage: python3 src/client.py [IP] [PORT]
```bash
python3 src/client.py 127.0.0.1 8080
```

## Running Tests
To run the unit tests inside the Docker container:

```bash
docker run -it --entrypoint ./build/tests/unit_tests wolt-app
```
