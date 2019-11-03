function $(a){return document.getElementById(a)}function AJAX(b,c,d,e,f,a){a=window.XMLHttpRequest?new XMLHttpRequest:new ActiveXObject('Microsoft.XMLHTTP');a.onreadystatechange=function(){c(a)};a.open(d||'GET',b,e||!0);a.send(f)}function AJAX2(b,c,d,e,f,a){a=window.XMLHttpRequest?new XMLHttpRequest:new ActiveXObject('Microsoft.XMLHTTP');a.onreadystatechange=function(){c(a)};a.open(d||'GET',b,e||!0);a.setRequestHeader('Content-type','application/x-www-form-urlencoded');a.send(f)}function newUUID(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,newUUID)}

// 'main', 'list', 'entry-new', 'entry-step', 'entry-step-start', 'clock'
const HASHES = {
	'utama': 'main',
	'daftar-proyek': 'showList',
	'proyek': 'openEntry',
	'entri-baru': 'createEntry',
	'hari-ke-1': 'day1',
	'hari-ke-2': 'day2',
	'hari-ke-3': 'day3',
	'hari-ke-4': 'day4',
	'hari-ke-5': 'day5',
	_: 0
};

var data = JSON.parse(localStorage.getItem('data')) || {entries: []};
var lastSync = localStorage.getItem('lastSync') || Date.now();
function sync() {
	data.entries.sort(function(a, b) {
		let A = a.datetime.join('');
		let B = b.datetime.join('');
		if (A < B) return -1;
		if (A > B) return 1;
		return 0;
	});
	let time = localStorage.getItem('lastSync');
	if (time < Date.now())
		localStorage.setItem('data', JSON.stringify(data));
	else
		data = JSON.parse(localStorage.getItem('data'));
	localStorage.setItem('lastSync', Date.now());
}
window.addEventListener('load', function() {
	let textInputs = document.getElementsByClassName('t-label-text t-js');
	for (let i = 0; i < textInputs.length; i ++) {
		let input = textInputs[i].getElementsByTagName('input')[0];
		if (input.value.trim() != '')
			input.parentElement.classList.add('t-label-text-active');
		input.addEventListener('focus', function() {
			this.parentElement.classList.add('t-label-text-active');
		});
		input.addEventListener('blur', function() {
			if (this.value.trim() == '')
				this.parentElement.classList.remove('t-label-text-active');
		});
	}
	let dateInputs = document.getElementsByClassName('t-label-date t-js');
	for (let i = 0; i < dateInputs.length; i ++) {
		let input = dateInputs[i].getElementsByTagName('input')[0];
		input.addEventListener('focus', function() {
			this.parentElement.classList.add('t-label-date-active');
		});
		input.addEventListener('blur', function() {
			this.parentElement.classList.remove('t-label-date-active');
		});
	}
	$('b-check').addEventListener('click', function() {
		history.pushState({view: 'list', fn: 'showList'}, '', '#daftar-proyek');
		showList();
	});
	$('b-create').addEventListener('click', function() {
		history.pushState({view: 'entry-new', fn: 'createEntry'}, '', '#entri-baru');
		createEntry();
	});
	$('back-list').addEventListener('click', popView);
	$('new-entry').addEventListener('click', function() {
		history.pushState({view: 'entry-new', fn: 'createEntry'}, '', '#entri-baru');
		createEntry();
	});
	$('back-entry-new').addEventListener('click', popView);
	$('add-entry').addEventListener('click', function() {
		$('project-title').parentElement.classList.remove('input-invalid');
		$('project-date').parentElement.classList.remove('input-invalid');
		$('project-time').parentElement.classList.remove('input-invalid');
		let valid = true;
		if ($('project-title').value.trim().length == 0) {
			$('project-title').parentElement.classList.add('input-invalid');
			valid = false;
		}
		if ($('project-date').value.trim().length == 0) {
			$('project-date').parentElement.classList.add('input-invalid');
			valid = false;
		}
		if ($('project-time').value.trim().length == 0) {
			$('project-time').parentElement.classList.add('input-invalid');
			valid = false;
		}
		if (!valid) return;
		let dt = $('project-date').value + ' ' + $('project-time').value;
		dt = dt.split(/[^0-9]+/);
		data.entries.push({
			ID: newUUID(),
			title: $('project-title').value,
			datetime: dt,
			steps: [0, 0, 0, 0, 0]
		});
		$('project-title').value = '';
		$('project-date').value = '';
		$('project-time').value = '';
		popView();
	});
	$('back-entry-step').addEventListener('click', popView);
	for (let i = 1; i <= 5; i ++) {
		$('day' + i).addEventListener('click', new Function('day' + i + '()'));
	}
	$('back-entry-step-start').addEventListener('click', popView);
	$('b-start-clock').addEventListener('click', startClock);
	$('back-clock').addEventListener('click', function() {
		if (confirm("Sudahi hari ini?")) {
			data.entries[activeEntryIndex].steps[activeDay] = 1;
		}
		popView();
	});
	timerCanvas = $('main-timer');
	timerCanvas.addEventListener('click', function() {

	});
	let hash = document.location.hash.substr(1).split('~');
	if (HASHES.hasOwnProperty(hash[0]))
		(new Function(HASHES[hash[0]] + '("' + hash[1] + '")'))();
	else
		main();
	if (document.location.hash == '')
		history.replaceState({view: 'main', fn: 'main'}, '', '#main');
});

