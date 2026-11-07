import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
const html=readFileSync(new URL('../backrooms/index.html',import.meta.url),'utf8');

test('retry resets elapsed, stamina and input before graphics or audio startup',()=>{
 const m=html.match(/function start\(\)\{[\s\S]*?\n\}/);
 assert.ok(m);
 const start=m[0];
 assert.ok(start.indexOf('elapsed=')<start.indexOf('rebuildWorld()'));
 assert.ok(start.indexOf('stamina=100')<start.indexOf('rebuildWorld()'));
 assert.ok(start.includes("game='playing'"));
 assert.match(start,/ensureGameLoop\(\)/);
 assert.match(start,/try\{startSound\(\)\}catch/);
});
test('game simulation advances before visuals and cannot be stopped by audio',()=>{
 const loop=html.match(/function ensureGameLoop\(\)\{[\s\S]*?\n\}/)?.[0];
 const simulation=html.match(/function stepGameSimulation\(ts\)\{[\s\S]*?\n\}/)?.[0];
 assert.ok(loop);assert.ok(simulation);
 assert.match(simulation,/update\(dt\)/);
 assert.ok(loop.indexOf('stepGameSimulation(ts)')<loop.indexOf('render(ts,dt)'));
 assert.match(loop,/finally\{ensureGameLoop\(\)\}/);
 assert.match(html,/stepGameSimulation\(now\)/);
 assert.match(html,/function render\(ts,frameDt\)\{/);
 assert.match(html,/try\{syncSoundscape\(\);syncChaseCues\(\)\}/);
});
test('catch sound input becomes 3x the preceding boost and retains limiter',()=>{
 assert.match(html,/const previousCaughtGain=\.69\*9/);
 assert.match(html,/const jumpscareBoost=3/);
 assert.match(html,/kind==='caught'\?previousCaughtGain\*jumpscareBoost:\.53/);
 assert.match(html,/limit:kind==='caught'/);
 assert.match(html,/compressor=audio\.createDynamicsCompressor\(\)/);
});
test('new GIF preserves aspect and old finish callbacks do not end a new attempt',()=>{
 assert.match(html,/#jumpscareGif\{display:block;width:100vw;height:100dvh/);
 assert.match(html,/object-fit:contain/);
 assert.match(html,/if\(!won&&!online\.active&&game!=='jumpscare'\)return/);
});
test('the patched client inline script parses',()=>{
 const tags=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
 const inline=tags.find(([full])=>!full.includes('type='));
 assert.ok(inline);new Script(inline[1]);
});
