$(function()
{
  var win=$(window);
  var dlgEdit=$('#dlgEdit');
  var dlgSearch=$('#dlgSearch');
  var dlgPer=$('#dlgPer');

  //Pager的相关操作
  (function()
  {
    let buttons=$(".page-button");
    if (buttons.length<=10)
    {
      return $(".jsiPager").remove();
    }
    let s=$(".jsiPager").text();
    s=s.split(":");
    $(".jsiPager").remove();
    let pageNumber=Number(s[0]);
    let nPages=Number(s[1]);
    let pageSize=Number(s[2]);
    for (let i=3;i<nPages-3;i++)
    {
      if (Math.abs(pageNumber-i)<2)
      {
        continue;
      }
      buttons.eq(i).parent().prev().find("a").addClass("uuu");
      buttons.eq(i).parent().remove();
    }
    $(".uuu").after("<span>...</span>");
  })();

  $('#adm li').hover
  (
    function(){
      this.childNodes[3].style.display="block";
    },
    function(){
      this.childNodes[3].style.display="none";
    }
  );

  $('#perTable tbody tr').hover
  (
    function(){
      this.childNodes[7].childNodes[1].style.display="block";
    },
    function(){
      this.childNodes[7].childNodes[1].style.display="none";
    }
  );

  $("#infoTable").find("tbody tr").bind("click",function(e)
  {
    if ($(e.target).is("a"))
    {
      return;
    }
    var id=$(this).attr("oid");
    if (id===""){return;}
    $.ajax({url:"/getDetails",
            type:"get",
            data:"id="+id,
            dataType: "Text",
            success: function(res)
            {
              var pi=JSON.parse(res);
              $("#hdID").val(pi._id);
              $("#iptNum").val(pi.employeeNumber);
              $("#iptName").val(pi.Name);
              $("#iptTel").val(pi.Tel);
              $("#iptDep").val(pi.Dep);
              $("#iptWDate").val(pi.WDate);
              $("#iptSDate").val(pi.SDate);
              $("#iptPos").val(pi.Pos);
              $("#iptRule").val(pi.Rule);
              $("#selUnit").val(pi.Unit);
              $("#iptPlant").val(pi.Plant);
              $("#selStatus").val(pi.Status);
              $("#iptOfficer").val(pi.Officer);
              $("#iptEmail").val(pi.email);
              $("#EndDate").val(pi.EndDate);
              $("#FinishDate").val(pi.FinishDate);
              $("#GotDate").val(pi.GotDate);
              $("#receiver").val(pi.Receiver);
              $("#contractType").val(pi.ConType);
              $("#EntryDate").val(pi.EntryDate);
              $("#punType").val(pi.PunType);
              $("#quality").val(pi.Quality);
              if(pi.extFilename==undefined)
              {
                $(".replaceable").replaceWith('<span class="replaceable" style="display:none"><span>');
              }else{
                $(".replaceable").replaceWith('<a class="replaceable" href="/getAttachment?id='+id+'" target="_blank" style="display:block;width:90px;height:20px;overflow:hidden">'+pi.extFilename+'</a>');
              }
              $("#hdFileContent").val(pi.Attachment || "");
              $("#txtArea").val(pi.TxtArea);
              dlgEdit.css({"left":((win.width()-dlgEdit.width())/2+"px"),"top":((win.height()-dlgEdit.height())/2+"px")});
              dlgEdit.show();
            }
          });

    $('#btnDel').unbind("click").bind('click',function(e)
    {
      if(confirm("Are you sure want to delete it?"))
      {
        $.ajax({url:"/delInfo",
               type: "post",
               contentType: "application/octet-stream",
               data: "id="+id,
               dataType: "Text",
               success: function(res)
                 {
                  //  alert("Program should do it automatically.");
                     $("tr[oid='"+id+"']").remove();
                     dlgEdit.hide();
                 }
               });
        }else{
          // dlgEdit.hide();
          return;
        }
      });
  });

  $('.btnClose').bind('click',function(e){dlgEdit.hide();});

  $('#closePer').bind('click',function(e){dlgPer.hide()});

  $('#btnAdd').bind('click',function(e)
  {
    //重新打开时清空所有Input的值和textarea
    $("input").each(function()
    {$(this).val("");});
    $("textarea").val("");
    $(".replaceable").replaceWith('<p class="replaceable"></p>');
    dlgEdit.css({"left":((win.width()-dlgEdit.width())/2+"px"),"top":((win.height()-dlgEdit.height())/2+"px")});
    dlgEdit.show();
  });

  $('#btnSearch').bind('click',function(e)
  {
    dlgSearch.css({"right":15+"px","top":60+"px"});
    dlgSearch.toggle();
  });

  $('#upload').bind('click',function(e)
  {
    $('#iptCsv').trigger('click',e);
    $('#iptCsv').on('change',function(e)
    {
      var file=$('#iptCsv')[0].files[0];
      let fr=new FileReader;
      fr.readAsArrayBuffer(file);
      fr.onload=function(e)
      {
        var arraybuffer = fr.result;
        var data = new Uint8Array(arraybuffer);
        var arr = new Array();
        for(var i = 0; i != data.length; ++i)
        {
          arr[i] = String.fromCharCode(data[i]);
        }
        var bstr = arr.join("");
        var workbook = XLSX.read(bstr, {type:"binary"});
        var first_sheet_name = workbook.SheetNames[0];
        var worksheet = workbook.Sheets[first_sheet_name];
        var info=XLSX.utils.sheet_to_json(worksheet,{header:1})
        $.ajax({url:"/uploadExcel",
                type:"post",
                contentType:"application/octet-stream",
                data:JSON.stringify(info),
                dataType:"text",
                success: function(res)
                {
                  // alert(res);
                  location.href=location.href;
                }
              });
      }
    });
  });

  $(".cancel").bind('click',function() {dlgSearch.hide();});

  $('#iptNum').keydown(function(e)
  {
    var num=$('#iptNum').val();
    var ev = document.all ? window.event : e;
    if(ev.keyCode==13)
    {
     $.ajax({url: "/getNum",
             type: "get",
             data: "num="+num,
             dataType: "Text",
             success: function(res)
             {
               var json=JSON.parse(res);
               if(json.error===true)
               {
                 alert("请输入正确的工号!");
                 return;
               }
               $("#iptName").val(json.name);
               $("#iptTel").val(json.telephoneNumber);
               $("#iptDep").val(json.department);
               $("#iptPos").val(json.title);
               $("#iptPlant").val(json.company);
               $("#iptEmail").val(json.mail);
             }
           });
    }
  });

  $('#saveInfo').bind('click',function(e)
  {
    var file;
    var fr=new FileReader;
    try{
      file=$("#inputfile")[0].files[0];
    }catch(e){
      // file=undefined;
      file=" ";
    }
    if($("#iptNum").val()=="")
    {
      alert("Please enter employee number!");
      return;
    }
    fr.onload=function()
    {
      var obj={_id: $("#hdID").val(),
               employeeNumber: $("#iptNum").val(),
               Name: $("#iptName").val(),
               Tel: $("#iptTel").val(),
               Dep: $("#iptDep").val(),
               WDate: $("#iptWDate").val(),
               SDate: $("#iptSDate").val(),
               Pos: $("#iptPos").val(),
               Rule: $("#iptRule").val(),
               Unit: $("#selUnit").val(),
               Plant: $("#iptPlant").val(),
               Status: $("#selStatus").val(),
               Officer: $("#iptOfficer").val(),
               email: $("#iptEmail").val(),
               EndDate: $("#EndDate").val(),
               FinishDate:$("#FinishDate").val(),
               GotDate: $("#GotDate").val(),
               Receiver: $("#receiver").val(),
               ConType: $("#contractType").val(),
               EntryDate: $("#EntryDate").val(),
               PunType: $("#punType").val(),
               Quality: $("#quality").val(),
               TxtArea: $("#txtArea").val(),
               Attachment: this.result || ($("#hdFileContent").val()===""?"":$("#hdFileContent").val()),
               extFilename: file.name || $(".replaceable").text(),
               operator:$("#username").text()};
      $.ajax({url: "/saveInfo",
              type: "post",
              contentType: "application/octet-stream",
              data: JSON.stringify(obj),
              dataType: "text",
              success: function(res)
              {
                location.href=location.href;
              }});
    };

    if (file===undefined)
    {
      fr.result="";
      file={name: undefined};
      return fr.onload();      //fr.onload()事件需要先加载，此才能调用；
    }
    fr.readAsDataURL(file);
  });

  $('#btnFile').on('click',function(e)
  {
    $('#inputfile').trigger('click',e);
    $('#inputfile').on('change',function(e){
      var file=$('#inputfile')[0].files[0];
      $('.replaceable').replaceWith('<a class="replaceable" style="display:block;width:70px;height:20px;overflow:hidden;">'+file.name+'</a>');
    });
  });

  $('#btnPer').on('click',function(e)
  {
    dlgPer.css({"left":((win.width()-dlgPer.width())/2+"px"),"top":((win.height()-dlgPer.height())/2+"px")});
    dlgPer.show();
  });

  $('#addAdm').on('click',function(e)
  {
    let num=prompt("Please enter Employee Number...");
    $.ajax({url:"/getNum",
            type: "get",
            data: "num="+num+"&role="+"mgr",
            dataType: "Text",
            success: function(res)
            {
              var json=JSON.parse(res);
              if(json.error===true)
              {
                alert(json.content);
                return;
              }
              $('#adm').append('<li><span>'+json.name+'</span><img class="delAdm" src="images/icons/16/036-cancel.png"></li>');
            }
          });
  });

  $('#addUser').on('click',function(e)
  {
    let num=prompt("Please enter Employee Number...");
    $.ajax({url:"/getNum",
            type: "get",
            data: "num="+num+"&role="+"user",
            dataType: "Text",
            success: function(res)
            {
              var json=JSON.parse(res);
              if(json.error===true)
              {
                alert(json.content);
                return;
              }
              $("#tbUser").append('<tr><td>'+json.name+'</td><td>'+json.title+'</td><td>'+json.department+'</td><td><img style="display:none" src="/images/icons/png/close.png"></td><tr>');
            }
          });
  });

  $('.perDel').on('click',function(e)
  {
    let that=this;
    let id=$(this).attr("pid");
    let pt=$(this).attr("perType");
    $.ajax({url:"/delPer",
            type: "post",
            data: "id="+id,
            dataType: "Text",
            success:function(res)
            {
              if(pt==="adm")
              {
                $(that).parent().remove();
              }else{
                $(that).parent().parent().remove();
              }
            }
            });
  });



});
