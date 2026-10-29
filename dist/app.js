const $ = (s) => document.querySelector(s);
let scenario = 'ready';
let stage = 0;
let tick = 0;
let events = [];
let replayCount = 0;

function renderInventory() {
  const finished = stage === 4;
  const pending = stage === 3;
  const items = finished
    ? [{ name: '木箱', id: '#crate-001', type: 'output', state: '已产出' }, { name: '小锤', id: '#hammer-a', type: 'tool', state: '可继续使用' }]
    : [{ name: '木板', id: '#wood-a', type: '', state: pending ? '进行中占用' : '我持有' }, { name: '木板', id: '#wood-b', type: '', state: pending ? '进行中占用' : scenario === 'missing' ? '没有这件物品' : scenario === 'conflict' && stage >= 2 ? '已被别人使用' : '我持有' }, { name: '小锤', id: '#hammer-a', type: 'tool', state: pending ? '进行中占用' : '我有使用许可' }];
  $('#inventory-items').innerHTML = items.map((x, i) => `<div class="item-token ${x.type} ${i === 1 && !finished && (scenario === 'missing' || scenario === 'conflict' && stage >= 2) ? 'unavailable' : ''} ${pending ? 'locked' : ''}"><strong>${x.name}</strong><small>${x.id}</small><span class="item-state">${x.state}</span></div>`).join('');
}

function feedback(title, body, style = '') {
  $('#demo-feedback').className = `demo-feedback ${style}`;
  $('#demo-feedback').innerHTML = `<strong>${title}</strong><span>${body}</span>`;
}

function renderDemo() {
  renderInventory();
  document.querySelectorAll('[data-scenario]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.scenario === scenario)));
  document.querySelectorAll('[data-step]').forEach((el, i) => {
    const active = stage === 0 ? 0 : stage === 1 || stage === 2 ? 1 : stage === 3 ? 2 : 3;
    el.classList.toggle('active', i === active);
    el.classList.toggle('complete', i < active || stage === 4);
  });
  const button = $('#demo-action');
  button.disabled = false;
  if (stage === 0) {
    feedback('先找到“能做什么”。', 'Agent 从工坊的规则索引里，寻找能把现有材料做成木箱的配方。');
    button.textContent = '查找可用配方';
  } else if (stage === 1) {
    feedback('找到配方，接下来交给执行器检查。', '示意配方需要两块木板、可用小锤和 2 个时间单位。查到配方，还不代表当前条件一定满足。');
    button.textContent = '提交这次操作';
  } else if (stage === 2) {
    feedback(scenario === 'missing' ? '没有足够的材料，操作被完整拒绝。' : '状态变了，不能使用已被占用的物品。', scenario === 'missing' ? '缺少 #wood-b。已有木板和小锤仍可用，没有扣掉一半材料，也没有产生木箱。' : 'Agent 查询后，#wood-b 已被另一次有效操作使用。执行器重新检查并拒绝本次操作；本次没有消耗剩余材料。', 'error');
    button.textContent = '重新查看这一情境';
  } else if (stage === 3) {
    feedback(`条件通过，加工进行中：${tick} / 2。`, '本次材料与设备已占用，不能被重复投入。世界钟到约定时刻，再结算实际产物。');
    button.textContent = '推进 1 个时间单位';
  } else {
    feedback(replayCount ? '返回原来的回执，木箱仍然只有一只。' : '加工完成，木箱成为世界里的实际产物。', replayCount ? `同一请求已重复提交 ${replayCount} 次。系统识别原操作，不再扣材料，也不再生成新物品。` : '两块木板按配方结算，小锤重新可用。新木箱 #crate-001 和这次变化一起记入账本。', 'success');
    button.textContent = '重复提交同一请求';
  }
  $('#tick-indicator').textContent = `世界时间：${tick}`;
  $('#demo-log').textContent = events.length ? events.join('\n') : '还没有提交世界操作。\n查询规则本身，不会生成木箱。';
}

function resetDemo() { stage = 0; tick = 0; replayCount = 0; events = []; renderDemo(); }
document.querySelectorAll('[data-scenario]').forEach((b) => b.addEventListener('click', () => { scenario = b.dataset.scenario; resetDemo(); }));
$('#demo-reset').addEventListener('click', resetDemo);
$('#demo-action').addEventListener('click', () => {
  if (stage === 0) { stage = 1; events.push('查询结果：找到工坊的示意组装规则。'); }
  else if (stage === 1) {
    if (scenario === 'ready') { stage = 3; events.push('请求 make-box-001：条件通过。', '时间 0：#wood-a、#wood-b、#hammer-a 进入本次占用。'); }
    else { stage = 2; events.push(scenario === 'missing' ? '请求被拒绝：材料 #wood-b 不存在。' : '执行前复查：#wood-b 已被另一操作使用。', '本次提交：没有扣除其他材料，没有生成产物。'); }
  } else if (stage === 2) { resetDemo(); return; }
  else if (stage === 3) {
    tick += 1;
    events.push(`世界钟推进至 ${tick}。`);
    if (tick === 2) { stage = 4; events.push('结算：两块木板按配方消耗；小锤解除占用。', '产出：#crate-001，由本次请求的玩家持有。', '保存回执：receipt-make-box-001。'); }
  } else { replayCount += 1; events.push('重复请求 make-box-001：返回 receipt-make-box-001，无新增产出。'); }
  renderDemo();
});

const routes = {
  forest: '你在<strong>林地</strong>。这里可以取得原料。<br>前往其他地点的条件，由路线规则声明。',
  workshop: '林地 → 工坊<br><strong>示例：2 个时间单位，消耗 1 份体力。</strong>',
  market: '林地 → 工坊 → 集市<br><strong>示例：合计 5 个时间单位，消耗 2 份体力。</strong>'
};
document.querySelectorAll('[data-place]').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('[data-place]').forEach((el) => { const active = el === b; el.classList.toggle('selected', active); el.setAttribute('aria-pressed', String(active)); });
  $('#route-result').innerHTML = routes[b.dataset.place];
}));
$('#route-result').innerHTML = routes.forest;

let winner = null;
let raceReplays = 0;
function winRace(side) {
  if (winner) return;
  winner = side;
  const who = side === 'a' ? '玩家 A' : '智能体居民 B';
  const other = side === 'a' ? '居民 B' : '玩家 A';
  $('#stock-owner').textContent = `当前持有者：${who}`;
  $('#race-result').textContent = `${who} 先提交并通过，付款与木板转移一起完成。${other} 的旧库存信息已过时，后续请求被拒绝，不扣支付物。双方看到同一个库存结果。`;
  $('#race-a').disabled = true;
  $('#race-b').disabled = true;
  $('#race-repeat').disabled = false;
}
$('#race-a').addEventListener('click', () => winRace('a'));
$('#race-b').addEventListener('click', () => winRace('b'));
$('#race-repeat').addEventListener('click', () => {
  raceReplays += 1;
  $('#race-result').textContent = `同一购买请求已重复提交 ${raceReplays} 次：返回已保存的购买回执。木板仍只有一块，支付物不再扣除。当前持有者仍是${winner === 'a' ? '玩家 A' : '智能体居民 B'}。`;
});
$('#race-reset').addEventListener('click', () => {
  winner = null; raceReplays = 0;
  $('#stock-owner').textContent = '当前持有者：商店';
  $('#race-result').textContent = '选一方先提交，看看另一方会得到什么结果。';
  $('#race-a').disabled = false; $('#race-b').disabled = false; $('#race-repeat').disabled = true;
});
renderDemo();
