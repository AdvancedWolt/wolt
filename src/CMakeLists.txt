# Collect all the logic files 
set(LOGIC_FILES
    App.cpp
    AppInternals.cpp
    commands/HelpCommand.cpp
    commands/PostCommand.cpp
    commands/SyntaxCommand.cpp
    commands/RecommendCommand.cpp
    commands/FakeCommand.cpp
    db/TxtFile.cpp
    db/User.cpp
    db/Product.cpp
)

# Create the Library for the logic files
add_library(WoltLogic ${LOGIC_FILES})

# Set src as PUBLIC so we can include dirs in a simpler way(without ../src)
target_include_directories(WoltLogic PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})

add_executable(wolt_app main.cpp)

target_link_libraries(wolt_app PRIVATE WoltLogic)