
function dateTrans(oldDate)
{
  // if(date==="\\") newdate="null";
  let date=oldDate.split("/");
  if(date[0]<10) date[0]="0"+date[0];
  if(date[1]<10) date[1]="0"+date[1];
  let newdate="20"+date[2]+"-"+date[0]+"-"+date[1];
  return newdate;
}

//也可用于中英文字体的转换；
function getProName(n)
{
  let o={"name": "Name",
         "advDep" :  "Dep",
         "advPlant" : "Plant",
         "advNum" : "employeeNumber",
         "advDate" : "WDate",
         "advQuality" : "Quality",
         "advCon" : "ConType"}
  return o[n] || n;
}


module.exports={dateTrans:dateTrans,getProName:getProName};