function hideAll() {
	let views = document.getElementsByClassName('t-layout-content');
	for (let i = 0; i < views.length; i ++)
		views[i].style.display = '';
	views = document.getElementsByClassName('t-layout-header');
	for (let i = 0; i < views.length; i ++)
		views[i].style.display = '';
}

function popView() {
	history.back();
}
window.addEventListener('popstate', function(ev) {
	if (ev.state.fn !== undefined)
		(new Function(ev.state.fn + '()'))();
	else
		main();
});

function main() {
	sync();
	hideAll();
	$('header-main').style.display = 'flex';
	$('content-main').style.display = 'block';
	updateCalendar();
}

const YEAR = (new Date()).getFullYear();
const MONTH = (new Date()).getMonth();
const MONTHS = [
	['Januari',   31],
	['Februari',  YEAR % 4 == 0 ? 29 : 28],
	['Maret',     31],
	['April',     30],
	['Mei',       31],
	['Juni',      30],
	['Juli',      31],
	['Agustus',   31],
	['September', 30],
	['Oktober',   31],
	['November',  30],
	['Desember',  31]
];
function updateCalendar() {
	let calHTML = '<table><thead><tr><th colspan="7">' + MONTHS[MONTH][0] + ' ' + YEAR + '</thead><tbody><tr><th>M<th>S<th>S<th>R<th>K<th>J<th>S';
	let startDay = (new Date(YEAR, MONTH, 1)).getDay();
	for (let i = 1, j = 0; i < MONTHS[MONTH][1]; j ++) {
		if (j % 7 == 0) calHTML += '<tr>';
		if (j < startDay) calHTML += '<td>';
		else {
			if (i == new Date().getDate())
				calHTML += '<td class="date-active">' + (i ++);
			else calHTML += '<td>' + (i ++);
		}
	}
	calHTML += '</tbody></table>';
	$('content-calendar').innerHTML = calHTML;
}

function showList() {
	sync();
	hideAll();
	$('header-list').style.display = 'flex';
	$('content-list').style.display = 'block';
	$('content-list').innerHTML = '';
	if (data.entries.length == 0) {
		$('content-list').innerHTML = '<div class="t-entry-meta">(Tidak ada proyek.)</div>';
	}
	for (let i = 0; i < data.entries.length; i ++) {
		let entry = data.entries[i];
		let divMeta = document.createElement('div');
		divMeta.className = 't-entry-meta';
		let dt = entry.datetime;
		let dateStr = dt[2] + ' ' + MONTHS[dt[1] - 1][0] + ' ' + dt[0];
		let dateTS = (new Date(dt[0], dt[1] - 1, dt[2])).getTime();
		let _5days = 5 * 24 * 60 * 60 * 1000;
		if (Date.now() > dateTS + _5days)
			divMeta.innerText = 'Sudah berlalu';
		else if (Date.now() >= dateTS && Date.now() <= dateTS + _5days)
			divMeta.innerText = 'Sedang berlangsung';
		else
			divMeta.innerText = dateStr;
		let btn = document.createElement('button');
		btn.className = 't-list-entry';
		btn.innerHTML = '<div class="t-entry-info"><div class="t-entry-title">' + entry.title + '</div></div>';
		btn.addEventListener('click', new Function(
			'history.pushState({view:"entry-step",fn:"openEntry"},"","#proyek~' + entry.ID + '");' + 'openEntry("' + entry.ID + '")'
		));
		$('content-list').appendChild(divMeta);
		$('content-list').appendChild(btn);
	}
}

