$(function()
{
  var win=$(window);
  var dlgEdit=$('#dlgEdit');
  var dlgSearch=$('#dlgSearch');

  $("#infoTable").find("tbody tr").bind("click",function(e)
  {
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
              $("#iptSDate").val(pi.SDate),
              $("#iptPos").val(pi.Pos),
              $("#iptRule").val(pi.Rule),
              $("#selUnit").val(pi.Unit),
              $("#iptPlant").val(pi.Plant),
              $("#selStatus").val(pi.Status),
              $("#iptOfficer").val(pi.Officer),
              $("#iptEmail").val(pi.email),
              $("#FinishDate").val(pi.FinishDate),
              $("#GotDate").val(pi.GotDate),
              $("#receiver").val(pi.Receiver),
              $("#contractType").val(pi.ConType),
              $("#EntryDate").val(pi.EntryDate),
              $("#punType").val(pi.PunType),
              $("#quality").val(pi.Quality),
              // $("#inputfile").val(<a href="/getAttachment?id=<%=listInfo[i]._id%>" target="_blank"><%=listInfo[i].extFilename%></a>),
              //$("#inputfile").hide();
              $(".replaceable").replaceWith('<a class="replaceable" href="/getAttachment?id='+id+'" target="_blank" style="display:block;width:90px;height:20px;overflow:hidden">'+pi.extFilename+'</a>');
              $("#hdFileContent").val(pi.Attachment || "");
              $("#txtArea").val(pi.TxtArea);
              dlgEdit.css({"left":((win.width()-dlgEdit.width())/2+"px")});
              dlgEdit.show();
            }});

    $('#btnDel').unbind("click").bind('click',function(e)
    {
      if(confirm("Are you sure want to delete it?")){
        $.ajax({url:"/delInfo",
               type: "post",
               contentType: "application/octet-stream",
               data: "id="+id,
               dataType: "Text",
               success: function(res)
                 {
                   $("tr[oid='"+id+"']").remove();
                   dlgEdit.hide();
                 }
             });
        }else{
          dlgEdit.hide();
        }
    });
  });

  $('.btnClose').bind('click',function(e)
  {
    dlgEdit.hide();
  });

  $('#btnAdd').bind('click',function(e)
  {
    //重新打开时清空所有Input的值和textarea
    $("input").each(function()
    {$(this).val("");});
    $("textarea").val("");
    $(".replaceable").replaceWith('<p class="replaceable"></p>');
    dlgEdit.css({"left":((win.width()-dlgEdit.width())/2+"px"),"top":((win.height()-dlgEdit.height())/3+"px")});
    dlgEdit.show();
  });

  $('#btnSearch').bind('click',function(e)
  {
    dlgSearch.css({"left":345+"px","top":65+"px"});
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
        console.log(info);
        $.ajax({url:"/uploadExcel",
                type:"post",
                contentType:"application/octet-stream",
                data:JSON.stringify(info),
                dataType:"text",
                success: function(res)
                {
                  alert(res);
                }
              });
      }
    });
  });

  // var foundData={};
  // $('#advSearch').bind('click',function(e)
  // {
  //   var oob={employeeNumber:$('#advNum').val(),
  //            Dep:$('#advDep').val(),
  //            Plant:$('#advPlant').val(),
  //            WDate:$('#advDate').val(),
  //            Quality:$('#quality').val(),
  //            ConType:$('#advCon').val()}
  //   $.ajax({url:"/advSearch",
  //           type:"post",
  //           contentType:"application/octet-stream",
  //           data:JSON.stringify(oob),
  //           dataType:"text",
  //           success:function(res){
  //             foundData=JSON.parse(res);
  //           }
  //         });
  //   });

  $(".cancel").bind('click',function() {
    dlgSearch.hide();
  });

  //iptNum, getNum
  // function bindEvent()
  // {
  //   $('.iptName').unbind("click").bind('click',function(e)
  //   {
  //     $(this).attr('contenteditable','true');
  //     $(this).find('.spanDel').css('display','none');
  //   }).unbind("click").bind('keydown',function(e)
  //   {
  //     if(e.keyCode==13)
  //     {
  //       $(this).attr('contenteditable','false');
  //       $(this).find('.spanDel').css('display','none')
  //     }
  //   }).unbind("click").bind('mouseenter',function(e)
  //   {
  //     $(this).find('.spanDel').css('display','inline').unbind('click').bind('click',function(e)
  //     {
  //       $(this).parent().parent().remove();
  //     });
  //   }).unbind("click").bind('mouseleave',function(e)
  //   {
  //     $(this).find('.spanDel').css('display','none');
  //   });
  //
  //   $('.checkImg').unbind('click').bind('click',function()
  //   {
  //     if($(this).attr("src")=="/images/icons/png/check.png")
  //     {
  //       $(this).attr("src","/images/icons/png/checked.png");
  //     }
  //     else
  //     {
  //       $(this).attr("src","/images/icons/png/check.png");
  //     }
  //   });
  // }
  // bindEvent();

  $('#iptNum').keydown(function(e){
    var num=$('#iptNum').val();
    var ev = document.all ? window.event : e;
    if(ev.keyCode==13)
    {
       $.ajax({
       url: "/getNum",
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
         var pi=json.list[0];

         $("#iptName").val(pi.name);
         $("#iptTel").val(pi.telephoneNumber);
         $("#iptDep").val(pi.department);
         $("#iptPos").val(pi.title);
         $("#iptPlant").val(pi.company);
         $("#iptEmail").val(pi.mail);
       }});
    }
  });

  $('#saveInfo').bind('click',function(e)
  {
    var file;
    var fr=new FileReader;

    try{
      file=$("#inputfile")[0].files[0];
    }catch(e){
      file=undefined;
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
               FinishDate: $("#FinishDate").val(),
               GotDate: $("#GotDate").val(),
               Receiver: $("#receiver").val(),
               ConType: $("#contractType").val(),
               EntryDate: $("#EntryDate").val(),
               PunType: $("#punType").val(),
               Quality: $("#quality").val(),
               TxtArea: $("#txtArea").val(),
               //
               Attachment: this.result || ($("#hdFileContent").val()===""?"":$("#hdFileContent").val()),
               extFilename: file.name || $(".replaceable").text(),
               operator:$("#username").text()
              };
      // infoList.push(obj);
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
      buttons.eq(i).prev().addClass("uuu");
      buttons.eq(i).remove();
    }
    $(".uuu").after("<span>...</span>");
  })();

  //模拟点击 InputFile.
  $('#btnFile').on('click',function(e){
    $('#inputfile').trigger('click',e);
    $('#inputfile').on('change',function(e){
      var file=$('#inputfile')[0].files[0];
      $('.replaceable').replaceWith('<a class="replaceable" style="display:block;width:70px;height:20px;overflow:hidden;">'+file.name+'</a>');
    });
  });

});
