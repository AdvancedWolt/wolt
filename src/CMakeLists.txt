# Collect all the logic files 
set(LOGIC_FILES
    App.cpp
    commands/HelpCommand.cpp
    commands/AddCommand.cpp
    commands/RecommendCommand.cpp
)

# Create the Library for the logic files
add_library(WoltLogic ${LOGIC_FILES})

add_executable(wolt_app main.cpp)

target_link_libraries(wolt_app PRIVATE WoltLogic)
