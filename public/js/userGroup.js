$(function()
{
  $('#addAdm').click(function(e)
  {
    alert("You want to add administrator!");
  });

  $('#adm li').hover(
    function(){
      this.childNodes[3].style.display="block";
    },
    function(){
      this.childNodes[3].style.display="none";
    }
  );

  var box=$(".checkBox");
  $("#allBox").on('click',function(e){
    for(var i=0;i<box.length;i++){
      if(this.checked){
        box[i].checked=true;
        $('#boxPic').attr('src','images/icons/24/015-remove-red.png');
      }else{
        box[i].checked=false;
        $('#boxPic').attr('src','images/icons/24/038-add.png');
      }
    }
  });

  box.on('click',function(e){
   for(var i=0;i<box.length;i++){
     if(box[i].checked){
       $('.thead img').attr('src','images/icons/24/015-remove-red.png');
       break;
     }else{
       $('.thead img').attr('src','images/icons/24/038-add.png');
     }
    }
  });


});
