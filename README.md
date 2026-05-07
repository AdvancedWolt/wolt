# wolt

CLI application for saving product views by user.

## Checking the exrecise

The exrecise is saved in a branch called 'ex1'

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
