var mongoose = require("mongoose")

module.exports = mongoose.model("metals", {
  name: {type: String, default: ""}
});
