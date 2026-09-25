// 楽譜データ（Claude 管理。Antigravity は音符を変更しないこと）
// 出典：Mutopia Project「Paganini 24 Caprices: Caprice No. 24」LilyPond ソース（パブリックドメイン）
//       https://www.mutopiaproject.org/ftp/PaganiniN/O1/Caprice_24/Caprice_24.ly
// 変換：LilyPond の相対音高記法を Claude がプログラムで絶対音高に変換（2026-09-23）
// 形式：note = 音名（Tone.js 表記、"R" は休符）、dur = 音価（Tone.js 表記："4n"=4分, "8n"=8分, "16n"=16分）
// 拍子 2/4、イ短調、速度記号 quasi Presto（ほぼ急速に）
window.PG = window.PG || {};

(function () {
  // 主題 前半（第1〜4小節）。原曲ではくり返し記号つき
  const THEME_A = [
    // 第1小節
    { note: 'A4', dur: '8n' }, { note: 'R', dur: '16n' }, { note: 'A4', dur: '16n' },
    { note: 'A4', dur: '16n' }, { note: 'C5', dur: '16n' }, { note: 'B4', dur: '16n' }, { note: 'A4', dur: '16n' },
    // 第2小節
    { note: 'E5', dur: '8n' }, { note: 'R', dur: '16n' }, { note: 'E4', dur: '16n' },
    { note: 'E4', dur: '16n' }, { note: 'G#4', dur: '16n' }, { note: 'F#4', dur: '16n' }, { note: 'E4', dur: '16n' },
    // 第3小節
    { note: 'A4', dur: '8n' }, { note: 'R', dur: '16n' }, { note: 'A4', dur: '16n' },
    { note: 'A4', dur: '16n' }, { note: 'C5', dur: '16n' }, { note: 'B4', dur: '16n' }, { note: 'A4', dur: '16n' },
    // 第4小節
    { note: 'E5', dur: '4n' }, { note: 'E4', dur: '8n' }, { note: 'R', dur: '8n' }
  ];

  // 主題 後半（第5〜12小節）
  const THEME_B = [
    // 第5小節
    { note: 'A5', dur: '8n' }, { note: 'R', dur: '16n' }, { note: 'A5', dur: '16n' },
    { note: 'A5', dur: '16n' }, { note: 'Bb5', dur: '16n' }, { note: 'A5', dur: '16n' }, { note: 'G5', dur: '16n' },
    // 第6小節
    { note: 'F5', dur: '8n' }, { note: 'R', dur: '16n' }, { note: 'D5', dur: '16n' },
    { note: 'D5', dur: '16n' }, { note: 'F5', dur: '16n' }, { note: 'E5', dur: '16n' }, { note: 'D5', dur: '16n' },
    // 第7小節
    { note: 'G5', dur: '8n' }, { note: 'R', dur: '16n' }, { note: 'G5', dur: '16n' },
    { note: 'G5', dur: '16n' }, { note: 'A5', dur: '16n' }, { note: 'G5', dur: '16n' }, { note: 'F5', dur: '16n' },
    // 第8小節
    { note: 'E5', dur: '8n' }, { note: 'R', dur: '16n' }, { note: 'C5', dur: '16n' },
    { note: 'C5', dur: '16n' }, { note: 'E5', dur: '16n' }, { note: 'D5', dur: '16n' }, { note: 'C5', dur: '16n' },
    // 第9小節
    { note: 'F5', dur: '8n' }, { note: 'R', dur: '16n' }, { note: 'B4', dur: '16n' },
    { note: 'B4', dur: '16n' }, { note: 'D5', dur: '16n' }, { note: 'C5', dur: '16n' }, { note: 'B4', dur: '16n' },
    // 第10小節
    { note: 'E5', dur: '8n' }, { note: 'R', dur: '16n' }, { note: 'A4', dur: '16n' },
    { note: 'A4', dur: '16n' }, { note: 'C5', dur: '16n' }, { note: 'B4', dur: '16n' }, { note: 'A4', dur: '16n' },
    // 第11小節
    { note: 'F4', dur: '8n' }, { note: 'R', dur: '16n' }, { note: 'D#5', dur: '16n' },
    { note: 'E4', dur: '16n' }, { note: 'E5', dur: '16n' }, { note: 'D5', dur: '16n' }, { note: 'B4', dur: '16n' },
    // 第12小節
    { note: 'A4', dur: '4n' }, { note: 'A3', dur: '8n' }, { note: 'R', dur: '8n' }
  ];

  // ───────── S6「超絶技巧 体験ラボ」用の短い例（Claude 作成の説明用フレーズ。特定の曲の引用ではない）─────────
  // 追加の書式：note に配列を入れると和音（同時に鳴らす）。tech = 'arco'（弓・既定）/'pizz'（はじく）/'harm'（ハーモニクス）
  // string = 鳴らす弦（'G','D','A','E'）…画面の弦を振動させるための情報。node = ハーモニクスで指を触れる位置（弦長の比）

  // 重音：3度の連続（2本の弦を同時に弾く）
  const LAB_DOUBLE_STOPS = [
    { note: ['A4', 'C5'], dur: '8n', string: ['D', 'A'] },
    { note: ['B4', 'D5'], dur: '8n', string: ['D', 'A'] },
    { note: ['C5', 'E5'], dur: '8n', string: ['A', 'E'] },
    { note: ['D5', 'F5'], dur: '8n', string: ['A', 'E'] },
    { note: ['E5', 'G#5'], dur: '8n', string: ['A', 'E'] },
    { note: ['C5', 'E5'], dur: '8n', string: ['A', 'E'] },
    { note: ['B4', 'D5'], dur: '8n', string: ['D', 'A'] },
    { note: ['A4', 'E5'], dur: '4n', string: ['A', 'E'] }
  ];

  // ハーモニクス：A線（A4）の自然倍音。弦長の 1/2 で A5、1/3 で E6、1/4 で A6（物理的に正しい組合せ）
  const LAB_HARMONICS = [
    { note: 'A5', dur: '4n', tech: 'harm', string: 'A', node: 1 / 2 },
    { note: 'E6', dur: '4n', tech: 'harm', string: 'A', node: 1 / 3 },
    { note: 'A6', dur: '4n', tech: 'harm', string: 'A', node: 1 / 4 },
    { note: 'E6', dur: '8n', tech: 'harm', string: 'A', node: 1 / 3 },
    { note: 'A5', dur: '4n', tech: 'harm', string: 'A', node: 1 / 2 }
  ];

  // 左手ピチカート：弓で弾く音（arco）の合間に、左手ではじく音（pizz）を混ぜる
  const LAB_LEFT_PIZZ = [
    { note: 'A4', dur: '8n', string: 'A' },
    { note: 'A5', dur: '16n', tech: 'pizz', string: 'E' }, { note: 'G5', dur: '16n', tech: 'pizz', string: 'E' },
    { note: 'B4', dur: '8n', string: 'A' },
    { note: 'F5', dur: '16n', tech: 'pizz', string: 'E' }, { note: 'E5', dur: '16n', tech: 'pizz', string: 'E' },
    { note: 'C5', dur: '8n', string: 'A' },
    { note: 'E5', dur: '16n', tech: 'pizz', string: 'E' }, { note: 'D5', dur: '16n', tech: 'pizz', string: 'A' },
    { note: 'A4', dur: '4n', string: 'A' }
  ];

  // G線1本：いちばん低い G線だけで2オクターブを駆け上がる（G3→G5）
  const LAB_G_STRING = ['G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F#5']
    .map(n => ({ note: n, dur: '16n', string: 'G' }))
    .concat([{ note: 'G5', dur: '2n', string: 'G' }]);

  // ───────── S11「旋律を逆さにすると…」用（Claude 作成）─────────
  // 主題の頭の5音（第1小節の後半〜第2小節の頭：A4 C5 B4 A4 | E5）
  const S11_HEAD = [
    { note: 'A4', dur: '16n' }, { note: 'C5', dur: '16n' }, { note: 'B4', dur: '16n' }, { note: 'A4', dur: '16n' }, { note: 'E5', dur: '8n' }
  ];
  // 上下反転（A4 を軸に音程を鏡写し：+3→−3、+2→−2、+7→−7）
  const S11_INVERTED = [
    { note: 'A4', dur: '16n' }, { note: 'F#4', dur: '16n' }, { note: 'G4', dur: '16n' }, { note: 'A4', dur: '16n' }, { note: 'D4', dur: '8n' }
  ];
  // ラフマニノフ第18変奏の形（反転を半音下げて変ニ長調に、ゆっくり。リズムは説明用に単純化）
  // 根拠：Wikipedia「the A minor Paganini theme is literally played 'upside down' in D♭ major」＋ 1934年録音の音高解析（6.6〜7.7秒付近に A♭ F G♭ … D♭）
  const S11_RACH = [
    { note: 'Ab4', dur: '4n' }, { note: 'F4', dur: '8n' }, { note: 'Gb4', dur: '8n' }, { note: 'Ab4', dur: '4n' }, { note: 'Db4', dur: '2n' }
  ];

  PG.melodies = {
    // 標準のテンポ（4分音符/分）。演奏速度の調整はここではなく playMelody の bpm で行う
    DEFAULT_BPM: 116,
    caprice24ThemeA: THEME_A,
    caprice24ThemeB: THEME_B,
    // 主題全体（前半くり返し＋後半）
    caprice24Theme: THEME_A.concat(THEME_A, THEME_B),
    // S6 体験ラボ
    labDoubleStops: LAB_DOUBLE_STOPS,
    labHarmonics: LAB_HARMONICS,
    labLeftPizz: LAB_LEFT_PIZZ,
    labGString: LAB_G_STRING,
    // S11（原型・反転は bpm 116、ラフマニノフ形は bpm 60 で演奏）
    s11Head: S11_HEAD,
    s11Inverted: S11_INVERTED,
    s11Rach: S11_RACH,
    // 弦の開放弦の音（画面の弦の並び順：左から G, D, A, E）
    OPEN_STRINGS: { G: 'G3', D: 'D4', A: 'A4', E: 'E5' }
  };
})();
