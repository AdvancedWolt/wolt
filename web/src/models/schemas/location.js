const { mongoose } = require('../../config/db');

const { Schema } = mongoose;

// A map point shared by every model that stores a location. The EX4 API stores
// coordinates as { x, y }; the schema mirrors that shape so the API surface is
// unchanged. Defined once and reused (User, Restaurant) to keep a single source
// of truth for the location shape.
const locationSchema = new Schema(
    {
        x: { type: Number },
        y: { type: Number },
    },
    { _id: false }
);

module.exports = { locationSchema };
