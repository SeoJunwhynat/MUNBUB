from pathlib import Path
import json
p=Path('server.js')
s=p.read_text()
if "'public-arena'" not in s:
    if "'public-rooms', 'ranked'" in s:
        s=s.replace("'public-rooms', 'ranked'", "'public-rooms', 'public-arena', 'ranked'",1)
    elif "'public-rooms','ranked'" in s:
        s=s.replace("'public-rooms','ranked'", "'public-rooms','public-arena','ranked'",1)
    else:
        raise SystemExit('Unrecognized server route layout; no files changed')
    p.write_text(s)
p=Path('package.json')
conf=json.loads(p.read_text())
checks='node --check api/public-arena.js && node --check lib/mb-arena-engine.js'
if 'public-arena.js' not in conf['scripts'].get('check',''):
    conf['scripts']['check']=conf['scripts'].get('check','')+(' && ' if conf['scripts'].get('check') else '')+checks
    p.write_text(json.dumps(conf,indent=2,ensure_ascii=False)+'\n')
print('Render API route and verification scripts updated')
