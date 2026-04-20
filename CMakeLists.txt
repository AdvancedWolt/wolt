cmake_minimum_required(VERSION 3.10)
project(AdvancedWolt LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_subdirectory(src) # Define where the code is  

# Setup Testing Infrastructure
enable_testing()
add_subdirectory(tests)
