# Collect all the logic files 
set(LOGIC_FILES
    App.cpp
    core/CommandParser.cpp
    core/CommandManager.cpp
    commands/HelpCommand.cpp
    commands/GetCommand.cpp
    commands/PostCommand.cpp
    commands/DeleteCommand.cpp
    commands/PatchCommand.cpp
    db/TxtFile.cpp
    db/TxtFileParsing.cpp
    db/DbHelper.cpp
    models/User.cpp
    models/Product.cpp
    models/Response.cpp
)

# Create the Library for the logic files
add_library(WoltLogic ${LOGIC_FILES})

# Set src as PUBLIC so we can include dirs in a simpler way(without ../src)
target_include_directories(WoltLogic PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})

add_executable(wolt_app main.cpp server.cpp)

target_link_libraries(wolt_app PRIVATE WoltLogic)