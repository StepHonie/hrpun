var express=require('express');
var path=require('path');
var radio=require('./Radio/radioForNode');
var app=express();
var session=require("express-session");
var mongo=require("mongodb").MongoClient;
var ObjectId=require("mongodb").ObjectID;
var bodyParser=require("body-parser");
var ActiveDirectory=require('activedirectory');


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

  app.use((req,res,next)=>
  {
    if (req.url==="/" && req.method==="POST")
    {
      return next();
    }
    if (req.session.login!==true)
    {
      return res.render("login",{error: false,msg: ""});
    }
    return next();
  });

  app.post("/",function(req,res)
  {
    var name=req.body.username;
    var pwd=req.body.password;
    var config={ url:'LDAP://cnctuc0dc10',
                 baseDN: 'dc=corp,dc=jabil,dc=org',
                 attribute: {user: ["*"]},
                 username: "JABIL\\"+name,
                 password: pwd }
    var ad=new ActiveDirectory(config);
    ad.authenticate(config.username,config.password,function(err,user){
      if(err){
        console.log('Error:',err);
        res.render("login",{error:true,msg:"Username or password is wrong."});
        return;
      }
      if(user){
        db.collection("Admin").find({username: name}).toArray(function(err,list)
        {
          if (err || list.length===0)
          {
            return res.render("login",{error: true,msg: "INVALID USER"});
          }
          req.session.user=list[0];
          req.session.login=true;
          req.session.save();
          res.redirect("/");
        });
      }else{
        console.log("Authenticate failed");
      }
    });
  });

  app.get('/',function(req,res)
  {
    var pn=Number(req.query.pageNumber) || 0;
    var ps=Number(req.query.pageSize) || 10;
    var cond={};
    cond.Name=req.query.name || undefined;
    req.session.cond=req.session.cond || {};
    if(cond.Name===undefined)
    {
      delete cond;
    }else{
      cond.Name={$regex: cond.Name, $options: 'i'};
      req.session.cond=cond;
      req.session.save();
    }
    var data=req.session.cond;
    console.log("查询条件(data):",data);
      db.collection("history").find(data).sort({"createTime":-1}).skip(pn*ps).limit(ps).toArray(function(err,list2)
      {
        db.collection("history").count(data,function(err,r)
        {
          res.render('index',{
            user:req.session.user.name,
            title: "HR 处罚管理系统",
            listInfo: list2,
            records: r,
            pageNumber: pn,
            pageSize: ps
          });
        });
      });
  });

  app.post('/uploadExcel',function(req,res){
    var json=req.body.toString();
    var data=JSON.parse(json);
    console.log("data:",data);
    // data.shfit();
    // for (let item of data)
    for(let i=1;i<data.length;i++)
    {
      let item=data[i];
      let o={SerNum: item[0],
             SDate: item[1],
             Name: item[2],
             employeeNumber: item[3],
             Plant: item[4],
             Dep: item[5],
             TxtArea: item[6],
             iptWDate: item[7],
             Unit: item[8],
             Quality: item[9],
             Rule: item[10],
             PunType: item[11],
             EndDate: item[12],
             Pos: item[13],
             ConType: item[14],
             JobType: item[15],
             Tel: item[16],
             Receiver: item[17],
             GotDate: item[18],
             Status: item[19],
             FinishDate: item[20],
             Officer: item[21],
             Comments: item[22]};
      db.collection("history").insert(o,function(err,res){
        if(err) console.log(err.message)
      });
    }
    return res.end("save successfully!");
  });

  app.get('/advSearch',function(req,res){
    var pn=Number(req.query.pageNumber) || 0;
    var ps=Number(req.query.pageSize) || 10;
    var con={};
    con.employeeNumber=req.query.advNum || undefined;
    con.Dep=req.query.advDep || undefined;
    con.Plant=req.query.advPlant || undefined;
    con.WDate=req.query.advDate || undefined;
    con.Quality=req.query.advQuality || undefined;
    con.ConType=req.query.advCon || undefined;
    req.session.con=req.session.con || {};

    for (var n in con)
    {
      if (con[n]===undefined)
      {
        delete con[n];
      }else{
        req.session.con[n]=con[n];
        req.session.save();
      }
    }
    data=req.session.con;
    console.log("查询条件:",con,req.session.con);
    console.log("pn:"+pn+"=ps:"+ps);

    db.collection("history").find(data).sort({"createTime":-1}).skip(pn*ps).limit(ps).toArray(function(err,list)
    {
      // console.log("查询数据：",list);
      db.collection("history").count(data,function(err,n)
      {
        console.log("查询条数："+n);
        res.render('index',{
          title: "HR 处罚管理系统",
          listInfo: list,
          records: n,
          pageNumber: pn,
          pageSize: ps
        });
      });
    });
  });

  app.get('/userGroup',function(req,res){
    res.render("userGroup",{
      data:"Hello Stephanie",
    });
  });

  // app.get('/normal',function(req,res)
  // {
  //   let pn=Number(req.query.pageNumber) || 0;
  //   let ps=Number(req.query.pageSize) || 10;
  //   let cond={};
  //   cond.Name=req.query.name || undefined;
  //   if (cond.Name)
  //   {
  //     cond.Name=new RegExp(cond.Name,"gi");
  //   }else{
  //     delete cond.Name;
  //   }
  //   db.collection("Rights").find({}).toArray(function(err,list)
  //   {
  //     db.collection("Info").find(cond).sort({"WDate":-1}).skip(pn*ps).limit(ps).toArray(function(err,list2)
  //     {
  //       db.collection("Info").count(cond,function(err,r)
  //       {
  //         res.render('normal',{
  //           listInfo: list2,
  //           title: "HR 处罚管理系统",
  //           records: r,
  //           pageNumber: pn,
  //           keyword: req.query.name || undefined,
  //           pageSize: ps,
  //           list: list
  //           });
  //         });
  //       });
  //   });
  // });

  // app.post("/saveRights",function(req,res)
  // {
  //   let json=req.body.toString();
  //
  //   json=JSON.parse(json);
  //   db.collection("Rights").removeMany({},function()
  //   {
  //     for (let i=0;i<json.length;i++)
  //     {
  //       db.collection("Rights").insert(json[i]);
  //     }
  //   });
  //   res.end("You have saved rights succssfully!");
  // });

  app.get("/download",function(req,res)
  {
    var data=req.session.con;
    console.log("data:",data);
    db.collection("history").find(data,{attachment: 0}).toArray(function(err,list)
    {
      if(err)
      {
        return res.end(err.message);
      }
      var buf="工号,姓名,电话,部门,违纪日期,受理日期,职务,奖惩条例,开出单位,厂别,处理状态,ER负责人,邮箱,完成时间,领取时间,领取人,合同类型,入职日期,处分类型,性质概述,违纪事宜简要";
      buf="<table border='1'><thead><tr><td>"+buf.split(",").join("</td><td>");
      buf+="</td></tr></thead><tbody>";
      for (var i=0;i<list.length;i++)
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
    var date=new Date();
    if (id.length===0)
    {
      delete json._id;
      json.createTime=date;
      json.updateTime=date;
      db.collection("history").insert(json,function(err,res)
      {
        if (err){console.log(err.message);}
      });
      return res.end("新增成功!");
    }else{
      delete json._id;
      json.updateTime=date;
      db.collection("history").update({_id: new ObjectId(id)},{$set: json});
      res.end("更新成功!");
    }

  });

  app.post("/delInfo",function(req,res)
  {
    let url=require("querystring");
    let o=url.parse(req.body.toString());
    db.collection("history").remove({_id: new ObjectId(o.id)});
    res.header("Content-Length","2");
    return res.end("OK");
  });

  app.get("/getAttachment",function(req,res)
  {
    db.collection("history").find({_id: new ObjectId(req.query.id)}).toArray(function(err,list)
    {
      if (err || list.length===0)
      {
        return res.end("{\"error\": true}");
      }
      console.log(list[0].Attachment);
      let buf=list[0].Attachment.split(",")[1];
      buf=new Buffer(buf,"base64");
      res.header("Content-Disposition","attachment,filename="+list[0].extFilename);
      return res.end(buf);
    });
  });

  app.get("/getDetails",function(req,res)
  {
    db.collection("history").find({_id: new ObjectId(req.query.id)}).toArray(function(err,list)
    {
      if(err || list.length===0)
      {
        return res.end("{\"error\":true}");
      }
      return res.end(JSON.stringify(list[0]));
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
