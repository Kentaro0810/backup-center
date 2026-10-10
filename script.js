const FORMAT_ID="kentaro-tools-backup";
const FORMAT_VERSION=1;
const KNOWN_KEYS={
  "secret-links-favorites-v1":["⭐","リンク集のお気に入り"],
  "secret-links-recent-v1":["🕘","リンク集の最近使った履歴"],
  "countdown-manager-data-v1":["📅","カウントダウン管理"],
  "flashcard-app-data-v1":["📚","暗記カード"],
  "study-time-tracker-data-v1":["📊","学習時間記録"],
  "study-time-tracker-goal-v1":["🎯","学習時間記録の目標"],
  "packing-checklist-data-v1":["🎒","持ち物チェックリスト"],
  "packing-checklist-active":["🎒","持ち物チェックリストの選択状態"],
  "habit-tracker-data-v1":["🌱","習慣トラッカー"]
};
const $=id=>document.getElementById(id);
let pendingBackup=null;
function allEntries(){return Object.keys(localStorage).sort().map(key=>({key,value:localStorage.getItem(key)??"",known:KNOWN_KEYS[key]||null}))}
function bytes(text){return new Blob([text]).size}
function sizeLabel(value){return value<1024?`${value} B`:`${(value/1024).toFixed(1)} KB`}
function showStatus(message,error=false){$("statusMessage").textContent=message;$("statusMessage").style.color=error?"#fca5a5":"#86efac"}
function render(){const entries=allEntries(),known=entries.filter(e=>e.known);$("keyCount").textContent=`${entries.length}件`;$("toolCount").textContent=`${new Set(known.map(e=>e.known[1].replace(/の.*$/,""))).size}個`;$("dataSize").textContent=sizeLabel(entries.reduce((n,e)=>n+bytes(e.key)+bytes(e.value),0));$("dataList").replaceChildren(...entries.map(e=>{const row=document.createElement("div");row.className="data-item";const icon=document.createElement("span");icon.textContent=e.known?.[0]||"🗂️";const info=document.createElement("div");const title=document.createElement("strong");title.textContent=e.known?.[1]||"未分類データ";const key=document.createElement("small");key.textContent=e.key;info.append(title,key);const size=document.createElement("em");size.textContent=sizeLabel(bytes(e.value));row.append(icon,info,size);return row}));if(!entries.length){const p=document.createElement("p");p.textContent="保存されているlocalStorageデータはありません。";$("dataList").append(p)}}
function selectedEntries(){return allEntries().filter(e=>{if(!$("includePortal").checked&&e.key.startsWith("secret-links-"))return false;if(!$("includeUnknown").checked&&!e.known)return false;return true})}
function download(content,name){const blob=new Blob([content],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;a.click();URL.revokeObjectURL(url)}
function exportBackup(){const entries=selectedEntries();if(!entries.length)return showStatus("書き出すデータがありません。",true);const data=Object.fromEntries(entries.map(e=>[e.key,e.value]));const payload={format:FORMAT_ID,formatVersion:FORMAT_VERSION,createdAt:new Date().toISOString(),origin:location.origin,itemCount:entries.length,data};download(JSON.stringify(payload,null,2),`kentaro-tools-backup-${new Date().toISOString().slice(0,10)}.json`);showStatus(`${entries.length}件のデータを書き出しました。`)}
async function previewFile(event){const file=event.target.files[0];if(!file)return;try{const parsed=JSON.parse(await file.text());if(parsed?.format!==FORMAT_ID||parsed?.formatVersion!==FORMAT_VERSION||!parsed.data||typeof parsed.data!=="object"||Array.isArray(parsed.data))throw new Error("invalid");const pairs=Object.entries(parsed.data);if(!pairs.every(([k,v])=>typeof k==="string"&&typeof v==="string"))throw new Error("invalid");pendingBackup=parsed;$("previewDetails").innerHTML="";const p=document.createElement("p");p.textContent=`作成日時：${new Date(parsed.createdAt).toLocaleString("ja-JP")} ／ データ：${pairs.length}件 ／ 容量：${sizeLabel(bytes(JSON.stringify(parsed)))}`;$("previewDetails").append(p);$("previewPanel").classList.remove("hidden");showStatus("バックアップを確認しました。復元方法を選んでください。")}catch{pendingBackup=null;$("previewPanel").classList.add("hidden");showStatus("対応するバックアップファイルではありません。",true)}finally{$("importInput").value=""}}
function restore(){if(!pendingBackup)return;const mode=document.querySelector('input[name="restoreMode"]:checked').value;const count=Object.keys(pendingBackup.data).length;const warning=mode==="replace"?"現在のlocalStorageをすべて消して置き換えます。":"同じキーは上書きし、その他のデータは残します。";if(!confirm(`${count}件を復元します。\n${warning}\n続けますか？`))return;if(mode==="replace")localStorage.clear();Object.entries(pendingBackup.data).forEach(([key,value])=>localStorage.setItem(key,value));pendingBackup=null;$("previewPanel").classList.add("hidden");render();showStatus(`${count}件のデータを復元しました。各ツールを再読み込みしてください。`)}
function clearAll(){const count=localStorage.length;if(!count)return showStatus("削除するデータがありません。",true);if(!confirm(`localStorageの${count}件をすべて削除します。\nこの操作は元に戻せません。`))return;localStorage.clear();render();showStatus("localStorageをすべて削除しました。")}
$("exportButton").addEventListener("click",exportBackup);$("importInput").addEventListener("change",previewFile);$("restoreButton").addEventListener("click",restore);$("clearAllButton").addEventListener("click",clearAll);render();
