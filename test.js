const ActiveDirectory=require("activedirectory");

let ad=new ActiveDirectory({url: "LDAP://cnctuc0dc10",
                            baseDN: "dc=corp,dc=jabil,dc=org",
                            username: "JABIL\\LOUT",
                            password: "mal183486power@C"});
ad.authenticate("JABIL\\lout","mal183486power@C",(err,user)=>
{
  console.log(err || user);
});
