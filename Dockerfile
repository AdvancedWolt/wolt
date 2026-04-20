FROM gcc:latest

RUN apt-get update && apt-get install -y cmake

WORKDIR /usr/src/app

# Copy the project
COPY . .

# Build process
RUN mkdir build && cd build && \
    cmake .. && \
    make

# Default command: Runs the target name we defined in src/CMakeLists.txt
CMD ["./build/src/wolt_app"]

# To build: docker build -t wolt-app . 
# To run tests: docker run -it wolt-app ./build/tests/unit_tests
