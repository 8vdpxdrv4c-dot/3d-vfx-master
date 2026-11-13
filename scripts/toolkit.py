"""Local module discovery and self-contained demo export. Standard library only."""
import sys
sys.dont_write_bytecode=True
from pathlib import Path
import argparse, json, re, shutil, difflib
from search_core import rank_items
from exporter import export_module
from recipes import scaffold, RECIPES
from integrity import verify

ROOT=Path(__file__).resolve().parents[1]

def catalog():
    return json.loads((ROOT/'references/effect-catalog.json').read_text(encoding='utf-8'))

def selected(slug):
    for item in catalog():
        if item['slug']==slug:
            return item
    suggestions=difflib.get_close_matches(slug,[m['slug'] for m in catalog()],n=3)
    raise SystemExit('Unknown module: '+slug+('; did you mean '+', '.join(suggestions)+'?' if suggestions else '; run list to see available modules.'))

def main():
    parser=argparse.ArgumentParser(description='3Dfans特效大师：检索模块或导出独立 Demo')
    commands=parser.add_subparsers(dest='command',required=True)
    for name in ['list','search']:
        p=commands.add_parser(name)
        if name=='search':p.add_argument('query')
        p.add_argument('--category',choices=sorted({m['category'] for m in catalog()}|{m.get('family',m['category']) for m in catalog()}))
        p.add_argument('--source',choices=['independent','user-supplied'])
    commands.add_parser('verify')
    p=commands.add_parser('show');p.add_argument('slug')
    p=commands.add_parser('export');p.add_argument('slug');p.add_argument('--out',required=True);p.add_argument('--look');p.add_argument('--set',action='append',default=[]);p.add_argument('--params-file')
    p=commands.add_parser('scaffold');p.add_argument('recipe',choices=sorted(RECIPES));p.add_argument('--out',required=True)
    args=parser.parse_args()
    if args.command=='verify':
        try:result=verify(ROOT)
        except (ValueError,OSError) as error:parser.error(str(error))
        print(json.dumps(result,ensure_ascii=False,indent=2));return 0 if result['pass'] else 1
    if args.command=='scaffold':
        try:result=scaffold(ROOT,args.recipe,args.out)
        except (ValueError,OSError) as error:parser.error(str(error))
        print(json.dumps(result,ensure_ascii=False,indent=2));return
    if args.command=='show':
        print(json.dumps(selected(args.slug),ensure_ascii=False,indent=2));return
    if args.command=='export':
        try:
            result=export_module(ROOT,selected(args.slug),args.out,args.look,args.set,args.params_file)
        except (ValueError,OSError) as error:
            parser.error(str(error))
        print(json.dumps(result,ensure_ascii=False,indent=2));return
    query=getattr(args,'query','')
    items=[item for item in catalog() if (not args.category or args.category in {item['category'],item.get('family')}) and (not args.source or item['source_kind']==args.source)]
    result=[{'slug':m['slug'],'name':m['zh'],'category':m['category'],'family':m.get('family'),'render_role':m['render_role'],'looks':len(m['looks']),'source':m['source_kind'],'guide':m['guide']} for m in rank_items(items,query)]
    print(json.dumps(result,ensure_ascii=False,indent=2))

if __name__=='__main__':
    raise SystemExit(main())
