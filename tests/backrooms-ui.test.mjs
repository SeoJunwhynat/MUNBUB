import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
const html=readFileSync(new URL('../backrooms/index.html',import.meta.url),'utf8');

test('backrooms inline client scripts parse; existing 3D and HUD remain present',()=>{
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
 assert.ok(scripts.length>0);
 for(const [,code] of scripts)new Script(code,{filename:'backrooms/index.html'});
 assert.match(html,/id="gl"/);
 assert.match(html,/id="controlPanel"/);
 assert.match(html,/id="multiplayerBtn"/);
});
test('public room UI binds one set of controls and never duplicates original co-op buttons',()=>{
 for(const id of ['multiConnect','multiWaiting','multiJoin','multiCreate','mbPublicRooms','mbPublicRefresh','mbRoomTitle','mbRoomLimit','mbRoomVisibility','mbRoomLobbyMeta']){
  const count=(html.match(new RegExp('id="'+id+'"','g'))||[]).length;
  assert.equal(count,1,id+' must be unique');
 }
 assert.match(html,/loadPublicRooms\(\)/);
 assert.match(html,/joinMulti\(\)/);
 assert.match(html,/function openControlSettings/);
});
