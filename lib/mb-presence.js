/**
 * Anonymous active-tab counter (process-local, no accounts, IP, cookies or database).
 * A tab is considered online when it has pinged during the last 70 seconds.
 * This is a live estimate, not a lifetime visitor or unique-human count.
 */
const ACTIVE_MS=70_000;
const MAX_SESSIONS=20_000;
const sessions=new Map();
const TOKEN=/^[A-Za-z0-9_-]{20,100}$/;
export function sweepPresence(now=Date.now()){
 for(const [key,expires] of sessions)if(expires<=now)sessions.delete(key);
}
export function activeCount(now=Date.now()){sweepPresence(now);return sessions.size;}
export function pingPresence(id,now=Date.now()){
 if(typeof id!=='string'||!TOKEN.test(id))return null;
 sweepPresence(now);
 if(sessions.size>=MAX_SESSIONS&&!sessions.has(id))return null;
 sessions.set(id,now+ACTIVE_MS);
 return sessions.size;
}
export function forgetPresence(id){
 if(typeof id==='string'&&TOKEN.test(id))sessions.delete(id);
 return activeCount();
}
export function resetPresenceForTests(){sessions.clear()}
