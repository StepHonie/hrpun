$(function()
{
  var win=$(window);
  var dlgRights=$('#dlgRights');
  var dlgEdit=$('#dlgEdit');
  var dlgNoEdit=$("#dlgNoEdit");

  $("#infoTable").find("tbody tr").bind("click",function(e)
  {
    // console.log($(this).find("td").eq(1).text());
    let id=$(this).attr("oid");
    if (id==="")
    {
      return;
    }
    // alert(id);
    // alert($(this).find("td").eq(1).text());
    $.ajax({url:"/getDetails",
            type:"get",
            data:"id="+id,
            dataType: "Text",
            success: function(res)
            {
              let pi=JSON.parse(res);
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
              $(".replaceable").replaceWith('<a class="replaceable" href="/getAttachment?id='+id+'" target="_blank">'+pi.extFilename+'</a>');
              $("#hdFileContent").val(pi.Attachment || "");
              $("#txtArea").val(pi.TxtArea);
              dlgEdit.css({"left":((win.width()-dlgEdit.width())/2+"px")});
              dlgEdit.show();
            }});

    $('#btnDel').unbind("click").bind('click',function(e)
    {
      alert("you want to delete this Information?");

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
           })
          //  .done(function(results{
          //    if(results.success===1){
          //      dlgEdit.hide();
          //      $("tr[oid='"+id+"']").remove();
          //    });
    });

  });

  $('#btnCancel').bind('click',function(e)
  {
    dlgRights.hide();
  });

  $('#btnClose').bind('click',function(e)
  {
    dlgEdit.hide();
  });

  $('#btnAdd').bind('click',function(e)
  {
    //重新打开时清空所有Input的值和textarea
    $("input").each(function()
    {
      $(this).val("");
    });
    $("textarea").val("");

    dlgEdit.css({"left":((win.width()-dlgEdit.width())/2+"px"),"top":((win.height()-dlgEdit.height())/3+"px")});
    dlgEdit.show();
  });

  // $('#btnRights').on('click',function(e)
  // {
  //
    // dlgRights.css({"left":((win.width()-dlgRights.width())/2+"px"),
    //          "top":((win.height()-dlgRights.height())/3+"px")});
    // dlgRights.show();
  // });


  $('#btnDel').bind('click',function(e)
  {
    dlgEdit.hide();
  });



  $('.btnClose').bind('click',function(e)
  {
    dlgEdit.hide();
  });

  function bindEvent()
  {
    $('.iptName').unbind("click").bind('click',function(e)
    {
      $(this).attr('contenteditable','true');
      $(this).find('.spanDel').css('display','none');
    }).unbind("click").bind('keydown',function(e)
    {
      if(e.keyCode==13)
      {
        $(this).attr('contenteditable','false');
        $(this).find('.spanDel').css('display','none')
      }
    }).unbind("click").bind('mouseenter',function(e)
    {
      $(this).find('.spanDel').css('display','inline').unbind('click').bind('click',function(e)
      {
        $(this).parent().parent().remove();
      });
    }).unbind("click").bind('mouseleave',function(e)
    {
      $(this).find('.spanDel').css('display','none');
    });

    $('.checkImg').unbind('click').bind('click',function()
    {
      if($(this).attr("src")=="/images/icons/png/check.png")
      {
        $(this).attr("src","/images/icons/png/checked.png");
      }
      else
      {
        $(this).attr("src","/images/icons/png/check.png");
      }
    });
  }
  bindEvent();

  // $('#addRights').bind('click',function()
  // {
  //   $('#lstRight').append("<tr><td class='iptName' contenteditable='false' style='width: 250px'>[New Name]<span class='spanDel' style='display:none'><img src='/images/icons/png/delete.png' style='float:right'></span></td><td><img class='checkImg' src='/images/icons/png/check.png' style='display:center'></td><td><img class='checkImg' src='/images/icons/png/check.png'></td></tr>");
  //   bindEvent();
  // });

  // $('#saveRights').bind('click',function(e)
  // {
  //   //alert('sldjf');
  //   let tb=$("#lstRight");
  //   let lines=tb.find("tr");
  //   let list=new Array;
  //   for (let i=0;i<lines.length;i++)
  //   {
  //     let o={user: lines.eq(i).find("td").eq(0).text(),
  //            view: (lines.eq(i).find("td").eq(1).find("img").attr("src")==="/images/icons/png/check.png"?false:true),
  //            edit: (lines.eq(i).find("td").eq(2).find("img").attr("src")==="/images/icons/png/check.png"?false:true)};
  //     list.push(o);
  //   }
  //   $.ajax({url: "/saveRights",
  //           type: "POST",
  //           contentType: "application/octet-stream",
  //           data: JSON.stringify(list),
  //           dataType: "text",
  //           success: function(res)
  //           {
  //             alert("Successfully");
  //             dlgRights.hide();
  //             //console.log(res);
  //           }});
  //
  // });

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
        //  console.log(res);
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
    try{
      file=$("#inputfile")[0].files[0];
    }catch(e){
      file=undefined;
    }
    var fr=new FileReader;
    var infoList=new Array;

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
               Attachment: this.result || ($("#hdFileContent").val()===""?"":$("#hdFileContent").val()),
               extFilename: file.name || $(".replaceable").text(),
               TxtArea: $("#txtArea").val()
              };
      infoList.push(obj);
      $.ajax({url: "/saveInfo",
              type: "POST",
              contentType: "application/octet-stream",
              data: JSON.stringify(obj),
              dataType: "text",
              success: function(res)
              {
                //alert('click saveInfo');
                alert(res);
                location.href=location.href;
              }});
    };
    if (file===undefined)
    {
      fr.result=undefined;
      file={name: undefined};
      return fr.onload();
    }
    fr.readAsDataURL(file);
  });

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


});
