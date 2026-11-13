// Native progress adapter: owns only this listener, never a global scrolling override.
export function createScrollDriver(element,onProgress){
 const target=element||window;
 const onScroll=()=>{const isWindow=target===window;const max=isWindow?document.documentElement.scrollHeight-innerHeight:target.scrollHeight-target.clientHeight;const value=isWindow?scrollY:target.scrollTop;onProgress(max>0?Math.min(1,Math.max(0,value/max)):0);};
 target.addEventListener('scroll',onScroll,{passive:true});
 return()=>target.removeEventListener('scroll',onScroll);
}
