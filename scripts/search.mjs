const norm=value=>String(value).normalize('NFKC').toLowerCase().replace(/[-_/]+/g,' ').trim().replace(/\s+/g,' ');
const generic=new Set(['材质','效果','特效','场景','可视化','展示','3d','material','materials','effect','effects','scene','scenes']);
export function rankItems(items,query){
 const q=norm(query);if(!q)return [...items];
 const exact=items.filter(item=>[item.slug,item.zh,item.name].map(norm).includes(q));if(exact.length)return exact;
 const containsKey=k=>/[a-z0-9]/.test(k)?new RegExp('(?<![a-z0-9])'+k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![a-z0-9])').test(q):q.includes(k);
 const rows=items.map(item=>{
  const hay=norm([item.slug,item.zh,item.name,item.tagline||'',item.category,item.family||'',...item.keywords].join(' '));
  const keys=[...new Set([item.slug,item.zh,item.name,...item.keywords].map(norm).filter(k=>k.length>1&&!generic.has(k)))];
  let score=keys.filter(containsKey).reduce((n,k)=>n+10+k.length,0);
  if([item.slug,item.zh,item.name].map(norm).includes(q))score+=100;
  return {score,item,hay};
 });
 const specific=rows.some(r=>r.score>0);
 return rows.filter(({score,item,hay})=>{
  if(specific)return score>0;
  if(['材质','material','materials'].includes(q))return item.family==='materials';
  if(generic.has(q))return true;
  const terms=(q.match(/[a-z0-9]+|[\u3400-\u9fff]+/g)||[]).filter(t=>!['the','and','of','a','an','3d'].includes(t));
  return terms.length>0&&terms.every(t=>hay.includes(t));
 }).sort((a,b)=>b.score-a.score).map(r=>r.item);
}
