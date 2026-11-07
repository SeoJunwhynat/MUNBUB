import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
const source=readFileSync(new URL('../backrooms/src/SpellingMonsterV36.mjs',import.meta.url),'utf8');
test('v3.6 controller is shipped and exposes model, animation and IK interfaces',()=>{
 for(const token of ['export class SpellingMonsterV36','static async load','Chase_Enter','Chase_Loop','Chase_Corner_Left','Chase_Corner_Right','Chase_Stop','Attack','new HandContactIK','setServerSnapshot','setPlaybackRate','update(seconds)'])
  assert.ok(source.includes(token),token);
});
