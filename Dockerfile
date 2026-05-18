FROM gcc:15

RUN apt-get update && apt-get install -y cmake

WORKDIR /usr/src/app

# Copy the project
COPY . .

# Build process
RUN mkdir build && cd build && \
    cmake .. && \
    make -j$(nproc)

# Default command: Runs the target name we defined in src/CMakeLists.txt
# Using ENTRYPOINT allows passing arguments (like port number) when running the container
ENTRYPOINT ["./build/src/wolt_app"]

# To build: docker build -t wolt-app . 
# To run tests: docker run -it --entrypoint ./build/tests/unit_tests wolt-app
# To run server on port 8080: docker run -it -p 8080:8080 wolt-app 8080
