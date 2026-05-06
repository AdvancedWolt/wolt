# Collect all the logic files 
set(LOGIC_FILES
    App.cpp
    AppInternals.cpp
    commands/HelpCommand.cpp
    commands/AddCommand.cpp
    commands/SyntaxCommand.cpp
    commands/RecommendCommand.cpp
    db/TxtFile.cpp
    db/User.cpp
    db/Product.cpp
)

# Create the Library for the logic files
add_library(WoltLogic ${LOGIC_FILES})

add_executable(wolt_app main.cpp)

target_link_libraries(wolt_app PRIVATE WoltLogic)
