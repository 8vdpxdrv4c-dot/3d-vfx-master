"""Deterministic keyword retrieval; specific effect names outweigh broad family words."""
import re,unicodedata
def normalize(value):
    return ' '.join(re.sub(r'[-_/]+',' ',unicodedata.normalize('NFKC',value).casefold()).split())
GENERIC={'材质','效果','特效','场景','可视化','展示','3d','material','materials','effect','effects','scene','scenes'}
def rank_items(items,query):
    q=normalize(query)
    if not q:return list(items)
    exact=[item for item in items if q in {normalize(item['slug']),normalize(item['zh']),normalize(item['name'])}]
    if exact:return exact
    scored=[]
    for item in items:
        hay=normalize(' '.join([item['slug'],item['zh'],item['name'],item.get('tagline',''),item['category'],item.get('family',''),*item['keywords']]))
        keys={normalize(k) for k in [item['slug'],item['zh'],item['name'],*item['keywords']] if len(normalize(k))>1 and normalize(k) not in GENERIC}
        hits=[k for k in keys if (re.search(r'(?<![a-z0-9])'+re.escape(k)+r'(?![a-z0-9])',q) if re.search(r'[a-z0-9]',k) else k in q)]
        score=sum(10+len(k) for k in hits)
        if q in {normalize(item['slug']),normalize(item['zh']),normalize(item['name'])}:score+=100
        scored.append([score,item,hay])
    specific=any(row[0]>0 for row in scored)
    result=[]
    for score,item,hay in scored:
        if specific:
            if not score:continue
        elif q in {'材质','material','materials'}:
            if item.get('family')!='materials':continue
        elif q not in GENERIC:
            terms=[t for t in re.findall(r'[a-z0-9]+|[\u3400-\u9fff]+',q) if t not in {'the','and','of','a','an','3d'}]
            if not terms or not all(t in hay for t in terms):continue
        result.append((score,item))
    return [item for _,item in sorted(result,key=lambda r:-r[0])]
