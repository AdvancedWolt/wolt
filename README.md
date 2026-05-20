# Wolt Recommendation System

A product recommendation engine implemented as a Client-Server architecture over TCP. The system allows users to track viewed products and receive suggestions based on similar user behavior.

## Checking the exercise
The exercise solution is saved in the branch called **'ex2'**.

---

# Pictures of the Program

## Build Process
<img width="870" height="627" alt="image" src="https://github.com/user-attachments/assets/fae9ea4e-45c0-4b4e-99a8-5f5fb2eb2a68" />

## Test Results
<img width="1854" height="1168" alt="image" src="https://github.com/user-attachments/assets/2e050376-c3f3-4114-b1e4-b0cb34161968" />
<img width="1854" height="1168" alt="image" src="https://github.com/user-attachments/assets/e96a27ad-a004-4450-93f0-09afee602dca" />

## Demo for the app (Example from instructions)
<img width="870" height="627" alt="image" src="https://github.com/user-attachments/assets/5d6cf446-c96a-43a1-a5d0-be23d8b538b8" />

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