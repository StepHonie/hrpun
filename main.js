var express=require('express');
var path=require('path');
var radio=require('./Radio/radioForNode');
var app=express();
let session=require("express-session");
let mongo=require("mongodb").MongoClient;
let ObjectId=require("mongodb").ObjectID;
let bodyParser=require("body-parser");


mongo.connect("mongodb://127.0.0.1:27017/Punishment",function(err,db)
{
  if (err)
  {
    console.log(e.message);
    process.exit(0);
  }
  app.set('views','./views/pages');
  app.set('view engine','ejs');
  app.use(express.static(path.join(__dirname,'public')));
  app.use(bodyParser.raw({limit: "11mb"}));
  app.use(bodyParser.urlencoded({limit: "11mb"}));
  app.use(session({secret:"Permission'secret",name:"Permission"}));

  console.log("I'm listening port: 3000");

  app.post("/",function(req,res)
  {
    db.collection("Admin").find({username: req.body.username,password: req.body.password}).toArray(function(err,list)
    {
      if (err || list.length===0)
      {
        return res.render("login",{error: true,msg: "INVALID USER"});
      }
      req.session.login=true;
      req.session.save();
      res.redirect("/");
    });
  });

  app.get('/userGroup',function(req,res){
    res.render("userGroup",{
      data:"Hello Stephanie"
    });
  });



  app.get('/normal',function(req,res)
  {
    let pn=Number(req.query.pageNumber) || 0;
    let ps=Number(req.query.pageSize) || 10;
    let cond={};
    cond.Name=req.query.name || undefined;
    if (cond.Name)
    {
      cond.Name=new RegExp(cond.Name,"gi");
    }else{
      delete cond.Name;
    }
    db.collection("Rights").find({}).toArray(function(err,list)
    {
      db.collection("Info").find(cond).skip(pn*ps).limit(ps).toArray(function(err,list2)
      {
        db.collection("Info").count(cond,function(err,r)
        {
          res.render('normal',{
            listInfo: list2,
            title: "HR 处罚管理系统",
            records: r,
            pageNumber: pn,
            keyword: req.query.name || undefined,
            pageSize: ps,
            list: list
            });
          });
        });
    });
  });


  app.get('/',function(req,res)
  {
    if (req.session.login!==true)
    {
      return res.render("login",{error: false,msg: ""});
    }
    let pn=Number(req.query.pageNumber) || 0;
    let ps=Number(req.query.pageSize) || 10;
    let cond={};
    cond.Name=req.query.name || undefined;
    if (cond.Name)
    {
      cond.Name=new RegExp(cond.Name,"gi");
    }
    else
    {
      delete cond.Name;
    }
    //console.log(cond);
    db.collection("Rights").find({}).toArray(function(err,list)
    {
      db.collection("Info").find(cond).skip(pn*ps).limit(ps).toArray(function(err,list2)
      {
        db.collection("Info").count(cond,function(err,r)
        {
          res.render('index',{
            listInfo: list2,
            title: "HR 处罚管理系统",
            records: r,
            pageNumber: pn,
            keyword: req.query.name || undefined,
            pageSize: ps,
            list: list});
          });
        });
    });
  });

  app.post("/saveRights",function(req,res)
  {
    let json=req.body.toString();

    json=JSON.parse(json);
    db.collection("Rights").removeMany({},function()
    {
      for (let i=0;i<json.length;i++)
      {
        db.collection("Rights").insert(json[i]);
      }
    });
    res.end("dddd");
  });

  app.get("/download",function(req,res)
  {
    db.collection("Info").find({},{attachment: 0}).toArray(function(err,list)
    {
      if(err)
      {
        return res.end(err.message);
      }
      let buf="工号,姓名,电话,部门,违纪日期,受理日期,职务,奖惩条例,开出单位,厂别,处理状态,ER负责人,邮箱,完成时间,领取时间,领取人,合同类型,入职日期,处分类型,性质概述,违纪事宜简要";
      buf="<table border='1'><thead><tr><td>"+buf.split(",").join("</td><td>");
      buf+="</td></tr></thead><tbody>";


      for (let i=0;i<list.length;i++)
      {
        buf+="<tr>";
        buf+="<td>"+list[i].employeeNumber+"</td>";
        buf+="<td>"+list[i].Name+"</td>";
        buf+="<td>"+list[i].Tel+"</td>";
        buf+="<td>"+list[i].Dep+"</td>";
        buf+="<td>"+list[i].WDate+"</td>";
        buf+="<td>"+list[i].SDate+"</td>";
        buf+="<td>"+list[i].Pos+"</td>";
        buf+="<td>"+list[i].Rule+"</td>";
        buf+="<td>"+list[i].Unit+"</td>";
        buf+="<td>"+list[i].Plant+"</td>";
        buf+="<td>"+list[i].Status+"</td>";
        buf+="<td>"+list[i].Officer+"</td>";
        buf+="<td>"+list[i].email+"</td>";
        buf+="<td>"+list[i].FinishDate+"</td>";
        buf+="<td>"+list[i].GotDate+"</td>";
        buf+="<td>"+list[i].Receiver+"</td>";
        buf+="<td>"+list[i].ConType+"</td>";
        buf+="<td>"+list[i].EntryDate+"</td>";
        buf+="<td>"+list[i].PunType+"</td>";
        buf+="<td>"+list[i].Quality+"</td>";
        buf+="<td>"+list[i].TxtArea+"</td>";
        buf+="</tr>";
      }
      buf="<html><head><meta charset=\"utf-8\" /></head><body>"+buf+"</tbody></table></body></html>";
      res.header("Content-Disposition",`attachment;filename=${(new Date).getTime()}.xls`);
      res.header("Content-Type","application/excel");
      res.end(buf);
    });
  });

  app.post("/saveInfo",function(req,res)
  {
    var json=req.body.toString();
    var json=JSON.parse(json);
    var id=json._id;
    // console.log(json);
    if (id.length===0)
    {
      delete id;
      db.collection("Info").insert(json,function(err,res)
      {
        if (err)
        {
          console.log(err.message);
        }
      });
      return res.end("You have saved Info!");
    }
     delete id;
     db.collection("Info").update({_id: new ObjectId(id)},json);
     res.end("You have saved Info!");
  });

  app.post("/delInfo",function(req,res)
  {
    let url=require("querystring");
    let o=url.parse(req.body.toString());
    db.collection("Info").remove({_id: new ObjectId(o.id)});
    //console.log('you have deleted successfully');
    res.header("Content-Length","2");
    return res.end("OK");
  });

  app.get("/getAttachment",function(req,res)
  {
    db.collection("Info").find({_id: new ObjectId(req.query.id)}).toArray(function(err,list)
    {
      if (err || list.length===0)
      {
        return res.end("{\"error\": true}");
      }
      let buf=list[0].Attachment.split(",")[1];
      buf=new Buffer(buf,"base64");
      res.header("attachment","name="+list[0].extFilename);
      return res.end(buf);
    });
  });

  app.get("/getDetails",function(req,res)
  {
    db.collection("Info").find({_id: new ObjectId(req.query.id)}).toArray(function(err,list)
    {
      if(err || list.length===0)
      {
        return res.end("{\"error\":true}");
      }
      return res.end(JSON.stringify(list[0]));
      //console.log("The id of this item is: "+list[0]._id);
    });
  });


  app.get("/getNum",function(req,res)
  {
    var runner=new radio.Runner("cnctug0sysc01",5521,function()
    {
        runner.run({delegation: function(o)
                    {
                        mm.load("ADReader").getFromAD("employeeNumber="+o.num,function(err,list)
                        {
                            if (err)
                            {
                                return callback({error: true,content: err.message});
                            }
                            if(list===undefined)
                            {
                            callback({error: true,content: "User not found!"});
                            }
                            callback({error: false,list:list});
                        });
                    },
                    callback: function(info)
                    {
                        res.end(JSON.stringify(info));
                    },
                    error: function(ecode,e)
                    {
                      console.log(e.stack);
                    },
                    parameters:
                    {
                      num: req.query.num
                    }
                  });

    },function(e)
    {
        console.log(e);
    });
  });
  app.listen(3000);
});
