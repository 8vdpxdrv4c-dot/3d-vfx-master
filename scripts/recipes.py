"""Export verified composition starters; arbitrary module combinations remain an authored integration."""
from pathlib import Path
import json,shutil,tempfile
from exporter import export_module
RECIPES={'aurora-rain':{'title':'雨幕与极光','modules':['3d-rain','3d-aurora'],'output_owner':'shared scene renderer'},'glass-bloom':{'title':'玻璃产品与辉光','modules':['3d-glass','3d-bloom'],'output_owner':'single bloom lens pass'}}
def scaffold(root,name,destination):
    root=root.resolve();dest=Path(destination).expanduser().resolve();recipe=RECIPES[name]
    if dest==root or root in dest.parents or dest in root.parents:raise ValueError('Choose an output outside the installed skill.')
    if dest.exists():raise ValueError('Output exists; choose a new directory.')
    items=json.loads((root/'references/effect-catalog.json').read_text(encoding='utf-8'))
    dest.parent.mkdir(parents=True,exist_ok=True);stage=Path(tempfile.mkdtemp(prefix='.vfx-recipe-',dir=dest.parent))
    try:
        for slug in recipe['modules']:
            item=next(m for m in items if m['slug']==slug);export_module(root,item,stage/'modules'/slug)
        source=root/'assets/recipes'/name
        text=(source/'index.html').read_text(encoding='utf-8').replace('../../modules/','./modules/').replace('../styles.css','./styles.css').replace('href="../../../index.html"','href="./recipe-notes.md"').replace('← 大师技能','← 组合说明')
        text=text.replace('../../runtime/vendor/','./modules/'+recipe['modules'][0]+'/demos/vendor/')
        (stage/'index.html').write_text(text,encoding='utf-8')
        (stage/'main.js').write_text((source/'main.js').read_text(encoding='utf-8').replace("'../../modules/'","'./modules/'"),encoding='utf-8')
        shutil.copy2(root/'assets/recipes/styles.css',stage/'styles.css')
        (stage/'recipe.json').write_text(json.dumps({'recipe':name,**recipe,'sources_retained':True},ensure_ascii=False,indent=2),encoding='utf-8')
        (stage/'recipe-notes.md').write_text('# '+recipe['title']+'\n\n使用3Dfans特效大师的已验证组合模板。模块源码、依赖与许可位于 modules/。\n\n本模板只包含两种已实际验收的组合，不把任意渲染链或全屏喷水自动叠到宿主深度中。使用静态HTTP服务打开 index.html；?low&still 为节能静帧检查。\n',encoding='utf-8')
        if dest.exists():raise ValueError('Output appeared while generating the recipe.')
        stage.rename(dest)
    finally:
        if stage.exists():
            assert stage.resolve().parent==dest.parent.resolve() and stage.name.startswith('.vfx-recipe-');shutil.rmtree(stage)
    return {'recipe':name,**recipe,'output':str(dest),'entry':str(dest/'index.html')}
