var mongoose = require("mongoose")

module.exports = mongoose.model("swords", {
  name: {type: String, default: ""},
  length: {type: Number, default: 0},
  weight: {type: Number, default: 0},
  history: {type: String, default: ""},
  facts: {type: [String], default: []},
  img: {type: String, default: ""},
  altImg: {type: String, default: ""},
  metals: {type: [String], default: ["iron", "steel"]}
})
