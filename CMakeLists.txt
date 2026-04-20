cmake_minimum_required(VERSION 3.10)
project(AdvancedWolt LANGUAGES CXX)

# Sets fresh timestamps for downloaded GTest
# files to avoid build warnings and sync errors.
set(CMAKE_POLICY_DEFAULT_CMP0135 NEW)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_subdirectory(src) # Define where the code is  

# Setup Testing Infrastructure
enable_testing()
add_subdirectory(tests)
