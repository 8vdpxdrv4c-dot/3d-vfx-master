"""Export the exact water preset/parameters/camera selected in the preview."""
import sys
sys.dont_write_bytecode = True
import argparse, json, math
from pathlib import Path
from exporter import export_module, overrides_for

ROOT = Path(__file__).resolve().parents[1]


def load_selection(path):
    data = json.loads(Path(path).read_text(encoding='utf-8-sig'))
    if not isinstance(data, dict) or data.get('format') != '3d-vfx-water-selection' or data.get('version') != 1:
        raise ValueError('Expected a version 1 water selection from the preview.')
    if data.get('skill') != '3d-vfx-master' or data.get('module') != '3d-ultra-water':
        raise ValueError('Selection must target 3d-vfx-master / 3d-ultra-water.')
    item = next(x for x in json.loads((ROOT/'references/effect-catalog.json').read_text(encoding='utf-8')) if x['slug'] == data['module'])
    look = next((x for x in item['looks'] if x['id'] == data.get('look')), None)
    params = data.get('params')
    if not look or not isinstance(params, dict) or set(params) != {s['key'] for s in item['schema']}:
        raise ValueError('Selection must contain a known look and every current water parameter.')
    sets = [key+'='+json.dumps(value,ensure_ascii=False) for key,value in params.items()]
    overrides_for(item, sets, None)
    if params['view'] != look['params']['view']:
        raise ValueError('Selected look and camera view do not match.')
    camera = data.get('camera')
    if camera is not None:
        if not isinstance(camera, dict) or any(not isinstance(camera.get(key),list) or len(camera[key]) != 3 or any(isinstance(v,bool) or not isinstance(v,(int,float)) or not math.isfinite(v) or abs(v)>80000 for v in camera[key]) for key in ('position','target')):
            raise ValueError('Camera position and target must contain three finite coordinates each.')
        camera = {key:camera[key] for key in ('position','target')}
    return item,look,sets,camera


def main():
    parser = argparse.ArgumentParser(description='按预览页选择的参数和视角导出逼真海水')
    parser.add_argument('--selection-file',required=True)
    parser.add_argument('--out',required=True)
    args = parser.parse_args()
    try:
        item,look,sets,camera = load_selection(args.selection_file)
        result = export_module(ROOT,item,args.out,look['id'],sets)
        if camera is not None:
            path = Path(result['exported_to'])/'demos/meta.js'
            raw = path.read_text(encoding='utf-8')
            meta = json.loads(raw[raw.index('=')+1:].strip().rstrip(';'))
            meta['initialCamera'] = camera
            path.write_text('export const meta='+json.dumps(meta,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
        result['preview'] = str(Path(result['exported_to'])/'preview.html')
        result['camera'] = camera
        print(json.dumps(result,ensure_ascii=False,indent=2))
    except (ValueError,OSError,StopIteration) as error:
        parser.error(str(error))


if __name__ == '__main__':
    main()
