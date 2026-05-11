# Download and Setup GTest
include(FetchContent)
FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/refs/tags/v1.15.2.zip
)

# For Windows compatibility
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE) 
FetchContent_MakeAvailable(googletest)

# Create one executable that runs all tests
add_executable(unit_tests
    TestCommandParser.cpp
    TestHelpCommand.cpp
    TestApp.cpp
    TestTxtFile.cpp
    TestRecommendCommand.cpp
)

# Link to Logic Library and the GTest Main entry point
target_link_libraries(unit_tests 
    PRIVATE 
    WoltLogic   
    gtest_main
)

include(GoogleTest)
gtest_discover_tests(unit_tests)
