#pragma once

#include "db/Idatabase.hpp"
#include <istream>
#include <memory>
#include <ostream>
#include <string>
#include <vector>

class App {
    private:
        std::istream& m_input;
        std::ostream& m_output;
        std::shared_ptr<Idatabase> m_database;

        void _handleLine(const std::string& line);

    public:
        App(std::istream& input,
            std::ostream& output,
            std::shared_ptr<Idatabase> database);

        void run();
};
