var mongoose=require('mongoose');
var rightsSchema=new mongoose.Schema(
    {
      name: String,
      rights: Number,
      creat_date:{type:Date,default:Date.now},
    });

rightsSchema.statics={
    fetch:function(callback)
    {
      return this
      .find({})
      .exec(cb)
    }
  }

module.exports=rightsSchema
