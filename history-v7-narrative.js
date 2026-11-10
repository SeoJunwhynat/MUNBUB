/* 《이름 없는 사람들의 역사》 · 1946~47 시나리오 리라이트.
   Fictional ordinary citizens; world history never branches. Side-quests are optional.
   Long dialogue only at two personal choices, document reading and historical epilogue.
*/
(()=>{'use strict';
const KEY='mb_v7_nameless_narrative_v2';
const people={
 miran:'견습 기자 미란',printer:'인쇄공 태식',soon:'시장 상인 순덕',student:'학생 영호',
 editor:'신문사 편집인',mother:'집에 사는 은희',citizen:'광장에 있던 시민',remember:'기록을 지키는 이웃'
};
const initial=()=>({visited:{},met:{},notes:[],choices:{approach:'',headline:'',memory:''},finished:false});
let state=initial();
try{const raw=JSON.parse(localStorage.getItem(KEY)||'null');if(raw&&typeof raw==='object')state={...initial(),...raw,choices:{...initial().choices,...(raw.choices||{})},notes:Array.isArray(raw.notes)?raw.notes:[]}}catch{}
const html=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let bubbleNode,timeout;
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}}
function makeBubble(){
 if(bubbleNode||!document.querySelector('.viewport'))return;
 bubbleNode=document.createElement('div');bubbleNode.id='v7-story-bubble';bubbleNode.setAttribute('role','status');
 bubbleNode.setAttribute('aria-live','polite');bubbleNode.innerHTML='<span></span><p></p>';
 document.querySelector('.viewport').appendChild(bubbleNode);
}
function bubble(person,line,duration=4500){
 makeBubble();if(!bubbleNode)return;
 const head=bubbleNode.querySelector('span'),body=bubbleNode.querySelector('p');
 head.textContent=person;body.textContent=line;clearTimeout(timeout);
 bubbleNode.classList.add('show');timeout=setTimeout(()=>bubbleNode.classList.remove('show'),duration);
}
function note(id,title,desc){
 if(state.notes.some(n=>n.id===id))return false;
 state.notes.push({id,title,desc});persist();return true;
}
function heard(id){return !!state.met[id]}
function flag(id){if(!heard(id)){state.met[id]=true;persist();return true}return false}
function dialog(title,body,buttons){
 const game=window.MB_V7;
 if(!game?.dialog)return;
 game.dialog(title,body,buttons);
}
function close(){window.MB_V7?.closeDialog?.()}
function select(key,value){state.choices[key]=value;persist()}
function npc(id,name,first,again,choose){
 if(heard(id)){bubble(name,typeof again==='function'?again():again);return}
 if(choose){choose();return}
 flag(id);note(id,name,first);bubble(name,first);
}
function onStreetMiran(){
 npc('miran',people.miran,
  '한 장에 담아야 하는데, 어떤 사람의 이야기를 먼저 싣죠?',
  ()=>{
   const p=window.MB_V7?.snapshot?.()?.progress||{};
   if(p.delivered)return '그때 당신이 함께 만든 신문을 본 사람들이 아직도 이야기를 하고 있어요.';
   if(p.printed)return '신문이 완성됐군요. 필요한 건 이제 읽어 줄 사람의 손이에요.';
   return state.choices.approach==='verify'?'그날 말씀대로 날짜를 확인하고 있어요. 인쇄소 기록도 살펴봐요.':'시장과 학교에서 들은 말, 빠뜨리지 않고 적어 둘게요.';
  },()=>{
   dialog('견습 기자 미란 · 1946년 서울',
    '<b>미란 (창작 인물)</b><p>“인쇄소에 넣을 원고가 있는데, 한 줄마다 말이 달라요. 누군가는 날짜를 묻고, 누군가는 오늘 하루를 묻죠.”</p>'+
    '<p>어떻게 첫 취재를 시작할까요? <small>역사적 사건은 달라지지 않으며, 취재 방식에 따라 후속 대사와 개인 기록이 바뀝니다.</small></p>',[
      {t:'원고의 날짜와 출처부터 확인한다',f:()=>{flag('miran');select('approach','verify');note('firstPromise','첫 취재 선택','미란과 함께 신문의 날짜와 출처를 먼저 확인하기로 했다.');close();bubble('미란','그래요. 잘못된 날짜 하나가 다른 의미로 읽힐 수 있으니까요.')}},
      {t:'시장과 학교의 사람들 목소리부터 듣는다',f:()=>{flag('miran');select('approach','voices');note('firstPromise','첫 취재 선택','미란과 함께 거리의 일상을 먼저 듣기로 했다.');close();bubble('미란','좋아요. 기록 속에 남지 않는 하루도 있잖아요.')}}
   ]);
  });
}
function onPrinter(){
 npc('printer',people.printer,
  '종이는 넉넉하지 않고 주문은 밀려 있지. 그래도 읽을 만한 신문은 만들어야 해.',
  ()=>state.choices.headline?'활자는 눌렀다 지우기 어렵지. 그러니 인쇄하기 전에 마지막으로 한 번만 읽어 봐.':'사다리 위 원고와 아래 종이를 먼저 모아 줘. 기계를 돌릴 때는 내가 도울게.');
}
function onSoon(){
 npc('soon',people.soon,
  '사람들은 누구 말이 옳으냐고 묻지만, 나는 내일 가게를 열 수 있을지가 걱정이야.',
  '그 이야기는 신문에 실렸을까? 내 이름이 아니라도, 그날 장터에서 들은 목소리는 남았으면 해.',
  ()=>{
   dialog('시장 상인 순덕 · 장터의 하루',
    '<b>순덕 (창작 인물)</b><p>“누구는 새 나라를 이야기해요. 나는 새 나라에서 장사를 계속할 수 있을지부터 생각하게 되네요.”</p>'+
    '<p>이 이야기를 어떻게 남길까요?</p>',[
     {t:'사람들의 생계가 역사의 한 부분이라고 기록한다',f:()=>{flag('soon');note('market','시장 · 순덕의 장부','광복 뒤의 기대와 함께 물자 부족과 생계의 어려움도 존재했다.');close();bubble('순덕','신문에 내 이름이 없어도 돼요. 이런 하루도 있었다는 것만 남겨 줘요.')}},
     {t:'순덕의 말을 더 듣고 날짜를 함께 확인한다',f:()=>{flag('soon');note('market','시장 · 순덕의 장부','1946년 장터에서 들은 생활상의 증언. 개인의 말은 역사적 사실을 검증하는 과정과 구별해 기록한다.');close();bubble('순덕','맞아요. 들은 말과 확인한 기록은 다를 수 있죠. 그래도 둘 다 필요해요.')}}
    ]);
  });
}
function onStudent(){
 npc('student',people.student,
  '새로 배우는 나라 이야기인데, 책마다 사람마다 서로 다른 말을 해요.',
  '그날 도서실에서 확인했던 날짜가 신문에도 정확히 실렸으면 좋겠어요.',
  ()=>{
   dialog('학생 영호 · 교실에서 듣는 역사',
    '<b>영호 (창작 인물)</b><p>“선생님은 나라를 함께 세워야 한다고 하셨어요. 그런데 왜 거리에서는 서로 싸우는 말만 들릴까요?”</p>',[
    {t:'다른 생각이 있다는 사실도 함께 기록한다',f:()=>{flag('student');note('school','학교 · 영호의 질문','학생의 질문을 통해 해방 뒤 정치적 견해가 다양했음을 살펴보았다.');close();bubble('영호','언젠가 교과서에 답이 적혀 있어도, 그걸 왜 묻기 시작했는지는 기억하고 싶어요.')}},
    {t:'신문에 실을 사실과 사람들의 의견을 구별한다',f:()=>{flag('student');note('school','학교 · 사실과 의견','당시 사람들의 의견과 확인 가능한 사료의 내용을 구분하는 것이 중요하다.');close();bubble('영호','그러면 누가 뭐라고 했는지뿐 아니라, 무엇이 사실인지도 생각할 수 있겠네요.')}}
   ]);
  });
}
function onEditor(){
 npc('editor',people.editor,
  '기사를 쓰는 사람은 많아도 끝까지 확인하는 사람은 드물지.',
  ()=>state.choices.headline==='sources'?'기사 첫머리에 자료의 날짜를 넣었던 판단이 좋았네.':'지금도 어제의 거리를 사람들이 이야기하고 있더군.',
  ()=>{dialog('신문사 편집인 · 기사 검토',
   '<b>편집인 (창작 인물)</b><p>“좌우합작위원회에 대한 기사는 확인된 발표문이 중심이어야 해. 인터뷰는 그 옆에 두자고.”</p>'+
   '<p>※ 1946년 10월 7일 발표된 7원칙은 실제 역사 자료이고, 이 대화는 창작입니다.</p>',[
    {t:'기사에 발표일과 출처를 분명히 적는다',f:()=>{flag('editor');note('editor','신문사 · 자료 검토','발표문 원문과 취재한 개인의 말을 구분하여 기사 원고를 검토했다.');close();bubble('편집인','기사 한 줄이 아니라 날짜부터 남기면, 나중 사람도 다시 확인할 수 있겠지.')}},
    {t:'주민들의 반응을 별도 난에 실을 것을 제안한다',f:()=>{flag('editor');note('editor','신문사 · 시민의 목소리','정치적 발표의 내용과 이를 받아들인 시민들의 반응을 별도로 기록했다.');close();bubble('편집인','좋은 생각일세. 공식 발표와 사람들의 하루를 같은 말로 뭉뚱그리진 말자고.')}}
   ]);
  });
}
function onMother(){
 npc('mother',people.mother,
  '신문에선 큰일이 날마다 생기는데, 이 집의 하루는 밥 짓는 소리부터 시작해.',
  '거리 소식도 궁금하지만, 오늘 네가 어디서 무엇을 봤는지 더 궁금하구나.',
  ()=>{dialog('은희 · 집에서 듣는 소식',
   '<b>은희 (창작 인물)</b><p>“세상은 하루가 다르게 달라진다는데, 집에는 어제 쓰던 밥그릇이 그대로 있어. 그게 이상한 건 아니지?”</p>',[
    {t:'평범한 하루도 기록할 가치가 있다고 말한다',f:()=>{flag('mother');note('home','집 · 이어지는 일상','정치적 사건과 별개로 한 가정의 일상이 계속된다는 점을 기록했다.');close();bubble('은희','그렇지. 소문보다 누군가의 하루를 제대로 기억하는 일도 중요하겠지.')}},
    {t:'오늘 거리에서 확인한 이야기를 들려준다',f:()=>{flag('mother');note('home','집 · 바깥의 변화','집과 거리 사이에서 역사적 변화가 각자 다른 속도로 느껴졌다는 점을 기록했다.');close();bubble('은희','고맙다. 내일의 큰 소식도 결국 사람들의 하루 속으로 들어오는 거니까.')}}
   ]);
  });
}
function onCitizen(){
 npc('citizen',people.citizen,
  '우린 같은 거리에서 살지만, 바라는 내일은 꼭 같지만은 않네요.',
  '다른 의견을 가졌다고 서로의 하루까지 없었던 일로 만들 순 없잖아요.');
}
function on1947Neighbor(){
 npc('remember',people.remember,
  '그날 거리의 공기가 달라졌어요. 소식을 듣고 모두 한동안 말이 없었죠.',
  ()=>state.finished?'사건만 기록하면 사람들은 사라져요. 당신이 남긴 말도 기록 속에 있을 거예요.':'예전 신문과 지금의 기록을 나란히 놓으면 무엇이 달라졌는지 알 수 있을 거예요.');
}
function onPressDesk(){
 bubble('인쇄공 태식',state.choices.headline==='sources'?'발표일을 처음 줄에 박아 두자. 다음 줄에는 그날 사람들의 말을 담고.':'먼저 사람들의 표정을 적어 두자. 발표 내용과 날짜도 빠뜨리지 말고.');
}
function populate(scene,mk){
 if(typeof mk!=='function')return;
 if(scene==='street'){
  mk(235,281,'견습 기자 미란','npc',onStreetMiran);
  mk(735,281,'거리의 전달책','npc',()=>bubble('거리의 전달책','신문을 들고 인쇄소를 나온 사람도, 장터에서 손을 비비던 사람도 모두 같은 서울 사람이었어요.'));
 }else if(scene==='print'){
  mk(240,282,'인쇄공 태식','npc',onPrinter);
  mk(1280,281,'편집용 교정지','doc',()=>{note('proof','인쇄소 · 교정지','좌우합작 7원칙은 1946년 10월 7일 발표되었다. 날짜, 제목, 출처를 인쇄 전에 교차 확인했다.');onPressDesk()});
 }else if(scene==='market'){
  mk(430,282,'시장 상인 순덕','npc',onSoon);
  mk(1130,282,'가게의 장부','doc',()=>{note('ledger','장터의 장부','당시 물자 사정과 서민 생활을 이해하기 위한 창작 기록. 실제 통계 원문이 아니다.');bubble('기록','오래된 장부에는 수입과 지출이 남고, 말로 전하지 못한 사정도 남는다.')});
 }else if(scene==='school'){
  mk(570,282,'학생 영호','npc',onStudent);
  mk(1240,281,'교실의 공책','doc',()=>{note('notebook','교실의 공책','학생이 남긴 창작 기록으로, 광복 이후 새로운 교육에 대한 기대와 혼란을 표현한다.');bubble('기록','공책 가장자리에 작은 글씨가 남아 있다. “우리가 배울 새 나라는 어떤 모습일까?”')});
 }else if(scene==='news'){
  mk(750,281,'신문사 편집인','npc',onEditor);
  mk(1330,282,'서로 다른 신문 제목','doc',()=>{note('headlines','신문사 · 서로 다른 제목','한 사건을 서로 다른 관점에서 보도할 수 있다는 점을 살펴보았다. 창작 신문 제목은 실제 사료와 구분한다.');bubble('기록','같은 날짜의 신문도 제목은 달랐다. 제목과 확인 가능한 사실을 나눠 적는다.')});
 }else if(scene==='home'){
  mk(570,281,'은희의 집','npc',onMother);
  mk(1120,281,'집에 남은 편지','doc',()=>{note('letter','가정 · 보내지 않은 편지','평범한 집에서 역사적 변화가 어떻게 느껴졌는지 표현한 창작 편지.');bubble('기록','보내지 못한 편지가 있다. “내일은 오늘과 조금 다르면 좋겠다.”')});
 }else if(scene==='plaza'){
  mk(970,281,'광장의 시민','npc',onCitizen);
 }else if(scene==='1947'){
  mk(1020,281,'기록을 지키는 이웃','npc',on1947Neighbor);
  mk(1635,281,'신문이 놓인 벤치','doc',()=>{note('laterPaper','1947년 · 신문이 놓인 벤치','여운형 암살 뒤 당시 신문과 이전 좌우합작 자료를 비교해 보았다.');bubble('기록','같은 거리, 다른 날짜. 사람들은 서로 다른 방식으로 그날을 기억했다.')});
 }
}
const entrances={
 museum:['기록관','역사는 위대한 사람의 이름만으로 쓰이지 않습니다. 어느 시대의 문을 열어 보겠습니까?'],
 street:['미란','편집소에 가져갈 기사가 있어요. 그 전에 이 거리 사람들이 무엇을 말하는지 들어 봐 주세요.'],
 print:['태식','활자를 맞춰야 해요. 원고와 종이를 찾고, 발표문의 날짜를 먼저 확인해 줘요.'],
 market:['순덕','물건보다 말이 더 많은 날이네요. 시장에서 사는 사람들 이야기도 듣고 가요.'],
 school:['영호','이젠 다른 글을 배우게 됐다고들 해요. 그런데 나는 새로 묻고 싶은 것이 더 많아요.'],
 news:['편집인','기사에는 날짜가 있습니다. 사람들 말에는 그날의 표정이 있죠. 둘 다 놓치지 맙시다.'],
 home:['은희','밖에서는 큰 소식이 들려오는데, 여기서는 오늘도 저녁을 준비하고 있어요.'],
 plaza:['광장의 시민','모두 다른 말을 하네요. 그런데 이 거리를 지나가는 사람들은 다 비슷한 얼굴을 하고 있어요.'],
 '1947':['기록을 지키는 이웃','이 거리에도 지난해 신문을 기억하는 사람들이 남아 있습니다.']
};
function enter(scene,progress){
 if(!state.visited[scene]){
  state.visited[scene]=true;persist();
  if(entrances[scene])bubble(entrances[scene][0],entrances[scene][1],5600);
 }else if(scene==='street'&&progress?.printed&&!progress?.delivered){
  bubble('미란','이제 신문을 전해요. 저마다 어떻게 읽을지는, 우리가 정할 수 없으니까요.');
 }else if(scene==='1947'&&progress?.cut&&!state.finished){
  bubble('기록을 지키는 이웃','올해의 기록을 남기려면 지난해의 신문을 다시 읽어야 하겠죠.');
 }
}
function beforePrint(resume){
 if(state.choices.headline)return false;
 dialog('인쇄 직전 · 신문 첫머리',
  '<b>미란 (창작 인물)</b><p>“원고에 날짜도 있고, 장터에서 들은 말도 있어요. 중요한 건 무엇을 먼저 보여 주느냐겠죠.”</p>'+
  '<p>발표문에 적힌 역사적 사실은 어느 선택에서도 바뀌지 않습니다.</p>',[
  {t:'발표일과 원문 출처를 먼저 보여 준다',f:()=>{select('headline','sources');note('printChoice','기사 편집 · 발표 내용 중심','1946년 10월 7일 좌우합작 7원칙의 발표일과 자료 출처를 기사 첫머리에 적었다.');close();resume()}},
  {t:'주민들의 반응을 도입부에 담는다',f:()=>{select('headline','voices');note('printChoice','기사 편집 · 거리의 목소리','확인된 발표 내용은 유지하고, 주민의 서로 다른 반응을 기사의 첫머리에 담았다.');close();resume()}}
 ]);
 return true;
}
function printed(){
 bubble('태식','기계가 다시 움직이네요. 활자에는 찍힌 말만 남지만, 신문을 읽을 사람은 저마다 다르겠죠.');
}
function delivered(){
 note('delivery','신문 배달 · 1946년 10월','완성한 신문을 거리에 전달했다. 발표문은 같아도 읽는 사람의 생활과 반응은 같지 않았다.');
}
function deliveryText(){
 if(state.choices.headline==='voices')
  return '<b>신문을 받은 주민 (창작 인물)</b><p>“아, 이건 우리 장터 사람들 얘기네요. 그런데 중요한 발표 날짜도 적혀 있군요.”</p><p>한 장의 신문은 각자의 손으로 넘어갔습니다. 이제 공동 기록판에서 사건들을 서로 연결해 보세요.</p>';
 return '<b>신문을 받은 주민 (창작 인물)</b><p>“1946년 10월 7일이라… 날짜를 알면 나중에 다시 찾아볼 수 있겠네요.”</p><p>어떤 사람은 제목부터, 어떤 사람은 한 구절부터 읽습니다. 공동 기록판에서 사건의 순서를 복원해 보세요.</p>';
}
function aftermath(){
 const notes=state.notes.length;
 const line=state.choices.approach==='voices'
 ?'“그날 제가 들었던 장터와 학교의 목소리는 이제 어디에 남아 있을까요?” — 미란 (창작)'
 :'“그때 확인한 날짜가 있어 다시 살펴볼 수 있겠네요. 그래도 기록에 빠진 사람은 없을까요?” — 미란 (창작)';
 return '<p class="v7-history-after">1년 전 인쇄소의 활자, '+notes+'개의 개인 기록, 그때 신문을 읽던 사람들을 떠올립니다.</p>'+
 '<p><b>'+html(line)+'</b></p><p>역사 속 사건은 바뀌지 않습니다. 남은 것은 이전의 자료와 오늘의 목소리를 함께 읽는 일입니다.</p>';
}
function finalise(after){
 if(state.finished){after?.();return}
 dialog('기록의 마지막 문장 · 1947년 서울',
  '<b>미란 (창작 인물)</b><p>“우리가 쓴 신문은 세상 모두를 담진 못했어요. 그래도 그때 누구와 함께 살았는지, 잊히지는 않았으면 해요.”</p>'+
  '<p>마지막 개인 기록을 어떤 문장으로 남길까요?</p>',[
  {t:'사건의 날짜와 당대 자료를 함께 남긴다',f:()=>{select('memory','documents');finish('남겨진 날짜를 다시 확인하며, 기록에서 빠져 있는 사람들의 하루도 함께 떠올렸다.',after)}},
  {t:'그 시대를 살아간 평범한 사람들의 목소리를 남긴다',f:()=>{select('memory','people');finish('같은 사건을 겪은 평범한 사람들의 서로 다른 기억을 들었다.',after)}}
 ]);
}
function finish(line,after){state.finished=true;note('lastLine','나의 마지막 문장',line);persist();close();bubble('미란','기록해 줘서 고마워요. 이름이 남지 않아도, 누군가는 그곳에 있었으니까요.',5800);after?.()}
function objective(scene,p,base){
 if(scene==='street'&&!p?.printed&&state.visited.print!==true)return '1946년 서울 · 미란과 대화하거나 인쇄소를 자유롭게 조사하세요.';
 if(scene==='print'&&!p?.printed)return '신문 제작 · 원고·종이·사료를 찾아 활자를 직접 배열하세요.';
 if(scene==='street'&&p?.printed&&!p?.delivered)return '신문을 전달하며 주민들이 어떻게 읽는지 확인하세요.';
 if(scene==='street'&&p?.delivered&&!p?.timeline)return '공동 기록판에서 1945~1946년 사건을 실제 순서대로 배열하세요.';
 if(scene==='1947'&&!p?.memorial)return '1947년 · 이전의 신문과 사건 기록을 나란히 읽고 사람들의 반응을 조사하세요.';
 if(['market','school','news','home','plaza'].includes(scene))return '1946년 서울 · 이 공간을 자유롭게 탐험하고 사람들의 이야기를 기록하세요. 필수 퀘스트는 아닙니다.';
 return base;
}
function journal(){
 const entries=state.notes.slice();
 return '<h3>✦ 사람들의 기록 <small>(창작 인물·자료는 실제 사료와 구별)</small></h3>'+
 (entries.length?entries.map(n=>'<div class="v7-story-note"><strong>'+html(n.title)+'</strong><p>'+html(n.desc)+'</p></div>').join(''):
 '<p>아직 개인 기록이 없습니다. 거리, 시장, 학교에서 사람들의 말과 물건을 조사해 보세요.</p>')+
 '<p class="v7-story-note-footer">역사적 사건과 날짜는 별도로 확인한 실제 사료에 근거합니다. 인물과 일화는 게임을 위한 창작입니다.</p>';
}
function getState(){return JSON.parse(JSON.stringify(state))}
function init(){
 makeBubble();
 const css=document.createElement('link');css.rel='stylesheet';css.href='/history-v7-narrative.css';document.head.append(css);
 if(window.MB_V7?.snapshot?.()?.scene==='museum'&&!state.visited.museum){
  state.visited.museum=true;persist();bubble('기록관','역사를 기억한다는 건 이름을 외우는 일만은 아닙니다. 문 너머에서 누가 살았는지 찾아보세요.');
 }
}
window.MB_V7_STORY={populate,enter,beforePrint,printed,delivered,deliveryText,aftermath,finalise,objective,journal,bubble,state:getState};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();