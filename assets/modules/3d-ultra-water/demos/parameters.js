// One parameter contract for the renderer, preview controls, adapter and exporter.
const n=(key,label,group,min,max,step,value)=>({key,label,group,min,max,step,default:value});
export const guiSchema=[
 {key:'view',label:'水效视角',options:['Open ocean','Breakers','Lagoon','Golden hour','Underwater'],default:'Open ocean'},
 n('speed','播放速度','海浪',0,3,0.05,1),
 n('windSpeed','风速 m/s','海浪',1,25,0.1,9),
 n('windDirection','风向 °','海浪',-180,180,1,20),
 n('waveScale','波浪强度','海浪',0,3,0.01,1),
 n('swellScale','远处涌浪','海浪',0,3,0.01,0.7),
 n('choppiness','浪峰陡峭度','海浪',0,2,0.01,0.85),
 n('shoreAmplitude','近岸浪高','岸边浪花',0,1.5,0.01,0.55),
 n('shoreWavelength','近岸波长','岸边浪花',8,60,0.5,30),
 n('shoreSteepness','近岸陡峭度','岸边浪花',0,1.5,0.01,1),
 n('sprayAmount','飞溅强度','岸边浪花',0,3,0.01,1),
 n('clarity','清澈度','水体',0.2,4,0.01,1),
 {key:'waterColor',label:'深水颜色',group:'水体',type:'color',default:'#003f50'},
 n('roughness','水面粗糙度','水体',0.005,0.2,0.001,0.02),
 n('refraction','折射强度','水体',0,0.2,0.001,0.06),
 n('foamScale','泡沫覆盖','水体',0,6,0.01,1.3),
 n('foamRecovery','泡沫消退速度','水体',0.05,3,0.01,0.7),
 n('caustics','海床焦散','水体',0,2,0.01,1),
 n('glint','波光闪烁','水体',0,1,0.01,0.6),
 n('sunElevation','太阳高度 °','光照',-2,70,0.1,14),
 n('sunAzimuth','太阳方位 °','光照',0,360,0.5,205),
 n('sunIntensity','阳光强度','光照',0,20,0.1,9),
 n('cloudCoverage','云量','光照',0,1,0.01,0.38),
 n('exposure','画面曝光','光照',0.25,4,0.01,1),
 n('scattering','水下浑浊度','水下效果',0,0.5,0.001,0.03),
 n('shafts','水下光束','水下效果',0,4,0.01,2),
 n('shaftRange','光束距离','水下效果',5,120,1,40),
 n('underwaterExposure','水下曝光','水下效果',0.2,2,0.01,0.55)
];
export const parameterDefaults=Object.fromEntries(guiSchema.map(s=>[s.key,s.default]));
export function validateParameters(values,{partial=false}={}){
 if(!values||typeof values!=='object'||Array.isArray(values))throw new Error('参数必须是对象');
 const result=partial?{}:{...parameterDefaults};
 for(const [key,value] of Object.entries(values)){
  const s=guiSchema.find(s=>s.key===key);
  if(!s)throw new Error('未知水效参数：'+key);
  if(s.options?!s.options.includes(value):s.type==='color'?!/^#[0-9a-f]{6}$/i.test(value):typeof value!=='number'||!Number.isFinite(value)||value<s.min||value>s.max)throw new Error('水效参数超出范围：'+s.label);
  result[key]=value;
 }
 return result;
}
