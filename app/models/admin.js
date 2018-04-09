var mongoose = require("mongoose")

module.exports = mongoose.model("admins", {
  name: {type: String, default: ""},
  password: {type: String, default: ""}  
});
