const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BookSchema = new Schema({
    title:{type:String,required:true},
    author:{type:Schema.Types.ObjectId,ref:"Author",required:true},
    summary:{type:String,required:true},
    isbn:{type:String,required:true},
    genre:[{type:Schema.Types.ObjectId,ref:"Genre"}],
});


//虚拟属性'url':藏书URL
BookSchema.virtual("url").get(function(){
    return "/catalog/book/" + this._id;
});

//导出Book模块
module.exports = mongoose.model("Book",BookSchema);
