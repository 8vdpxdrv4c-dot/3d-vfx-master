import GUI from 'lil-gui';
export const defaultsFromSchema=s=>Object.fromEntries(s.map(x=>[x.key,x.default]));
export function bindGui(container,schema,params,onChange){
 const gui=new GUI({container,title:'Parameters / 参数',width:268});
 for(const s of schema){
  let c;if(s.type==='color')c=gui.addColor(params,s.key);else if(s.options)c=gui.add(params,s.key,s.options);else if(s.type==='boolean')c=gui.add(params,s.key);else c=gui.add(params,s.key,s.min,s.max,s.step);
  c.name(s.label);
  const inputs=[...c.domElement.querySelectorAll('input')];
  for(const input of inputs){
   if(s.type==='color'){input.removeAttribute('aria-labelledby');input.setAttribute('aria-label',s.label+(input.type==='color'?' / 取色器':' / HEX 色值'));}
   else if(s.min!==undefined){input.inputMode='decimal';input.setAttribute('role','spinbutton');input.setAttribute('aria-valuemin',s.min);input.setAttribute('aria-valuemax',s.max);input.setAttribute('aria-valuenow',params[s.key]);if(s.step!==undefined)input.setAttribute('step',s.step);}
  }
  c.onChange(()=>{if(s.min!==undefined)for(const input of inputs)input.setAttribute('aria-valuenow',params[s.key]);onChange();});
 }
 return gui;
}
