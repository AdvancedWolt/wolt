# wolt

CLI application for saving product views by user.

## Checking the exrecise

The exrecise is saved in a branch called 'ex1'

# Pictures of the program

## Build pictures
<img width="870" height="627" alt="image" src="https://github.com/user-attachments/assets/fae9ea4e-45c0-4b4e-99a8-5f5fb2eb2a68" />

## Test pictures
<img width="1854" height="1168" alt="image" src="https://github.com/user-attachments/assets/2e050376-c3f3-4114-b1e4-b0cb34161968" />
<img width="1854" height="1168" alt="image" src="https://github.com/user-attachments/assets/e96a27ad-a004-4450-93f0-09afee602dca" />

## Demo for the app(example from the instructions)
<img width="870" height="627" alt="image" src="https://github.com/user-attachments/assets/5d6cf446-c96a-43a1-a5d0-be23d8b538b8" />

# Functionality

## Build

```bash
docker build -t wolt-app .
```

## Run

```bash
docker run -it wolt-app
```

Example commands:

```text
add [userid] [productid1] [productid2] …
recommend [userid] [productid]
help
```

`add` saves data to the `data` directory and prints no output.

## Tests

```bash
docker run -it wolt-app ./build/tests/unit_tests
```

## Docker

```bash
docker build -t wolt-app .
docker run -it wolt-app
docker run -it wolt-app ./build/tests/unit_tests
```
