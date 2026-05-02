# wolt

CLI application for saving product views by user.

## Build

```bash
mkdir build
cd build
cmake ..
make
```

## Run

```bash
./build/src/wolt_app
```

Example commands:

```text
add user42 product1 product2
help
```

`add` saves data to the `data` directory and prints no output.

## Tests

```bash
./build/tests/unit_tests
```

## Docker

```bash
docker build -t wolt-app .
docker run -it wolt-app
docker run -it wolt-app ./build/tests/unit_tests
```
