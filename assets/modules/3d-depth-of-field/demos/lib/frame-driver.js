// One owner for animation, visibility and paused OrbitControls damping.
export function createFrameDriver({canvas,clock,controls,isPaused,update,draw,onError}){
 let raf=0,alive=true,visible=true,ticks=0;
 const active=()=>alive&&visible&&!document.hidden;
 const state=()=>{canvas.dataset.loopState=!alive?'disposed':!active()?'hidden':isPaused()?'paused':'playing';};
 function cancel(){if(raf)cancelAnimationFrame(raf);raf=0;}
 function request(){if(active()&&!raf)raf=requestAnimationFrame(tick);}
 function changed(){if(active()&&isPaused()){draw();request();}}
 function tick(){
  raf=0;if(!active()){state();return;}
  canvas.dataset.loopTicks=String(++ticks);
  try{const dt=Math.min(clock.getDelta(),.05);if(controls.enabled)controls.update();if(!isPaused()){update(dt);draw();request();}}
  catch(error){cancel();onError(error);}
  state();
 }
 function refresh(){cancel();clock.getDelta();state();if(active()&&!isPaused())request();}
 function visibility(){refresh();if(active()&&isPaused())draw();}
 controls.addEventListener('change',changed);document.addEventListener('visibilitychange',visibility);
 state();
 return {refresh,setVisible(value){visible=value;visibility();},dispose(){alive=false;cancel();controls.removeEventListener('change',changed);document.removeEventListener('visibilitychange',visibility);state();}};
}
