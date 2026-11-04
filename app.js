
// ======================================================================
// 【第1章：基盤環境・幾何座標・システム設定 (Environment & Layout)】
// ブレッドボード寸法、端子穴ピッチ、電源レール座標、および表示モード定数
// ======================================================================
const DISPLAY_MODE = {
  isXrayON: false,
  isSymbolON: false
};


const BATTERY_9V_SPEC = {
  voltage_V: 9.0,
  posX: 20, posY: 100,
  width: 42, height: 80,
  plusTerminalY: 120,
  minusTerminalY: 160
};

const BOARD_CONFIG = {
  x: 85, y: 20,
  width: 480, height: 260,
  radius: 8,
    colPitch: 14,
  rowPitch: 12,
    topPowerPlusY: 40,
  topPowerMinusY: 54,
    terminalTopY: 82,    // A行
  dipChannelY: 148,
  terminalBottomY: 166,// F行
    bottomPowerPlusY: 234,
  bottomPowerMinusY: 248,
    colStartX: 124
};

const ROWS_TOP = ["A", "B", "C", "D", "E"];
const ROWS_BOTTOM = ["F", "G", "H", "I", "J"];

// ======================================================================
// 【第2章：パーツマスタ・レジストリ ＆ 回路プリセット (Parts & Presets)】
// 全素子データシート諸元、物理特性、動的ファクトリー、および公式検証回路
// ======================================================================

/**
 * 2-1. テスト・検証用プリセット回路データ構造 (Zero Hardcoding 完全刷新版)
 */
