
const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
    first_name: {type:String,required:true,max:100},
    family_name:{type:String,required:true,max:100},
    date_of_birth:{type:Date},
    date_of_death:{type:Date},
});

//虚拟属性'name':表示作者全名
AuthorSchema.virtual("name").get(function(){
    return this.family_name + ", " + this.first_name;
});

//虚拟属性'lifespan' :作者寿命
AuthorSchema.virtual("lifespan").get(function(){
  if(this.date_of_death === null || this.date_of_death === undefined){
    return this.birthDate_str + ' - 至今';
  }
    return (
        this.date_of_death.getFullYear() - this.date_of_birth.getFullYear()
    ).toString();
});

//虚拟属性'url':作者URL
AuthorSchema.virtual("url").get(function(){
    return "/catalog/author/" + this._id;
});

AuthorSchema.virtual("lifespan_intro").get(function (){
    if(this.date_of_death === null || this.date_of_death === undefined){
    return this.birthDate_str + ' - 至今';
  }
  return DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED).toString() + "-" + DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED).toString();
});

AuthorSchema.virtual("birthDate_str").get(function (){
  return DateTime.fromJSDate(this.date_of_birth).toISODate().toString();
});

AuthorSchema.virtual("deathDate_str").get(function (){
  if(this.date_of_death === null)return "";
  return DateTime.fromJSDate(this.date_of_death).toISODate().toString();
})

//导出Author模型 
module.exports = mongoose.model("Author",AuthorSchema);
