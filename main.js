var express=require('express');
var path=require('path');
var app=express();
var session=require("express-session");
var mongo=require("mongodb").MongoClient;
var ObjectId=require("mongodb").ObjectID;
var bodyParser=require("body-parser");
var ActiveDirectory=require('activedirectory');
var url=require("querystring");

var radio=require('./Radio/radioForNode');
var trans=require('./Method/basic');

mongo.connect("mongodb://127.0.0.1:27017/Punishment",function(err,db)
{
  if (err){
    console.log(err.message);
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

  //Authenticate premission
  app.post("/",function(req,res)
  {
    let name=req.body.username;
    let pwd=req.body.password;
    let config={ url:'LDAP://cnctuc0dc10',
                 baseDN: 'dc=corp,dc=jabil,dc=org',
                 attribute: {user: ["*"]},
                 username: "JABIL\\"+name,
                 password: pwd }
    let ad=new ActiveDirectory(config);
    ad.authenticate(config.username,config.password,function(err,user){
      if(err)
      {
        return res.render("login",{error:true,msg:"Username or password is wrong."});
      }
      if(user){
        name=new RegExp(name,"gi");
        db.collection("Permission").find({ntid: name}).toArray(function(err,list)
        {
          if (err || list.length===0)
          {
            return res.render("login",{error: true,msg: "INVALID USER"});
          }
          req.session.user=list[0];
          req.session.login=true;
          req.session.save();
          if(list[0].role==="mgr")
          {
            res.redirect("/");
          }else{
            res.redirect("/indexForUser");
          }
        });
      }else{
        console.log("Authenticate failed");
      }
    });
  });

  //Get basic infomation from server
  app.get('/',function(req,res)
  {
    var pn=Number(req.query.pageNumber) || 0;
    var ps=Number(req.query.pageSize) || 10;
    var con={};
    //除了Pager传来的查询，其它的人名或高级查询都要对session.con进行清空
    if(req.query.name!==undefined) req.session.con={};
    if(req.query.name===undefined || req.query.name==="")
    {
      con.Name=undefined;
    }else{
      con.Name={$regex:`.*${req.query.name}.*`,$options:"ui"};
    }
    if(req.query.advDep===undefined || req.query.advDep==="")
    {
      con.Dep=undefined;
    }else{
      con.Dep={$regex:`.*${req.query.advDep}.*`,$options: "ui"};
    }
    if(req.query.advPlant===undefined || req.query.advPlant==="")
    {
      con.Plant=undefined;
    }else{
      con.Plant={$regex:`.*${req.query.advPlant}.*`,$options:"ui"};
    }
    con.employeeNumber=req.query.advNum || undefined;
    con.WDate=req.query.advDate || undefined;
    con.Quality=req.query.advQuality || undefined;
    con.ConType=req.query.contractType || undefined;
    con.PunType=req.query.punType || undefined;
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
    data=con;
    db.collection("Information").find(data).sort({"createTime":-1}).skip(pn*ps).limit(ps).toArray(function(err,list)
    {
      db.collection("Information").count(data,function(err,r)
      {
        db.collection("Permission").find({"role":"mgr"}).toArray(function(err,list1)
        {
          db.collection("Permission").find({"role":"user"}).toArray(function(err,list2)
          {
            let u=new Array();
            let keys=Object.keys(req.query);
            for (let n of keys)
            {
              if (n==="pageNumber" || n==="pageSize")
              {
                continue;
              }
              u.push(n+"="+req.query[n]);
            }
            res.render('index',{
              title: "HR 处罚管理系统",
              listInfo: list,
              records: r,
              pageNumber: pn,
              pageSize: ps,
              perAdm: list1,
              perUser: list2,
              conds: u.join("&")
            });
          });
        });
      });
    });
  });

  app.get('/indexForUser',function(req,res)
  {
    var pn=Number(req.query.pageNumber) || 0;
    var ps=Number(req.query.pageSize) || 10;
    var con={};
    //除了Pager传来的查询，其它的人名或高级查询都要对session.con进行清空
    if(req.query.name!==undefined) req.session.con={};
    con.Name=req.query.name || undefined;
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
    //Todo
    let dep=req.session.user.Department;
    db.collection("Information").find({"Dep":dep}).sort({"createTime":-1}).skip(pn*ps).limit(ps).toArray(function(err,list)
    {
      if(err) console.log(err);
      db.collection("Information").count({"Dep":dep},function(err,r)
      {
        res.render('indexForUser',{
          title: "HR 处罚管理系统",
          listInfo: list,
          records: r,
          pageNumber: pn,
          pageSize: ps
        });
      });
    });
  });

  app.post('/uploadExcel',function(req,res)
  {
    var data = JSON.parse(req.body);
    for(var i=1;i<=data.length;i++)
    {
      var item = data[i];
      if (!item)
      {
        continue;
      }
      var obj={ SDate: trans.dateTrans(item[2]),
                Name: item[3],
                employeeNumber: item[4],
                Plant: item[5],
                Dep: item[6],
                TxtArea: item[7],
                WDate: trans.dateTrans(item[8]),
                Unit: item[9],
                Quality: item[10],
                Rule: item[11],
                PunType: item[12],
                EndDate: trans.dateTrans(item[13]),
                Pos: item[14],
                EntryDate: trans.dateTrans(item[15]),
                Level: item[16],
                ConType: item[17],
                JobType: item[18],
                Officer: item[19],
                Comments: item[20] };
        db.collection("Information").insert(obj,function(err,res)
        {
          if(err)
          {
            console.log(err);
            res.end("Upload Failed!");
          }
        });
      }
      res.end("Upload Successfully!");
    });

  app.get("/download",function(req,res)
  {
    let data=req.query;
    let cond=new Object();
    let keys=Object.keys(data);
    if(req.session.user.role==="user")
    {
      cond={"Dep":req.session.user.Department};
    }else{
      cond=req.session.con;
    }
    db.collection("Information").find(cond,{Attachment: 0}).toArray(function(err,list)
    {
      if(err){return res.end(err.message);}
      var buf="受理日期,姓名,工号,厂别,部门,违纪事宜简要,处分开始日期,开出单位,违纪性质,奖惩条例,处分类型,处分结束日期,职务,入职日期,职级,合同类型,成本类别,负责人,备注";
      buf="<table border='1'><thead><tr><td>"+buf.split(",").join("</td><td>");
      buf+="</td></tr></thead><tbody>";
      for (var i=0;i<list.length;i++)
      {
        buf+="<tr>";
        // buf+="<td>"+list[i].SerNum+"</td>";
        buf+="<td>"+list[i].SDate+"</td>";
        buf+="<td>"+list[i].Name+"</td>";
        buf+="<td>"+list[i].employeeNumber+"</td>";
        buf+="<td>"+list[i].Plant+"</td>";
        buf+="<td>"+list[i].Dep+"</td>";
        buf+="<td>"+list[i].TxtArea+"</td>";
        buf+="<td>"+list[i].WDate+"</td>";
        buf+="<td>"+list[i].Unit+"</td>";
        buf+="<td>"+list[i].Quality+"</td>";
        buf+="<td>"+list[i].Rule+"</td>";
        buf+="<td>"+list[i].PunType+"</td>";
        buf+="<td>"+list[i].EndDate+"</td>";
        buf+="<td>"+list[i].Pos+"</td>";
        buf+="<td>"+list[i].EntryDate+"</td>";
        buf+="<td>"+list[i].Level+"</td>";
        buf+="<td>"+list[i].ConType+"</td>";
        buf+="<td>"+list[i].JobType+"</td>";
        // buf+="<td>"+list[i].Tel+"</td>";
        // buf+="<td>"+list[i].Receiver+"</td>";
        // buf+="<td>"+list[i].GotDate+"</td>";
        // buf+="<td>"+list[i].Status+"</td>";
        // buf+="<td>"+list[i].FinishDate+"</td>";
        buf+="<td>"+list[i].Officer+"</td>";
        buf+="<td>"+list[i].Comments+"</td>";
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
      json.createTime=date.getTime();
      json.updateTime=date.getTime();
      db.collection("Information").insert(json,function(err,res1)
      {
        if (err){console.log(err.message);}
      });
      return res.end("新增成功!");
    }else{
      let doc=new Object();
      db.collection("Information").find({_id:new ObjectId(id)}).toArray(function(err,old)
      {
        if (err) return res.end("Error");
        if (old.length===0) return res.end("This infor doesn't exist.");
        let oldKeys=Object.keys(old[0]);
        let opArr={};
        doc.keysId=new ObjectId(id);
        doc.values=opArr;
        doc.updateTime=(new Date).getTime();
        doc.updatePerson=req.session.user.name;
        for(let n of oldKeys)
        {
          if(!json[n] || old[0][n].toString()===json[n].toString())
          {
            continue;
          }else{
            opArr[n]=old[0][n]+">>>"+json[n];
          }
        }
        db.collection("opLog").insert(doc,function(err,res2)
        {
          if (err) return res.end("Error");
          delete json._id;
          json.updateTime=date.getTime();
          db.collection("Information").update({_id: new ObjectId(id)},{$set: json});
          res.end("更新成功!");
        });
      });
    }
  });

  app.post("/delInfo",function(req,res)
  {
    let o=url.parse(req.body.toString());
    db.collection("Information").remove({_id: new ObjectId(o.id)});
    res.header("Content-Length","2");
    return res.end("OK");
  });

  app.post("/delPer",function(req,res)
  {
    let id=req.body.id;
    db.collection("Permission").remove({_id: new ObjectId(id)});
    return res.end("OK");
  });

  app.get("/getAttachment",function(req,res)
  {
    db.collection("Information").find({_id: new ObjectId(req.query.id)}).toArray(function(err,list)
    {
      if (err || list.length===0)
      {
        return res.end("{\"error\": true}");
      }
      try
      {
        let buf=list[0].Attachment.split(",")[1];
        buf=new Buffer(buf,"base64");
        res.header("Content-Disposition","attachment;filename=\""+list[0].extFilename+"\"");
        return res.end(buf);
      }
      catch (e)
      {
        res.end("Undefined means doesn't have any attachment.");
      }
    });
  });

  app.get("/getDetails",function(req,res)
  {
    db.collection("Information").find({_id: new ObjectId(req.query.id)}).toArray(function(err,list)
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
                            callback({error: true,content: "User not found! Please enter correct employee number."});
                            }
                            //此callback为下面自己在本地定义的
                            callback({error: false,list:list});
                        });
                    },
                    callback: function(info)
                    {
                      if(info.error===true)
                      {
                       res.end(JSON.stringify(info));
                      }else{
                        let data=info.list[0];
                        let ntid=data.sAMAccountName.toLowerCase();
                        let role=req.query.role;
                        let title=req.query.title;
                        let department=decodeURIComponent(req.query.dep);
                        if(role!==undefined)
                        {
                          db.collection("Permission").insert({"ntid":ntid,"name":data.name,"role":role,"title":title,"Department":department},function(err)
                          {
                            if(err) console.log(err.message);
                            res.end(JSON.stringify(data));
                          });
                        }else{
                            res.end(JSON.stringify(data));
                        }
                      }
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

  app.get("/getSearchInfo",function(req,res)
  {
    db.collection("Information").find({}).toArray(function(err,list)
    {
      if(err || list.length===0) return res.end("Something wrong.");
      var name=[];
      for(var i=0;i<list.length;i++)
      {
        name[i]=list[i].Name;
      }
      return res.end(JSON.stringify(name));
    });
  });

  app.listen(3000);

});
