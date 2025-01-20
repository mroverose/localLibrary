const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BookGenreSchema = new Schema({
  name:{type:String,required:true,min:2,max:100},
});

BookGenreSchema.virtual("url").get(function(){
  return "/catalog/genre/" + this._id;
})


module.exports = mongoose.model("Genre",BookGenreSchema);
