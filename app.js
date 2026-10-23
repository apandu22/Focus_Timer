(function(){
  const $=id=>document.getElementById(id);
  const store={
    get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},
    set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  };
  // Timer
  let total=25*60,left=total,tick=null,focus=true;
  const today=new Date().toDateString();
  let stats=store.get('stats',{});
  if(stats.day!==today)stats={day:today,n:0};
  const render=()=>{
    const m=String(Math.floor(left/60)).padStart(2,'0'),s=String(left%60).padStart(2,'0');
    $('time').textContent=m+':'+s;
    document.title=m+':'+s+' · Focus Timer';
    $('fill').style.width=((total-left)/total*100)+'%';
    $('count').textContent=stats.n+' focus session'+(stats.n===1?'':'s')+' completed today';
  };
  const stop=()=>{clearInterval(tick);tick=null;$('start').textContent='Start'};
  document.querySelectorAll('.modes button').forEach(b=>b.onclick=()=>{
    document.querySelectorAll('.modes button').forEach(x=>x.classList.remove('on'));
    b.classList.add('on');stop();focus=b.dataset.min==='25';
    total=left=b.dataset.min*60;render();
  });
  $('start').onclick=()=>{
    if(tick){stop();return}
    $('start').textContent='Pause';
    tick=setInterval(()=>{
      left--;
      if(left<=0){
        left=0;stop();
        if(focus){stats.n++;store.set('stats',stats)}
        try{navigator.vibrate&&navigator.vibrate(300)}catch(e){}
        alert(focus?'Focus session complete. Take a break.':'Break over. Ready to focus?');
        left=total;
      }
      render();
    },1000);
  };
  $('reset').onclick=()=>{stop();left=total;render()};
  render();

  // Tasks
  let tasks=store.get('tasks',[]);
  const save=()=>store.set('tasks',tasks);
  const draw=()=>{
    const ul=$('list');ul.innerHTML='';
    $('empty').style.display=tasks.length?'none':'block';
    tasks.forEach((t,i)=>{
      const li=document.createElement('li');if(t.done)li.className='done';
      const cb=document.createElement('input');cb.type='checkbox';cb.checked=t.done;
      cb.setAttribute('aria-label','Mark done');
      cb.onchange=()=>{t.done=cb.checked;save();draw()};
      const sp=document.createElement('span');sp.textContent=t.text;
      const x=document.createElement('button');x.textContent='×';x.setAttribute('aria-label','Delete task');
      x.onclick=()=>{tasks.splice(i,1);save();draw()};
      li.append(cb,sp,x);ul.append(li);
    });
  };
  $('form').onsubmit=e=>{
    e.preventDefault();
    const v=$('input').value.trim();if(!v)return;
    tasks.push({text:v,done:false});save();$('input').value='';draw();
  };
  draw();
})();
