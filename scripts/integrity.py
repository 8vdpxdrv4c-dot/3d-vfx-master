"""Validate local distribution bytes against its bundled manifest, never execute them."""
from pathlib import Path
import hashlib,json

def verify(root,prefix=None):
    root=Path(root).resolve();manifest=root/'references/package-manifest.json'
    data=json.loads(manifest.read_text(encoding='utf-8'));rows=data['files'];errors=[];seen=set();checked=0
    for row in rows:
        rel=row['path'];path=(root/rel).resolve()
        if path==root or root not in path.parents or rel in seen:raise ValueError('Unsafe or duplicate manifest path: '+rel)
        seen.add(rel)
        if prefix and not rel.startswith(prefix.rstrip('/')+'/'):continue
        checked+=1
        if not path.is_file():errors.append({'path':rel,'problem':'missing'})
        elif hashlib.sha256(path.read_bytes()).hexdigest()!=row['sha256']:errors.append({'path':rel,'problem':'sha256 mismatch'})
    if not checked:raise ValueError('No manifest entries matched the requested resources.')
    return {'pass':not errors,'files_checked':checked,'errors':errors,'scope':prefix or 'distribution files; manifest itself is excluded','trust':'Detects accidental changes against the local manifest; not a cryptographic publisher signature.'}

def require_module(root,item):
    result=verify(root,item['resource_dir'])
    if not result['pass']:raise ValueError('Module integrity check failed: '+', '.join(x['path']+' ('+x['problem']+')' for x in result['errors'][:3])+'. Restore the reviewed package before exporting.')
