const hits = {};
const THRESHOLD = 20; // token requests per minute threshold

function recordAndCheck(key){
  const now = Date.now();
  if(!hits[key]) hits[key] = [];
  hits[key] = hits[key].filter(t => now - t < 60_000);
  hits[key].push(now);
  if(hits[key].length > THRESHOLD) return true;
  return false;
}

module.exports = { recordAndCheck };