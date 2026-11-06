let alarmAktif = false;
let alarmCtx, alarmOsc, sirenTimer, ucapTimer;

function mulaiAlarmSuara() {
  if (alarmAktif) return; // biar tidak dobel
  alarmAktif = true;

  alarmCtx = new (window.AudioContext || window.webkitAudioContext)();
  alarmOsc = alarmCtx.createOscillator();
  const gain = alarmCtx.createGain();
  alarmOsc.type = "sawtooth";
  gain.gain.value = 0.25;
  alarmOsc.connect(gain).connect(alarmCtx.destination);
  alarmOsc.start();

  let naik = true;
  sirenTimer = setInterval(() => {
    alarmOsc.frequency.value = naik ? 900 : 600;
    naik = !naik;
  }, 400);

  const ucapkan = () => {
    const u = new SpeechSynthesisUtterance("Darurat! Ada penyusup!");
    u.lang = "id-ID";
    speechSynthesis.speak(u);
  };
  ucapkan();
  ucapTimer = setInterval(ucapkan, 4000);
}

function hentikanAlarmSuara() {
  if (!alarmAktif) return;
  alarmAktif = false;
  alarmOsc.stop();
  alarmCtx.close();
  clearInterval(sirenTimer);
  clearInterval(ucapTimer);
  speechSynthesis.cancel();
}