"""Export a portable module with validated optional look/parameter overrides."""
from pathlib import Path
import copy,json,math,re,shutil,tempfile
from integrity import require_module

def parameter_value(text):
    try:return json.loads(text)
    except json.JSONDecodeError:return text

def overrides_for(item,sets,params_file):
    values={}
    if params_file:
        values=json.loads(Path(params_file).read_text(encoding='utf-8-sig'))
        if not isinstance(values,dict):raise ValueError('Parameter file must contain a JSON object.')
    for assignment in sets or []:
        if '=' not in assignment:raise ValueError('Use --set key=value.')
        key,value=assignment.split('=',1);values[key]=parameter_value(value)
    schema={s['key']:s for s in item['schema']}
    for key,value in values.items():
        if key not in schema:raise ValueError('Unknown parameter '+key+'; choose '+', '.join(schema))
        s=schema[key]
        if s.get('type')=='boolean':
            if not isinstance(value,bool):raise ValueError(key+' requires true or false.')
        elif s.get('type')=='color':
            if not isinstance(value,str) or not re.fullmatch(r'#[0-9a-fA-F]{6}',value):raise ValueError(key+' requires a six-digit #RRGGBB color.')
        elif 'options' in s:
            if value not in s['options']:raise ValueError(key+' requires one of '+', '.join(map(str,s['options'])))
        elif 'min' in s:
            if isinstance(value,bool) or not isinstance(value,(int,float)) or not math.isfinite(value) or not s['min']<=value<=s['max']:
                raise ValueError(key+' requires a finite number in ['+str(s['min'])+', '+str(s['max'])+'].')
    return values

def export_module(root,item,destination,look=None,sets=None,params_file=None):
    root=root.resolve()
    source=(root/item['resource_dir']).resolve();dest=Path(destination).expanduser().resolve()
    if root not in source.parents or not source.is_dir():raise ValueError('Module resource path must be a directory inside the installed skill.')
    if dest==root or root in dest.parents or dest in root.parents:raise ValueError('Choose an output directory outside the installed skill.')
    if dest.exists():raise ValueError('Output directory already exists; choose a new directory: '+str(dest))
    require_module(root,item)
    values=overrides_for(item,sets,params_file)
    selected=next((l for l in item['looks'] if l['id']==look),None) if look else item['looks'][0]
    if selected is None:raise ValueError('Unknown look '+str(look)+'; choose '+', '.join(l['id'] for l in item['looks']))
    for p in source.rglob('*'):
        if p.is_symlink():raise ValueError('Module resources must not contain symbolic links: '+p.name)
    meta_text=None
    if look or values:
        text=(source/'demos/meta.js').read_text(encoding='utf-8')
        match=re.fullmatch(r'\s*export const meta\s*=\s*([\s\S]+);\s*',text)
        if not match:raise ValueError('Unsupported module metadata format.')
        meta=json.loads(match.group(1));looks=copy.deepcopy(meta['looks'])
        selected_meta=next(l for l in looks if l['id']==selected['id']);selected_meta['params'].update(values)
        meta['looks']=[selected_meta]+[l for l in looks if l['id']!=selected_meta['id']]
        meta_text='export const meta='+json.dumps(meta,ensure_ascii=False,indent=2)+';\n'
    dest.parent.mkdir(parents=True,exist_ok=True)
    stage=Path(tempfile.mkdtemp(prefix='.vfx-export-',dir=dest.parent))
    try:
        shutil.copytree(source,stage,dirs_exist_ok=True)
        # 复制 shared/ 目录（统一 demo chrome），使导出副本也有顶部导航与复制按钮
        shared_src=root/'assets/shared'
        if shared_src.is_dir():
            shutil.copytree(shared_src,stage/'shared',dirs_exist_ok=True)
            # 重写 demo 页面中的 shared 路径：源项目用 ../../../shared/，导出副本在 demos/ 里用 ../shared/
            for html in (stage/'demos').rglob('index.html'):
                text=html.read_text(encoding='utf-8')
                text=text.replace('../../../shared/','../shared/')
                html.write_text(text,encoding='utf-8')
        if meta_text:
            (stage/'demos/meta.js').write_text(meta_text,encoding='utf-8')
            (stage/'export-config.json').write_text(json.dumps({'module':item['slug'],'initial_look':selected['id'],'parameter_overrides':values,'source':'3d-vfx-master installed module; only exported metadata was customized'},ensure_ascii=False,indent=2),encoding='utf-8')
        if dest.exists():raise ValueError('Output directory appeared during export; existing contents were not replaced.')
        stage.rename(dest)
    finally:
        if stage.exists():
            assert stage.resolve().parent==dest.parent.resolve() and stage.name.startswith('.vfx-export-')
            shutil.rmtree(stage)
    return {'module':item['slug'],'exported_to':str(dest),'demo':str(dest/'demos/index.html'),'guide':str(dest/'module-guide.md'),'source':item['source_kind'],'attribution':item.get('attribution'),'initial_look':selected['id'],'parameter_overrides':values,'additional_skill_installed':False}