function createEntry() {
	hideAll();
	$('header-entry-new').style.display = 'flex';
	$('content-entry-new').style.display = 'block';
}

function switchToMain() {
	history.replaceState({view: 'main', fn: 'main'}, '', '#utama');
	main();
}

var activeEntryIndex;
function loadEntry(ID) {
	let found = false;
	for (let i = 0; i < data.entries.length; i ++) {
		if (data.entries[i].ID == ID) {
			activeEntryIndex = i;
			found = true;
			break;
		}
	}
	return found;
}

function openEntry(ID) {
	if (ID == undefined) ID = data.entries[activeEntryIndex].ID;
	if (!loadEntry(ID)) { switchToMain(); return; }
	hideAll();
	$('header-entry-step').style.display = 'flex';
	$('content-entry-step').style.display = 'block';
	$('entry-step-title').innerText = data.entries[activeEntryIndex].title;
	let dt = data.entries[activeEntryIndex].datetime;
	let dateStr = dt[2] + ' ' + MONTHS[dt[1] - 1][0] + ' ' + dt[0];
	$('entry-desc').innerText = 'Proyek dimulai tanggal ' + dateStr + '.';
}

const DAYS = [
	"Hari Pertama",
	"Hari Kedua",
	"Hari Ketiga",
	"Hari Keempat",
	"Hari Kelima"
];
var activeDay;
function day(k) {
	activeDay = k - 1;
	hideAll();
	$('header-entry-step-start').style.display = 'flex';
	$('content-entry-step-start').style.display = 'block';
	$('entry-step-start-subtitle').innerText = data.entries[activeEntryIndex].title;
	$('entry-step-start-title').innerText = DAYS[activeDay];
	$('clock-subtitle').innerText = data.entries[activeEntryIndex].title;
	$('clock-title').innerText = DAYS[activeDay];
}

function dayN(n, ID) {
	if (ID == undefined) ID = acdata.entries[activeEntryIndex].ID;
	if (!loadEntry(ID)) { switchToMain(); return; }
	history.pushState({view: 'entry-step-start', fn: 'day' + n}, '',
			'#hari-ke-' + n + '~' + ID);
	day(n);
}
function day1(ID) { dayN(1, ID); }
function day2(ID) { dayN(2, ID); }
function day3(ID) { dayN(3, ID); }
function day4(ID) { dayN(4, ID); }
function day5(ID) { dayN(5, ID); }

var timerStartTime, timerCanvasCtx, timerInterval;
var timerTime, numOfCycle;
var timerCanvas;
const t1 = 25 * 60 * 1000;
const t2 = 5 * 60 * 1000;
const timerS = 256;
function startClock() {
	hideAll();
	$('header-clock').style.display = 'flex';
	$('content-clock').style.display = 'block';
	numOfCycle = 0;
	timerTime = t1;
	startTimer();
}

function startTimer() {
	timerCanvas.width = timerS;
	timerCanvas.height = timerS;
	timerCanvasCtx = timerCanvas.getContext('2d');
	timerStartTime = Date.now();
	timerInterval = setInterval(function() {
		let duration = Date.now() - timerStartTime;
		let remaining = timerTime - duration;
		if (remaining < 0) remaining = 0;
		let angle = -Math.PI / 2 + 2 * Math.PI * remaining / timerTime;
		remaining = Math.ceil(remaining / 1000);
		let second = remaining % 60;
		let minute = Math.floor(remaining / 60);
		if (second < 10) second = '0' + second;
		if (minute < 10) minute = '0' + minute;
		timerCanvasCtx.clearRect(0, 0, timerS, timerS);
		timerCanvasCtx.lineWidth = 16;
		timerCanvasCtx.strokeStyle = 'rgba(0,0,0,0.3)';
		timerCanvasCtx.beginPath();
		timerCanvasCtx.arc(timerS / 2, timerS / 2, timerS / 2 - 16, 0, 2 * Math.PI);
		timerCanvasCtx.stroke();
		timerCanvasCtx.strokeStyle = '#00796b';
		timerCanvasCtx.beginPath();
		timerCanvasCtx.arc(timerS / 2, timerS / 2, timerS / 2 - 16, -Math.PI / 2, angle);
		timerCanvasCtx.stroke();
		timerCanvasCtx.font = '48px Roboto';
		timerCanvasCtx.textAlign = 'center';
		timerCanvasCtx.textBaseline = 'middle';
		timerCanvasCtx.fillText(minute + '.' + second, timerS / 2, timerS / 2);
	}, 1);
}