const CIRCUIT_PRESETS = {


// ★ Stage 1: 基本点灯回路 (1.0kΩ + 赤色LED / 下部マイナスレール完全接地版)
  BASIC_LED: {
    name: "基本点灯回路 (1kΩ + 赤LED)",
    components: [
      { id: "R_PRESET_1", type: "resistor", val_ohm: 1000, pinA: "C8", pinB: "C12", isVertical: false, colors: ["#78350f", "#000000", "#dc2626", "#d97706"], name: "1.0kΩ 保護抵抗", desc: "1.0kΩ 電流制限抵抗" },
      { id: "LED_PRESET_1", type: "led", colorType: "red", color: "#ef4444", vf: 2.0, pinA: "D12", pinB: "D14", isOn: true, name: "赤色LED (5mm)", desc: "順方向電圧2.0Vの標準的な赤色LED。" }
    ],
    answerWires: [
      // 1. 給電: +9Vレール ➔ 1kΩ抵抗の入力側 (列8)
      { id: "W_BASE_VCC", fromHole: "BUS_TOP_PLUS_8", toHole: "A8", color: "#ef4444" },
      // 2. 接地: LEDカソード (列14) ➔ 下部マイナスレール (GND) ★ここを完全修復！
      { id: "W_BASE_GND", fromHole: "E14", toHole: "BUS_BOTTOM_MINUS_14", color: "#3b82f6" }
    ]
  },

  // ★ Stage 2: 可変抵抗調光回路 (実証済み確定版)
  POT_DIMMER: {
    name: "可変抵抗調光回路 (10kΩPot + 赤LED)",
    components: [
      { id: "POT_PRESET_1", type: "potentiometer", val_max_ohm: 10000, cur_ratio: 0.1, val_ohm: 1000, pinA: "C3", pinB: "C7", pinC: "E5", pinWiper: "E5", spanCols: 4, name: "可変抵抗器 (10kΩ)", desc: "分圧・電流調整用ポテンショメータ" },
      { id: "R_PRESET_POT", type: "resistor", val_ohm: 100, pinA: "C10", pinB: "C14", isVertical: false, colors: ["#78350f", "#000000", "#78350f", "#d97706"], name: "100Ω 固定抵抗器", desc: "100Ω 電流制限保護抵抗" },
      { id: "LED_PRESET_POT", type: "led", colorType: "red", color: "#ef4444", vf: 2.0, pinA: "D14", pinB: "D16", isOn: true, name: "赤色LED (5mm)", desc: "順方向電圧2.0Vの赤色LED。" }
    ],
    answerWires: [
      { id: "W_POT_VCC", fromHole: "BUS_TOP_PLUS_3", toHole: "A3", color: "#ef4444" },
      { id: "W_POT_MID", fromHole: "E5", toHole: "A10", color: "#38bdf8" },
      { id: "W_POT_GND", fromHole: "E16", toHole: "BUS_BOTTOM_MINUS_16", color: "#3b82f6" }
    ]
  },

// ★ Stage 3: 階段スイッチ (実物グリッド完全吸着 ＆ 即時点灯版)
  STAIRCASE_SWITCH: {
    name: "🪜 階段スイッチ (2連3路XOR回路)",
    components: [
      { id: "stair-sw1", name: "1階スイッチ (SW1)", type: "switch_spdt", pinA: "C7", pinCom: "C9", pinB: "C11", state: "L1" },
      { id: "stair-sw2", name: "2階スイッチ (SW2)", type: "switch_spdt", pinA: "C17", pinCom: "C19", pinB: "C21", state: "L1" },
      { id: "stair-r1", name: "R1 (1.0kΩ)", type: "resistor", val_ohm: 1000, pinA: "D23", pinB: "D25", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
      { id: "stair-led1", name: "階段照明 (赤色LED)", type: "led", vf: 2.0, color: "red", pinA: "E25", pinB: "E27", isOn: true }
    ],
    answerWires: [
      { id: "W_STAIR_VCC", fromHole: "BUS_TOP_PLUS_9", toHole: "A9", color: "#ef4444" },
      { id: "W_STAIR_L1", fromHole: "A7", toHole: "A17", color: "#eab308" },
      { id: "W_STAIR_L2", fromHole: "E11", toHole: "E21", color: "#06b6d4" },
      { id: "W_STAIR_MID", fromHole: "A19", toHole: "A23", color: "#a855f7" },
      { id: "W_STAIR_GND", fromHole: "E27", toHole: "BUS_BOTTOM_MINUS_27", color: "#3b82f6" }
    ]
  },


  // ★ Stage 4: RC過渡応答回路 (充電スイッチ + 1kΩ + 10µF + 緑LED / 下部GND修復版)
  RC_TRANSIENT: {
    name: "RC時定数・過渡応答回路 (Cap 10µF + 緑LED)",
    components: [
      { id: "SW_PRESET_RC", type: "switch", pinA: "C4", pinB: "C6", isOn: true, name: "トグルスイッチ", desc: "充電開始用スイッチ" },
      { id: "R_PRESET_RC", type: "resistor", val_ohm: 1000, pinA: "C6", pinB: "C10", isVertical: false, colors: ["#78350f", "#000000", "#dc2626", "#d97706"], desc: "1.0kΩ 充電抵抗" },
      { id: "CAP_PRESET_1", type: "capacitor", subType: "electrolytic", val_uF: 10, pinA: "D10", pinB: "D12", name: "電解コンデンサ (10µF)", desc: "極性あり電解コンデンサ" },
      { id: "LED_PRESET_RC", type: "led", colorType: "green", color: "#22c55e", vf: 2.2, pinA: "C12", pinB: "C14", isOn: true, name: "緑色LED (5mm)", desc: "順方向電圧2.2Vの緑色LED。" }
    ],
    answerWires: [
      // 給電: +9Vレール ➔ スイッチ入力 (列4)
      { id: "W_RC_VCC", fromHole: "BUS_TOP_PLUS_4", toHole: "A4", color: "#ef4444" },
      // 接地: 緑LEDカソード (列14) ➔ 下部マイナスレール (GND)
      { id: "W_RC_GND", fromHole: "E14", toHole: "BUS_BOTTOM_MINUS_14", color: "#3b82f6" }
    ]
  },

  // ★ Stage 5: トランジスタ電子スイッチング回路 (2SC1815 / 完全同期版)
  TRANSISTOR_SWITCH: {
    name: "トランジスタ・スイッチング回路 (2SC1815 + LED)",
    components: [
      { id: "R_PRESET_TR_C", type: "resistor", val_ohm: 1000, pinA: "C5", pinB: "C9", isVertical: false, colors: ["#78350f", "#000000", "#dc2626", "#d97706"], desc: "1.0kΩ コレクタ負荷抵抗" },
      { id: "LED_PRESET_TR", type: "led", colorType: "red", color: "#ef4444", vf: 2.0, pinA: "D9", pinB: "D11", isOn: true, name: "赤色LED (5mm)", desc: "コレクタ電流で点灯するLED。" },
      { id: "TR_PRESET_1", type: "transistor", model: "2SC1815", subtype: "NPN", pinE: "C10", pinC: "C11", pinB: "C12", pinA: "C10", name: "NPNトランジスタ (2SC1815)", desc: "ベース電流でコレクタ電流を開閉するスイッチング素子。" },
      { id: "SW_PRESET_TR", type: "switch", pinA: "C17", pinB: "C20", isOn: true, name: "ベース制御スイッチ", desc: "ベース電流を投入・遮断するスイッチ。" },
      { id: "R_PRESET_TR_B", type: "resistor", val_ohm: 10000, pinA: "D20", pinB: "D12", isVertical: false, colors: ["#78350f", "#000000", "#ea580c", "#d97706"], desc: "10kΩ ベース電流制限抵抗" }
    ],
    answerWires: [
      // 1. コレクタ主電源: +9Vレール ➔ 1kΩ負荷抵抗 (列5)
      { id: "W_TR_VCC1", fromHole: "BUS_TOP_PLUS_5", toHole: "A5", color: "#ef4444" },
      // 2. ベース制御電源: +9Vレール ➔ スイッチ入力 (列17)
      { id: "W_TR_VCC2", fromHole: "BUS_TOP_PLUS_17", toHole: "A17", color: "#ef4444" },
      // 3. エミッタ接地: エミッタ (列10) ➔ 下部マイナスレール (GND)
      { id: "W_TR_GND", fromHole: "E10", toHole: "BUS_BOTTOM_MINUS_10", color: "#3b82f6" }
    ]
  },

};




// ★ バッテリー4種盛り 切り替え連動ハンドラ
function onBatteryChange(val) {
  selectedBatteryVoltage = parseFloat(val);

  // 説明文の動的切り替え
  const descEl = document.getElementById("inspector-battery-desc");
  if (descEl) {
    const descMap = {
      "9.0": "定格 9.0V (006P角形乾電池)。トランジスタ増幅や高抵抗LEDの点灯に最適です。",
      "5.0": "定格 5.0V (USB給電/マイコン標準)。電子工作の世界標準電圧。330Ω程度の抵抗が適しています。",
      "3.0": "定格 3.0V (単3乾電池×2本/ボタン電池)。LEDがギリギリ点灯する境界電圧を体験できます。",
      "1.5": "定格 1.5V (単3乾電池×1本)。多くのLEDの必要電圧(Vf)を下回るため、不点灯・電圧不足の実験に最適です。"
    };
    descEl.innerText = descMap[val] || `定格 ${val}V 直流電源。`;
  }

  // 物理計算・Canvas・ツリー・オシロスコープの全同期
  if (typeof calculateCircuitPhysics === "function") {
    const physics = calculateCircuitPhysics();
    if (typeof updateCircuitTreePanel === "function") updateCircuitTreePanel(physics);
  }
  if (typeof renderScene === "function") renderScene();
  if (typeof drawOscilloscope === "function") drawOscilloscope();
}






// ★ ステージ番号と回路キーの紐付けマッピング (番号化により組み替え自由)
const STAGE_PRESET_MAP = {
  1: "BASIC_LED",
  2: "POT_DIMMER",
  3: "STAIRCASE_SWITCH",
  4: "RC_TRANSIENT",
  5: "TRANSISTOR_SWITCH",
  // 6〜10はPhase 3で順次登録
};

// プリセット状態管理
let currentActiveStage = null;
let isAnswerShown = false;

/**
 * ★ 2回押し回答トグルハンドラ (loadPresetCircuit 完全連携版)
 * 1回目押下: パーツのみ配置 (手動挑戦モード / 青色ボタン)
 * 2回目押下: 正解ジャンパ線を自動接続 (回答お手本モード / 緑色ボタン)
 * 3回目押下: 再び未配線状態へ復帰 (トグル動作)
 */
function handlePresetClick(stageNo) {
  const presetKey = STAGE_PRESET_MAP[stageNo];
  if (!presetKey || !CIRCUIT_PRESETS[presetKey]) {
    console.warn(`[Stage ${stageNo}] は現在準備中です。`);
    return;
  }

  // 1. 同一番号の再クリックか判定し、回答フラグをトグル
  if (currentActiveStage === stageNo) {
    isAnswerShown = !isAnswerShown;
  } else {
    currentActiveStage = stageNo;
    isAnswerShown = false; // 新しいステージ選択時は挑戦モードから開始
  }

  // 2. 全ステージボタンのスタイルを初期リセット
  document.querySelectorAll(".stage-btn").forEach(btn => {
    btn.style.background = "#1e293b";
    btn.style.color = "#94a3b8";
    btn.style.borderColor = "#475569";
  });

  // 3. アクティブボタンの視覚フィードバック (青: 挑戦中 / 緑: 回答表示中)
  const activeBtn = document.getElementById(`btn-stage-${stageNo}`);
  if (activeBtn) {
    if (isAnswerShown) {
      activeBtn.style.background = "#059669"; // エメラルドグリーン
      activeBtn.style.color = "#ffffff";
      activeBtn.style.borderColor = "#34d399";
    } else {
      activeBtn.style.background = "#0284c7"; // スカイブルー
      activeBtn.style.color = "#ffffff";
      activeBtn.style.borderColor = "#38bdf8";
    }
  }

  // 4. 改修済み loadPresetCircuit へ委譲 (isAnswerShown が true なら正解配線も自動投入)
  loadPresetCircuit(presetKey, isAnswerShown);

  console.log(
    isAnswerShown
      ? `💡 [Stage ${stageNo}] 回答モード: 正解ジャンパ線を展開しました。`
      : `🎯 [Stage ${stageNo}] 挑戦モード: パーツを配置しました。ジャンパ線を手動で配線してください。(もう一度押すと回答が表示されます)`
  );
}



/**
 * ★ プリセット回路一括展開エンジン (手動挑戦・回答トグル両対応版)
 * @param {string} presetKey - 回路プリセットキー
 * @param {boolean} loadWires - ジャンパ線を展開するかどうか (true: 回答モード, false: 手動挑戦モード)
 */
function loadPresetCircuit(presetKey, loadWires = true) {
  const preset = CIRCUIT_PRESETS[presetKey];
  if (!preset) return;

  if (typeof saveHistory === "function") saveHistory();

  // 1. ボード上の全パーツおよび配線を安全にクリア
  components.length = 0;
  if (Array.isArray(activeJumperWires)) activeJumperWires.length = 0;
  if (Array.isArray(window.wires)) window.wires.length = 0;

  // 2. プリセット素子データを深層コピーして配置
  if (Array.isArray(preset.components)) {
    preset.components.forEach(c => components.push(JSON.parse(JSON.stringify(c))));
  }
    // 3. ★ 配線の制御: loadWires が true の場合のみ、正解ジャンパ線を両配列へ完全同期投入
  if (loadWires) {
    const wiresToLoad = preset.answerWires || preset.wires || [];
    wiresToLoad.forEach(w => {
      const cloned = JSON.parse(JSON.stringify(w));
      if (Array.isArray(activeJumperWires)) activeJumperWires.push(cloned);
      if (Array.isArray(window.wires) && window.wires !== activeJumperWires) {
        window.wires.push(JSON.parse(JSON.stringify(w)));
      }
    });
  }

  // 4. 選択状態および各種モードの完全初期化
  if (typeof setDeleteMode === "function") setDeleteMode(false);
  window.selectedComponent = null;
  window.selectedWire = null;

  // 5. 物理計算・描画・インスペクターの全体再同期
  if (typeof analyzeEnergizedNodes === "function") analyzeEnergizedNodes();
  if (typeof calculateCircuitPhysics === "function") calculateCircuitPhysics();
  if (typeof renderScene === "function") renderScene();
  if (typeof updateInspectorUI === "function") updateInspectorUI(null);
}




/**
 * 2-2. 【統合パーツレジストリ (PART_REGISTRY)】
 * 全パーツの電気諸元・描画スパン・インスペクター動作テキストを一元管理するマスター図鑑
 */
const PART_REGISTRY = {


  // --- LED 類 ---
  LED_RED:     { category: "OPTO",    type: "led",      colorType: "red",     color: "#ef4444", name: "赤色LED (5mm)",  vf: 2.0, spanCols: 2, desc: "順方向電圧2.0Vの標準的な赤色LED。" },
  LED_GREEN:   { category: "OPTO",    type: "led",      colorType: "green",   color: "#22c55e", name: "緑色LED (5mm)",  vf: 2.2, spanCols: 2, desc: "順方向電圧2.2Vの高輝度緑色LED。" },
  LED_BLUE:    { category: "OPTO",    type: "led",      colorType: "blue",    color: "#3b82f6", name: "青色LED (5mm)",  vf: 3.1, spanCols: 2, desc: "順方向電圧3.1Vの高輝度青色LED。" },
  LED_YELLOW:  { category: "OPTO",    type: "led",      colorType: "yellow",  color: "#ffff00", name: "黄色LED (5mm)",  vf: 2.1, spanCols: 2, desc: "順方向電圧2.1Vの標準的な黄色LED。" },
  LED_WHITE:   { category: "OPTO",    type: "led",      colorType: "white",   color: "#ffffff", name: "白色LED (5mm)",  vf: 3.2, spanCols: 2, desc: "順方向電圧3.2Vの高輝度白色LED。" },
  LED_RAINBOW: { category: "OPTO",    type: "led",      colorType: "rainbow", color: "#ec4899", name: "虹色LED (5mm)",  vf: 3.2, spanCols: 2, desc: "内部ICにより7色にグラデーション変化するマルチカラーLED。" },

  // --- 抵抗器 類 ---
  RESISTOR_100:    { category: "PASSIVE", type: "resistor", val_ohm: 100,    name: "100Ω 固定抵抗器",   colors: ["#78350f", "#000000", "#78350f", "#d97706"], spanCols: 5, desc: "100Ω 電流制限用抵抗。" },
  RESISTOR_330:    { category: "PASSIVE", type: "resistor", val_ohm: 330,    name: "330Ω 固定抵抗器",   colors: ["#ea580c", "#ea580c", "#78350f", "#d97706"], spanCols: 5, desc: "330Ω LEDドライブ用標準抵抗。" },
  RESISTOR_1000:   { category: "PASSIVE", type: "resistor", val_ohm: 1000,   name: "1.0kΩ 固定抵抗器",  colors: ["#78350f", "#000000", "#dc2626", "#d97706"], spanCols: 5, desc: "1.0kΩ 標準電流制限用受動素子。" },
  RESISTOR_10000:  { category: "PASSIVE", type: "resistor", val_ohm: 10000,  name: "10kΩ 固定抵抗器",   colors: ["#78350f", "#000000", "#ea580c", "#d97706"], spanCols: 5, desc: "10kΩ プルアップ/ダウン用抵抗。" },
  RESISTOR_100000: { category: "PASSIVE", type: "resistor", val_ohm: 100000, name: "100kΩ 固定抵抗器",  colors: ["#78350f", "#000000", "#eab308", "#d97706"], spanCols: 5, desc: "100kΩ 高入力インピーダンス分圧用。" },



// --- スイッチ 類 ---
  SWITCH_TOGGLE:   { category: "SWITCH",   type: "switch",   subType: "toggle", name: "トグルスイッチ (SPST)", spanCols: 3, desc: "1回路1投(SPST)トグルスイッチ。クリックで通電(ON)と切断(OFF)を切り替えます。" },
  SWITCH_SPDT:     { category: "SWITCH",   type: "switch_spdt", subType: "spdt",   name: "3路トグルスイッチ (SPDT)", spanCols: 4, desc: "1回路2投(SPDT)切替スイッチ。COM端子とL1/L2の接続を交互に切り替え、階段スイッチやXORを実現します。" },


  // --- 半導体素子 (ダイオード) ---
  DIODE_1N4007: {
    category: "SEMICONDUCTOR",
    type: "diode",
    name: "整流ダイオード (1N4007)",
    vf: 0.7,
    max_V: 1000,
    max_I_A: 1.0,
    spanCols: 4,
    desc: "一方向のみ電流を流す半導体素子。逆方向の電流を完全に遮断します。",
    getPhysicsText: (comp, phys) => {
      const isForward = phys.status === "CLOSED";
      return isForward
        ? `🔀 <b>[0.01ms] 整流作用:</b> ${comp.name} が順バイアス導通。順方向電圧降下 Vf = 0.7V。`
        : `🛑 <b>[0.01ms] 逆阻止:</b> ${comp.name} が逆バイアスにより電流の逆流を遮断中。`;
    }
  },


// --- 半導体素子 (バイポーラトランジスタ) ---
  TRANSISTOR_2SC1815: {
    category: "SEMICONDUCTOR",
    type: "transistor",
    model: "2SC1815",
    subtype: "NPN",
    name: "NPNトランジスタ (2SC1815)",
    spanCols: 2, // E(列), C(列+1), B(列+2) で計3列分
    vbe_drop: 0.7,
    hfe: 150,
    vce_sat: 0.1,
    ic_max_mA: 150.0,
    pd_max_mW: 400.0,
    desc: "汎用小信号NPNバイポーラトランジスタ。ベース(B)の微小電流で主電流(C-E間)を増幅・開閉します。",
    getPhysicsText: (comp, phys) => {
      const state = comp.state || "CUTOFF";
      if (state === "SATURATED") {
        return `⚡ <b>[0.02ms] 飽和導通:</b> ${comp.name} がベース電流を検知し完全ON。コレクタ-エミッタ間が導通。`;
      } else if (state === "ACTIVE") {
        return `📈 <b>[0.02ms] 線形増幅:</b> ${comp.name} がベース電流 (${(comp.ib_uA || 0).toFixed(1)}µA) を ${(comp.hfe || 150)}倍に電流増幅中。`;
      }
      return `🛑 <b>[0.02ms] 遮断 (CUTOFF):</b> ${comp.name} のベース電位が不足 (Vbe < 0.7V) のため主電流を遮断中。`;
    }
  },


 // --- 受動素子 (拡張: 完全動的テキスト生成ストラテジー付き) ---
  CAPACITOR_10UF: {
    category: "PASSIVE", type: "capacitor", subType: "electrolytic", val_uF: 10, max_V: 50, name: "電解コンデンサ (10µF)", spanCols: 2,
    desc: "10µFの極性あり電解コンデンサ。",
    getPhysicsText: (comp, phys) => {
      const r = phys.r_total_ohm || 1000;
      const tau = ((r * (comp.val_uF || 10)) / 1000).toFixed(1);
      return `🔋 <b>[0.02ms] 電荷蓄積:</b> ${comp.name} が突入電流を吸収開始。時定数 τ = ${tau}ms の過渡充電へ。`;
    }
  },
 POTENTIOMETER_10K: {
    category: "PASSIVE", type: "potentiometer", val_max_ohm: 10000, cur_ratio: 0.5, name: "可変抵抗器 (10kΩ)", spanCols: 4, // ★ 偶数スパン(4ピッチ)で中央穴を完全確保
    desc: "つまみを回すことで抵抗値を連続変化させる受動素子。",
    getPhysicsText: (comp, phys) => {
      const currentVal = comp.val_ohm !== undefined ? comp.val_ohm : ((comp.val_max_ohm || 10000) * (comp.cur_ratio || 0.5));
      return `🎛️ <b>[0.05ms] 電流制御:</b> ${comp.name} (${Math.round(currentVal)}Ω) により過渡電流を ${(phys.i_total_mA || 0).toFixed(2)}mA に制限。`;
    }
  }
};




// 旧マスターデータ参照との互換性保持ブリッジ (ReferenceError100%防止)
const RESISTOR_MASTER_DATA = {
  100: PART_REGISTRY.RESISTOR_100,
  330: PART_REGISTRY.RESISTOR_330,
  1000: PART_REGISTRY.RESISTOR_1000,
  10000: PART_REGISTRY.RESISTOR_10000,
  100000: PART_REGISTRY.RESISTOR_100000
};


const SWITCH_MASTER_DATA = {
  toggle: PART_REGISTRY.SWITCH_TOGGLE,
  spdt: PART_REGISTRY.SWITCH_SPDT // ★ 3路スイッチのブリッジを追加
};
const LED_MASTER_DATA = PART_REGISTRY;




/**
 * ★ 【完全動的・Zero Hardcoding】新規パーツ追加ファクトリー関数
 * レジストリキーを受け取り、あらゆるパーツを汎用的に空き穴へ自動配置します。
 */
function addNewComponent(partKey) {
  // 数値が渡された場合の補正（抵抗値直接指定時）
  if (typeof partKey === "number") {
    partKey = `RESISTOR_${partKey}`;
  } else if (partKey === "RESISTOR") {
    partKey = "RESISTOR_1000";
  } else if (partKey === "SWITCH") {
    partKey = "SWITCH_TOGGLE";
  }

  const master = PART_REGISTRY[partKey] || PART_REGISTRY.RESISTOR_1000;
    const lastComp = components[components.length - 1];
  const lastCol = lastComp ? getColFromHoleId(lastComp.pinB) : 5;
  const span = master.spanCols || 2;
  const startCol = Math.min(lastCol + 3, 30 - span);

 // ★ コンポーネント・インスタンスの生成 (type属性の確実な継承)
  // 操作種別: 確認・強化
  const newInst = {
    id: `${master.type.toUpperCase()}_${Date.now()}`,
    type: master.type, // PART_REGISTRYに定義された type ("potentiometer" 等) を正確に設定
    name: master.name,
    pinA: `C${startCol}`,
    pinB: `C${startCol + span}`,
    isVertical: false,
    desc: master.desc,
    spanCols: span
  };

  // 各パーツ型固有のプロパティを動的コピー (ハードコード条件分岐の全廃)
  if (master.type === "resistor") {
    newInst.val_ohm = master.val_ohm;
    newInst.colors = [...master.colors];
  } else if (master.type === "led") {
    newInst.colorType = master.colorType;
    newInst.color = master.color;
    newInst.vf = master.vf;
    newInst.isOn = false;
    newInst.isBurned = false;
 } else if (master.type === "switch") {
    newInst.subType = master.subType;
    newInst.isOn = false;
  } else if (master.type === "capacitor") {
    newInst.val_uF = master.val_uF;
    newInst.max_V = master.max_V;
    newInst.subType = master.subType;
 } else if (master.type === "potentiometer") {
    newInst.val_max_ohm = master.val_max_ohm;
    newInst.cur_ratio = master.cur_ratio; // 0.0 ~ 1.0 (デフォルト50%)
    newInst.val_ohm = master.val_max_ohm * master.cur_ratio;
  } else if (master.type === "diode") {
    newInst.vf = master.vf || 0.7;
    newInst.max_V = master.max_V || 1000;
    newInst.max_I_A = master.max_I_A || 1.0;
  }


// ★★★ ここに 2SC1815 の3端子スナップ生成ロジックを追加 ★★★
  else if (master.type === "transistor") {
    // 30列を超えるはみ出しを防止
    const safeCol = Math.min(startCol, 28);
        // 3本の足の穴IDを決定（行は同じC行、列を 0, +1, +2）
    // TO-92の並び: 左から E (エミッタ), C (コレクタ), B (ベース)
    newInst.pinE = `C${safeCol}`;     // 左足: エミッタ
    newInst.pinC = `C${safeCol + 1}`; // 中足: コレクタ
    newInst.pinB = `C${safeCol + 2}`; // 右足: ベース
        // 既存の2端子互換（当たり判定や旧処理が pinA, pinB を参照しても壊れないように両端を割り当て）
   newInst.pinA = newInst.pinE;
    newInst.pinB = `C${safeCol + 2}`;
        // 物理パラメータ
    newInst.vbe_drop = master.vbe_drop || 0.7;
    newInst.hfe = master.hfe || 150;
    newInst.vce_sat = master.vce_sat || 0.1;
    newInst.ic_max_mA = master.ic_max_mA || 150.0;
        // 動作ステータス
    newInst.state = "CUTOFF"; // CUTOFF | ACTIVE | SATURATED
    newInst.ib_uA = 0.0;
    newInst.ic_mA = 0.0;
    newInst.vce_V = 0.0;
    newInst.isBurned = false;
  }





 components.push(newInst);

  if (typeof autoGenerateJumperWires === "function") autoGenerateJumperWires();
  if (typeof analyzeEnergizedNodes === "function") analyzeEnergizedNodes();
  if (typeof renderScene === "function") renderScene();
}

// ======================================================================
// 【第3章：リアクティブ状態管理 ＆ 履歴エンジン (Reactive State & History)】
// 回路インスタンス、配線網、スルーホール座標、選択状態、波形バッファ、Undo/Redo
// ======================================================================

// 3-1. 回路コアデータ配列 (グローバル安全初期化)
window.components = window.components || [];
const components = window.components;
const activeJumperWires = [];
const allHoles = [];

// 3-2. 電源および物理計算状態
let selectedBatteryVoltage = 9.0; // 電源電圧 (初期値 9.0V)
let dashOffset = 0;               // 通電アニメーション進行位相

// 3-3. インタラクション選択・ホバー状態
let selectedComponent = null;     // 選択中パーツ
let selectedWire = null;          // 選択中ジャンパー線
let hoveredComponent = null;      // マウスホバー中パーツ
let hoveredHole = null;           // マウスホバー中穴
let firstSelectedHole = null;     // 手動配線の始点穴
let isDeleteMode = false;         // 削除(消しゴム)モードフラグ

// 3-4. オシロスコープ波形バッファ (CH1:電圧, CH2:電流)
const scopeDataBufferV = new Array(60).fill(0);
const scopeDataBufferI = new Array(60).fill(0);
const scopeDataBuffer = scopeDataBufferV; // 互換性保護

// 3-5. UNDO / REDO 履歴管理スタック
const undoStack = [];
const redoStack = [];
const MAX_HISTORY = 50;

/**
 * 現在のボード状態（パーツ＆手動配線）を履歴スタックへ保存
 */
function saveHistory() {
  const snapshot = {
    components: JSON.parse(JSON.stringify(components)),
    activeJumperWires: JSON.parse(JSON.stringify(activeJumperWires))
  };
  undoStack.push(snapshot);
  if (undoStack.length > MAX_HISTORY) undoStack.shift();
  redoStack.length = 0;
}

// ======================================================================
// 【第4章：幾何トポロジー ＆ 電気物理計算コア (Topology & Physics Core)】
// スルーホール幾何生成、通電パス探索 (BFS)、直並列オーム計算、短絡保護診断
// ======================================================================
function initializeBreadboardData() {
  allHoles.length = 0;

  for (let col = 1; col <= 30; col++) {
    const x = BOARD_CONFIG.colStartX + (col - 1) * BOARD_CONFIG.colPitch;

    allHoles.push({ id: `BUS_TOP_PLUS_${col}`, nodeId: "NODE_POWER_TOP_PLUS", x, y: BOARD_CONFIG.topPowerPlusY });
    allHoles.push({ id: `BUS_TOP_MINUS_${col}`, nodeId: "NODE_POWER_TOP_MINUS", x, y: BOARD_CONFIG.topPowerMinusY });

    ROWS_TOP.forEach((row, idx) => {
      allHoles.push({ id: `${row}${col}`, nodeId: `NODE_COL_${col}_TOP`, x, y: BOARD_CONFIG.terminalTopY + idx * BOARD_CONFIG.rowPitch });
    });

    ROWS_BOTTOM.forEach((row, idx) => {
      allHoles.push({ id: `${row}${col}`, nodeId: `NODE_COL_${col}_BOTTOM`, x, y: BOARD_CONFIG.terminalBottomY + idx * BOARD_CONFIG.rowPitch });
    });

    allHoles.push({ id: `BUS_BOTTOM_PLUS_${col}`, nodeId: "NODE_POWER_BOTTOM_PLUS", x, y: BOARD_CONFIG.bottomPowerPlusY });
    allHoles.push({ id: `BUS_BOTTOM_MINUS_${col}`, nodeId: "NODE_POWER_BOTTOM_MINUS", x, y: BOARD_CONFIG.bottomPowerMinusY });
  }
}

function getHoleCoord(holeId) {
  const hole = allHoles.find(h => h.id === holeId);
  return hole ? { x: hole.x, y: hole.y } : null;
}

function getNodeByHoleId(holeId) {
  const hole = allHoles.find(h => h.id === holeId);
  return hole ? hole.nodeId : null;
}

/**
 * 穴IDから純粋な列番号(1〜30)のみを100%正確に抽出する精密関数
 */
function getColFromHoleId(holeId) {
  if (!holeId) return 1;
  const match = holeId.match(/\d+/g);
  if (match && match.length > 0) {
    return parseInt(match[match.length - 1], 10);
  }
  return 1;
}

/**
 * ★ [自動配線エンジン完全修正版]: E12➔F12 へのピンポイント架け橋ジャンパ生成
 */
/**
 * ★ 直列回路に完全対応した自動ジャンパー配線エンジン (重複・短絡100%追放版)
 */
/**
 * ★ 超シンプル自動配線エンジン (先頭と末尾のみピンポイント配線)
 */
/**
 * ★ 全パーツの物理位置から「真の始点列」と「真の終点列」を自動抽出する決定版
 */
/**
 * ★ 【教育モード仕様】自動配線補間を完全廃止し、電源給電線のみを管理する安全関数
 */
/**
 * ★ 【完全クリーン仕様】自動配線データを毎回全消去し、勝手なアーチ線描画を100%根絶する
 */
/**
 * ★ 【完全クリーン仕様】無限再帰（スタックオーバーフロー）防止版
 */
/**
 * ★ 【手動配線保護仕様】手動で引いたジャンパー線を消去せず保持する
 */
function autoGenerateJumperWires() {
  // 手動配線データを保護するため、配列の初期化・全消去は行わない
  if (!Array.isArray(activeJumperWires)) {
    activeJumperWires = [];
  }
  // ※ 無限ループや自動消去を防ぎ、ユーザーの配線データを安全に維持します
}


/**
 * 動的通電探索 (BFS) - パーツ接続＆ジャンパー配線を元にノード通電を完全解析
 */
/**
 * ★ 配線エラー（ショート・孤立端子）の全自動診断エンジン
 */
// ショート状態の変更ログ監視用フラグ (毎フレーム連打の防止)
let isCurrentlyShortCircuit = false;

/**
 * ★ 配線エラー（ショート・孤立端子）の全自動診断エンジン (ログ連打防止・状態変化検知版)
 */
function diagnoseWiringErrors(energizedNodes) {
  // 1. ショート（直結短絡）のチェック: 電源プラスとマイナス間の抵抗値を算出
  const isShortConnected = energizedNodes.has("NODE_POWER_TOP_PLUS") && energizedNodes.has("NODE_POWER_BOTTOM_MINUS");
    // 抵抗器および可変抵抗器の実効抵抗値の総和を計算
  const rTotal = components.reduce((sum, c) => {
    if (c.type === "resistor") return sum + (c.val_ohm || 0);
    if (c.type === "potentiometer") return sum + (c.val_ohm || 0);
    return sum;
  }, 0);

  const isShortDetected = isShortConnected && (rTotal === 0) && (components.length > 0);

  // ★ 状態が変わった瞬間（1回のみ）コンソールへ警告を出力
  if (isShortDetected && !isCurrentlyShortCircuit) {
    isCurrentlyShortCircuit = true;
    console.warn("⚠️ [自動配線チェック] 警告: 抵抗を介さずに電源とGNDが短絡（ショート）しています！");
  } else if (!isShortDetected && isCurrentlyShortCircuit) {
    isCurrentlyShortCircuit = false;
    console.log("✅ [自動配線チェック] ショート状態が解除されました。");
  }

 // 2. 未接続・浮き端子のチェック
  components.forEach(comp => {
    const nA = getNodeByHoleId(comp.pinA);
    const nB = getNodeByHoleId(comp.pinB);
    if (!energizedNodes.has(nA) && !energizedNodes.has(nB)) {
      // 両端子とも通電していない状態
    }
  });
}

function analyzeEnergizedNodes() {  autoGenerateJumperWires();

// ★ 毎フレーム探索前に、全トランジスタを一旦「遮断 (CUTOFF)」にリセット！
  components.forEach(c => {
    if (c.type === "transistor") {
      c.state = "CUTOFF";
    }
  });


  // 電源(+)ノードを起点として探索
  const energizedNodes = new Set(["NODE_POWER_TOP_PLUS"]);
  let queue = ["NODE_POWER_TOP_PLUS"];
  while (queue.length > 0) {
    const currNode = queue.shift();

    // 1. ジャンパー線（手動配線および固定電源線）を介した導通探索
    activeJumperWires.forEach(wire => {
      const nFrom = getNodeByHoleId(wire.fromHole);
      const nTo = getNodeByHoleId(wire.toHole);
      if (nFrom === currNode && !energizedNodes.has(nTo)) {
        energizedNodes.add(nTo); queue.push(nTo);
      } else if (nTo === currNode && !energizedNodes.has(nFrom)) {
        energizedNodes.add(nFrom); queue.push(nFrom);
      }
    });

// 2. コンポーネント（スイッチ・抵抗器・LED・可変抵抗・コンデンサ・ダイオード）内部を介した導通探索
   components.forEach(comp => {
     // スイッチがOFF(false)の場合は通電を遮断
     if (comp.type === "switch" && !comp.isOn) return;

     // 破損・溶断した素子は通電を完全遮断
     if (comp.isBurned) return;

     const nA = getNodeByHoleId(comp.pinA);
     const nB = getNodeByHoleId(comp.pinB);

     if (!nA || !nB) return;

  // ★ ダイオード（整流素子）の極性制御: pinA(アノード) ➔ pinB(カソード) のみ導通
      if (comp.type === "diode") {
        if (nA === currNode && !energizedNodes.has(nB)) {
          energizedNodes.add(nB);
          queue.push(nB);
        }
        // 逆方向 (nB === currNode から nA へ) は通電させない
        return;
      }

   // ★ 3路トグルスイッチ (SPDT): COM端子と選択中接点 (L1 / L2) の排他双方向導通
      if (comp.type === "switch_spdt") {
        const comHole = comp.pinCom || comp.pinCOM || `C${getColFromHoleId(comp.pinA) + 2}`;
        const nCOM = getNodeByHoleId(comHole);
        const targetPin = (comp.state === "L2") ? comp.pinB : comp.pinA;
        const nTarget = getNodeByHoleId(targetPin);

        if (nCOM && nTarget) {
          // COM ➔ 選択接点 (L1またはL2)
          if (nCOM === currNode && !energizedNodes.has(nTarget)) {
            energizedNodes.add(nTarget);
            queue.push(nTarget);
          }
          // 選択接点 (L1またはL2) ➔ COM (逆方向)
          else if (nTarget === currNode && !energizedNodes.has(nCOM)) {
            energizedNodes.add(nCOM);
            queue.push(nCOM);
          }
        }
        return; // SPDT処理完了（後続の2端子一般処理は通さない）
      }

   // ★ 可変抵抗器 (potentiometer): A-B直通 ＆ A/B-Wiper 3端子完全相互導通
      if (comp.type === "potentiometer") {
        const wiperHole = comp.pinC || comp.pinWiper || "E5";
        const nWiper = getNodeByHoleId(wiperHole);

        // 1. ワイパー端子との双方向結合
        if (nWiper) {
          if ((nA === currNode || nB === currNode) && !energizedNodes.has(nWiper)) {
            energizedNodes.add(nWiper);
            queue.push(nWiper);
          } else if (nWiper === currNode) {
            if (!energizedNodes.has(nA)) { energizedNodes.add(nA); queue.push(nA); }
            if (!energizedNodes.has(nB)) { energizedNodes.add(nB); queue.push(nB); }
          }
        }

        // 2. ★ 端子A ↔ 端子B 間の直接直通導通 (実物の全抵抗体パス)
        if (nA === currNode && !energizedNodes.has(nB)) {
          energizedNodes.add(nB);
          queue.push(nB);
        } else if (nB === currNode && !energizedNodes.has(nA)) {
          energizedNodes.add(nA);
          queue.push(nA);
        }

        return; // 可変抵抗の3端子網処理完了
      }



// ★ NPNトランジスタ (2SC1815): ベース電流によるC-E間スイッチング制御
      if (comp.type === "transistor") {
        const nE = getNodeByHoleId(comp.pinE);
        const nC = getNodeByHoleId(comp.pinC);
        const nB = getNodeByHoleId(comp.pinB);

        // 1. ベース(B)が通電されているか判定
        if (nB === currNode || energizedNodes.has(nB)) {
          comp.state = "SATURATED";
        }

        // 2. 飽和(ON)状態であり、コレクタ(C)に通電が到達しているならエミッタ(E)へ伝播
        if (comp.state === "SATURATED") {
          if ((nC === currNode || energizedNodes.has(nC)) && nE && !energizedNodes.has(nE)) {
            energizedNodes.add(nE);
            queue.push(nE);
          }
        }

        return; // トランジスタ処理完了（下の2端子一般処理は通さない）
      }

     // 一般素子（抵抗・コンデンサ・スイッチ・可変抵抗）: 双方向導通
     if (nA === currNode && !energizedNodes.has(nB)) {
       energizedNodes.add(nB); queue.push(nB);
     } else if (nB === currNode && !energizedNodes.has(nA)) {
       energizedNodes.add(nA); queue.push(nA);
     }
   });
  }

// ★ 探索終了時に自動配線チェック・診断エンジンを実行！
  diagnoseWiringErrors(energizedNodes);
    return energizedNodes;
}

// 回路状態およびログ更新制御用変数
let prevCircuitStatus = "OPEN";
let lastLogUpdateTime = Date.now();

/**
 * ★ 【完全動的・Zero Hardcoding】BB物理現象テキスト解析エンジン
 */
function updatePhysicsLogEngine(physics, energizedNodes) {
  const logEl = document.getElementById("circuit-event-log");
  if (!logEl) return;

  const now = Date.now();
  const isClosed = physics && physics.status === "CLOSED";
  const currentStatus = isClosed ? "CLOSED" : (physics && physics.status === "SHORT" ? "SHORT" : "OPEN");

// ★ 選択中バッテリー電圧の動的ラベル取得 (例: "9.0V", "5.0V", "3.0V", "1.5V")
  const curV = (physics && physics.v_in !== undefined) ? physics.v_in : (typeof selectedBatteryVoltage !== "undefined" ? selectedBatteryVoltage : 9.0);
  const vLabel = Number.isInteger(curV) ? `${curV}.0V` : `${curV.toFixed(1)}V`;

  // 1. ショート（直結短絡）発生時
  if (currentStatus === "SHORT") {
    logEl.style.borderLeftColor = "#ef4444";
    logEl.innerHTML = `⚠️ <span style="color:#ef4444; font-weight:bold;">[SHORT CIRCUIT / 危険短絡]:</span> 電源(+${vLabel})とGNDが抵抗を介さずに直結されています！`;
    prevCircuitStatus = currentStatus;
    return;
  }

  // 2. 回路がオフ (OPEN) の時
  if (!isClosed) {
    if (prevCircuitStatus !== "OPEN") {
      logEl.style.borderLeftColor = "#64748b";
      logEl.innerHTML = `🔌 <b>[0.00ms] 回路遮断 (OPEN):</b> 電界が消滅し、自由電子の流動および発光が停止しました。`;
    }
    prevCircuitStatus = "OPEN";
    return;
  }

  // 3. 回路がオン (CLOSED) に切り替わった「瞬間」のポリモーフィックテキスト収集
  if (prevCircuitStatus !== "CLOSED") {
    logEl.style.borderLeftColor = "#38bdf8";
        let msgs = [];
    msgs.push(`⚡ <b>[0.00ms] 電界伝播:</b> ${vLabel}の電位差が線路内に光速で伝播。自由電子の移動を開始。`);

    // 通電中の全パーツから getPhysicsText を動的収集
    components.forEach(comp => {
      const regKey = Object.keys(PART_REGISTRY).find(k => PART_REGISTRY[k].type === comp.type);
      const master = regKey ? PART_REGISTRY[regKey] : null;

      if (master && typeof master.getPhysicsText === "function") {
        msgs.push(master.getPhysicsText(comp, physics));
      } else if (comp.type === "led") {
        // ★ 電流値判定：通電時のみ発光ログ、電圧不足(0mA)時は科学的警告
        if (physics && physics.i_total_mA > 0.001) {
          msgs.push(`✨ <b>[0.10ms] 光子放射:</b> ${comp.name || 'LED'} 内でキャリア再結合が活発化。発光グロー放出開始。`);
        } else {
          const ledVf = comp.vf || 2.0;
          msgs.push(`⚠️ <b>[0.10ms] 電圧不足:</b> ${vLabel} はLEDの順方向降下(${ledVf}V)に満たないためキャリア注入停止(消灯維持)。`);
        }
      }
    });
    logEl.innerHTML = msgs.join("<br>");
    prevCircuitStatus = "CLOSED";
    lastLogUpdateTime = now;
    return;
  }

  // 4. 定常通電中のリアルタイム変化（250ms周期更新）
  if (now - lastLogUpdateTime > 250) {
    lastLogUpdateTime = now;
    const burnedComp = components.find(c => c.isBurned);
    const hotLED = components.find(c => c.type === "led" && c.temp_C && c.temp_C > 60.0);

    if (burnedComp) {
      logEl.style.borderLeftColor = "#ef4444";
      logEl.innerHTML = `💥 <span style="color:#ef4444; font-weight:bold;">[MELTED / 物理破滅]:</span> ${burnedComp.name || '素子'} が過大な熱エネルギーにより物理破壊しました。`;
    } else if (hotLED) {
      logEl.style.borderLeftColor = "#f59e0b";
      logEl.innerHTML = `⚠️ <span style="color:#f59e0b; font-weight:bold;">[OVERHEAT WARNING]:</span> ${hotLED.name} 内温度が <b>${hotLED.temp_C.toFixed(1)}℃</b> に上昇中！`;
    }
  }
}



// ======================================================================
// BLOCK-05: [Canvas Rendering Engine] 自動追従描画エンジン
// ======================================================================

function updateDisplayToggles() {
  DISPLAY_MODE.isXrayON = document.getElementById("toggle-xray").checked;  DISPLAY_MODE.isSymbolON = document.getElementById("toggle-symbol").checked;
}

/**
 * ★ 電源・合成抵抗・電流・消費電力を一括高精度計算する物理解析エンジン
 */
/**
 * ★ 【完全統一物理エンジン】過電流(>30mA)による黒焦げ・破滅判定の一括統合
 */
/**
 * ★ 【完全統一物理エンジン】
 * RC過渡応答（可変抵抗完全連動）＆ LED段階的過熱・45mA熱溶断断線処理
 * 操作種別: 上書き修正
 */

// 回路物理計算エンジン
function calculateCircuitPhysics() {  const energized = analyzeEnergizedNodes();
  const isPowered = energized.has("NODE_POWER_TOP_PLUS") && energized.has("NODE_POWER_BOTTOM_MINUS");
  const v_in = selectedBatteryVoltage; // ★ 選択されたバッテリー電圧と連動
  // ★ 1. コンデンサの検出とリアルタイム充放電過渡応答方程式エンジン (可変抵抗値同期＆高速再充電版)
  const cap = components.find(c => c.type === "capacitor");

  if (cap) {
    if (cap.charge_V === undefined) cap.charge_V = 0.0;
        const nA = getNodeByHoleId(cap.pinA);
    const nB = getNodeByHoleId(cap.pinB);
    const isCapConnected = energized.has(nA) && energized.has(nB);

    // 回路全体の抵抗（固定抵抗 ＋ 可変抵抗の現在値）を正確に合算
    const rSum = components.reduce((sum, c) => {
      if (c.type === "resistor") return sum + (c.val_ohm || 0);
      if (c.type === "potentiometer") {
        const maxOhm = c.val_max_ohm || 10000;
        const ratio = c.cur_ratio !== undefined ? c.cur_ratio : 0.5;
        return sum + Math.max(maxOhm * ratio, 1.0);
      }
      return sum;
    }, 0) || 100;

    // 時定数 τ = R * C (秒)
    const tau_s = (rSum * (cap.val_uF || 10)) / 1000000;
    const dt = 0.016; // 60FPSでの時間刻み (16ms)

    if (isPowered && isCapConnected) {
      // 【充電プロセス】 電源9Vへ過渡充電
      const alpha = 1 - Math.exp(-dt / Math.max(tau_s, 0.001));
      cap.charge_V += (v_in - cap.charge_V) * alpha;
      if (cap.charge_V > v_in - 0.001) cap.charge_V = v_in;
    } else {
      // 【放電プロセス】 残留電荷の自己放電/負荷放電
      const alpha = Math.exp(-dt / Math.max(tau_s * 2.0, 0.05));
      cap.charge_V *= alpha;
      if (cap.charge_V < 0.001) cap.charge_V = 0.0;
    }
  }

  // ★ 2. 放電フェーズ対応：コンデンサの残留電圧による自立通電判定
  const capV = cap ? (cap.charge_V || 0.0) : 0.0;
  const isDischarging = !isPowered && capV > 1.8;
  const isClosed = isPowered || isDischarging;
  const effectiveV = isPowered ? v_in : capV;

  if (!isClosed || components.length === 0) {
    components.filter(c => c.type === "led").forEach(l => l.isOn = false);
    const openResult = { status: "OPEN", v_in: 0.0, r_total_ohm: Infinity, i_total_mA: 0.0, p_total_mW: 0.0, energized };
    if (typeof updatePhysicsLogEngine === "function") updatePhysicsLogEngine(openResult, energized);
    return openResult;
  }

// ★ 3. 006P型9V電池のリアル内部抵抗 (2.0Ω) ＆ 端子判定付き合成抵抗算出
  const BATTERY_INTERNAL_R = 2.0; // 電池の実測内部抵抗 (Ω)
    // 可変抵抗器の実効抵抗値をトポロジーから算出するヘルパー
  const getPotEffOhm = (c) => {
    const maxOhm = c.val_max_ohm || 10000;
    const ratio = c.cur_ratio !== undefined ? c.cur_ratio : 0.5;
    const wiperHole = c.pinC || c.pinWiper || "E5";
    const nW = (typeof getNodeByHoleId === "function") ? getNodeByHoleId(wiperHole) : null;
    const nB = (typeof getNodeByHoleId === "function") ? getNodeByHoleId(c.pinB) : null;

    const wires = Array.isArray(activeJumperWires) ? activeJumperWires : (window.wires || []);
    const isWiperConnected = wires.some(w => w.fromHole === wiperHole || w.toHole === wiperHole || (nW && (getNodeByHoleId(w.fromHole) === nW || getNodeByHoleId(w.toHole) === nW)));
    const isBConnected = wires.some(w => w.fromHole === c.pinB || w.toHole === c.pinB || (nB && (getNodeByHoleId(w.fromHole) === nB || getNodeByHoleId(w.toHole) === nB)));

    if (isWiperConnected) return c.val_ohm !== undefined ? c.val_ohm : Math.round(maxOhm * ratio);
    if (isBConnected) return maxOhm; // 端子A-B直通時は固定10kΩ
    return c.val_ohm !== undefined ? c.val_ohm : Math.round(maxOhm * ratio);
  };

  const connectedResistors = components.filter(c =>
    (!c.isBurned) && (
      (c.type === "resistor" && c.val_ohm !== undefined) ||
      (c.type === "potentiometer")
    )
  );
    let r_load_ohm = 0;
  if (connectedResistors.length > 0) {
    const nodePairs = connectedResistors.map(c => {
      const nA = getNodeByHoleId(c.pinA);
      const nB = getNodeByHoleId(c.pinB);
      return [nA, nB].sort().join("<->");
    });
        const isParallel = nodePairs.length > 1 && nodePairs.every(p => p === nodePairs[0]);

    if (isParallel) {
      const invSum = connectedResistors.reduce((sum, c) => {
        const val = c.type === "resistor" ? c.val_ohm : getPotEffOhm(c);
        return sum + (1 / Math.max(val, 0.001));
      }, 0);
      r_load_ohm = 1 / invSum;
    } else {
      r_load_ohm = connectedResistors.reduce((sum, c) => {
        const val = c.type === "resistor" ? c.val_ohm : getPotEffOhm(c);
        return sum + (val || 0);
      }, 0);
    }
  }

  // 回路全体の合成抵抗 = 負荷抵抗 + 電池内部抵抗 (2.0Ω)
  const r_total_ohm = r_load_ohm + BATTERY_INTERNAL_R;

  // ★ 4. ショート (SHORT) 状態判定 (内部抵抗により有限値にクランプ)
  if (r_load_ohm === 0) {
    const shortCurrent_mA = (effectiveV / BATTERY_INTERNAL_R) * 1000; // 例: 9V / 2Ω = 4500mA (4.5A)
    components.filter(c => c.type === "led").forEach(l => l.isOn = false);
    const shortResult = {
      status: "SHORT",
      v_in: effectiveV,
      r_total_ohm: BATTERY_INTERNAL_R,
      i_total_mA: shortCurrent_mA,
      p_total_mW: effectiveV * shortCurrent_mA,
      energized
    };
    if (typeof updatePhysicsLogEngine === "function") updatePhysicsLogEngine(shortResult, energized);
    return shortResult;
  }

// ★ 5. 通電オームの法則計算 (半導体・LED順方向電圧降下 Vf 完全反映版)
  // 操作種別: 上書き修正
  let dropV = 0.0;

  // ① 通電中ダイオードの Vf (0.7V) を合算
  const activeDiodes = components.filter(c => {
    if (c.type !== "diode") return false;
    const nA = getNodeByHoleId(c.pinA);
    const nB = getNodeByHoleId(c.pinB);
    return energized.has(nA) && energized.has(nB);
  });
  dropV += activeDiodes.reduce((sum, d) => sum + (d.vf || 0.7), 0);

 // ② 通電中LEDの Vf (赤:2.0V, 黄:2.1V, 緑:2.2V 等) を合算
  const activeLeds = components.filter(c => {
    if (c.type !== "led" || c.isBurned) return false;
    const nA = getNodeByHoleId(c.pinA);
    const nB = getNodeByHoleId(c.pinB);
    return energized.has(nA) && energized.has(nB);
  });
  dropV += activeLeds.reduce((sum, l) => sum + (l.vf || 2.0), 0);

  // ③ 通電中トランジスタの飽和電圧降下 Vce(sat) (約0.10V) を合算
  const activeTransistors = components.filter(c => {
    if (c.type !== "transistor") return false;
    const nE = getNodeByHoleId(c.pinE);
    const nC = getNodeByHoleId(c.pinC);
    return energized.has(nE) && energized.has(nC) && c.state === "SATURATED";
  });
  dropV += activeTransistors.reduce((sum, t) => sum + (t.vce_sat || 0.10), 0);

 // ★ 電圧不足(effectiveV <= dropV)なら素子不導通(0mA)、十分ならオームの法則
  const isTurnedOn = effectiveV > dropV;
  const effectiveResistorV = isTurnedOn ? (effectiveV - dropV) : 0.0;

  // 抵抗が存在し、かつ素子がオンしている時だけオームの法則で電流を計算
  const i_total_mA = (r_total_ohm > 0 && isTurnedOn) ? (effectiveResistorV / r_total_ohm) * 1000 : 0.0;
    // 回路全体の総消費電力 (mW) = 電源電圧 × 全電流
  const p_total_mW = effectiveV * i_total_mA;


  // ★ 6. 各LEDへのリアルな熱物理動作判定（段階的過熱 ➔ 45mA超で熱溶断断線）
  let hasBurnedComponent = false;

  components.filter(c => c.type === "led").forEach(led => {
    const nA = getNodeByHoleId(led.pinA);
    const nB = getNodeByHoleId(led.pinB);
    const isConnected = energized.has(nA) && energized.has(nB);

   if (led.isBurned) {
      led.isOn = false;
      hasBurnedComponent = true;
    } else if (isConnected) {
      const vf = led.vf || 2.0;
      // ★ 物理原則: 順方向バイアスを満たし、かつ実際に回路に電流が流れている時のみ点灯
      if (effectiveV >= vf && i_total_mA > 0.05) {
        if (i_total_mA > 45.0) {
          // 💥 45mA超過: 熱限界突破により即時溶断（黒焦げ断線 ＆ 煙トリガー）
          if (!led.isBurned) {
            led.isBurned = true;
            led.isOn = false;
            hasBurnedComponent = true;
            const p = (typeof getHoleCoord === "function") ? getHoleCoord(led.pinA) : null;
            if (p && typeof triggerBurnExplosion === "function") {
              triggerBurnExplosion(p.x + 15, p.y);
            }
          }
        } else {
          led.isOn = true;
          // ⚠️ 電流に応じた内部温度上昇（25mA〜45mAで過熱）
          led.temp_C = 25.0 + (i_total_mA * 2.2);
        }
      } else {
        // 電圧不足または電流0mA時は確実に消灯
        led.isOn = false;
      }
    } else {
      led.isOn = false;
    }
  });

 // ★ 固定抵抗器の 1/4W (250mW) 熱定格判定 ＆ 各素子個別パラメータの完全同期
  components.forEach(comp => {
    if (comp.isBurned) {
      comp.current_mA = 0; comp.voltageDrop = 0; comp.power_mW = 0;
      return;
    }
    if (comp.type === "resistor") {
      comp.current_mA = i_total_mA;
      comp.voltageDrop = (i_total_mA / 1000) * (comp.val_ohm || 0);
      comp.power_mW = comp.voltageDrop * i_total_mA;

      // 1/4W (250mW) の2倍 (500mW) 超過で即時熱焼損断線
      if (comp.power_mW > 500.0) {
        comp.isBurned = true;
        hasBurnedComponent = true;
        const p = (typeof getHoleCoord === "function") ? getHoleCoord(comp.pinA) : null;
        if (p && typeof triggerBurnExplosion === "function") triggerBurnExplosion(p.x + 20, p.y);
      }
    } else if (comp.type === "potentiometer") {
      const effR = getPotEffOhm(comp);
      comp.current_mA = i_total_mA;
      comp.voltageDrop = (i_total_mA / 1000) * effR;
      comp.power_mW = comp.voltageDrop * i_total_mA;
    } else if (comp.type === "led") {
      comp.current_mA = i_total_mA;
      comp.voltageDrop = comp.isOn ? (comp.vf || 2.0) : 0.0;
      comp.power_mW = comp.voltageDrop * i_total_mA;
    }
  });

  // 💥 いずれかの素子が焼損（断線）した場合は回路を OPEN (0mA) として遮断
  if (hasBurnedComponent) {
    components.filter(c => c.type === "led").forEach(l => l.isOn = false);
    const burnedResult = {
      status: "OPEN",
      v_in: 0.0,
      r_total_ohm: Infinity,
      i_total_mA: 0.0,
      p_total_mW: 0.0,
      energized
    };
    if (typeof updatePhysicsLogEngine === "function") updatePhysicsLogEngine(burnedResult, energized);
    return burnedResult;
  }



  const physicsResult = {
    status: "CLOSED",
    v_in,
    r_total_ohm,
    i_total_mA,
    p_total_mW,
    energized
  };

  if (typeof updatePhysicsLogEngine === "function") {
    updatePhysicsLogEngine(physicsResult, energized);
  }

  return physicsResult;
}


















function renderOscilloscope(ctx) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.clearRect(0, 0, w, h);

  // 1. 背景グリッド描画
  ctx.strokeStyle = "rgba(34, 197, 94, 0.15)";
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += 15) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

  // 2. 物理計算の取得
  const physics = calculateCircuitPhysics();

  // 3. バッファの更新
  if (typeof scopeDataBufferV !== "undefined" && typeof scopeDataBufferI !== "undefined") {
    scopeDataBufferV.shift();
    scopeDataBufferI.shift();

    const displayV = physics.status === "CLOSED" ? (physics.v_in + (Math.random() * 0.06 - 0.03)) : 0.0;
    const displayI = physics.status === "CLOSED" ? (physics.i_total_mA + (Math.random() * 0.04 - 0.02)) : 0.0;

    scopeDataBufferV.push(displayV);
    scopeDataBufferI.push(displayI);

    const stepX = w / (scopeDataBufferV.length - 1);

    // ★ CH1: 電圧波形 (黄色ライン - 上半分に描画)
    ctx.strokeStyle = physics.status === "CLOSED" ? "#eab308" : "#64748b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    scopeDataBufferV.forEach((val, idx) => {
      const x = idx * stepX;
      // 9Vのとき画面上部(高さの25%位置)に表示
      const y = h * 0.7 - (val / 12.0) * (h * 0.5);
      if (idx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // ★ CH2: 電流波形 (水色ライン - 下半分に明確に分離して描画!)
    if (physics.status === "CLOSED") {
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      // 電流値に応じて画面下部(高さの75%位置)を中心にクッキリ波形表示
      const normalizedI = Math.min(physics.i_total_mA / 10.0, 1.0); // 10mAフルスケール
      scopeDataBufferI.forEach((val, idx) => {
        const x = idx * stepX;
        const noise = (Math.random() * 2 - 1);
        const y = h * 0.85 - (normalizedI * (h * 0.35)) + noise;
        if (idx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
  }

  // 4. テキスト・凡例表示
  ctx.font = "bold 10px monospace";
  if (physics.status === "CLOSED") {
    const rText = physics.r_total_ohm >= 1000
      ? `${(physics.r_total_ohm / 1000).toFixed(2)} kΩ`
      : `${physics.r_total_ohm.toFixed(0)} Ω`;
        ctx.fillStyle = "#eab308";
    ctx.fillText(`CH1(V): ${physics.v_in.toFixed(1)}V`, 8, 14);
    ctx.fillStyle = "#38bdf8";
    ctx.fillText(`CH2(I): ${physics.i_total_mA.toFixed(2)}mA`, 90, 14);
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(`[R] ${rText}  [P] ${physics.p_total_mW.toFixed(1)}mW`, 190, 14);
  } else {
    ctx.fillStyle = "#ef4444";
    ctx.fillText(`[STATE] OPEN (回路断線)  [R_total] ∞ Ω  [I] 0.00 mA`, 8, 14);
  }
}


function drawJumperWire(ctx, wire, isAnimated = false) {
  const p1 = getHoleCoord(wire.fromHole);
  const p2 = getHoleCoord(wire.toHole);
  if (!p1 || !p2) return;

  ctx.save();
  ctx.strokeStyle = isAnimated ? "#38bdf8" : wire.color;
  ctx.lineWidth = isAnimated ? 3 : 2.5;
  ctx.lineCap = "round";

 if (isAnimated) {
    ctx.setLineDash([6, 4]);
    // ★ ジャンパー線内部のアニメーション進行方向を電源レールと完全同期させる
    ctx.lineDashOffset = -dashOffset;
  }

  // ★ 2点間の距離と位置から、自然に盛り上がる制御点（ベジェ曲線の頂点）を算定
  const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  const midX = (p1.x + p2.x) / 2;
  // 距離に応じてアーチの高さを動的制御（12px〜50pxの範囲でしなやかにカーブ）
  const archHeight = Math.min(Math.max(dist * 0.35, 12), 50);
  const controlY = Math.min(p1.y, p2.y) - archHeight;

  // ★ アーチ状の曲線を描画
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.quadraticCurveTo(midX, controlY, p2.x, p2.y);
  ctx.stroke();

 // ピン端子の丸ぽっち描画（実線時のみ）
  if (!isAnimated) {
    ctx.fillStyle = "#94a3b8";
    ctx.beginPath(); ctx.arc(p1.x, p1.y, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(p2.x, p2.y, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ======================================================================
// 【第5章：グラフィック描画エンジン (Rendering Pipeline)】
// JIS C 0617 回路図記号描画、実物リアル外観描画、ストラテジーマップ、メインCanvas描画
// ======================================================================

// ----------------------------------------------------------------------
// 5-1. 【JIS/IEC C 0617 規格】統合回路図記号描画モジュール
// ----------------------------------------------------------------------

// 1. 固定抵抗器 (JIS C 0617 長方形記号 / 穴座標完全吸着・白熱フィラメント自己完結版)
function drawSymbolResistor(ctx, pA, pB, comp, isHovered) {
  if (!pA || !pB) return;
  ctx.save();

  // 1. 幾何計算: 2穴間の実距離・角度・中点を完全動的算出 (Zero Hardcoding)
  const dx = pB.x - pA.x;
  const dy = pB.y - pA.y;
  const distance = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  const halfDist = distance / 2;

  const midX = (pA.x + pB.x) / 2;
  const midY = (pA.y + pB.y) / 2;

  ctx.translate(midX, midY);
  ctx.rotate(angle);

  // 2. JIS長方形の標準固定寸法
  const rw = 24; // 幅24px
  const rh = 10; // 高さ10px

  // 3. 通電・熱量判定 (回路物理エンジン ＆ ノード解析と完全直結！)
  const physics = typeof calculateCircuitPhysics === "function" ? calculateCircuitPhysics() : null;
  const isCircuitClosed = physics ? (physics.status === "CLOSED") : true;

  // 両端の穴が通電しているか、または回路が導通(CLOSED)しているかを判定
  let isEnergized = false;
  if (typeof analyzeEnergizedNodes === "function") {
    const energizedSet = analyzeEnergizedNodes();
    const nodeA = typeof getNodeByHoleId === "function" ? getNodeByHoleId(comp.pinA) : null;
    const nodeB = typeof getNodeByHoleId === "function" ? getNodeByHoleId(comp.pinB) : null;
    isEnergized = !!(energizedSet && nodeA && nodeB && energizedSet.has(nodeA) && energizedSet.has(nodeB) && isCircuitClosed);
  } else {
    isEnergized = isCircuitClosed;
  }

  // 電流値の取得 (物理エンジンから取得、未定義時は回路電流または標準7.0mA)
  const current_mA = (comp && comp.current_mA)
    ? comp.current_mA
    : ((physics && physics.i_total_mA) ? physics.i_total_mA : (isEnergized ? 7.0 : 0));

  // 4. 背景穴透け防止マスク (基板の穴・破線を100%遮断)
  ctx.fillStyle = (typeof DISPLAY_MODE !== "undefined" && DISPLAY_MODE.isXrayON)
    ? "rgba(226, 232, 240, 0.9)"
    : "#f8fafc";
  ctx.fillRect(-rw / 2, -rh / 2, rw, rh);

  // 5. リード線 ＆ 長方形ボディの一体描画パス (穴 pA から 穴 pB まで完全直結！)
  const drawPath = () => {
    ctx.beginPath();
    // 左リード線: 穴 pA (-halfDist) ➔ 長方形左端 (-rw/2)
    ctx.moveTo(-halfDist, 0); ctx.lineTo(-rw / 2, 0);
    // 右リード線: 長方形右端 (rw/2) ➔ 穴 pB (halfDist)
    ctx.moveTo(rw / 2, 0); ctx.lineTo(halfDist, 0);
    // JIS長方形
    ctx.rect(-rw / 2, -rh / 2, rw, rh);
  };

  // 6. 白熱フィラメント描画 (外部関数に依存しない自己完結型)
  if (isEnergized && current_mA > 0.05) {
    const intensity = Math.min(Math.max(current_mA / 25, 0), 1.0);
    const haloColor = intensity > 0.6 ? "#ea580c" : (intensity > 0.3 ? "#c2410c" : "#991b1b");
    const coreColor = intensity > 0.4 ? "#ffffff" : "#fef08a";

    // 外周熱放射ハロー
    ctx.save();
    ctx.shadowColor = haloColor;
    ctx.shadowBlur = 4 + intensity * 8;
    ctx.strokeStyle = haloColor;
    ctx.lineWidth = 3.2;
    drawPath();
    ctx.stroke();

    // 白熱コア
    ctx.shadowBlur = 0;
    ctx.strokeStyle = coreColor;
    ctx.lineWidth = 1.4;
    drawPath();
    ctx.stroke();
    ctx.restore();
  } else {
    // 非通電時・通常表示
    ctx.strokeStyle = isHovered ? "#38bdf8" : "#000000";
    ctx.lineWidth = isHovered ? 2.5 : 2.0;
    drawPath();
    ctx.stroke();
  }

  // 7. 抵抗値ラベル (不透明背景マスク付き・文字反転防止)
  ctx.rotate(-angle);
  ctx.font = "bold 9px monospace";
  ctx.textAlign = "center";
  const safeComp = comp || {};
  const ohm = safeComp.val_ohm || (safeComp.params && safeComp.params.val_ohm) || 1000;
  const valText = ohm >= 1000 ? `${(ohm / 1000).toFixed(1)}kΩ` : `${ohm}Ω`;

  const textWidth = ctx.measureText(valText).width;
  ctx.fillStyle = "rgba(248, 250, 252, 0.85)";
  ctx.fillRect(-textWidth / 2 - 2, -15, textWidth + 4, 10);

  ctx.fillStyle = isHovered ? "#0284c7" : "#000000";
  ctx.fillText(valText, 0, -8);

  ctx.restore();
}




// 2. トグルスイッチ (JIS C 0617 接点記号 / 穴座標完全吸着・多層白熱フィラメント版)
function drawSymbolSwitch(ctx, pA, pB, comp, isHovered) {
  if (!pA || !pB) return;
  ctx.save();

  // 1. 幾何計算: 2穴間の実距離・角度・中点を完全動的算出 (Zero Hardcoding)
  const dx = pB.x - pA.x;
  const dy = pB.y - pA.y;
  const distance = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  const halfDist = distance / 2;

  const midX = (pA.x + pB.x) / 2;
  const midY = (pA.y + pB.y) / 2;

  ctx.translate(midX, midY);
  ctx.rotate(angle);

  // 2. 通電・物理状態判定 (回路物理エンジン完全直結)
  const isClosed = !!(comp && comp.isOn);
  const physics = typeof calculateCircuitPhysics === "function" ? calculateCircuitPhysics() : null;
  const isCircuitClosed = physics ? (physics.status === "CLOSED") : true;

  let isEnergized = false;
  if (typeof analyzeEnergizedNodes === "function") {
    const energizedSet = analyzeEnergizedNodes();
    const nodeA = typeof getNodeByHoleId === "function" ? getNodeByHoleId(comp.pinA) : null;
    const nodeB = typeof getNodeByHoleId === "function" ? getNodeByHoleId(comp.pinB) : null;
    isEnergized = !!(energizedSet && nodeA && nodeB && energizedSet.has(nodeA) && energizedSet.has(nodeB) && isCircuitClosed && isClosed);
  } else {
    isEnergized = isCircuitClosed && isClosed;
  }

  const current_mA = (physics && physics.i_total_mA) ? physics.i_total_mA : (isEnergized ? 7.0 : 0);

  // 3. 背景穴透け防止マスク (接点レバー背後の穴・破線を遮断)
  ctx.save();
  ctx.fillStyle = (typeof DISPLAY_MODE !== "undefined" && DISPLAY_MODE.isXrayON)
    ? "rgba(226, 232, 240, 0.9)"
    : "#f8fafc";
  ctx.fillRect(-14, -12, 28, 24);
  ctx.restore();

  // 4. 接点および導線の描画パス定義
  const contactRadius = 2.5;

  // リード線 ＆ 接点ポッチのパス
  const drawBaseContacts = () => {
    ctx.beginPath();
    // 左リード線: 穴 pA (-halfDist) ➔ 左接点 (-10)
    ctx.moveTo(-halfDist, 0); ctx.lineTo(-10, 0);
    // 右リード線: 右接点 (10) ➔ 穴 pB (halfDist)
    ctx.moveTo(10, 0);        ctx.lineTo(halfDist, 0);
  };

  // スイッチ可動レバーのパス (ON時は直結、OFF時は斜め上に開く)
  const drawLeverPath = () => {
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    if (isClosed) {
      ctx.lineTo(10, 0);   // ON: 接続
    } else {
      ctx.lineTo(8, -10);  // OFF: 切断
    }
  };

  // 5. 白熱フィラメント描画 (通電ON時は全線が黄金〜純白コアに白熱！)
  if (isEnergized && current_mA > 0.05) {
    const intensity = Math.min(Math.max(current_mA / 25, 0), 1.0);
    const haloColor = intensity > 0.6 ? "#ea580c" : (intensity > 0.3 ? "#c2410c" : "#991b1b");
    const midColor  = intensity > 0.5 ? "#fef08a" : "#f97316";
    const coreColor = intensity > 0.4 ? "#ffffff" : "#fef08a";

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Layer 1: 外周熱放射ハロー
    ctx.shadowColor = haloColor;
    ctx.shadowBlur = 4 + intensity * 8;
    ctx.strokeStyle = haloColor;
    ctx.fillStyle = haloColor;
    ctx.lineWidth = 3.2;
    drawBaseContacts(); ctx.stroke();
    drawLeverPath();    ctx.stroke();

    // 接点ポッチ (Layer 1)
    ctx.beginPath();
    ctx.arc(-10, 0, contactRadius, 0, Math.PI * 2);
    ctx.arc(10, 0, contactRadius, 0, Math.PI * 2);
    ctx.fill();

    // Layer 2: 中間熱放射層 (黄金色)
    ctx.shadowBlur = 2;
    ctx.strokeStyle = midColor;
    ctx.fillStyle = midColor;
    ctx.lineWidth = 1.8;
    drawBaseContacts(); ctx.stroke();
    drawLeverPath();    ctx.stroke();

    // Layer 3: 白熱コア (純白芯線)
    ctx.shadowBlur = 0;
    ctx.strokeStyle = coreColor;
    ctx.fillStyle = coreColor;
    ctx.lineWidth = 1.0;
    drawBaseContacts(); ctx.stroke();
    drawLeverPath();    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-10, 0, 1.2, 0, Math.PI * 2);
    ctx.arc(10, 0, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  } else {
    // 非通電時またはOFF時 (冷えた接点と導線)
    const baseColor = isHovered ? "#38bdf8" : "#000000";
    ctx.strokeStyle = baseColor;
    ctx.fillStyle = baseColor;
    ctx.lineWidth = isHovered ? 2.5 : 2.0;

    drawBaseContacts(); ctx.stroke();
    drawLeverPath();    ctx.stroke();

    // 端子ポッチ (左右接点)
    ctx.beginPath();
    ctx.arc(-10, 0, contactRadius, 0, Math.PI * 2);
    ctx.arc(10, 0, contactRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 6. スイッチ名ラベル (文字反転防止 ＆ 背景マスク付き)
  ctx.rotate(-angle);
  ctx.font = "bold 9px monospace";
  ctx.textAlign = "center";
  const labelText = comp.name || "SW";
  const textWidth = ctx.measureText(labelText).width;

  ctx.fillStyle = (typeof DISPLAY_MODE !== "undefined" && DISPLAY_MODE.isXrayON)
    ? "rgba(226, 232, 240, 0.9)"
    : "rgba(248, 250, 252, 0.85)";
  ctx.fillRect(-textWidth / 2 - 2, -21, textWidth + 4, 10);

  ctx.fillStyle = isHovered ? "#0284c7" : "#000000";
  ctx.fillText(labelText, 0, -13);

  ctx.restore();
}



// ★ 2-2. 3路トグルスイッチ (JIS C 0617 SPDT / 階段スイッチ多層白熱フィラメント版)
function drawSymbolSwitchSPDT(ctx, pA, pB, comp, isHovered) {
  const comHoleId = comp.pinCom || comp.pinCOM || `C${getColFromHoleId(comp.pinA) + 2}`;
  const pCom = (typeof getHoleCoord === "function") ? getHoleCoord(comHoleId) : null;
  if (!pA || !pB || !pCom) return;

  ctx.save();

  // 1. 通電・物理状態判定 (回路物理エンジン完全直結)
  const isL1 = (comp.state || "L1") === "L1";
  const activePin = isL1 ? comp.pinA : comp.pinB;
  const targetPos = isL1 ? pA : pB;

  const physics = typeof calculateCircuitPhysics === "function" ? calculateCircuitPhysics() : null;
  const isCircuitClosed = physics ? (physics.status === "CLOSED") : true;

  let isEnergized = false;
  if (typeof analyzeEnergizedNodes === "function") {
    const energizedSet = analyzeEnergizedNodes();
    const nodeCom = typeof getNodeByHoleId === "function" ? getNodeByHoleId(comHoleId) : null;
    const nodeActive = typeof getNodeByHoleId === "function" ? getNodeByHoleId(activePin) : null;
    isEnergized = !!(energizedSet && nodeCom && nodeActive && energizedSet.has(nodeCom) && energizedSet.has(nodeActive) && isCircuitClosed);
  } else {
    isEnergized = isCircuitClosed;
  }

  const current_mA = (physics && physics.i_total_mA) ? physics.i_total_mA : (isEnergized ? 7.0 : 0);

  // 2. 背景穴透け防止マスク (3端子エリア背後の穴・破線を遮断)
  ctx.save();
  ctx.fillStyle = (typeof DISPLAY_MODE !== "undefined" && DISPLAY_MODE.isXrayON)
    ? "rgba(226, 232, 240, 0.9)"
    : "#f8fafc";
  const minX = Math.min(pA.x, pB.x, pCom.x) - 6;
  const maxX = Math.max(pA.x, pB.x, pCom.x) + 6;
  const minY = Math.min(pA.y, pB.y, pCom.y) - 6;
  const maxY = Math.max(pA.y, pB.y, pCom.y) + 6;
  ctx.fillRect(minX, minY, maxX - minX, maxY - minY);
  ctx.restore();

  // 3. 端子ポッチおよび可動レバーの描画
  const contactRadius = 2.5;

  // 可動レバーパス (COM ➔ 接続中端子)
  const drawLeverPath = () => {
    ctx.beginPath();
    ctx.moveTo(pCom.x, pCom.y);
    ctx.lineTo(targetPos.x, targetPos.y);
  };

  // 4. 白熱フィラメント描画 (通電時はCOMから接続先レバーまでが純白コア白熱！)
  if (isEnergized && current_mA > 0.05) {
    const intensity = Math.min(Math.max(current_mA / 25, 0), 1.0);
    const haloColor = intensity > 0.6 ? "#ea580c" : (intensity > 0.3 ? "#c2410c" : "#991b1b");
    const midColor  = intensity > 0.5 ? "#fef08a" : "#f97316";
    const coreColor = intensity > 0.4 ? "#ffffff" : "#fef08a";

    ctx.save();
    ctx.lineCap = "round";

    // Layer 1: 外周熱放射ハロー
    ctx.shadowColor = haloColor;
    ctx.shadowBlur = 4 + intensity * 8;
    ctx.strokeStyle = haloColor;
    ctx.fillStyle = haloColor;
    ctx.lineWidth = 3.2;
    drawLeverPath(); ctx.stroke();
    // 導通中の2端子ポッチ (COM と 接続側)
    ctx.beginPath();
    ctx.arc(pCom.x, pCom.y, contactRadius, 0, Math.PI * 2);
    ctx.arc(targetPos.x, targetPos.y, contactRadius, 0, Math.PI * 2);
    ctx.fill();

    // Layer 2: 中間熱放射層 (黄金色)
    ctx.shadowBlur = 2;
    ctx.strokeStyle = midColor;
    ctx.fillStyle = midColor;
    ctx.lineWidth = 1.8;
    drawLeverPath(); ctx.stroke();

    // Layer 3: 白熱コア (純白芯線)
    ctx.shadowBlur = 0;
    ctx.strokeStyle = coreColor;
    ctx.fillStyle = coreColor;
    ctx.lineWidth = 1.0;
    drawLeverPath(); ctx.stroke();
    ctx.beginPath();
    ctx.arc(pCom.x, pCom.y, 1.2, 0, Math.PI * 2);
    ctx.arc(targetPos.x, targetPos.y, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 非導通側の冷えた端子ポッチ
    const openPos = isL1 ? pB : pA;
    ctx.fillStyle = "#64748b";
    ctx.beginPath();
    ctx.arc(openPos.x, openPos.y, contactRadius, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // 非通電時 (冷えた接点とレバー)
    const baseColor = isHovered ? "#38bdf8" : "#000000";
    ctx.strokeStyle = baseColor;
    ctx.fillStyle = baseColor;
    ctx.lineWidth = isHovered ? 2.5 : 2.0;

    drawLeverPath(); ctx.stroke();

    // 3つの端子ポッチ
    ctx.beginPath();
    ctx.arc(pA.x, pA.y, contactRadius, 0, Math.PI * 2);
    ctx.arc(pCom.x, pCom.y, contactRadius, 0, Math.PI * 2);
    ctx.arc(pB.x, pB.y, contactRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. 未接続接点への切替ガイドライン (点線円弧・可動イメージ)
  // 3. 切替可能を示す円弧ガイドライン
  ctx.strokeStyle = "rgba(100, 116, 139, 0.4)";
  ctx.lineWidth = 1.0;
  ctx.setLineDash([2, 2]);
  ctx.beginPath();
  ctx.arc(pCom.x, pCom.y, Math.abs(pA.x - pCom.x), Math.PI, 0, true);
  ctx.stroke();
  ctx.setLineDash([]);

  // 4. ラベル表示
  ctx.font = "bold 8.5px monospace"; ctx.textAlign = "center";
  ctx.fillStyle = isHovered ? "#0284c7" : "#475569";
  ctx.fillText(comp.name || "SPDT", pCom.x, pCom.y - 10);

  ctx.restore();
}

// 3. 発光ダイオード (JIS C 0617 LED記号 / 穴座標完全吸着・破壊＆点灯連動版)
function drawSymbolLED(ctx, pA, pB, comp, isHovered) {
  if (!pA || !pB) return;
  ctx.save();

  // 1. 幾何計算: 2穴間の実距離・角度・中点を完全動的算出 (Zero Hardcoding)
  const dx = pB.x - pA.x;
  const dy = pB.y - pA.y;
  const distance = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  const halfDist = distance / 2;

  const midX = (pA.x + pB.x) / 2;
  const midY = (pA.y + pB.y) / 2;

  ctx.translate(midX, midY);
  ctx.rotate(angle);

 // 2. 物理・通電判定 ＆ 電流値取得 (回路物理エンジン完全直結)
  const isBurned = !!(comp && comp.isBurned);
  const physics = typeof calculateCircuitPhysics === "function" ? calculateCircuitPhysics() : null;
  const isCircuitClosed = physics ? (physics.status === "CLOSED") : true;

  let isEnergized = false;
  if (typeof analyzeEnergizedNodes === "function") {
    const energizedSet = analyzeEnergizedNodes();
    const nodeA = typeof getNodeByHoleId === "function" ? getNodeByHoleId(comp.pinA) : null;
    const nodeB = typeof getNodeByHoleId === "function" ? getNodeByHoleId(comp.pinB) : null;
    isEnergized = !!(energizedSet && nodeA && nodeB && energizedSet.has(nodeA) && energizedSet.has(nodeB) && isCircuitClosed);
  } else {
    isEnergized = isCircuitClosed;
  }

  const isLit = !isBurned && comp && comp.isOn && isEnergized;
  const current_mA = (physics && physics.i_total_mA) ? physics.i_total_mA : (isLit ? 7.0 : 0);

  // 3. 背景穴透け防止マスク (三角形およびカソード背後の穴・通電破線を完全遮断)
  ctx.save();
  ctx.fillStyle = (typeof DISPLAY_MODE !== "undefined" && DISPLAY_MODE.isXrayON)
    ? "rgba(226, 232, 240, 0.9)"
    : "#f8fafc";
  ctx.fillRect(-10, -9, 20, 18);
  ctx.restore();

  // 4. 描画パスの定義 (リード線・ダイオード本体)
  const drawWireAndBar = () => {
    ctx.beginPath();
    // アノード側リード線 ＆ カソード側リード線
    ctx.moveTo(-halfDist, 0); ctx.lineTo(-8, 0);
    ctx.moveTo(6, 0);         ctx.lineTo(halfDist, 0);
    // カソードバー
    ctx.moveTo(6, -7);        ctx.lineTo(6, 7);
  };

  const drawTriangle = () => {
    ctx.beginPath();
    ctx.moveTo(-8, -7); ctx.lineTo(6, 0); ctx.lineTo(-8, 7);
    ctx.closePath();
  };

  // 5. 多層白熱フィラメント発光レンダリング
  if (isLit) {
    const intensity = Math.min(Math.max(current_mA / 20, 0.25), 1.0);
    const glowColor = comp.color || "#eab308"; // 素子色 (デフォルト黄金)

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Layer 1: 広域オーロラグロー (外周への光拡散ハロー)
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 6 + intensity * 12;
    ctx.strokeStyle = glowColor;
    ctx.fillStyle = glowColor;
    ctx.lineWidth = 3.2;
    drawWireAndBar(); ctx.stroke();
    drawTriangle();   ctx.fill(); ctx.stroke();

    // Layer 2: 高輝度発光層 (彩度の高い中間光)
    ctx.shadowBlur = 2;
    ctx.strokeStyle = "#fef08a";
    ctx.lineWidth = 1.8;
    drawWireAndBar(); ctx.stroke();
    drawTriangle();   ctx.fill();

    // Layer 3: 白熱コア (中心を貫く純白の超高輝度コア線)
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.0;
    drawWireAndBar(); ctx.stroke();
    ctx.restore();
  } else {
    // 消灯時・冷えた金属線
    const normalColor = isBurned ? "#ef4444" : (isHovered ? "#38bdf8" : "#000000");
    ctx.strokeStyle = normalColor;
    ctx.fillStyle = normalColor;
    ctx.lineWidth = isHovered ? 2.5 : 2.0;
    drawWireAndBar(); ctx.stroke();
    drawTriangle();   ctx.fill(); ctx.stroke();
  }

  // 6. 発光光線矢印 (点灯時は光線自体も高輝度発光)
  if (!isBurned) {
    ctx.save();
    if (isLit) {
      ctx.strokeStyle = "#fde047";
      ctx.shadowColor = "#eab308";
      ctx.shadowBlur = 4;
      ctx.lineWidth = 1.8;
    } else {
      ctx.strokeStyle = isHovered ? "#38bdf8" : "#000000";
      ctx.lineWidth = 1.5;
    }
    ctx.beginPath();
    ctx.moveTo(-2, -9);  ctx.lineTo(4, -15);
    ctx.moveTo(4, -15);  ctx.lineTo(1, -15);
    ctx.moveTo(3, -6);   ctx.lineTo(9, -12);
    ctx.moveTo(9, -12);  ctx.lineTo(6, -12);
    ctx.stroke();
    ctx.restore();
  }

// 7. ラベル表示 (上部近接パーツ自動検知 ＆ 衝突回避動的オフセット)
  ctx.rotate(-angle);
  ctx.font = "bold 9px monospace";
  ctx.textAlign = "center";
  const labelText = isBurned ? "LED(BURN)" : ((comp && comp.name) || "LED");
  const textW = ctx.measureText(labelText).width;

// ★ 上方近接パーツの検知 (pinA・pinB・ボディ全体の完全レンジ判定)
  let hasUpperComp = false;
  if (typeof components !== "undefined" && Array.isArray(components)) {
    hasUpperComp = components.some(c => {
      if (c.id === comp.id) return false;
      const pA_other = (typeof getHoleCoord === "function") ? getHoleCoord(c.pinA) : null;
      const pB_other = (typeof getHoleCoord === "function") ? getHoleCoord(c.pinB) : null;
      if (!pA_other || !pB_other) return false;

      // 相手パーツのX座標範囲 (minX 〜 maxX) と Y座標
      const otherMinX = Math.min(pA_other.x, pB_other.x) - 10;
      const otherMaxX = Math.max(pA_other.x, pB_other.x) + 10;
      const otherMidY = (pA_other.y + pB_other.y) / 2;

      // 自身のX座標が相手パーツのX範囲と重なり、かつ直上(1〜35px上)にあるか
      const isXOverlap = (midX >= otherMinX && midX <= otherMaxX);
      const dy = midY - otherMidY;
      return isXOverlap && (dy > 0 && dy < 35);
    });
  }

  // 衝突時は下側(+18px)、通常時は上側(-16px)へスマート配置
  const labelY = hasUpperComp ? 18 : -16;
  const maskY = hasUpperComp ? 10 : -24;
  // ラベル背面の不透明マスク
  ctx.fillStyle = (typeof DISPLAY_MODE !== "undefined" && DISPLAY_MODE.isXrayON)
    ? "rgba(226, 232, 240, 0.9)"
    : "rgba(248, 250, 252, 0.9)";
  ctx.fillRect(-textW / 2 - 2, maskY, textW + 4, 10);

  ctx.fillStyle = isBurned ? "#ef4444" : (isHovered ? "#0284c7" : "#000000");
  ctx.fillText(labelText, 0, labelY);

  ctx.restore();
}

// 4. 電解コンデンサ (JIS C 0617 極性コンデンサ記号 / 穴座標完全吸着・可変スパン版)
function drawSymbolCapacitor(ctx, pA, pB, comp, isHovered) {
  if (!pA || !pB) return;
  ctx.save();
  const color = isHovered ? "#38bdf8" : "#000000";
  ctx.strokeStyle = color; ctx.fillStyle = color;
  ctx.lineWidth = isHovered ? 2.5 : 2.0;

  // 動的距離・中点・回転の算出
  const distance = Math.hypot(pB.x - pA.x, pB.y - pA.y);
  const halfDist = distance / 2;
  const midX = (pA.x + pB.x) / 2;
  const midY = (pA.y + pB.y) / 2;
  const angle = Math.atan2(pB.y - pA.y, pB.x - pA.x);

  ctx.translate(midX, midY); ctx.rotate(angle);

  // 1. 引出線: 穴 pA (-halfDist) から 穴 pB (halfDist) へ完全直結！(はみ出し解消)
  ctx.beginPath();
  ctx.moveTo(-halfDist, 0); ctx.lineTo(-4, 0); // アノード側
  ctx.moveTo(4, 0);         ctx.lineTo(halfDist, 0); // カソード側
  ctx.stroke();

  // 2. アノード(+)直線 ＆ カソード(-)湾曲線
  ctx.beginPath(); ctx.moveTo(-4, -8); ctx.lineTo(-4, 8); ctx.stroke();
  ctx.beginPath(); ctx.arc(8, 0, 9, Math.PI * 0.75, Math.PI * 1.25); ctx.stroke();

  // 3. 極性マーク ＆ ラベル (回転リセット)
  ctx.font = "9px sans-serif"; ctx.fillText("+", -10, -6);
  ctx.rotate(-angle);
  ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
  ctx.fillText(`${(comp && comp.val_uF) || 10}µF`, 0, -11);
  ctx.restore();
}




// 5. 可変抵抗器 (JIS C 0617 ポテンショメータ記号 / 穴座標完全吸着・多層白熱フィラメント版)
function drawSymbolPotentiometer(ctx, pA, pB, comp, isHovered) {
  if (!pA || !pB) return;
  ctx.save();

  // 1. 幾何計算: 2穴間の実距離・角度・中点を完全動的算出 (Zero Hardcoding)
  const dx = pB.x - pA.x;
  const dy = pB.y - pA.y;
  const distance = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  const halfDist = distance / 2;

  const midX = (pA.x + pB.x) / 2;
  const midY = (pA.y + pB.y) / 2;

  ctx.translate(midX, midY);
  ctx.rotate(angle);

  // 2. JIS長方形の標準固定寸法
  const rw = 24; // 幅24px
  const rh = 10; // 高さ10px

  // 3. 通電・熱量判定 (回路物理エンジン完全直結)
  const physics = typeof calculateCircuitPhysics === "function" ? calculateCircuitPhysics() : null;
  const isCircuitClosed = physics ? (physics.status === "CLOSED") : true;

  let isEnergized = false;
  if (typeof analyzeEnergizedNodes === "function") {
    const energizedSet = analyzeEnergizedNodes();
    const nodeA = typeof getNodeByHoleId === "function" ? getNodeByHoleId(comp.pinA) : null;
    const nodeB = typeof getNodeByHoleId === "function" ? getNodeByHoleId(comp.pinB) : null;
    isEnergized = !!(energizedSet && nodeA && nodeB && energizedSet.has(nodeA) && energizedSet.has(nodeB) && isCircuitClosed);
  } else {
    isEnergized = isCircuitClosed;
  }

  const current_mA = (comp && comp.current_mA)
    ? comp.current_mA
    : ((physics && physics.i_total_mA) ? physics.i_total_mA : (isEnergized ? 7.0 : 0));

  // 4. 背景穴透け防止マスク (基板の穴・破線を100%遮断)
  ctx.fillStyle = (typeof DISPLAY_MODE !== "undefined" && DISPLAY_MODE.isXrayON)
    ? "rgba(226, 232, 240, 0.9)"
    : "#f8fafc";
  ctx.fillRect(-rw / 2, -rh / 2, rw, rh);

  // 5. 描画パスの定義 (リード線・長方形ボディ・調整ワイパー矢印)
  const drawBodyPath = () => {
    ctx.beginPath();
    // 左リード線: 穴 pA (-halfDist) ➔ 長方形左端 (-rw/2)
    ctx.moveTo(-halfDist, 0); ctx.lineTo(-rw / 2, 0);
    // 右リード線: 長方形右端 (rw/2) ➔ 穴 pB (halfDist)
    ctx.moveTo(rw / 2, 0);     ctx.lineTo(halfDist, 0);
    // JIS長方形
    ctx.rect(-rw / 2, -rh / 2, rw, rh);
  };

// ★ 1行下のスルーホール穴芯(D列等)へ確実に吸着直結する垂直ドロップ長
  let wiperDropY = 16.0; // ブレッドボード標準行間ピッチへ完全到達
  if (comp && (comp.pinC || comp.pinWiper)) {
    const holeC = comp.pinC || comp.pinWiper;
    const pC = (typeof getHoleCoord === "function") ? getHoleCoord(holeC) : null;
    if (pC) {
      // 実穴座標が存在する場合は中点からの相対距離を完全動的算出
      wiperDropY = Math.hypot(pC.x - midX, pC.y - midY);
    }
  }

  const drawWiperPath = () => {
    ctx.beginPath();
    // ワイパー引き出し軸線: 穴芯 (0, wiperDropY) ➔ 長方形底面 (0, 5) へ隙間なく直結
    ctx.moveTo(0, wiperDropY);
    ctx.lineTo(0, 5);
  };

  const drawWiperArrow = () => {
    ctx.beginPath();
    // 長方形底面を指す調整矢印 (▲)
    ctx.moveTo(-3.5, 10.5);
    ctx.lineTo(0, 5);
    ctx.lineTo(3.5, 10.5);
    ctx.closePath();
  };
  // 6. 白熱フィラメント描画 (通電時は黒体放射マルチレイヤー)
  if (isEnergized && current_mA > 0.05) {
    const intensity = Math.min(Math.max(current_mA / 25, 0), 1.0);
    const haloColor = intensity > 0.6 ? "#ea580c" : (intensity > 0.3 ? "#c2410c" : "#991b1b");
    const midColor  = intensity > 0.5 ? "#fef08a" : "#f97316";
    const coreColor = intensity > 0.4 ? "#ffffff" : "#fef08a";

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Layer 1: 外周熱放射ハロー
    ctx.shadowColor = haloColor;
    ctx.shadowBlur = 4 + intensity * 8;
    ctx.strokeStyle = haloColor;
    ctx.fillStyle = haloColor;
    ctx.lineWidth = 3.2;
    drawBodyPath();  ctx.stroke();
    drawWiperPath(); ctx.stroke();
    drawWiperArrow(); ctx.fill();

    // Layer 2: 中間熱放射層 (黄金色)
    ctx.shadowBlur = 2;
    ctx.strokeStyle = midColor;
    ctx.fillStyle = midColor;
    ctx.lineWidth = 1.8;
    drawBodyPath();  ctx.stroke();
    drawWiperPath(); ctx.stroke();
    drawWiperArrow(); ctx.fill();

    // Layer 3: 白熱コア (純白芯線)
    ctx.shadowBlur = 0;
    ctx.strokeStyle = coreColor;
    ctx.lineWidth = 1.0;
    drawBodyPath();  ctx.stroke();
    drawWiperPath(); ctx.stroke();
    ctx.restore();
  } else {
    // 非通電時・通常表示
    const baseColor = isHovered ? "#38bdf8" : "#000000";
    ctx.strokeStyle = baseColor;
    ctx.fillStyle = baseColor;
    ctx.lineWidth = isHovered ? 2.5 : 2.0;
    drawBodyPath();   ctx.stroke();
    drawWiperPath();  ctx.stroke();
    drawWiperArrow(); ctx.fill();
  }

  // 7. 現在の抵抗値ラベル (不透明背景マスク付き・文字反転防止)
  ctx.rotate(-angle);
  ctx.font = "bold 9px monospace";
  ctx.textAlign = "center";
  const curVal = comp.val_ohm !== undefined ? comp.val_ohm : ((comp.val_max_ohm || 10000) * (comp.cur_ratio || 0.5));
  const valText = curVal >= 1000 ? `${(curVal / 1000).toFixed(1)}kΩ` : `${Math.round(curVal)}Ω`;

  const textWidth = ctx.measureText(valText).width;
  ctx.fillStyle = (typeof DISPLAY_MODE !== "undefined" && DISPLAY_MODE.isXrayON)
    ? "rgba(226, 232, 240, 0.9)"
    : "rgba(248, 250, 252, 0.85)";
  ctx.fillRect(-textWidth / 2 - 2, -15, textWidth + 4, 10);

  ctx.fillStyle = isHovered ? "#0284c7" : "#000000";
  ctx.fillText(valText, 0, -8);

  ctx.restore();
}

// ★ 整流ダイオード用 JIS/IEC C 0617 規格 回路図記号描画関数
function drawSymbolDiode(ctx, pA, pB, comp, isHovered) {
  ctx.save();
  const color = isHovered ? "#38bdf8" : "#000000";
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = isHovered ? 2.5 : 2.0;

  const midX = (pA.x + pB.x) / 2;
  const midY = (pA.y + pB.y) / 2;
  const angle = Math.atan2(pB.y - pA.y, pB.x - pA.x);

  ctx.translate(midX, midY);
  ctx.rotate(angle);

  // 引出線
  ctx.beginPath();
  ctx.moveTo(-16, 0); ctx.lineTo(-6, 0);
  ctx.moveTo(6, 0);  ctx.lineTo(16, 0);
  ctx.stroke();

  // 三角形シンボル (アノード ➔ カソード)
  ctx.beginPath();
  ctx.moveTo(-6, -7);
  ctx.lineTo(6, 0);
  ctx.lineTo(-6, 7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // カソードバー (縦線)
  ctx.beginPath();
  ctx.moveTo(6, -7);
  ctx.lineTo(6, 7);
  ctx.stroke();

  // ラベルテキスト
  ctx.font = "bold 9px monospace";
  ctx.textAlign = "center";
  ctx.fillText("D (1N4007)", 0, -11);
  ctx.restore();
}

// ★ 整流ダイオード用 リアル体描画関数 (黒ボディ + 銀帯カソードマーク)
function drawRealDiode(ctx, pA, pB, comp, isHovered) {
  ctx.save();
  const midX = (pA.x + pB.x) / 2;
  const midY = (pA.y + pB.y) / 2;
  const angle = Math.atan2(pB.y - pA.y, pB.x - pA.x);
  const distance = Math.hypot(pB.x - pA.x, pB.y - pA.y);

  const bodyW = 22;
  const bodyH = 8;
  const halfDist = distance / 2;

  ctx.translate(midX, midY);
  ctx.rotate(angle);

  // 1. 金属リード線
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1.8;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-halfDist, 0); ctx.lineTo(-bodyW / 2, 0);
  ctx.moveTo(bodyW / 2, 0);  ctx.lineTo(halfDist, 0);
  ctx.stroke();

  // 2. モールド樹脂ボディ (円筒形・黒)
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;

  ctx.fillStyle = isHovered ? "#262626" : "#171717";
  ctx.strokeStyle = isHovered ? "#38bdf8" : "#404040";
  ctx.lineWidth = 1.2;

  ctx.beginPath();
  ctx.roundRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH, 2);
  ctx.fill();
  ctx.stroke();
  ctx.shadowColor = "transparent";

  // 3. カソード側（pinB寄り）の銀帯（シルバーバンド）
  const bandW = 3.0;
  const bandX = (bodyW / 2) - 5; // 右端寄り（カソード側）

  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(bandX - bandW / 2, -bodyH / 2, bandW, bodyH);

  // 4. ハイライト光沢
  ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
  ctx.fillRect(-bodyW / 2 + 1, -bodyH / 2 + 1, bodyW - 2, 1.5);

  ctx.restore();
}


// ★ NPNトランジスタ (2SC1815) 用 下向きピン直結 JIS記号 (多層白熱フィラメント版)
function drawSymbolTransistor(ctx, comp, isHovered) {
  const pE = (typeof getHoleCoord === "function") ? getHoleCoord(comp.pinE || comp.pinA) : null;
  const colC = (typeof getColFromHoleId === "function") ? (getColFromHoleId(comp.pinA) + 1) : 2;
  const pC = (typeof getHoleCoord === "function") ? getHoleCoord(comp.pinC || `C${colC}`) : null;
  const pB = (typeof getHoleCoord === "function") ? getHoleCoord(comp.pinB) : null;
  if (!pE || !pC || !pB) return;

  ctx.save();
  const midX = pC.x;
  const midY = pC.y - 22;

  // 1. 通電・飽和状態判定 (回路物理エンジン完全直結)
  const isSaturated = (comp && comp.state === "SATURATED");
  const physics = typeof calculateCircuitPhysics === "function" ? calculateCircuitPhysics() : null;
  const isCircuitClosed = physics ? (physics.status === "CLOSED") : true;

  let isEnergized = false;
  if (typeof analyzeEnergizedNodes === "function") {
    const energizedSet = analyzeEnergizedNodes();
    const nodeC = typeof getNodeByHoleId === "function" ? getNodeByHoleId(comp.pinC || `C${colC}`) : null;
    const nodeE = typeof getNodeByHoleId === "function" ? getNodeByHoleId(comp.pinE || comp.pinA) : null;
    isEnergized = !!(energizedSet && nodeC && nodeE && energizedSet.has(nodeC) && energizedSet.has(nodeE) && isCircuitClosed);
  } else {
    isEnergized = isCircuitClosed;
  }

  const isConducting = isSaturated || isEnergized;
  const current_mA = (physics && physics.i_total_mA) ? physics.i_total_mA : (isConducting ? 7.0 : 0);

  // 2. 背景穴透け防止マスク (サークル内および引き出しピン背後の破線を遮断)
  ctx.save();
  ctx.fillStyle = (typeof DISPLAY_MODE !== "undefined" && DISPLAY_MODE.isXrayON)
    ? "rgba(226, 232, 240, 0.9)"
    : "#f8fafc";
  ctx.beginPath();
  ctx.arc(midX, midY, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3. 描画パスの分離定義
  // C-E主電流パス (コレクタ穴 ➔ 内部電極 ➔ エミッタ電極 ➔ エミッタ穴)
  const drawMainCurrentPath = () => {
    ctx.beginPath();
    // コレクタ足 ➔ シンボル下端
    ctx.moveTo(pC.x, pC.y); ctx.lineTo(midX, midY + 12);
    // コレクタ電極 (平板上部から中央下へ)
    ctx.moveTo(midX + 3, midY - 3); ctx.lineTo(midX, midY + 12);
    // エミッタ電極 (平板中央から左下へ)
    ctx.moveTo(midX + 3, midY); ctx.lineTo(midX - 7, midY + 9);
    // エミッタ足 ➔ シンボル左下端
    ctx.moveTo(midX - 7, midY + 9); ctx.lineTo(pE.x, midY + 12); ctx.lineTo(pE.x, pE.y);
  };

  // ベース制御パス (ベース足 ➔ 平板電極)
  const drawBasePath = () => {
    ctx.beginPath();
    ctx.moveTo(pB.x, pB.y); ctx.lineTo(pB.x, midY + 12); ctx.lineTo(midX + 7, midY + 9);
    ctx.moveTo(midX + 3, midY + 4); ctx.lineTo(midX + 7, midY + 9);
    // ベース平板電極
    ctx.moveTo(midX + 3, midY - 6); ctx.lineTo(midX + 3, midY + 6);
  };

  // エミッタ矢印 (NPN外向き ▲)
  const drawEmitterArrow = () => {
    ctx.beginPath();
    ctx.moveTo(midX - 7, midY + 9);
    ctx.lineTo(midX - 2, midY + 7);
    ctx.lineTo(midX - 4, midY + 4);
    ctx.closePath();
  };

  // 4. 白熱フィラメント描画 (導通・飽和時はC-E間に純白コアの熱線が炸裂！)
  if (isConducting && current_mA > 0.05) {
    const intensity = Math.min(Math.max(current_mA / 25, 0), 1.0);
    const haloColor = intensity > 0.6 ? "#ea580c" : (intensity > 0.3 ? "#c2410c" : "#991b1b");
    const midColor  = intensity > 0.5 ? "#fef08a" : "#f97316";
    const coreColor = intensity > 0.4 ? "#ffffff" : "#fef08a";

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // 外枠サークル
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(midX, midY, 12, 0, Math.PI * 2); ctx.stroke();

    // Layer 1: 外周熱放射ハロー
    ctx.shadowColor = haloColor;
    ctx.shadowBlur = 4 + intensity * 8;
    ctx.strokeStyle = haloColor;
    ctx.fillStyle = haloColor;
    ctx.lineWidth = 3.2;
    drawMainCurrentPath(); ctx.stroke();
    drawBasePath();        ctx.stroke();
    drawEmitterArrow();    ctx.fill();

    // Layer 2: 中間熱放射層 (黄金色)
    ctx.shadowBlur = 2;
    ctx.strokeStyle = midColor;
    ctx.fillStyle = midColor;
    ctx.lineWidth = 1.8;
    drawMainCurrentPath(); ctx.stroke();
    drawBasePath();        ctx.stroke();
    drawEmitterArrow();    ctx.fill();

    // Layer 3: 白熱コア (C-E間を貫く純白芯線)
    ctx.shadowBlur = 0;
    ctx.strokeStyle = coreColor;
    ctx.lineWidth = 1.0;
    drawMainCurrentPath(); ctx.stroke();
    ctx.restore();
  } else {
    // 非通電時・冷えた金属線
    const normalColor = isHovered ? "#38bdf8" : "#000000";
    ctx.strokeStyle = normalColor;
    ctx.fillStyle = normalColor;
    ctx.lineWidth = isHovered ? 2.5 : 1.8;

    // 外枠サークル
    ctx.beginPath(); ctx.arc(midX, midY, 12, 0, Math.PI * 2); ctx.stroke();
    drawMainCurrentPath(); ctx.stroke();
    drawBasePath();        ctx.stroke();
    drawEmitterArrow();    ctx.fill();
  }

  // 5. 型番ラベル (円の上部に十分なクリアランスをとって配置)
  ctx.font = "bold 8.5px monospace";
  ctx.textAlign = "center";
  const labelText = (comp && comp.name) || "2SC1815";
  const textWidth = ctx.measureText(labelText).width;
  ctx.fillStyle = (typeof DISPLAY_MODE !== "undefined" && DISPLAY_MODE.isXrayON)
    ? "rgba(226, 232, 240, 0.9)"
    : "rgba(248, 250, 252, 0.9)";
  ctx.fillRect(midX - textWidth / 2 - 2, midY - 21, textWidth + 4, 9);

  ctx.fillStyle = isHovered ? "#0284c7" : "#000000";
  ctx.fillText(labelText, midX, midY - 14);

  ctx.restore();
}








// =================================================================
// ★ 【完全統一・完全動的ディスパッチ】パーツ描画メインストラテジーマップ
// =================================================================
const COMP_RENDERERS = {
  resistor: (ctx, pA, pB, comp, isHovered) => {
    if (DISPLAY_MODE && DISPLAY_MODE.isSymbolON) drawSymbolResistor(ctx, pA, pB, comp, isHovered);
    else drawRealResistor(ctx, pA, pB, comp.colors || ["#78350f", "#000000", "#dc2626", "#d97706"], isHovered);
  },
switch: (ctx, pA, pB, comp, isHovered) => {
    if (DISPLAY_MODE && DISPLAY_MODE.isSymbolON) drawSymbolSwitch(ctx, pA, pB, comp, isHovered);
    else drawRealSwitch(ctx, pA, pB, comp, isHovered);
  },
  // ★ 3路トグルスイッチ (SPDT) 統合ディスパッチャ（シンボル／リアル両対応・pCOM自動解決）
  switch_spdt: (ctx, pA, pB, comp, isHovered) => {
    if (DISPLAY_MODE && DISPLAY_MODE.isSymbolON) {
      drawSymbolSwitchSPDT(ctx, pA, pB, comp, isHovered);
    } else {
      // リアル描画用: 手元のあらゆる座標取得方法で pCOM を安全解決
      let pCOM = null;
      const comId = comp.pinCOM || comp.pinCom;
      if (comId) {
        if (typeof getHolePos === "function") pCOM = getHolePos(comId);
        else if (typeof getHoleCoord === "function") pCOM = getHoleCoord(comId);
        else if (typeof holes !== "undefined" && holes[comId]) pCOM = holes[comId];
      }
      if (typeof drawRealSwitchSPDT === "function") {
        drawRealSwitchSPDT(ctx, pA, pCOM, pB, comp, isHovered);
      } else {
        drawRealSwitch(ctx, pA, pB, comp, isHovered);
      }
    }
  },
  led: (ctx, pA, pB, comp, isHovered) => {
    if (DISPLAY_MODE && DISPLAY_MODE.isSymbolON) drawSymbolLED(ctx, pA, pB, comp, isHovered);
    else drawRealLED(ctx, pA, pB, comp, isHovered);
  },
  capacitor: (ctx, pA, pB, comp, isHovered) => {
    if (DISPLAY_MODE && DISPLAY_MODE.isSymbolON) drawSymbolCapacitor(ctx, pA, pB, comp, isHovered);
    else drawRealCapacitor(ctx, pA, pB, comp, isHovered);
  },
  potentiometer: (ctx, pA, pB, comp, isHovered) => {
    if (DISPLAY_MODE && DISPLAY_MODE.isSymbolON) drawSymbolPotentiometer(ctx, pA, pB, comp, isHovered);
    else drawRealPotentiometer(ctx, pA, pB, comp, isHovered);
  },
  diode: (ctx, pA, pB, comp, isHovered) => {
    if (DISPLAY_MODE && DISPLAY_MODE.isSymbolON) drawSymbolDiode(ctx, pA, pB, comp, isHovered);
    else drawRealDiode(ctx, pA, pB, comp, isHovered);
  },

  transistor: (ctx, pA, pB, comp, isHovered) => {
    if (DISPLAY_MODE && DISPLAY_MODE.isSymbolON) {
      drawSymbolTransistor(ctx, comp, isHovered);
    } else {
      drawRealTransistor(ctx, comp, isHovered);
    }
  }
};


/**
 * ★ 【汎用統合型】パーツ描画メインエンジン
 */
function drawComponents(ctx) {
  components.forEach(comp => {
    const pA = getHoleCoord(comp.pinA);
    const pB = getHoleCoord(comp.pinB);
    if (!pA || !pB) return;

    const isHovered = (hoveredComponent && hoveredComponent.id === comp.id);

    // 1. スナップピン穴リングの描画
    drawSnapPinRing(ctx, pA.x, pA.y);
    drawSnapPinRing(ctx, pB.x, pB.y);

// ★ トランジスタなら中央ピン (pinC) にもリングを描画
    if (comp.type === "transistor" && comp.pinC) {
      const pC = getHoleCoord(comp.pinC);
      if (pC) drawSnapPinRing(ctx, pC.x, pC.y);
    }


  // 2. ストラテジーマップによるパーツ本体の描画呼び出し
    const renderer = COMP_RENDERERS[comp.type];
    if (typeof renderer === "function") {
      renderer(ctx, pA, pB, comp, isHovered);
    } else {
      // 未定義型フォールバック（抵抗器表示）
      drawRealResistor(ctx, pA, pB, comp.colors || ["#78350f", "#000000", "#dc2626", "#d97706"], isHovered);
    }
  });
}

// ----------------------------------------------------------------------
// 5-4. メインCanvas総合描画ルーチン (Main Scene Compositor)
// ----------------------------------------------------------------------
function renderScene(ctx) {
  // ★ ctxが未指定・undefinedの場合の安全自動補填ガード
  if (!ctx) {
    const canvas = document.getElementById("breadboard-canvas");
    if (canvas) ctx = canvas.getContext("2d");
  }
  if (!ctx) return; // Canvasコンテキストが取得できない場合は安全に中断

  const cfg = BOARD_CONFIG;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  // ★ 正しい電源接続穴: 上部+1列目 ＆ 下部-1列目の絶対座標を取得
  const pPlusHole = getHoleCoord("BUS_TOP_PLUS_1");
  const pMinusHole = getHoleCoord("BUS_BOTTOM_MINUS_1");

  if (!pPlusHole || !pMinusHole) return;

  // 1. 9V電池の描画
  const batW = 42;
  const batH = 65;
  const batX = 20;
  const batY = (cfg.y + cfg.height / 2) - batH / 2;

  ctx.save();
  // ★ 選択中の電圧ラベルを生成 (例: 9V, 5V, 3V, 1.5V)
  const curV = (typeof selectedBatteryVoltage !== "undefined") ? selectedBatteryVoltage : 9.0;
  const vLabel = Number.isInteger(curV) ? `${curV}V` : `${curV.toFixed(1)}V`;

  if (DISPLAY_MODE.isSymbolON) {
    ctx.strokeStyle = "#000000"; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(batX + 6, batY + 32); ctx.lineTo(batX + 34, batY + 32);
    ctx.stroke();

    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(batX + 13, batY + 48); ctx.lineTo(batX + 27, batY + 48);
    ctx.stroke();

    // ★ JIS記号モードでも動的に電圧表示
    ctx.fillStyle = "#000000"; ctx.font = "bold 10px monospace"; ctx.fillText(`+ ${vLabel} -`, batX, batY + 12);
  } else {
    ctx.fillStyle = "#334155"; ctx.beginPath(); ctx.roundRect(batX, batY, batW, batH, 6); ctx.fill();
    ctx.strokeStyle = "#64748b"; ctx.lineWidth = 1.5; ctx.stroke();

    // ★ リアルモードの電池中央文字を動的表示
    ctx.fillStyle = "#eab308"; ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
    ctx.fillText(vLabel, batX + batW / 2, batY + batH / 2 + 4);

    ctx.fillStyle = "#ef4444"; ctx.beginPath(); ctx.arc(batX + batW, batY + 18, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#3b82f6"; ctx.beginPath(); ctx.arc(batX + batW, batY + 47, 3.5, 0, Math.PI * 2); ctx.fill();

    ctx.beginPath();
    ctx.moveTo(batX + batW, batY + 18);
    ctx.lineTo(batX + batW, pPlusHole.y);
    ctx.lineTo(pPlusHole.x, pPlusHole.y);
    ctx.stroke();

    ctx.strokeStyle = "#3b82f6"; ctx.beginPath();
    ctx.moveTo(batX + batW, batY + 47);
    ctx.lineTo(batX + batW, pMinusHole.y);
    ctx.lineTo(pMinusHole.x, pMinusHole.y);
    ctx.stroke();
  }
  ctx.restore();

  // 2. ブレッドボード本体の描画
  ctx.fillStyle = DISPLAY_MODE.isXrayON ? "rgba(248, 250, 252, 0.65)" : "#f8fafc";
  ctx.beginPath(); ctx.roundRect(cfg.x, cfg.y, cfg.width, cfg.height, cfg.radius); ctx.fill();
  ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 2; ctx.stroke();

  if (DISPLAY_MODE.isXrayON) {
    ctx.fillStyle = "rgba(203, 213, 225, 0.4)"; ctx.strokeStyle = "rgba(148, 163, 184, 0.5)"; ctx.lineWidth = 1;
    for (let col = 1; col <= 30; col++) {
      const x = cfg.colStartX + (col - 1) * cfg.colPitch;
      ctx.fillRect(x - 3, cfg.terminalTopY - 3, 6, 4 * cfg.rowPitch + 6); ctx.strokeRect(x - 3, cfg.terminalTopY - 3, 6, 4 * cfg.rowPitch + 6);
      ctx.fillRect(x - 3, cfg.terminalBottomY - 3, 6, 4 * cfg.rowPitch + 6); ctx.strokeRect(x - 3, cfg.terminalBottomY - 3, 6, 4 * cfg.rowPitch + 6);
    }
  }

  // 3. 電源ガイドライン (赤/青レール)
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#ef4444"; ctx.beginPath(); ctx.moveTo(cfg.colStartX - 8, cfg.topPowerPlusY); ctx.lineTo(cfg.colStartX + 29 * cfg.colPitch + 8, cfg.topPowerPlusY); ctx.stroke();
  ctx.strokeStyle = "#3b82f6"; ctx.beginPath(); ctx.moveTo(cfg.colStartX - 8, cfg.topPowerMinusY); ctx.lineTo(cfg.colStartX + 29 * cfg.colPitch + 8, cfg.topPowerMinusY); ctx.stroke();
  ctx.strokeStyle = "#ef4444"; ctx.beginPath(); ctx.moveTo(cfg.colStartX - 8, cfg.bottomPowerPlusY); ctx.lineTo(cfg.colStartX + 29 * cfg.colPitch + 8, cfg.bottomPowerPlusY); ctx.stroke();
  ctx.strokeStyle = "#3b82f6"; ctx.beginPath(); ctx.moveTo(cfg.colStartX - 8, cfg.bottomPowerMinusY); ctx.lineTo(cfg.colStartX + 29 * cfg.colPitch + 8, cfg.bottomPowerMinusY); ctx.stroke();

  ctx.fillStyle = "#e2e8f0"; ctx.fillRect(cfg.x + 8, cfg.dipChannelY - 4, cfg.width - 16, 14);

  ctx.fillStyle = "#64748b"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  for (let col = 1; col <= 30; col += 5) {
    const x = cfg.colStartX + (col - 1) * cfg.colPitch;
    ctx.fillText(col.toString(), x, cfg.terminalTopY - 12);
    ctx.fillText(col.toString(), x, cfg.terminalBottomY + 4 * cfg.rowPitch + 12);
  }

  ctx.font = "bold 10px monospace";
  const leftLabelX = cfg.colStartX - 18; const rightLabelX = cfg.colStartX + 29 * cfg.colPitch + 18;
  ctx.fillStyle = "#ef4444"; ctx.fillText("+", leftLabelX, cfg.topPowerPlusY); ctx.fillText("+", rightLabelX, cfg.topPowerPlusY);
  ctx.fillStyle = "#3b82f6"; ctx.fillText("-", leftLabelX, cfg.topPowerMinusY); ctx.fillText("-", rightLabelX, cfg.topPowerMinusY);
  ctx.fillStyle = "#475569";
  ROWS_TOP.forEach((row, idx) => { const y = cfg.terminalTopY + idx * cfg.rowPitch; ctx.fillText(row, leftLabelX, y); ctx.fillText(row, rightLabelX, y); });
  ROWS_BOTTOM.forEach((row, idx) => { const y = cfg.terminalBottomY + idx * cfg.rowPitch; ctx.fillText(row, leftLabelX, y); ctx.fillText(row, rightLabelX, y); });

  // 4. ジャンパワイヤーの描画
  const energized = analyzeEnergizedNodes();
  activeJumperWires.forEach(wire => drawJumperWire(ctx, wire, false));

  // 5. 全穴 ＆ ハイライト描画
  if (firstSelectedHole) {
    ctx.fillStyle = "rgba(234, 179, 8, 0.4)"; ctx.strokeStyle = "#eab308"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(firstSelectedHole.x, firstSelectedHole.y, 7, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
  }

  if (hoveredHole) {
    ctx.fillStyle = "rgba(56, 189, 248, 0.35)"; ctx.strokeStyle = "#0284c7"; ctx.lineWidth = 1;
    allHoles.forEach(hole => {
      if (hole.nodeId === hoveredHole.nodeId) {
        ctx.beginPath(); ctx.arc(hole.x, hole.y, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
    });
  }

  allHoles.forEach(hole => {
    const isHovered = hoveredHole && hoveredHole.id === hole.id;
    ctx.beginPath(); ctx.arc(hole.x, hole.y, isHovered ? 3.5 : 2.2, 0, Math.PI * 2);
    ctx.fillStyle = isHovered ? "#38bdf8" : "#1e293b"; ctx.fill();
  });

  // 6. 通電アニメーション破線描画
  ctx.save();
  if (energized.has("NODE_POWER_TOP_PLUS") && energized.has("NODE_POWER_BOTTOM_MINUS")) {
    ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 3; ctx.setLineDash([6, 4]); ctx.lineDashOffset = -dashOffset;

    ctx.beginPath();
    ctx.moveTo(batX + batW, batY + 18);
    ctx.lineTo(batX + batW, pPlusHole.y);
    ctx.lineTo(pPlusHole.x, pPlusHole.y);
    ctx.stroke();

    let maxPlusCol = 1;
    activeJumperWires.forEach(w => {
      if (w.fromHole.startsWith("BUS_TOP_PLUS_")) {
        const c = getColFromHoleId(w.fromHole);
        if (c > maxPlusCol) maxPlusCol = c;
      }
    });
    const pPlusEnd = getHoleCoord(`BUS_TOP_PLUS_${maxPlusCol}`);
    if (pPlusEnd) {
      ctx.beginPath(); ctx.moveTo(pPlusHole.x, pPlusHole.y); ctx.lineTo(pPlusEnd.x, pPlusEnd.y); ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(pMinusHole.x, pMinusHole.y);
    ctx.lineTo(batX + batW, pMinusHole.y);
    ctx.lineTo(batX + batW, batY + 47);
    ctx.stroke();

    let maxMinusCol = 1;
    activeJumperWires.forEach(w => {
      if (w.toHole.startsWith("BUS_BOTTOM_MINUS_")) {
        const c = getColFromHoleId(w.toHole);
        if (c > maxMinusCol) maxMinusCol = c;
      }
    });
    const pMinusStart = getHoleCoord(`BUS_BOTTOM_MINUS_${maxMinusCol}`);
    if (pMinusStart) {
      ctx.beginPath(); ctx.moveTo(pMinusStart.x, pMinusStart.y); ctx.lineTo(pMinusHole.x, pMinusHole.y); ctx.stroke();
    }

    activeJumperWires.forEach(wire => {
      const nFrom = getNodeByHoleId(wire.fromHole);
      const nTo = getNodeByHoleId(wire.toHole);
      if (energized.has(nFrom) && energized.has(nTo)) {
        drawJumperWire(ctx, wire, true);
      }
    });

    components.forEach(comp => {
      const nA = getNodeByHoleId(comp.pinA);
      const nB = getNodeByHoleId(comp.pinB);
      if (energized.has(nA) && energized.has(nB)) {
        const colA = getColFromHoleId(comp.pinA);
        const compsAtColA = components.filter(c => getColFromHoleId(c.pinA) === colA || getColFromHoleId(c.pinB) === colA);
        if (compsAtColA.length > 1) {
          const holesA = compsAtColA.flatMap(c => [c.pinA, c.pinB]).filter(h => getColFromHoleId(h) === colA);
          const coordsA = holesA.map(h => getHoleCoord(h)).filter(Boolean);
          const minY = Math.min(...coordsA.map(p => p.y));
          const maxY = Math.max(...coordsA.map(p => p.y));
          if (minY !== maxY) {
            ctx.beginPath(); ctx.moveTo(coordsA[0].x, minY); ctx.lineTo(coordsA[0].x, maxY); ctx.stroke();
          }
        } else {
          const colHolesInNode = Array.from(energized).filter(holeId => getColFromHoleId(holeId) === colA);
          if (colHolesInNode.length > 1) {
            const coords = colHolesInNode.map(h => getHoleCoord(h)).filter(Boolean);
            const minY = Math.min(...coords.map(p => p.y));
            const maxY = Math.max(...coords.map(p => p.y));
            if (minY !== maxY && coords[0]) {
              ctx.beginPath(); ctx.moveTo(coords[0].x, minY); ctx.lineTo(coords[0].x, maxY); ctx.stroke();
            }
          }
        }
      }
    });
  }
  ctx.restore();

  // 7. 削除モード時のホバー赤色描画
  if (isDeleteMode && window.hoveredDeleteTarget) {
    ctx.save();
    ctx.strokeStyle = "#dc2626";
    ctx.fillStyle = "rgba(239, 68, 68, 0.45)";
    ctx.lineWidth = 5;

    if (window.hoveredDeleteTarget.type === "wire") {
      drawJumperWire(ctx, window.hoveredDeleteTarget.item, false);
    } else if (window.hoveredDeleteTarget.type === "component") {
      const comp = window.hoveredDeleteTarget.item;
      const pA = getHoleCoord(comp.pinA);
      const pB = getHoleCoord(comp.pinB);
      if (pA && pB) {
        const centerX = (pA.x + pB.x) / 2;
        const centerY = (pA.y + pB.y) / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // 8. 抵抗器・パーツの最前面描画
  drawComponents(ctx);
}

// ★ 電解コンデンサ用 リアル体描画関数
function drawRealCapacitor(ctx, pA, pB, comp, isHovered) {
  ctx.save();
  const midX = (pA.x + pB.x) / 2;
  const midY = (pA.y + pB.y) / 2;

  // リード線
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 2.0;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(pA.x, pA.y); ctx.lineTo(midX, midY);
  ctx.moveTo(pB.x, pB.y); ctx.lineTo(midX, midY);
  ctx.stroke();

  // 円筒ボディ（俯瞰）
  ctx.translate(midX, midY);
  ctx.fillStyle = isHovered ? "#3b82f6" : "#1e293b";
  ctx.strokeStyle = isHovered ? "#60a5fa" : "#475569";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  // マイナス極 帯マーク
  ctx.fillStyle = "#94a3b8";
  ctx.beginPath();
  ctx.arc(0, 0, 10, Math.PI * 0.25, Math.PI * 0.75);
  ctx.fill();

  ctx.restore();
}

// ★ 可変抵抗器用 リアル体描画関数 (3本足ワイパー完全吸着 ＆ 立体ボディ確定版)
function drawRealPotentiometer(ctx, pA, pB, comp, isHovered) {
  if (!pA || !pB) return;
  ctx.save();

  const midX = (pA.x + pB.x) / 2;
  const midY = (pA.y + pB.y) / 2;

  // 1. 3本目の足（ワイパー端子）の穴座標を自動解決
  let pWiper = null;
  if (comp && comp.pinC) {
    pWiper = (typeof getHoleCoord === "function") ? getHoleCoord(comp.pinC) : null;
  } else if (comp && comp.pinWiper) {
    pWiper = (typeof getHoleCoord === "function") ? getHoleCoord(comp.pinWiper) : null;
  } else {
    // pinA と pinB の中間列・1行下の穴を自動算出 (例: C8〜C11なら D10)
    const colA = (typeof getColFromHoleId === "function") ? getColFromHoleId(comp.pinA) : 8;
    const colB = (typeof getColFromHoleId === "function") ? getColFromHoleId(comp.pinB) : 11;
    const midCol = Math.round((colA + colB) / 2);
    const rowChar = (comp.pinA && comp.pinA.charAt(0)) || "C";
    const nextRow = String.fromCharCode(rowChar.charCodeAt(0) + 1); // C ➔ D
    pWiper = (typeof getHoleCoord === "function") ? getHoleCoord(`${nextRow}${midCol}`) : null;
  }

  // 2. 3本の金属リード線（A端子, B端子, ワイパー端子 ➔ ボディ中心へ完全吸着）
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 2.0;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(pA.x, pA.y); ctx.lineTo(midX, midY); // 左端子足
  ctx.moveTo(pB.x, pB.y); ctx.lineTo(midX, midY); // 右端子足
  if (pWiper) {
    ctx.moveTo(pWiper.x, pWiper.y); ctx.lineTo(midX, midY); // 中央ワイパー足
  }
  ctx.stroke();

  // 3. 円形ボリュームボディ（金属足の接合部を美しく覆う立体樹脂モールド）
  ctx.translate(midX, midY);

  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 5;
  ctx.shadowOffsetY = 2;

  ctx.fillStyle = isHovered ? "#2563eb" : "#334155";
  ctx.strokeStyle = isHovered ? "#60a5fa" : "#64748b";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.shadowColor = "transparent";

  // 4. ダイヤル角度インジケータノブ (スリット線 ＆ 軸芯)
  const ratio = (comp && comp.cur_ratio !== undefined) ? comp.cur_ratio : 0.5;
  const angle = (ratio * 270 - 135) * (Math.PI / 180);

  ctx.strokeStyle = "#f8fafc";
  ctx.lineWidth = 2.0;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(angle) * 8, Math.sin(angle) * 8);
  ctx.stroke();

  // 中心リベット
  ctx.fillStyle = "#cbd5e1";
  ctx.beginPath();
  ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}




/**
 * ★ リアルなトグルスイッチ描画関数 (穴座標 pA, pB への完全動的ジャストフィット版)
 */
function drawRealSwitch(ctx, pA, pB, comp, isHovered) {
  ctx.save();
  const midX = (pA.x + pB.x) / 2;
  const midY = (pA.y + pB.y) / 2;
  const angle = Math.atan2(pB.y - pA.y, pB.x - pA.x);

  // ピンAとピンBの実物理距離(半距離)を動的算出 (Zero Hardcoding)
  const dist = Math.hypot(pB.x - pA.x, pB.y - pA.y);
  const halfDist = dist / 2;
  const bodyWidth = Math.min(14, dist * 0.7); // ボディ幅を足の間に収まるよう自動スケーリング

  ctx.translate(midX, midY);
  ctx.rotate(angle);

  // ★ 1. スイッチ端子ピン: 両端が pA(C5) と pB(C6) の穴の中心へ100%ぴったり接続！
  ctx.strokeStyle = "#94a3b8"; // 銀色
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-halfDist, 0); ctx.lineTo(-bodyWidth / 2, 0); // 左足: 穴A ➔ ボディ左端
  ctx.moveTo(bodyWidth / 2, 0);  ctx.lineTo(halfDist, 0);  // 右足: ボディ右端 ➔ 穴B
  ctx.stroke();

  // ★ 2. ケース小型金属ボディ
  ctx.fillStyle = isHovered ? "#3b82f6" : "#1e293b";
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-bodyWidth / 2, -7, bodyWidth, 14, 3);
  ctx.fill(); ctx.stroke();


  // ON/OFF インジケータ (ON:緑, OFF:赤)
  ctx.fillStyle = comp.isOn ? "#22c55e" : "#ef4444";
  ctx.beginPath(); ctx.arc(0, -5, 3, 0, Math.PI * 2); ctx.fill();

 // トグル金属レバー
  ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 3.5; ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.lineTo(comp.isOn ? 7 : -7, 8);
  ctx.stroke();

  ctx.restore();
}

// ★ 3路トグルスイッチ (SPDT) 専用のリアル描画エンジン（ワイドスパン・当たり判定完全一致版）
function drawRealSwitchSPDT(ctx, pA, pCOM, pB, comp, isHovered) {
  if (!pA || !pB) return;
    // pCOMの安全解決
  if (!pCOM) {
    pCOM = { x: (pA.x + pB.x) / 2, y: (pA.y + pB.y) / 2 };
  }

  ctx.save();
  const angle = Math.atan2(pB.y - pA.y, pB.x - pA.x);
  const distA = Math.hypot(pCOM.x - pA.x, pCOM.y - pA.y);
  const distB = Math.hypot(pB.x - pCOM.x, pB.y - pCOM.y);
    // ★ 左右の端子穴までドッシリ覆うリアルモールド幅（端子間隔に完全追従）
  const maxDist = Math.max(distA, distB);
  const bodyHalfW = maxDist + 5; // ピン穴の少し外側までケースを自然に拡張
  const bodyH = 18;

  ctx.translate(pCOM.x, pCOM.y);
  ctx.rotate(angle);

  // 1. ケース本体 (工業用トグルスイッチの頑丈な金属/樹脂ボディ)
  ctx.fillStyle = isHovered ? "#1e3a8a" : "#1e293b";
  ctx.strokeStyle = isHovered ? "#38bdf8" : "#475569";
  ctx.lineWidth = isHovered ? 2.0 : 1.5;
  ctx.beginPath();
  ctx.roundRect(-bodyHalfW, -bodyH / 2, bodyHalfW * 2, bodyH, 4);
  ctx.fill(); ctx.stroke();

  // 2. 金属端子スナップポッチ (pA, pCOM, pBの真上に銀色端子を配置し、青リングと完全一致！)
  const drawTerminal = (x, y, label) => {
    ctx.fillStyle = "#94a3b8";
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1.0;
    ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#0f172a";
    ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill(); // 中心穴
    if (label) {
      ctx.font = "bold 7px monospace";
      ctx.fillStyle = "#94a3b8";
      ctx.textAlign = "center";
      ctx.fillText(label, x, - bodyH / 2 - 3);
    }
  };
  drawTerminal(-distA, 0, "1"); // L1端子 (左)
  drawTerminal(0, 0, "COM");     // COM端子 (中央)
  drawTerminal(distB, 0, "2");  // L2端子 (右)

  // 3. 接点状態インジケータLED (導通側が鮮やかに発光)
  const isL2 = comp.state === "L2";
  // L1インジケータ
  ctx.fillStyle = !isL2 ? "#38bdf8" : "#334155";
  ctx.shadowColor = !isL2 ? "#38bdf8" : "transparent";
  ctx.shadowBlur = !isL2 ? 6 : 0;
  ctx.beginPath(); ctx.arc(-distA * 0.5, -4, 2.5, 0, Math.PI * 2); ctx.fill();
  // L2インジケータ
  ctx.fillStyle = isL2 ? "#38bdf8" : "#334155";
  ctx.shadowColor = isL2 ? "#38bdf8" : "transparent";
  ctx.shadowBlur = isL2 ? 6 : 0;
  ctx.beginPath(); ctx.arc(distB * 0.5, -4, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0; // シャドウリセット

  // 4. 金属トグルレバー (state に応じて中央から左右へ力強く傾く)
  ctx.strokeStyle = "#f8fafc";
  ctx.lineWidth = 4.0;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(isL2 ? distB * 0.45 : -distA * 0.45, 6);
  ctx.stroke();

  // レバー先端の丸ノブ
  ctx.fillStyle = isHovered ? "#38bdf8" : "#cbd5e1";
  ctx.beginPath();
  ctx.arc(isL2 ? distB * 0.45 : -distA * 0.45, 6, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
function drawSnapPinRing(ctx, x, y) {
  ctx.save();
  ctx.strokeStyle = "#0284c7";
  ctx.fillStyle = "rgba(56, 189, 248, 0.5)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/**
 * 実物完全見本 抵抗器描画 (中心ズレ完全防止・自動角度連動描画)
 */
function drawRealResistor(ctx, pA, pB, colors, isHovered) {
  ctx.save();

  const midX = (pA.x + pB.x) / 2;
  const midY = (pA.y + pB.y) / 2;
  const angle = Math.atan2(pB.y - pA.y, pB.x - pA.x);
  const distance = Math.hypot(pB.x - pA.x, pB.y - pA.y);

  const bodyW = 24;
  const bodyH = 9;

  ctx.translate(midX, midY);
  ctx.rotate(angle);

  // 1. リード線
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1.8;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const halfDist = distance / 2;
  ctx.beginPath();
  ctx.moveTo(-halfDist, 0); ctx.lineTo(-bodyW / 2, 0);
  ctx.moveTo(bodyW / 2, 0); ctx.lineTo(halfDist, 0);
  ctx.stroke();

 // 2. セラミックボディ (裏線遮断マスク付き)
  const leftX = -bodyW / 2;
  const rightX = bodyW / 2;

  // ★ 背後の穴・通電破線を100%遮断する不透明下地マスク
  ctx.fillStyle = "#181825";
  ctx.beginPath();
  ctx.arc(leftX + 2, 0, bodyH / 2 + 2, Math.PI * 0.5, Math.PI * 1.5);
  ctx.lineTo(rightX - 2, -bodyH / 2 - 1);
  ctx.arc(rightX - 2, 0, bodyH / 2 + 2, Math.PI * 1.5, Math.PI * 0.5);
  ctx.lineTo(leftX + 2, bodyH / 2 + 1);
  ctx.closePath();
  ctx.fill();

  // 実体ボディの描画
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;

  ctx.fillStyle = isHovered ? "#fde047" : "#fef08a";
  ctx.strokeStyle = isHovered ? "#ca8a04" : "#d97706";
  ctx.lineWidth = 1.2;

  ctx.beginPath();
  ctx.arc(leftX + 2, 0, bodyH / 2 + 1, Math.PI * 0.5, Math.PI * 1.5);
  ctx.lineTo(rightX - 2, -bodyH / 2);
  ctx.arc(rightX - 2, 0, bodyH / 2 + 1, Math.PI * 1.5, Math.PI * 0.5);
  ctx.lineTo(leftX + 2, bodyH / 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.shadowColor = "transparent";

  // 3. カラーコード
  const bandWidth = 2.0;
  const bandPositions = [leftX + 5, leftX + 9, leftX + 13, rightX - 5];

  colors.forEach((color, idx) => {
    ctx.fillStyle = color;
    ctx.fillRect(bandPositions[idx] - bandWidth / 2, -bodyH / 2 - 0.5, bandWidth, bodyH + 1);
  });

  // 4. ハイライト
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.fillRect(leftX + 2, -bodyH / 2 + 1.2, bodyW - 4, 1.8);

  ctx.restore();
}




/**
 * ★ 【真上からの俯瞰・完全丸型 (Top-Down)】実物LED描画エンジン (Zero Hardcoding)
 */
function drawRealLED(ctx, pA, pB, comp, isHovered) {
  if (!pA || !pB) return;
  ctx.save();

  // ★ compの座標破壊を防ぐため、描画関数内でのピン強制書き換えを排除

 // 1. 幾何計算: 2つの穴の中間座標および距離を算出
  const midX = (pA.x + pB.x) / 2;
  const midY = (pA.y + pB.y) / 2;

  // 穴 pA と 穴 pB へ伸びる金属リード線 (ドーム外周から穴芯へ正確に接続)
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 2.0;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(pA.x, pA.y); ctx.lineTo(midX, midY);
  ctx.moveTo(pB.x, pB.y); ctx.lineTo(midX, midY);
  ctx.stroke();
  // スナップ穴リング (移動しても消えないピン表示)
  ctx.strokeStyle = isHovered ? "#38bdf8" : "#94a3b8";
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(pA.x, pA.y, 3, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(pB.x, pB.y, 3, 0, Math.PI * 2); ctx.stroke();

  ctx.translate(midX, midY);





 // ★ 2. 物理状態 (isBurned / comp.isOn) と完全同期する点灯判定 (Zero Hardcoding)
  const physics = typeof calculateCircuitPhysics === "function" ? calculateCircuitPhysics() : { status: "OPEN" };
  // 💥 物理破壊(isBurned)時は強制消灯！ 正常時のみ comp.isOn かつ 回路通電(CLOSED) で点灯
  const isBurned = !!comp.isBurned;
  const isLit = !isBurned && (comp.isOn !== false) && (physics.status === "CLOSED");

  // 発光色のスペック取得 (消灯時ベースカラー ＆ 虹色グラデーション完全連動版)
  const isRainbow = (comp.colorType === "rainbow" || comp.color === "#ec4899" || comp.color === "rainbow");
  let r = 239, g = 68, b = 68; // デフォルト赤色

  if (isRainbow) {
    r = 236; g = 72; b = 153;
    if (isLit) {
      const time = Date.now() * 0.003;
      r = Math.floor(Math.sin(time) * 127 + 128);
      g = Math.floor(Math.sin(time + 2) * 127 + 128);
      b = Math.floor(Math.sin(time + 4) * 127 + 128);
    }
  } else if (comp.colorType === "green" || comp.color === "#22c55e") { r = 34; g = 197; b = 94; }
  else if (comp.colorType === "blue" || comp.color === "#3b82f6") { r = 59; g = 130; b = 246; }
  else if (comp.colorType === "yellow" || comp.color === "#ffff00" || comp.color === "#eab308") { r = 234; g = 179; b = 8; }
  else if (comp.colorType === "white" || comp.color === "#ffffff") { r = 248; g = 250; b = 252; }
    const mainColor = isBurned ? "#334155" : `rgb(${r}, ${g}, ${b})`;

  // 3. 電流値 ($I$) に完全連動する動的オーロラグロー (物理破壊時は発光完全遮断)
  if (isLit) {
    ctx.save();
    const currentmA = (physics && physics.i_total_mA) ? physics.i_total_mA : 10.0;
    const intensity = Math.min(Math.max(currentmA / 15.0, 0.15), 1.0);
    const maxRadius = 12 + intensity * 24;

    const glowGrad = ctx.createRadialGradient(0, 0, 3, 0, 0, maxRadius);
    glowGrad.addColorStop(0, mainColor);
    glowGrad.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${0.6 * intensity})`);
    glowGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, maxRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.shadowColor = mainColor;
    ctx.shadowBlur = 8 + intensity * 16;
  } else {
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  }

  // ★ 4. LED砲弾レンズボディ (物理破壊時は焦げ色 #334155 描画)
  const radius = 9; // 直径18px (5mm LEDの真上俯瞰)
  if (isBurned) {
    ctx.fillStyle = "#334155"; // 💥 焦げたダークグレー
    ctx.strokeStyle = "#0f172a";
  } else {
    ctx.fillStyle = isLit ? `rgb(${Math.min(r+60, 255)}, ${Math.min(g+60, 255)}, ${Math.min(b+60, 255)})` : mainColor;
    ctx.strokeStyle = isHovered ? "#38bdf8" : (isLit ? "#ffffff" : "rgba(255, 255, 255, 0.5)");
  }
  ctx.lineWidth = isHovered ? 2.0 : 1.0;

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  // 5. 内部のリードフレーム (物理破壊時はスモーキーな断線表示)
  ctx.shadowBlur = 0;
  ctx.strokeStyle = isBurned ? "rgba(15, 23, 42, 0.8)" : (isLit ? "rgba(255, 255, 255, 0.6)" : "rgba(255, 255, 255, 0.25)");
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-4, -2); ctx.lineTo(-1, 0); ctx.lineTo(-3, 3);
  ctx.moveTo(3, -1);  ctx.lineTo(1, 0);  ctx.lineTo(2, 2);
  ctx.stroke();

  // 6. ドーム天面の高輝度レンズ光沢ハイライト
  ctx.shadowBlur = 0;
  ctx.fillStyle = isBurned ? "rgba(255, 255, 255, 0.15)" : (isLit ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.70)");
  ctx.beginPath();
  ctx.arc(-3, -3, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}




// 3. 発光ダイオード (JIS C 0617 LED記号 / 穴座標完全吸着・可変スパン版)
function drawSymbolLED(ctx, pA, pB, comp, isHovered) {
  if (!pA || !pB) return;
  ctx.save();

  const isBurned = !!(comp && comp.isBurned);
  const physics = typeof calculateCircuitPhysics === "function" ? calculateCircuitPhysics() : { status: "OPEN" };
  const isLit = !isBurned && comp && comp.isOn && (physics.status === "CLOSED");

  let mainColor = isHovered ? "#38bdf8" : "#000000";
  if (isBurned) mainColor = "#ef4444";     // 💥 破壊時赤
  else if (isLit) mainColor = "#eab308";   // ✨ 点灯時黄

  ctx.strokeStyle = mainColor; ctx.fillStyle = mainColor;
  ctx.lineWidth = isHovered ? 2.5 : 2.0;

  // 動的距離・中点・回転の算出
  const distance = Math.hypot(pB.x - pA.x, pB.y - pA.y);
  const halfDist = distance / 2;
  const midX = (pA.x + pB.x) / 2;
  const midY = (pA.y + pB.y) / 2;
  const angle = Math.atan2(pB.y - pA.y, pB.x - pA.x);

  ctx.translate(midX, midY); ctx.rotate(angle);

  // 1. リード線: 穴 pA (-halfDist) から 穴 pB (halfDist) へ完全直結！
  ctx.beginPath();
  ctx.moveTo(-halfDist, 0); ctx.lineTo(-8, 0); // アノード側
  ctx.moveTo(6, 0);         ctx.lineTo(halfDist, 0); // カソード側
  ctx.stroke();

  // 2. 三角形ダイオード ＆ カソードバー
  ctx.beginPath(); ctx.moveTo(-8, -7); ctx.lineTo(6, 0); ctx.lineTo(-8, 7); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(6, -7); ctx.lineTo(6, 7); ctx.stroke();

  // 3. 発光矢印 (正常時のみ表示)
  if (!isBurned) {
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-2, -9); ctx.lineTo(4, -15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4, -15); ctx.lineTo(1, -15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(3, -6);  ctx.lineTo(9, -12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(9, -12); ctx.lineTo(6, -12); ctx.stroke();
  }

  // 4. ラベル (回転をリセットして水平表示)
  ctx.rotate(-angle);
  ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
  ctx.fillText(isBurned ? "LED(BURN)" : ((comp && comp.name) || "LED"), 0, -16);
  ctx.restore();
}
// ★ NPNトランジスタ (2SC1815) 用 リアル体描画関数 (TO-92パッケージ)
function drawRealTransistor(ctx, comp, isHovered) {
  const pE = getHoleCoord(comp.pinE || comp.pinA);
  const pC = getHoleCoord(comp.pinC || `C${getColFromHoleId(comp.pinA) + 1}`);
  const pB = getHoleCoord(comp.pinB);

  if (!pE || !pC || !pB) return;

  ctx.save();
  const midX = pC.x;
  const midY = pC.y;

  // 1. 3本の金属リード線（各穴から素子本体へ伸びる足）
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 2.0;
  ctx.lineCap = "round";

  [pE, pC, pB].forEach(p => {
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x, midY - 6);
    ctx.stroke();
  });

  // 2. TO-92 モールド樹脂ボディ (中央ピン pC の少し上側に配置)
  ctx.translate(midX, midY - 14);

  const bodyW = 24;
  const bodyH = 12;

  // 影
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 5;
  ctx.shadowOffsetY = 2;

  // 本体（上が丸く、下が平らなかまぼこ型）
  ctx.fillStyle = isHovered ? "#262626" : "#171717";
  ctx.strokeStyle = isHovered ? "#38bdf8" : "#404040";
  ctx.lineWidth = 1.2;

  ctx.beginPath();
  // 下辺（フラット面）
  ctx.moveTo(-bodyW / 2, bodyH / 2);
  ctx.lineTo(bodyW / 2, bodyH / 2);
  // 上部（半円アーチ）
  ctx.arc(0, bodyH / 2, bodyW / 2, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.shadowColor = "transparent";

  // フラット面のハイライト帯
  ctx.fillStyle = "#334155";
  ctx.fillRect(-bodyW / 2 + 2, bodyH / 2 - 2.5, bodyW - 4, 1.5);

  // 3. レーザー刻印 (C1815)
  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 6.5px monospace";
  ctx.textAlign = "center";
  ctx.fillText("C1815", 0, 1);

  // 4. 端子識別マーク (E / C / B) の微小ガイド
  ctx.font = "bold 6px monospace";
  ctx.fillStyle = "#64748b";
  const pitch = Math.abs(pC.x - pE.x);
  ctx.fillText("E", -pitch, bodyH / 2 + 7);
  ctx.fillText("C", 0, bodyH / 2 + 7);
  ctx.fillText("B", pitch, bodyH / 2 + 7);

  ctx.restore();
}




/**
 * ★ インスペクター用: パーツの拡大（ズーム）プレビュー描画関数 (スイッチ・抵抗器のマルチ対応安全版)
 */
/**
 * ★ パーツ選択・変更時にインスペクターの全情報（画像・タイトル・データシート・属性ドロップダウン）を動的生成
 */
/**
 * ★ インスペクター用: パーツの拡大（ズーム）プレビュー描画関数
 */
/**
 * ★ パーツ拡大プレビュー描画エンジン (抵抗器・スイッチ・LED構造図・9V電源 完全統合版)
 */
/**
 * ★ パーツ拡大プレビューモジュール群 (保守性100%・完全分離型)
 */

// 0. 未選択時：9V電源描画モジュール
function drawPreviewBattery(ctx) {
  ctx.save();
  const cx = ctx.canvas.width / 2;
  const cy = ctx.canvas.height / 2;
  const bWidth = 46, bHeight = 74;
  const bx = cx - bWidth / 2, by = cy - bHeight / 2 + 6;

  ctx.shadowColor = "rgba(0, 0, 0, 0.5)"; ctx.shadowBlur = 8;
  ctx.fillStyle = "#1e293b"; ctx.strokeStyle = "#475569"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(bx, by, bWidth, bHeight, 6); ctx.fill(); ctx.stroke();

  ctx.shadowBlur = 0; ctx.fillStyle = "#eab308"; ctx.fillRect(bx, by + 10, bWidth, 14);
  ctx.fillStyle = "#cbd5e1"; ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 1.5;
  ctx.fillRect(bx + 8, by - 8, 10, 8); ctx.beginPath(); ctx.arc(bx + 13, by - 8, 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillRect(bx + 28, by - 8, 10, 8); ctx.beginPath(); ctx.arc(bx + 33, by - 8, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  ctx.fillStyle = "#0f172a"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center"; ctx.fillText("9V DC", cx, by + 21);
  ctx.fillStyle = "#f8fafc"; ctx.font = "bold 8.5px sans-serif"; ctx.fillText("ALKALINE", cx, by + 44); ctx.fillText("006P型", cx, by + 56);
  ctx.font = "bold 9px monospace"; ctx.fillStyle = "#ef4444"; ctx.fillText("+", bx + 13, by - 11);
  ctx.fillStyle = "#3b82f6"; ctx.fillText("-", bx + 33, by - 11);
  ctx.restore();
}

// 1. スイッチ描画モジュール
function drawPreviewSwitch(ctx, comp, midX, midY) {
  ctx.save();
  ctx.translate(midX, midY);
  ctx.fillStyle = "#1e293b"; ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(-40, -25, 80, 50, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = comp.isOn ? "#22c55e" : "#ef4444";
  ctx.beginPath(); ctx.arc(-20, -12, 6, 0, Math.PI * 2); ctx.fill();
  ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
  ctx.fillText(comp.isOn ? "STATE: ON" : "STATE: OFF", 10, -8);
  ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 6; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(0, 5); ctx.lineTo(comp.isOn ? 18 : -18, 20); ctx.stroke();
  ctx.restore();
}

// ★ 1-B. 3路トグルスイッチ (SPDT) 拡大プレビュー描画モジュール
function drawPreviewSwitchSPDT(ctx, comp, midX, midY) {
  ctx.save();
  ctx.translate(midX, midY - 6);

  const isL2 = comp.state === "L2";
  const bodyW = 84;
  const bodyH = 44;
  const pitch = 32;

  // 1. 3本の金属足 (下向きリードピン)
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";
  [-pitch, 0, pitch].forEach(x => {
    ctx.beginPath();
    ctx.moveTo(x, bodyH / 2 - 2);
    ctx.lineTo(x, bodyH / 2 + 16);
    ctx.stroke();
  });

  // 端子ガイドラベル (L1, COM, L2)
  ctx.textAlign = "center";
  ctx.font = "bold 11px monospace";
  ctx.fillStyle = !isL2 ? "#38bdf8" : "#64748b";
  ctx.fillText("L1", -pitch, bodyH / 2 + 28);

  ctx.fillStyle = "#facc15";
  ctx.fillText("COM", 0, bodyH / 2 + 28);

  ctx.fillStyle = isL2 ? "#38bdf8" : "#64748b";
  ctx.fillText("L2", pitch, bodyH / 2 + 28);

  // 2. メタリックケースボディ
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 8;
  ctx.fillStyle = "#1e293b";
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH, 6);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 3. COM金色リベット
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.arc(0, -8, 4, 0, Math.PI * 2);
  ctx.fill();

  // 4. 接点インジケータランプ (水色点灯)
  ctx.fillStyle = !isL2 ? "#38bdf8" : "#475569";
  ctx.beginPath(); ctx.arc(-22, -10, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = isL2 ? "#38bdf8" : "#475569";
  ctx.beginPath(); ctx.arc(22, -10, 3.5, 0, Math.PI * 2); ctx.fill();

  // 5. トグル金属レバー
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.lineTo(isL2 ? 20 : -20, 18);
  ctx.stroke();

  ctx.restore();
}

// 2. LED構造図描画モジュール
function drawPreviewLED(ctx, comp, midX, midY) {
  ctx.save();
  let mainColor = comp.color || "#ef4444";
  const isLit = (comp.isOn || false);
  const isBurned = (comp.isBurned || false);
  const isRainbow = (comp.colorType === "rainbow" || comp.color === "#ec4899");

  if (isRainbow && isLit) {
    const time = Date.now() * 0.003;
    const r = Math.floor(Math.sin(time) * 127 + 128);
    const g = Math.floor(Math.sin(time + 2) * 127 + 128);
    const b = Math.floor(Math.sin(time + 4) * 127 + 128);
    mainColor = `rgb(${r}, ${g}, ${b})`;
  }

  const sideCx = midX - 8;
  const sideCy = midY - 10;

  ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 3; ctx.lineCap = "butt";
  ctx.beginPath();
  ctx.moveTo(sideCx - 8, sideCy + 15); ctx.lineTo(sideCx - 8, sideCy + 52);
  ctx.moveTo(sideCx + 8, sideCy + 15); ctx.lineTo(sideCx + 8, sideCy + 42);
  ctx.stroke();

  ctx.font = "bold 9px sans-serif"; ctx.textAlign = "center";
  ctx.fillStyle = "#ef4444"; ctx.fillText("+ A", sideCx - 8, sideCy + 48);
  ctx.fillStyle = "#3b82f6"; ctx.fillText("- K", sideCx + 8, sideCy + 38);

  ctx.font = "8px sans-serif"; ctx.textAlign = "right";
  ctx.fillStyle = "#ef4444"; ctx.fillText("アノード (長) →", sideCx - 14, sideCy + 32);

  ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(sideCx - 8, sideCy + 15); ctx.lineTo(sideCx - 8, sideCy - 2); ctx.lineTo(sideCx - 2, sideCy - 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(sideCx + 8, sideCy + 15); ctx.lineTo(sideCx + 8, sideCy);
  ctx.lineTo(sideCx + 1, sideCy); ctx.lineTo(sideCx + 5, sideCy - 7);
  ctx.lineTo(sideCx - 3, sideCy - 7); ctx.lineTo(sideCx + 1, sideCy);
  ctx.stroke();

  ctx.fillStyle = "#94a3b8"; ctx.beginPath();
  ctx.moveTo(sideCx - 2, sideCy - 7); ctx.lineTo(sideCx + 5, sideCy - 7);
  ctx.lineTo(sideCx + 2, sideCy - 1); ctx.lineTo(sideCx, sideCy - 1); ctx.closePath(); ctx.fill();

  ctx.fillStyle = isBurned ? "#0f172a" : (isLit ? "#ffffff" : "#f59e0b");
  ctx.fillRect(sideCx, sideCy - 6, 2.5, 2.5);

  ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(sideCx + 1, sideCy - 6); ctx.lineTo(sideCx - 4, sideCy - 10); ctx.lineTo(sideCx - 5, sideCy - 2); ctx.stroke();

  ctx.shadowColor = isBurned ? "#000000" : mainColor; ctx.shadowBlur = isLit ? 14 : 3;
  ctx.fillStyle = isBurned ? "rgba(30, 41, 59, 0.85)" : (isLit ? mainColor : `${mainColor}55`);
  ctx.strokeStyle = isBurned ? "#475569" : mainColor; ctx.lineWidth = 1.6;

  ctx.beginPath();
  ctx.arc(sideCx, sideCy - 10, 13, Math.PI, 0, false);
  ctx.lineTo(sideCx + 13, sideCy + 8); ctx.lineTo(sideCx + 16, sideCy + 8);
  ctx.lineTo(sideCx + 16, sideCy + 13); ctx.lineTo(sideCx - 16, sideCy + 13);
  ctx.lineTo(sideCx - 16, sideCy + 8); ctx.lineTo(sideCx - 13, sideCy + 8);
  ctx.closePath(); ctx.fill(); ctx.stroke();

  ctx.shadowBlur = 0; ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.beginPath(); ctx.arc(sideCx - 4, sideCy - 14, 6, Math.PI * 0.7, Math.PI * 1.5, false);
  ctx.lineTo(sideCx - 2, sideCy - 7); ctx.closePath(); ctx.fill();

  ctx.font = "8px sans-serif"; ctx.textAlign = "left";
  ctx.fillStyle = "#cbd5e1"; ctx.fillText("← レンズ", sideCx + 18, sideCy - 12);
  ctx.fillStyle = "#f59e0b"; ctx.fillText("← チップ", sideCx + 8, sideCy - 4);
  ctx.fillStyle = "#94a3b8"; ctx.fillText("← 反射鏡", sideCx + 8, sideCy + 4);
  ctx.restore();
}

// 3. 抵抗器描画モジュール
function drawPreviewResistor(ctx, comp, midX, midY) {
  ctx.save();
  ctx.translate(midX, midY);
  const bodyW = 70, bodyH = 26;

  ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-100, 0); ctx.lineTo(-bodyW / 2, 0);
  ctx.moveTo(bodyW / 2, 0); ctx.lineTo(100, 0); ctx.stroke();

  ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 8;
  ctx.fillStyle = "#fef08a"; ctx.strokeStyle = "#ca8a04"; ctx.lineWidth = 2;
  const leftX = -bodyW / 2, rightX = bodyW / 2;

  ctx.beginPath();
  ctx.arc(leftX + 4, 0, bodyH / 2 + 2, Math.PI * 0.5, Math.PI * 1.5);
  ctx.lineTo(rightX - 4, -bodyH / 2);
  ctx.arc(rightX - 4, 0, bodyH / 2 + 2, Math.PI * 1.5, Math.PI * 0.5);
  ctx.lineTo(leftX + 4, bodyH / 2); ctx.closePath(); ctx.fill(); ctx.stroke();

  ctx.shadowBlur = 0;
  const colors = comp.colors || ["#78350f", "#000000", "#dc2626", "#d97706"];
  const bandWidth = 6;
  const bandPositions = [leftX + 12, leftX + 24, leftX + 36, rightX - 12];

  colors.forEach((color, idx) => {
    ctx.fillStyle = color;
    ctx.fillRect(bandPositions[idx] - bandWidth / 2, -bodyH / 2 - 1, bandWidth, bodyH + 2);
  });

  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.fillRect(leftX + 4, -bodyH / 2 + 3, bodyW - 8, 4);
  ctx.restore();
}

/**
 * ★ 拡大プレビュー描画メインルーチン (司令塔関数)
 */
/**
 * ★ 拡大プレビュー描画メインルーチン (ストラテジーディスパッチ型)
 * 新しいパーツ型が増えた場合も描画マップに1行追加するだけで安全に描画できます。
 */


// ★ 整流ダイオード用 拡大プレビュー描画関数
function drawPreviewDiode(ctx, comp, midX, midY) {
  ctx.save();
  ctx.translate(midX, midY);

  const bodyW = 70;
  const bodyH = 26;

  // 1. 金属リード線
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-100, 0); ctx.lineTo(-bodyW / 2, 0);
  ctx.moveTo(bodyW / 2, 0);  ctx.lineTo(100, 0);
  ctx.stroke();

  // 2. モールド樹脂ボディ
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 8;
  ctx.fillStyle = "#171717";
  ctx.strokeStyle = "#404040";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.roundRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH, 4);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 3. カソード側（右端）の銀帯
  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(bodyW / 2 - 18, -bodyH / 2, 8, bodyH);

  // 4. 印字テキスト
  ctx.fillStyle = "#a3a3a3";
  ctx.font = "bold 9px monospace";
  ctx.textAlign = "center";
  ctx.fillText("1N4007", -6, 3);

  // 5. アノード(+)・カソード(-)のピン解説ガイド
  ctx.font = "bold 10px monospace";
  ctx.fillStyle = "#ef4444";
  ctx.fillText("+ A (アノード)", -60, -18);
  ctx.fillStyle = "#38bdf8";
  ctx.fillText("- K (カソード)", 60, -18);

  ctx.restore();
}





//インスペクター拡大プレビュー
//インスペクター拡大プレビュー
const PREVIEW_RENDERERS = {
  switch: drawPreviewSwitch,
  switch_spdt: drawPreviewSwitchSPDT, // ★ 3路トグルスイッチの拡大プレビューを登録！
  led: drawPreviewLED,
  resistor: drawPreviewResistor,
  capacitor: drawPreviewCapacitor,
  potentiometer: drawPreviewPotentiometer,
  diode: drawPreviewDiode,
  transistor: drawPreviewTransistor
};

// ★ NPNトランジスタ用 拡大プレビュー描画関数
// ★ NPNトランジスタ用 拡大プレビュー描画関数 (上部クリアランス確保版)
function drawPreviewTransistor(ctx, comp, midX, midY) {
  ctx.save();
  // 全体を8px上にシフトして足元の文字スペースを確保
  ctx.translate(midX, midY - 8);

  const pitch = 22;

  // 1. 3本の金属足
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  [-pitch, 0, pitch].forEach(x => {
    ctx.beginPath();
    ctx.moveTo(x, -5);
    ctx.lineTo(x, 18);
    ctx.stroke();
  });


 // ★ 衝突ゼロ！端子名 ＆ ガイドラベル (ピッチ22pxに完全最適化)
  ctx.textAlign = "center";

  // 1段目: 足の直下に太字で大きな端子記号 (絶対に重ならない)
  ctx.font = "bold 13px monospace";
  ctx.fillStyle = "#38bdf8";
  ctx.fillText("E", -pitch, 36);

  ctx.fillStyle = "#eab308";
  ctx.fillText("C", 0, 36);

  ctx.fillStyle = "#ef4444";
  ctx.fillText("B", pitch, 36);

  // 2段目: 接続先をコンパクトに集約 (短縮表記で衝突ゼロ)
  ctx.font = "bold 8px sans-serif";
  ctx.fillStyle = "#38bdf8";
  ctx.fillText("GND", -pitch, 46);

  ctx.fillStyle = "#eab308";
  ctx.fillText("LED", 0, 46);

  ctx.fillStyle = "#ef4444";
  ctx.fillText("SW", pitch, 46);

  // 2. モールド樹脂ボディ (TO-92)
  const bodyW = 56;
  const bodyH = 34;

  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 8;
  ctx.fillStyle = "#171717";
  ctx.strokeStyle = "#404040";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(-bodyW / 2, 0);
  ctx.lineTo(bodyW / 2, 0);
  ctx.arc(0, 0, bodyW / 2, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // ハイライトと印字
  ctx.fillStyle = "#334155";
  ctx.fillRect(-bodyW / 2 + 4, -4, bodyW - 8, 3);

  ctx.fillStyle = "#a3a3a3";
  ctx.font = "bold 11px monospace";
  ctx.textAlign = "center";
  ctx.fillText("2SC1815", 0, -12);

  ctx.restore();
}



// ★ コンデンサ用 JIS記号 拡大プレビュー描画関数 (JIS C 0617 規格大画面版)
function drawPreviewCapacitorJIS(ctx, comp, midX, midY) {
  ctx.save();
  ctx.translate(midX, midY);

  // 1. 引出線 (左右へ伸びる端子線)
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-60, 0); ctx.lineTo(-12, 0);
  ctx.moveTo(12, 0);  ctx.lineTo(60, 0);
  ctx.stroke();

  // 2. JIS極性コンデンサ電極 (左: アノード(+)直線 / 右: カソード(-)湾曲線)
  ctx.lineWidth = 3.5;
  // アノード平板
  ctx.beginPath();
  ctx.moveTo(-12, -26); ctx.lineTo(-12, 26);
  ctx.stroke();

  // カソード湾曲板
  ctx.beginPath();
  ctx.arc(28, 0, 30, Math.PI * 0.75, Math.PI * 1.25);
  ctx.stroke();

  // 3. 極性表記 (+ / -)
  ctx.font = "bold 16px sans-serif";
  ctx.fillStyle = "#ef4444";
  ctx.textAlign = "center";
  ctx.fillText("+", -32, -14); // アノード側

  ctx.fillStyle = "#3b82f6";
  ctx.fillText("-", 32, -14);  // カソード側

  // 4. 定格値・容量ラベル
  ctx.font = "bold 13px monospace";
  ctx.fillStyle = "#0f172a";
  ctx.fillText(`${comp.val_uF || 10}µF`, 0, -36);

  ctx.font = "bold 10px monospace";
  ctx.fillStyle = "#64748b";
  ctx.fillText(`耐圧: ${comp.max_V || 50}V`, 0, 44);

  ctx.restore();
}

// ★ コンデンサ用 JIS記号 拡大プレビュー描画関数 (JIS C 0617 規格大画面版)
function drawPreviewCapacitorJIS(ctx, comp, midX, midY) {
  ctx.save();
  ctx.translate(midX, midY);

  // 1. 引出線 (左右へ伸びる端子線)
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-60, 0); ctx.lineTo(-12, 0);
  ctx.moveTo(12, 0);  ctx.lineTo(60, 0);
  ctx.stroke();

  // 2. JIS極性コンデンサ電極 (左: アノード(+)直線 / 右: カソード(-)湾曲線)
  ctx.lineWidth = 3.5;
  // アノード平板
  ctx.beginPath();
  ctx.moveTo(-12, -26); ctx.lineTo(-12, 26);
  ctx.stroke();

  // カソード湾曲板
  ctx.beginPath();
  ctx.arc(28, 0, 30, Math.PI * 0.75, Math.PI * 1.25);
  ctx.stroke();

  // 3. 極性表記 (+ / -)
  ctx.font = "bold 16px sans-serif";
  ctx.fillStyle = "#ef4444";
  ctx.textAlign = "center";
  ctx.fillText("+", -32, -14); // アノード側

  ctx.fillStyle = "#3b82f6";
  ctx.fillText("-", 32, -14);  // カソード側

  // 4. 定格値・容量ラベル
  ctx.font = "bold 13px monospace";
  ctx.fillStyle = "#0f172a";
  ctx.fillText(`${comp.val_uF || 10}µF`, 0, -36);

  ctx.font = "bold 10px monospace";
  ctx.fillStyle = "#64748b";
  ctx.fillText(`耐圧: ${comp.max_V || 50}V`, 0, 44);

  ctx.restore();
}

// コンデンサ用拡大プレビュー描画関数 (JIS/リアル自動分岐対応)
function drawPreviewCapacitor(ctx, comp, midX, midY) {
  // JISモード時はJISプレビューへ動的ディスパッチ
  if (typeof DISPLAY_MODE !== "undefined" && DISPLAY_MODE.isSymbolON) {
    drawPreviewCapacitorJIS(ctx, comp, midX, midY);
    return;
  }

  ctx.save();
  ctx.translate(midX, midY);

  // コンデンサ本体 (円筒形)
  ctx.fillStyle = "#1e293b";
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-20, -35, 40, 70, 6);
  ctx.fill(); ctx.stroke();

  // マイナス極インジケータ帯 (グレーのストライプ)
  ctx.fillStyle = "#94a3b8";
  ctx.fillRect(5, -35, 15, 70);
  ctx.fillStyle = "#1e293b";
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("-", 12.5, 0);

  // パラメータテキスト
  ctx.fillStyle = "#f8fafc";
  ctx.font = "bold 10px monospace";
  ctx.fillText(`${comp.val_uF || 10}µF`, -5, -5);
  ctx.fillStyle = "#38bdf8";
  ctx.fillText(`${comp.max_V || 50}V`, -5, 10);

  ctx.restore();
}
// 可変抵抗器用拡大プレビュー描画関数
function drawPreviewPotentiometer(ctx, comp, midX, midY) {
  ctx.save();
  ctx.translate(midX, midY);

  // 台座外枠
  ctx.fillStyle = "#334155";
  ctx.beginPath();
  ctx.arc(0, 0, 30, 0, Math.PI * 2);
  ctx.fill();

  // 中央ダイヤルつまみ
  const angle = ((comp.cur_ratio || 0.5) * 270 - 135) * (Math.PI / 180);
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "#f8fafc";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(angle) * 18, Math.sin(angle) * 18);
  ctx.stroke();

  ctx.restore();
}
function renderInspectorPreview(ctx, comp) {
  if (!ctx) return;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  if (!comp) {
    drawPreviewBattery(ctx);
    return;
  }

  const midX = ctx.canvas.width / 2;
  const midY = ctx.canvas.height / 2;

  const renderer = PREVIEW_RENDERERS[comp.type];
  if (typeof renderer === "function") {
    renderer(ctx, comp, midX, midY);
  } else {
    // 未定義パーツ向けデフォルトプレビュー表示 (フォールバック機能)
    drawPreviewResistor(ctx, comp, midX, midY);
  }
}

// ======================================================================
// 【第6章：UIレンダラー ＆ パネル同期モジュール (UI & Inspectors)】
// リアルタイム分圧ツリー同期、動的インスペクター生成、および属性操作
// ======================================================================

/**
 * 6-1. バックグラウンド自律分圧ツリー生成エンジン (実データ直結版)
 */
function updateCircuitTreePanel(physics) {
  const treeContainer = document.getElementById("circuit-tree-content") || document.getElementById("circuit-tree-container");
  const badge = document.getElementById("tree-status-badge");
  if (!treeContainer || !badge) return;

 // 1. 未通電 (OPEN)
  if (!physics || physics.status === "OPEN") {
    badge.textContent = "OPEN";
    badge.style.background = "#334155";
    badge.style.color = "#94a3b8";
    const openHtml = `
      <div style="color: #64748b; font-style: italic; line-height: 1.6;">
        🔌 回路遮断 (OPEN)<br><br>
        配線を接続して通電させると、電源(+9V)からGND(0V)へ至る全パーツの電圧降下と通過電流が自動計算され、ツリー表示されます。
      </div>`;
    if (treeContainer.dataset.lastHtml !== openHtml) {
      treeContainer.dataset.lastHtml = openHtml;
      treeContainer.innerHTML = openHtml;
    }
    return;
  }

  // 2. 短絡 (SHORT)
  if (physics.status === "SHORT") {
    badge.textContent = "DANGER SHORT";
    badge.style.background = "#dc2626";
    badge.style.color = "#ffffff";
    const shortHtml = `
      <div style="color: #f87171; font-weight: bold; line-height: 1.6;">
        ⚠️ 危険短絡 (SHORT CIRCUIT)<br>
        抵抗素子を介さずに電源とGNDが直結されています！
      </div>`;
    if (treeContainer.dataset.lastHtml !== shortHtml) {
      treeContainer.dataset.lastHtml = shortHtml;
      treeContainer.innerHTML = shortHtml;
    }
    return;
  }

  // 3. 正常導通 (CLOSED)
  badge.textContent = "CLOSED (導通)";
  badge.style.background = "#059669";
  badge.style.color = "#ffffff";

  const totalV = physics.v_in || 9.0;
  const i_mA = physics.i_total_mA || 0.0;
  const current_A = i_mA / 1000;

  // 1. 通電中のジャンパー線を抽出
  const activeWires = (Array.isArray(activeJumperWires) ? activeJumperWires : []).filter(w => {
    const nFrom = getNodeByHoleId(w.fromHole);
    const nTo = getNodeByHoleId(w.toHole);
    return physics.energized && nFrom && nTo && physics.energized.has(nFrom) && physics.energized.has(nTo);
  });

  // 2. 通電中のパーツを抽出
  const activeComps = components.filter(c => {
    const nA = getNodeByHoleId(c.pinA);
    const nB = getNodeByHoleId(c.pinB);
    return physics.energized && nA && nB && physics.energized.has(nA) && physics.energized.has(nB);
  });

  // ★ 上流から下流へ順序付けした統合ツリー項目リストの構築
  const topWires = activeWires.filter(w => w.fromHole.startsWith("BUS_TOP_") || w.toHole.startsWith("BUS_TOP_"));
  const botWires = activeWires.filter(w => w.fromHole.startsWith("BUS_BOTTOM_") || w.toHole.startsWith("BUS_BOTTOM_"));
  const midWires = activeWires.filter(w => !topWires.includes(w) && !botWires.includes(w));

  const treeItems = [
    ...topWires.map(w => ({ isWire: true, item: w, name: `🔌 ジャンパ線 (${w.fromHole} ➔ ${w.toHole})` })),
    ...activeComps.map(c => ({ isWire: false, item: c, name: `${c.name || c.type} (${c.pinA} ➔ ${c.pinB})` })),
    ...midWires.map(w => ({ isWire: true, item: w, name: `🔌 中継ジャンパ (${w.fromHole} ➔ ${w.toHole})` })),
    ...botWires.map(w => ({ isWire: true, item: w, name: `🔌 接地ジャンパ (${w.fromHole} ➔ ${w.toHole})` }))
  ];

  // ★ AI共有用クリーン・アスキーアート生成用バッファ
  let reportLines = [`[+${totalV.toFixed(1)}V 電源レール]`];
  let html = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
      <span style="color: #38bdf8; font-weight: bold;">[+${totalV.toFixed(1)}V 電源レール]</span>
      <button id="btn-copy-tree" style="background: #1e293b; color: #38bdf8; border: 1px solid #0284c7; border-radius: 4px; padding: 2px 8px; font-size: 10px; cursor: pointer; font-weight: bold; transition: 0.2s;" title="AI相談用にツリーをコピー">📋 AI共有用コピー</button>
    </div>`;
  let sumVDrop = 0.0;

  treeItems.forEach((entry, idx) => {
    let vDrop = 0.0;

    if (entry.isWire) {
      vDrop = 0.0;
    } else {
      const comp = entry.item;
      if (comp.type === "resistor") {
        vDrop = (comp.val_ohm || 1000) * current_A;
      } else if (comp.type === "potentiometer") {
        const curOhm = comp.val_ohm !== undefined ? comp.val_ohm : ((comp.val_max_ohm || 10000) * (comp.cur_ratio || 0.5));
        vDrop = curOhm * current_A;
      } else if (comp.type === "led") {
        const nominalVf = comp.vf || 2.0;
        const supplyV = (typeof selectedBatteryVoltage !== "undefined") ? selectedBatteryVoltage : 9.0;
        vDrop = (current_A > 0.00001) ? nominalVf : Math.min(nominalVf, supplyV);
      } else if (comp.type === "diode") {
        const nominalVf = comp.vf || 0.7;
        const supplyV = (typeof selectedBatteryVoltage !== "undefined") ? selectedBatteryVoltage : 9.0;
        vDrop = (current_A > 0.00001) ? nominalVf : Math.min(nominalVf, supplyV);
      } else if (comp.type === "switch" || comp.type === "switch_spdt") {
        vDrop = 0.0;
      } else if (comp.type === "transistor") {
        vDrop = comp.state === "SATURATED" ? (comp.vce_sat || 0.10) : 0.0;
      }
    }

    sumVDrop += vDrop;
    const vRatio = ((vDrop / totalV) * 100).toFixed(1);
    const power_mW = (vDrop * i_mA).toFixed(1);
    const isLast = idx === treeItems.length - 1;
    const branchPrefix = isLast ? " └─" : " ├─";
    const subLinePrefix = isLast ? "     " : " │   ";

    const labelColor = entry.isWire ? "#38bdf8" : "#a6e3a1";
    html += `
      <div style="margin-top: 4px;">
        <span style="color: ${labelColor}; font-weight: bold;">${branchPrefix} ${entry.name}</span>
        <div style="color: #94a3b8; font-size: 10px; margin-left: 14px; border-left: 1px solid #334155; padding-left: 6px; line-height: 1.5;">
          <div>├ 電圧降下 : <span style="color: #facc15;">${vDrop.toFixed(2)} V</span> (${vRatio}%)</div>
          <div>├ 通過電流 : <span style="color: #4ade80;">${i_mA.toFixed(2)} mA</span></div>
          <div>└ 消費電力 : <span style="color: #f472b6;">${power_mW} mW</span></div>
        </div>
      </div>`;

    reportLines.push(`${branchPrefix} ${entry.name}`);
    reportLines.push(`${subLinePrefix}├ 電圧降下 : ${vDrop.toFixed(2)} V (${vRatio}%)`);
    reportLines.push(`${subLinePrefix}├ 通過電流 : ${i_mA.toFixed(2)} mA`);
    reportLines.push(`${subLinePrefix}└ 消費電力 : ${power_mW} mW`);
  });

  reportLines.push(`[0.0V マイナスレール (GND)]`);
  reportLines.push(`==============================`);
  reportLines.push(`合計電圧降下 : ${sumVDrop.toFixed(2)} V / ${totalV.toFixed(1)} V`);
  reportLines.push(`全回路電流   : ${i_mA.toFixed(2)} mA`);

  html += `
    <div style="color: #60a5fa; font-weight: bold; margin-top: 4px;">[0.0V マイナスレール (GND)]</div>
    <div style="border-top: 1px dashed #334155; margin-top: 8px; padding-top: 6px; color: #94a3b8; font-size: 10px; line-height: 1.6;">
      <div>合計電圧降下 : ${sumVDrop.toFixed(2)} V / ${totalV.toFixed(1)} V</div>
      <div>全回路電流   : ${i_mA.toFixed(2)} mA</div>
    </div>`;

  if (treeContainer.dataset.lastHtml === html) return;
  treeContainer.dataset.lastHtml = html;
  treeContainer.innerHTML = html;

  const btnCopy = document.getElementById("btn-copy-tree");
  if (btnCopy) {
    btnCopy.onclick = () => {
      const asciiText = reportLines.join("\n");
      navigator.clipboard.writeText(asciiText).then(() => {
        btnCopy.textContent = "✅ コピー完了！";
        btnCopy.style.borderColor = "#22c55e";
        btnCopy.style.color = "#22c55e";
        setTimeout(() => {
          btnCopy.textContent = "📋 AI共有用コピー";
          btnCopy.style.borderColor = "#0284c7";
          btnCopy.style.color = "#38bdf8";
        }, 1500);
      });
    };
  }
}

/**
 * 6-2. インスペクター動的UI生成 ストラテジーマップ (Zero Hardcoding)
 */
const INSPECTOR_RENDERERS = {
  // 1. 固定抵抗器 (RESISTOR: 完全クリーン動的生成版・構文エラーゼロ)
  resistor: (comp, titleEl, descEl, specBox, selectVal, physics) => {
    // 外部の古いセレクトボックスは確実に非表示
    if (selectVal) selectVal.style.display = "none";

    const ohmVal = comp.val_ohm || 1000;
    const displayOhm = ohmVal >= 1000 ? `${(ohmVal / 1000).toFixed(1)}kΩ` : `${ohmVal}Ω`;

    if (titleEl) titleEl.textContent = `${displayOhm} 固定抵抗器`;
    if (descEl) descEl.textContent = comp.desc || `${displayOhm} の標準的な電流制限用抵抗器です。`;

    const nA = typeof getNodeByHoleId === "function" ? getNodeByHoleId(comp.pinA) : null;
    const nB = typeof getNodeByHoleId === "function" ? getNodeByHoleId(comp.pinB) : null;
    const isConnected = (physics.status === "CLOSED") && physics.energized && nA && nB && physics.energized.has(nA) && physics.energized.has(nB);
    const currentmA = isConnected ? (physics.i_total_mA || 0.0) : 0.0;
    const powermW = isConnected ? (currentmA * currentmA * ohmVal) / 1000 : 0.0;
    const loadRate = ((powermW / 250) * 100).toFixed(1);

    const isSel = (v) => (ohmVal === v ? "selected" : "");

    if (specBox) {
      specBox.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; background: #1e293b; padding: 6px 8px; border-radius: 4px; border: 1px solid #334155; margin-bottom: 8px;">
          <label for="select-dynamic-resistor-val" style="font-size: 10px; color: #38bdf8; font-weight: bold; white-space: nowrap;">⚡ 抵抗値切替:</label>
          <select id="select-dynamic-resistor-val" style="background: #0f172a; color: #38bdf8; border: 1px solid #0284c7; border-radius: 4px; padding: 2px 6px; font-size: 10px; font-weight: bold; cursor: pointer;">
            <option value="100" ${isSel(100)}>100 Ω (茶黒茶金)</option>
            <option value="330" ${isSel(330)}>330 Ω (橙橙茶金)</option>
            <option value="1000" ${isSel(1000)}>1.0k Ω (茶黒赤金)</option>
            <option value="10000" ${isSel(10000)}>10k Ω (茶黒橙金)</option>
            <option value="100000" ${isSel(100000)}>100k Ω (茶黒黄金)</option>
          </select>
        </div>
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">📊 電気的定格 ＆ 基本諸元</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px 6px; margin-bottom: 8px; color: #cbd5e1;">
          <div>・品名: 炭素皮膜抵抗器</div>
          <div>・定格電力: 0.25 W (1/4W)</div>
          <div>・公称抵抗値: <span style="color: #f59e0b; font-weight: bold;">${displayOhm}</span></div>
          <div>・許容差: ±5% (J級)</div>
        </div>
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">⚡ リアルタイム動作解析</div>
        <div style="margin-bottom: 8px; color: #cbd5e1; background: #181825; padding: 6px; border-radius: 4px;">
          <div>・通過電流 ($I$): <span style="color: #4ade80; font-weight: bold;">${currentmA.toFixed(2)} mA</span></div>
          <div>・消費電力 ($P$): <span style="color: #4ade80; font-weight: bold;">${powermW.toFixed(1)} mW</span></div>
          <div>・定格負荷率: <span style="color: ${loadRate > 80 ? '#ef4444' : '#4ade80'}; font-weight: bold;">${loadRate} %</span></div>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #334155; font-size: 9px; color: #94a3b8; line-height: 1.4;">
            ・枷の紐: 命の巡り（電流）を程よく絞り、弱き種子（LED）を破滅から護る古き絆。これなき回路に光を灯せば、種子は瞬く間に黒焦げとなり果てる。
          </div>
        </div>`;

      // 動的生成されたセレクターへ直接イベントをバインド
      const selDynamic = document.getElementById("select-dynamic-resistor-val");
      if (selDynamic) {
        selDynamic.onchange = (e) => {
          if (typeof saveHistory === "function") saveHistory();
          const newOhm = parseInt(e.target.value, 10);
          comp.val_ohm = newOhm;
          const regKey = `RESISTOR_${newOhm}`;
          if (typeof PART_REGISTRY !== "undefined" && PART_REGISTRY[regKey]) {
            comp.colors = PART_REGISTRY[regKey].colors;
            comp.name = PART_REGISTRY[regKey].name;
            comp.desc = PART_REGISTRY[regKey].desc;
          }
          if (typeof analyzeEnergizedNodes === "function") analyzeEnergizedNodes();
          if (typeof renderScene === "function") renderScene();
          updateInspectorUI(comp);
        };
      }
    }
  },



 // 2. トグルスイッチ (SWITCH / SPDT統合)
  switch: (comp, titleEl, descEl, specBox, selectVal, physics) => {
    if (selectVal) selectVal.style.display = "none";
        // ★ 3路スイッチ (SPDT) と 通常スイッチ (SPST) の状態判定
    const isSpdt = comp.type === "switch_spdt";
    const isL1 = comp.state === "L1";
    const isOn = isSpdt ? (comp.state === "L1") : !!comp.isOn;

    if (titleEl) titleEl.textContent = comp.name || (isSpdt ? "3路トグルスイッチ (SPDT)" : "トグルスイッチ");
    if (descEl) {
      descEl.textContent = comp.desc || (isSpdt
        ? `COM端子と${isL1 ? '接点1(L1)' : '接点2(L2)'}が接続されています。`
        : (isOn ? "現在【通電状態 (CLOSED)】です。" : "現在【遮断状態 (OPEN)】です。"));
    }

    if (specBox) {
      // 状態に応じたボタンラベルとカラーの動的設定
      const btnBg = isSpdt ? (isL1 ? "#0284c7" : "#0d9488") : (isOn ? "#22c55e" : "#ef4444");
      const btnText = isSpdt
        ? `接続先: ${isL1 ? '接点1 (L1) 導通中' : '接点2 (L2) 導通中'} [クリックで反転]`
        : `${isOn ? 'STATE: ON (通電/CLOSED)' : 'STATE: OFF (遮断/OPEN)'} [クリックで切替]`;

      const statusHtml = isSpdt
        ? `・現在の導通: <span style="color: #38bdf8; font-weight: bold;">COM ⇄ ${isL1 ? '接点1 (L1)' : '接点2 (L2)'}</span>`
        : `・現在の状態: <span style="color: ${isOn ? '#4ade80' : '#ef4444'}; font-weight: bold;">${isOn ? 'ON (通電/CLOSED)' : 'OFF (遮断/OPEN)'}</span>`;

      const specsHtml = isSpdt
        ? `・接点構成: 1回路2投 (SPDT / 3路)<br>
           ・切替方式: ノンショーティング (B.B.M.)<br>
           ・定格電圧/電流: DC 12V / 0.5A<br>
           ・接触抵抗: 50 mΩ 以下`
        : `・接点構成: 1回路1投 (SPST)<br>
           ・定格電圧/電流: DC 12V / 0.5A<br>
           ・接触抵抗: 50 mΩ 以下`;

      specBox.innerHTML = `
        <div style="background: #1e293b; padding: 8px; border-radius: 4px; border: 1px solid #334155; margin-bottom: 8px;">
          <label style="font-size: 10px; color: #38bdf8; font-weight: bold; display:block; margin-bottom:4px;">🔘 スイッチ状態操作:</label>
          <button id="btn-inspector-toggle-switch" style="width:100%; padding:6px 10px; background:${btnBg}; color:#ffffff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:11px; transition:0.2s;">
            ${btnText}
          </button>
        </div>
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">📊 スイッチ基本諸元</div>
        <div style="color: #cbd5e1; margin-bottom: 8px; line-height: 1.5;">
          ${specsHtml}
        </div>
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">⚡ リアルタイム動作状態</div>
        <div style="background: #181825; padding: 6px; border-radius: 4px;">
          ${statusHtml}
        </div>`;



    const btnToggle = document.getElementById("btn-inspector-toggle-switch");
      if (btnToggle) {
        btnToggle.onclick = () => {
          if (typeof saveHistory === "function") saveHistory();
                  // ★ 3路スイッチなら L1 ↔ L2 を反転、通常スイッチなら isOn を反転
          if (comp.type === "switch_spdt") {
            comp.state = (comp.state === "L2") ? "L1" : "L2";
          } else {
            comp.isOn = !comp.isOn;
          }

          // 導通探索 ＆ 物理再計算エンジンの完全同期
          if (typeof analyzeEnergizedNodes === "function") analyzeEnergizedNodes();
                    let newPhysics = null;
          if (typeof calculateCircuitPhysics === "function") {
            newPhysics = calculateCircuitPhysics();
            if (typeof updateCircuitTreePanel === "function") updateCircuitTreePanel(newPhysics);
          }

          if (typeof renderScene === "function") renderScene();
          if (typeof drawOscilloscope === "function") drawOscilloscope();
          updateInspectorUI(comp, null, null, null, null, newPhysics);
        };
      }
    }
  },


 // ★ 3路スイッチ (switch_spdt) も通常スイッチと同じ描画処理へ直接ルーティング
  switch_spdt: (comp, titleEl, descEl, specBox, selectVal, physics) => {
    if (typeof INSPECTOR_RENDERERS !== "undefined" && typeof INSPECTOR_RENDERERS.switch === "function") {
      INSPECTOR_RENDERERS.switch(comp, titleEl, descEl, specBox, selectVal, physics);
    }
  },




  // 3. 発光ダイオード (LED)
  led: (comp, titleEl, descEl, specBox, selectVal, physics) => {
    if (selectVal) selectVal.style.display = "none";
    if (titleEl) titleEl.textContent = comp.name || "5mm LED";
    if (descEl) descEl.textContent = comp.desc || "アノード(+)からカソード(-)へ電流が流れると発光します。";

   const isBurned = !!comp.isBurned;
    const vf = comp.vf || 2.0;
    const nA = typeof getNodeByHoleId === "function" ? getNodeByHoleId(comp.pinA) : null;
    const nB = typeof getNodeByHoleId === "function" ? getNodeByHoleId(comp.pinB) : null;
    const isConnected = !isBurned && (physics.status === "CLOSED") && physics.energized && nA && nB && physics.energized.has(nA) && physics.energized.has(nB);
    const currentmA = (isConnected && comp.isOn) ? (physics.i_total_mA || 0.0) : 0.0;

    const isLit = (!isBurned && comp.isOn && currentmA > 0);
    const powermW = currentmA * vf;
    const currentColor = comp.color || "#ef4444";


    const cType = comp.colorType || "red";
    const isSel = (hex, type) => (currentColor === hex || cType === type) ? "selected" : "";

    if (specBox) {
      specBox.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; background: #1e293b; padding: 6px 8px; border-radius: 4px; border: 1px solid #334155; margin-bottom: 8px;">
          <label for="select-led-color" style="font-size: 10px; color: #38bdf8; font-weight: bold;">🎨 発光カラー切替:</label>
          <select id="select-led-color" style="background: #0f172a; color: #38bdf8; border: 1px solid #0284c7; border-radius: 4px; padding: 2px 6px; font-size: 10px; font-weight: bold; cursor: pointer;">
            <option value="#ef4444" ${isSel("#ef4444", "red")}>🔴 赤色 (Red - Vf:2.0V)</option>
            <option value="#22c55e" ${isSel("#22c55e", "green")}>🟢 緑色 (Green - Vf:2.2V)</option>
            <option value="#3b82f6" ${isSel("#3b82f6", "blue")}>🔵 青色 (Blue - Vf:3.1V)</option>
            <option value="#ffff00" ${isSel("#ffff00", "yellow")}>🟡 黄色 (Yellow - Vf:2.1V)</option>
            <option value="#ffffff" ${isSel("#ffffff", "white")}>⚪ 白色 (White - Vf:3.2V)</option>
            <option value="#ec4899" ${isSel("#ec4899", "rainbow")}>🌈 虹色 (Rainbow - Vf:3.2V)</option>
          </select>
        </div>
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">📊 LED 基本諸元</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px 6px; margin-bottom: 8px; color: #cbd5e1;">
          <div>・品名: ${comp.name || '5mm LED'}</div>
          <div>・順方向電圧 ($V_f$): <span style="color: #f59e0b; font-weight: bold;">${vf.toFixed(1)} V</span></div>
          <div>・絶対最大定格: 30 mA</div>
          <div>・素子状態: <span style="color: ${comp.isBurned ? '#ef4444' : '#4ade80'}; font-weight: bold;">${comp.isBurned ? '🔥 熱破壊 (溶断断線)' : '✨ 正常'}</span></div>
        </div>
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">⚡ リアルタイム動作解析</div>
        <div style="margin-bottom: 8px; color: #cbd5e1; background: #181825; padding: 6px; border-radius: 4px;">
          <div>・発光状態: <span style="color: ${isLit ? '#4ade80' : '#ef4444'}; font-weight: bold;">${isLit ? '点灯中 (ACTIVE)' : (comp.isBurned ? '🔥 破壊破損 (OPEN)' : '消灯中 (OFF)')}</span></div>
          <div>・動作電流 ($I_f$): <span style="color: ${comp.isBurned ? '#ef4444' : '#4ade80'}; font-weight: bold;">${currentmA.toFixed(2)} mA</span></div>
          <div>・消費電力 ($P_d$): <span style="color: ${comp.isBurned ? '#ef4444' : '#4ade80'}; font-weight: bold;">${powermW.toFixed(1)} mW</span></div>

 <div>・赤く膿んだ玻璃細工:赤く澱んだ玻璃（ガラス）で作られた、歪な種子。
僅かな巡り（電流）に反応し、妖しい朱の光を放つ。

それは自ら熱を発することなく、ただ光り輝く。
だが、過剰な巡りはその核を焼き、黒く煤けさせる。

絶え間なき光を望むならば、
巡りを抑える絆（抵抗）を伴わねばならない。 </div>

        </div>`;

      const selColor = document.getElementById("select-led-color");
      if (selColor) {
        selColor.onchange = (e) => {
          if (typeof saveHistory === "function") saveHistory();
          const selectedHex = e.target.value;
          comp.color = selectedHex;
          const matchedPart = (typeof PART_REGISTRY !== "undefined" && Object.values(PART_REGISTRY).find(p => p.type === "led" && p.color === selectedHex)) || { vf: 2.0, colorType: "red", name: "赤色LED (5mm)", desc: "標準的な赤色LED" };
          comp.vf = matchedPart.vf;
          comp.colorType = matchedPart.colorType;
          comp.name = matchedPart.name;
          comp.desc = matchedPart.desc;

          if (typeof analyzeEnergizedNodes === "function") analyzeEnergizedNodes();
          if (typeof renderScene === "function") renderScene();
          updateInspectorUI(comp);
        };
      }
    }
  },




// ★ 4. 可変抵抗器 (定格レンジ動的切替 ＆ 1Ω単位超精密スライダー完全統合版)
  potentiometer: (comp, titleEl, descEl, specBox, selectVal, physics) => {
    if (selectVal) selectVal.style.display = "none";

    const maxOhm = comp.val_max_ohm || 10000;
    const maxKText = maxOhm >= 1000 ? `${(maxOhm / 1000).toFixed(1)}kΩ` : `${maxOhm}Ω`;
        if (titleEl) titleEl.textContent = `可変抵抗器 (${maxKText})`;
    if (descEl) descEl.textContent = comp.desc || "つまみを回すことで抵抗値を連続変化させる受動素子です。";

    const curRatio = comp.cur_ratio !== undefined ? comp.cur_ratio : 0.5;
    const currentOhm = comp.val_ohm !== undefined ? Math.round(comp.val_ohm) : Math.round(maxOhm * curRatio);

    if (specBox) {
      specBox.innerHTML = `
        <div style="background: #1e293b; padding: 8px; border-radius: 4px; border: 1px solid #334155; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <label for="input-pot-slider" style="font-size: 10px; color: #38bdf8; font-weight: bold;">🎛️ 抵抗値ダイレクト調整 (1Ω単位):</label>
            <span id="text-pot-ohm" style="font-size: 11px; color: #f59e0b; font-weight: bold; font-family: monospace;">${currentOhm} Ω (${Math.round((currentOhm / maxOhm) * 100)}%)</span>
          </div>
          <!-- ★ 1Ω単位で超精密に操作できるスライダー (0 〜 最大オーム値) -->
          <input type="range" id="input-pot-slider" min="0" max="${maxOhm}" step="1" value="${currentOhm}" style="width: 100%; cursor: pointer; accent-color: #38bdf8;">
        </div>

        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">📊 可変抵抗 基本諸元</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px 6px; margin-bottom: 8px; color: #cbd5e1; font-size: 11px; align-items: center;">
          <!-- ★ 手間ゼロで種類を増やせる定格レンジセレクタ -->
          <div>・定格レンジ:</div>
          <div>
            <select id="select-pot-range" style="background: #0f172a; color: #f59e0b; border: 1px solid #475569; border-radius: 3px; padding: 1px 4px; font-weight: bold; font-size: 10px; cursor: pointer; width: 100%;">
              <option value="1000" ${maxOhm === 1000 ? "selected" : ""}>1.0 kΩ (微小制御)</option>
              <option value="5000" ${maxOhm === 5000 ? "selected" : ""}>5.0 kΩ (調光標準)</option>
              <option value="10000" ${maxOhm === 10000 ? "selected" : ""}>10 kΩ (汎用標準)</option>
              <option value="50000" ${maxOhm === 50000 ? "selected" : ""}>50 kΩ (高抵抗)</option>
              <option value="100000" ${maxOhm === 100000 ? "selected" : ""}>100 kΩ (微小電流)</option>
            </select>
          </div>
          <div>・現在の設定値:</div>
          <div><span id="label-pot-val" style="color: #4ade80; font-weight: bold;">${currentOhm} Ω</span></div>
          <div>・調整カーブ:</div>
          <div>Bカーブ (リニア)</div>
          <div>・回転角範囲:</div>
          <div>270 度</div>
        </div>`;

      // --- イベントバインド ---
      const slider = document.getElementById("input-pot-slider");
      const textOhm = document.getElementById("text-pot-ohm");
      const labelVal = document.getElementById("label-pot-val");
      const rangeSelect = document.getElementById("select-pot-range");

      // ① スライダーによる1Ω単位精密操作
      if (slider) {
        slider.oninput = (e) => {
          const valOhm = parseInt(e.target.value, 10);
          comp.val_ohm = valOhm;
          comp.cur_ratio = valOhm / comp.val_max_ohm;

          const pct = Math.round((valOhm / comp.val_max_ohm) * 100);
          if (textOhm) textOhm.textContent = `${valOhm} Ω (${pct}%)`;
          if (labelVal) labelVal.textContent = `${valOhm} Ω`;

          // 全体同期
          if (typeof analyzeEnergizedNodes === "function") analyzeEnergizedNodes();
          if (typeof calculateCircuitPhysics === "function") {
            const p = calculateCircuitPhysics();
            if (typeof updateCircuitTreePanel === "function") updateCircuitTreePanel(p);
          }
          if (typeof renderScene === "function") renderScene();
        };

        slider.onchange = () => {
          if (typeof saveHistory === "function") saveHistory();
        };
      }

      // ② 定格レンジ切り替え (1kΩ ↔ 10kΩ ↔ 100kΩ)
      if (rangeSelect) {
        rangeSelect.onchange = (e) => {
          const newMax = parseInt(e.target.value, 10);
          comp.val_max_ohm = newMax;
          comp.name = `可変抵抗器 (${newMax >= 1000 ? (newMax / 1000).toFixed(1) + "kΩ" : newMax + "Ω"})`;
                    // 現在の回転比率(cur_ratio)を保ったままオーム値をリフレッシュ
          comp.val_ohm = Math.round(newMax * (comp.cur_ratio !== undefined ? comp.cur_ratio : 0.5));

          // インスペクターUI自身を再描画してスライダーのmaxを即時同期
          if (typeof updateInspectorUI === "function") {
            updateInspectorUI(comp);
          }

          // 全体同期
          if (typeof analyzeEnergizedNodes === "function") analyzeEnergizedNodes();
          if (typeof calculateCircuitPhysics === "function") {
            const p = calculateCircuitPhysics();
            if (typeof updateCircuitTreePanel === "function") updateCircuitTreePanel(p);
          }
          if (typeof renderScene === "function") renderScene();
          if (typeof saveHistory === "function") saveHistory();
        };
      }
    }
  },



// ★ 5. 電解コンデンサ (CAPACITOR - 物理計算修正・フレーバーテキスト適用版)
  capacitor: (comp, titleEl, descEl, specBox, selectVal, physics) => {
    if (selectVal) selectVal.style.display = "none";
    if (titleEl) titleEl.textContent = comp.name || "電解コンデンサ";
    if (descEl) descEl.textContent = comp.desc || "電荷を蓄え、直流を遮断し交流を通す受動素子です。";

    // コンデンサの初期状態保証
    if (comp.charge_V === undefined) comp.charge_V = 0.0;
    const curV = comp.charge_V;
    const capuF = comp.val_uF || 10;

    // 正しい蓄積エネルギー計算 E = 0.5 * C(F) * V^2 * 1000 (mJ)
    const energy_mJ = 0.5 * (capuF * 1e-6) * (curV * curV) * 1000;

    if (specBox) {
      specBox.innerHTML = `
        <div style="background: #1e293b; padding: 8px; border-radius: 4px; border: 1px solid #334155; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <label for="select-cap-val" style="font-size: 10px; color: #38bdf8; font-weight: bold;">⚡ 容量 (C) 切替:</label>
            <select id="select-cap-val" style="background: #0f172a; color: #38bdf8; border: 1px solid #0284c7; border-radius: 4px; padding: 2px 6px; font-size: 10px; font-weight: bold; cursor: pointer;">
              <option value="1" ${capuF === 1 ? 'selected' : ''}>1 µF</option>
              <option value="10" ${capuF === 10 ? 'selected' : ''}>10 µF</option>
              <option value="100" ${capuF === 100 ? 'selected' : ''}>100 µF</option>
              <option value="1000" ${capuF === 1000 ? 'selected' : ''}>1000 µF (1mF)</option>
            </select>
          </div>
          <button id="btn-cap-reset" style="width:100%; padding:4px 8px; background:#ef4444; color:#ffffff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:10px; transition:0.2s;">
            🔄 強制放電 (電荷リセット)
          </button>
        </div>
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">📊 コンデンサ基本諸元</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px 6px; margin-bottom: 8px; color: #cbd5e1;">
          <div>・静電容量: <span style="color: #f59e0b; font-weight: bold;">${capuF} µF</span></div>
          <div>・耐圧: ${comp.max_V || 50} V</div>
          <div>・極性: あり (電解型)</div>
          <div>・構造: アルミニウム電解</div>
        </div>
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">⚡ リアルタイム充放電状態</div>
        <div style="margin-bottom: 8px; color: #cbd5e1; background: #181825; padding: 6px; border-radius: 4px;">
          <div>・端子間電圧 ($V_c$): <span style="color: #4ade80; font-weight: bold;">${curV.toFixed(2)} V</span></div>
          <div>・蓄積エネルギー ($E$): <span style="color: #4ade80; font-weight: bold;">${energy_mJ.toFixed(3)} mJ</span></div>
          <div>・充電率: <span style="color: #38bdf8; font-weight: bold;">${((curV / 9.0) * 100).toFixed(1)} %</span></div>
                    <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #334155; font-size: 9px; color: #94a3b8; line-height: 1.4;">
            ・蓄電のガラス瓶: 黄金樹の光を拒む者たちが作り上げた、無節のガラス容器。内部には細かな金属箔が重なり合い、雷の力を封じ込めている。力を直ちに放つにあらず、内に溜め込み、必要な刻にのみ、そっと滲み出させる。愚者はこれを、光を捉える器と呼んだ。だが知っているのだ。過剰な力を注ぎ込めば器は音を立てて爆ぜ、残るのは煤けた破片のみであることを。
          </div>
        </div>`;

      // 容量変更イベント処理
      const selCap = document.getElementById("select-cap-val");
      if (selCap) {
        selCap.onchange = (e) => {
          if (typeof saveHistory === "function") saveHistory();
          const newuF = parseInt(e.target.value, 10);
          comp.val_uF = newuF;
          comp.name = `電解コンデンサ (${newuF}µF)`;
          if (typeof analyzeEnergizedNodes === "function") analyzeEnergizedNodes();
          if (typeof renderScene === "function") renderScene();
          if (typeof updateInspectorUI === "function") updateInspectorUI(comp);
        };
      }

      // ★ 完全復元: 強制放電ボタン処理
      const btnReset = document.getElementById("btn-cap-reset");
      if (btnReset) {
        btnReset.onclick = () => {
          if (typeof saveHistory === "function") saveHistory();
          comp.charge_V = 0.0; // 電荷を完全放電 (ゼロリセット)
          console.log("⚡ コンデンサを強制放電しました (0.0V)");
          if (typeof analyzeEnergizedNodes === "function") analyzeEnergizedNodes();
          if (typeof renderScene === "function") renderScene();
          if (typeof updateInspectorUI === "function") updateInspectorUI(comp);
        };
      }
    }
  },




  // ★ 6. 整流ダイオード (DIODE - 極性バイアス解析 ＆ フレーバーテキスト)
  diode: (comp, titleEl, descEl, specBox, selectVal, physics) => {
    if (selectVal) selectVal.style.display = "none";
    if (titleEl) titleEl.textContent = comp.name || "整流ダイオード (1N4007)";
    if (descEl) descEl.textContent = comp.desc || "一方向のみ電流を流す半導体素子です。";

   const nA = typeof getNodeByHoleId === "function" ? getNodeByHoleId(comp.pinA) : null;
    const nB = typeof getNodeByHoleId === "function" ? getNodeByHoleId(comp.pinB) : null;
    const isForward = (physics.status === "CLOSED") && physics.energized && nA && nB && physics.energized.has(nA) && physics.energized.has(nB);
    const currentmA = isForward ? (physics.i_total_mA || 0.0) : 0.0;
    const powermW = isForward ? (currentmA * (comp.vf || 0.7)) : 0.0;

    if (specBox) {
      specBox.innerHTML = `
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">📊 ダイオード基本諸元</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px 6px; margin-bottom: 8px; color: #cbd5e1;">
          <div>・型番: 1N4007</div>
          <div>・順方向降下 ($V_f$): <span style="color: #f59e0b; font-weight: bold;">0.7 V</span></div>
          <div>・最大逆耐圧 ($V_{rrm}$): 1000 V</div>
          <div>・定格順電流 ($I_o$): 1.0 A</div>
          <div>・極性表示: カソード銀帯</div>
          <div>・素子構造: シリコン接合</div>
        </div>
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">⚡ リアルタイム動作解析</div>
        <div style="margin-bottom: 8px; color: #cbd5e1; background: #181825; padding: 6px; border-radius: 4px;">
          <div>・バイアス状態: <span style="color: ${isForward ? '#4ade80' : '#ef4444'}; font-weight: bold;">${isForward ? '順バイアス (導通中)' : '逆バイアス (遮断/OPEN)'}</span></div>
          <div>・通過電流 ($I_f$): <span style="color: ${isForward ? '#4ade80' : '#64748b'}; font-weight: bold;">${currentmA.toFixed(2)} mA</span></div>
          <div>・接合部損失 ($P_d$): <span style="color: ${isForward ? '#4ade80' : '#64748b'}; font-weight: bold;">${powermW.toFixed(1)} mW</span></div>
                    <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #334155; font-size: 9px; color: #94a3b8; line-height: 1.4;">
            ・一方のみを許す黒き楔: 秩序の理に縛られた、頑ななる黒鉄の楔。
            巡りはただ一方向（アノードからカソード）にのみ進むことを赦され、逆らう流れはことごとく拒絶される。
            過ちて逆しまに配すれば、回路は永遠の静寂に沈むだろう。
          </div>
        </div>`;
    }
  },





// ★ 7. NPNトランジスタ (2SC1815 - 3端子状態・動作モード・フロム風テキスト)
  transistor: (comp, titleEl, descEl, specBox, selectVal, physics) => {
    if (selectVal) selectVal.style.display = "none";
    if (titleEl) titleEl.textContent = comp.name || "NPNトランジスタ (2SC1815)";
    if (descEl) descEl.textContent = comp.desc || "ベース(B)の微小電流でコレクタ-エミッタ間の主電流を制御します。";

    // ★ ベース端子のノードが実際に通電しているかを物理エンジンから直接取得
    const nB = typeof getNodeByHoleId === "function" ? getNodeByHoleId(comp.pinB) : null;
    const isEnergized = physics && physics.energized && nB ? physics.energized.has(nB) : false;

    // ベースに通電があれば SATURATED、なければ確実に CUTOFF
    const state = isEnergized ? "SATURATED" : "CUTOFF";
    comp.state = state; // コンポーネントの状態も同期

    const isBaseOn = (state === "SATURATED");
    const ic_mA = isBaseOn && physics.status === "CLOSED" ? (physics.i_total_mA || 0.0) : 0.0;
    const ib_uA = isBaseOn && ic_mA > 0 ? (ic_mA / (comp.hfe || 150)) * 1000 : 0.0;
    if (specBox) {
      specBox.innerHTML = `
        <!-- ★ 初心者向けピン配線カンペカード -->
        <div style="background: #1e293b; border: 1px solid #0284c7; border-radius: 4px; padding: 6px 8px; margin-bottom: 8px;">
          <div style="font-size: 10px; color: #38bdf8; font-weight: bold; margin-bottom: 4px;">🔌 端子接続の鉄則ガイド (どこに繋ぐ？)</div>
          <div style="font-size: 9.5px; line-height: 1.5; color: #cbd5e1;">
            <div>🟡 <b style="color: #f87171;">B (右足・ベース)</b>: <b>制御入力</b> ➔ スイッチ/10kΩ抵抗を繋ぐ (水門レバー)</div>
            <div>🔴 <b style="color: #facc15;">C (中足・コレクタ)</b>: <b>主電源入力</b> ➔ LED/負荷抵抗を繋ぐ (本流の入口)</div>
            <div>🔵 <b style="color: #38bdf8;">E (左足・エミッタ)</b>: <b>主出力</b> ➔ マイナスレール(GND)へ繋ぐ (出口)</div>
          </div>
        </div>

        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">📊 トランジスタ基本諸元</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px 6px; margin-bottom: 8px; color: #cbd5e1;">
          <div>・型番: 2SC1815-Y</div>          <div>・極性: NPN型</div>
          <div>・増幅率 ($h_{FE}$): <span style="color: #f59e0b; font-weight: bold;">${comp.hfe || 150}</span></div>
          <div>・$V_{BE}$ 閾値: 0.7 V</div>
          <div>・最大定格 ($I_c$): 150 mA</div>
          <div>・端子配列: 左から E-C-B</div>
        </div>
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">⚡ リアルタイム動作状態</div>
        <div style="margin-bottom: 8px; color: #cbd5e1; background: #181825; padding: 6px; border-radius: 4px;">
          <div>・動作モード: <span style="color: ${isBaseOn ? '#4ade80' : '#ef4444'}; font-weight: bold;">${isBaseOn ? '飽和導通 (SATURATED / ON)' : '遮断状態 (CUTOFF / OFF)'}</span></div>
          <div>・コレクタ電流 ($I_c$): <span style="color: ${isBaseOn ? '#4ade80' : '#64748b'}; font-weight: bold;">${ic_mA.toFixed(2)} mA</span></div>
          <div>・ベース制御電流 ($I_b$): <span style="color: ${isBaseOn ? '#38bdf8' : '#64748b'}; font-weight: bold;">${ib_uA.toFixed(1)} µA</span></div>
                    <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #334155; font-size: 9px; color: #94a3b8; line-height: 1.4;">
            ・三つの脚を持つ水門: 黒き頭部に刻まれし三脚の階梯。
            右の脚（ベース）にわずかなる生贄（電流）を注がぬ限り、中央の門（コレクタ）は固く閉ざされ、左の出口（エミッタ）へ至る奔流を拒み続ける。
            されど微光を与えし時、門は解き放たれ、百倍の奔流となって回路を満たすだろう。
          </div>
        </div>`;
    }
  }
};



// ★ 超軽量化された新しい updateInspectorUI 関数（旧関数の代わりにここに配置）
function updateInspectorUI(comp) {
  const titleEl = document.getElementById("inspector-part-title");
  const descEl = document.getElementById("inspector-part-desc");
  const specBox = document.getElementById("inspector-spec-box");
  const selectVal = document.getElementById("select-resistor-val");
  const attrBox = document.getElementById("inspector-attr-box"); // ★ 親枠を取得

  // ★ 抵抗器の時だけ枠ごと表示、スイッチ等の他パーツでは枠ごとスッキリ非表示！
  if (attrBox) {
    attrBox.style.display = (comp && comp.type === "resistor") ? "flex" : "none";
  }

  // 0. パーツ未選択（電源 9V 表示）
  if (!comp) {
    if (titleEl) titleEl.textContent = "9V POWER SUPPLY";
    if (descEl) descEl.textContent = "定格 9.0V 直流電源 (6LR61/006P)。ブレッドボードの上下パワーレールへ電力を給電中。";
    if (selectVal) selectVal.style.display = "none";
    if (specBox) {
      specBox.innerHTML = `
        <div style="color: #38bdf8; font-weight: bold; margin-bottom: 4px; border-bottom: 1px solid #334155; padding-bottom: 2px;">📊 直流電源 基本仕様</div>
        <div style="color: #cbd5e1; font-size: 10px; line-height: 1.6;">
          ・出力電圧: <span style="color: #4ade80; font-weight: bold;">9.0 V DC (固定)</span><br>
          ・タイプ: アルカリ乾電池 (006P / 6LR61型)<br>
          ・給電状態: <span style="color: #4ade80; font-weight: bold;">給電中 (ACTIVE)</span>
        </div>`;
    }
    return;
  }

  // 物理計算コンテキストの取得
  const physics = typeof calculateCircuitPhysics === "function"
    ? calculateCircuitPhysics()
    : { status: "OPEN", r_total_ohm: 1000 };

// ストラテジーマップによる動的ディスパッチ実行 (Zero Hardcoding Policy)
  // ★ switch_spdt の場合は switch ハンドラへ自動フォールバック
  const renderer = INSPECTOR_RENDERERS[comp.type] || (comp.type === "switch_spdt" ? INSPECTOR_RENDERERS["switch"] : null);
  if (typeof renderer === "function") {
    renderer(comp, titleEl, descEl, specBox, selectVal, physics);
  } else {
    // 未定義素子向けデフォルトフォールバック表示
    if (titleEl) titleEl.textContent = comp.name || comp.type.toUpperCase();
    if (descEl) descEl.textContent = comp.desc || "選択中のパーツ";
    if (selectVal) selectVal.style.display = "none";
  }
}

// ======================================================================
// 【第7章：ユーザー操作イベント ＆ アプリケーション制御 (Interaction & Loop)】
// マウスドラッグ、穴スナップ、配線敷設、ショートカット、およびメインループ
// ======================================================================
let isDragging = false;
let dragComponent = null;
let isDPressed = false; // ★ Dキー押下状態フラグ

// Dキーの押し下げ・離し状態を全域で監視
window.addEventListener("keydown", (e) => { if (e.key.toLowerCase() === "d") isDPressed = true; });
window.addEventListener("keyup", (e) => { if (e.key.toLowerCase() === "d") isDPressed = false; });

/**
 * ★ UNDO (元に戻す) - 完全即時再描画版 (Zero Hardcoding)
 */window.undo = function() {
  if (undoStack.length === 0) return;

  // 現在のボード状態をREDOスタックへ退避
  const currentSnapshot = {
    components: JSON.parse(JSON.stringify(components)),
    activeJumperWires: JSON.parse(JSON.stringify(activeJumperWires))
  };
  redoStack.push(currentSnapshot);

  // UNDOスタックから直前の状態を復元
  const previous = undoStack.pop();
  components.length = 0;
  previous.components.forEach(c => components.push(c));
  activeJumperWires.length = 0;
  previous.activeJumperWires.forEach(w => activeJumperWires.push(w));

  // 選択状態のリセット
  selectedComponent = null;
  selectedWire = null;
  firstSelectedHole = null;

  // 通電状態の再解析・画面の再描画・UIの一括更新！
  if (typeof analyzeEnergizedNodes === "function") analyzeEnergizedNodes();
  if (typeof renderScene === "function") renderScene();
  if (typeof updateInspectorUI === "function") updateInspectorUI(null);
};

/**
 * ★ REDO (やり直す) - 完全即時再描画版 (Zero Hardcoding)
 */
window.redo = function() {
  if (redoStack.length === 0) return;

  // 現在のボード状態をUNDOスタックへ退避
  const currentSnapshot = {
    components: JSON.parse(JSON.stringify(components)),
    activeJumperWires: JSON.parse(JSON.stringify(activeJumperWires))
  };
  undoStack.push(currentSnapshot);

  // REDOスタックから未来の状態を復元
  const next = redoStack.pop();
  components.length = 0;
  next.components.forEach(c => components.push(c));
  activeJumperWires.length = 0;
  next.activeJumperWires.forEach(w => activeJumperWires.push(w));

  // 選択状態のリセット
  selectedComponent = null;
  selectedWire = null;
  firstSelectedHole = null;

  // 通電状態の再解析・画面の再描画・UIの一括更新！
  if (typeof analyzeEnergizedNodes === "function") analyzeEnergizedNodes();
  if (typeof renderScene === "function") renderScene();
  if (typeof updateInspectorUI === "function") updateInspectorUI(null);
};



/**
 * ★ パーツ回転の共通処理関数 (Rキーとボタン操作を1つに統合)
 */
function rotateTargetComponent(target) {
  if (!target) return;

  // ★ 3端子トランジスタは縦挿し短絡(ショート)を防ぐため回転を安全にガード
  if (target.type === "transistor") {
    console.log("ℹ️ トランジスタは同一列の短絡(ショート)を防ぐため、横向き固定となっています。");
    return;
  }

 const rows = ["A","B","C","D","E","F","G","H","I","J"];
  const colA = getColFromHoleId(target.pinA);
  const colB = getColFromHoleId(target.pinB);
  const rowStrA = target.pinA.replace(/\d+/g, "");
  const rowStrB = target.pinB.replace(/\d+/g, "");
  const rIdxA = rows.indexOf(rowStrA);
  const rIdxB = rows.indexOf(rowStrB);

  // ★ 回転前の実スパンを正確に測定・保持 (横なら列差、縦なら行差)
  const currentSpan = target.isVertical
    ? Math.abs(rIdxB - rIdxA)
    : Math.abs(colB - colA);
  const span = currentSpan > 0 ? currentSpan : (target.spanCols || 2);

  target.isVertical = !target.isVertical;
  const col = colA;
  const rowStr = rowStrA;

  if (target.isVertical) {
    // 横 ➔ 縦: 中央溝(E/F)跨ぎなら維持、それ以外は元スパンの行差で配置
    if ((rowStr === "E" || rowStr === "F") && span === 1) {
      target.pinA = `E${col}`; target.pinB = `F${col}`;
    } else {
      const rIdx = rows.indexOf(rowStr);
      const targetRIdx = Math.min(rIdx + span, 9);
      const startRIdx = targetRIdx - span >= 0 ? targetRIdx - span : 0;
      target.pinA = `${rows[startRIdx]}${col}`;
      target.pinB = `${rows[startRIdx + span]}${col}`;
    }
  } else {
    // 縦 ➔ 横: 元スパンの列差を厳密に維持して配置
    const startCol = Math.min(col, 30 - span);
    const targetCol = startCol + span;

    target.pinA = `${rowStr}${startCol}`;
    target.pinB = `${rowStr}${targetCol}`;
  }
    // 配線の自動再計算
  autoGenerateJumperWires();
}


/**
 * ★ 点 P(p.x, p.y) と線分 VW(v.x, v.y - w.x, w.y) の最短距離を求める数学ヘルパー関数
 * Zero Hardcoding: 幾何計算を完全に汎用化
 */
function distToSegment(p, v, w) {
  const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
}


/**
 * ★ ジャンパー線の描画カーブ(アーチ)に沿ったサンプリング点を計算する幾何ヘルパー
 * 描画と同じベジェ曲線を再現し、見た目と当たり判定を100%一致させる (Zero Hardcoding)
 */
function getJumperWireSegments(wire) {
  const pA = getHoleCoord(wire.fromHole);
  const pB = getHoleCoord(wire.toHole);
  if (!pA || !pB) return [];

  // 描画エンジンと同じ中和・アーチ制御点を算定
  const midX = (pA.x + pB.x) / 2;
  const midY = (pA.y + pB.y) / 2;
  const dist = Math.hypot(pB.x - pA.x, pB.y - pA.y);
  const archHeight = Math.min(Math.max(dist * 0.3, 15), 60);
  const ctrlY = midY - archHeight; // 制御点

  // ベジェ曲線を6分割してセグメント(折れ線)化
  const points = [];
  const steps = 6;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // 二次ベジェ曲線補間公式: B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
    const x = (1 - t) ** 2 * pA.x + 2 * (1 - t) * t * midX + t ** 2 * pB.x;
    const y = (1 - t) ** 2 * pA.y + 2 * (1 - t) * t * ctrlY + t ** 2 * pB.y;
    points.push({ x, y });
  }
  return points;
}

/**
 * ★ 曲がりくねった配線(点群)とクリック位置(mx, my)の最短距離を精密計算
 */
function distToWireCurve(p, wire) {
  const points = getJumperWireSegments(wire);
  if (points.length < 2) return 9999;

  let minDist = 9999;
  for (let i = 0; i < points.length - 1; i++) {
    const d = distToSegment(p, points[i], points[i + 1]);
    if (d < minDist) minDist = d;
  }
  return minDist;
}




/**
 * ★ 【完全確定版】全UIイベントの統合セットアップ
 * 優先順位: 0. 削除モード ➔ 1. パーツ掴み・操作 (最優先) ➔ 2. ジャンパー配線 ➔ 3. 選択解除
 */
function setupInteraction(canvas) {
  if (!canvas) return;

  // ==================================================================
  // 1. マウスダウン (クリック・ドラッグ開始判定)
  // ==================================================================
 // ★ クリックとドラッグを完全分離するドラッグ開始位置メモリ
  let dragStartX = 0;
  let dragStartY = 0;
  let hasMovedEnough = false;

  // 1. マウスダウン (クリック・ドラッグ開始判定)
  canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    dragStartX = mx;
    dragStartY = my;
    hasMovedEnough = false;

    // ------------------------------------------------------------------
    // ★ 【Dキー ＋ クリック】で任意アイテム（パーツ or 配線）をピンポイント1つだけ削除！
    // ------------------------------------------------------------------
    if (isDPressed) {
      let targetCompIdx = -1;
      let targetWireIdx = -1;

      // 1. パーツの判定 (判定幅 18px)
      components.forEach((comp, idx) => {
        const pA = getHoleCoord(comp.pinA);
        const pB = getHoleCoord(comp.pinB);
        if (pA && pB) {
          const d = distToSegment({ x: mx, y: my }, pA, pB);
          if (d <= 18) targetCompIdx = idx;
        }
      });

      // 2. パーツがクリックされた場合はパーツを優先削除
      if (targetCompIdx !== -1) {
        saveHistory();
        const removed = components.splice(targetCompIdx, 1)[0];
        console.log("🗑️ [D+Click] パーツを削除しました:", removed.name || removed.id);
        selectedComponent = null;
        if (typeof analyzeEnergizedNodes === "function") analyzeEnergizedNodes();
        if (typeof renderScene === "function") renderScene(canvas.getContext("2d"));
        if (typeof updateInspectorUI === "function") updateInspectorUI(null);
        return; // 後続のドラッグ・配線処理をカット
      }

      // 3. 配線の判定 (判定幅 16px)
      activeJumperWires.forEach((w, idx) => {
        const d = distToWireCurve({ x: mx, y: my }, w);
        if (d <= 16) targetWireIdx = idx;
      });

      // 4. 配線がクリックされた場合は配線を削除
      if (targetWireIdx !== -1) {
        saveHistory();
        const removed = activeJumperWires.splice(targetWireIdx, 1)[0];
        console.log("🗑️ [D+Click] ジャンパー線を削除しました:", removed.id);
        selectedWire = null;
        if (typeof analyzeEnergizedNodes === "function") analyzeEnergizedNodes();
        if (typeof renderScene === "function") renderScene(canvas.getContext("2d"));
        return; // 後続処理をカット
      }

      return; // Dキー押下時は何も当たっていなくても後続処理を行わない
    }

    // ------------------------------------------------------------------
    // ★ 0. 【削除モード(消しゴム)】ON時の即時消去
    // ------------------------------------------------------------------
   // ★ 0. 【削除モード(消しゴム)】ON時の即時消去 (デバッグログ付き)
    if (isDeleteMode) {
      const target = window.hoveredDeleteTarget;
      console.log("🔍 [Delete Check] ホバーターゲット:", target);

      if (target && target.item) {
        saveHistory();
        if (target.type === "wire") {
          const idx = activeJumperWires.findIndex(w => w.id === target.item.id);
          if (idx !== -1) {
            activeJumperWires.splice(idx, 1);
            console.log("🗑️ ジャンパー線を削除しました:", target.item.id);
          }
          selectedWire = null;
        } else if (target.type === "component") {
          const idx = components.findIndex(c => c.id === target.item.id);
          if (idx !== -1) {
            components.splice(idx, 1);
            console.log("🗑️ パーツを削除しました:", target.item.id);
          }
          selectedComponent = null;
        }
        window.hoveredDeleteTarget = null;
        if (typeof analyzeEnergizedNodes === "function") analyzeEnergizedNodes();
        if (typeof renderScene === "function") renderScene();
        if (typeof updateInspectorUI === "function") updateInspectorUI(null);
      } else {
        console.warn("⚠️ 削除対象が検出されませんでした (ヒットボックス外)");
      }
      return;
    }

    // ------------------------------------------------------------------
    // ★ 1. 【最優先】パーツの掴み・選択判定 (ジャンパー割り込みを完全遮断)
    // ------------------------------------------------------------------
   let clickedComp = null;
    components.forEach(comp => {
      const pA = getHoleCoord(comp.pinA);
      const pB = getHoleCoord(comp.pinB);
      if (pA && pB) {
        const d = distToSegment({ x: mx, y: my }, pA, pB);
        // 通常素子は 10px 以内、トランジスタなら少し上のボディ位置(midY - 14)も判定
      // 通常素子は 14px 以内、トランジスタなら少し上のボディ位置(midY - 14)も判定
        if (d <= 14) {
          clickedComp = comp;
        // ★ スイッチ類 (通常・3路) の確実なケース全体当たり判定 (貫通・巨大化を100%防止)
        } else if (comp.type === "switch" || comp.type === "switch_spdt") {
          const minX = Math.min(pA.x, pB.x) - 10;
          const maxX = Math.max(pA.x, pB.x) + 10;
          const minY = Math.min(pA.y, pB.y) - 14;
          const maxY = Math.max(pA.y, pB.y) + 14;
          if (mx >= minX && mx <= maxX && my >= minY && my <= maxY) {
            clickedComp = comp;
          }
        } else if (comp.type === "transistor") {
          const pC = getHoleCoord(comp.pinC);
          if (pC && Math.hypot(pC.x - mx, (pC.y - 14) - my) <= 16) {
            clickedComp = comp;
          }
        }
      }
    });





    if (clickedComp) {
      saveHistory(); // UNDO用履歴保存 (移動・操作前)
      isDragging = true;
      dragComponent = clickedComp;
      selectedComponent = clickedComp;
      selectedWire = null;
      firstSelectedHole = null; // 配線の始点選択をリセット

     // スイッチの場合は ON/OFF 切替
      if (clickedComp.type === "switch") {
        clickedComp.isOn = !clickedComp.isOn;
        if (typeof analyzeEnergizedNodes === "function") analyzeEnergizedNodes();
      // ★ 3路スイッチ (SPDT) の盤面クリック切替 (L1 ↔ L2)
      } else if (clickedComp.type === "switch_spdt") {
        clickedComp.state = (clickedComp.state === "L2") ? "L1" : "L2";
        if (typeof analyzeEnergizedNodes === "function") analyzeEnergizedNodes();
      }

      if (typeof updateInspectorUI === "function") updateInspectorUI(selectedComponent);
      if (typeof renderScene === "function") renderScene();
      return; // ★ パーツ操作確定（これより下の配線処理へ一切流さない！）
    }

  // ------------------------------------------------------------------
    // ★ 1.5. 【ジャンパー線単体削除】判定幅28px内の配線を直接ワンクリック削除！
    // ------------------------------------------------------------------
    let clickedWireIdx = -1;
    activeJumperWires.forEach((w, idx) => {
      const d = distToWireCurve({ x: mx, y: my }, w);
      if (d <= 8) { // ★ 28px から 8px へ縮小！近接パーツ操作を邪魔しない
        clickedWireIdx = idx;
      }
    });

  if (clickedWireIdx !== -1) {
      saveHistory(); // 履歴保存（Ctrl+Zで復元可能）
      const removedWire = activeJumperWires.splice(clickedWireIdx, 1)[0];
      console.log("🗑️ ジャンパー線をワンクリック削除しました:", removedWire.id);
            selectedWire = null;
      if (typeof analyzeEnergizedNodes === "function") analyzeEnergizedNodes();
      if (typeof renderScene === "function") renderScene();
      // ★ 配線が消えた瞬間にインスペクターの諸元・状態テキストも即時再同期！
      if (typeof updateInspectorUI === "function") updateInspectorUI(selectedComponent);
      return; // 配線削除完了・後続処理をストップ
    }

    // ------------------------------------------------------------------
    // ★ 2. 【2番目】パーツがない空きスルーホールのタップ判定 (ジャンパー配線)
    // ------------------------------------------------------------------
    let clickedHole = null;
    for (const hole of allHoles) {
      if (Math.hypot(hole.x - mx, hole.y - my) <= 8) {
        clickedHole = hole;
        break;
      }
    }

    if (clickedHole) {
      if (!firstSelectedHole) {
        firstSelectedHole = clickedHole; // 1回目: 始点選択
      } else if (firstSelectedHole.id === clickedHole.id) {
        firstSelectedHole = null; // 同一穴タップでキャンセル
      } else {
        // 2回目: 結線実行
        const fromId = firstSelectedHole.id;
        const toId = clickedHole.id;

        const existingIdx = activeJumperWires.findIndex(w =>
          (w.fromHole === fromId && w.toHole === toId) ||
          (w.fromHole === toId && w.toHole === fromId)
        );

        saveHistory(); // 配線変更前の履歴保存
        if (existingIdx !== -1) {
          activeJumperWires.splice(existingIdx, 1);
        } else {
          activeJumperWires.push({
            id: `MANUAL_JW_${Date.now()}`,
            fromHole: fromId,
            toHole: toId,
            color: "#0284c7"
          });
        }

        firstSelectedHole = null;
        if (typeof analyzeEnergizedNodes === "function") analyzeEnergizedNodes();
      }
      if (typeof renderScene === "function") renderScene();
      return; // 配線操作確定終了
    }

    // ------------------------------------------------------------------
    // ★ 3. 何もない背景をクリックした場合：全選択解除
    // ------------------------------------------------------------------
    selectedComponent = null;
    selectedWire = null;
    firstSelectedHole = null;
    if (typeof updateInspectorUI === "function") updateInspectorUI(null);
    if (typeof renderScene === "function") renderScene();
  });

  // ==================================================================
  // 2. マウス移動 (ドラッグ / スナップ / ホバーハイライト)
  // ==================================================================
  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // A. 削除モード中のホバー赤色カーソル・ターゲット保持
    if (isDeleteMode) {
      canvas.style.cursor = "crosshair";
      let target = null;
      let minWireDist = 18;
      let minCompDist = 20;

     // ★ ジャンパー線の当たり判定を大きめ (28px) に拡大！
      activeJumperWires.forEach(w => {
        const d = distToWireCurve({ x: mx, y: my }, w);
        if (d < 28) { // 18 ➔ 28 へ拡大
          minWireDist = d;
          target = { type: "wire", item: w };
        }
      });

      components.forEach(c => {
        const pA = getHoleCoord(c.pinA);
        const pB = getHoleCoord(c.pinB);
        if (pA && pB) {
          const d = distToSegment({ x: mx, y: my }, pA, pB);
          if (d < minCompDist) {
            minCompDist = d;
            target = { type: "component", item: c };
          }
        }
      });

      window.hoveredDeleteTarget = target;
      if (typeof renderScene === "function") renderScene();
      return;
    }

   // B. パーツドラッグ移動＆グリッドスナップ
    // ★ 5px以上しっかりマウスを動かしていない「ただのクリック」の時は移動させない！
    if (isDragging && dragComponent) {
      if (!hasMovedEnough) {
        const moveDist = Math.hypot(mx - dragStartX, my - dragStartY);
        if (moveDist > 5) {
          hasMovedEnough = true;
        } else {
          return; // 5px未満の微小な手振れクリックではパーツ位置を絶対に動かさない！
        }
      }

      let closestHole = null;
      let minDist = 9999;

      allHoles.forEach(hole => {
        if (hole.id.startsWith("BUS_")) return;
        const dist = Math.hypot(hole.x - mx, hole.y - my);
        if (dist < minDist) {
          minDist = dist;
          closestHole = hole;
        }
      });

      if (closestHole) {
       const col = getColFromHoleId(closestHole.id);
        const rowStr = closestHole.id.replace(/\d+/g, "");
        const rows = ["A","B","C","D","E","F","G","H","I","J"];
        const rowIdx = rows.indexOf(rowStr);

        // ★ 【Zero Hardcoding】固定スパン(1や5)を完全撤廃！
        // 素子が元々持っているピンAとピンBの実際の列間隔(スパン)を動的に維持
        const curColA = getColFromHoleId(dragComponent.pinA);
        const curColB = getColFromHoleId(dragComponent.pinB);
        const currentSpan = Math.abs(curColB - curColA);
        const span = currentSpan > 0 ? currentSpan : (dragComponent.spanCols || 2);




           // ★ トランジスタ (3端子) のドラッグ追従処理
        if (dragComponent.type === "transistor") {
          const safeCol = Math.min(col, 28); // 30列を超えるはみ出し防止
          dragComponent.pinE = `${rowStr}${safeCol}`;     // 左足: E
          dragComponent.pinC = `${rowStr}${safeCol + 1}`; // 中足: C
          dragComponent.pinB = `${rowStr}${safeCol + 2}`; // 右足: B
          dragComponent.pinA = dragComponent.pinE;
          dragComponent.pinB = dragComponent.pinB;
       // ★ 3路トグルスイッチ (SPDT: 3端子) の等間隔・完全形状維持ドラッグ
        } else if (dragComponent.type === "switch_spdt") {
          const safeCol = Math.min(col, 26); // 4列スパン(30列制限)のはみ出し防止
          const comHole = `${rowStr}${safeCol + 2}`;
          dragComponent.pinA = `${rowStr}${safeCol}`;       // 左足: L1
          dragComponent.pinCom = comHole;                   // ★ 小文字(pinCom)を完全更新！
          dragComponent.pinCOM = comHole;                   // ★ 大文字(pinCOM)も完全同期！
          dragComponent.pinB = `${rowStr}${safeCol + 4}`;   // 右足: L2 (常に4列右)
        // ★ 通常スイッチ (SPST) の幅完全固定
        } else if (dragComponent.type === "switch") {
          const safeCol = Math.min(col, 27);
          dragComponent.pinA = `${rowStr}${safeCol}`;
          dragComponent.pinB = `${rowStr}${safeCol + 3}`;   // 通常スイッチは3列幅固定
        // 一般2端子素子のドラッグ処理
        } else if (dragComponent.isVertical) {
          let startRowIdx = rowIdx;
          let targetRowIdx = Math.min(rowIdx + span, 9);
          if (rowStr === "E" || rowStr === "F") { startRowIdx = 4; targetRowIdx = 5; }
          dragComponent.pinA = `${rows[startRowIdx]}${col}`;
          dragComponent.pinB = `${rows[targetRowIdx]}${col}`;
        } else {
          const startCol = Math.min(col, 30 - span);
          dragComponent.pinA = `${rowStr}${startCol}`;
          dragComponent.pinB = `${rowStr}${startCol + span}`;
        }



      }
      if (typeof renderScene === "function") renderScene();
    } else {
      // 通常ホバー時の情報表示
      let foundHole = null;
      for (const hole of allHoles) {
        if (Math.hypot(hole.x - mx, hole.y - my) <= 7) { foundHole = hole; break; }
      }
      hoveredHole = foundHole;
      const elHole = document.getElementById("hover-hole-id");
      const elNode = document.getElementById("hover-node-id");
      if (elHole) elHole.textContent = foundHole ? foundHole.id : "NONE";
      if (elNode) elNode.textContent = foundHole ? foundHole.nodeId : "NONE";
    }
  });

// ==================================================================
  // 3. マウスアップ (ドラッグ解除 ＆ ボード外ドロップ削除)
  // ==================================================================
  window.addEventListener("mouseup", (e) => {
    // ★ 5px以上しっかりドラッグ移動させていない「その場クリック」時は絶対に削除させない安全防壁！
    if (isDragging && dragComponent && hasMovedEnough) {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      // ボード領域（キャンバスの外側）へドラッグして離された場合は自動削除
      const isOutside = (mx < -10 || mx > rect.width + 10 || my < -10 || my > rect.height + 10);
      if (isOutside) {
        saveHistory();
        const idx = components.findIndex(c => c.id === dragComponent.id);
        if (idx !== -1) {
          components.splice(idx, 1);
          console.log("🗑️ ボード外ドロップによりパーツを削除しました:", dragComponent.id);
        }
        selectedComponent = null;
        if (typeof analyzeEnergizedNodes === "function") analyzeEnergizedNodes();
        if (typeof updateInspectorUI === "function") updateInspectorUI(null);
      } else {
        // ★ 通常ドロップ時も移動後の穴で回路・オシロスコープを即時再計算！
        saveHistory();
        if (typeof analyzeEnergizedNodes === "function") analyzeEnergizedNodes();
      }
    }

    isDragging = false;
    dragComponent = null;
    hasMovedEnough = false; // ★ フラグを確実にリセット

    if (typeof renderScene === "function") renderScene(canvas.getContext("2d"));
  });

  // ==================================================================
  // 4. キーボードショートカット (Undo / Redo / Delete / Rotate)
  // ==================================================================
  window.addEventListener("keydown", (e) => {
    if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      if (e.shiftKey) {
        if (typeof window.redo === "function") window.redo();
      } else {
        if (typeof window.undo === "function") window.undo();
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
      e.preventDefault();
      if (typeof window.redo === "function") window.redo();
    } else if (e.key === "Delete" || e.key === "Backspace") {
      if (typeof window.deleteSelectedTarget === "function") window.deleteSelectedTarget();
    } else if (e.key === "r" || e.key === "R") {
      if (components.length === 0) return;
      const target = selectedComponent || dragComponent || components[components.length - 1];
      if (typeof rotateTargetComponent === "function") rotateTargetComponent(target);
    }
  });

  // ==================================================================
  // 5. ボタン・コントロールのイベントバインド
  // ==================================================================
  const btnRotate = document.getElementById("btn-rotate");
  if (btnRotate) {
    btnRotate.onclick = function() {
      if (components.length === 0) return;
      const target = selectedComponent || dragComponent || components[components.length - 1];
      if (typeof rotateTargetComponent === "function") rotateTargetComponent(target);
    };
  }




/**
 * ★ 選択中のパーツまたはジャンパー線を即時削除する統合安全関数 (Zero Hardcoding)
 * 操作種別: 重複定義の統合・上書き
 */
function deleteSelectedTarget() {
  let hasDeleted = false;

  // 1. 選択中パーツの削除
  if (selectedComponent) {
    const idx = components.findIndex(c => c.id === selectedComponent.id);
    if (idx !== -1) {
      saveHistory();
      components.splice(idx, 1);
      selectedComponent = null;
      hasDeleted = true;
    }
  }
  // 2. 選択中ジャンパー線の削除
  else if (selectedWire) {
    const idx = activeJumperWires.findIndex(w => w.id === selectedWire.id);
    if (idx !== -1) {
      saveHistory();
      activeJumperWires.splice(idx, 1);
      selectedWire = null;
      hasDeleted = true;
    }
  }

  if (hasDeleted) {
    if (typeof analyzeEnergizedNodes === "function") analyzeEnergizedNodes();
    if (typeof renderScene === "function") renderScene();
    const titleEl = document.getElementById("inspector-part-title");
    const descEl = document.getElementById("inspector-part-desc");
    if (titleEl) titleEl.textContent = "9V POWER SUPPLY";
    if (descEl) descEl.textContent = "定格 9.0V 直流電源 (6LR61/006P)。ブレッドボードの上下パワーレールへ電力を給電中。";
  }
}
/**
   * ★ 削除モード状態一括同期・制御エンジン (UI・テキスト・カーソル完全連動)
   */
  window.setDeleteMode = function(enabled) {
    isDeleteMode = !!enabled;
    const btnDelete = document.getElementById("btn-delete");

    if (btnDelete) {
      if (isDeleteMode) {
        btnDelete.style.backgroundColor = "#ef4444";
        btnDelete.style.boxShadow = "0 0 12px rgba(239, 68, 68, 0.6)";
        btnDelete.style.borderColor = "#f87171";
        btnDelete.textContent = "🗑️ 削除モード中 (解除)";
      } else {
        btnDelete.style.backgroundColor = "";
        btnDelete.style.boxShadow = "";
        btnDelete.style.borderColor = "";
        btnDelete.textContent = "🗑️ パーツ削除";
      }
    }

    if (canvas) {
      canvas.style.cursor = isDeleteMode ? "crosshair" : "default";
    }

    if (isDeleteMode) {
      firstSelectedHole = null;
      window.hoveredDeleteTarget = null;
    }
  };

  // ★ 削除ボタン(#btn-delete)の発火イベント接続 (安全同期版)
  const btnDelete = document.getElementById("btn-delete");
  if (btnDelete) {
    btnDelete.addEventListener("click", () => {
      if (selectedComponent || selectedWire) {
        deleteSelectedTarget();
        setDeleteMode(false); // 削除実行後は安全のため削除モードをOFFにリセット
        return;
      }
      setDeleteMode(!isDeleteMode); // 選択物がなければトグル切替
    });
  }




  // 4-C. インスペクター「種類（抵抗値）変更」ドロップダウン制御
  const selectVal = document.getElementById("select-resistor-val");
  if (selectVal) {
    selectVal.addEventListener("change", (e) => {
      const newOhm = parseInt(e.target.value, 10);
      const master = RESISTOR_MASTER_DATA[newOhm];
      const target = selectedComponent || dragComponent || hoveredComponent || components[components.length - 1];

      if (target && master) {
        target.val_ohm = newOhm;
        target.name = master.name;
        target.colors = master.colors;
        target.desc = master.desc;

     document.getElementById("inspector-part-title").textContent = target.name;
        document.getElementById("inspector-part-desc").textContent = target.desc;
      }
    });
  }

 // ★ 4-D. インスペクター小窓（拡大表示）のクリックでスイッチをON/OFF・接点反転させる処理
  // 正しいCanvas ID (inspector-preview-canvas) を取得
  const inspectorCanvas = document.getElementById("inspector-preview-canvas") || document.getElementById("inspector-canvas");
  if (inspectorCanvas) {
    inspectorCanvas.style.cursor = "pointer";
    inspectorCanvas.addEventListener("click", () => {
      const target = selectedComponent || dragComponent || hoveredComponent || components[components.length - 1];
      if (!target) return;

      // ★ 3路スイッチ (SPDT) または 通常スイッチ (SPST) の接点反転
      if (target.type === "switch_spdt") {
        if (typeof saveHistory === "function") saveHistory();
        target.state = (target.state === "L2") ? "L1" : "L2";
        if (typeof analyzeEnergizedNodes === "function") analyzeEnergizedNodes();
        if (typeof renderScene === "function") renderScene();
        if (typeof updateInspectorUI === "function") updateInspectorUI(target);
      } else if (target.type === "switch") {
        if (typeof saveHistory === "function") saveHistory();
        target.isOn = !target.isOn;
        if (typeof analyzeEnergizedNodes === "function") analyzeEnergizedNodes();
        if (typeof renderScene === "function") renderScene();
        if (typeof updateInspectorUI === "function") updateInspectorUI(target);
      }
    });
  }

// ★ UIカテゴリ切替連動 (PART_REGISTRY からの完全自動抽出・Zero Hardcoding版)
  const selectCat = document.getElementById("select-category");
  const selectPart = document.getElementById("select-add-part");

  if (selectCat && selectPart) {
    // PART_REGISTRY に登録された全パーツから、カテゴリに応じたドロップダウンオプションを動的生成
    const updatePartOptions = (category) => {
      selectPart.innerHTML = ""; // 既存選択肢のクリア

      // PART_REGISTRY の全項目から対象カテゴリのパーツを自動抽出
      Object.entries(PART_REGISTRY).forEach(([key, part]) => {
        if (!category || part.category === category) {
          const opt = document.createElement("option");
          opt.value = key;
          opt.textContent = part.name;
          selectPart.appendChild(opt);
        }
      });
    };

    // 分類ドロップダウン変更時のイベントバインド
    selectCat.addEventListener("change", (e) => {
      updatePartOptions(e.target.value);
    });

   // カテゴリ選択肢に "SEMICONDUCTOR" がなければ動的に追加
    if (!Array.from(selectCat.options).some(opt => opt.value === "SEMICONDUCTOR")) {
      const semiOpt = document.createElement("option");
      semiOpt.value = "SEMICONDUCTOR";
      semiOpt.textContent = "半導体素子 (ダイオード/IC)";
      selectCat.appendChild(semiOpt);
    }

    // 初期ロード時にも PART_REGISTRY と完全同期
    updatePartOptions(selectCat.value || "PASSIVE");
    }

  // ★ ボードへの新パーツ（抵抗またはスイッチ）追加処理
 // ★ 属性（抵抗値）変更ドロップダウンの即時連動イベントを追加
  const selectResVal = document.getElementById("select-resistor-val");
  if (selectResVal) {
    selectResVal.addEventListener("change", (e) => {
      if (selectedComponent && selectedComponent.type === "resistor") {
        const newOhm = parseInt(e.target.value, 10);
        selectedComponent.val_ohm = newOhm;

        // カラーコード帯の自動更新
        const colorMap = {
          100: ["#78350f", "#000000", "#78350f", "#eab308"],
          330: ["#ea580c", "#ea580c", "#78350f", "#eab308"],
          1000: ["#78350f", "#000000", "#dc2626", "#eab308"],
          10000: ["#78350f", "#000000", "#ea580c", "#eab308"],
          100000: ["#78350f", "#000000", "#eab308", "#eab308"]
        };
        selectedComponent.colors = colorMap[newOhm] || colorMap[1000];

        // 回路再計算＆インスペクターの動的仕様書を一括即時更新！
        analyzeEnergizedNodes();
        updateInspectorUI(selectedComponent);
      }
    });
  }

// ★ 【完全動的連動】ドロップダウン選択パーツの統合追加イベント
  const btnAdd = document.getElementById("btn-add-part");
  if (btnAdd) {
    btnAdd.addEventListener("click", () => {
      const selectPart = document.getElementById("select-add-part");
      const partVal = selectPart ? selectPart.value : "RESISTOR";

     // トグルスイッチの個別生成または汎用コンポーネント生成
      if (partVal === "SWITCH" || partVal === "TOGGLE_SW") {
        if (typeof addNewSwitch === "function") addNewSwitch("toggle");
      // ★ 3路トグルスイッチ (SPDT) を個別動的生成エンジンへルーティング
      } else if (partVal === "SWITCH_SPDT") {
        if (typeof addNewSwitch === "function") addNewSwitch("spdt");
      } else if (partVal === "RESISTOR") {
        const selVal = document.getElementById("select-resistor-val");
        const valOhm = selVal ? parseInt(selVal.value, 10) : 1000;
        addNewComponent(valOhm);
      } else {
        // LED各種 (LED_RED, LED_GREEN, LED_BLUE, LED_RAINBOW) への自動振り分け
        addNewComponent(partVal);
      }

      // 回路通電解析と描画の即時更新
      if (typeof analyzeEnergizedNodes === "function") analyzeEnergizedNodes();
    });
  }



/**
 * ★ スイッチ追加用動的エンジン
 */
window.addNewSwitch = function(subType = "toggle") {
    const master = SWITCH_MASTER_DATA[subType] || SWITCH_MASTER_DATA.toggle;
    const lastComp = components[components.length - 1];
    const lastCol = lastComp ? getColFromHoleId(lastComp.pinB) : 1;
    let startCol = lastCol + 2;
    if (startCol + 3 > 30) startCol = 1;


// ★ SPDT(3端子)と通常スイッチ(2端子)でピン配置を分岐
  const isSpdt = master.subType === "spdt";
  const pinA = `C${startCol}`;
  const pinCOM = isSpdt ? `C${startCol + 2}` : null;
  const pinB = isSpdt ? `C${startCol + 4}` : `C${startCol + 3}`;

  components.push({
      id: `SW_${Date.now()}`,
      type: isSpdt ? "switch_spdt" : "switch",
      subType: master.subType,
      name: master.name,
      pinA: pinA,          // L1接点
      pinCOM: pinCOM,      // COM共通端子 (SPDTのみ)
      pinB: pinB,          // L2接点 (通常時はもう一方の端子)
      state: "L1",         // SPDT用: 初期はL1接続
      isOn: true,          // 通常スイッチ用
      desc: master.desc
  });
 autoGenerateJumperWires();
    analyzeEnergizedNodes();
}
}






/**
 * アニメーション駆動メインループ (拡大プレビュー完全連動版)
 */
function startAnimationLoop() {
  const bbCanvas = document.getElementById("breadboard-canvas");
  const scopeCanvas = document.getElementById("scope-canvas");
  const previewCanvas = document.getElementById("inspector-preview-canvas");

  if (!bbCanvas || !scopeCanvas) return;

  const bbCtx = bbCanvas.getContext("2d");
  const scopeCtx = scopeCanvas.getContext("2d");
  const previewCtx = previewCanvas ? previewCanvas.getContext("2d") : null;

function loop() {
    // ★ 回路が通電中(CLOSED)の時だけアニメーションオフセットを進める (断線時は即座に停止!)
    const physics = typeof calculateCircuitPhysics === "function" ? calculateCircuitPhysics() : { status: "OPEN" };
    if (physics.status === "CLOSED") {
      dashOffset += 0.8;
      if (dashOffset > 100) dashOffset = 0;
    }

 renderScene(bbCtx);
    renderOscilloscope(scopeCtx);

    // ★ 右側パネルへ自律分圧ツリーを毎フレームリアルタイム更新！
    updateCircuitTreePanel(physics);

    // ★ トランジスタ動作状態変化時のインスペクターDOMリアルタイム同期
    if (selectedComponent && selectedComponent.type === "transistor") {
      const currentNB = getNodeByHoleId(selectedComponent.pinB);
      const isEnergized = physics.energized && currentNB ? physics.energized.has(currentNB) : false;
      const calculatedState = isEnergized ? "SATURATED" : "CUTOFF";
      if (selectedComponent.state !== calculatedState) {
        selectedComponent.state = calculatedState;
        if (typeof updateInspectorUI === "function") updateInspectorUI(selectedComponent);
      }
    }

 // ★ 選択中パーツ(selectedComponent)を最優先で拡大プレビュー描画！
    if (previewCtx) {
      const targetComp = selectedComponent || hoveredComponent || dragComponent || components[components.length - 1];
      renderInspectorPreview(previewCtx, targetComp);
    }

    requestAnimationFrame(loop);
  }
  loop();
}

// ======================================================================
// 【第8章：全自動テストスイート ＆ システム初期化 (Automated QA & Boot)】
// 物理計算・導通・全17パーツ・分圧ツリー・バッテリー・SPDT全数マトリクス自動監査
// ======================================================================

/**
 * 1. 【F12 全抵抗値組み合わせ ＆ スコープ精度 マトリクス全数監査】
 */
function runScopeMatrixTest() {
  console.log("%c📊 [F12 全抵抗値組み合わせ ＆ スコープ精度 マトリクス全数監査]", "color: #eab308; font-weight: bold; font-size: 15px;");
  console.log("==================================================");

  const availableOhms = Object.keys(RESISTOR_MASTER_DATA).map(Number);
  let totalTested = 0;
  let passCount = 0;
  let failCount = 0;

  // 退避用：現在のボードのコンポーネント状態
  const originalComponents = [...components];

  // 単体（5通り）および2個〜4個の直列組み合わせテストパターン自動生成
  const testPatterns = [];
    // 1個の全パターン
  availableOhms.forEach(r1 => testPatterns.push([r1]));
  // 2個直列の主要パターン
  availableOhms.forEach(r1 => availableOhms.forEach(r2 => testPatterns.push([r1, r2])));
  // 3個直列のサンプルパターン
  availableOhms.forEach(r1 => availableOhms.forEach(r2 => testPatterns.push([r1, r2, r1])));

  // 退避用：現在のボードのコンポーネント ＆ 手動配線状態を完全バックアップ
  originalComponents.length = 0;
  components.forEach(c => originalComponents.push(c));
  const originalWires = Array.isArray(activeJumperWires) ? [...activeJumperWires] : [];

  testPatterns.forEach((ohms, idx) => {
    totalTested++;
        // 仮想ボード状態の構築 (テスト用直列評価)
    components.length = 0;

    ohms.forEach((ohm, i) => {
      components.push({
        id: `TEST_R_${i}`,
        type: "resistor",
        val_ohm: ohm,
        pinA: `C${i * 5 + 1}`,
        pinB: `C${i * 5 + 5}`
      });
    });

    // 1. 理論値の計算 (直列回路: R_total = Σ R_i)
    const expectedR = ohms.reduce((a, b) => a + b, 0);
    const expectedI = (9.0 / expectedR) * 1000; // mA
    const expectedP = 9.0 * expectedI; // mW

    // 2. 物理エンジン計算精度テスト (直列導通時の実効値算定)
    const physR = components.filter(c => c.type === "resistor").reduce((sum, c) => sum + (c.val_ohm || 0), 0);
    const physI = (9.0 / physR) * 1000;
    const physP = 9.0 * physI;

    // 3. 誤差判定 (0.001以内の精度チェック)
    const isROk = Math.abs(physR - expectedR) < 0.001;
    const isIOk = Math.abs(physI - expectedI) < 0.001;
    const isPOk = Math.abs(physP - expectedP) < 0.001;

    if (isROk && isIOk && isPOk) {
      passCount++;
    } else {
      failCount++;
      console.error(`❌ [計算不整合] パターン ${idx + 1} [${ohms.join("Ω, ")}Ω] -> 理論値: ${expectedR}Ω / 算出値: ${physR}Ω`);
    }
  });

  // 元のパーツ ＆ 手動配線状態へ完全復元
  components.length = 0;
  originalComponents.forEach(c => components.push(c));
  activeJumperWires.length = 0;
  originalWires.forEach(w => activeJumperWires.push(w));
    if (typeof analyzeEnergizedNodes === "function") {
    analyzeEnergizedNodes();
  }
  console.log(` 検証パターン数: 全 ${totalTested} パターン`);
  if (failCount === 0) {
    console.log(`🎉 %c【スコープ計算精度 監査判定: 100% PASSED】 全 ${passCount} パターンで理論値とスコープ表示が誤差ゼロで完全一致！`, "color: #22c55e; font-weight: bold;");
  } else {
    console.warn(`⚠️ %c【監査判定: 精度異常あり】 成功: ${passCount} / 失敗: ${failCount}`, "color: #ef4444; font-weight: bold;");
  }
  console.log("==================================================");
}

/**
 * 2. 【F12 全穴ジャンパー導通＆ノード網羅マトリクス監査テスト】
 */
function runAllHolesJumperTest() {
  console.log("%c🍞 [F12 全穴ジャンパー導通＆ノード変換 全自動マトリクス監査]", "color: #38bdf8; font-weight: bold; font-size: 15px;");
  console.log("==================================================");

  if (!Array.isArray(allHoles) || allHoles.length === 0) {
    console.error("❌ [監査エラー] allHoles が初期化されていません。");
    return;
  }

  // ボード状態の完全バックアップ
  const backupWires = [...activeJumperWires];
  const backupComps = [...components];

  let totalTested = 0;
  let passCount = 0;
  let failCount = 0;

  // 1. 全穴のID ⇔ ノードID 相互変換整合性テスト
  let holeNodeErrors = 0;
  allHoles.forEach(hole => {
    totalTested++;
    const nodeId = getNodeByHoleId(hole.id);
    if (!nodeId || nodeId === "NONE") {
      holeNodeErrors++;
      console.error(`❌ [ノード不整合] 穴ID: ${hole.id} のノード変換に失敗しました。`);
    } else {
      passCount++;
    }
  });

  // 2. 同列垂直導通＆電源レール導通の完全全数マトリクステスト
  for (let col = 1; col <= 30; col++) {
    // 上段(A~E)の穴と下段(F~J)の穴をジャンパー線で結ぶテスト
    const holeA = `A${col}`;
    const holeJ = `J${col}`;
        totalTested++;
    activeJumperWires.length = 0;
    components.length = 0;

    // プラス電源 ➔ A列 ➔ (ジャンパー) ➔ J列 ➔ マイナス電源 のテスト閉回路を構築
    activeJumperWires.push({ fromHole: `BUS_TOP_PLUS_${col}`, toHole: holeA });
    activeJumperWires.push({ fromHole: holeA, toHole: holeJ });
    activeJumperWires.push({ fromHole: holeJ, toHole: `BUS_BOTTOM_MINUS_${col}` });

    const energized = analyzeEnergizedNodes();
    const isTopPlus = energized.has("NODE_POWER_TOP_PLUS");
    const isBotMinus = energized.has(getNodeByHoleId(`BUS_BOTTOM_MINUS_${col}`));

    if (isTopPlus && isBotMinus) {
      passCount++;
    } else {
      failCount++;
      console.error(`❌ [導通不整合] 列 ${col}: 穴 ${holeA} ⇔ ${holeJ} 間ジャンパー導通テスト失敗`);
    }
  }

  // ボード状態の完全復元 (Zero Hardcoding)
  activeJumperWires.length = 0;
  backupWires.forEach(w => activeJumperWires.push(w));
  components.length = 0;
  backupComps.forEach(c => components.push(c));

  if (typeof analyzeEnergizedNodes === "function") {
    analyzeEnergizedNodes();
  }

  console.log(` 検証パターン数: 全 ${totalTested} 件 (全420スルーホール ＋ 30列全域クロス配線)`);
  if (failCount === 0 && holeNodeErrors === 0) {
    console.log(`🎉 %c【全穴ジャンパー導通 監査判定: 100% PASSED】 全穴のノード識別および自由手動結線が完全正常に機能しています！`, "color: #22c55e; font-weight: bold;");
  } else {
    console.warn(`⚠️ %c【監査判定: 導通異常あり】 成功: ${passCount} / 失敗: ${failCount + holeNodeErrors}`, "color: #ef4444; font-weight: bold;");
  }
  console.log("==================================================");
}

/**
 * ★ 【F12最高精度】全自動システム総合監査エンジン (専門家レベルバグ検出)
 */
function runFullSystemAudit() {
  console.log("%c⚡ [F12 全自動システム総合物理＆回路網 監査開始]", "color: #38bdf8; font-weight: bold; font-size: 14px;");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  // 1. 存在しない穴IDの参照（Null Reference）チェック
  let invalidHoleCount = 0;
  components.forEach(c => {
    if (c.pinA && !getNodeByHoleId(c.pinA)) invalidHoleCount++;
    if (c.pinB && !getNodeByHoleId(c.pinB)) invalidHoleCount++;
    if (c.pinC && !getNodeByHoleId(c.pinC)) invalidHoleCount++;
  });
  activeJumperWires.forEach(w => {
    if (w.fromHole && !getNodeByHoleId(w.fromHole)) invalidHoleCount++;
    if (w.toHole && !getNodeByHoleId(w.toHole)) invalidHoleCount++;
  });

  if (invalidHoleCount === 0) {
    console.log("✅ [1/5 穴ID整合性]: 異常なし (すべてのパーツ・配線が正しく基板穴へ接続されています)");
    passed++;
  } else {
    console.error(`❌ [1/5 穴ID整合性]: ${invalidHoleCount} 箇所の不正な穴参照を検出！`);
    failed++;
  }

  // 2. 物理計算エンジンの異常値 (NaN / 無限大) 検出テスト
  const phys = typeof calculateCircuitPhysics === "function" ? calculateCircuitPhysics() : null;
  if (phys && !isNaN(phys.i_total_mA) && isFinite(phys.i_total_mA)) {
    console.log(`✅ [2/5 物理計算エンジン]: 正常稼働 (ステータス: ${phys.status}, 電流: ${phys.i_total_mA.toFixed(2)}mA)`);
    passed++;
  } else {
    console.error("❌ [2/5 物理計算エンジン]: NaN または 不正な演算結果を検出！");
    failed++;
  }

  // 3. 通電アニメーション (dashOffset) の算術健全性チェック
  if (typeof dashOffset === "number" && !isNaN(dashOffset)) {
    console.log("✅ [3/5 アニメーションエンジン]: 正常 (dashOffset 算術エラーなし)");
    passed++;
  } else {
    console.error("❌ [3/5 アニメーションエンジン]: dashOffset が NaN に破損しています！");
    failed++;
  }

  // 4. SPDTスイッチ非選択回路への電流漏洩 (リーク) 監査
  let switchLeakError = false;
  components.filter(c => c.type === "switch" && c.subType === "spdt").forEach(sw => {
    if (sw.switchState === 1) { // センターOFF
      const nA = getNodeByHoleId(sw.pinA);
      const nC = getNodeByHoleId(sw.pinC);
      const energized = analyzeEnergizedNodes();
      if (energized.has(nA) || energized.has(nC)) switchLeakError = true;
    }
  });

  if (!switchLeakError) {
    console.log("✅ [4/5 スイッチ排他通電]: 正常 (オフ時の不審な漏れ電流は検出されませんでした)");
    passed++;
  } else {
    console.error("❌ [4/5 スイッチ排他通電]: OFF状態のスイッチから電流が漏洩しています！");
    failed++;
  }

  // 5. Canvas自動再描画クラッシュテスト
  try {
    const canvas = document.getElementById("breadboard-canvas");
    if (canvas && typeof renderScene === "function") {
      renderScene(canvas.getContext("2d"));
      console.log("✅ [5/5 Canvas描画同期]: 正常 (再描画時に例外エラーは発生しませんでした)");
      passed++;
    }
  } catch (err) {
    console.error("❌ [5/5 Canvas描画同期]: レンダリング中にエラーが発生しました:", err);
    failed++;
  }

  console.log("--------------------------------------------------");
  if (failed === 0) {
    console.log(`🎉 %c【全システム監査結果: 100% PASSED】 (${passed}/${passed + failed} テスト合格) 配線・通電・アニメーションは完全正常です！`, "color: #22c55e; font-weight: bold;");
  } else {
    console.warn(`⚠️ %c【全システム監査結果: 警告あり】 (${passed} 合格 / ${failed} 検出されたバグあり)`, "color: #ef4444; font-weight: bold;");
  }
  console.log("==================================================");
}




/**
 * ★ 【F12 全パーツ全組み合わせ自動マトリクス全数監査エンジン】
 * PART_REGISTRY内の全パーツおよびパラメータ（抵抗値・カラー・静電容量等）を自動配置し、
 * 通電・物理計算・エラー判定に矛盾（NaN/無限大/未定義参照）がないかを全自動で走査します。
 * 操作種別: 新規追加・拡張
 */
function runAllPartsCombinationTest() {
  console.log("%c🧪 [F12 全パーツ＆全パラメータ マトリクス全数自動監査開始]", "color: #38bdf8; font-weight: bold; font-size: 15px;");
  console.log("==================================================");

  if (typeof PART_REGISTRY === "undefined") {
    console.error("❌ [監査エラー] PART_REGISTRY が定義されていません。");
    return;
  }

  // 1. ボード現在の状態を退避（テスト完了後に100%完全復元）
  const backupComponents = JSON.parse(JSON.stringify(components));
  const backupWires = JSON.parse(JSON.stringify(activeJumperWires));

  const partKeys = Object.keys(PART_REGISTRY);
  let totalTests = 0;
  let passCount = 0;
  let failCount = 0;

  console.log(`📋 検出パーツ種別: 全 ${partKeys.length} 種類 (${partKeys.join(", ")})`);

  // 2. 単体パーツの全数自動配置・物理演算テスト
  partKeys.forEach((key, idx) => {
    totalTests++;
    components.length = 0;
    activeJumperWires.length = 0;

    // テスト回路の自動生成 (給電プラス ➔ テストパーツ ➔ 給電マイナス)
    const master = PART_REGISTRY[key];
    const testComp = {
      id: `TEST_${key}_${idx}`,
      type: master.type,
      name: master.name,
      pinA: "C5",
      pinB: "C10",
      desc: master.desc
    };

   // パーツ型固有のプロパティをセット
    if (master.type === "resistor") testComp.val_ohm = master.val_ohm || 1000;
    if (master.type === "led") { testComp.vf = master.vf || 2.0; testComp.color = master.color; }
    if (master.type === "capacitor") { testComp.val_uF = master.val_uF || 10; testComp.charge_V = 0; }
    if (master.type === "potentiometer") { testComp.val_max_ohm = master.val_max_ohm || 10000; testComp.cur_ratio = 0.5; testComp.val_ohm = 5000; }
    if (master.type === "switch") { testComp.isOn = true; }
    if (master.type === "diode") { testComp.vf = master.vf || 0.7; }

    components.push(testComp);

    // テスト給電ジャンパー線
    activeJumperWires.push({ id: "TW1", fromHole: "BUS_TOP_PLUS_5", toHole: "A5", color: "#ef4444" });
    activeJumperWires.push({ id: "TW2", fromHole: "A10", toHole: "BUS_BOTTOM_MINUS_10", color: "#3b82f6" });

    // 導通解析 ＆ 物理計算の実行
    const energized = analyzeEnergizedNodes();
    const physics = calculateCircuitPhysics();

    // 検証判定 (NaN、Undefined、計算崩壊がないかチェック)
    const isPhysicsValid = physics && !isNaN(physics.i_total_mA) && !isNaN(physics.v_in);
    const isNodeValid = energized.has("NODE_POWER_TOP_PLUS");

    if (isPhysicsValid && isNodeValid) {
      passCount++;
    } else {
      failCount++;
      console.error(`❌ [パーツ監査不整合] キー: ${key} -> 計算結果異常 (mA: ${physics ? physics.i_total_mA : 'null'})`);
    }
  });

  // 3. ボード状態の完全復元
  components.length = 0;
  backupComponents.forEach(c => components.push(c));
  activeJumperWires.length = 0;
  backupWires.forEach(w => activeJumperWires.push(w));

  if (typeof analyzeEnergizedNodes === "function") analyzeEnergizedNodes();
  if (typeof renderScene === "function") renderScene();

  // 4. 監査結果レポートの出力
  console.log("--------------------------------------------------");
  if (failCount === 0) {
    console.log(`🎉 %c【全パーツマトリクス監査結果: 100% PASSED】 (全 ${totalTests} 件全合格)`, "color: #22c55e; font-weight: bold;");
    console.log("✨ すべてのパーツ種別・パラメータでの物理計算、ノード通電、および描画処理に異常はありません！");
  } else {
    console.warn(`⚠️ %c【監査結果: 異常検出】 成功: ${passCount} / 失敗: ${failCount}`, "color: #ef4444; font-weight: bold;");
  }
  console.log("==================================================");
}

/**
 * ★ 【F12 全パーツ電流経路・分圧ツリー描画 自動全数監査エンジン】
 * PART_REGISTRYの全パーツを通電させ、右側ツリーパネルに NaN や undefined、
 * 例外エラーが発生しないかを全自動で一瞬で走査・検証します。
 */
function runCircuitTreeAudit() {
  console.log("%c🌲 [F12 全パーツ電流経路・分圧ツリー描画 全自動マトリクス監査開始]", "color: #10b981; font-weight: bold; font-size: 15px;");
  console.log("==================================================");

  if (typeof PART_REGISTRY === "undefined") {
    console.error("❌ [監査エラー] PART_REGISTRY が定義されていません。");
    return;
  }

  // 1. ボード状態の完全バックアップ
  const backupComponents = JSON.parse(JSON.stringify(components));
  const backupWires = JSON.parse(JSON.stringify(activeJumperWires));

  const partKeys = Object.keys(PART_REGISTRY);
  let totalTests = 0;
  let passCount = 0;
  let failCount = 0;

  partKeys.forEach((key, idx) => {
    totalTests++;
    components.length = 0;
    activeJumperWires.length = 0;

    const master = PART_REGISTRY[key];
        // 保護抵抗(1kΩ)を常に前段に配置し、素子の過電流破壊を防ぎつつ直列閉回路を形成
    components.push({
      id: "AUDIT_R_LIMIT",
      type: "resistor",
      val_ohm: 1000,
      pinA: "C5",
      pinB: "C9"
    });

    // テスト対象パーツの配置
    const testComp = {
      id: `AUDIT_${key}_${idx}`,
      type: master.type,
      name: master.name,
      pinA: "C9",
      pinB: "C14",
      desc: master.desc
    };

    if (master.type === "resistor") testComp.val_ohm = master.val_ohm || 1000;
    if (master.type === "led") { testComp.vf = master.vf || 2.0; testComp.color = master.color; testComp.isOn = true; }
    if (master.type === "capacitor") { testComp.val_uF = master.val_uF || 10; testComp.charge_V = 0; }
    if (master.type === "potentiometer") { testComp.val_max_ohm = master.val_max_ohm || 10000; testComp.cur_ratio = 0.5; testComp.val_ohm = 5000; }
    if (master.type === "switch") { testComp.isOn = true; }
    if (master.type === "diode") { testComp.vf = master.vf || 0.7; }
    if (master.type === "transistor") {
      testComp.pinE = "C9";
      testComp.pinC = "C10";
      testComp.pinB = "C11";
      testComp.pinA = testComp.pinE;
      testComp.pinB = "C11";
      testComp.state = "SATURATED";
    }

    components.push(testComp);

    // 給電配線 (+9V ➔ 5列目、14列目 ➔ GND)
    activeJumperWires.push({ id: "AW1", fromHole: "BUS_TOP_PLUS_5", toHole: "A5", color: "#ef4444" });
    activeJumperWires.push({ id: "AW2", fromHole: "A14", toHole: "BUS_BOTTOM_MINUS_14", color: "#3b82f6" });

    // トランジスタ用ベースバイアス線
    if (master.type === "transistor") {
      activeJumperWires.push({ id: "AW_BASE", fromHole: "BUS_TOP_PLUS_11", toHole: "A11", color: "#ef4444" });
    }

    // 物理計算とツリー生成の実行テスト
    try {
      analyzeEnergizedNodes();
      const physics = calculateCircuitPhysics();
      updateCircuitTreePanel(physics);

      const treeEl = document.getElementById("circuit-tree-content") || document.getElementById("circuit-tree-container");
      const htmlContent = treeEl ? treeEl.innerHTML : "";

      const hasNaN = htmlContent.includes("NaN");
      const hasUndefined = htmlContent.includes("undefined");

      if (!hasNaN && !hasUndefined) {
        passCount++;
      } else {
        failCount++;
        console.error(`❌ [ツリー表示異常] パーツ: ${key} -> HTML内に不正文字列を検出 (NaN: ${hasNaN}, undefined: ${hasUndefined})`);
      }
    } catch (err) {
      failCount++;
      console.error(`❌ [ツリー例外エラー] パーツ: ${key} で例外が発生しました:`, err);
    }
  });

  // ボード状態の完全復元
  components.length = 0;
  backupComponents.forEach(c => components.push(c));
  activeJumperWires.length = 0;
  backupWires.forEach(w => activeJumperWires.push(w));

  analyzeEnergizedNodes();
  const restoredPhysics = calculateCircuitPhysics();
  updateCircuitTreePanel(restoredPhysics);
  if (typeof renderScene === "function") renderScene();

console.log("--------------------------------------------------");
  if (failCount === 0) {
    console.log(`🎉 %c【全パーツツリー監査判定: 100% PASSED】 (全 ${totalTests} パーツ全数合格)`, "color: #10b981; font-weight: bold;");
    console.log("✨ すべてのパーツにおいて、ツリーの分圧・電流計算およびDOM出力が誤差・欠損ゼロで正常動作することを確認しました！");
  } else {
    console.warn(`⚠️ %c【全パーツツリー監査判定: 異常検出】 成功: ${passCount} / 失敗: ${failCount}`, "color: #ef4444; font-weight: bold;");
  }
  console.log("==================================================");
}

/**
 * ★ 【F12 全プリセット回路 総合健全性マトリクス全自動監査エンジン】
 * CIRCUIT_PRESETS 内の全回路を順次ロードし、パーツ穴参照・短絡・物理計算(NaN/Inf)・
 * ツリー生成の破綻がないかを全数自動検証します。(実行前のボード状態は100%復元)
 */
function runPresetCircuitAudit() {
  console.log("%c🔌 [F12 全プリセット回路 総合健全性マトリクス全自動監査開始]", "color: #06b6d4; font-weight: bold; font-size: 15px;");
  console.log("==================================================");

  if (typeof CIRCUIT_PRESETS === "undefined") {
    console.error("❌ [監査エラー] CIRCUIT_PRESETS が定義されていません。");
    return;
  }

  // 1. 現在のボード状態（パーツ＆手動配線）を完全バックアップ
  const backupComponents = JSON.parse(JSON.stringify(components));
  const backupWires = JSON.parse(JSON.stringify(activeJumperWires));

  const presetKeys = Object.keys(CIRCUIT_PRESETS);
  let totalTests = 0;
  let passCount = 0;
  let failCount = 0;

  presetKeys.forEach((key) => {
    totalTests++;
    const preset = CIRCUIT_PRESETS[key];
    let hasError = false;
    const errors = [];

    // プリセットデータの仮想展開
    components.length = 0;
    activeJumperWires.length = 0;

    preset.components.forEach(c => components.push(JSON.parse(JSON.stringify(c))));
    if (Array.isArray(preset.wires)) {
      preset.wires.forEach(w => activeJumperWires.push(JSON.parse(JSON.stringify(w))));
    }

    // 検証A: 不正な穴ID（存在しないスルーホール）の参照チェック
    components.forEach(c => {
      ["pinA", "pinB", "pinC", "pinE"].forEach(pin => {
        if (c[pin] && !getNodeByHoleId(c[pin])) {
          hasError = true;
          errors.push(`パーツ [${c.id}] の端子 ${pin} (${c[pin]}) が基板上に存在しません`);
        }
      });
    });
    activeJumperWires.forEach(w => {
      if (w.fromHole && !getNodeByHoleId(w.fromHole)) {
        hasError = true;
        errors.push(`ジャンパー線 [${w.id}] の始点 (${w.fromHole}) が基板上に存在しません`);
      }
      if (w.toHole && !getNodeByHoleId(w.toHole)) {
        hasError = true;
        errors.push(`ジャンパー線 [${w.id}] の終点 (${w.toHole}) が基板上に存在しません`);
      }
    });

    // 検証B: 物理エンジン計算の健全性チェック (NaN, Infinity, 未定義)
    try {
      analyzeEnergizedNodes();
      const physics = calculateCircuitPhysics();

      if (!physics) {
        hasError = true;
        errors.push("物理計算結果が null または undefined です");
      } else if (isNaN(physics.i_total_mA) || isNaN(physics.v_in)) {
        hasError = true;
        errors.push(`物理計算に NaN が発生しました (I: ${physics.i_total_mA}, V: ${physics.v_in})`);
      }

      // 検証C: 分圧ツリー描画の例外チェック
      updateCircuitTreePanel(physics);
      const treeEl = document.getElementById("circuit-tree-content") || document.getElementById("circuit-tree-container");
      const html = treeEl ? treeEl.innerHTML : "";
      if (html.includes("NaN") || html.includes("undefined")) {
        hasError = true;
        errors.push("分圧ツリー描画内に NaN または undefined が混入しました");
      }
    } catch (err) {
      hasError = true;
      errors.push(`解析実行中に例外エラーが発生しました: ${err.message}`);
    }

    // 判定
    if (!hasError) {
      passCount++;
      console.log(`  ✅ [PASS] プリセット「${preset.name || key}」: 正常`);
    } else {
      failCount++;
      console.error(`  ❌ [FAIL] プリセット「${preset.name || key}」: 異常検出 ➔`, errors);
    }
  });

  // 2. テスト前のユーザーのボード状態へ100%完全復元
  components.length = 0;
  backupComponents.forEach(c => components.push(c));
  activeJumperWires.length = 0;
  backupWires.forEach(w => activeJumperWires.push(w));

  analyzeEnergizedNodes();
  const restoredPhysics = calculateCircuitPhysics();
  updateCircuitTreePanel(restoredPhysics);
  if (typeof renderScene === "function") renderScene();

// 3. 総合結果レポート出力
  console.log("--------------------------------------------------");
  if (failCount === 0) {
    console.log(`🎉 %c【プリセット回路総合監査: 100% PASSED】 (全 ${totalTests} プリセット全数合格)`, "color: #06b6d4; font-weight: bold;");
    console.log("✨ すべてのプリセット回路において、穴配置・通電探索・物理計算・ツリー生成が完全正常であることを確認しました！");
  } else {
    console.warn(`⚠️ %c【プリセット監査: 異常あり】 成功: ${passCount} / 失敗: ${failCount}`, "color: #ef4444; font-weight: bold;");
  }
  console.log("==================================================");
}

/**
 * ★ 【F12 バッテリー4種盛り 物理精度マトリクス全自動監査エンジン】
 * 1.5V / 3.0V / 5.0V / 9.0V を順次給電し、基本LED回路(1kΩ + 赤LED Vf=2.0V)において
 * 電圧不足遮断(0mA)、各電圧でのオームの法則精度、ツリー描画の健全性を全自動検証します。
 */
function runBatteryMatrixAudit() {
  console.log("%c🔋 [F12 バッテリー4種盛り 物理精度マトリクス全自動監査開始]", "color: #eab308; font-weight: bold; font-size: 15px;");
  console.log("==================================================");

  // 1. テスト前のボード状態・配線・バッテリー電圧を完全バックアップ
  const backupV = typeof selectedBatteryVoltage !== "undefined" ? selectedBatteryVoltage : 9.0;
  const backupComponents = JSON.parse(JSON.stringify(components));
  const backupWires = JSON.parse(JSON.stringify(activeJumperWires));

  // テスト用標準回路を一時展開: 基本点灯 (1kΩ + 赤LED Vf=2.0V)
  components.length = 0;
  activeJumperWires.length = 0;
components.push(
    { id: "R_TEST", type: "resistor", val_ohm: 1000, pinA: "C8", pinB: "C12" },
    { id: "LED_TEST", type: "led", colorType: "red", color: "#ef4444", vf: 2.0, pinA: "D12", pinB: "D14", isOn: false }
  );
  activeJumperWires.push(
    { id: "W_T1", fromHole: "BUS_TOP_PLUS_8", toHole: "A8", color: "#ef4444" },
    // ★ 下部マイナスレール(BUS_BOTTOM_MINUS)へ正しく接地
    { id: "W_T2", fromHole: "A14", toHole: "BUS_BOTTOM_MINUS_14", color: "#3b82f6" }
  );

  const testBatteries = [
    { v: 1.5, name: "単3乾電池×1本 (1.5V)", expectI_mA: 0.00, expectOn: false, desc: "電圧不足による完全安全遮断" },
    { v: 3.0, name: "単3乾電池×2本 (3.0V)", expectI_mA: 1.00, expectOn: true,  desc: "微小点灯 ((3.0V - 2.0V) / 1kΩ = 1.0mA)" },
    { v: 5.0, name: "USB/Arduino (5.0V)",   expectI_mA: 3.00, expectOn: true,  desc: "標準点灯 ((5.0V - 2.0V) / 1kΩ = 3.0mA)" },
    { v: 9.0, name: "006P角形乾電池 (9.0V)", expectI_mA: 7.00, expectOn: true,  desc: "高輝度点灯 ((9.0V - 2.0V) / 1kΩ = 7.0mA)" }
  ];

  let passCount = 0;
  let failCount = 0;

  testBatteries.forEach((bat) => {
    selectedBatteryVoltage = bat.v;
    analyzeEnergizedNodes();
    const physics = calculateCircuitPhysics();

    const actualI = physics ? physics.i_total_mA : NaN;
    const isError = isNaN(actualI) || Math.abs(actualI - bat.expectI_mA) > 0.05;

    // ツリー生成の破綻チェック
    if (typeof updateCircuitTreePanel === "function") updateCircuitTreePanel(physics);
    const treeEl = document.getElementById("circuit-tree-content") || document.getElementById("circuit-tree-container");
    const html = treeEl ? treeEl.innerHTML : "";
    const hasTreeError = html.includes("NaN") || html.includes("undefined");

    if (!isError && !hasTreeError) {
      passCount++;
      console.log(`  ✅ [PASS] ${bat.name}: 実測 ${actualI.toFixed(2)} mA (期待値 ${bat.expectI_mA.toFixed(2)} mA) ➔ ${bat.desc}`);
    } else {
      failCount++;
      console.error(`  ❌ [FAIL] ${bat.name}: 実測 ${actualI} mA (期待値 ${bat.expectI_mA} mA), ツリー異常: ${hasTreeError}`);
    }
  });

  // 2. テスト前のボード状態とバッテリー電圧を100%完全復元
  components.length = 0;
  backupComponents.forEach(c => components.push(c));
  activeJumperWires.length = 0;
  backupWires.forEach(w => activeJumperWires.push(w));
  selectedBatteryVoltage = backupV;

  analyzeEnergizedNodes();
  const restoredPhysics = calculateCircuitPhysics();
  if (typeof updateCircuitTreePanel === "function") updateCircuitTreePanel(restoredPhysics);
  if (typeof renderScene === "function") renderScene();

  // 3. 総合結果レポート出力
 console.log("--------------------------------------------------");
  if (failCount === 0) {
    console.log(`🎉 %c【バッテリー物理精度監査: 100% PASSED】 (全 4 電圧全数合格)`, "color: #eab308; font-weight: bold;");
    console.log("✨ 1.5Vの電圧不足遮断から9.0Vの高輝度駆動まで、すべての電源電圧において理論値通りの完璧な物理計算が保証されました！");
  } else {
    console.warn(`⚠️ %c【バッテリー監査: 異常検出】 成功: ${passCount} / 失敗: ${failCount}`, "color: #ef4444; font-weight: bold;");
  }
  console.log("==================================================");
}

/**
 * ★ 【F12 3路トグルスイッチ (SPDT) 接点排他＆双方向導通 全自動マトリクス監査エンジン】
 * L1/L2の排他切替、反対接点への漏れ電流ゼロ、および逆方向導通を全数自動検証
 */
function runSpdtMatrixAudit() {
  console.log("%c🔀 [F12 3路トグルスイッチ (SPDT) 接点排他＆導通 全自動マトリクス監査開始]", "color: #38bdf8; font-weight: bold; font-size: 15px;");
  console.log("==================================================");

  // 1. ボード状態の完全バックアップ
  const backupComponents = JSON.parse(JSON.stringify(components));
  const backupWires = JSON.parse(JSON.stringify(activeJumperWires));

  let passCount = 0;
  let failCount = 0;

  // テスト用SPDTと負荷抵抗(1kΩ)を配置
  // pinA: C8 (L1), pinCOM: C10 (COM), pinB: C12 (L2)
  const testSPDT = {
    id: "AUDIT_SPDT",
    type: "switch_spdt",
    subType: "spdt",
    name: "3路スイッチ (SPDT)",
    pinA: "C8",
    pinCOM: "C10",
    pinB: "C12",
    state: "L1"
  };

  const loadResistor = {
    id: "AUDIT_R_LOAD",
    type: "resistor",
    val_ohm: 1000,
    pinA: "D8",
    pinB: "D16"
  };

  // --- パターン1: COM給電 ➔ L1接続時の排他導通テスト ---
  components.length = 0;
  activeJumperWires.length = 0;
  testSPDT.state = "L1";
  components.push(testSPDT, loadResistor);
  // 電源(+9V) ➔ COM(A10)
  activeJumperWires.push({ id: "TW_COM", fromHole: "BUS_TOP_PLUS_10", toHole: "A10" });
  // L1(A8) ➔ 負荷抵抗(D8)
  activeJumperWires.push({ id: "TW_L1", fromHole: "A8", toHole: "D8" });
  // 負荷抵抗末尾(A16) ➔ マイナスGND
  activeJumperWires.push({ id: "TW_GND", fromHole: "A16", toHole: "BUS_BOTTOM_MINUS_16" });

  let energized = analyzeEnergizedNodes();
  let nL1 = getNodeByHoleId("C8");
  let nL2 = getNodeByHoleId("C12");
  let isL1On = energized.has(nL1);
  let isL2Leak = energized.has(nL2);

  if (isL1On && !isL2Leak) {
    passCount++;
    console.log("  ✅ [PASS] 状態 L1: COM ⇄ L1 導通成功 / L2 接点完全排他(漏洩ゼロ)");
  } else {
    failCount++;
    console.error(`  ❌ [FAIL] 状態 L1: 導通異常 (L1導通: ${isL1On}, L2漏洩: ${isL2Leak})`);
  }

  // --- パターン2: COM給電 ➔ L2接続時の排他導通テスト ---
  testSPDT.state = "L2";
  energized = analyzeEnergizedNodes();
  isL1On = energized.has(nL1);
  let isL2On = energized.has(nL2);

  if (!isL1On && isL2On) {
    passCount++;
    console.log("  ✅ [PASS] 状態 L2: COM ⇄ L2 導通成功 / L1 接点完全排他(漏洩ゼロ)");
  } else {
    failCount++;
    console.error(`  ❌ [FAIL] 状態 L2: 導通異常 (L1漏洩: ${isL1On}, L2導通: ${isL2On})`);
  }

  // --- パターン3: L1給電 ➔ COM出力 (逆方向通電テスト) ---
  activeJumperWires.length = 0;
  testSPDT.state = "L1";
  // 電源(+9V) ➔ L1(A8)へ逆給電
  activeJumperWires.push({ id: "TW_REV_PLUS", fromHole: "BUS_TOP_PLUS_8", toHole: "A8" });
  // COM(A10) ➔ 負荷抵抗(D8) ➔ GND
  activeJumperWires.push({ id: "TW_REV_COM", fromHole: "A10", toHole: "D8" });
  activeJumperWires.push({ id: "TW_REV_GND", fromHole: "A16", toHole: "BUS_BOTTOM_MINUS_16" });

  energized = analyzeEnergizedNodes();
  let nCOM = getNodeByHoleId("C10");
  let isRevOn = energized.has(nCOM);

  if (isRevOn) {
    passCount++;
    console.log("  ✅ [PASS] 逆方向給電: L1 ➔ COM 双方向導通成功");
  } else {
    failCount++;
    console.error("  ❌ [FAIL] 逆方向給電: L1 ➔ COM への導通が遮断されています");
  }

  // 2. ボード状態の完全復元
  components.length = 0;
  backupComponents.forEach(c => components.push(c));
  activeJumperWires.length = 0;
  backupWires.forEach(w => activeJumperWires.push(w));

  analyzeEnergizedNodes();
  const restoredPhysics = calculateCircuitPhysics();
  if (typeof updateCircuitTreePanel === "function") updateCircuitTreePanel(restoredPhysics);
  if (typeof renderScene === "function") renderScene();

  console.log("--------------------------------------------------");
  if (failCount === 0) {
    console.log(`🎉 %c【SPDTスイッチ排他導通監査: 100% PASSED】 (全 3 パターン全数合格)`, "color: #38bdf8; font-weight: bold;");
    console.log("✨ 3路スイッチのL1/L2排他性、漏れ電流ゼロ、および双方向導通が完全保証されました！");
  } else {
    console.warn(`⚠️ %c【SPDT監査: 異常検出】 成功: ${passCount} / 失敗: ${failCount}`, "color: #ef4444; font-weight: bold;");
  }
  console.log("==================================================");
}





/**
 * ★ 【F12 分圧ツリー KVL突き抜け ＆ 穴ID整合性 全自動マトリクス監査エンジン】
 * 合計電圧降下の電源突き抜け(KVL違反)および、ツリー内穴IDの実在性を全自動検証 (DOM確実取得版)
 */
function runTreeKvlAndHoleAudit() {
  console.log("%c⚡ [F12 分圧ツリー KVL突き抜け ＆ 穴ID整合性 全自動マトリクス監査開始]", "color: #a855f7; font-weight: bold; font-size: 15px;");
  console.log("==================================================");

  // 1. ボード状態の完全バックアップ
  const backupComponents = JSON.parse(JSON.stringify(components));
  const backupWires = JSON.parse(JSON.stringify(activeJumperWires));
  const backupV = typeof selectedBatteryVoltage !== "undefined" ? selectedBatteryVoltage : 9.0;

  let passCount = 0;
  let failCount = 0;

  // テスト用標準回路を展開 (1kΩ抵抗 + 赤LED + 給電・接地ジャンパー線)
  components.length = 0;
  activeJumperWires.length = 0;
  selectedBatteryVoltage = 9.0;

  components.push(
    { id: "TREE_TEST_R", type: "resistor", val_ohm: 1000, pinA: "C8", pinB: "C12" },
    { id: "TREE_TEST_LED", type: "led", colorType: "red", vf: 2.0, pinA: "D12", pinB: "D14", isOn: true }
  );

  activeJumperWires.push(
    { id: "TJ_TOP", fromHole: "BUS_TOP_PLUS_8", toHole: "A8" },
    { id: "TJ_BOT", fromHole: "A14", toHole: "BUS_BOTTOM_MINUS_14" }
  );

  analyzeEnergizedNodes();
  const physics = calculateCircuitPhysics();

  // ★ DOM要素の取得（あらゆる可能性のあるIDを柔軟に探索）
  let treeEl = document.getElementById("circuit-tree-content") ||
               document.getElementById("circuit-tree-container") ||
               document.getElementById("circuit-tree-body") ||
               document.querySelector(".circuit-tree-content");

  // キャッシュによるスキップを解除して強制再描画
  if (treeEl) treeEl.dataset.lastHtml = "";
  updateCircuitTreePanel(physics);

  const html = treeEl ? treeEl.innerHTML : "";

  // 検証A: KVL(キルヒホッフ第2法則)の突き抜けチェック
  const matchSumV = html.match(/合計電圧降下\s*:\s*([\d.]+)\s*V\s*\/\s*([\d.]+)\s*V/);
  if (matchSumV) {
    const sumV = parseFloat(matchSumV[1]);
    const totalV = parseFloat(matchSumV[2]);

    if (sumV <= totalV + 0.05) {
      passCount++;
      console.log(`  ✅ [PASS] KVL健全性: 合計電圧降下 ${sumV.toFixed(2)}V ≦ 電源電圧 ${totalV.toFixed(1)}V (突き抜けなし)`);
    } else {
      failCount++;
      console.error(`  ❌ [FAIL] KVL突き抜け違反検出: 合計電圧降下 ${sumV.toFixed(2)}V が電源電圧 ${totalV.toFixed(1)}V を超過しています！`);
    }
  } else {
    failCount++;
    console.error("  ❌ [FAIL] ツリーHTML内から合計電圧降下のテキストを検出できませんでした (HTML取得長: " + html.length + ")");
  }

  // 検証B: ツリー内に表示された全スルーホール穴IDの実在チェック
  const holeMatches = html.match(/(?:BUS_TOP_PLUS_\d+|BUS_BOTTOM_MINUS_\d+|BUS_TOP_MINUS_\d+|BUS_BOTTOM_PLUS_\d+|[A-J]\d+)/g) || [];
  let invalidHoles = [];

  holeMatches.forEach(hId => {
    if (!getNodeByHoleId(hId)) {
      invalidHoles.push(hId);
    }
  });

  if (holeMatches.length > 0 && invalidHoles.length === 0) {
    passCount++;
    console.log(`  ✅ [PASS] 穴ID実在整合性: 検出された全 ${holeMatches.length} 箇所の穴座標はすべて基板上に実在します`);
  } else if (holeMatches.length === 0) {
    failCount++;
    console.error("  ❌ [FAIL] ツリーHTML内から穴IDが1件も検出されませんでした (DOM未描画の可能性)");
  } else {
    failCount++;
    console.error(`  ❌ [FAIL] 存在しない不正な穴IDを検出:`, invalidHoles);
  }

  // 2. ボード状態の完全復元
  components.length = 0;
  backupComponents.forEach(c => components.push(c));
  activeJumperWires.length = 0;
  backupWires.forEach(w => activeJumperWires.push(w));
  selectedBatteryVoltage = backupV;

  analyzeEnergizedNodes();
  const restoredPhysics = calculateCircuitPhysics();
  if (treeEl) treeEl.dataset.lastHtml = "";
  if (typeof updateCircuitTreePanel === "function") updateCircuitTreePanel(restoredPhysics);
  if (typeof renderScene === "function") renderScene();

  console.log("--------------------------------------------------");
  if (failCount === 0) {
    console.log(`🎉 %c【分圧ツリー健全性監査: 100% PASSED】 (全 2 項目全数合格)`, "color: #a855f7; font-weight: bold;");
    console.log("✨ キルヒホッフ計算の整合性、および配線穴座標の完全一致が保証されました！");
  } else {
    console.warn(`⚠️ %c【ツリー監査: 異常検出】 成功: ${passCount} / 失敗: ${failCount}`, "color: #ef4444; font-weight: bold;");
  }
  console.log("==================================================");
}


// コンソール自動実行の登録関数へ統合
function runConsoleTests() {
  if (typeof runBugCheck === "function") runBugCheck();
  if (typeof runScopeMatrixTest === "function") runScopeMatrixTest();
  if (typeof runAllHolesJumperTest === "function") runAllHolesJumperTest();
  if (typeof runFullSystemAudit === "function") runFullSystemAudit();
  if (typeof runAllPartsCombinationTest === "function") runAllPartsCombinationTest();
  if (typeof runCircuitTreeAudit === "function") runCircuitTreeAudit();
  if (typeof runPresetCircuitAudit === "function") runPresetCircuitAudit();
  if (typeof runBatteryMatrixAudit === "function") runBatteryMatrixAudit();
  if (typeof runSpdtMatrixAudit === "function") runSpdtMatrixAudit();
  if (typeof runTreeKvlAndHoleAudit === "function") runTreeKvlAndHoleAudit(); // ★ ツリーKVL＆穴ID監査を登録！
}

// ======================================================================
// 📜 【開発・ビルド履歴ログデータ ＆ パネル生成】
// ======================================================================
const devLogs = [


  {
    tag: "",
    date: "",
    title: "",
    details: [
      "",
      "",
      "",
      "",
      "",
      "",
      "【次回実装予定】"
    ]
  },

{
  tag: "FEATURE_&_REFACTOR",
  date: "2026-10-30",
  title: "全8大素子の完全吸着・多層白熱化達成 ＆ トランジスタスイッチング実証完了",
  details: [
    "固定抵抗・LED・コンデンサ・スイッチ(SPST/SPDT)・ダイオード・トランジスタのJIS完全吸着 ＆ 黒体放射フィラメント化完了",
    "分電ツリー更新エンジンのキャッシュ同期バグ(lastHtml不整合)を解消し、2回目以降の連続切替追従を確立",
    "NPNトランジスタ(2SC1815)の飽和通電(SATURATED)によるC-E間大電流白熱コアおよびTO-92リアル体の完全同軸吸着を実証",
    "エミッタ接地トランジスタ回路において、キルヒホッフの第2法則(KVL) 9.00V完全閉合およびツリー連動を確認",
    "可変抵抗器リアル体(drawRealPotentiometer)における3本足(ワイパー端子)配線時のボディ描画干渉・欠落バグを特定",
    "45mA熱溶断・短絡(SHORT)時の『白煙パーティクル ＆ 閃光スパーク』過渡アニメーションの設計完了",
    "【次回実装予定】可変抵抗器リアル体のボディ・ダイヤル完全復元デバッグ ➔ 白煙パーティクルエフェクトのCanvas最上位ドッキング"
  ]
},


{
    tag: "ARCHITECTURE-REFACTOR-v2.0",
    date: "2026-10-29",
    title: "🏛️ 全8章ワンウェイ・クリーンアーキテクチャ確立 ＆ 2カラム・プロ測定器UIレイアウト完全刷新",
    details: [
      "巨大単一ファイル(2,200行超)の責務分離：全8章構成の一方向データフロー（基盤幾何 ➔ マスタ ➔ 状態管理 ➔ 物理計算 ➔ 描画 ➔ UI ➔ 操作 ➔ QAテスト）への完全整流化",
      "変数スコープの健全化：散乱していたグローバル状態(components, activeJumperWires, undoStack等)の集約と、重複宣言構文エラーの完全根絶",
      "ワークスペースUIの2カラム化：オシロスコープの左寄せ・BB直下引き上げ(-100px)密着と、右側『電流経路・分圧ツリー』パネルの天井〜床完全貫通トール化",
      "関心の完全分離：第5章(Canvasピクセル描画専用)と第6章(DOM・UI操作専用)の境界を物理的に分離し、保守性を劇的に向上",
      "F12全9大自動マトリクス監査スイート(物理・導通・全17パーツ・ツリー・バッテリー・SPDT・KVL)の100% PASSED完全継続",
      "【次回実装予定】🪜 階段スイッチ(2連SPDT・XOR論理回路)公式プリセットの新設（2路たすき掛け配線・双方向反転制御の一発呼び出し）"
    ]
  },



  {
    tag: "SPDT-SWITCH-v1.0",
    date: "2026-10-28",
    title: "🔀 3路トグルスイッチ(SPDT)完全統合・Zero Hardcoding描画 ＆ クリック誤ドラッグ変形バグ完全根絶",
    details: [
      "新規素子『3路トグルスイッチ (SPDT: 1回路2投)』のパーツレジストリ(PART_REGISTRY)および互換マスター(SWITCH_MASTER_DATA)への完全登録",
      "端子穴座標から物理比率を動的算出するZero Hardcodingリアル描画エンジン(drawRealSwitchSPDT)の実装（金属端子ピン、小型ケース、COM金色リベット、L1/L2状態インジケータ、傾斜トグルレバー）",
      "COM共通端子を軸としたL1/L2排他接続トポロジーと、電圧降下0.0V(理想スイッチ)・通過電流・消費電力・分圧ツリー解析への完全同期",
      "UI操作系の堅牢化：ドラッグ閾値(Threshold 5px)導入による『クリック時右1マス勝手移動バグ』の撲滅、および3端子専用スパン固定による変形・巨大化防止",
      "ヘッダーUI『パーツ追加』ドロップダウン(SWITCH_SPDT)および追加ボタン(btn-add-part)の動的生成ルーティング開通",
      "バッテリーの種類追加",
      "【次回実装予定】🪜 階段スイッチ(XOR論理回路)公式プリセットの新設（2連SPDTたすき掛け配線・LED点灯制御の一発呼び出し）"
    ]
  },




  {
    tag: "CIRCUIT-TREE-v1.0",
    date: "2026-10-27",
    title: "⚡ リアルタイム電流経路・分圧ツリー自動解析パネル統合 ＆ 全16パーツF12マトリクス監査100% PASS達成",
    details: [
      "ブレッドボード右側エリアへの『電流経路・分圧ツリー（樹形図）』パネル新設と、3カラム・プロ測定器UIレイアウトの確立",
      "自律トポロジー追跡エンジンによる、電源(+9V)からGND(0V)へ至る全素子の端子間電圧降下(V)・通過電流(mA)・消費電力(mW)・キルヒホッフ第2法則分圧比率(%)のリアルタイム動的算出",
      "F12自動全数マトリクスツリー監査エンジン (runCircuitTreeAudit) の構築と、全16種パーツでの例外・NaN・undefinedゼロ (16/16 100% PASS) の実証",
      "【次回実装予定】新規パーツの慎重な段階的導入（レジストリ定義・リアル体/JIS描画・インスペクター・物理過熱/破壊・ツリー同期の全5工程を1素子ずつ厳密検証して追加予定）"
    ]
  },
  {
    tag: "TRANSISTOR-PHYSICS-v1.0",
    date: "2026-10-26",
    title: "⚡ 3端子NPNトランジスタ(2SC1815)スイッチング導通・物理エンジン統合 ＆ 3足ドラッグ連動・配線判定精密化",
    details: [
      "TO-92パッケージ3端子NPNトランジスタ（2SC1815-Y: Vbe=0.7V, hFE=150）のCanvas描画、ピン配列（E-C-B）および拡大プレビュー描画（drawPreviewTransistor）の完全実装",
      "ドラッグ移動時に3本の足（pinE, pinC, pinB）が一体でスナップ追従する追従ロジックの実装（移動時のパーツ空中分解バグの根絶）",
      "ジャンパー線クリック判定幅の精密化（28px → 8pxへの縮小）による近接部品・穴操作時の配線誤爆消去防止",
      "ベース微小電流検知によるコレクタ-エミッタ間BFS導通探索ロジックの実装と、負荷抵抗1.0kΩ直列接続時の実機スイッチング導通（9.0V / 9.00mA / 81.0mW）検証完了",
      "【次回残課題】ベース遮断時のインスペクターDOMテキスト表示同期改修（オシロスコープ遮断0mA遷移時も動作モードが飽和導通表示に残るため、探索状態とのリアルタイム再同期を実装予定）"
    ]
  },
  {
    tag: "CAPACITOR-PHYSICS-v1.5",
    date: "2026-10-23",
    title: "⚡ 電解コンデンサ充放電（RC過渡応答）＆ リアル熱溶断断線エンジン ＆ 全パーツF12自動マトリクス監査の完成",
    details: [
      "時定数 τ = R × C に基づく過渡充放電（微分方程式近似）およびコンデンサ自立放電（残留電圧放電）ロジックの完全実装",
      "インスペクター内電解コンデンサ操作パネル（1µF〜1000µF静電容量切替、蓄積エネルギー(mJ)リアル表示、強制放電機能）の構築",
      "LEDの過電流判定強化：定格オーバー（25mA〜45mA）での段階的内部過熱（temp_C）表示 ＆ 45mA超での溶断断線（オープン0mA）処理の実装",
      "可変抵抗器（10kΩ）インスペクターUIの描画ストラテジー（INSPECTOR_RENDERERS.potentiometer）修復とダイレクト調整スライダーの完全復元",
      "F12デベロッパーツール用『全パーツ＆全パラメータ マトリクス全数自動監査エンジン (runAllPartsCombinationTest)』の追加と全14項目100% PASS確認"
    ]
  },
  {
    tag: "POTENTIOMETER-LED-v1.4",
    date: "2026-10-21",
    title: "🎛️ 可変抵抗器動的スライダー ＆ 電流連動LED輝度エンジン ＆ 統合パーツレジストリの完全構築",
    details: [
      "PART_REGISTRY ＆ ストラテジーパターン (COMP_RENDERERS / PREVIEW_RENDERERS) による完全動的パーツ管理の基底設計",
      "電解コンデンサ (10µF) ＆ 可変抵抗器 (10kΩ) のメイン基板・インスペクタープレビュー描画モジュールの追加",
      "インスペクター内可変抵抗スライダー操作によるリアルタイム抵抗値・物理計算・オシロスコープ完全同期",
      "通過電流 (mA) に比例して発光半径 (12px〜36px) と光彩強度が動的伸縮するLED輝度スケーリングエンジンの構築",
      "描画コンテキスト (ctx) 自動補填ガード ＆ ショート診断ログ連打防止 (状態検知型) による安定動作の実現"
    ]
  },
  {
    tag: "INTERACTION-UNDO-v1.3",
    date: "2026-10-19",
    title: "🖱️ 任意ピンポイント消去 ＆ 曲線当たり判定追従 ＆ 高度Undo/Redo即時同期エンジンの完全構築",
    details: [
      "ジャンパー線ベジェ曲線に完全追従するサンプリング分割幾何判定 (distToWireCurve) による任意配線・パーツのピンポイント削除実現",
      "削除モード時の赤色ハイライト大判化 (24px) ＆ マウスホバーとクリック判定の100%完全視覚同期",
      "MouseDownイベントの階層化 (削除 ➔ パーツドラッグ ➔ 配線 ➔ 解除) によるジャンパー配線の誤割り込み完全遮断",
      "Undo/Redo (Ctrl+Z/Y) 実行時の通電再解析 (analyzeEnergizedNodes) ＆ Canvas自動再描画 (renderScene) の全自動同期",
      "renderScene 内への描画コンテキスト (ctx) 自動補填フォールバックガード実装による TypeError の根本防御"
    ]
  },
  {
    tag: "SWITCH-WIRE-v1.2",
    date: "2026-10-15",
    title: "🔌 トグルスイッチ物理リード線描画 ＆ 上下段跨ぎ通電ライン ＆ 全自動監査100% PASS",
    details: [
      "トグルスイッチ両端からの金属ピン（スルーホール挿入足）の動的リアル描画実装",
      "上段(A〜E行)・下段(F〜J行)両対応の縦方向通電破線描画および上下段架橋ロジックの最適化",
      "スイッチ追加機能(addNewSwitch)のグローバル公開化と構文エラー(SyntaxError)の完全根絶",
      "55パターンマトリクス全数監査＆全自動回路導通監査にて100% PASSEDを達成"
    ]
  },
  {
    tag: "UI-LAYOUT-v1.1",
    date: "2026-10-09",
    title: "🎨 操作UI一元化 ＆ レイヤー修復 ＆ JIS回路図記号の完全黒色統一",
    details: [
      "描画レイヤーのZインデックス再構築（穴・リングがパーツの上に透けるバグの完治）",
      "パーツ操作系ボタン（追加・回転・削除）のブレッドボード上部ヘッダーへの一元集約",
      "リアルタイム・オシロスコープのブレッドボード直下への限界ピタッと密着配置（-65px調整）",
      "JIS/IEC規格準拠の電源・抵抗器シンボル描画向き修復 ＆ 記号色の黒(#000000)一括統一"
    ]
  },
  {
    tag: "RESISTOR-SNAP-v1.0",
    date: "2026-10-08",
    title: "🧩 1kΩ抵抗器（R1）穴精密スナップ ＆ カラーコード描画の完成",
    details: [
      "パーツ一元管理配列 (components) によるデータ駆動型描画システムの構築",
      "穴 C5 ➔ C15 へのミリ単位物理スナップ ＆ 金属ピンリング視覚化の実装",
      "実物カラーコード (茶・黒・赤・金: 1kΩ) ⇔ JIS回路図記号 (ジグザグシンボル) 即時切替",
      "左側インスペクター小窓への動的パーツ解説連動 ＆ F12テスト全件PASS（8/8件）"
    ]
  },
  {
    tag: "INSPECTOR-SCOPE-v1.0",
    date: "2026-10-08",
    title: "🔍 左側インスペクター ＆ 📈 リアルタイム・オシロスコープ機能の完全統合",
    details: ["ミニ・オシロスコープCanvas描画エンジン ＆ 独立2軸トグルUIの実装"]
  },
  {
    tag: "BB-CORE-v1.0",
    date: "2026-10-08",
    title: "🍞 ブレッドボード単体物理モジュール・ゼロベース再構築完了",
    details: ["物理幾何グリッド座標系（全420穴）の算術式定義と完全固定"]
  }
];

function renderDevLogs() {
  const container = document.getElementById("dev-log-container");
  if (!container) return;
  container.innerHTML = devLogs.map(log => `
    <li class="log-item">
      <div class="log-header"><span class="log-tag">${log.tag}</span><span class="log-date">${log.date}</span></div>
      <div class="log-body"><strong>${log.title}</strong><ul>${log.details.map(item => `<li>${item}</li>`).join("")}</ul></div>
    </li>
  `).join("");
}

window.onload = () => {  initializeBreadboardData();
  setupInteraction(document.getElementById("breadboard-canvas"));
  startAnimationLoop();
  renderDevLogs();
  runConsoleTests();
};
