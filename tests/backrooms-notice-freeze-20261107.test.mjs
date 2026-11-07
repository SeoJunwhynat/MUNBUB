import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import Nav from '../backrooms/src/monster-nav.js';
import server from '../backrooms/server.js';

const html = readFileSync(new URL('../backrooms/index.html', import.meta.url), 'utf8');
const visual = readFileSync(new URL('../backrooms/src/BackroomsMonsterVisual.mjs', import.meta.url), 'utf8');
const bridge = readFileSync(new URL('../backrooms/src/BackroomsMonsterBridge.mjs', import.meta.url), 'utf8');

test('monster chase is 0.8 of sprint; stamina drain is 0.775x and HUD stays doubled', () => {
  const speedMatch = html.match(/PLAYER_WALK_SPEED=3\.30\*1\.05,PLAYER_SPRINT_SPEED=([^;]+);/);
  assert.ok(speedMatch, 'player speed settings exist');
  const sprint = (5.75 * 1.05 * .93) * 1.08;
  assert.equal(speedMatch[1], '(5.75*1.05*.93)*1.08');
  assert.ok(Math.abs(Nav.MONSTER_CHASE_SPEED / sprint - 0.8) < 1e-10);
  assert.match(html, /stamina=Math\.max\(0,stamina-37\.2\*dt\)/);
  assert.match(html, /STAMINA_REGEN_PER_SECOND=18\*4/);
  assert.match(html, /width:clamp\(320px,56vw,600px\)!important/);
  assert.match(html, /width:min\(420px,84vw\)!important/);
  assert.match(html, /width:min\(460px,68vw\)!important/);
  assert.match(html, /height:18px!important;min-width:0!important/);
  assert.match(html, /top:6px!important;display:block!important;width:100%!important;height:6px!important/);
});
test('server holds position and delays capture through the initial Notice, then chases', () => {
  const map = Array.from({length:25}, (_, z) => Array.from({length:25}, (_, x) =>
    x === 0 || z === 0 || x === 24 || z === 24 ? 1 : 0));
  const {room, p} = server.createRoom('Notice regression',
    {map, objects:[], enemy:{x:12,z:10}}, 'test-notice-freeze');
  try {
    room.status = 'playing';
    room.enemy.grace = 0;
    p.x = 12.6;
    p.z = 10;
    p.lastSeen = Date.now();
    const start = {x:room.enemy.x, z:room.enemy.z};
    server.tick();
    assert.equal(room.enemy.mode, 'notice');
    assert.equal(room.enemy.chasing, true);
    assert.equal(room.enemy.x, start.x);
    assert.equal(room.enemy.z, start.z);
    assert.equal(p.alive, true, 'notice must never instantly catch nearby players');
    assert.ok(room.enemy.noticeUntil > Date.now());
    assert.equal(server.snapshot(room).enemy.mode, 'notice');
    server.tick();
    assert.equal(room.enemy.mode, 'notice');
    assert.equal(room.enemy.x, start.x);
    assert.equal(room.enemy.z, start.z);
    room.enemy.noticeUntil = Date.now()-1; // Simulate finished notice animation.
    server.tick();
    assert.equal(room.enemy.mode, 'chase');
    assert.equal(p.alive, false, 'capture is available again after the notice');
  } finally {
    server.rooms.delete(room.code);
  }
});
test('solo and co-op visual clips follow authoritative notice then chase', () => {
  assert.equal(Nav.MONSTER_NOTICE_DURATION_MS, 1200);
  assert.match(html, /if\(enemy.aiMode!=='notice'\)\{\s*enemy\.pathTime-=dt/);
  assert.match(html, /if\(enemy.aiMode!=='notice'&&Math\.hypot\(enemy\.x-player\.x/);
  assert.match(html, /enemy\.aiMode=elapsed<enemy\.noticeUntil\?'notice':'chase'/);
  assert.match(visual, /mode==='notice'\|\|\(!mode&&now<this\.noticeUntil\)/);
  assert.match(bridge, /Notice:'Idle',Attack:'Idle'/);
});
