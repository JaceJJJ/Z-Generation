
function show(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function openPlace(name,arr){
  let s=document.getElementById('sheet');
  s.style.display='block';
  s.innerHTML='<h3>'+name+'</h3>'+arr.map(x=>'<div class="item">'+x+'</div>').join('')+'<div class="item" onclick="closeSheet()">关闭</div>';
}

function closeSheet(){
  document.getElementById('sheet').style.display='none';
}
