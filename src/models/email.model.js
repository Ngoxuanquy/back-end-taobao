const { Schema, model } = require("mongoose"); // Erase if already required

const DOCUMENT_NAME = "Email";
const COLLECTION_NAME = "Emails";

// Declare the Schema of the Mongo model
var emailSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    code: {
      type: String,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

//Export the model
module.exports = model(DOCUMENT_NAME, emailSchema);