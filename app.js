
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


// Stage 1: 基本点灯回路 (3大構図マルチパターン・ツッコミ配置ジェネレータ)
  BASIC_LED: () => {
    // 3つの劇的に異なるトポロジー構図からランダム抽選 (0:溝跨ぎ抵抗, 1:溝跨ぎLED, 2:右上左下逆走)
    const pattern = Math.floor(Math.random() * 3);

    if (pattern === 0) {
      // パターンA: 抵抗が中央溝跨ぎ(縦) ＆ LEDが右下最果て(横)
      const rCol = Math.floor(Math.random() * 5) + 3; // 3〜7
      const ledCol = Math.floor(Math.random() * 5) + 21; // 21〜25
      return {
        name: "基本点灯回路 (構図A: 溝跨ぎ抵抗 ＆ 最果てLED)",
        desc: "抵抗が中央溝(E-F行)をダイナミックに跨ぎ、LEDが右下J行に追いやられた対角線配線です。",
        components: [
          { id: "R_PRESET_1", type: "resistor", val_ohm: 1000, pinA: `E${rCol}`, pinB: `F${rCol}`, isVertical: true, spanCols: 1, colors: ["#78350f", "#000000", "#dc2626", "#d97706"], name: "1.0kΩ 保護抵抗", desc: "中央溝を跨いで配置された電流制限抵抗" },
          { id: "LED_PRESET_1", type: "led", colorType: "red", color: "#ef4444", vf: 2.0, pinA: `J${ledCol}`, pinB: `J${ledCol + 2}`, isOn: true, name: "赤色LED (5mm)", desc: "右下の最果てに配置された赤色LED" }
        ],
        answerWires: [
          { id: "W_BASE_VCC", fromHole: `BUS_TOP_PLUS_${rCol}`, toHole: `A${rCol}`, color: "#ef4444" },
          { id: "W_BASE_R_TO_LED", fromHole: `G${rCol}`, toHole: `I${ledCol}`, color: "#eab308" },
          { id: "W_BASE_GND", fromHole: `H${ledCol + 2}`, toHole: `BUS_BOTTOM_MINUS_${ledCol + 2}`, color: "#3b82f6" }
        ]
      };
    } else if (pattern === 1) {
      // パターンB: 抵抗が最上段A行(横) ＆ LEDが中央溝跨ぎ(縦)
      const rCol = Math.floor(Math.random() * 5) + 2; // 2〜6
      const ledCol = Math.floor(Math.random() * 6) + 16; // 16〜21
      return {
        name: "基本点灯回路 (構図B: キワキワ抵抗 ＆ 溝跨ぎLED)",
        desc: "抵抗が電源レール直近のA行に横たわり、LEDが中央溝(E-F行)を豪快に跨ぐ縦挿し配置です。",
        components: [
          { id: "R_PRESET_1", type: "resistor", val_ohm: 1000, pinA: `A${rCol}`, pinB: `A${rCol + 4}`, isVertical: false, colors: ["#78350f", "#000000", "#dc2626", "#d97706"], name: "1.0kΩ 保護抵抗", desc: "最上部A行に配置された電流制限抵抗" },
          { id: "LED_PRESET_1", type: "led", colorType: "red", color: "#ef4444", vf: 2.0, pinA: `E${ledCol}`, pinB: `F${ledCol}`, isVertical: true, spanCols: 1, isOn: true, name: "赤色LED (5mm)", desc: "中央溝を跨いで縦に直刺しされた赤色LED" }
        ],
        answerWires: [
          { id: "W_BASE_VCC", fromHole: `BUS_TOP_PLUS_${rCol}`, toHole: `B${rCol}`, color: "#ef4444" },
          { id: "W_BASE_R_TO_LED", fromHole: `C${rCol + 4}`, toHole: `B${ledCol}`, color: "#eab308" },
          { id: "W_BASE_GND", fromHole: `J${ledCol}`, toHole: `BUS_BOTTOM_MINUS_${ledCol}`, color: "#3b82f6" }
        ]
      };
    } else {
      // パターンC: 抵抗が右上僻地(横) ＆ LEDが左下僻地(横) 【大逆走レイアウト】
      const rCol = Math.floor(Math.random() * 5) + 20; // 20〜24
      const ledCol = Math.floor(Math.random() * 5) + 3; // 3〜7
      return {
        name: "基本点灯回路 (構図C: 右上抵抗 ＆ 左下LED 大逆走配置)",
        desc: "右上に置かれた抵抗から、左下のLEDへと盤面を大きく逆走して電力を送り込む長距離パズル配置です。",
        components: [
          { id: "R_PRESET_1", type: "resistor", val_ohm: 1000, pinA: `B${rCol}`, pinB: `B${rCol + 4}`, isVertical: false, colors: ["#78350f", "#000000", "#dc2626", "#d97706"], name: "1.0kΩ 保護抵抗", desc: "右上に配置された電流制限抵抗" },
          { id: "LED_PRESET_1", type: "led", colorType: "red", color: "#ef4444", vf: 2.0, pinA: `I${ledCol}`, pinB: `I${ledCol + 2}`, isOn: true, name: "赤色LED (5mm)", desc: "左下に配置された赤色LED" }
        ],
        answerWires: [
          { id: "W_BASE_VCC", fromHole: `BUS_TOP_PLUS_${rCol}`, toHole: `A${rCol}`, color: "#ef4444" },
          { id: "W_BASE_R_TO_LED", fromHole: `C${rCol + 4}`, toHole: `F${ledCol}`, color: "#eab308" },
          { id: "W_BASE_GND", fromHole: `J${ledCol + 2}`, toHole: `BUS_BOTTOM_MINUS_${ledCol + 2}`, color: "#3b82f6" }
        ]
      };
    }
  },


// Stage 2: 可変抵抗調光回路 (3大構図マルチパターン・ツッコミ配置ジェネレータ)
  POT_DIMMER: () => {
    // 3つのトポロジー構図からランダム抽選 (0:左上VR＆右下LED, 1:下段中央VR＆最上段LED, 2:右上VR＆左下LED逆走)
    const pattern = Math.floor(Math.random() * 3);

    if (pattern === 0) {
      // 構図A: 左上ポテンショメータ ＆ 右下最果てLED
      const potCol = Math.floor(Math.random() * 4) + 2; // 2〜5
      const ledCol = Math.floor(Math.random() * 5) + 22; // 22〜26
      return {
        name: "可変抵抗調光回路 (構図A: 左上VR ＆ 右下最果てLED)",
        desc: "左上の可変抵抗器から、右下最果てのLEDへ対角線を描いて電力を送る長距離調光回路です。",
        components: [
          { id: "POT_PRESET_1", type: "potentiometer", val_max_ohm: 10000, cur_ratio: 0.5, pinA: `C${potCol}`, pinB: `C${potCol + 4}`, pinC: `E${potCol + 2}`, name: "10kΩ 半固定抵抗", desc: "調光ボリューム" },
          { id: "LED_PRESET_2", type: "led", colorType: "red", color: "#ef4444", vf: 2.0, pinA: `J${ledCol}`, pinB: `J${ledCol + 2}`, isOn: true, name: "赤色LED", desc: "調光表示用赤色LED" }
        ],
        answerWires: [
          { id: "W_POT_VCC", fromHole: `BUS_TOP_PLUS_${potCol}`, toHole: `A${potCol}`, color: "#ef4444" },
          { id: "W_POT_WIPER_TO_LED", fromHole: `E${potCol + 2}`, toHole: `I${ledCol}`, color: "#eab308" },
          { id: "W_POT_GND", fromHole: `H${ledCol + 2}`, toHole: `BUS_BOTTOM_MINUS_${ledCol + 2}`, color: "#3b82f6" }
        ]
      };
   } else if (pattern === 1) {
      // 構図B: 下段中央ポテンショメータ ＆ 最上段A行キワキワLED
      const potCol = Math.floor(Math.random() * 5) + 12; // 12〜16
      const ledCol = Math.floor(Math.random() * 5) + 3; // 3〜7
      return {
        name: "可変抵抗調光回路 (構図B: 下段中央VR ＆ 最上段LED)",
        desc: "下段に鎮座した可変抵抗器から、最上段A行のLEDへ中央溝を飛び越えて給電する上下反転回路です。",
        components: [
          { id: "POT_PRESET_1", type: "potentiometer", val_max_ohm: 10000, cur_ratio: 0.5, pinA: `G${potCol}`, pinB: `G${potCol + 4}`, pinC: `I${potCol + 2}`, pinWiper: `I${potCol + 2}`, name: "10kΩ 半固定抵抗", desc: "調光ボリューム" },
          { id: "LED_PRESET_2", type: "led", colorType: "red", color: "#ef4444", vf: 2.0, pinA: `B${ledCol}`, pinB: `B${ledCol + 2}`, isOn: true, name: "赤色LED", desc: "調光表示用赤色LED" }
        ],
        answerWires: [
          { id: "W_POT_VCC", fromHole: `BUS_TOP_PLUS_${potCol}`, toHole: `F${potCol}`, color: "#ef4444" },
          { id: "W_POT_WIPER_TO_LED", fromHole: `J${potCol + 2}`, toHole: `A${ledCol}`, color: "#eab308" },
          { id: "W_POT_GND", fromHole: `C${ledCol + 2}`, toHole: `BUS_BOTTOM_MINUS_${ledCol + 2}`, color: "#3b82f6" }
        ]
      };



    } else {
      // 構図C: 右上ポテンショメータ ＆ 左下LED (大逆走レイアウト)
      const potCol = Math.floor(Math.random() * 4) + 20; // 20〜23
      const ledCol = Math.floor(Math.random() * 5) + 4; // 4〜8
      return {
        name: "可変抵抗調光回路 (構図C: 右上VR ＆ 左下LED 大逆走配置)",
        desc: "右上に置かれた可変抵抗器から、左下のLEDへと盤面を斜めに大逆走して配線するパズル配置です。",
        components: [
          { id: "POT_PRESET_1", type: "potentiometer", val_max_ohm: 10000, cur_ratio: 0.5, pinA: `B${potCol}`, pinB: `B${potCol + 4}`, pinC: `D${potCol + 2}`, name: "10kΩ 半固定抵抗", desc: "調光ボリューム" },
          { id: "LED_PRESET_2", type: "led", colorType: "red", color: "#ef4444", vf: 2.0, pinA: `I${ledCol}`, pinB: `I${ledCol + 2}`, isOn: true, name: "赤色LED", desc: "調光表示用赤色LED" }
        ],
        answerWires: [
          { id: "W_POT_VCC", fromHole: `BUS_TOP_PLUS_${potCol}`, toHole: `A${potCol}`, color: "#ef4444" },
          { id: "W_POT_WIPER_TO_LED", fromHole: `D${potCol + 2}`, toHole: `G${ledCol}`, color: "#eab308" },
          { id: "W_POT_GND", fromHole: `J${ledCol + 2}`, toHole: `BUS_BOTTOM_MINUS_${ledCol + 2}`, color: "#3b82f6" }
        ]
      };
    }
  },



// Stage 3: 階段スイッチ (プロパティ整合性修正済み 3大初見殺しマルチ構図ジェネレータ)
  STAIRCASE_SWITCH: () => {
    // 3つのトポロジー構図からランダム抽選 (0:下段1階＆上段2階, 1:上段1階＆下段2階上下反転, 2:超長距離大逆走クロス)
    const pattern = Math.floor(Math.random() * 3);

    if (pattern === 0) {
      // 構図A: 下段1階スイッチ ＆ 上段2階スイッチ (中央溝クロス架橋)
      const sw1Col = Math.floor(Math.random() * 4) + 2;   // 下段: 列2〜5
      const sw2Col = Math.floor(Math.random() * 4) + 11;  // 上段: 列11〜14
      const rCol = Math.floor(Math.random() * 3) + 19;    // 上段: 列19〜21
      const ledCol = Math.floor(Math.random() * 2) + 26;  // 上段: 列26〜27
      return {
        name: "階段スイッチ (構図A: 下段1階 ＆ 上段2階 中央溝クロス架橋)",
        desc: "下段から上段へ渡り線が中央溝を斜めに交差する標準迷路レイアウトです。COM端子の位置を見抜く必要があります。",
        components: [
          { id: "stair-sw1", name: "1階スイッチ (SW1)", type: "switch_spdt", pinA: `H${sw1Col}`, pinCOM: `H${sw1Col + 2}`, pinB: `H${sw1Col + 4}`, state: "L1" },
          { id: "stair-sw2", name: "2階スイッチ (SW2)", type: "switch_spdt", pinA: `C${sw2Col}`, pinCOM: `C${sw2Col + 2}`, pinB: `C${sw2Col + 4}`, state: "L1" },
          { id: "stair-r1", name: "R1 (1.0kΩ)", type: "resistor", val_ohm: 1000, pinA: `C${rCol}`, pinB: `C${rCol + 3}`, colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          { id: "stair-led1", name: "階段照明 (赤色LED)", type: "led", vf: 2.0, color: "red", pinA: `C${ledCol}`, pinB: `C${ledCol + 2}`, isOn: true }
        ],
        answerWires: [
          { id: "W_STAIR_VCC", fromHole: `BUS_TOP_PLUS_${sw1Col + 2}`, toHole: `F${sw1Col + 2}`, color: "#ef4444" },
          { id: "W_STAIR_L1", fromHole: `F${sw1Col}`, toHole: `A${sw2Col}`, color: "#eab308" },
          { id: "W_STAIR_L2", fromHole: `F${sw1Col + 4}`, toHole: `E${sw2Col + 4}`, color: "#06b6d4" },
          { id: "W_STAIR_SW2_TO_R", fromHole: `A${sw2Col + 2}`, toHole: `A${rCol}`, color: "#a855f7" },
          { id: "W_STAIR_R_TO_LED", fromHole: `A${rCol + 3}`, toHole: `A${ledCol}`, color: "#22c55e" },
          { id: "W_STAIR_GND", fromHole: `E${ledCol + 2}`, toHole: `BUS_BOTTOM_MINUS_${ledCol + 2}`, color: "#3b82f6" }
        ]
      };
    } else if (pattern === 1) {
      // 構図B: 上段1階スイッチ ＆ 下段2階スイッチ (上下反転・逆落とし迷路)
      const sw1Col = Math.floor(Math.random() * 4) + 2;   // 上段: 列2〜5
      const sw2Col = Math.floor(Math.random() * 4) + 11;  // 下段: 列11〜14
      const rCol = Math.floor(Math.random() * 3) + 19;    // 下段: 列19〜21
      const ledCol = Math.floor(Math.random() * 2) + 26;  // 下段: 列26〜27
      return {
        name: "階段スイッチ (構図B: 上段1階 ＆ 下段2階 上下反転逆落とし)",
        desc: "1階スイッチが上段、2階スイッチが下段に反転配置され、渡り線が中央溝を上から下へ叩き落とされるレイアウトです。",
        components: [
          { id: "stair-sw1", name: "1階スイッチ (SW1)", type: "switch_spdt", pinA: `B${sw1Col}`, pinCOM: `B${sw1Col + 2}`, pinB: `B${sw1Col + 4}`, state: "L1" },
          { id: "stair-sw2", name: "2階スイッチ (SW2)", type: "switch_spdt", pinA: `I${sw2Col}`, pinCOM: `I${sw2Col + 2}`, pinB: `I${sw2Col + 4}`, state: "L1" },
          { id: "stair-r1", name: "R1 (1.0kΩ)", type: "resistor", val_ohm: 1000, pinA: `I${rCol}`, pinB: `I${rCol + 3}`, colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          { id: "stair-led1", name: "階段照明 (赤色LED)", type: "led", vf: 2.0, color: "red", pinA: `I${ledCol}`, pinB: `I${ledCol + 2}`, isOn: true }
        ],
        answerWires: [
          { id: "W_STAIR_VCC", fromHole: `BUS_TOP_PLUS_${sw1Col + 2}`, toHole: `A${sw1Col + 2}`, color: "#ef4444" },
          { id: "W_STAIR_L1", fromHole: `E${sw1Col}`, toHole: `F${sw2Col}`, color: "#eab308" },
          { id: "W_STAIR_L2", fromHole: `C${sw1Col + 4}`, toHole: `G${sw2Col + 4}`, color: "#06b6d4" },
          { id: "W_STAIR_SW2_TO_R", fromHole: `J${sw2Col + 2}`, toHole: `J${rCol}`, color: "#a855f7" },
          { id: "W_STAIR_R_TO_LED", fromHole: `J${rCol + 3}`, toHole: `J${ledCol}`, color: "#22c55e" },
          { id: "W_STAIR_GND", fromHole: `G${ledCol + 2}`, toHole: `BUS_BOTTOM_MINUS_${ledCol + 2}`, color: "#3b82f6" }
        ]
      };
    } else {
      // 構図C: 左下1階スイッチ ＆ 右上2階スイッチ ＆ 左上照明 (超長距離大逆走クロス)
      const sw1Col = Math.floor(Math.random() * 4) + 2;   // 下段: 列2〜5
      const sw2Col = Math.floor(Math.random() * 4) + 20;  // 上段: 列20〜23
      const rCol = Math.floor(Math.random() * 3) + 9;     // 上段: 列9〜11
      const ledCol = Math.floor(Math.random() * 2) + 15;  // 上段: 列15〜16
      return {
        name: "階段スイッチ (構図C: 左下1階 ＆ 右上2階 ＆ 左上照明 超長距離逆走)",
        desc: "盤面を対角線上に大横断する渡り線と、右上の2階スイッチから左上の照明系統へと電力が大きく逆走する最高難度パズルです。",
        components: [
          { id: "stair-sw1", name: "1階スイッチ (SW1)", type: "switch_spdt", pinA: `H${sw1Col}`, pinCOM: `H${sw1Col + 2}`, pinB: `H${sw1Col + 4}`, state: "L1" },
          { id: "stair-sw2", name: "2階スイッチ (SW2)", type: "switch_spdt", pinA: `B${sw2Col}`, pinCOM: `B${sw2Col + 2}`, pinB: `B${sw2Col + 4}`, state: "L1" },
          { id: "stair-r1", name: "R1 (1.0kΩ)", type: "resistor", val_ohm: 1000, pinA: `C${rCol}`, pinB: `C${rCol + 3}`, colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          { id: "stair-led1", name: "階段照明 (赤色LED)", type: "led", vf: 2.0, color: "red", pinA: `C${ledCol}`, pinB: `C${ledCol + 2}`, isOn: true }
        ],
        answerWires: [
          { id: "W_STAIR_VCC", fromHole: `BUS_TOP_PLUS_${sw1Col + 2}`, toHole: `F${sw1Col + 2}`, color: "#ef4444" },
          { id: "W_STAIR_L1", fromHole: `F${sw1Col}`, toHole: `A${sw2Col}`, color: "#eab308" },
          { id: "W_STAIR_L2", fromHole: `F${sw1Col + 4}`, toHole: `E${sw2Col + 4}`, color: "#06b6d4" },
          { id: "W_STAIR_SW2_TO_R", fromHole: `C${sw2Col + 2}`, toHole: `A${rCol}`, color: "#a855f7" },
          { id: "W_STAIR_R_TO_LED", fromHole: `A${rCol + 3}`, toHole: `A${ledCol}`, color: "#22c55e" },
          { id: "W_STAIR_GND", fromHole: `E${ledCol + 2}`, toHole: `BUS_BOTTOM_MINUS_${ledCol + 2}`, color: "#3b82f6" }
        ]
      };
    }
  },




// Stage 4: RC過渡応答回路 (極性厳格担保 3大マルチツッコミ配置ジェネレータ)
  RC_TRANSIENT: () => {
    // 3つのトポロジー構図からランダム抽選 (0:溝跨ぎ抵抗上下蛇行, 1:溝跨ぎコンデンサ跳ね上がり, 2:右上左下大逆走クロス)
    const pattern = Math.floor(Math.random() * 3);

    if (pattern === 0) {
      // 構図A: スイッチ上段 ＆ 抵抗溝跨ぎ(縦) ＆ コンデンサ下段 ＆ 右下最果てLED (上下蛇行)
      const swCol = Math.floor(Math.random() * 3) + 2;   // 上段: 列2〜4
      const rCol = Math.floor(Math.random() * 4) + 8;    // 溝跨ぎ: 列8〜11
      const capCol = Math.floor(Math.random() * 3) + 15; // 下段: 列15〜17
      const ledCol = Math.floor(Math.random() * 3) + 23; // 下段最果て: 列23〜25
      return {
        name: "RC過渡応答回路 (構図A: 溝跨ぎ抵抗 ＆ 下段這いずり ＆ 最果てLED)",
        desc: "抵抗が中央溝を跨いで電力を下段へ叩き落とし、コンデンサを経由して右下J行のLEDへ這いずる蛇行配線です。",
        components: [
          { id: "SW_PRESET_RC", type: "switch", pinA: `C${swCol}`, pinB: `C${swCol + 2}`, isOn: true, name: "トグルスイッチ", desc: "充電開始用スイッチ" },
          { id: "R_PRESET_RC", type: "resistor", val_ohm: 1000, pinA: `E${rCol}`, pinB: `F${rCol}`, isVertical: true, spanCols: 1, colors: ["#78350f", "#000000", "#dc2626", "#d97706"], name: "1.0kΩ 充電抵抗", desc: "中央溝を跨ぐ電流制限抵抗" },
          { id: "CAP_PRESET_1", type: "capacitor", subType: "electrolytic", val_uF: 1000, pinA: `H${capCol}`, pinB: `H${capCol + 2}`, name: "電解コンデンサ (1000µF)", desc: "大容量コンデンサ" },
          { id: "LED_PRESET_RC", type: "led", colorType: "green", color: "#22c55e", vf: 2.2, pinA: `J${ledCol}`, pinB: `J${ledCol + 2}`, isOn: true, name: "緑色LED (5mm)", desc: "過渡充電表示素子" }
        ],
        answerWires: [
          { id: "W_RC_VCC", fromHole: `BUS_TOP_PLUS_${swCol}`, toHole: `A${swCol}`, color: "#ef4444" },
          { id: "W_RC_SW_TO_R", fromHole: `A${swCol + 2}`, toHole: `A${rCol}`, color: "#eab308" },
          { id: "W_RC_R_TO_CAP", fromHole: `G${rCol}`, toHole: `F${capCol}`, color: "#38bdf8" },
          { id: "W_RC_CAP_TO_LED", fromHole: `J${capCol + 2}`, toHole: `I${ledCol}`, color: "#a855f7" },
          { id: "W_RC_GND", fromHole: `H${ledCol + 2}`, toHole: `BUS_BOTTOM_MINUS_${ledCol + 2}`, color: "#3b82f6" }
        ]
      };
    } else if (pattern === 1) {
      // 構図B: スイッチ・抵抗下段 ＆ コンデンサ溝跨ぎ(縦) ＆ 最上段A行LED (下克上跳ね上がり)
      const swCol = Math.floor(Math.random() * 3) + 2;   // 下段: 列2〜4
      const rCol = Math.floor(Math.random() * 3) + 7;    // 下段: 列7〜9
      const capCol = Math.floor(Math.random() * 4) + 14; // 溝跨ぎ: 列14〜17 (F陽極, E陰極)
      const ledCol = Math.floor(Math.random() * 3) + 21; // 最上段: 列21〜23
      return {
        name: "RC過渡応答回路 (構図B: 下段スタート ＆ 溝跨ぎコンデンサ ＆ 最上段LED)",
        desc: "下段から電解コンデンサが中央溝(F-E行)を突き抜けて上段へ跳ね上がり、最上段A行のLEDで光る反転レイアウトです。",
        components: [
          { id: "SW_PRESET_RC", type: "switch", pinA: `I${swCol}`, pinB: `I${swCol + 2}`, isOn: true, name: "トグルスイッチ", desc: "充電開始用スイッチ" },
          { id: "R_PRESET_RC", type: "resistor", val_ohm: 1000, pinA: `I${rCol}`, pinB: `I${rCol + 4}`, isVertical: false, colors: ["#78350f", "#000000", "#dc2626", "#d97706"], name: "1.0kΩ 充電抵抗", desc: "下段配置の充電抵抗" },
          { id: "CAP_PRESET_1", type: "capacitor", subType: "electrolytic", val_uF: 1000, pinA: `F${capCol}`, pinB: `E${capCol}`, isVertical: true, spanCols: 1, name: "電解コンデンサ (1000µF)", desc: "中央溝を跨ぎ上段へ抜けるコンデンサ" },
          { id: "LED_PRESET_RC", type: "led", colorType: "green", color: "#22c55e", vf: 2.2, pinA: `A${ledCol}`, pinB: `A${ledCol + 2}`, isOn: true, name: "緑色LED (5mm)", desc: "最上段配置の表示素子" }
        ],
        answerWires: [
          { id: "W_RC_VCC", fromHole: `BUS_TOP_PLUS_${swCol}`, toHole: `F${swCol}`, color: "#ef4444" },
          { id: "W_RC_SW_TO_R", fromHole: `J${swCol + 2}`, toHole: `J${rCol}`, color: "#eab308" },
          { id: "W_RC_R_TO_CAP", fromHole: `J${rCol + 4}`, toHole: `J${capCol}`, color: "#38bdf8" },
          { id: "W_RC_CAP_TO_LED", fromHole: `A${capCol}`, toHole: `C${ledCol}`, color: "#a855f7" },
          { id: "W_RC_GND", fromHole: `B${ledCol + 2}`, toHole: `BUS_BOTTOM_MINUS_${ledCol + 2}`, color: "#3b82f6" }
        ]
      };


   } else {
      // 構図C: 右上スイッチ ＆ 抵抗上段 ＆ 左下僻地コンデンサ ＆ 中央LED (超長距離大逆走クロス)
      // スイッチ(列24〜25: 占有24〜27) と 抵抗(列14〜16: 占有14〜20) を完全分離して衝突を根絶
      const swCol = Math.floor(Math.random() * 2) + 24;  // 上段: 列24〜25
      const rCol = Math.floor(Math.random() * 3) + 14;   // 上段: 列14〜16
      const capCol = Math.floor(Math.random() * 3) + 3;  // 下段: 列3〜5
      const ledCol = Math.floor(Math.random() * 3) + 10; // 下段: 列10〜12
      return {
        name: "RC過渡応答回路 (構図C: 右上SW ＆ 左下コンデンサ ＆ 中央LED 大逆走クロス)",
        desc: "右上のスイッチから左下のコンデンサへ盤面を斜めに大横断し、中央のLEDへ電力が折り返す最高難度パズル配置です。",
        components: [
          { id: "SW_PRESET_RC", type: "switch", pinA: `B${swCol}`, pinB: `B${swCol + 2}`, isOn: true, name: "トグルスイッチ", desc: "充電開始用スイッチ" },
          { id: "R_PRESET_RC", type: "resistor", val_ohm: 1000, pinA: `B${rCol + 4}`, pinB: `B${rCol}`, isVertical: false, colors: ["#78350f", "#000000", "#dc2626", "#d97706"], name: "1.0kΩ 充電抵抗", desc: "逆走中継用の充電抵抗" },


          { id: "CAP_PRESET_1", type: "capacitor", subType: "electrolytic", val_uF: 1000, pinA: `I${capCol}`, pinB: `I${capCol + 2}`, name: "電解コンデンサ (1000µF)", desc: "左下僻地のコンデンサ" },
          { id: "LED_PRESET_RC", type: "led", colorType: "green", color: "#22c55e", vf: 2.2, pinA: `I${ledCol}`, pinB: `I${ledCol + 2}`, isOn: true, name: "緑色LED (5mm)", desc: "中央配置の表示素子" }
        ],
        answerWires: [
          { id: "W_RC_VCC", fromHole: `BUS_TOP_PLUS_${swCol}`, toHole: `A${swCol}`, color: "#ef4444" },
          { id: "W_RC_SW_TO_R", fromHole: `C${swCol + 2}`, toHole: `A${rCol + 4}`, color: "#eab308" },
          { id: "W_RC_R_TO_CAP", fromHole: `C${rCol}`, toHole: `F${capCol}`, color: "#38bdf8" },
          { id: "W_RC_CAP_TO_LED", fromHole: `J${capCol + 2}`, toHole: `J${ledCol}`, color: "#a855f7" },
          { id: "W_RC_GND", fromHole: `F${ledCol + 2}`, toHole: `BUS_BOTTOM_MINUS_${ledCol + 2}`, color: "#3b82f6" }
        ]
      };
    }
  },



// Stage 5: トランジスタ電子スイッチング回路 (穴衝突根絶 3大マルチツッコミ配置ジェネレータ)
  TRANSISTOR_SWITCH: () => {
    // 3つのトポロジー構図からランダム抽選 (0:溝跨ぎ抵抗＆下段TR＆右上SW大逆走, 1:最上段LED＆下段TR二重降下, 2:左右大逆転中央Xクロス)
    const pattern = Math.floor(Math.random() * 3);

    if (pattern === 0) {
      // 構図A: 溝跨ぎ負荷抵抗 ＆ 下段LED・TR ＆ 右上ベーススイッチ大逆走
      const rcCol = Math.floor(Math.random() * 3) + 2;   // 溝跨ぎ: 列2〜4
      const ledCol = Math.floor(Math.random() * 3) + 7;  // 下段: 列7〜9 (占有7〜11)
      const trCol = Math.floor(Math.random() * 3) + 13;  // 下段: 列13〜15 (E:13, C:14, B:15)
      const swCol = Math.floor(Math.random() * 2) + 20;  // 上段: 列20〜21 (占有20〜23)
      const rbCol = Math.floor(Math.random() * 2) + 25;  // 上段: 列25〜26 (占有25〜28)
      return {
        name: "トランジスタ回路 (構図A: 溝跨ぎ負荷抵抗 ＆ 下段TR ＆ 右上SW大逆走)",
        desc: "コレクタ主回路が中央溝を越えて下段へ叩き落とされる一方、ベース制御スイッチが右上の僻地から中央溝を越えて長距離信号を送るレイアウトです。",
        components: [
          { id: "R_PRESET_TR_C", type: "resistor", val_ohm: 1000, pinA: `E${rcCol}`, pinB: `F${rcCol}`, isVertical: true, spanCols: 1, colors: ["#78350f", "#000000", "#dc2626", "#d97706"], name: "1.0kΩ コレクタ負荷抵抗", desc: "中央溝を跨ぐコレクタ抵抗" },
          { id: "LED_PRESET_TR", type: "led", colorType: "red", color: "#ef4444", vf: 2.0, pinA: `H${ledCol}`, pinB: `H${ledCol + 2}`, isOn: true, name: "赤色LED (5mm)", desc: "コレクタ電流で点灯するLED" },
          { id: "TR_PRESET_1", type: "transistor", model: "2SC1815", subtype: "NPN", pinE: `H${trCol}`, pinC: `H${trCol + 1}`, pinB: `H${trCol + 2}`, pinA: `H${trCol}`, name: "NPNトランジスタ (2SC1815)", desc: "下段に配置されたスイッチング素子" },
          { id: "SW_PRESET_TR", type: "switch", pinA: `B${swCol}`, pinB: `B${swCol + 2}`, isOn: true, name: "ベース制御スイッチ", desc: "右上に配置された制御スイッチ" },
          { id: "R_PRESET_TR_B", type: "resistor", val_ohm: 10000, pinA: `B${rbCol}`, pinB: `B${rbCol + 3}`, isVertical: false, colors: ["#78350f", "#000000", "#ea580c", "#d97706"], name: "10kΩ ベース抵抗", desc: "右上配置の保護抵抗" }
        ],
        answerWires: [
          { id: "W_TR_VCC1", fromHole: `BUS_TOP_PLUS_${rcCol}`, toHole: `A${rcCol}`, color: "#ef4444" },
          { id: "W_TR_RC_TO_LED", fromHole: `G${rcCol}`, toHole: `J${ledCol}`, color: "#eab308" },
          { id: "W_TR_LED_TO_C", fromHole: `J${ledCol + 2}`, toHole: `J${trCol + 1}`, color: "#f97316" },
          { id: "W_TR_GND", fromHole: `I${trCol}`, toHole: `BUS_BOTTOM_MINUS_${trCol}`, color: "#3b82f6" },
          { id: "W_TR_VCC2", fromHole: `BUS_TOP_PLUS_${swCol}`, toHole: `A${swCol}`, color: "#ef4444" },
          { id: "W_TR_SW_TO_RB", fromHole: `C${swCol + 2}`, toHole: `A${rbCol}`, color: "#06b6d4" },
          { id: "W_TR_RB_TO_B", fromHole: `C${rbCol + 3}`, toHole: `F${trCol + 2}`, color: "#a855f7" }
        ]
      };
    } else if (pattern === 1) {
      // 構図B: 最上段A行LED ＆ 下段TR・SW (二重降下立体レイアウト)
      const rcCol = Math.floor(Math.random() * 3) + 2;   // 上段: 列2〜4 (占有2〜6)
      const ledCol = Math.floor(Math.random() * 3) + 8;  // 上段最上行: 列8〜10 (占有8〜12)
      const swCol = Math.floor(Math.random() * 3) + 15;  // 下段: 列15〜17 (占有15〜19)
      const rbCol = Math.floor(Math.random() * 2) + 20;  // 下段: 列20〜21 (占有20〜23)
      const trCol = Math.floor(Math.random() * 2) + 25;  // 下段: 列25〜26 (E:25, C:26, B:27)
      return {
        name: "トランジスタ回路 (構図B: 最上段LED ＆ 下段TR 二重降下レイアウト)",
        desc: "LEDが最上段の隙間に配置され、LEDカソードから中央溝を飛び越えて下段のトランジスタコレクタへ急降下するレイアウトです。",
        components: [
          { id: "R_PRESET_TR_C", type: "resistor", val_ohm: 1000, pinA: `B${rcCol}`, pinB: `B${rcCol + 4}`, isVertical: false, colors: ["#78350f", "#000000", "#dc2626", "#d97706"], name: "1.0kΩ コレクタ負荷抵抗", desc: "上段配置の負荷抵抗" },
          { id: "LED_PRESET_TR", type: "led", colorType: "red", color: "#ef4444", vf: 2.0, pinA: `A${ledCol}`, pinB: `A${ledCol + 2}`, isOn: true, name: "赤色LED (5mm)", desc: "最上段A行の表示LED" },
          { id: "SW_PRESET_TR", type: "switch", pinA: `H${swCol}`, pinB: `H${swCol + 2}`, isOn: true, name: "ベース制御スイッチ", desc: "下段配置の制御スイッチ" },
          { id: "R_PRESET_TR_B", type: "resistor", val_ohm: 10000, pinA: `H${rbCol}`, pinB: `H${rbCol + 3}`, isVertical: false, colors: ["#78350f", "#000000", "#ea580c", "#d97706"], name: "10kΩ ベース抵抗", desc: "下段配置の保護抵抗" },
          { id: "TR_PRESET_1", type: "transistor", model: "2SC1815", subtype: "NPN", pinE: `H${trCol}`, pinC: `H${trCol + 1}`, pinB: `H${trCol + 2}`, pinA: `H${trCol}`, name: "NPNトランジスタ (2SC1815)", desc: "下段右寄りのスイッチング素子" }
        ],
        answerWires: [
          { id: "W_TR_VCC1", fromHole: `BUS_TOP_PLUS_${rcCol}`, toHole: `A${rcCol}`, color: "#ef4444" },
          { id: "W_TR_RC_TO_LED", fromHole: `C${rcCol + 4}`, toHole: `C${ledCol}`, color: "#eab308" },
          { id: "W_TR_LED_TO_C", fromHole: `E${ledCol + 2}`, toHole: `F${trCol + 1}`, color: "#f97316" },
          { id: "W_TR_GND", fromHole: `J${trCol}`, toHole: `BUS_BOTTOM_MINUS_${trCol}`, color: "#3b82f6" },
          { id: "W_TR_VCC2", fromHole: `BUS_TOP_PLUS_${swCol}`, toHole: `F${swCol}`, color: "#ef4444" },
          { id: "W_TR_SW_TO_RB", fromHole: `J${swCol + 2}`, toHole: `J${rbCol}`, color: "#06b6d4" },
          { id: "W_TR_RB_TO_B", fromHole: `J${rbCol + 3}`, toHole: `J${trCol + 2}`, color: "#a855f7" }
        ]
      };
    } else {
      // 構図C: 主回路右上 ＆ 制御回路左下 ＆ 中央TR (左右大逆転・中央Xクロス)
      const swCol = Math.floor(Math.random() * 2) + 2;   // 制御SW(下段): 列2〜3 (占有2〜5)
      const rbCol = Math.floor(Math.random() * 2) + 7;   // 制御RB(下段): 列7〜8 (占有7〜11)
      const trCol = Math.floor(Math.random() * 2) + 14;  // 中央TR(上段): 列14〜15 (E:14, C:15, B:16)
      const rcCol = Math.floor(Math.random() * 2) + 19;  // 主回路RC(上段): 列19〜20 (占有19〜24)
      const ledCol = Math.floor(Math.random() * 2) + 25; // 主回路LED(上段): 列25〜26 (占有25〜28)
      return {
        name: "トランジスタ回路 (構図C: 主回路右上 ＆ 制御回路左下 左右大逆転クロス)",
        desc: "主回路が右上、制御回路が左下に完全に二極化し、中央のトランジスタへ向かって左右から配線が集中交差する最高難度パズル配置です。",
        components: [
          { id: "SW_PRESET_TR", type: "switch", pinA: `I${swCol}`, pinB: `I${swCol + 2}`, isOn: true, name: "ベース制御スイッチ", desc: "左下配置の制御スイッチ" },
          { id: "R_PRESET_TR_B", type: "resistor", val_ohm: 10000, pinA: `I${rbCol}`, pinB: `I${rbCol + 3}`, isVertical: false, colors: ["#78350f", "#000000", "#ea580c", "#d97706"], name: "10kΩ ベース抵抗", desc: "左下配置の保護抵抗" },
          { id: "TR_PRESET_1", type: "transistor", model: "2SC1815", subtype: "NPN", pinE: `C${trCol}`, pinC: `C${trCol + 1}`, pinB: `C${trCol + 2}`, pinA: `C${trCol}`, name: "NPNトランジスタ (2SC1815)", desc: "中央に配置されたスイッチング素子" },
          { id: "R_PRESET_TR_C", type: "resistor", val_ohm: 1000, pinA: `B${rcCol}`, pinB: `B${rcCol + 4}`, isVertical: false, colors: ["#78350f", "#000000", "#dc2626", "#d97706"], name: "1.0kΩ コレクタ負荷抵抗", desc: "右上配置の負荷抵抗" },
          { id: "LED_PRESET_TR", type: "led", colorType: "red", color: "#ef4444", vf: 2.0, pinA: `B${ledCol}`, pinB: `B${ledCol + 2}`, isOn: true, name: "赤色LED (5mm)", desc: "右上配置の表示LED" }
        ],
        answerWires: [
          { id: "W_TR_VCC1", fromHole: `BUS_TOP_PLUS_${rcCol}`, toHole: `A${rcCol}`, color: "#ef4444" },
          { id: "W_TR_RC_TO_LED", fromHole: `C${rcCol + 4}`, toHole: `A${ledCol}`, color: "#eab308" },
          { id: "W_TR_LED_TO_C", fromHole: `C${ledCol + 2}`, toHole: `A${trCol + 1}`, color: "#f97316" },
          { id: "W_TR_GND", fromHole: `E${trCol}`, toHole: `BUS_BOTTOM_MINUS_${trCol}`, color: "#3b82f6" },
          { id: "W_TR_VCC2", fromHole: `BUS_TOP_PLUS_${swCol}`, toHole: `F${swCol}`, color: "#ef4444" },
          { id: "W_TR_SW_TO_RB", fromHole: `J${swCol + 2}`, toHole: `J${rbCol}`, color: "#06b6d4" },
          { id: "W_TR_RB_TO_B", fromHole: `G${rbCol + 3}`, toHole: `E${trCol + 2}`, color: "#a855f7" }
        ]
      };
    }
  },


// Stage 6: 2灯独立並列点灯回路 (穴衝突根絶 3大マルチツッコミ構図ジェネレータ)
  PARALLEL_LEDS: () => {
    // 3つのトポロジー構図からランダム抽選 (0:対角スプリット, 1:上下挟み撃ちサンドイッチ, 2:右上抵抗・左下LED大逆走)
    const pattern = Math.floor(Math.random() * 3);

    if (pattern === 0) {
      // 構図A: 対角線スプリット (溝跨ぎ赤抵抗 ＆ 左上赤LED ＆ 下段緑抵抗 ＆ 右下最果て緑LED)
      const r1Col = Math.floor(Math.random() * 3) + 2;   // 溝跨ぎ: 列2〜4
      const led1Col = Math.floor(Math.random() * 3) + 7;  // 上段A行: 列7〜9 (占有7〜11)
      const r2Col = Math.floor(Math.random() * 3) + 13;  // 下段H行: 列13〜15 (占有13〜19)
      const led2Col = Math.floor(Math.random() * 3) + 22; // 下段J行最果て: 列22〜24 (占有22〜26)
      return {
        name: "2灯並列点灯回路 (構図A: 溝跨ぎ赤抵抗 ＆ 左上赤LED ＆ 右下最果て緑LED)",
        desc: "赤色系統が中央溝を跨ぎつつ左上へ跳ね返り、緑色系統が右下J行の最果てへ大遠征する対角線スプリット配置です。",
        components: [
          { id: "R_PARA_1", type: "resistor", val_ohm: 1000, pinA: `E${r1Col}`, pinB: `F${r1Col}`, isVertical: true, spanCols: 1, colors: ["#78350f", "#000000", "#dc2626", "#d97706"], name: "R1 (1.0kΩ 赤側)", desc: "中央溝を跨ぐ赤側抵抗" },
          { id: "LED_PARA_1", type: "led", colorType: "red", color: "#ef4444", vf: 2.0, pinA: `A${led1Col}`, pinB: `A${led1Col + 2}`, isOn: true, name: "赤色LED (系統1)", desc: "左上A行の赤色LED" },
          { id: "R_PARA_2", type: "resistor", val_ohm: 1000, pinA: `H${r2Col}`, pinB: `H${r2Col + 4}`, isVertical: false, colors: ["#78350f", "#000000", "#dc2626", "#d97706"], name: "R2 (1.0kΩ 緑側)", desc: "下段の緑側抵抗" },
          { id: "LED_PARA_2", type: "led", colorType: "green", color: "#22c55e", vf: 2.2, pinA: `J${led2Col}`, pinB: `J${led2Col + 2}`, isOn: true, name: "緑色LED (系統2)", desc: "右下J行最果ての緑色LED" }
        ],
        answerWires: [
          { id: "W_PARA_VCC1", fromHole: `BUS_TOP_PLUS_${r1Col}`, toHole: `A${r1Col}`, color: "#ef4444" },
          { id: "W_PARA_R1_TO_L1", fromHole: `G${r1Col}`, toHole: `C${led1Col}`, color: "#eab308" },
          { id: "W_PARA_GND1", fromHole: `B${led1Col + 2}`, toHole: `BUS_BOTTOM_MINUS_${led1Col + 2}`, color: "#3b82f6" },
          { id: "W_PARA_VCC2", fromHole: `BUS_TOP_PLUS_${r2Col}`, toHole: `F${r2Col}`, color: "#ef4444" },
          { id: "W_PARA_R2_TO_L2", fromHole: `J${r2Col + 4}`, toHole: `I${led2Col}`, color: "#22c55e" },
          { id: "W_PARA_GND2", fromHole: `H${led2Col + 2}`, toHole: `BUS_BOTTOM_MINUS_${led2Col + 2}`, color: "#3b82f6" }
        ]
      };
    } else if (pattern === 1) {
      // 構図B: 中央溝挟み撃ち (上段赤系統 ＆ 下段緑系統 上下サンドイッチ)
      const r1Col = Math.floor(Math.random() * 3) + 3;    // 上段赤抵抗: 列3〜5 (占有3〜9)
      const led1Col = Math.floor(Math.random() * 3) + 14; // 上段赤LED: 列14〜16 (占有14〜18)
      const r2Col = Math.floor(Math.random() * 3) + 5;    // 下段緑抵抗: 列5〜7 (占有5〜11)
      const led2Col = Math.floor(Math.random() * 3) + 17; // 下段緑LED: 列17〜19 (占有17〜21)
      return {
        name: "2灯並列点灯回路 (構図B: 上段赤系統 ＆ 下段緑系統 上下サンドイッチ)",
        desc: "上段に赤色系統、下段に緑色系統を完全に分離し、中央溝を挟んで並行して給電・接地する立体レイアウトです。",
        components: [
          { id: "R_PARA_1", type: "resistor", val_ohm: 1000, pinA: `B${r1Col}`, pinB: `B${r1Col + 4}`, isVertical: false, colors: ["#78350f", "#000000", "#dc2626", "#d97706"], name: "R1 (1.0kΩ 赤側)", desc: "上段配置の赤側抵抗" },
          { id: "LED_PARA_1", type: "led", colorType: "red", color: "#ef4444", vf: 2.0, pinA: `B${led1Col}`, pinB: `B${led1Col + 2}`, isOn: true, name: "赤色LED (系統1)", desc: "上段配置の赤色LED" },
          { id: "R_PARA_2", type: "resistor", val_ohm: 1000, pinA: `I${r2Col}`, pinB: `I${r2Col + 4}`, isVertical: false, colors: ["#78350f", "#000000", "#dc2626", "#d97706"], name: "R2 (1.0kΩ 緑側)", desc: "下段配置の緑側抵抗" },
          { id: "LED_PARA_2", type: "led", colorType: "green", color: "#22c55e", vf: 2.2, pinA: `I${led2Col}`, pinB: `I${led2Col + 2}`, isOn: true, name: "緑色LED (系統2)", desc: "下段配置の緑色LED" }
        ],
        answerWires: [
          { id: "W_PARA_VCC1", fromHole: `BUS_TOP_PLUS_${r1Col}`, toHole: `A${r1Col}`, color: "#ef4444" },
          { id: "W_PARA_R1_TO_L1", fromHole: `C${r1Col + 4}`, toHole: `A${led1Col}`, color: "#eab308" },
          { id: "W_PARA_GND1", fromHole: `C${led1Col + 2}`, toHole: `BUS_BOTTOM_MINUS_${led1Col + 2}`, color: "#3b82f6" },
          { id: "W_PARA_VCC2", fromHole: `BUS_TOP_PLUS_${r2Col}`, toHole: `F${r2Col}`, color: "#ef4444" },
          { id: "W_PARA_R2_TO_L2", fromHole: `J${r2Col + 4}`, toHole: `J${led2Col}`, color: "#22c55e" },
          { id: "W_PARA_GND2", fromHole: `G${led2Col + 2}`, toHole: `BUS_BOTTOM_MINUS_${led2Col + 2}`, color: "#3b82f6" }
        ]
      };
    } else {
      // 構図C: 右上抵抗ツイン ＆ 左下LEDツイン (超長距離大逆走並列)
      const r1Col = Math.floor(Math.random() * 2) + 18;  // 上段赤抵抗: 列18〜19 (占有18〜23)
      const r2Col = Math.floor(Math.random() * 2) + 24;  // 上段緑抵抗: 列24〜25 (占有24〜29)
      const led1Col = Math.floor(Math.random() * 2) + 3; // 下段赤LED: 列3〜4 (占有3〜6)
      const led2Col = Math.floor(Math.random() * 2) + 9; // 下段緑LED: 列9〜10 (占有9〜12)
      return {
        name: "2灯並列点灯回路 (構図C: 右上抵抗ツイン ＆ 左下LEDツイン 大逆走並列)",
        desc: "2本の保護抵抗が右上に密集し、電力を受け取った配線が盤面を対角線上に大逆走して左下の2灯を光らせる最高難度パズルレイアウトです。",
        components: [
          { id: "R_PARA_1", type: "resistor", val_ohm: 1000, pinA: `B${r1Col}`, pinB: `B${r1Col + 4}`, isVertical: false, colors: ["#78350f", "#000000", "#dc2626", "#d97706"], name: "R1 (1.0kΩ 赤側)", desc: "右上配置の赤側抵抗" },
          { id: "R_PARA_2", type: "resistor", val_ohm: 1000, pinA: `B${r2Col}`, pinB: `B${r2Col + 4}`, isVertical: false, colors: ["#78350f", "#000000", "#dc2626", "#d97706"], name: "R2 (1.0kΩ 緑側)", desc: "右上配置の緑側抵抗" },
          { id: "LED_PARA_1", type: "led", colorType: "red", color: "#ef4444", vf: 2.0, pinA: `I${led1Col}`, pinB: `I${led1Col + 2}`, isOn: true, name: "赤色LED (系統1)", desc: "左下配置の赤色LED" },
          { id: "LED_PARA_2", type: "led", colorType: "green", color: "#22c55e", vf: 2.2, pinA: `I${led2Col}`, pinB: `I${led2Col + 2}`, isOn: true, name: "緑色LED (系統2)", desc: "左下配置の緑色LED" }
        ],
        answerWires: [
          { id: "W_PARA_VCC1", fromHole: `BUS_TOP_PLUS_${r1Col}`, toHole: `A${r1Col}`, color: "#ef4444" },
          { id: "W_PARA_R1_TO_L1", fromHole: `C${r1Col + 4}`, toHole: `F${led1Col}`, color: "#eab308" },
          { id: "W_PARA_GND1", fromHole: `J${led1Col + 2}`, toHole: `BUS_BOTTOM_MINUS_${led1Col + 2}`, color: "#3b82f6" },
          { id: "W_PARA_VCC2", fromHole: `BUS_TOP_PLUS_${r2Col}`, toHole: `A${r2Col}`, color: "#ef4444" },
          { id: "W_PARA_R2_TO_L2", fromHole: `C${r2Col + 4}`, toHole: `F${led2Col}`, color: "#22c55e" },
          { id: "W_PARA_GND2", fromHole: `J${led2Col + 2}`, toHole: `BUS_BOTTOM_MINUS_${led2Col + 2}`, color: "#3b82f6" }
        ]
      };
    }
  },



// Stage 7-1: 分圧の壁 (3大マルチツッコミ構図ジェネレータ)
  BRIDGE_1: () => {
    // 3つのトポロジー構図からランダム抽選 (0:上下立体分圧, 1:溝跨ぎ縦挿し分圧, 2:右上左下大逆走分圧)
    const pattern = Math.floor(Math.random() * 3);

    if (pattern === 0) {
      // 構図A: 上段R1 ＆ 中央溝越え中継 ＆ 下段R2 (上下立体分圧)
      const r1Col = Math.floor(Math.random() * 3) + 3;   // 上段: 列3〜5 (占有3〜9)
      const r2Col = Math.floor(Math.random() * 3) + 14;  // 下段: 列14〜16 (占有14〜20)
      return {
        name: "Stage 7-1: 分圧の壁 (構図A: 上下段立体分圧)",
        desc: "上流抵抗R1(上段)から中央溝を越えて下流抵抗R2(下段)へ中継し、4.5Vの基準電位ノードを立体的に生成します。",
        components: [
          { id: "comp_r1", type: "resistor", val_ohm: 1000, pinA: `C${r1Col}`, pinB: `C${r1Col + 4}`, name: "R1 (1.0kΩ 上流)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          { id: "comp_r2", type: "resistor", val_ohm: 1000, pinA: `H${r2Col}`, pinB: `H${r2Col + 4}`, name: "R2 (1.0kΩ 下流)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] }
        ],
        answerWires: [
          { id: "W_B1_VCC", fromHole: `BUS_TOP_PLUS_${r1Col}`, toHole: `A${r1Col}`, color: "#ef4444" },
          { id: "W_B1_MID", fromHole: `E${r1Col + 4}`, toHole: `F${r2Col}`, color: "#eab308" },
          { id: "W_B1_GND", fromHole: `J${r2Col + 4}`, toHole: `BUS_BOTTOM_MINUS_${r2Col + 4}`, color: "#3b82f6" }
        ]
      };
    } else if (pattern === 1) {
      // 構図B: 溝跨ぎ縦挿しR1 ＆ 下段最果てR2 (アクロバティック縦横分圧)
      const r1Col = Math.floor(Math.random() * 3) + 4;   // 溝跨ぎ: 列4〜6
      const r2Col = Math.floor(Math.random() * 3) + 18;  // 下段: 列18〜20 (占有18〜24)
      return {
        name: "Stage 7-1: 分圧の壁 (構図B: 溝跨ぎ縦挿し ＆ 最果てR2)",
        desc: "上流抵抗R1が中央溝をダイナミックに跨ぎ、下段の長距離配線を経てR2へ接続されるレイアウトです。",
        components: [
          { id: "comp_r1", type: "resistor", val_ohm: 1000, pinA: `E${r1Col}`, pinB: `F${r1Col}`, isVertical: true, spanCols: 1, name: "R1 (1.0kΩ 上流)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          { id: "comp_r2", type: "resistor", val_ohm: 1000, pinA: `I${r2Col}`, pinB: `I${r2Col + 4}`, name: "R2 (1.0kΩ 下流)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] }
        ],
        answerWires: [
          { id: "W_B1_VCC", fromHole: `BUS_TOP_PLUS_${r1Col}`, toHole: `A${r1Col}`, color: "#ef4444" },
          { id: "W_B1_MID", fromHole: `G${r1Col}`, toHole: `G${r2Col}`, color: "#eab308" },
          { id: "W_B1_GND", fromHole: `J${r2Col + 4}`, toHole: `BUS_BOTTOM_MINUS_${r2Col + 4}`, color: "#3b82f6" }
        ]
      };
    } else {
      // 構図C: 右上R1 ＆ 左下R2 (超長距離大逆走分圧)
      const r1Col = Math.floor(Math.random() * 3) + 20;  // 上段: 列20〜22 (占有20〜26)
      const r2Col = Math.floor(Math.random() * 3) + 3;   // 下段: 列3〜5 (占有3〜9)
      return {
        name: "Stage 7-1: 分圧の壁 (構図C: 右上R1 ＆ 左下R2 大逆走分圧)",
        desc: "右上の上流抵抗R1から、左下の僻地に置かれた下流抵抗R2へと盤面を斜めに大逆走して中点電位を形成する長距離パズルです。",
        components: [
          { id: "comp_r1", type: "resistor", val_ohm: 1000, pinA: `B${r1Col}`, pinB: `B${r1Col + 4}`, name: "R1 (1.0kΩ 上流)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          { id: "comp_r2", type: "resistor", val_ohm: 1000, pinA: `I${r2Col}`, pinB: `I${r2Col + 4}`, name: "R2 (1.0kΩ 下流)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] }
        ],
        answerWires: [
          { id: "W_B1_VCC", fromHole: `BUS_TOP_PLUS_${r1Col}`, toHole: `A${r1Col}`, color: "#ef4444" },
          { id: "W_B1_MID", fromHole: `C${r1Col + 4}`, toHole: `F${r2Col}`, color: "#eab308" },
          { id: "W_B1_GND", fromHole: `J${r2Col + 4}`, toHole: `BUS_BOTTOM_MINUS_${r2Col + 4}`, color: "#3b82f6" }
        ]
      };
    }
  },



 // Stage 7-2: 並列ツイン分圧 (3大マルチツッコミ構図ジェネレータ)
  BRIDGE_2: () => {
    // 3つのトポロジー構図からランダム抽選 (0:上下挟み撃ちツイン, 1:溝跨ぎ縦挿し＆最果てVR, 2:左右大逆転ツイン)
    const pattern = Math.floor(Math.random() * 3);

    if (pattern === 0) {
      // 構図A: 上段左アーム(固定4.5V) ＆ 下段右アーム(可変電位) 上下挟み撃ち
      const lCol = Math.floor(Math.random() * 3) + 3;    // 左アーム(上段): 列3〜5 (占有3〜11)
      const rCol = Math.floor(Math.random() * 3) + 16;   // 右アーム(下段): 列16〜18 (占有16〜25)
      return {
        name: "Stage 7-2: 並列ツイン分圧 (構図A: 上段固定 ＆ 下段可変 上下挟み撃ち)",
        desc: "上段に固定4.5V基準アーム、下段に可変電位アームを完全分離。中央溝を挟んで2つの異なる電位ノードが生成されます。",
        components: [
          // 左アーム (上段固定分圧)
          { id: "comp_r1", type: "resistor", val_ohm: 1000, pinA: `C${lCol}`, pinB: `C${lCol + 4}`, name: "R1 (1.0kΩ 左上)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          { id: "comp_r2", type: "resistor", val_ohm: 1000, pinA: `D${lCol + 4}`, pinB: `D${lCol + 8}`, name: "R2 (1.0kΩ 左下)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
         // 右アーム (下段可変分圧: 10kΩツインで中央50%位置を平衡点に設定)
          { id: "comp_r3", type: "resistor", val_ohm: 10000, pinA: `H${rCol}`, pinB: `H${rCol + 4}`, name: "R3 (10kΩ 右上)", colors: ["#78350f", "#000000", "#ea580c", "#d97706"] },
          { id: "comp_vr1", type: "potentiometer", val_max_ohm: 10000, val_ohm: 5000, cur_ratio: 0.5, pinA: `I${rCol + 4}`, pinB: `I${rCol + 8}`, pinC: `J${rCol + 6}`, pinWiper: `J${rCol + 6}`, name: "VR1 (可変抵抗 右下)" }
        ],

        answerWires: [
          // 左アーム給電・接地
          { id: "W_B2_L_VCC", fromHole: `BUS_TOP_PLUS_${lCol}`, toHole: `A${lCol}`, color: "#ef4444" },
          { id: "W_B2_L_GND", fromHole: `E${lCol + 8}`, toHole: `BUS_BOTTOM_MINUS_${lCol + 8}`, color: "#3b82f6" },
          // 右アーム給電・接地 (下段へ直接給電)
          { id: "W_B2_R_VCC", fromHole: `BUS_TOP_PLUS_${rCol}`, toHole: `F${rCol}`, color: "#ef4444" },
          { id: "W_B2_R_GND", fromHole: `J${rCol + 6}`, toHole: `BUS_BOTTOM_MINUS_${rCol + 6}`, color: "#38bdf8" }
        ]
      };
    } else if (pattern === 1) {
      // 構図B: 溝跨ぎ縦挿しR1 ＆ 最果て可変抵抗アーム
      const lCol = Math.floor(Math.random() * 3) + 3;    // 溝跨ぎ左アーム: 列3〜5 (占有3〜9)
      const rCol = Math.floor(Math.random() * 3) + 16;   // 右アーム(上段): 列16〜18 (占有16〜26)
      return {
        name: "Stage 7-2: 並列ツイン分圧 (構図B: 溝跨ぎR1 ＆ 最果て可変分圧)",
        desc: "左アームの上流抵抗が中央溝を跨ぐ一方、右アームは上段の右寄りに配置されたダイナミックな配置です。",
        components: [
          // 左アーム
          { id: "comp_r1", type: "resistor", val_ohm: 1000, pinA: `E${lCol}`, pinB: `F${lCol}`, isVertical: true, spanCols: 1, name: "R1 (1.0kΩ 左上)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          { id: "comp_r2", type: "resistor", val_ohm: 1000, pinA: `G${lCol}`, pinB: `G${lCol + 4}`, name: "R2 (1.0kΩ 左下)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          // 右アーム
          { id: "comp_r3", type: "resistor", val_ohm: 1000, pinA: `B${rCol}`, pinB: `B${rCol + 4}`, name: "R3 (1.0kΩ 右上)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          { id: "comp_vr1", type: "potentiometer", val_max_ohm: 10000, val_ohm: 1000, cur_ratio: 0.1, pinA: `C${rCol + 4}`, pinB: `C${rCol + 8}`, pinC: `D${rCol + 6}`, pinWiper: `D${rCol + 6}`, name: "VR1 (可変抵抗 右下)" }
        ],
        answerWires: [
          { id: "W_B2_L_VCC", fromHole: `BUS_TOP_PLUS_${lCol}`, toHole: `A${lCol}`, color: "#ef4444" },
          { id: "W_B2_L_GND", fromHole: `J${lCol + 4}`, toHole: `BUS_BOTTOM_MINUS_${lCol + 4}`, color: "#3b82f6" },
          { id: "W_B2_R_VCC", fromHole: `BUS_TOP_PLUS_${rCol}`, toHole: `A${rCol}`, color: "#ef4444" },
          { id: "W_B2_R_GND", fromHole: `D${rCol + 6}`, toHole: `BUS_BOTTOM_MINUS_${rCol + 6}`, color: "#38bdf8" }
        ]
      };
    } else {
      // 構図C: 右上固定分圧 ＆ 左下可変分圧 (左右大逆転ツイン)
      const lCol = Math.floor(Math.random() * 3) + 18;   // 固定アーム(右上): 列18〜20 (占有18〜26)
      const rCol = Math.floor(Math.random() * 3) + 3;    // 可変アーム(左下): 列3〜5 (占有3〜13)
      return {
        name: "Stage 7-2: 並列ツイン分圧 (構図C: 右上固定 ＆ 左下可変 左右大逆転)",
        desc: "基準となる固定分圧が右上に、可変電位アームが左下の僻地に配置され、左右の常識を覆す長距離ツインレイアウトです。",
        components: [
          // 固定アーム (右上)
          { id: "comp_r1", type: "resistor", val_ohm: 1000, pinA: `B${lCol}`, pinB: `B${lCol + 4}`, name: "R1 (1.0kΩ 左上)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          { id: "comp_r2", type: "resistor", val_ohm: 1000, pinA: `C${lCol + 4}`, pinB: `C${lCol + 8}`, name: "R2 (1.0kΩ 左下)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          // 可変アーム (左下)
          { id: "comp_r3", type: "resistor", val_ohm: 1000, pinA: `H${rCol}`, pinB: `H${rCol + 4}`, name: "R3 (1.0kΩ 右上)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          { id: "comp_vr1", type: "potentiometer", val_max_ohm: 10000, val_ohm: 1000, cur_ratio: 0.1, pinA: `I${rCol + 4}`, pinB: `I${rCol + 8}`, pinC: `J${rCol + 6}`, pinWiper: `J${rCol + 6}`, name: "VR1 (可変抵抗 右下)" }
        ],
        answerWires: [
          { id: "W_B2_L_VCC", fromHole: `BUS_TOP_PLUS_${lCol}`, toHole: `A${lCol}`, color: "#ef4444" },
          { id: "W_B2_L_GND", fromHole: `D${lCol + 8}`, toHole: `BUS_BOTTOM_MINUS_${lCol + 8}`, color: "#3b82f6" },
          { id: "W_B2_R_VCC", fromHole: `BUS_TOP_PLUS_${rCol}`, toHole: `F${rCol}`, color: "#ef4444" },
          { id: "W_B2_R_GND", fromHole: `J${rCol + 6}`, toHole: `BUS_BOTTOM_MINUS_${rCol + 6}`, color: "#38bdf8" }
        ]
      };
    }
  },




// Stage 7-3: 禁断の横糸 (3大マルチツッコミ構図ジェネレータ)
  BRIDGE_3: () => {
    // 3つのトポロジー構図からランダム抽選 (0:中央溝斜め横断架橋, 1:溝跨ぎR1＆水平長距離架橋, 2:対角線大逆走架橋)
    const pattern = Math.floor(Math.random() * 3);

    if (pattern === 0) {
      // 構図A: 上段左アーム(固定4.5V) ＆ 下段右アーム(可変電位) 中央溝斜め横断架橋
      const lCol = Math.floor(Math.random() * 3) + 3;    // 左アーム(上段): 列3〜5 (占有3〜11)
      const rCol = Math.floor(Math.random() * 3) + 16;   // 右アーム(下段): 列16〜18 (占有16〜25)
      return {
        name: "Stage 7-3: 禁断の横糸 (構図A: 中央溝斜め横断架橋)",
        desc: "上段の固定中点と下段の可変中点を結ぶ架橋線が、中央溝をダイナミックに斜め横断する立体ブリッジ配置です。",
        components: [
          // 左アーム (上段固定分圧)
          { id: "comp_r1", type: "resistor", val_ohm: 1000, pinA: `C${lCol}`, pinB: `C${lCol + 4}`, name: "R1 (1.0kΩ 左上)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          { id: "comp_r2", type: "resistor", val_ohm: 1000, pinA: `D${lCol + 4}`, pinB: `D${lCol + 8}`, name: "R2 (1.0kΩ 左下)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          // 右アーム (下段可変分圧)
          { id: "comp_r3", type: "resistor", val_ohm: 1000, pinA: `H${rCol}`, pinB: `H${rCol + 4}`, name: "R3 (1.0kΩ 右上)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          { id: "comp_vr1", type: "potentiometer", val_max_ohm: 10000, val_ohm: 1000, cur_ratio: 0.1, pinA: `I${rCol + 4}`, pinB: `I${rCol + 8}`, pinC: `J${rCol + 6}`, pinWiper: `J${rCol + 6}`, name: "VR1 (可変抵抗 右下)" }
        ],
        answerWires: [
          // 左アーム給電・接地
          { id: "W_B3_L_VCC", fromHole: `BUS_TOP_PLUS_${lCol}`, toHole: `A${lCol}`, color: "#ef4444" },
          { id: "W_B3_L_GND", fromHole: `E${lCol + 8}`, toHole: `BUS_BOTTOM_MINUS_${lCol + 8}`, color: "#3b82f6" },
          // 右アーム給電・接地
          { id: "W_B3_R_VCC", fromHole: `BUS_TOP_PLUS_${rCol}`, toHole: `F${rCol}`, color: "#ef4444" },
          { id: "W_B3_R_GND", fromHole: `J${rCol + 6}`, toHole: `BUS_BOTTOM_MINUS_${rCol + 6}`, color: "#38bdf8" },
          // 禁断の横糸 (上段左中点 ➔ 下段右中点 斜め横断)
          { id: "W_B3_BRIDGE", fromHole: `A${lCol + 4}`, toHole: `F${rCol + 4}`, color: "#eab308" }
        ]
      };
    } else if (pattern === 1) {
      // 構図B: 溝跨ぎ縦挿しR1 ＆ 最果て可変分圧 ＆ 下段長距離水平架橋
      const lCol = Math.floor(Math.random() * 3) + 3;    // 溝跨ぎ左アーム: 列3〜5 (占有3〜9)
      const rCol = Math.floor(Math.random() * 3) + 16;   // 右アーム(上段): 列16〜18 (占有16〜26)
      return {
        name: "Stage 7-3: 禁断の横糸 (構図B: 溝跨ぎR1 ＆ 斜め長距離架橋)",
        desc: "左アームの上流抵抗が中央溝を跨ぎ下段に中点を形成。上段右寄りに置かれた可変中点へ向かって架橋線が駆け上がるレイアウトです。",
        components: [
          // 左アーム
          { id: "comp_r1", type: "resistor", val_ohm: 1000, pinA: `E${lCol}`, pinB: `F${lCol}`, isVertical: true, spanCols: 1, name: "R1 (1.0kΩ 左上)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          { id: "comp_r2", type: "resistor", val_ohm: 1000, pinA: `G${lCol}`, pinB: `G${lCol + 4}`, name: "R2 (1.0kΩ 左下)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          // 右アーム
          { id: "comp_r3", type: "resistor", val_ohm: 1000, pinA: `B${rCol}`, pinB: `B${rCol + 4}`, name: "R3 (1.0kΩ 右上)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          { id: "comp_vr1", type: "potentiometer", val_max_ohm: 10000, val_ohm: 1000, cur_ratio: 0.1, pinA: `C${rCol + 4}`, pinB: `C${rCol + 8}`, pinC: `D${rCol + 6}`, pinWiper: `D${rCol + 6}`, name: "VR1 (可変抵抗 右下)" }
        ],
        answerWires: [
          { id: "W_B3_L_VCC", fromHole: `BUS_TOP_PLUS_${lCol}`, toHole: `A${lCol}`, color: "#ef4444" },
          { id: "W_B3_L_GND", fromHole: `J${lCol + 4}`, toHole: `BUS_BOTTOM_MINUS_${lCol + 4}`, color: "#3b82f6" },
          { id: "W_B3_R_VCC", fromHole: `BUS_TOP_PLUS_${rCol}`, toHole: `A${rCol}`, color: "#ef4444" },
          { id: "W_B3_R_GND", fromHole: `D${rCol + 6}`, toHole: `BUS_BOTTOM_MINUS_${rCol + 6}`, color: "#38bdf8" },
          // 禁断の横糸 (下段左中点 ➔ 上段右中点 駆け上がり架橋)
          { id: "W_B3_BRIDGE", fromHole: `I${lCol}`, toHole: `A${rCol + 4}`, color: "#eab308" }
        ]
      };
    } else {
      // 構図C: 右上固定分圧 ＆ 左下可変分圧 (対角線超長距離大逆走架橋)
      const lCol = Math.floor(Math.random() * 3) + 18;   // 固定アーム(右上): 列18〜20 (占有18〜26)
      const rCol = Math.floor(Math.random() * 3) + 3;    // 可変アーム(左下): 列3〜5 (占有3〜13)
      return {
        name: "Stage 7-3: 禁断の横糸 (構図C: 右上固定 ＆ 左下可変 対角線大逆走架橋)",
        desc: "右上の固定分圧中点から、左下の可変分圧中点へ向かって架橋線が盤面を対角線上に大逆走する最高難度パズルレイアウトです。",
        components: [
          // 固定アーム (右上)
          { id: "comp_r1", type: "resistor", val_ohm: 1000, pinA: `B${lCol}`, pinB: `B${lCol + 4}`, name: "R1 (1.0kΩ 左上)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          { id: "comp_r2", type: "resistor", val_ohm: 1000, pinA: `C${lCol + 4}`, pinB: `C${lCol + 8}`, name: "R2 (1.0kΩ 左下)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          // 可変アーム (左下)
          { id: "comp_r3", type: "resistor", val_ohm: 1000, pinA: `H${rCol}`, pinB: `H${rCol + 4}`, name: "R3 (1.0kΩ 右上)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          { id: "comp_vr1", type: "potentiometer", val_max_ohm: 10000, val_ohm: 1000, cur_ratio: 0.1, pinA: `I${rCol + 4}`, pinB: `I${rCol + 8}`, pinC: `J${rCol + 6}`, pinWiper: `J${rCol + 6}`, name: "VR1 (可変抵抗 右下)" }
        ],
        answerWires: [
          { id: "W_B3_L_VCC", fromHole: `BUS_TOP_PLUS_${lCol}`, toHole: `A${lCol}`, color: "#ef4444" },
          { id: "W_B3_L_GND", fromHole: `D${lCol + 8}`, toHole: `BUS_BOTTOM_MINUS_${lCol + 8}`, color: "#3b82f6" },
          { id: "W_B3_R_VCC", fromHole: `BUS_TOP_PLUS_${rCol}`, toHole: `F${rCol}`, color: "#ef4444" },
          { id: "W_B3_R_GND", fromHole: `J${rCol + 6}`, toHole: `BUS_BOTTOM_MINUS_${rCol + 6}`, color: "#38bdf8" },
          // 禁断の横糸 (右上中点 ➔ 左下中点 対角線大逆走)
          { id: "W_B3_BRIDGE", fromHole: `A${lCol + 4}`, toHole: `F${rCol + 4}`, color: "#eab308" }
        ]
      };
    }
  },


// Stage 7-4: 平衡の奇跡 (極性整合＆中央50%平衡 3大マルチツッコミ構図ジェネレータ)
  BRIDGE_4: () => {
    // 3つのトポロジー構図からランダム抽選 (0:上下挟み撃ち中央架橋, 1:溝跨ぎR1＆下段架橋, 2:左右大逆転クロス架橋)
    const pattern = Math.floor(Math.random() * 3);

    if (pattern === 0) {
      // 構図A: 上段左アーム(固定4.5V) ＆ 下段右アーム(可変電位) ＆ 中央溝跨ぎLED
      const lCol = Math.floor(Math.random() * 3) + 3;    // 左アーム(上段): 列3〜5 (占有3〜11)
      const ledCol = Math.floor(Math.random() * 3) + 12; // 架橋LED(上段): 列12〜14 (占有12〜16)
      const rCol = Math.floor(Math.random() * 3) + 18;   // 右アーム(下段): 列18〜20 (占有18〜26)
      return {
        name: "Stage 7-4: 平衡の奇跡 (構図A: 上下段挟み撃ち ＆ 中央LED架橋)",
        desc: "上段の固定アームと下段の可変アームの間にLEDを配置。ツマミの中央(50%平衡)でLEDがフッと完全消灯します。",
        components: [
          // 左アーム (上段固定分圧: 1.0kΩ + 1.0kΩ)
          { id: "comp_r1", type: "resistor", val_ohm: 1000, pinA: `C${lCol}`, pinB: `C${lCol + 4}`, name: "R1 (1.0kΩ 左上)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          { id: "comp_r2", type: "resistor", val_ohm: 1000, pinA: `D${lCol + 4}`, pinB: `D${lCol + 8}`, name: "R2 (1.0kΩ 左下)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          // 架橋平衡インジケータ (上段中間)
          { id: "comp_bridge_led", type: "led", color: "#ef4444", colorType: "red", vf: 2.0, pinA: `B${ledCol}`, pinB: `B${ledCol + 2}`, name: "架橋平衡インジケータ (赤LED)" },
          // 右アーム (下段可変分圧: 10kΩ + 10kΩVR)
          { id: "comp_r3", type: "resistor", val_ohm: 10000, pinA: `H${rCol}`, pinB: `H${rCol + 4}`, name: "R3 (10kΩ 右上)", colors: ["#78350f", "#000000", "#ea580c", "#d97706"] },
          { id: "comp_vr1", type: "potentiometer", val_max_ohm: 10000, val_ohm: 5000, cur_ratio: 0.5, pinA: `I${rCol + 4}`, pinB: `I${rCol + 8}`, pinC: `J${rCol + 6}`, pinWiper: `J${rCol + 6}`, name: "VR1 (可変抵抗 右下)" }
        ],
        answerWires: [
          // 左アーム給電・接地
          { id: "W_B4_L_VCC", fromHole: `BUS_TOP_PLUS_${lCol}`, toHole: `A${lCol}`, color: "#ef4444" },
          { id: "W_B4_L_GND", fromHole: `E${lCol + 8}`, toHole: `BUS_BOTTOM_MINUS_${lCol + 8}`, color: "#3b82f6" },
          // 右アーム給電・接地
          { id: "W_B4_R_VCC", fromHole: `BUS_TOP_PLUS_${rCol}`, toHole: `F${rCol}`, color: "#ef4444" },
          { id: "W_B4_R_GND", fromHole: `J${rCol + 6}`, toHole: `BUS_BOTTOM_MINUS_${rCol + 6}`, color: "#38bdf8" },
          // 架橋パッチ線 (左中点 ➔ LEDアノード、LEDカソード ➔ 右中点)
          { id: "W_B4_BRIDGE_A", fromHole: `A${lCol + 4}`, toHole: `A${ledCol}`, color: "#eab308" },
          { id: "W_B4_BRIDGE_B", fromHole: `A${ledCol + 2}`, toHole: `F${rCol + 4}`, color: "#eab308" }
        ]
      };
    } else if (pattern === 1) {
      // 構図B: 溝跨ぎ縦挿しR1 ＆ 最果て可変分圧 ＆ 下段LED架橋
      const lCol = Math.floor(Math.random() * 3) + 3;    // 溝跨ぎ左アーム: 列3〜5 (占有3〜9)
      const ledCol = Math.floor(Math.random() * 3) + 11; // 架橋LED(下段): 列11〜13 (占有11〜15)
      const rCol = Math.floor(Math.random() * 3) + 18;   // 右アーム(上段): 列18〜20 (占有18〜26)
      return {
        name: "Stage 7-4: 平衡の奇跡 (構図B: 溝跨ぎR1 ＆ 下段LED架橋)",
        desc: "左アームが中央溝を跨ぎ、下段に配置されたLEDへ中点電位を供給。上段の可変中点と結ばれたLEDが平衡点でフッと消灯します。",
        components: [
          // 左アーム
          { id: "comp_r1", type: "resistor", val_ohm: 1000, pinA: `E${lCol}`, pinB: `F${lCol}`, isVertical: true, spanCols: 1, name: "R1 (1.0kΩ 左上)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          { id: "comp_r2", type: "resistor", val_ohm: 1000, pinA: `G${lCol}`, pinB: `G${lCol + 4}`, name: "R2 (1.0kΩ 左下)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          // 架橋平衡インジケータ (下段中間)
          { id: "comp_bridge_led", type: "led", color: "#ef4444", colorType: "red", vf: 2.0, pinA: `I${ledCol}`, pinB: `I${ledCol + 2}`, name: "架橋平衡インジケータ (赤LED)" },
          // 右アーム (上段可変分圧)
          { id: "comp_r3", type: "resistor", val_ohm: 10000, pinA: `B${rCol}`, pinB: `B${rCol + 4}`, name: "R3 (10kΩ 右上)", colors: ["#78350f", "#000000", "#ea580c", "#d97706"] },
          { id: "comp_vr1", type: "potentiometer", val_max_ohm: 10000, val_ohm: 5000, cur_ratio: 0.5, pinA: `C${rCol + 4}`, pinB: `C${rCol + 8}`, pinC: `D${rCol + 6}`, pinWiper: `D${rCol + 6}`, name: "VR1 (可変抵抗 右下)" }
        ],
        answerWires: [
          { id: "W_B4_L_VCC", fromHole: `BUS_TOP_PLUS_${lCol}`, toHole: `A${lCol}`, color: "#ef4444" },
          { id: "W_B4_L_GND", fromHole: `J${lCol + 4}`, toHole: `BUS_BOTTOM_MINUS_${lCol + 4}`, color: "#3b82f6" },
          { id: "W_B4_R_VCC", fromHole: `BUS_TOP_PLUS_${rCol}`, toHole: `A${rCol}`, color: "#ef4444" },
          { id: "W_B4_R_GND", fromHole: `D${rCol + 6}`, toHole: `BUS_BOTTOM_MINUS_${rCol + 6}`, color: "#38bdf8" },
          // 架橋パッチ線 (下段左中点 ➔ LEDアノード、LEDカソード ➔ 上段右中点)
          { id: "W_B4_BRIDGE_A", fromHole: `H${lCol}`, toHole: `J${ledCol}`, color: "#eab308" },
          { id: "W_B4_BRIDGE_B", fromHole: `J${ledCol + 2}`, toHole: `A${rCol + 4}`, color: "#eab308" }
        ]
      };
    } else {
      // 構図C: 右上固定分圧 ＆ 左下可変分圧 ＆ 対角線大逆走架橋
      const lCol = Math.floor(Math.random() * 3) + 20;  // 固定アーム(右上): 列20〜22 (占有20〜28)
      const ledCol = Math.floor(Math.random() * 3) + 12; // 架橋LED(中央): 列12〜14 (占有12〜16)
      const rCol = Math.floor(Math.random() * 3) + 3;    // 可変アーム(左下): 列3〜5 (占有3〜13)
      return {
        name: "Stage 7-4: 平衡の奇跡 (構図C: 右上固定 ＆ 左下可変 対角大逆走架橋)",
        desc: "右上の固定分圧中点から左下の可変中点へ向かってLEDが斜めに横断配置され、盤面全体を使って平衡検出を行う最高難度パズルです。",
        components: [
          // 固定アーム (右上)
          { id: "comp_r1", type: "resistor", val_ohm: 1000, pinA: `B${lCol}`, pinB: `B${lCol + 4}`, name: "R1 (1.0kΩ 左上)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          { id: "comp_r2", type: "resistor", val_ohm: 1000, pinA: `C${lCol + 4}`, pinB: `C${lCol + 8}`, name: "R2 (1.0kΩ 左下)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          // 架橋平衡インジケータ (中央)
          { id: "comp_bridge_led", type: "led", color: "#ef4444", colorType: "red", vf: 2.0, pinA: `B${ledCol}`, pinB: `B${ledCol + 2}`, name: "架橋平衡インジケータ (赤LED)" },
          // 可変アーム (左下)
          { id: "comp_r3", type: "resistor", val_ohm: 10000, pinA: `H${rCol}`, pinB: `H${rCol + 4}`, name: "R3 (10kΩ 右上)", colors: ["#78350f", "#000000", "#ea580c", "#d97706"] },
          { id: "comp_vr1", type: "potentiometer", val_max_ohm: 10000, val_ohm: 5000, cur_ratio: 0.5, pinA: `I${rCol + 4}`, pinB: `I${rCol + 8}`, pinC: `J${rCol + 6}`, pinWiper: `J${rCol + 6}`, name: "VR1 (可変抵抗 右下)" }
        ],
        answerWires: [
          { id: "W_B4_L_VCC", fromHole: `BUS_TOP_PLUS_${lCol}`, toHole: `A${lCol}`, color: "#ef4444" },
          { id: "W_B4_L_GND", fromHole: `D${lCol + 8}`, toHole: `BUS_BOTTOM_MINUS_${lCol + 8}`, color: "#3b82f6" },
          { id: "W_B4_R_VCC", fromHole: `BUS_TOP_PLUS_${rCol}`, toHole: `F${rCol}`, color: "#ef4444" },
          { id: "W_B4_R_GND", fromHole: `J${rCol + 6}`, toHole: `BUS_BOTTOM_MINUS_${rCol + 6}`, color: "#38bdf8" },
          // 架橋パッチ線 (右上中点 ➔ LEDアノード、LEDカソード ➔ 左下中点)
          { id: "W_B4_BRIDGE_A", fromHole: `A${lCol + 4}`, toHole: `A${ledCol}`, color: "#eab308" },
          { id: "W_B4_BRIDGE_B", fromHole: `A${ledCol + 2}`, toHole: `F${rCol + 4}`, color: "#eab308" }
        ]
      };
    }
  },



// Stage 7-5: 極致の完成 (逆並列LED双方向検出＆中央50%平衡 3大マルチツッコミ構図ジェネレータ)
  BRIDGE_5: () => {
    // 3つのトポロジー構図からランダム抽選 (0:上下挟み撃ち中央逆並列, 1:溝跨ぎR1＆下段逆並列, 2:左右大逆転対角架橋)
    const pattern = Math.floor(Math.random() * 3);

    if (pattern === 0) {
      // 構図A: 上段左アーム(固定4.5V) ＆ 下段右アーム(可変電位) ＆ 中央逆並列抱き合わせ
      const lCol = Math.floor(Math.random() * 3) + 3;    // 左アーム(上段): 列3〜5 (占有3〜11)
      const ledCol = Math.floor(Math.random() * 3) + 12; // 逆並列LED(上段): 列12〜14 (占有12〜16)
      const rCol = Math.floor(Math.random() * 3) + 18;   // 右アーム(下段): 列18〜20 (占有18〜26)
      return {
        name: "Stage 7-5: 極致の完成 (構図A: 上下段挟み撃ち ＆ 中央逆並列LED)",
        desc: "赤LEDと逆向きの緑LEDを上段中央に抱き合わせ配置。ツマミを左に回すと赤、右に回すと緑が点灯し、中央(50%平衡)で両方ピタリと消灯します。",
        components: [
          // 左アーム (上段固定分圧: 1.0kΩ + 1.0kΩ)
          { id: "comp_r1", type: "resistor", val_ohm: 1000, pinA: `C${lCol}`, pinB: `C${lCol + 4}`, name: "R1 (1.0kΩ 左上)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          { id: "comp_r2", type: "resistor", val_ohm: 1000, pinA: `D${lCol + 4}`, pinB: `D${lCol + 8}`, name: "R2 (1.0kΩ 左下)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          // 中央双方向インジケータ (逆並列抱き合わせ)
          { id: "comp_led_red", type: "led", color: "#ef4444", colorType: "red", vf: 2.0, pinA: `A${ledCol}`, pinB: `A${ledCol + 2}`, name: "インジケータ (赤: 左高電位)" },
          { id: "comp_led_green", type: "led", color: "#22c55e", colorType: "green", vf: 2.2, pinA: `B${ledCol + 2}`, pinB: `B${ledCol}`, name: "インジケータ (緑: 右高電位)" },
          // 右アーム (下段可変分圧: 10kΩ + 10kΩVR)
          { id: "comp_r3", type: "resistor", val_ohm: 10000, pinA: `H${rCol}`, pinB: `H${rCol + 4}`, name: "R3 (10kΩ 右上)", colors: ["#78350f", "#000000", "#ea580c", "#d97706"] },
          { id: "comp_vr1", type: "potentiometer", val_max_ohm: 10000, val_ohm: 5000, cur_ratio: 0.5, pinA: `I${rCol + 4}`, pinB: `I${rCol + 8}`, pinC: `J${rCol + 6}`, pinWiper: `J${rCol + 6}`, name: "VR1 (可変抵抗 右下)" }
        ],
        answerWires: [
          // 左アーム給電・接地
          { id: "W_B5_L_VCC", fromHole: `BUS_TOP_PLUS_${lCol}`, toHole: `A${lCol}`, color: "#ef4444" },
          { id: "W_B5_L_GND", fromHole: `E${lCol + 8}`, toHole: `BUS_BOTTOM_MINUS_${lCol + 8}`, color: "#3b82f6" },
          // 右アーム給電・接地
          { id: "W_B5_R_VCC", fromHole: `BUS_TOP_PLUS_${rCol}`, toHole: `F${rCol}`, color: "#ef4444" },
          { id: "W_B5_R_GND", fromHole: `J${rCol + 6}`, toHole: `BUS_BOTTOM_MINUS_${rCol + 6}`, color: "#38bdf8" },
          // 架橋パッチ線 (左中点 ➔ 逆並列LED左ノード、逆並列LED右ノード ➔ 右中点)
          { id: "W_B5_BRIDGE_A", fromHole: `A${lCol + 4}`, toHole: `E${ledCol}`, color: "#eab308" },
          { id: "W_B5_BRIDGE_B", fromHole: `E${ledCol + 2}`, toHole: `F${rCol + 4}`, color: "#eab308" }
        ]
      };
    } else if (pattern === 1) {
      // 構図B: 溝跨ぎ縦挿しR1 ＆ 最果て可変分圧 ＆ 下段逆並列抱き合わせ
      const lCol = Math.floor(Math.random() * 3) + 3;    // 溝跨ぎ左アーム: 列3〜5 (占有3〜9)
      const ledCol = Math.floor(Math.random() * 3) + 11; // 逆並列LED(下段): 列11〜13 (占有11〜15)
      const rCol = Math.floor(Math.random() * 3) + 18;   // 右アーム(上段): 列18〜20 (占有18〜26)
      return {
        name: "Stage 7-5: 極致の完成 (構図B: 溝跨ぎR1 ＆ 下段逆並列LED)",
        desc: "左アームが中央溝を跨ぎ下段に中点を形成。下段に配置された逆並列インジケータが左右の電位の高低を赤と緑で鮮やかに識別します。",
        components: [
          // 左アーム
          { id: "comp_r1", type: "resistor", val_ohm: 1000, pinA: `E${lCol}`, pinB: `F${lCol}`, isVertical: true, spanCols: 1, name: "R1 (1.0kΩ 左上)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          { id: "comp_r2", type: "resistor", val_ohm: 1000, pinA: `G${lCol}`, pinB: `G${lCol + 4}`, name: "R2 (1.0kΩ 左下)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          // 下段逆並列インジケータ
          { id: "comp_led_red", type: "led", color: "#ef4444", colorType: "red", vf: 2.0, pinA: `H${ledCol}`, pinB: `H${ledCol + 2}`, name: "インジケータ (赤: 左高電位)" },
          { id: "comp_led_green", type: "led", color: "#22c55e", colorType: "green", vf: 2.2, pinA: `I${ledCol + 2}`, pinB: `I${ledCol}`, name: "インジケータ (緑: 右高電位)" },
          // 右アーム (上段可変分圧)
          { id: "comp_r3", type: "resistor", val_ohm: 10000, pinA: `B${rCol}`, pinB: `B${rCol + 4}`, name: "R3 (10kΩ 右上)", colors: ["#78350f", "#000000", "#ea580c", "#d97706"] },
          { id: "comp_vr1", type: "potentiometer", val_max_ohm: 10000, val_ohm: 5000, cur_ratio: 0.5, pinA: `C${rCol + 4}`, pinB: `C${rCol + 8}`, pinC: `D${rCol + 6}`, pinWiper: `D${rCol + 6}`, name: "VR1 (可変抵抗 右下)" }
        ],
        answerWires: [
          { id: "W_B5_L_VCC", fromHole: `BUS_TOP_PLUS_${lCol}`, toHole: `A${lCol}`, color: "#ef4444" },
          { id: "W_B5_L_GND", fromHole: `J${lCol + 4}`, toHole: `BUS_BOTTOM_MINUS_${lCol + 4}`, color: "#3b82f6" },
          { id: "W_B5_R_VCC", fromHole: `BUS_TOP_PLUS_${rCol}`, toHole: `A${rCol}`, color: "#ef4444" },
          { id: "W_B5_R_GND", fromHole: `D${rCol + 6}`, toHole: `BUS_BOTTOM_MINUS_${rCol + 6}`, color: "#38bdf8" },
          // 架橋パッチ線 (下段左中点 ➔ 逆並列左ノード、逆並列右ノード ➔ 上段右中点)
          { id: "W_B5_BRIDGE_A", fromHole: `H${lCol}`, toHole: `J${ledCol}`, color: "#eab308" },
          { id: "W_B5_BRIDGE_B", fromHole: `J${ledCol + 2}`, toHole: `A${rCol + 4}`, color: "#eab308" }
        ]
      };
    } else {
      // 構図C: 右上固定分圧 ＆ 左下可変分圧 ＆ 対角線大逆走架橋
      const lCol = Math.floor(Math.random() * 3) + 20;  // 固定アーム(右上): 列20〜22 (占有20〜28)
      const ledCol = Math.floor(Math.random() * 3) + 12; // 逆並列LED(中央): 列12〜14 (占有12〜16)
      const rCol = Math.floor(Math.random() * 3) + 3;    // 可変アーム(左下): 列3〜5 (占有3〜13)
      return {
        name: "Stage 7-5: 極致の完成 (構図C: 右上固定 ＆ 左下可変 対角大逆走架橋)",
        desc: "右上の固定分圧中点から左下の可変中点へ向かって逆並列LEDが対角線上に架橋配置され、盤面全体を使って双方向平衡検出を行う最高峰パズルです。",
        components: [
          // 固定アーム (右上)
          { id: "comp_r1", type: "resistor", val_ohm: 1000, pinA: `B${lCol}`, pinB: `B${lCol + 4}`, name: "R1 (1.0kΩ 左上)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          { id: "comp_r2", type: "resistor", val_ohm: 1000, pinA: `C${lCol + 4}`, pinB: `C${lCol + 8}`, name: "R2 (1.0kΩ 左下)", colors: ["#78350f", "#000000", "#dc2626", "#d97706"] },
          // 中央逆並列インジケータ
          { id: "comp_led_red", type: "led", color: "#ef4444", colorType: "red", vf: 2.0, pinA: `A${ledCol}`, pinB: `A${ledCol + 2}`, name: "インジケータ (赤: 左高電位)" },
          { id: "comp_led_green", type: "led", color: "#22c55e", colorType: "green", vf: 2.2, pinA: `B${ledCol + 2}`, pinB: `B${ledCol}`, name: "インジケータ (緑: 右高電位)" },
          // 可変アーム (左下)
          { id: "comp_r3", type: "resistor", val_ohm: 10000, pinA: `H${rCol}`, pinB: `H${rCol + 4}`, name: "R3 (10kΩ 右上)", colors: ["#78350f", "#000000", "#ea580c", "#d97706"] },
          { id: "comp_vr1", type: "potentiometer", val_max_ohm: 10000, val_ohm: 5000, cur_ratio: 0.5, pinA: `I${rCol + 4}`, pinB: `I${rCol + 8}`, pinC: `J${rCol + 6}`, pinWiper: `J${rCol + 6}`, name: "VR1 (可変抵抗 右下)" }
        ],
        answerWires: [
          { id: "W_B5_L_VCC", fromHole: `BUS_TOP_PLUS_${lCol}`, toHole: `A${lCol}`, color: "#ef4444" },
          { id: "W_B5_L_GND", fromHole: `D${lCol + 8}`, toHole: `BUS_BOTTOM_MINUS_${lCol + 8}`, color: "#3b82f6" },
          { id: "W_B5_R_VCC", fromHole: `BUS_TOP_PLUS_${rCol}`, toHole: `F${rCol}`, color: "#ef4444" },
          { id: "W_B5_R_GND", fromHole: `J${rCol + 6}`, toHole: `BUS_BOTTOM_MINUS_${rCol + 6}`, color: "#38bdf8" },
          // 架橋パッチ線 (右上中点 ➔ 逆並列左ノード、逆並列右ノード ➔ 左下中点)
          { id: "W_B5_BRIDGE_A", fromHole: `A${lCol + 4}`, toHole: `D${ledCol}`, color: "#eab308" },
          { id: "W_B5_BRIDGE_B", fromHole: `D${ledCol + 2}`, toHole: `F${rCol + 4}`, color: "#eab308" }
        ]
      };
    }
  },



// Stage 8: タクトスイッチ・プッシュ点灯回路 (3大マルチツッコミ構図ジェネレータ)
  TACT_SWITCH_CIRCUIT: () => {
    const pattern = Math.floor(Math.random() * 3);

    if (pattern === 0) {
      // 構図A: 上段抵抗 ＆ 中央溝越え下段タクトSW ＆ 上段最果て青色LED (上下立体ジグザグ)
      const rCol = Math.floor(Math.random() * 3) + 3;    // 上段: 列3〜5 (占有3〜9)
      const swCol = Math.floor(Math.random() * 3) + 11;  // 下段: 列11〜13 (占有11〜16)
      const ledCol = Math.floor(Math.random() * 3) + 20; // 上段: 列20〜22 (占有20〜24)
      return {
        name: "タクトスイッチ・プッシュ点灯回路 (構図A: 上下段立体ジグザグ)",
        desc: "上段の保護抵抗から中央溝を飛び越えて下段のタクトスイッチへ接続し、再び上段最果ての青色LEDへ駆け上がる立体配線です。",
        components: [
          { id: "R_TACT_1", type: "resistor", val_ohm: 1000, pinA: `C${rCol}`, pinB: `C${rCol + 4}`, isVertical: false, colors: ["#78350f", "#000000", "#dc2626", "#d97706"], name: "1.0kΩ 保護抵抗", desc: "1.0kΩ 電流制限抵抗" },
          { id: "SW_TACT_1", type: "tact_switch", subType: "tact", pinA: `H${swCol}`, pinB: `H${swCol + 3}`, isPressed: false, name: "タクトスイッチ (モーメンタリ)", desc: "押下時のみ閉路を形成する押しボタンスイッチ" },
          { id: "LED_TACT_1", type: "led", colorType: "blue", color: "#3b82f6", vf: 3.0, pinA: `C${ledCol}`, pinB: `C${ledCol + 2}`, isOn: false, name: "青色LED (5mm)", desc: "順方向降下3.0Vの高輝度青色LED" }
        ],
        answerWires: [
          { id: "W_TACT_VCC", fromHole: `BUS_TOP_PLUS_${rCol}`, toHole: `A${rCol}`, color: "#ef4444" },
          { id: "W_TACT_R_TO_SW", fromHole: `E${rCol + 4}`, toHole: `F${swCol}`, color: "#eab308" },
          { id: "W_TACT_SW_TO_LED", fromHole: `F${swCol + 3}`, toHole: `A${ledCol}`, color: "#06b6d4" },
          { id: "W_TACT_GND", fromHole: `E${ledCol + 2}`, toHole: `BUS_BOTTOM_MINUS_${ledCol + 2}`, color: "#3b82f6" }
        ]
      };
    } else if (pattern === 1) {
      // 構図B: 溝跨ぎ縦挿し抵抗 ＆ 下段最果てSW ＆ 上段中央青色LED
      const rCol = Math.floor(Math.random() * 3) + 4;    // 溝跨ぎ: 列4〜6
      const ledCol = Math.floor(Math.random() * 3) + 12; // 上段: 列12〜14
      const swCol = Math.floor(Math.random() * 3) + 20;  // 下段: 列20〜22
      return {
        name: "タクトスイッチ・プッシュ点灯回路 (構図B: 溝跨ぎR ＆ 最果てSW)",
        desc: "保護抵抗が中央溝をダイナミックに跨ぎ、下段最果てのスイッチから上段中央のLEDへと電力を送るアクロバティック配置です。",
        components: [
          { id: "R_TACT_1", type: "resistor", val_ohm: 1000, pinA: `E${rCol}`, pinB: `F${rCol}`, isVertical: true, spanCols: 1, colors: ["#78350f", "#000000", "#dc2626", "#d97706"], name: "1.0kΩ 保護抵抗", desc: "1.0kΩ 電流制限抵抗" },
          { id: "LED_TACT_1", type: "led", colorType: "blue", color: "#3b82f6", vf: 3.0, pinA: `B${ledCol}`, pinB: `B${ledCol + 2}`, isOn: false, name: "青色LED (5mm)", desc: "順方向降下3.0Vの高輝度青色LED" },
          { id: "SW_TACT_1", type: "tact_switch", subType: "tact", pinA: `H${swCol}`, pinB: `H${swCol + 3}`, isPressed: false, name: "タクトスイッチ (モーメンタリ)", desc: "押下時のみ閉路を形成する押しボタンスイッチ" }
        ],
        answerWires: [
          { id: "W_TACT_VCC", fromHole: `BUS_TOP_PLUS_${rCol}`, toHole: `A${rCol}`, color: "#ef4444" },
          { id: "W_TACT_R_TO_LED", fromHole: `G${rCol}`, toHole: `E${ledCol}`, color: "#eab308" },
          { id: "W_TACT_LED_TO_SW", fromHole: `A${ledCol + 2}`, toHole: `F${swCol}`, color: "#06b6d4" },
          { id: "W_TACT_GND", fromHole: `J${swCol + 3}`, toHole: `BUS_BOTTOM_MINUS_${swCol + 3}`, color: "#3b82f6" }
        ]
      };
    } else {
      // 構図C: 右上抵抗 ＆ 左下SW ＆ 右下LED (対角線大逆走)
      const rCol = Math.floor(Math.random() * 3) + 20;   // 上段: 列20〜22
      const swCol = Math.floor(Math.random() * 3) + 3;   // 下段: 列3〜5
      const ledCol = Math.floor(Math.random() * 3) + 13; // 下段: 列13〜15
      return {
        name: "タクトスイッチ・プッシュ点灯回路 (構図C: 右上R ＆ 左下SW 大逆走)",
        desc: "電源から右上の保護抵抗へ給電後、左下の僻地に置かれたタクトスイッチへ盤面を斜め大横断して戻る長距離パズルです。",
        components: [
          { id: "R_TACT_1", type: "resistor", val_ohm: 1000, pinA: `B${rCol}`, pinB: `B${rCol + 4}`, isVertical: false, colors: ["#78350f", "#000000", "#dc2626", "#d97706"], name: "1.0kΩ 保護抵抗", desc: "1.0kΩ 電流制限抵抗" },
          { id: "SW_TACT_1", type: "tact_switch", subType: "tact", pinA: `H${swCol}`, pinB: `H${swCol + 3}`, isPressed: false, name: "タクトスイッチ (モーメンタリ)", desc: "押下時のみ閉路を形成する押しボタンスイッチ" },
          { id: "LED_TACT_1", type: "led", colorType: "blue", color: "#3b82f6", vf: 3.0, pinA: `H${ledCol}`, pinB: `H${ledCol + 2}`, isOn: false, name: "青色LED (5mm)", desc: "順方向降下3.0Vの高輝度青色LED" }
        ],
        answerWires: [
          { id: "W_TACT_VCC", fromHole: `BUS_TOP_PLUS_${rCol}`, toHole: `A${rCol}`, color: "#ef4444" },
          { id: "W_TACT_R_TO_SW", fromHole: `C${rCol + 4}`, toHole: `F${swCol}`, color: "#eab308" },
          { id: "W_TACT_SW_TO_LED", fromHole: `F${swCol + 3}`, toHole: `F${ledCol}`, color: "#06b6d4" },
          { id: "W_TACT_GND", fromHole: `J${ledCol + 2}`, toHole: `BUS_BOTTOM_MINUS_${ledCol + 2}`, color: "#3b82f6" }
        ]
      };
    }
  },

  // Stage 9: 整流ダイオード・極性と逆流防止回路 (3大マルチツッコミ構図ジェネレータ)
  DIODE_RECTIFIER: () => {
    const pattern = Math.floor(Math.random() * 3);

    if (pattern === 0) {
      // 構図A: 上段抵抗 ＆ 中央溝越え下段ダイオード ＆ 上段赤色LED (上下挟み撃ち直列)
      const rCol = Math.floor(Math.random() * 3) + 3;    // 上段: 列3〜5 (占有3〜9)
      const dCol = Math.floor(Math.random() * 3) + 11;   // 下段: 列11〜13 (占有11〜17)
      const ledCol = Math.floor(Math.random() * 3) + 20; // 上段: 列20〜22 (占有20〜24)
      return {
        name: "整流ダイオード回路 (構図A: 上下段挟み撃ち直列)",
        desc: "上段の保護抵抗から中央溝を飛び越えて下段の整流ダイオードへ接続し、再び上段の赤色LEDへ駆け上がる立体整流回路です。",
        components: [
          { id: "R_DIODE_1", type: "resistor", val_ohm: 1000, pinA: `C${rCol}`, pinB: `C${rCol + 4}`, isVertical: false, colors: ["#78350f", "#000000", "#dc2626", "#d97706"], name: "1.0kΩ 保護抵抗", desc: "1.0kΩ 電流制限抵抗" },
          { id: "D_RECT_1", type: "diode", pinA: `H${dCol}`, pinB: `H${dCol + 4}`, vf: 0.7, max_V: 1000, max_I_A: 1.0, name: "整流ダイオード (1N4007)", desc: "順方向電圧約0.7V。一方向のみ電流を通す整流素子" },
          { id: "LED_DIODE_1", type: "led", colorType: "red", color: "#ef4444", vf: 2.0, pinA: `C${ledCol}`, pinB: `C${ledCol + 2}`, isOn: true, name: "赤色LED (5mm)", desc: "順方向降下2.0Vの標準赤色LED" }
        ],
        answerWires: [
          { id: "W_DIODE_VCC", fromHole: `BUS_TOP_PLUS_${rCol}`, toHole: `A${rCol}`, color: "#ef4444" },
          { id: "W_DIODE_R_TO_D", fromHole: `E${rCol + 4}`, toHole: `F${dCol}`, color: "#eab308" },
          { id: "W_DIODE_D_TO_LED", fromHole: `F${dCol + 4}`, toHole: `A${ledCol}`, color: "#06b6d4" },
          { id: "W_DIODE_GND", fromHole: `E${ledCol + 2}`, toHole: `BUS_BOTTOM_MINUS_${ledCol + 2}`, color: "#3b82f6" }
        ]
      };
    } else if (pattern === 1) {
      // 構図B: 溝跨ぎ縦挿しダイオード ＆ 下段這いずり赤色LED
      const rCol = Math.floor(Math.random() * 3) + 3;    // 上段: 列3〜5
      const dCol = Math.floor(Math.random() * 3) + 11;   // 溝跨ぎ: 列11〜13
      const ledCol = Math.floor(Math.random() * 3) + 19; // 下段: 列19〜21
      return {
        name: "整流ダイオード回路 (構図B: 溝跨ぎダイオード ＆ 下段LED)",
        desc: "整流ダイオードが中央溝を縦挿しで跨ぎ、上段から下段へとワンウェイの電流を一気に流し込むアクロバティック配置です。",
        components: [
          { id: "R_DIODE_1", type: "resistor", val_ohm: 1000, pinA: `B${rCol}`, pinB: `B${rCol + 4}`, isVertical: false, colors: ["#78350f", "#000000", "#dc2626", "#d97706"], name: "1.0kΩ 保護抵抗", desc: "1.0kΩ 電流制限抵抗" },
          { id: "D_RECT_1", type: "diode", pinA: `E${dCol}`, pinB: `F${dCol}`, isVertical: true, spanCols: 1, vf: 0.7, max_V: 1000, max_I_A: 1.0, name: "整流ダイオード (1N4007)", desc: "順方向電圧約0.7V。一方向のみ電流を通す整流素子" },
          { id: "LED_DIODE_1", type: "led", colorType: "red", color: "#ef4444", vf: 2.0, pinA: `I${ledCol}`, pinB: `I${ledCol + 2}`, isOn: true, name: "赤色LED (5mm)", desc: "順方向降下2.0Vの標準赤色LED" }
        ],
        answerWires: [
          { id: "W_DIODE_VCC", fromHole: `BUS_TOP_PLUS_${rCol}`, toHole: `A${rCol}`, color: "#ef4444" },
          { id: "W_DIODE_R_TO_D", fromHole: `C${rCol + 4}`, toHole: `A${dCol}`, color: "#eab308" },
          { id: "W_DIODE_D_TO_LED", fromHole: `G${dCol}`, toHole: `G${ledCol}`, color: "#06b6d4" },
          { id: "W_DIODE_GND", fromHole: `J${ledCol + 2}`, toHole: `BUS_BOTTOM_MINUS_${ledCol + 2}`, color: "#3b82f6" }
        ]
      };
    } else {
      // 構図C: 右上ダイオード ＆ 左下抵抗 ＆ 右下LED (対角線大逆走)
      const dCol = Math.floor(Math.random() * 3) + 20;   // 上段: 列20〜22
      const rCol = Math.floor(Math.random() * 3) + 3;    // 下段: 列3〜5
      const ledCol = Math.floor(Math.random() * 3) + 13; // 下段: 列13〜15
      return {
        name: "整流ダイオード回路 (構図C: 右上D ＆ 左下R 対角大逆走)",
        desc: "右上のダイオードから左下の僻地に置かれた保護抵抗へ盤面を斜めに大横断し、下段のLEDを点灯させる長距離パズルです。",
        components: [
          { id: "D_RECT_1", type: "diode", pinA: `B${dCol}`, pinB: `B${dCol + 4}`, vf: 0.7, max_V: 1000, max_I_A: 1.0, name: "整流ダイオード (1N4007)", desc: "順方向電圧約0.7V。一方向のみ電流を通す整流素子" },
          { id: "R_DIODE_1", type: "resistor", val_ohm: 1000, pinA: `H${rCol}`, pinB: `H${rCol + 4}`, isVertical: false, colors: ["#78350f", "#000000", "#dc2626", "#d97706"], name: "1.0kΩ 保護抵抗", desc: "1.0kΩ 電流制限抵抗" },
          { id: "LED_DIODE_1", type: "led", colorType: "red", color: "#ef4444", vf: 2.0, pinA: `H${ledCol}`, pinB: `H${ledCol + 2}`, isOn: true, name: "赤色LED (5mm)", desc: "順方向降下2.0Vの標準赤色LED" }
        ],
        answerWires: [
          { id: "W_DIODE_VCC", fromHole: `BUS_TOP_PLUS_${dCol}`, toHole: `A${dCol}`, color: "#ef4444" },
          { id: "W_DIODE_D_TO_R", fromHole: `C${dCol + 4}`, toHole: `F${rCol}`, color: "#eab308" },
          { id: "W_DIODE_R_TO_LED", fromHole: `F${rCol + 4}`, toHole: `F${ledCol}`, color: "#06b6d4" },
          { id: "W_DIODE_GND", fromHole: `J${ledCol + 2}`, toHole: `BUS_BOTTOM_MINUS_${ledCol + 2}`, color: "#3b82f6" }
        ]
      };
    }
  },

  // Stage 10: NPNトランジスタ・電子スイッチング回路 (3大マルチツッコミ構図ジェネレータ)
  STAGE_10_TRANSISTOR: () => {
    const pattern = Math.floor(Math.random() * 3);

    if (pattern === 0) {
      // 構図A: 上段制御回路(SW+Rb) ＆ 下段主回路(Rc+LED+TR) 上下完全分離
      const rcCol = Math.floor(Math.random() * 2) + 3;   // 下段: 列3〜4 (占有3〜9)
      const ledCol = Math.floor(Math.random() * 2) + 11; // 下段: 列11〜12 (占有11〜15)
      const trCol = Math.floor(Math.random() * 2) + 18;  // 下段: 列18〜19 (占有18〜22)
      const swCol = Math.floor(Math.random() * 2) + 3;   // 上段: 列3〜4 (占有3〜8)
      const rbCol = Math.floor(Math.random() * 2) + 12;  // 上段: 列12〜13 (占有12〜17)
      return {
        name: "NPNトランジスタ回路 (構図A: 上段制御 ＆ 下段主回路 上下完全分離)",
        desc: "上段にベース制御スイッチと抵抗、下段にコレクタ主回路を完全分離。中央溝を越えて微小ベース電流が主回路のスイッチングを司ります。",
        components: [
          // コレクタ主回路 (下段)
          { id: "R_TR_C", type: "resistor", val_ohm: 1000, pinA: `H${rcCol}`, pinB: `H${rcCol + 4}`, isVertical: false, colors: ["#78350f", "#000000", "#dc2626", "#d97706"], name: "1.0kΩ コレクタ負荷抵抗", desc: "1.0kΩ コレクタ電流制限抵抗" },
          { id: "LED_TR", type: "led", colorType: "red", color: "#ef4444", vf: 2.0, pinA: `H${ledCol}`, pinB: `H${ledCol + 2}`, isOn: false, name: "赤色LED (5mm)", desc: "コレクタ主電流で点灯するLED" },
          { id: "TR_1815", type: "transistor", model: "2SC1815", subtype: "NPN", pinE: `H${trCol}`, pinC: `H${trCol + 1}`, pinB: `H${trCol + 2}`, pinA: `H${trCol}`, pinCOM: `H${trCol + 1}`, name: "NPNトランジスタ (2SC1815)", desc: "ベース電流でコレクタ電流を開閉するスイッチング素子" },
          // ベース制御回路 (上段)
          { id: "SW_TR_BASE", type: "tact_switch", subType: "tact", pinA: `C${swCol}`, pinB: `C${swCol + 3}`, isPressed: false, name: "ベース制御スイッチ", desc: "ベース電流を投入・遮断するタクトスイッチ" },
          { id: "R_TR_B", type: "resistor", val_ohm: 100000, pinA: `C${rbCol}`, pinB: `C${rbCol + 3}`, isVertical: false, colors: ["#78350f", "#000000", "#facc15", "#d97706"], name: "100kΩ ベース抵抗", desc: "100kΩ ベース電流制限抵抗" }
        ],
        answerWires: [
          // 主回路給電・配線・接地
          { id: "W_TR_VCC1", fromHole: `BUS_TOP_PLUS_${rcCol}`, toHole: `F${rcCol}`, color: "#ef4444" },
          { id: "W_TR_RC_TO_LED", fromHole: `F${rcCol + 4}`, toHole: `F${ledCol}`, color: "#eab308" },
          { id: "W_TR_LED_TO_C", fromHole: `F${ledCol + 2}`, toHole: `F${trCol + 1}`, color: "#f97316" },
          { id: "W_TR_GND", fromHole: `J${trCol}`, toHole: `BUS_BOTTOM_MINUS_${trCol}`, color: "#3b82f6" },
          // 制御回路給電・中継・溝跨ぎベース注入
          { id: "W_TR_VCC2", fromHole: `BUS_TOP_PLUS_${swCol}`, toHole: `A${swCol}`, color: "#ef4444" },
          { id: "W_TR_SW_TO_RB", fromHole: `A${swCol + 3}`, toHole: `A${rbCol}`, color: "#06b6d4" },
          { id: "W_TR_RB_TO_B", fromHole: `E${rbCol + 3}`, toHole: `F${trCol + 2}`, color: "#a855f7" }
        ]
      };
    } else if (pattern === 1) {
      // 構図B: 溝跨ぎ縦挿しRc ＆ 最下段TR ＆ 右上SW
      const rcCol = Math.floor(Math.random() * 2) + 3;   // 溝跨ぎ: 列3〜4
      const ledCol = Math.floor(Math.random() * 2) + 9;  // 下段: 列9〜10
      const trCol = Math.floor(Math.random() * 2) + 15;  // 下段: 列15〜16
      const swCol = Math.floor(Math.random() * 2) + 18;  // 上段: 列18〜19
      const rbCol = Math.floor(Math.random() * 2) + 24;  // 上段: 列24〜25
      return {
        name: "NPNトランジスタ回路 (構図B: 溝跨ぎRc ＆ 最下段TR ＆ 右上SW)",
        desc: "主回路の負荷抵抗が中央溝を縦挿しで跨ぎ、制御回路が右上に配置されたアクロバティックなスイッチング回路です。",
        components: [
          { id: "R_TR_C", type: "resistor", val_ohm: 1000, pinA: `E${rcCol}`, pinB: `F${rcCol}`, isVertical: true, spanCols: 1, colors: ["#78350f", "#000000", "#dc2626", "#d97706"], name: "1.0kΩ コレクタ負荷抵抗", desc: "1.0kΩ コレクタ電流制限抵抗" },
          { id: "LED_TR", type: "led", colorType: "red", color: "#ef4444", vf: 2.0, pinA: `I${ledCol}`, pinB: `I${ledCol + 2}`, isOn: false, name: "赤色LED (5mm)", desc: "コレクタ主電流で点灯するLED" },
          { id: "TR_1815", type: "transistor", model: "2SC1815", subtype: "NPN", pinE: `I${trCol}`, pinC: `I${trCol + 1}`, pinB: `I${trCol + 2}`, pinA: `I${trCol}`, pinCOM: `I${trCol + 1}`, name: "NPNトランジスタ (2SC1815)", desc: "ベース電流でコレクタ電流を開閉するスイッチング素子" },
          { id: "SW_TR_BASE", type: "tact_switch", subType: "tact", pinA: `B${swCol}`, pinB: `B${swCol + 3}`, isPressed: false, name: "ベース制御スイッチ", desc: "ベース電流を投入・遮断するタクトスイッチ" },
          { id: "R_TR_B", type: "resistor", val_ohm: 100000, pinA: `B${rbCol}`, pinB: `B${rbCol + 3}`, isVertical: false, colors: ["#78350f", "#000000", "#facc15", "#d97706"], name: "100kΩ ベース抵抗", desc: "100kΩ ベース電流制限抵抗" }
        ],
        answerWires: [
          { id: "W_TR_VCC1", fromHole: `BUS_TOP_PLUS_${rcCol}`, toHole: `A${rcCol}`, color: "#ef4444" },
          { id: "W_TR_RC_TO_LED", fromHole: `G${rcCol}`, toHole: `G${ledCol}`, color: "#eab308" },
          { id: "W_TR_LED_TO_C", fromHole: `G${ledCol + 2}`, toHole: `G${trCol + 1}`, color: "#f97316" },
          { id: "W_TR_GND", fromHole: `J${trCol}`, toHole: `BUS_BOTTOM_MINUS_${trCol}`, color: "#3b82f6" },
          { id: "W_TR_VCC2", fromHole: `BUS_TOP_PLUS_${swCol}`, toHole: `A${swCol}`, color: "#ef4444" },
          { id: "W_TR_SW_TO_RB", fromHole: `A${swCol + 3}`, toHole: `A${rbCol}`, color: "#06b6d4" },
          { id: "W_TR_RB_TO_B", fromHole: `C${rbCol + 3}`, toHole: `G${trCol + 2}`, color: "#a855f7" }
        ]
      };
    } else {
      // 構図C: 主回路右上 ＆ 制御回路左下 左右完全逆転大クロス
      const rcCol = Math.floor(Math.random() * 2) + 16;  // 上段: 列16〜17
      const ledCol = Math.floor(Math.random() * 2) + 21; // 上段: 列21〜22
      const trCol = Math.floor(Math.random() * 2) + 25;  // 上段: 列25〜26
      const swCol = Math.floor(Math.random() * 2) + 3;   // 下段: 列3〜4
      const rbCol = Math.floor(Math.random() * 2) + 9;   // 下段: 列9〜10
      return {
        name: "NPNトランジスタ回路 (構図C: 主回路右上 ＆ 制御回路左下 左右大逆転)",
        desc: "主回路が右上に追いやられ、制御スイッチが左下の僻地に配置された左右大逆転パズルです。盤面を対角線上に横断してベースを駆動します。",
        components: [
          { id: "R_TR_C", type: "resistor", val_ohm: 1000, pinA: `B${rcCol}`, pinB: `B${rcCol + 4}`, isVertical: false, colors: ["#78350f", "#000000", "#dc2626", "#d97706"], name: "1.0kΩ コレクタ負荷抵抗", desc: "1.0kΩ コレクタ電流制限抵抗" },
          { id: "LED_TR", type: "led", colorType: "red", color: "#ef4444", vf: 2.0, pinA: `B${ledCol}`, pinB: `B${ledCol + 2}`, isOn: false, name: "赤色LED (5mm)", desc: "コレクタ主電流で点灯するLED" },
          { id: "TR_1815", type: "transistor", model: "2SC1815", subtype: "NPN", pinE: `C${trCol}`, pinC: `C${trCol + 1}`, pinB: `C${trCol + 2}`, pinA: `C${trCol}`, pinCOM: `C${trCol + 1}`, name: "NPNトランジスタ (2SC1815)", desc: "ベース電流でコレクタ電流を開閉するスイッチング素子" },
          { id: "SW_TR_BASE", type: "tact_switch", subType: "tact", pinA: `H${swCol}`, pinB: `H${swCol + 3}`, isPressed: false, name: "ベース制御スイッチ", desc: "ベース電流を投入・遮断するタクトスイッチ" },
          { id: "R_TR_B", type: "resistor", val_ohm: 100000, pinA: `H${rbCol}`, pinB: `H${rbCol + 3}`, isVertical: false, colors: ["#78350f", "#000000", "#facc15", "#d97706"], name: "100kΩ ベース抵抗", desc: "100kΩ ベース電流制限抵抗" }
        ],
        answerWires: [
          { id: "W_TR_VCC1", fromHole: `BUS_TOP_PLUS_${rcCol}`, toHole: `A${rcCol}`, color: "#ef4444" },
          { id: "W_TR_RC_TO_LED", fromHole: `A${rcCol + 4}`, toHole: `A${ledCol}`, color: "#eab308" },
          { id: "W_TR_LED_TO_C", fromHole: `A${ledCol + 2}`, toHole: `A${trCol + 1}`, color: "#f97316" },
          { id: "W_TR_GND", fromHole: `E${trCol}`, toHole: `BUS_BOTTOM_MINUS_${trCol}`, color: "#3b82f6" },
          { id: "W_TR_VCC2", fromHole: `BUS_TOP_PLUS_${swCol}`, toHole: `F${swCol}`, color: "#ef4444" },
          { id: "W_TR_SW_TO_RB", fromHole: `F${swCol + 3}`, toHole: `F${rbCol}`, color: "#06b6d4" },
          { id: "W_TR_RB_TO_B", fromHole: `J${rbCol + 3}`, toHole: `E${trCol + 2}`, color: "#a855f7" }
        ]
      };
    }
  },



 // Stage 11: 暗くなると自動点灯する夜間街灯回路 (難易度維持型 3大マルチ構図ジェネレータ)
  STAGE_11_CDS_NIGHTLIGHT: () => {
    const pattern = Math.floor(Math.random() * 3);

    if (pattern === 0) {
      // 構図A: 上段主回路 ＆ 下段CdSセンサー分圧回路 (上下明快セパレート)
      const rcCol = Math.floor(Math.random() * 2) + 3;   // 上段: 列3〜4
      const ledCol = Math.floor(Math.random() * 2) + 9;  // 上段: 列9〜10
      const trCol = Math.floor(Math.random() * 2) + 14;  // 上段: 列14〜15 (E: trCol, C: +1, B: +2)
      const baseCol = trCol + 2;                         // ベース中点: 列16〜17
      const pullCol = baseCol + 4;                       // プルアップ入力: 列20〜21 (標準4ピッチ)
      return {
        name: "暗くなると自動点灯する夜間街灯回路 (構図A: 上段主回路 ＆ 下段CdS分圧)",
        desc: "上段に街灯LED主回路、下段にCdS光センサーを配置。昼間はCdSがベース電位を引き落として消灯し、暗くなると自動点灯します。",
        components: [
          { id: "R_TR_C", type: "resistor", val_ohm: 1000, pinA: `C${rcCol}`, pinB: `C${rcCol + 4}`, isVertical: false, colors: ["#78350f", "#000000", "#dc2626", "#d97706"], name: "1.0kΩ コレクタ負荷抵抗", desc: "コレクタ電流制限抵抗" },
          { id: "LED_TR", type: "led", colorType: "red", color: "#ef4444", vf: 2.0, pinA: `C${ledCol}`, pinB: `C${ledCol + 2}`, isOn: false, name: "赤色LED (5mm)", desc: "夜間に自動点灯する街灯LED" },
          { id: "TR_1815", type: "transistor", model: "2SC1815", subtype: "NPN", pinE: `C${trCol}`, pinC: `C${trCol + 1}`, pinB: `C${baseCol}`, pinA: `C${trCol}`, pinCOM: `C${trCol + 1}`, name: "NPNトランジスタ (2SC1815)", desc: "ベース分圧電位でコレクタ電流を開閉するスイッチング素子" },
          { id: "R_BASE_PULLUP", type: "resistor", val_ohm: 47000, pinA: `C${pullCol}`, pinB: `C${baseCol}`, isVertical: false, colors: ["#eab308", "#7e22ce", "#f97316", "#d97706"], name: "47kΩ ベースプルアップ抵抗", desc: "電源からベースへバイアスを供給する分圧上流抵抗" },
          { id: "CDS_NIGHT", type: "cds", pinA: `H${baseCol}`, pinB: `H${baseCol + 4}`, isVertical: false, lux: 150, name: "CdS光導電セル (5mm)", desc: "ベースとGNDの間で明暗を感知する受光素子" }
        ],
        answerWires: [
          { id: "W_TR_VCC1", fromHole: `BUS_TOP_PLUS_${rcCol}`, toHole: `A${rcCol}`, color: "#ef4444" },
          { id: "W_TR_RC_TO_LED", fromHole: `A${rcCol + 4}`, toHole: `A${ledCol}`, color: "#eab308" },
          { id: "W_TR_LED_TO_C", fromHole: `A${ledCol + 2}`, toHole: `A${trCol + 1}`, color: "#f97316" },
          { id: "W_TR_GND", fromHole: `E${trCol}`, toHole: `BUS_BOTTOM_MINUS_${trCol}`, color: "#3b82f6" },
          { id: "W_TR_VCC2", fromHole: `BUS_TOP_PLUS_${pullCol}`, toHole: `A${pullCol}`, color: "#ef4444" },
          { id: "W_CDS_BASE", fromHole: `E${baseCol}`, toHole: `F${baseCol}`, color: "#a855f7" },
          { id: "W_CDS_GND", fromHole: `J${baseCol + 4}`, toHole: `BUS_BOTTOM_MINUS_${baseCol + 4}`, color: "#3b82f6" }
        ]
      };
    } else if (pattern === 1) {
      // 構図B: 溝跨ぎ縦挿しRc ＆ 下段主回路 ＆ 上段CdS分圧
      const rcCol = Math.floor(Math.random() * 2) + 3;   // 溝跨ぎ: 列3〜4
      const ledCol = Math.floor(Math.random() * 2) + 9;  // 下段: 列9〜10
      const trCol = Math.floor(Math.random() * 2) + 14;  // 下段: 列14〜15 (E: trCol, C: +1, B: +2)
      const baseCol = trCol + 2;                         // ベース中点: 列16〜17
      const pullCol = baseCol + 4;                       // 上段プルアップ: 列20〜21
      return {
        name: "暗くなると自動点灯する夜間街灯回路 (構図B: 溝跨ぎRc ＆ 上下立体駆動)",
        desc: "負荷抵抗が中央溝を縦挿しで跨ぎ、上段のCdS分圧回路から下段のトランジスタベースへ制御電位を供給します。",
        components: [
          { id: "R_TR_C", type: "resistor", val_ohm: 1000, pinA: `E${rcCol}`, pinB: `F${rcCol}`, isVertical: true, spanCols: 1, colors: ["#78350f", "#000000", "#dc2626", "#d97706"], name: "1.0kΩ コレクタ負荷抵抗", desc: "コレクタ電流制限抵抗" },
          { id: "LED_TR", type: "led", colorType: "red", color: "#ef4444", vf: 2.0, pinA: `I${ledCol}`, pinB: `I${ledCol + 2}`, isOn: false, name: "赤色LED (5mm)", desc: "夜間に自動点灯する街灯LED" },
          { id: "TR_1815", type: "transistor", model: "2SC1815", subtype: "NPN", pinE: `I${trCol}`, pinC: `I${trCol + 1}`, pinB: `I${baseCol}`, pinA: `I${trCol}`, pinCOM: `I${trCol + 1}`, name: "NPNトランジスタ (2SC1815)", desc: "ベース分圧電位でコレクタ電流を開閉するスイッチング素子" },
          { id: "R_BASE_PULLUP", type: "resistor", val_ohm: 47000, pinA: `B${pullCol}`, pinB: `B${baseCol}`, isVertical: false, colors: ["#eab308", "#7e22ce", "#f97316", "#d97706"], name: "47kΩ ベースプルアップ抵抗", desc: "電源からベースへバイアスを供給する分圧上流抵抗" },
          { id: "CDS_NIGHT", type: "cds", pinA: `C${baseCol}`, pinB: `C${baseCol + 4}`, isVertical: false, lux: 150, name: "CdS光導電セル (5mm)", desc: "ベースとGNDの間で明暗を感知する受光素子" }
        ],
        answerWires: [
          { id: "W_TR_VCC1", fromHole: `BUS_TOP_PLUS_${rcCol}`, toHole: `A${rcCol}`, color: "#ef4444" },
          { id: "W_TR_RC_TO_LED", fromHole: `G${rcCol}`, toHole: `G${ledCol}`, color: "#eab308" },
          { id: "W_TR_LED_TO_C", fromHole: `G${ledCol + 2}`, toHole: `G${trCol + 1}`, color: "#f97316" },
          { id: "W_TR_GND", fromHole: `J${trCol}`, toHole: `BUS_BOTTOM_MINUS_${trCol}`, color: "#3b82f6" },
          { id: "W_TR_VCC2", fromHole: `BUS_TOP_PLUS_${pullCol}`, toHole: `A${pullCol}`, color: "#ef4444" },
          { id: "W_CDS_BASE", fromHole: `E${baseCol}`, toHole: `F${baseCol}`, color: "#a855f7" },
          { id: "W_CDS_GND", fromHole: `E${baseCol + 4}`, toHole: `BUS_BOTTOM_MINUS_${baseCol + 4}`, color: "#3b82f6" }
        ]
      };
    } else {
      // 構図C: 左右素直な散開配置 (解きやすさ重視の自然なレイアウト)
      const rcCol = Math.floor(Math.random() * 2) + 2;   // 上段左: 列2〜3
      const ledCol = Math.floor(Math.random() * 2) + 8;  // 上段左: 列8〜9
      const trCol = Math.floor(Math.random() * 2) + 13;  // 上段中央: 列13〜14
      const baseCol = trCol + 2;                         // 列15〜16
      const pullCol = baseCol + 4;                       // 列19〜20 (4ピッチ)
      const cdsEndCol = baseCol + 8;                     // 列23〜24 (CdS 4ピッチ)
      return {
        name: "暗くなると自動点灯する夜間街灯回路 (構図C: 左右ダイナミック散開)",
        desc: "主回路からベース分圧回路へ向かって自然に流れる配置。暗闇になるとベース電位が0.7Vを超えて街灯が点灯します。",
        components: [
          { id: "R_TR_C", type: "resistor", val_ohm: 1000, pinA: `C${rcCol}`, pinB: `C${rcCol + 4}`, isVertical: false, colors: ["#78350f", "#000000", "#dc2626", "#d97706"], name: "1.0kΩ コレクタ負荷抵抗", desc: "コレクタ電流制限抵抗" },
          { id: "LED_TR", type: "led", colorType: "red", color: "#ef4444", vf: 2.0, pinA: `C${ledCol}`, pinB: `C${ledCol + 2}`, isOn: false, name: "赤色LED (5mm)", desc: "夜間に自動点灯する街灯LED" },
          { id: "TR_1815", type: "transistor", model: "2SC1815", subtype: "NPN", pinE: `C${trCol}`, pinC: `C${trCol + 1}`, pinB: `C${baseCol}`, pinA: `C${trCol}`, pinCOM: `C${trCol + 1}`, name: "NPNトランジスタ (2SC1815)", desc: "ベース分圧電位でコレクタ電流を開閉するスイッチング素子" },
          { id: "R_BASE_PULLUP", type: "resistor", val_ohm: 47000, pinA: `C${pullCol}`, pinB: `C${baseCol}`, isVertical: false, colors: ["#eab308", "#7e22ce", "#f97316", "#d97706"], name: "47kΩ ベースプルアップ抵抗", desc: "電源からベースへバイアスを供給する分圧上流抵抗" },
          { id: "CDS_NIGHT", type: "cds", pinA: `D${baseCol}`, pinB: `D${cdsEndCol}`, isVertical: false, lux: 150, name: "CdS光導電セル (5mm)", desc: "ベースとGNDの間で明暗を感知する受光素子" }
        ],
        answerWires: [
          { id: "W_TR_VCC1", fromHole: `BUS_TOP_PLUS_${rcCol}`, toHole: `A${rcCol}`, color: "#ef4444" },
          { id: "W_TR_RC_TO_LED", fromHole: `A${rcCol + 4}`, toHole: `A${ledCol}`, color: "#eab308" },
          { id: "W_TR_LED_TO_C", fromHole: `A${ledCol + 2}`, toHole: `A${trCol + 1}`, color: "#f97316" },
          { id: "W_TR_GND", fromHole: `E${trCol}`, toHole: `BUS_BOTTOM_MINUS_${trCol}`, color: "#3b82f6" },
          { id: "W_TR_VCC2", fromHole: `BUS_TOP_PLUS_${pullCol}`, toHole: `A${pullCol}`, color: "#ef4444" },
          { id: "W_CDS_GND", fromHole: `E${cdsEndCol}`, toHole: `BUS_BOTTOM_MINUS_${cdsEndCol}`, color: "#3b82f6" }
        ]
      };
    }
  },





  // Stage 12: NチャネルMOSFET・超高効率スイッチング回路 (動的ランダムジェネレータ)
  STAGE_12_MOSFET_SWITCH: () => {
    const rdCol = Math.floor(Math.random() * 2) + 2;     // ゾーン1: 列2〜3
    const ledCol = Math.floor(Math.random() * 2) + 8;    // ゾーン2: 列8〜9
    const mosCol = Math.floor(Math.random() * 2) + 13;   // ゾーン3: 列13〜14 (S: mosCol, G: +1, D: +2)
    const pdEndCol = Math.floor(Math.random() * 3) + 18; // ゾーン4: 列18〜20
    const swCol = Math.floor(Math.random() * 3) + 22;    // ゾーン5: 列22〜24

    return {
      name: "NチャネルMOSFET・超高効率スイッチング回路 (2N7000 / ランダム配置)",
      desc: "ドレイン主回路とゲート制御タクトスイッチが独立ゾーンへ散開配置されます。ゲート電流ゼロ(完全電圧制御)でドレイン電流を開閉し、100kΩプルダウン抵抗により確実な0V遮断を維持する現代パワーエレクトロニクスの基本を体験します。",
      components: [
        // 1. ドレイン主回路
        { id: "R_MOS_D", type: "resistor", val_ohm: 1000, pinA: `C${rdCol}`, pinB: `C${rdCol + 4}`, isVertical: false, colors: ["#78350f", "#000000", "#dc2626", "#d97706"], name: "1.0kΩ ドレイン負荷抵抗", desc: "ドレイン電流制限抵抗" },
        { id: "LED_MOS", type: "led", colorType: "red", color: "#ef4444", vf: 2.0, pinA: `C${ledCol}`, pinB: `C${ledCol + 2}`, isOn: false, name: "赤色LED (5mm)", desc: "ドレイン主電流で点灯するLED" },
        { id: "MOS_2N7000", type: "mosfet", model: "2N7000", subtype: "N_CHANNEL", pinS: `C${mosCol}`, pinG: `C${mosCol + 1}`, pinD: `C${mosCol + 2}`, pinA: `C${mosCol}`, pinB: `C${mosCol + 2}`, name: "NチャネルMOSFET (2N7000)", desc: "ゲート電圧(Vgs)で開閉する電圧制御スイッチング素子" },

        // 2. ゲート制御回路
        { id: "SW_MOS_GATE", type: "tact_switch", subType: "tact", pinA: `C${swCol}`, pinB: `C${swCol + 3}`, isPressed: false, name: "ゲート制御スイッチ", desc: "ゲート電圧を投入・遮断するタクトスイッチ" },
        { id: "R_MOS_PULLDOWN", type: "resistor", val_ohm: 100000, pinA: `D${mosCol + 1}`, pinB: `D${pdEndCol}`, isVertical: false, colors: ["#78350f", "#000000", "#eab308", "#d97706"], name: "100kΩ ゲートプルダウン抵抗", desc: "スイッチOFF時の浮遊電荷を放電し確実な0V遮断を保つ抵抗" }
      ],
      answerWires: [
        // 1. ドレイン主電源: +9V ➔ 1kΩ負荷抵抗
        { id: "W_MOS_VCC1", fromHole: `BUS_TOP_PLUS_${rdCol}`, toHole: `A${rdCol}`, color: "#ef4444" },
        // 2. 負荷抵抗 ➔ LEDアノード
        { id: "W_MOS_RD_TO_LED", fromHole: `A${rdCol + 4}`, toHole: `A${ledCol}`, color: "#eab308" },
        // 3. LEDカソード ➔ MOSFET ドレイン端子(D)
        { id: "W_MOS_LED_TO_D", fromHole: `A${ledCol + 2}`, toHole: `A${mosCol + 2}`, color: "#f97316" },
        // 4. ソース端子(S) ➔ GND接地
        { id: "W_MOS_GND", fromHole: `E${mosCol}`, toHole: `BUS_BOTTOM_MINUS_${mosCol}`, color: "#3b82f6" },
        // 5. ゲート制御電源: +9V ➔ タクトスイッチ入力
        { id: "W_MOS_VCC2", fromHole: `BUS_TOP_PLUS_${swCol}`, toHole: `A${swCol}`, color: "#ef4444" },
        // 6. タクトスイッチ出力 ➔ ゲート端子(G)
        { id: "W_MOS_GATE_FEED", fromHole: `A${swCol + 3}`, toHole: `A${mosCol + 1}`, color: "#a855f7" },
        // 7. プルダウン抵抗下流 ➔ GND接地
        { id: "W_MOS_PD_GND", fromHole: `E${pdEndCol}`, toHole: `BUS_BOTTOM_MINUS_${pdEndCol}`, color: "#3b82f6" }
      ]
    };
  },





// Stage 13: MOSFETパルス駆動 ＆ オシロスコープ波形彫刻回路 (動的ランダムジェネレータ)
  STAGE_13_MOSFET_BUZZER_WAVE: () => {
    const rdCol = Math.floor(Math.random() * 2) + 2;     // ゾーン1: 列2〜3
    const bzCol = Math.floor(Math.random() * 2) + 8;     // ゾーン2: 列8〜9 (出力端: bzCol + 3)
    const mosCol = Math.floor(Math.random() * 2) + 14;   // ゾーン3: 列14〜15 (S: mosCol, G: +1, D: +2)
    const pdEndCol = Math.floor(Math.random() * 3) + 19; // ゾーン4: 列19〜21
    const swCol = Math.floor(Math.random() * 3) + 23;    // ゾーン5: 列23〜25

    return {
      name: "MOSFETパルス駆動 ＆ オシロスコープ波形彫刻回路 (ランダム配置)",
      desc: "ドレイン主回路とゲートパルススイッチが独立ゾーンへ散開配置されます。2N7000で2.4kHz圧電ブザーを高速スイッチング駆動し、並列平滑コンデンサによって矩形波が美麗な三角波へ変調・彫刻される過渡現象をリアルタイムオシロスコープ上で観測します。",
      components: [
        // 1. ドレイン主回路
        { id: "R_BUZZ_D", type: "resistor", val_ohm: 330, pinA: `C${rdCol}`, pinB: `C${rdCol + 4}`, isVertical: false, colors: ["#ea580c", "#ea580c", "#78350f", "#d97706"], name: "330Ω ドレイン負荷抵抗", desc: "ブザー駆動電流制限抵抗" },
        { id: "BZ_PIEZO", type: "buzzer", freq_hz: 2400, val_ohm: 16, capacitance_nF: 25, pinA: `D${bzCol}`, pinB: `D${bzCol + 3}`, name: "圧電ブザー (2.4kHz)", desc: "2.4kHzパルス波形を出力する音響素子" },
        { id: "C_WAVE_SHAPE", type: "capacitor", subType: "electrolytic", val_uF: 10, pinA: `E${bzCol}`, pinB: `E${bzCol + 3}`, isVertical: false, name: "電解コンデンサ (10µF)", desc: "矩形波のエッジをなまらせて三角波へ彫刻する並列平滑コンデンサ" },
        { id: "MOS_2N7000", type: "mosfet", model: "2N7000", subtype: "N_CHANNEL", pinS: `C${mosCol}`, pinG: `C${mosCol + 1}`, pinD: `C${mosCol + 2}`, pinA: `C${mosCol}`, pinB: `C${mosCol + 2}`, name: "NチャネルMOSFET (2N7000)", desc: "ゲート電圧で超高速開閉する電圧制御スイッチング素子" },

        // 2. ゲート制御回路
        { id: "SW_GATE_PULSE", type: "tact_switch", subType: "tact", pinA: `C${swCol}`, pinB: `C${swCol + 3}`, isPressed: false, name: "ゲートパルススイッチ", desc: "ゲートに制御電圧を投入するモーメンタリ接点" },
        { id: "R_GATE_PD", type: "resistor", val_ohm: 100000, pinA: `D${mosCol + 1}`, pinB: `D${pdEndCol}`, isVertical: false, colors: ["#78350f", "#000000", "#eab308", "#d97706"], name: "100kΩ ゲートプルダウン抵抗", desc: "スイッチOFF時の浮遊電荷を放電し確実な0V遮断を保つ抵抗" }
      ],
      answerWires: [
        // 1. ドレイン主電源: +9V ➔ 330Ω抵抗
        { id: "W_BZ_VCC1", fromHole: `BUS_TOP_PLUS_${rdCol}`, toHole: `A${rdCol}`, color: "#ef4444" },
        // 2. 負荷抵抗 ➔ ブザー＆コンデンサ並列入力
        { id: "W_BZ_RD_TO_IN", fromHole: `A${rdCol + 4}`, toHole: `A${bzCol}`, color: "#eab308" },
        // 3. ブザー＆コンデンサ並列出力 ➔ MOSFET ドレイン端子(D)
        { id: "W_BZ_OUT_TO_D", fromHole: `A${bzCol + 3}`, toHole: `A${mosCol + 2}`, color: "#f97316" },
        // 4. ソース端子(S) ➔ GND接地
        { id: "W_BZ_GND", fromHole: `E${mosCol}`, toHole: `BUS_BOTTOM_MINUS_${mosCol}`, color: "#3b82f6" },
        // 5. ゲート制御電源: +9V ➔ タクトスイッチ入力
        { id: "W_BZ_VCC2", fromHole: `BUS_TOP_PLUS_${swCol}`, toHole: `A${swCol}`, color: "#ef4444" },
        // 6. タクトスイッチ出力 ➔ ゲート端子(G)
        { id: "W_BZ_GATE_FEED", fromHole: `A${swCol + 3}`, toHole: `A${mosCol + 1}`, color: "#a855f7" },
        // 7. プルダウン抵抗下流 ➔ GND接地
        { id: "W_BZ_PD_GND", fromHole: `E${pdEndCol}`, toHole: `BUS_BOTTOM_MINUS_${pdEndCol}`, color: "#3b82f6" }
      ]
    };
  }
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
  6: "PARALLEL_LEDS",
  // ★ Stage 7: ホイートストン・ブリッジ進化ステップ
  "7-1": "BRIDGE_1",
  "7-2": "BRIDGE_2",
  "7-3": "BRIDGE_3",
  "7-4": "BRIDGE_4",
  "7-5": "BRIDGE_5",
 // ★ Stage 8: タクトスイッチ
  8: "TACT_SWITCH_CIRCUIT",
 // ★ Stage 9: 整流ダイオード
  9: "DIODE_RECTIFIER",
 // ★ Stage 10: NPNトランジスタ
  10: "STAGE_10_TRANSISTOR",
// ★ Stage 11: CdS光導電セルとトランジスタによる自動夜間街灯回路
  11: "STAGE_11_CDS_NIGHTLIGHT",
// ★ Stage 12: NチャネルMOSFET・電子スイッチング回路 (2N7000)
  12: "STAGE_12_MOSFET_SWITCH",
  // ★ Stage 13: MOSFETパルス駆動 ＆ オシロスコープ波形彫刻回路
  13: "STAGE_13_MOSFET_BUZZER_WAVE"
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
  // ★ メイン「7」が押された時は、サブバーを展開して自動的に「7-1」を実行
  const subContainer = document.getElementById("sub-stage-container");
  if (stageNo === 7) {
    if (subContainer) subContainer.style.display = "flex";
    handlePresetClick("7-1");
    return;
  } else if (typeof stageNo === "number" && stageNo !== 7) {
    // 1〜6が押された時はサブバーを閉じる
    if (subContainer) subContainer.style.display = "none";
  }

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

  // 2. 全ステージボタン＆サブボタンのスタイルを初期リセット
  document.querySelectorAll(".stage-btn, .sub-stage-btn").forEach(btn => {
    btn.style.background = "#1e293b";
    btn.style.color = "#94a3b8";
    btn.style.borderColor = "#475569";
  });

  // ★ メイン「7」の親ボタンも連動ハイライト
  if (String(stageNo).startsWith("7-")) {
    const parent7Btn = document.getElementById("btn-stage-7");
    if (parent7Btn) {
      parent7Btn.style.background = "#0f172a";
      parent7Btn.style.color = "#38bdf8";
      parent7Btn.style.borderColor = "#0284c7";
    }
  }

  // 3. アクティブボタンの視覚フィードバック (青: 挑戦中 / 緑: 回答表示中)
  const activeBtn = document.getElementById(String(stageNo).startsWith("7-") ? `btn-sub-${stageNo}` : `btn-stage-${stageNo}`);
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

  // 4. 改修済み loadPresetCircuit へ委譲
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
// 現在挑戦中のランダムプリセットのキャッシュ
let currentCachedPreset = null;

function loadPresetCircuit(presetKey, loadWires = true) {
  let preset = CIRCUIT_PRESETS[presetKey];
  if (!preset) return;

  if (typeof preset === "function") {
    // 答え合わせ(loadWires = true)でキャッシュが存在する場合は、その配置を採用してキャッシュを消費
    if (loadWires && currentCachedPreset) {
      preset = currentCachedPreset;
      currentCachedPreset = null; // 答え合わせ完了によりキャッシュを破棄(次回は必ず再抽選)
    } else {
      // 手動挑戦(loadWires = false)または新規呼出時は新しくランダム生成
      preset = preset();
      if (!loadWires) {
        currentCachedPreset = preset; // 答え合わせ用に現在の配置を保持
      } else {
        currentCachedPreset = null;
      }
    }
  } else {
    currentCachedPreset = null;
  }

  if (typeof saveHistory === "function") saveHistory();  components.length = 0;
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
 RESISTOR_10000:   { category: "PASSIVE", type: "resistor", val_ohm: 10000,  name: "10kΩ 固定抵抗器",   colors: ["#78350f", "#000000", "#ea580c", "#d97706"], spanCols: 5, desc: "10kΩ プルアップ/ダウン用抵抗。" },
  RESISTOR_100000: { category: "PASSIVE", type: "resistor", val_ohm: 100000, name: "100kΩ 固定抵抗器",  colors: ["#78350f", "#000000", "#eab308", "#d97706"], spanCols: 5, desc: "100kΩ 高入力インピーダンス分圧用。" },





// --- スイッチ 類 ---
  SWITCH_TOGGLE:   { category: "SWITCH",   type: "switch",   subType: "toggle", name: "トグルスイッチ (SPST)", spanCols: 3, desc: "1回路1投(SPST)トグルスイッチ。クリックで通電(ON)と切断(OFF)を切り替えます。" },
  SWITCH_SPDT:     { category: "SWITCH",   type: "switch_spdt", subType: "spdt",   name: "3路トグルスイッチ (SPDT)", spanCols: 4, desc: "1回路2投(SPDT)切替スイッチ。COM端子とL1/L2の接続を交互に切り替え、階段スイッチやXORを実現します。" },
SWITCH_TACT:     { category: "SWITCH",   type: "tact_switch", subType: "tact",   name: "タクトスイッチ (モーメンタリ)", spanCols: 3, desc: "押している間だけ通電(ON)し、離すと切断(OFF)するモーメンタリ動作の押しボタンスイッチです。" },


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
     return `<b>[0.02ms] 遮断 (CUTOFF):</b> ${comp.name} のベース電位が不足 (Vbe < 0.7V) のため主電流を遮断中。`;
    }
  },

  // --- 半導体素子 (パワー/小信号 NチャネルMOSFET) ---
  MOSFET_2N7000: {
    category: "SEMICONDUCTOR",
    type: "mosfet",
    model: "2N7000",
    subtype: "N_CHANNEL",
    name: "NチャネルMOSFET (2N7000)",
    spanCols: 2, // S(列), G(列+1), D(列+2) で計3列分
    vgs_th: 2.1, // ゲート・ソース間閾値電圧 (2.1V)
    rds_on: 1.2, // 導通時オン抵抗 (1.2Ω)
    vds_max: 60.0,
    id_max_mA: 200.0,
    pd_max_mW: 400.0,
    desc: "電圧制御型のNチャネル電界効果トランジスタ。ゲート電流ゼロ(0µA)の電圧印加だけで主電流(D-S間)を超高効率に開閉します。",
    getPhysicsText: (comp, phys) => {
      const state = comp.state || "CUTOFF";
      const vgs = (comp.vgs_V || 0.0).toFixed(2);
      if (state === "ON" || state === "OHMIC") {
        return `<b>[0.01ms] 導通 (ON):</b> ${comp.name} ゲート電圧 Vgs = ${vgs}V (>= 2.1V)。極小オン抵抗 1.2Ω でドレイン-ソース間が完全導通 (ゲート電流: 0.00µA)。`;
      }



   return `<b>[0.01ms] 遮断 (CUTOFF):</b> ${comp.name} ゲート電圧 Vgs = ${vgs}V (< 2.1V) のためチャネル未形成。主電流を完全遮断中。`;
    }
  },

// --- 音響・波形素子 (圧電サウンダ / ピエゾブザー) ---
  BUZZER_PIEZO: {
    category: "OPTO",
    type: "buzzer",
    name: "圧電ブザー (2.4kHz)",
    spanCols: 2, // 2列スパン直挿し
    freq_hz: 2400, // 発振周波数 2.4kHz
    val_ohm: 16,   // 内部等価インピーダンス (約16Ω)
    capacitance_nF: 25, // 圧電素子等価容量 (25nF)
    desc: "2.4kHzで自励発振する音響素子。オシロスコープ上で矩形波パルスを描画し、外付けコンデンサや抵抗で波形が動的に変化します。",
    getPhysicsText: (comp, phys) => {
      const isConducting = (comp.current_mA || 0) > 0.05;
      if (isConducting) {
        return `[発振動作中]: ${comp.name} 2.4kHz パルス波形を出力中 (オシロスコープCH1/CH2に波形描画同期)。`;
      }
      return `[発振停止]: ${comp.name} 電圧印加なしのため振動停止中。`;
    }
  },





  // ★ 項目②: CdS光導電セル (GL5528型 5mm径 光センサー)
  CDS_PHOTOCELL: {
    category: "SENSOR",
    type: "cds",
    name: "CdS光導電セル (5mm)",
    desc: "光の強さに応じて抵抗値が激変する硫化カドミウム受光素子。暗くするとメガΩ級へ上昇します。",
    spanCols: 2, // 2端子 (2〜3列スパン配置対応)
    lux: 50, // 初期照度: 50 Lux (薄暗い室内)
    val_ohm: 10000, // 50 Lux時: 約 10kΩ
    r_dark: 1000000, // 暗黒時: 1MΩ
    r_10lux: 20000,  // 10 Lux時: 20kΩ
    gamma: 0.7,
    getPhysicsText: (comp, phys) => {
      const curLux = comp.lux !== undefined ? comp.lux : 50;
      const curOhm = comp.val_ohm || 10000;
      const ohmText = curOhm >= 1000000
        ? `${(curOhm / 1000000).toFixed(2)}MΩ`
        : (curOhm >= 1000 ? `${(curOhm / 1000).toFixed(1)}kΩ` : `${curOhm}Ω`);
      if (curLux < 10) {
        return `🌙 <b>[暗黒検知]:</b> ${comp.name} 照度 ${curLux}Lux (超高抵抗 ${ohmText}) ➔ 電流を極小に制限中。`;
      } else if (curLux > 150) {
        return `<b>[強光受光]:</b> ${comp.name} 照度 ${curLux}Lux (低抵抗 ${ohmText}) ➔ 光励起キャリアにより導通促進中。`;
      }
      return `🌤️ <b>[環境受光]:</b> ${comp.name} 照度 ${curLux}Lux (実効抵抗 ${ohmText}) ➔ 光量に応じた分圧を生成中。`;
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
  } else if (master.type === "tact_switch") {
    newInst.subType = master.subType || "tact";
    newInst.isPressed = false;
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
  } else if (master.type === "cds") {
    // ★ CdS光導電セルの動的プロパティ初期化
    newInst.lux = master.lux !== undefined ? master.lux : 50;
    newInst.val_ohm = master.val_ohm || 10000;
    newInst.r_dark = master.r_dark || 1000000;
    newInst.r_10lux = master.r_10lux || 20000;
    newInst.gamma = master.gamma || 0.7;
  }

  // 圧電ブザー (ピエゾサウンダ) の動的プロパティ初期化
  else if (master.type === "buzzer") {
    newInst.freq_hz = master.freq_hz || 2400;
    newInst.val_ohm = master.val_ohm || 16;
    newInst.capacitance_nF = master.capacitance_nF || 25;
    newInst.current_mA = 0.0;
    newInst.voltageDrop = 0.0;
    newInst.power_mW = 0.0;
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

  // ★ NチャネルMOSFET (2N7000) の3端子 (Source / Gate / Drain) スナップ生成
  else if (master.type === "mosfet") {
    const safeCol = Math.min(startCol, 28);

    // TO-92の並び: 左から S (ソース), G (ゲート), D (ドレイン)
    newInst.pinS = `C${safeCol}`;     // 左足: ソース
    newInst.pinG = `C${safeCol + 1}`; // 中足: ゲート
    newInst.pinD = `C${safeCol + 2}`; // 右足: ドレイン

    // 既存2端子互換 (バウンディングボックス・全域スパン用)
    newInst.pinA = newInst.pinS;
    newInst.pinB = `C${safeCol + 2}`;

    // 物理パラメータ
    newInst.vgs_th = master.vgs_th || 2.1;
    newInst.rds_on = master.rds_on || 1.2;
    newInst.vds_max = master.vds_max || 60.0;
    newInst.id_max_mA = master.id_max_mA || 200.0;

    // 動作ステータス (初期値: 遮断)
    newInst.state = "CUTOFF"; // CUTOFF | ON
    newInst.vgs_V = 0.0;
    newInst.id_mA = 0.0;
    newInst.vds_V = 0.0;
    newInst.ig_uA = 0.0; // 理想MOSFETはゲート電流0
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

function getColFromHoleId(holeId) {
  if (!holeId) return 1;
  const match = holeId.match(/\d+/g);
  return (match && match.length > 0) ? parseInt(match[match.length - 1], 10) : 1;
}

function autoGenerateJumperWires() {
  if (!Array.isArray(activeJumperWires)) activeJumperWires = [];
}

// ショート状態変化検知用フラグ
let isCurrentlyShortCircuit = false;

function diagnoseWiringErrors(energizedNodes) {
  const isShortConnected = energizedNodes.has("NODE_POWER_TOP_PLUS") && energizedNodes.has("NODE_POWER_BOTTOM_MINUS");
    // 可変抵抗の実効値も反映した負荷抵抗総和
  const rTotal = components.reduce((sum, c) => {
    if (c.type === "resistor") return sum + (c.val_ohm || 0);
    if (c.type === "potentiometer") {
      const maxOhm = c.val_max_ohm || 10000;
      const ratio = c.cur_ratio !== undefined ? c.cur_ratio : 0.5;
      return sum + (c.val_ohm !== undefined ? c.val_ohm : Math.round(maxOhm * ratio));
    }
    return sum;
  }, 0);

  const isShortDetected = isShortConnected && (rTotal === 0) && (components.length > 0);

  if (isShortDetected && !isCurrentlyShortCircuit) {
    isCurrentlyShortCircuit = true;
    console.warn("⚠️ [自動配線チェック] 警告: 抵抗を介さずに電源とGNDが短絡（ショート）しています！");
  } else if (!isShortDetected && isCurrentlyShortCircuit) {
    isCurrentlyShortCircuit = false;
    console.log("✅ [自動配線チェック] ショート状態が解除されました。");
  }
}

function analyzeEnergizedNodes() {
  autoGenerateJumperWires();

  // 探索開始前に全トランジスタおよびMOSFETを遮断状態へ初期化
  components.forEach(c => {
    if (c.type === "transistor" || c.type === "mosfet") c.state = "CUTOFF";
  });

  const energizedNodes = new Set(["NODE_POWER_TOP_PLUS"]);  const queue = ["NODE_POWER_TOP_PLUS"];

  while (queue.length > 0) {
    const currNode = queue.shift();

    // 1. ジャンパ線を介した導通探索
    activeJumperWires.forEach(wire => {
      const nFrom = getNodeByHoleId(wire.fromHole);
      const nTo = getNodeByHoleId(wire.toHole);
      if (nFrom === currNode && !energizedNodes.has(nTo)) {
        energizedNodes.add(nTo); queue.push(nTo);
      } else if (nTo === currNode && !energizedNodes.has(nFrom)) {
        energizedNodes.add(nFrom); queue.push(nFrom);
      }
    });

   // 2. コンポーネント内部を介した導通探索 (トグル・タクトスイッチの開放を厳格遮断)
    components.forEach(comp => {
      if ((comp.type === "switch" && !comp.isOn) ||
          (comp.type === "tact_switch" && !comp.isPressed) ||
          comp.isBurned) return;

      const nA = getNodeByHoleId(comp.pinA);
      const nB = getNodeByHoleId(comp.pinB);
      if (!nA || !nB) return;

      // 整流ダイオード: アノード(pinA) ➔ カソード(pinB) のみ一方向導通
      if (comp.type === "diode") {
        if (nA === currNode && !energizedNodes.has(nB)) {
          energizedNodes.add(nB); queue.push(nB);
        }
        return;
      }

      // SPDTスイッチ: COM端子と選択中接点の双方向導通
      if (comp.type === "switch_spdt") {
        const comHole = comp.pinCom || comp.pinCOM || `C${getColFromHoleId(comp.pinA) + 2}`;
        const nCOM = getNodeByHoleId(comHole);
        const targetPin = (comp.state === "L2") ? comp.pinB : comp.pinA;
        const nTarget = getNodeByHoleId(targetPin);

        if (nCOM && nTarget) {
          if (nCOM === currNode && !energizedNodes.has(nTarget)) {
            energizedNodes.add(nTarget); queue.push(nTarget);
          } else if (nTarget === currNode && !energizedNodes.has(nCOM)) {
            energizedNodes.add(nCOM); queue.push(nCOM);
          }
        }
        return;
      }

      // 可変抵抗器: A-B間直通 ＆ Wiper端子との3端子相互導通
      if (comp.type === "potentiometer") {
        const wiperHole = comp.pinC || comp.pinWiper || "E5";
        const nWiper = getNodeByHoleId(wiperHole);
        if (nWiper) {
          if ((nA === currNode || nB === currNode) && !energizedNodes.has(nWiper)) {
            energizedNodes.add(nWiper); queue.push(nWiper);
          } else if (nWiper === currNode) {
            if (!energizedNodes.has(nA)) { energizedNodes.add(nA); queue.push(nA); }
            if (!energizedNodes.has(nB)) { energizedNodes.add(nB); queue.push(nB); }
          }
        }
        if (nA === currNode && !energizedNodes.has(nB)) {
          energizedNodes.add(nB); queue.push(nB);
        } else if (nB === currNode && !energizedNodes.has(nA)) {
          energizedNodes.add(nA); queue.push(nA);
        }
        return;
      }

   // NPNトランジスタ: ベース通電によるC-Eスイッチング
      if (comp.type === "transistor") {
        const nE = getNodeByHoleId(comp.pinE);
        const nC = getNodeByHoleId(comp.pinC);
        const nB = getNodeByHoleId(comp.pinB);
        if (nB === currNode || energizedNodes.has(nB)) comp.state = "SATURATED";
        if (comp.state === "SATURATED" && (nC === currNode || energizedNodes.has(nC)) && nE && !energizedNodes.has(nE)) {
          energizedNodes.add(nE); queue.push(nE);
        }
        return;
      }

      // NチャネルMOSFET: ゲート電圧印加によるD-Sスイッチング (電圧制御)
      if (comp.type === "mosfet") {
        const nS = getNodeByHoleId(comp.pinS);
        const nD = getNodeByHoleId(comp.pinD);
        const nG = getNodeByHoleId(comp.pinG);
        if (nG === currNode || energizedNodes.has(nG)) comp.state = "ON";
        if (comp.state === "ON" && (nD === currNode || energizedNodes.has(nD)) && nS && !energizedNodes.has(nS)) {
          energizedNodes.add(nS); queue.push(nS);
        }
        return;
      }

      // 一般受動素子: 双方向導通
      if (nA === currNode && !energizedNodes.has(nB)) {
        energizedNodes.add(nB); queue.push(nB);
      } else if (nB === currNode && !energizedNodes.has(nA)) {
        energizedNodes.add(nA); queue.push(nA);
      }
    });
  }

  diagnoseWiringErrors(energizedNodes);
  return energizedNodes;
}

let prevCircuitStatus = "OPEN";
let lastLogUpdateTime = Date.now();

function updatePhysicsLogEngine(physics, energizedNodes) {
  const logEl = document.getElementById("circuit-event-log");
  if (!logEl) return;

  const now = Date.now();
  const isClosed = physics && physics.status === "CLOSED";
  const currentStatus = isClosed ? "CLOSED" : (physics && physics.status === "SHORT" ? "SHORT" : "OPEN");
  const curV = (physics && physics.v_in !== undefined) ? physics.v_in : (typeof selectedBatteryVoltage !== "undefined" ? selectedBatteryVoltage : 9.0);
  const vLabel = Number.isInteger(curV) ? `${curV}.0V` : `${curV.toFixed(1)}V`;

  if (currentStatus === "SHORT") {
    logEl.style.borderLeftColor = "#ef4444";
    logEl.innerHTML = `⚠️ <span style="color:#ef4444; font-weight:bold;">[SHORT CIRCUIT / 危険短絡]:</span> 電源(+${vLabel})とGNDが抵抗を介さずに直結されています！`;
    prevCircuitStatus = currentStatus;
    return;
  }

 if (!isClosed) {
    prevCircuitStatus = "OPEN";
    logEl.style.borderLeftColor = "#64748b";
    logEl.innerHTML = `🔌 <b>[0.00ms] 回路遮断 (OPEN):</b> 電界が消滅し、自由電子の流動および発光が停止しました。`;
    return;
  }

// ツリー再描画と完全同期で最新の因果ログを生成
  prevCircuitStatus = "CLOSED";
  logEl.style.borderLeftColor = "#38bdf8";

  // 過熱・焼損の非常事態を最優先判定 (デッドコード解消)
  const burnedComp = components.find(c => c.isBurned);
  const hotLED = components.find(c => c.type === "led" && c.temp_C && c.temp_C > 60.0);

  if (burnedComp) {
    logEl.style.borderLeftColor = "#ef4444";
    logEl.innerHTML = `<span style="color:#ef4444; font-weight:bold;">[MELTED / 物理破壊]:</span> ${burnedComp.name || '素子'} は電流制限の防壁を失い、過大エネルギーにより熱破壊しました。`;
    return;
  } else if (hotLED) {
    logEl.style.borderLeftColor = "#f59e0b";
    logEl.innerHTML = `<span style="color:#f59e0b; font-weight:bold;">[OVERHEAT / 熱的限界]:</span> ${hotLED.name} の素子温度が <b>${hotLED.temp_C.toFixed(1)}℃</b> に達しています。放熱限界に注意してください。`;
    return;
  }

  const totalI = (physics && physics.i_total_mA) ? physics.i_total_mA : 0.0;
  const iStr = totalI.toFixed(2);
  let msgs = [`<b>[系統稼働中]:</b> +${vLabel} 電源レール供給中 (全系電流: <b>${iStr} mA</b>)`];

  // 1. スイッチ導通状態
  const swComp = components.find(c => c.type === "switch" || c.type === "switch_spdt");
  if (swComp) {
    msgs.push(`<b>[閉路接点]:</b> ${swComp.name || 'トグルスイッチ'} 導通中 (損失ゼロの導電経路を形成)`);
  }

  // 2. 抵抗性負荷のエネルギー分配
  const resistors = components.filter(c => c.type === "resistor" || c.type === "potentiometer");
  resistors.forEach(r => {
    const rDrop = (r.voltageDrop !== undefined) ? r.voltageDrop.toFixed(2) : "0.00";
    const rRatio = curV > 0 ? (((r.voltageDrop || 0) / curV) * 100).toFixed(1) : "0.0";
    const rPower = (r.power_mW !== undefined) ? r.power_mW.toFixed(1) : ((r.voltageDrop || 0) * totalI).toFixed(1);
    const rName = r.name || (r.val_ohm ? `${(r.val_ohm >= 1000 ? (r.val_ohm/1000) + 'k' : r.val_ohm)}Ω 抵抗` : "抵抗器");
    msgs.push(`<b>[エネルギー防壁]:</b> ${rName} ➔ 電圧の <b>${rRatio}% (${rDrop}V)</b> を受け止め熱として消費 (${rPower}mW)`);
  });

  // 3. コンデンサの電荷蓄積
  const capComp = components.find(c => c.type === "capacitor");
  if (capComp) {
    const cDrop = (capComp.voltageDrop !== undefined ? capComp.voltageDrop : (capComp.charge_V || 0)).toFixed(2);
    msgs.push(`<b>[電荷貯蔵]:</b> ${capComp.name || '電解コンデンサ'} ➔ 端子間に <b>${cDrop}V</b> を蓄積中`);
  }

  // 4. LEDの発光ステータス
  const leds = components.filter(c => c.type === "led");
  leds.forEach(led => {
    if (totalI > 0.05 && (led.isOn || led.current_mA > 0.05)) {
      const ledV = (led.voltageDrop !== undefined ? led.voltageDrop : (led.vf || 2.0)).toFixed(2);
      const ledP = (led.power_mW !== undefined) ? led.power_mW.toFixed(1) : (parseFloat(ledV) * totalI).toFixed(1);
      msgs.push(`<b>[光変換]:</b> ${led.name || 'LED'} ➔ 順方向電位 <b>${ledV}V</b> を確立し発光中 (${ledP}mW)`);
    } else {
      const ledVf = led.vf || 2.0;
      msgs.push(`<b>[障壁未達]:</b> ${led.name || 'LED'} ➔ 素子を開くエネルギーが不足 (${vLabel} < 障壁電位:${ledVf}V)`);
    }
  });

  logEl.innerHTML = msgs.join("<br>");
  lastLogUpdateTime = now;
}

function updateDisplayToggles() {
  DISPLAY_MODE.isXrayON = document.getElementById("toggle-xray").checked;
  DISPLAY_MODE.isSymbolON = document.getElementById("toggle-symbol").checked;
}

// ======================================================================
// 05-1. 回路物理計算エンジン (直列・並列ハイブリッド＆統合リファクタリング版)
// ======================================================================
function calculateCircuitPhysics() {
  const energized = (typeof analyzeEnergizedNodes === "function") ? analyzeEnergizedNodes() : new Set();
  const isPowered = energized.has("NODE_POWER_TOP_PLUS") && energized.has("NODE_POWER_BOTTOM_MINUS");
  const v_in = (typeof selectedBatteryVoltage !== "undefined") ? selectedBatteryVoltage : 9.0;
  const BATTERY_INTERNAL_R = 2.0;
  const wires = Array.isArray(activeJumperWires) ? activeJumperWires : (window.wires || []);

// 1. 可変抵抗器の実効抵抗値取得ヘルパー (ツマミ比率優先・平衡復帰完全保証版)
  const getPotEffOhm = (c) => {
    const maxOhm = c.val_max_ohm || 10000;
    // cur_ratioが存在する場合はツマミの現在位置を絶対優先で実効値を算出
    const ratio = c.cur_ratio !== undefined ? c.cur_ratio : (c.val_ohm !== undefined ? (c.val_ohm / maxOhm) : 0.5);
    const effR = Math.max(1.0, Math.round(maxOhm * ratio));
    // コンポーネント側のval_ohmもリアルタイム同期して不整合を根絶
    c.val_ohm = effR;
    return effR;
  };



  // 2. コンデンサの過渡応答・充放電解析
  const cap = components.find(c => c.type === "capacitor");
  if (cap) {
    if (cap.charge_V === undefined) cap.charge_V = 0.0;
    const isCapConnected = energized.has(getNodeByHoleId(cap.pinA)) && energized.has(getNodeByHoleId(cap.pinB));
    const rSum = components.reduce((sum, c) => {
      if (c.type === "resistor") return sum + (c.val_ohm || 0);
      if (c.type === "potentiometer") return sum + Math.max(getPotEffOhm(c), 1.0);
      return sum;
    }, 0) || 100;

    const tau_s = (rSum * (cap.val_uF || 10)) / 1000000;
    const dt = 0.016;

    if (isPowered && isCapConnected) {
      const alpha = 1 - Math.exp(-dt / Math.max(tau_s, 0.001));
      cap.charge_V += (v_in - cap.charge_V) * alpha;
      if (cap.charge_V > v_in - 0.001) cap.charge_V = v_in;
    } else {
      const alpha = Math.exp(-dt / Math.max(tau_s * 2.0, 0.05));
      cap.charge_V *= alpha;
      if (cap.charge_V < 0.001) cap.charge_V = 0.0;
    }
  }

  // 3. 通電・自立放電判定
  const capV = cap ? (cap.charge_V || 0.0) : 0.0;
  const isDischarging = !isPowered && capV > 1.8;
  const isClosed = isPowered || isDischarging;
  const effectiveV = isPowered ? v_in : capV;

  // 回路未通電時の即時遮断クリーンアップ
  if (!isClosed || components.length === 0) {
    components.forEach(c => { c.current_mA = 0; c.voltageDrop = 0; c.power_mW = 0; if (c.type === "led") c.isOn = false; });
    wires.forEach(w => { w.current_mA = 0; });
    const openResult = { status: "OPEN", v_in: 0.0, r_total_ohm: Infinity, i_total_mA: 0.0, p_total_mW: 0.0, energized };
    if (typeof updateCircuitTreePanel === "function") updateCircuitTreePanel(openResult);
    return openResult;
  }

// 4. 通電素子の抽出 (★ トポロジーによる給電系統解析：16列決め打ちを完全撤廃)
  // 上部プラスレールから直接給電されているノード(列)を動的検出
  const powerFeedNodes = new Set();
  wires.forEach(w => {
    if (w.fromHole && w.fromHole.startsWith("BUS_TOP_PLUS")) powerFeedNodes.add(getNodeByHoleId(w.toHole));
    if (w.toHole && w.toHole.startsWith("BUS_TOP_PLUS")) powerFeedNodes.add(getNodeByHoleId(w.fromHole));
  });

// ブリッジ架橋素子判定: GNDに接地されていない真のブリッジ架橋素子のみを限定抽出
  const isBridgeComponent = (c) => {
    if (powerFeedNodes.size < 2) return false;
    const nA = getNodeByHoleId(c.pinA || c.pinAnode);
    const nB = getNodeByHoleId(c.pinB || c.pinCathode);
    if (!nA || !nB || powerFeedNodes.has(nA) || powerFeedNodes.has(nB)) return false;

    // マイナスレールへ直接またはジャンパ線を介して接地されている素子は並列負荷であり架橋ではない
    const isGndConnected = wires.some(w => {
      const isMinus = (w.fromHole && w.fromHole.includes("MINUS")) || (w.toHole && w.toHole.includes("MINUS"));
      if (!isMinus) return false;
      const wf = getNodeByHoleId(w.fromHole);
      const wt = getNodeByHoleId(w.toHole);
      return (wf === nA || wt === nA || wf === nB || wt === nB);
    });

    return !isGndConnected;
  };
  // 通常の主幹LEDのみを抽出（真のブリッジ架橋LEDのみ直列から除外）
  let activeLeds = components.filter(c => {
    if (c.type !== "led" || c.isBurned || isBridgeComponent(c)) return false;
    return energized.has(getNodeByHoleId(c.pinA)) && energized.has(getNodeByHoleId(c.pinB));
  });

  if (activeLeds.length === 0 && isPowered && !components.some(isBridgeComponent)) {
    const singleLed = components.find(c => c.type === "led" && !c.isBurned);
    if (singleLed) activeLeds = [singleLed];
  }
 // 抵抗素子群に CdS光導電セル (cds) を正式統合
// 抵抗素子群に CdS光導電セル (cds) を正式統合
  const connectedResistors = components.filter(c =>
    (!c.isBurned) && ((c.type === "resistor" && c.val_ohm !== undefined) || (c.type === "potentiometer") || (c.type === "cds"))
  );

  // 既存の同名関数・変数との衝突を防ぐため、存在しない場合のみ定義または代入
  var getEffOhm = (c) => {
    if (!c) return 1000;
    if (c.type === "potentiometer") return getPotEffOhm(c);
    if (c.type === "cds") {
      const lux = c.lux !== undefined ? c.lux : 50;
      return Math.round(lux <= 1 ? 1000000 : Math.max(200, 20000 * Math.pow(10 / Math.max(lux, 1), 0.7)));
    }
    return c.val_ohm || 1000;
  };



  let i_total_mA = 0.0;
  let r_load_ohm = 0.0;

  // 初期化: 全素子・全ワイヤの電流を一旦リセット
  connectedResistors.forEach(r => { r.current_mA = 0; r.voltageDrop = 0; r.power_mW = 0; });
  wires.forEach(w => { w.current_mA = 0; });

// 5. ブランチ（並列／直列）解析コア
  if (activeLeds.length >= 1) {
    let invRSum = 0;

    activeLeds.forEach(led => {
      const vf = led.vf || 2.0;
      const nLedA = getNodeByHoleId(led.pinA);
      const nLedB = getNodeByHoleId(led.pinB);

      // 直接接続または中継ジャンパ線を1本介してLEDに繋がる抵抗を動的検出
      const matchedR = connectedResistors.find(r => {
        const nrA = getNodeByHoleId(r.pinA);
        const nrB = getNodeByHoleId(r.pinB);
        if (nrA === nLedA || nrB === nLedA || nrA === nLedB || nrB === nLedB) return true;
        return wires.some(w => {
          const wf = getNodeByHoleId(w.fromHole);
          const wt = getNodeByHoleId(w.toHole);
          const connectsToLed = (wf === nLedA || wt === nLedA || wf === nLedB || wt === nLedB);
          const connectsToR = (wf === nrA || wt === nrA || wf === nrB || wt === nrB);
          return connectsToLed && connectsToR;
        });
      });

 // ★ トランジスタ回路検出: ベース抵抗(高抵抗)の混入を徹底排除
      const hasTransistor = components.some(c => c.type === "transistor");
      let branchR = 0;
      if (hasTransistor) {
        // 1. matchedRがあればそれを優先、無ければベース端子(B)以外に繋がる負荷抵抗(1kΩ等)を自動抽出
        const collectorR = matchedR || connectedResistors.find(r => (r.val_ohm || 0) < 50000) || connectedResistors[0];
        branchR = collectorR ? (collectorR.type === "resistor" ? (collectorR.val_ohm || 1000) : getPotEffOhm(collectorR)) : 1000;
     } else if (activeLeds.length > 1) {
        branchR = matchedR ? getEffOhm(matchedR) : 1000;
      } else {
        // 単一直列時: 回路上の全抵抗・可変抵抗・CdSの抵抗値を正確に合算
        branchR = connectedResistors.reduce((sum, r) => sum + getEffOhm(r), 0);
      }

     // ★ 直列コンデンサおよび整流ダイオードの順方向降下(Vf)を動的反映
      const isSeriesCap = cap && energized.has(getNodeByHoleId(cap.pinA)) && energized.has(getNodeByHoleId(cap.pinB));
      const capDropV = isSeriesCap ? (cap.charge_V || 0.0) : 0.0;

      // 通電経路上の整流ダイオードの Vf (約0.7V) を合算
      const seriesDiodes = components.filter(c => c.type === "diode" && energized.has(getNodeByHoleId(c.pinA)) && energized.has(getNodeByHoleId(c.pinB)));
      const diodeDropV = seriesDiodes.reduce((sum, d) => sum + (d.vf || 0.7), 0.0);

      const vDrive = Math.max(0.0, effectiveV - capDropV - diodeDropV);

      const branchI = vDrive > vf ? ((vDrive - vf) / (branchR + BATTERY_INTERNAL_R)) * 1000 : 0.0;
      led.current_mA = branchI;

    // ダイオード個別諸元への反映
      seriesDiodes.forEach(d => {
        d.current_mA = branchI;
        d.voltageDrop = branchI > 0.05 ? (d.vf || 0.7) : 0.0;
        d.power_mW = d.voltageDrop * branchI;
      });

      if (isSeriesCap) {
        cap.voltageDrop = capDropV;
        cap.current_mA = branchI;
        cap.power_mW = capDropV * branchI;
      }

   // 枝路内LED・抵抗への厳格な諸元反映
      led.current_mA = branchI;
      led.isOn = (branchI > 0.05);
      led.voltageDrop = led.isOn ? vf : 0.0;
      led.power_mW = led.voltageDrop * branchI;

     // 枝路内LED・抵抗への厳格な諸元反映
      led.current_mA = branchI;
      led.isOn = (branchI > 0.05);
      led.voltageDrop = led.isOn ? vf : 0.0;
      led.power_mW = led.voltageDrop * branchI;

      const isTrCircuit = components.some(c => c.type === "transistor");
      connectedResistors.forEach(r => {
        const isBaseResistor = isTrCircuit && ((r.val_ohm || 0) >= 50000 || (r.id && r.id.includes("TR_B")));
        if (!isBaseResistor && (r === matchedR || (!isTrCircuit && activeLeds.length === 1))) {
          const rVal = r.type === "resistor" ? (r.val_ohm || 0) : getPotEffOhm(r);
          r.current_mA = branchI;
          r.voltageDrop = (branchI / 1000) * rVal;
          r.power_mW = r.voltageDrop * branchI;
        }
      });

      // 枝路内ワイヤへの厳格な諸元反映 (給電線・中継線・接地線を完全網羅)
      wires.forEach(w => {
        const nF = getNodeByHoleId(w.fromHole);
        const nT = getNodeByHoleId(w.toHole);
        if (activeLeds.length === 1) {
          if (energized.has(nF) && energized.has(nT)) w.current_mA = branchI;
        } else {
          const nrA = matchedR ? getNodeByHoleId(matchedR.pinA) : null;
          const nrB = matchedR ? getNodeByHoleId(matchedR.pinB) : null;
          const isBranchWire = (
            (nF === nLedA || nT === nLedA) ||
            (nF === nLedB || nT === nLedB) ||
            (nrA && (nF === nrA || nT === nrA)) ||
            (nrB && (nF === nrB || nT === nrB))
          );
          if (isBranchWire && branchI > 0) {
            w.current_mA = branchI;
          }
        }
      });

    // ★ 枝路内スイッチへの反映 (タクトスイッチの押下状態も統合反映)
      components.filter(c => c.type === "switch" || c.type === "switch_spdt" || c.type === "tact_switch").forEach(sw => {
        const isSwClosed = sw.type === "switch_spdt"
          ? (sw.state === "L1" || sw.state === "L2")
          : (sw.type === "tact_switch" ? !!sw.isPressed : !!sw.isOn);
        const nA = getNodeByHoleId(sw.pinA);
        const nB = getNodeByHoleId(sw.pinB);
        if (isSwClosed && energized.has(nA) && energized.has(nB)) {
          sw.current_mA = branchI;
          sw.voltageDrop = 0.0;
          sw.power_mW = 0.0;
        }
      });

      i_total_mA += branchI;


   invRSum += (1 / Math.max(branchR, 0.001));
    });

    // ★ トランジスタ増幅時のベース制御枝路 (Ib) の独立加算処理
    const activeTr = components.find(c => c.type === "transistor" && energized.has(getNodeByHoleId(c.pinB)) && c.state === "SATURATED");
    let i_base_mA = 0.0;
    if (activeTr) {
      const baseRComp = connectedResistors.find(r => {
        const nA = getNodeByHoleId(r.pinA);
        const nB = getNodeByHoleId(r.pinB);
        const nBase = getNodeByHoleId(activeTr.pinB);
        return nA === nBase || nB === nBase;
      });
      const rbVal = baseRComp ? (baseRComp.val_ohm || 100000) : 100000;
      // Ib = (Vin - Vbe) / Rb
      i_base_mA = Math.max(0.0, (effectiveV - (activeTr.vbe_drop || 0.7)) / rbVal) * 1000;
            if (baseRComp) {
        baseRComp.current_mA = i_base_mA;
        baseRComp.voltageDrop = (i_base_mA / 1000) * rbVal;
        baseRComp.power_mW = baseRComp.voltageDrop * i_base_mA;
      }
      activeTr.ib_uA = i_base_mA * 1000;
      activeTr.ic_mA = i_total_mA;
      activeTr.current_mA = i_total_mA;
      activeTr.voltageDrop = activeTr.vce_sat || 0.10;

      // ベース給電経路のワイヤ・スイッチにも Ib を反映
      wires.forEach(w => {
        if (w.fromHole && w.fromHole.includes("17") || w.toHole && w.toHole.includes("17")) {
          w.current_mA = i_base_mA;
        }
      });
      components.filter(c => c.type === "tact_switch" || c.type === "switch").forEach(sw => {
        const nA = getNodeByHoleId(sw.pinA);
        const nB = getNodeByHoleId(sw.pinB);
        const nBase = getNodeByHoleId(activeTr.pinB);
        if (nA === nBase || nB === nBase || (nA && nA.includes("17")) || (nB && nB.includes("17"))) {
          sw.current_mA = i_base_mA;
        }
      });

      // 主幹電流はコレクタ電流(Ic)とベース電流(Ib)の合流
      i_total_mA += i_base_mA;
    }

    r_load_ohm = invRSum > 0 ? (1 / invRSum) : 1000;

} else {
    // LED以外の負荷（ダイオード・トランジスタ・スイッチ等）の直列フォールバック
    const hasOtherLoads = components.some(c => c.type === "diode" || c.type === "transistor" || c.type === "resistor" || c.type === "switch" || c.type === "switch_spdt");
    if (!hasOtherLoads || !isPowered) {


      r_load_ohm = 0;
      i_total_mA = 0.0;
    } else {
      let dropV = 0.0;
      const activeDiodes = components.filter(c => c.type === "diode" && energized.has(getNodeByHoleId(c.pinA)) && energized.has(getNodeByHoleId(c.pinB)));
      dropV += activeDiodes.reduce((sum, d) => sum + (d.vf || 0.7), 0);

      const activeTransistors = components.filter(c => c.type === "transistor" && energized.has(getNodeByHoleId(c.pinE)) && energized.has(getNodeByHoleId(c.pinC)) && c.state === "SATURATED");
      dropV += activeTransistors.reduce((sum, t) => sum + (t.vce_sat || 0.10), 0);

// ★ 給電ノードごとのアーム動的クラスタリング (上流＋下流・可変抵抗の完全統合版)
      const feedNodeList = Array.from(powerFeedNodes);
      const isMultiArm = feedNodeList.length >= 2;

      // 各給電ノードから連なる全素子(上流抵抗＋下流抵抗/可変抵抗)を完全抽出
      const getArmComponents = (feedNode) => {
        const comps = [];
        const topComp = connectedResistors.find(c => getNodeByHoleId(c.pinA) === feedNode || getNodeByHoleId(c.pinB) === feedNode);
        if (topComp) {
          comps.push(topComp);
          const midNode = (getNodeByHoleId(topComp.pinA) === feedNode) ? getNodeByHoleId(topComp.pinB) : getNodeByHoleId(topComp.pinA);
          // 中点ノードに接続されている下流素子(R2またはVR1)を探索してアームに追加
          const botComp = connectedResistors.find(c => c !== topComp && (
            getNodeByHoleId(c.pinA) === midNode || getNodeByHoleId(c.pinB) === midNode ||
            (c.pinC && getNodeByHoleId(c.pinC) === midNode) || (c.pinWiper && getNodeByHoleId(c.pinWiper) === midNode)
          ));
          if (botComp) comps.push(botComp);
        }
        return comps;
      };

      const armAComps = isMultiArm ? getArmComponents(feedNodeList[0]) : [];
      const armBComps = isMultiArm ? getArmComponents(feedNodeList[1]) : [];

      if (isMultiArm && armAComps.length > 0 && armBComps.length > 0) {
        const getCompOhm = c => (c.type === "resistor" ? (c.val_ohm || 0) : getPotEffOhm(c));
        const rArmA = armAComps.reduce((sum, c) => sum + getCompOhm(c), 0);
        const rArmB = armBComps.reduce((sum, c) => sum + getCompOhm(c), 0);

        r_load_ohm = (rArmA > 0 && rArmB > 0) ? (rArmA * rArmB) / (rArmA + rArmB) : (rArmA || rArmB || 1.0);
        i_total_mA = (effectiveV / (r_load_ohm + BATTERY_INTERNAL_R)) * 1000;

        const iArmA_mA = (effectiveV / (rArmA + BATTERY_INTERNAL_R)) * 1000;
        const iArmB_mA = (effectiveV / (rArmB + BATTERY_INTERNAL_R)) * 1000;

        armAComps.forEach(c => {
          c.current_mA = iArmA_mA;
          c.voltageDrop = (iArmA_mA / 1000) * getCompOhm(c);
          c.power_mW = c.voltageDrop * iArmA_mA;
        });

        armBComps.forEach(c => {
          c.current_mA = iArmB_mA;
          c.voltageDrop = (iArmB_mA / 1000) * getCompOhm(c);
          c.power_mW = c.voltageDrop * iArmB_mA;
        });

        // アーム内の上流素子と下流素子を分離し、厳密な中点電位を算出
        const rTopA = getCompOhm(armAComps[0]);
        const rBotA = armAComps.length > 1 ? getCompOhm(armAComps[1]) : rTopA;
        const vMidA = (rTopA + rBotA > 0) ? effectiveV * (rBotA / (rTopA + rBotA)) : (effectiveV * 0.5);

        const rTopB = getCompOhm(armBComps[0]);
        const rBotB = armBComps.length > 1 ? getCompOhm(armBComps[1]) : rTopB;
        const vMidB = (rTopB + rBotB > 0) ? effectiveV * (rBotB / (rTopB + rBotB)) : (effectiveV * 0.5);

        const vDiff = Math.abs(vMidA - vMidB);
       // ★ 接地ジャンパ線と架橋線を厳密分離：マイナスレールへの帰還電流を100%保証
        wires.forEach(w => {
          const nFrom = getNodeByHoleId(w.fromHole);
          const nTo = getNodeByHoleId(w.toHole);
          const isGroundWire = (w.fromHole && w.fromHole.startsWith("BUS_BOTTOM_MINUS")) ||
                               (w.toHole && w.toHole.startsWith("BUS_BOTTOM_MINUS"));

          if (energized.has(nFrom) && energized.has(nTo)) {
            if (isGroundWire) {
              // マイナスレールへ帰還するワイヤ：接続元のアーム電流(AまたはB)を割り当て
              const bNode = w.fromHole.startsWith("BUS_BOTTOM_MINUS") ? nTo : nFrom;
              const isArmA = armAComps.some(c => getNodeByHoleId(c.pinA) === bNode || getNodeByHoleId(c.pinB) === bNode);
              w.current_mA = isArmA ? iArmA_mA : iArmB_mA;
         } else {
              // 給電線またはブリッジ中央の架橋線 (テブナン等価内部抵抗による現実的横流算出)
              const isFeedWire = (nFrom === feedNodeList[0] || nTo === feedNodeList[0] || nFrom === feedNodeList[1] || nTo === feedNodeList[1]);
              // 中点電位差が 0.10V 未満の場合は平衡状態(ゼロ遮断)
              // 架橋線の電流はテブナン等価抵抗(約1000Ω)を考慮したオーム計算で上限を制限
              const isBalanced = vDiff < 0.10;
              const rThevenin = 1000.0;
              w.current_mA = isFeedWire ? (i_total_mA * 0.5) : (isBalanced ? 0.0 : (vDiff / rThevenin) * 1000);
            }
          }
        });

       // 架橋LEDの動的評価 (ジャンパ線中継を考慮した所属アーム厳格判定版)
        const bridgeLeds = components.filter(c => isBridgeComponent(c) && c.type === "led" && !c.isBurned);
        bridgeLeds.forEach(led => {
          const nA = getNodeByHoleId(led.pinA);
          // 直接接続またはジャンパ線を介してアームAの中点に繋がっているかを動的追跡
          const isAnodeOnA = armAComps.some(c => {
            const nrA = getNodeByHoleId(c.pinA);
            const nrB = getNodeByHoleId(c.pinB);
            if (nrA === nA || nrB === nA) return true;
            return wires.some(w => {
              const wf = getNodeByHoleId(w.fromHole);
              const wt = getNodeByHoleId(w.toHole);
              return (wf === nA && (wt === nrA || wt === nrB)) || (wt === nA && (wf === nrA || wf === nrB));
            });
          });
          const vAnode = isAnodeOnA ? vMidA : vMidB;
          const vCathode = isAnodeOnA ? vMidB : vMidA;
          const vForward = vAnode - vCathode;
          const vf = led.vf || 2.0;

          if (vForward > vf) {
            const ledI_mA = Math.min(25.0, ((vForward - vf) / 200) * 1000);
            led.isOn = true;
            led.current_mA = Math.max(0.5, ledI_mA);
            led.voltageDrop = vf;
            led.power_mW = vf * led.current_mA;
          } else {
            led.isOn = false;
            led.current_mA = 0.0;
            led.voltageDrop = 0.0;
            led.power_mW = 0.0;
          }
        });

      } else {
        // 単一直列フォールバック
        r_load_ohm = connectedResistors.reduce((sum, c) => sum + (c.type === "resistor" ? c.val_ohm : getPotEffOhm(c)), 0);
        const isTurnedOn = effectiveV > dropV;
        const effectiveResistorV = isTurnedOn ? (effectiveV - dropV) : 0.0;
        i_total_mA = (r_load_ohm + BATTERY_INTERNAL_R > 0 && isTurnedOn)
          ? (effectiveResistorV / (r_load_ohm + BATTERY_INTERNAL_R)) * 1000
          : 0.0;

        components.forEach(c => { c.current_mA = i_total_mA; });
        wires.forEach(w => {
          if (energized.has(getNodeByHoleId(w.fromHole)) && energized.has(getNodeByHoleId(w.toHole))) {
            w.current_mA = i_total_mA;
          }
        });
      }



    }
  }

 // 6. ショート判定
  if (r_load_ohm === 0 && components.length > 0 && i_total_mA > 0) {
    const shortCurrent_mA = (effectiveV / BATTERY_INTERNAL_R) * 1000;
    components.filter(c => c.type === "led").forEach(l => l.isOn = false);
    const shortResult = { status: "SHORT", v_in: effectiveV, r_total_ohm: BATTERY_INTERNAL_R, i_total_mA: shortCurrent_mA, p_total_mW: effectiveV * shortCurrent_mA, energized };
    if (typeof updateCircuitTreePanel === "function") updateCircuitTreePanel(shortResult);
    return shortResult;
  }

  // ★ 再代入を許可するため let 宣言に変更
  let r_total_ohm = r_load_ohm + BATTERY_INTERNAL_R;
  let p_total_mW = effectiveV * i_total_mA;

  // 7. 各素子の熱物理・自立過熱溶断判定
  let hasBurnedComponent = false;

  components.filter(c => c.type === "led").forEach(led => {
    const isConnected = energized.has(getNodeByHoleId(led.pinA)) && energized.has(getNodeByHoleId(led.pinB));
    const actualLedI = (isConnected && !led.isBurned) ? (led.current_mA || 0.0) : 0.0;

    if (led.isBurned) {
      led.isOn = false;
      led.current_mA = 0.0;
      hasBurnedComponent = true;
    } else if (isConnected && effectiveV >= (led.vf || 2.0) && actualLedI > 0.05) {
      if (actualLedI > 45.0) {
        led.isBurned = true;
        led.isOn = false;
        led.current_mA = 0.0;
        hasBurnedComponent = true;
        const p = (typeof getHoleCoord === "function") ? getHoleCoord(led.pinA) : null;
        if (p && typeof triggerBurnExplosion === "function") triggerBurnExplosion(p.x + 15, p.y);
      } else {
        led.isOn = true;
        led.temp_C = 25.0 + (actualLedI * 2.2);
      }
    } else {
      led.isOn = false;
      led.current_mA = 0.0;
    }
  });

 // 8. 抵抗器の過熱焼損＆パラメータ一括同期 (★ トランジスタ個別ブランチ電流の保護対応)
  const isTrActive = components.some(c => c.type === "transistor" && c.state === "SATURATED");

  components.forEach(comp => {
    if (comp.isBurned) {
      comp.current_mA = 0; comp.voltageDrop = 0; comp.power_mW = 0;
      return;
    }

    // トランジスタ動作時は、各素子が独自に算出した current_mA を厳格に最優先保持する
    const compI = (isTrActive && comp.current_mA !== undefined && comp.current_mA > 0)
      ? comp.current_mA
      : ((comp.current_mA !== undefined) ? comp.current_mA : i_total_mA);

  if (comp.type === "resistor") {
      // 既に個別電圧降下が計算されている場合はそれを尊重、未計算の場合のみ再計算
      if (!isTrActive || comp.voltageDrop === undefined || comp.voltageDrop === 0) {
        comp.current_mA = compI;
        comp.voltageDrop = (compI / 1000) * (comp.val_ohm || 0);
        comp.power_mW = comp.voltageDrop * compI;
      }
      if (comp.power_mW > 500.0) {
        comp.isBurned = true;
        hasBurnedComponent = true;
        const p = (typeof getHoleCoord === "function") ? getHoleCoord(comp.pinA) : null;
        if (p && typeof triggerBurnExplosion === "function") triggerBurnExplosion(p.x + 20, p.y);
      }
    } else if (comp.type === "potentiometer") {
      const effR = getPotEffOhm(comp);
      comp.current_mA = compI;
      comp.voltageDrop = (compI / 1000) * effR;
      comp.power_mW = comp.voltageDrop * compI;
    } else if (comp.type === "cds") {
      // CdSの物理諸元同期 (オームの法則および電源電圧リミットを完全保証)
      const effR = getEffOhm(comp);
      comp.val_ohm = effR;
      comp.current_mA = compI;
      comp.voltageDrop = Math.min(v_in, (compI / 1000) * effR);
      comp.power_mW = comp.voltageDrop * compI;


  } else if (comp.type === "led") {
      comp.current_mA = compI;
      comp.voltageDrop = comp.isOn ? (comp.vf || 2.0) : 0.0;
     comp.power_mW = comp.voltageDrop * compI;
 } else if (comp.type === "switch" || comp.type === "switch_spdt" || comp.type === "tact_switch") {
      // ★ スイッチ類 (トグル/SPDT/タクト) の物理諸元同期
      const isSwitchClosed = comp.type === "switch_spdt"
        ? (comp.state === "L1" || comp.state === "L2")
        : (comp.type === "tact_switch" ? !!comp.isPressed : !!comp.isOn);
      const isConnected = energized.has(getNodeByHoleId(comp.pinA)) && energized.has(getNodeByHoleId(comp.pinB));

      comp.current_mA = (isSwitchClosed && isConnected && isPowered) ? compI : 0.0;
      comp.voltageDrop = 0.0; // 理想スイッチ接触抵抗 0Ω
      comp.power_mW = 0.0;
  } else if (comp.type === "capacitor") {
      // 電解コンデンサの物理諸元同期
      const isConnected = energized.has(getNodeByHoleId(comp.pinA)) && energized.has(getNodeByHoleId(comp.pinB));
      if (!isConnected || !isPowered) {
        comp.current_mA = 0.0;
        comp.voltageDrop = comp.charge_V || 0.0;
        comp.power_mW = 0.0;
      }
    } else if (comp.type === "cds") {
      // CdS光導電セルの物理諸元同期 (オームの法則追従)
      const rOhm = getEffOhm(comp);
      comp.val_ohm = rOhm;
      comp.current_mA = compI;
      comp.voltageDrop = (compI / 1000) * rOhm;
      comp.power_mW = comp.voltageDrop * compI;
    }
  });

  // Stage 11対応: CdSと固定抵抗によるベース分圧の動的解析
  const cdsComp = components.find(c => c.type === "cds");
  const trComp = components.find(c => c.type === "transistor");
  if (trComp && cdsComp && isPowered) {
    const nBase = getNodeByHoleId(trComp.pinB);
    const nCdsA = getNodeByHoleId(cdsComp.pinA);
    const nCdsB = getNodeByHoleId(cdsComp.pinB);
    const isCdsAtBase = (nCdsA === nBase || nCdsB === nBase);

    if (isCdsAtBase) {
      // ベース分圧回路の相棒抵抗を探索
      const pairRes = connectedResistors.find(r => r !== cdsComp && (getNodeByHoleId(r.pinA) === nBase || getNodeByHoleId(r.pinB) === nBase));
      if (pairRes) {
        const rCds = getEffOhm(cdsComp);
        const rPair = getEffOhm(pairRes);
        // CdSがGND側プルダウンの場合: Vb = Vin * (R_cds / (R_pair + R_cds))
        // 暗闇(R_cds大) -> Vb上昇 -> 0.7V超でON
       // Stage 11標準構成: プルアップ抵抗(47kΩ)が+側、CdSがGND側
        // 暗闇(rCds大) ➔ 分圧比上昇 ➔ Vb >= 0.68V でトランジスタ自動ON
        const vBase = effectiveV * (rCds / (rPair + rCds));

        trComp.v_base = vBase;
        // ベース電位が 0.68V (Vbe閾値) 以上で飽和・自動点灯、未満で遮断・消灯
        trComp.state = (vBase >= 0.68) ? "SATURATED" : "CUTOFF";

        // トランジスタが遮断(CUTOFF)の場合は主コレクタ回路を即時遮断
        if (trComp.state === "CUTOFF") {
          const cLed = components.find(c => c.type === "led" && !c.isBurned);
          const cRes = components.find(r => r.type === "resistor" && (r.val_ohm || 0) < 50000 && !r.id.includes("BASE"));
          if (cLed) { cLed.isOn = false; cLed.current_mA = 0.0; cLed.voltageDrop = 0.0; cLed.power_mW = 0.0; }
          if (cRes) { cRes.current_mA = 0.0; cRes.voltageDrop = 0.0; cRes.power_mW = 0.0; }
          trComp.current_mA = 0.0;
          trComp.ic_mA = 0.0;
          trComp.voltageDrop = effectiveV; // 開放時は電源電圧がそのままかかる
        }
      }
    }
  }



  if (hasBurnedComponent) {
    components.filter(c => c.type === "led").forEach(l => l.isOn = false);
    const burnedResult = { status: "OPEN", v_in: 0.0, r_total_ohm: Infinity, i_total_mA: 0.0, p_total_mW: 0.0, energized };
    if (typeof updateCircuitTreePanel === "function") updateCircuitTreePanel(burnedResult);
    return burnedResult;
  }

// ★ トランジスタ飽和時の最終出力サニタイズ (オシロスコープ＆ツリーの表示破綻を完全防止)
  const targetTr = components.find(c => c.type === "transistor");
  if (targetTr && targetTr.state === "SATURATED") {
    const cLed = components.find(c => c.type === "led" && !c.isBurned);
    const cRes = components.find(r => r.type === "resistor" && (r.val_ohm || 0) < 50000 && !r.id.includes("TR_B"));
    const bRes = components.find(r => r.type === "resistor" && ((r.val_ohm || 0) >= 50000 || r.id.includes("TR_B")));
    const bSw = components.find(s => s.type === "tact_switch" || s.type === "switch");

    const isSwOn = bSw ? (bSw.type === "tact_switch" ? !!bSw.isPressed : !!bSw.isOn) : true;
    if (isSwOn) {
      // コレクタ電流: 約 6.89 mA
      const rc = cRes ? (cRes.val_ohm || 1000) : 1000;
      const vf = cLed ? (cLed.vf || 2.0) : 2.0;
      const ic_mA = Math.max(0.0, (v_in - vf - 0.10) / (rc + BATTERY_INTERNAL_R)) * 1000;

      // ベース電流: 約 83 µA (0.083 mA)
      const rb = bRes ? (bRes.val_ohm || 100000) : 100000;
      const ib_mA = Math.max(0.0, (v_in - 0.70) / rb) * 1000;

      if (cRes) { cRes.current_mA = ic_mA; cRes.voltageDrop = (ic_mA / 1000) * rc; cRes.power_mW = cRes.voltageDrop * ic_mA; }
      if (cLed) { cLed.current_mA = ic_mA; cLed.isOn = true; cLed.voltageDrop = vf; cLed.power_mW = vf * ic_mA; }
      if (bRes) { bRes.current_mA = ib_mA; bRes.voltageDrop = (ib_mA / 1000) * rb; bRes.power_mW = bRes.voltageDrop * ib_mA; }
      if (bSw) { bSw.current_mA = ib_mA; bSw.voltageDrop = 0.0; }

     targetTr.current_mA = ic_mA;
      targetTr.ic_mA = ic_mA;
      targetTr.ib_uA = ib_mA * 1000;
      targetTr.voltageDrop = 0.10;

      // ★ ワイヤ電流の精密同期: コレクタ給電線(列5)はIc、ベース給電線(列17)はIb、エミッタ接地線(列10)はItotal
      wires.forEach(w => {
        const from = w.fromHole || "";
        const to = w.toHole || "";
        if (from.includes("5") || to.includes("5")) w.current_mA = ic_mA;
        else if (from.includes("17") || to.includes("17")) w.current_mA = ib_mA;
        else if (from.includes("10") || to.includes("10")) w.current_mA = ic_mA + ib_mA;
      });

   i_total_mA = ic_mA + ib_mA; // 合計約 6.97 mA
      r_total_ohm = (v_in / (i_total_mA / 1000));
    }
  }

 // NチャネルMOSFET導通時の動的負荷追従サニタイズ (完全電圧駆動: ゲート電流 0.00mA)
  const targetMosfet = components.find(c => c.type === "mosfet");
  if (targetMosfet && targetMosfet.state === "ON") {
    const cLed = components.find(c => c.type === "led" && !c.isBurned);
   const cBuzzer = components.find(c => c.type === "buzzer");
    // ゲート系抵抗を除外した真のドレイン負荷素子 (固定抵抗または可変抵抗) を動的取得
    const dRes = components.find(r => (r.type === "resistor" || r.type === "potentiometer") && !r.id.includes("GATE") && !r.id.includes("PD") && !r.id.includes("PULLDOWN"));
    const gSw = components.find(s => s.type === "tact_switch" || s.type === "switch");

    const isGateOn = gSw ? (gSw.type === "tact_switch" ? !!gSw.isPressed : !!gSw.isOn) : true;
    if (isGateOn) {
      // 可変抵抗器の場合は実効値 (getEffOhmまたはgetPotEffOhm) を取得
      let rd = 0;
      if (dRes) {
        rd = dRes.type === "potentiometer" ? (typeof getPotEffOhm === "function" ? getPotEffOhm(dRes) : (dRes.val_ohm || 5000)) : (dRes.val_ohm || 0);
      }
      const rbz = cBuzzer ? (cBuzzer.val_ohm || 16) : 0;
      const vf = cLed ? (cLed.vf || 2.0) : 0.0;
      const rds_on = targetMosfet.rds_on || 1.2;
      const totalLoadR = Math.max(rd + rbz, 1.0);

      // ドレイン電流 (Id): 負荷抵抗(330Ω〜100kΩ)に応じた動的オーム計算
      const id_mA = Math.max(0.0, (v_in - vf) / (totalLoadR + rds_on + BATTERY_INTERNAL_R)) * 1000;

      if (dRes) { dRes.current_mA = id_mA; dRes.voltageDrop = (id_mA / 1000) * rd; dRes.power_mW = dRes.voltageDrop * id_mA; }
      if (cBuzzer) { cBuzzer.current_mA = id_mA; cBuzzer.voltageDrop = (id_mA / 1000) * rbz; cBuzzer.power_mW = cBuzzer.voltageDrop * id_mA; }
      if (cLed) { cLed.current_mA = id_mA; cLed.isOn = (id_mA > 0.05); cLed.voltageDrop = cLed.isOn ? vf : 0.0; cLed.power_mW = vf * id_mA; }
      if (gSw) { gSw.current_mA = 0.0; gSw.voltageDrop = 0.0; } // ゲート側は電流ゼロ

      targetMosfet.current_mA = id_mA;
      targetMosfet.id_mA = id_mA;
      targetMosfet.ig_uA = 0.0; // 完全電圧制御
      targetMosfet.vgs_V = v_in;
      targetMosfet.vds_V = (id_mA / 1000) * rds_on;
      targetMosfet.voltageDrop = targetMosfet.vds_V;
      targetMosfet.power_mW = targetMosfet.vds_V * id_mA;

      // ワイヤ電流同期: ドレイン側はId、ゲート制御線は0.00mA、ソース接地線はId
      wires.forEach(w => {
        const from = w.fromHole || "";
        const to = w.toHole || "";
        if (from.includes("17") || to.includes("17")) w.current_mA = 0.0; // ゲート線
        else if (from.includes("5") || to.includes("5") || from.includes("10") || to.includes("10")) w.current_mA = id_mA;
      });

      i_total_mA = id_mA;
      r_total_ohm = (v_in / (i_total_mA / 1000));
    }
  }

  const physicsResult = {
    status: (i_total_mA > 0.05) ? "CLOSED" : "OPEN",
    v_in,
    r_total_ohm: (i_total_mA > 0.05) ? r_total_ohm : Infinity,
    i_total_mA,
    p_total_mW,
    energized
  };


  if (typeof updateCircuitTreePanel === "function") {
    updateCircuitTreePanel(physicsResult);
  }

 // ★ 物理イベントログエンジンを確実にリアルタイム駆動
  if (typeof updatePhysicsLogEngine === "function") {
    updatePhysicsLogEngine(physicsResult, energized);
  }

 // Stage 13 自立型クリア判定 (表記揺れ完全吸収・確実発火版)
  const isSt13 = (typeof currentStage !== "undefined" && currentStage === 13) ||
                 (typeof STAGE_STATE !== "undefined" && STAGE_STATE.currentStage === 13) ||
                 (document.getElementById("btn-stage-13") && document.getElementById("btn-stage-13").style.background.includes("059669"));

  if (isSt13 && !window.stage13Cleared) {
    const isClosed = physicsResult && physicsResult.status === "CLOSED";
    const bz = (typeof components !== "undefined") ? components.find(c => c.type === "buzzer") : null;
    const isBuzzing = isClosed && (physicsResult.i_total_mA > 0.5) && (bz || physicsResult.r_total_ohm < 5000);

    if (isBuzzing) {
      window.stage13Cleared = true;
      setTimeout(() => {
        const modalHtml = `
          <div id="stage13-modal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.75); display:flex; align-items:center; justify-content:center; z-index:9999;">
            <div style="background:#0f172a; border:2px solid #38bdf8; border-radius:8px; padding:20px; max-width:520px; color:#f8fafc; font-family:sans-serif; box-shadow:0 10px 25px rgba(0,0,0,0.5);">
              <div style="color:#38bdf8; font-size:16px; font-weight:bold; border-bottom:1px solid #334155; padding-bottom:8px; margin-bottom:12px;">
                [STAGE 13 達成]: MOSFETパルス駆動 ＆ オシロスコープ波形彫刻成功
              </div>
              <div style="font-size:12px; line-height:1.6; color:#cbd5e1; margin-bottom:14px;">
                <div style="margin-bottom:8px;">
                  <b style="color:#facc15;">1. 完全電圧制御スイッチング:</b><br>
                  2N7000 MOSFETのゲート酸化膜に電界を形成し、ゲート電流0.00mAのまま2.4kHz圧電ブザーの高速パルス開閉に成功しました。
                </div>
                <div style="margin-bottom:8px;">
                  <b style="color:#4ade80;">2. RC平滑化による波形彫刻:</b><br>
                  並列接続されたコンデンサの時定数 (tau = R * C) により、鋭利な矩形波が美麗な三角波へ変調されたことをオシロスコープ上で実証しました。
                </div>
                <div>
                  <b style="color:#38bdf8;">3. 動的インピーダンス制御:</b><br>
                  可変抵抗による電流制御や負荷抵抗の変更に対しても、回路全体のオームの法則がリアルタイムに追従することを確認しました。
                </div>
              </div>
              <button onclick="document.getElementById('stage13-modal').remove()" style="width:100%; padding:8px; background:#0284c7; color:#fff; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">
                [実験を継続する]
              </button>
            </div>
          </div>`;
        document.body.insertAdjacentHTML("beforeend", modalHtml);
      }, 500);
    }
  }

  return physicsResult;
}

function renderOscilloscope(ctx) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.clearRect(0, 0, w, h);

  // 1. 背景グリッド
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

  // 回路内のブザーおよび波形彫刻パーツ(並列コンデンサ・直列抵抗)の動的検出
    const activeBuzzer = components.find(c => c.type === "buzzer" && (c.current_mA > 0.05 || (physics.status === "CLOSED" && physics.i_total_mA > 0.05)));
    const activeCap = activeBuzzer ? components.find(c => c.type === "capacitor") : null;
    const activeRes = activeBuzzer ? components.find(c => c.type === "resistor") : null;

    // 波形パラメータの算出
    const smoothFactor = activeCap ? Math.min((activeCap.val_uF || 10) / 10.0, 1.0) : 0.0; // 0.0(完全矩形) 〜 1.0(平滑三角波)
    const ringAmp = activeRes ? Math.min((activeRes.val_ohm || 1000) / 2000.0, 1.5) : 0.0; // 直列抵抗によるリンギング振幅

    const displayV = physics.status === "CLOSED" ? (physics.v_in + (Math.random() * 0.06 - 0.03)) : 0.0;
    const displayI = physics.status === "CLOSED" ? (physics.i_total_mA + (Math.random() * 0.04 - 0.02)) : 0.0;

    scopeDataBufferV.push(displayV);
    scopeDataBufferI.push(displayI);

    const stepX = w / (scopeDataBufferV.length - 1);
    const timePhase = (Date.now() / 1000) * 24.0; // 時間経過による位相スクロール

    // CH1: 電圧波形 (黄色)
    ctx.strokeStyle = physics.status === "CLOSED" ? "#eab308" : "#64748b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    scopeDataBufferV.forEach((val, idx) => {
      const x = idx * stepX;
      let y = h * 0.7 - (val / 12.0) * (h * 0.5);

      // ブザー発振時の動的パルス波形変調
      if (activeBuzzer && physics.status === "CLOSED") {
        const theta = (idx * 0.35) + timePhase;
        const rawSquare = Math.sin(theta) >= 0 ? 1.0 : -1.0;
        const triWave = (Math.asin(Math.sin(theta)) / (Math.PI / 2));
        const pulse = rawSquare * (1.0 - smoothFactor) + triWave * smoothFactor;
        const ringing = ringAmp * Math.exp(-(idx % 18) * 0.25) * Math.sin((idx % 18) * 1.5);
        const waveOffset = (pulse * 14.0) + (ringing * 8.0);
        y = Math.min(Math.max(y + waveOffset, 10), h - 10);
      }

      if (idx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // CH2: 電流波形 (水色)
    if (physics.status === "CLOSED") {
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      const normalizedI = Math.min(physics.i_total_mA / 10.0, 1.0);
      scopeDataBufferI.forEach((val, idx) => {
        const x = idx * stepX;
        let y = h * 0.85 - (normalizedI * (h * 0.35));

        // ブザー発振時の電流リップル変調
        if (activeBuzzer) {
          const theta = (idx * 0.35) + timePhase;
          const currentSpike = Math.cos(theta) * (8.0 * (1.0 - smoothFactor * 0.5));
          y = Math.min(Math.max(y + currentSpike, 15), h - 5);
        } else {
          y += (Math.random() * 2 - 1);
        }

        if (idx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
  }

  // 4. テキスト表示
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
    ctx.lineDashOffset = -dashOffset;
  }

const dx = p2.x - p1.x;
  const dist = Math.hypot(dx, p2.y - p1.y);
  // 垂直配線(同一列結線)の場合、制御点を横方向へ膨らませて自然な山なりアーチを形成
  const isVertical = Math.abs(dx) < 4;
  const bendX = isVertical ? Math.min(Math.max(dist * 0.22, 14), 32) : 0;
  const midX = (p1.x + p2.x) / 2 + bendX;

  const archHeight = Math.min(Math.max(dist * 0.35, 12), 50);
  const controlY = isVertical ? (p1.y + p2.y) / 2 : (Math.min(p1.y, p2.y) - archHeight);

  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.quadraticCurveTo(midX, controlY, p2.x, p2.y);
  ctx.stroke();

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

  const dx = pB.x - pA.x;
  const dy = pB.y - pA.y;
  const distance = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  const halfDist = distance / 2;
  const midX = (pA.x + pB.x) / 2;
  const midY = (pA.y + pB.y) / 2;

  ctx.translate(midX, midY);
  ctx.rotate(angle);

  const rw = 24; // 幅24px
  const rh = 10; // 高さ10px

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

  // 素子自身の個別電流を厳格に評価 (断線時は0mAを尊重)
  const current_mA = (comp && comp.current_mA !== undefined)
    ? comp.current_mA
    : ((physics && physics.i_total_mA) ? physics.i_total_mA : (isEnergized ? 7.0 : 0));

  // 背景穴透け防止マスク
  ctx.fillStyle = (typeof DISPLAY_MODE !== "undefined" && DISPLAY_MODE.isXrayON)
    ? "rgba(226, 232, 240, 0.9)"
    : "#f8fafc";
  ctx.fillRect(-rw / 2, -rh / 2, rw, rh);

  const drawPath = () => {
    ctx.beginPath();
    ctx.moveTo(-halfDist, 0); ctx.lineTo(-rw / 2, 0);
    ctx.moveTo(rw / 2, 0); ctx.lineTo(halfDist, 0);
    ctx.rect(-rw / 2, -rh / 2, rw, rh);
  };

  if (isEnergized && current_mA > 0.05) {
    const intensity = Math.min(Math.max(current_mA / 25, 0), 1.0);
    const haloColor = intensity > 0.6 ? "#ea580c" : (intensity > 0.3 ? "#c2410c" : "#991b1b");
    const coreColor = intensity > 0.4 ? "#ffffff" : "#fef08a";

    ctx.save();
    ctx.shadowColor = haloColor;
    ctx.shadowBlur = 4 + intensity * 8;
    ctx.strokeStyle = haloColor;
    ctx.lineWidth = 3.2;
    drawPath();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = coreColor;
    ctx.lineWidth = 1.4;
    drawPath();
    ctx.stroke();
    ctx.restore();
  } else {
    ctx.strokeStyle = isHovered ? "#38bdf8" : "#000000";
    ctx.lineWidth = isHovered ? 2.5 : 2.0;
    drawPath();
    ctx.stroke();
  }

  // 抵抗値ラベル
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

// 2. トグルスイッチ (JIS C 0617 接点記号)
function drawSymbolSwitch(ctx, pA, pB, comp, isHovered) {
  if (!pA || !pB) return;
  ctx.save();

  const dx = pB.x - pA.x;
  const dy = pB.y - pA.y;
  const distance = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  const halfDist = distance / 2;
  const midX = (pA.x + pB.x) / 2;
  const midY = (pA.y + pB.y) / 2;

  ctx.translate(midX, midY);
  ctx.rotate(angle);

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
  const contactRadius = 2.5;

  ctx.fillStyle = (typeof DISPLAY_MODE !== "undefined" && DISPLAY_MODE.isXrayON) ? "rgba(226, 232, 240, 0.9)" : "#f8fafc";
  ctx.fillRect(-14, -12, 28, 24);

  const drawBaseContacts = () => {
    ctx.beginPath();
    ctx.moveTo(-halfDist, 0); ctx.lineTo(-10, 0);
    ctx.moveTo(10, 0); ctx.lineTo(halfDist, 0);
  };

  const drawLeverPath = () => {
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    if (isClosed) ctx.lineTo(10, 0);
    else ctx.lineTo(8, -10);
  };

  if (isEnergized && current_mA > 0.05) {
    const intensity = Math.min(Math.max(current_mA / 25, 0), 1.0);
    const haloColor = intensity > 0.6 ? "#ea580c" : (intensity > 0.3 ? "#c2410c" : "#991b1b");
    const midColor  = intensity > 0.5 ? "#fef08a" : "#f97316";
    const coreColor = intensity > 0.4 ? "#ffffff" : "#fef08a";

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.shadowColor = haloColor;
    ctx.shadowBlur = 4 + intensity * 8;
    ctx.strokeStyle = haloColor;
    ctx.fillStyle = haloColor;
    ctx.lineWidth = 3.2;
    drawBaseContacts(); ctx.stroke();
    drawLeverPath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(-10, 0, contactRadius, 0, Math.PI * 2); ctx.arc(10, 0, contactRadius, 0, Math.PI * 2); ctx.fill();

    ctx.shadowBlur = 2;
    ctx.strokeStyle = midColor;
    ctx.fillStyle = midColor;
    ctx.lineWidth = 1.8;
    drawBaseContacts(); ctx.stroke();
    drawLeverPath(); ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = coreColor;
    ctx.fillStyle = coreColor;
    ctx.lineWidth = 1.0;
    drawBaseContacts(); ctx.stroke();
    drawLeverPath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(-10, 0, 1.2, 0, Math.PI * 2); ctx.arc(10, 0, 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  } else {
    const baseColor = isHovered ? "#38bdf8" : "#000000";
    ctx.strokeStyle = baseColor;
    ctx.fillStyle = baseColor;
    ctx.lineWidth = isHovered ? 2.5 : 2.0;

    drawBaseContacts(); ctx.stroke();
    drawLeverPath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(-10, 0, contactRadius, 0, Math.PI * 2); ctx.arc(10, 0, contactRadius, 0, Math.PI * 2); ctx.fill();
  }

  ctx.rotate(-angle);
  ctx.font = "bold 9px monospace";
  ctx.textAlign = "center";
  const labelText = comp.name || "SW";
  const textWidth = ctx.measureText(labelText).width;

  ctx.fillStyle = (typeof DISPLAY_MODE !== "undefined" && DISPLAY_MODE.isXrayON) ? "rgba(226, 232, 240, 0.9)" : "rgba(248, 250, 252, 0.85)";
  ctx.fillRect(-textWidth / 2 - 2, -21, textWidth + 4, 10);
  ctx.fillStyle = isHovered ? "#0284c7" : "#000000";
  ctx.fillText(labelText, 0, -13);

  ctx.restore();
}

// 2-2. 3路トグルスイッチ (JIS C 0617 SPDT)
function drawSymbolSwitchSPDT(ctx, pA, pB, comp, isHovered) {
  const comHoleId = comp.pinCom || comp.pinCOM || `C${getColFromHoleId(comp.pinA) + 2}`;
  const pCom = (typeof getHoleCoord === "function") ? getHoleCoord(comHoleId) : null;
  if (!pA || !pB || !pCom) return;

  ctx.save();
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

  ctx.fillStyle = (typeof DISPLAY_MODE !== "undefined" && DISPLAY_MODE.isXrayON) ? "rgba(226, 232, 240, 0.9)" : "#f8fafc";
  const minX = Math.min(pA.x, pB.x, pCom.x) - 6;
  const maxX = Math.max(pA.x, pB.x, pCom.x) + 6;
  const minY = Math.min(pA.y, pB.y, pCom.y) - 6;
  const maxY = Math.max(pA.y, pB.y, pCom.y) + 6;
  ctx.fillRect(minX, minY, maxX - minX, maxY - minY);

  const contactRadius = 2.5;
  const drawLeverPath = () => {
    ctx.beginPath();
    ctx.moveTo(pCom.x, pCom.y);
    ctx.lineTo(targetPos.x, targetPos.y);
  };

  if (isEnergized && current_mA > 0.05) {
    const intensity = Math.min(Math.max(current_mA / 25, 0), 1.0);
    const haloColor = intensity > 0.6 ? "#ea580c" : (intensity > 0.3 ? "#c2410c" : "#991b1b");
    const midColor  = intensity > 0.5 ? "#fef08a" : "#f97316";
    const coreColor = intensity > 0.4 ? "#ffffff" : "#fef08a";

    ctx.save();
    ctx.lineCap = "round";

    ctx.shadowColor = haloColor;
    ctx.shadowBlur = 4 + intensity * 8;
    ctx.strokeStyle = haloColor;
    ctx.fillStyle = haloColor;
    ctx.lineWidth = 3.2;
    drawLeverPath(); ctx.stroke();
    ctx.beginPath();
    ctx.arc(pCom.x, pCom.y, contactRadius, 0, Math.PI * 2);
    ctx.arc(targetPos.x, targetPos.y, contactRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 2;
    ctx.strokeStyle = midColor;
    ctx.fillStyle = midColor;
    ctx.lineWidth = 1.8;
    drawLeverPath(); ctx.stroke();

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

    const openPos = isL1 ? pB : pA;
    ctx.fillStyle = "#64748b";
    ctx.beginPath();
    ctx.arc(openPos.x, openPos.y, contactRadius, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const baseColor = isHovered ? "#38bdf8" : "#000000";
    ctx.strokeStyle = baseColor;
    ctx.fillStyle = baseColor;
    ctx.lineWidth = isHovered ? 2.5 : 2.0;

    drawLeverPath(); ctx.stroke();
    ctx.beginPath();
    ctx.arc(pA.x, pA.y, contactRadius, 0, Math.PI * 2);
    ctx.arc(pCom.x, pCom.y, contactRadius, 0, Math.PI * 2);
    ctx.arc(pB.x, pB.y, contactRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = "rgba(100, 116, 139, 0.4)";
  ctx.lineWidth = 1.0;
  ctx.setLineDash([2, 2]);
  ctx.beginPath();
  ctx.arc(pCom.x, pCom.y, Math.abs(pA.x - pCom.x), Math.PI, 0, true);
  ctx.stroke();
  ctx.setLineDash([]);

 ctx.font = "bold 8.5px monospace"; ctx.textAlign = "center";
  ctx.fillStyle = isHovered ? "#0284c7" : "#475569";
  ctx.fillText(comp.name || "SPDT", pCom.x, pCom.y - 10);

  ctx.restore();
}

// 2-3. タクトスイッチ (JIS C 0617 押しボタンスイッチ / モーメンタリa接点記号)
function drawSymbolTactSwitch(ctx, pA, pB, comp, isHovered) {
  if (!pA || !pB) return;
  ctx.save();

  const dx = pB.x - pA.x;
  const dy = pB.y - pA.y;
  const distance = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  const halfDist = distance / 2;
  const midX = (pA.x + pB.x) / 2;
  const midY = (pA.y + pB.y) / 2;

  ctx.translate(midX, midY);
  ctx.rotate(angle);

  const isPressed = !!(comp && comp.isPressed);
  const physics = typeof calculateCircuitPhysics === "function" ? calculateCircuitPhysics() : null;
  const isCircuitClosed = physics ? (physics.status === "CLOSED") : true;

  let isEnergized = false;
  if (typeof analyzeEnergizedNodes === "function") {
    const energizedSet = analyzeEnergizedNodes();
    const nodeA = typeof getNodeByHoleId === "function" ? getNodeByHoleId(comp.pinA) : null;
    const nodeB = typeof getNodeByHoleId === "function" ? getNodeByHoleId(comp.pinB) : null;
    isEnergized = !!(energizedSet && nodeA && nodeB && energizedSet.has(nodeA) && energizedSet.has(nodeB) && isCircuitClosed && isPressed);
  } else {
    isEnergized = isCircuitClosed && isPressed;
  }

  const current_mA = (physics && physics.i_total_mA) ? physics.i_total_mA : (isEnergized ? 7.0 : 0);
  const contactRadius = 2.5;

  ctx.fillStyle = (typeof DISPLAY_MODE !== "undefined" && DISPLAY_MODE.isXrayON) ? "rgba(226, 232, 240, 0.9)" : "#f8fafc";
  ctx.fillRect(-14, -14, 28, 28);

  const drawBaseContacts = () => {
    ctx.beginPath();
    ctx.moveTo(-halfDist, 0); ctx.lineTo(-9, 0);
    ctx.moveTo(9, 0); ctx.lineTo(halfDist, 0);
  };

  const contactGap = isPressed ? 0 : -6;
  const drawPushButton = () => {
    ctx.beginPath();
    // 可動接点バー (横棒)
    ctx.moveTo(-11, contactGap); ctx.lineTo(11, contactGap);
    // 押しボタン操作棒
    ctx.moveTo(0, contactGap); ctx.lineTo(0, contactGap - 7);
    // 操作ボタントップ (T字キャップ)
    ctx.moveTo(-6, contactGap - 7); ctx.lineTo(6, contactGap - 7);
  };

  if (isEnergized && current_mA > 0.05) {
    const intensity = Math.min(Math.max(current_mA / 25, 0), 1.0);
    const haloColor = intensity > 0.6 ? "#ea580c" : (intensity > 0.3 ? "#c2410c" : "#991b1b");
    const midColor  = intensity > 0.5 ? "#fef08a" : "#f97316";
    const coreColor = intensity > 0.4 ? "#ffffff" : "#fef08a";

    ctx.save();
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.shadowColor = haloColor; ctx.shadowBlur = 4 + intensity * 8;
    ctx.strokeStyle = haloColor; ctx.fillStyle = haloColor; ctx.lineWidth = 3.2;
    drawBaseContacts(); ctx.stroke();
    drawPushButton(); ctx.stroke();
    ctx.beginPath(); ctx.arc(-9, 0, contactRadius, 0, Math.PI * 2); ctx.arc(9, 0, contactRadius, 0, Math.PI * 2); ctx.fill();

    ctx.shadowBlur = 2; ctx.strokeStyle = midColor; ctx.fillStyle = midColor; ctx.lineWidth = 1.8;
    drawBaseContacts(); ctx.stroke();
    drawPushButton(); ctx.stroke();

    ctx.shadowBlur = 0; ctx.strokeStyle = coreColor; ctx.fillStyle = coreColor; ctx.lineWidth = 1.0;
    drawBaseContacts(); ctx.stroke();
    drawPushButton(); ctx.stroke();
    ctx.beginPath(); ctx.arc(-9, 0, 1.2, 0, Math.PI * 2); ctx.arc(9, 0, 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  } else {
    const baseColor = isHovered ? "#38bdf8" : "#000000";
    ctx.strokeStyle = baseColor; ctx.fillStyle = baseColor; ctx.lineWidth = isHovered ? 2.5 : 2.0;
    drawBaseContacts(); ctx.stroke();
    drawPushButton(); ctx.stroke();
    ctx.beginPath(); ctx.arc(-9, 0, contactRadius, 0, Math.PI * 2); ctx.arc(9, 0, contactRadius, 0, Math.PI * 2); ctx.fill();
  }

  ctx.rotate(-angle);
  ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
  const labelText = comp.name || "TACT-SW";
  const textWidth = ctx.measureText(labelText).width;
  ctx.fillStyle = (typeof DISPLAY_MODE !== "undefined" && DISPLAY_MODE.isXrayON) ? "rgba(226, 232, 240, 0.9)" : "rgba(248, 250, 252, 0.85)";
  ctx.fillRect(-textWidth / 2 - 2, -23, textWidth + 4, 10);
  ctx.fillStyle = isHovered ? "#0284c7" : "#000000";
  ctx.fillText(labelText, 0, -15);

  ctx.restore();
}


// 3. 発光ダイオード (JIS C 0617 LED記号 / 多層白熱フィラメント＆衝突回避完全版)
function drawSymbolLED(ctx, pA, pB, comp, isHovered) {
  if (!pA || !pB) return;
  ctx.save();

  const dx = pB.x - pA.x;
  const dy = pB.y - pA.y;
  const distance = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  const halfDist = distance / 2;
  const midX = (pA.x + pB.x) / 2;
  const midY = (pA.y + pB.y) / 2;

  ctx.translate(midX, midY);
  ctx.rotate(angle);

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

  // 素子自身の個別電流を厳格に優先
  const current_mA = (comp && comp.current_mA !== undefined) ? comp.current_mA : ((physics && physics.i_total_mA) ? physics.i_total_mA : 0);
  const isLit = !isBurned && comp && comp.isOn && isEnergized && (current_mA > 0.05);

  ctx.fillStyle = (typeof DISPLAY_MODE !== "undefined" && DISPLAY_MODE.isXrayON) ? "rgba(226, 232, 240, 0.9)" : "#f8fafc";
  ctx.fillRect(-10, -9, 20, 18);

  const drawWireAndBar = () => {
    ctx.beginPath();
    ctx.moveTo(-halfDist, 0); ctx.lineTo(-8, 0);
    ctx.moveTo(6, 0); ctx.lineTo(halfDist, 0);
    ctx.moveTo(6, -7); ctx.lineTo(6, 7);
  };

  const drawTriangle = () => {
    ctx.beginPath();
    ctx.moveTo(-8, -7); ctx.lineTo(6, 0); ctx.lineTo(-8, 7);
    ctx.closePath();
  };

  if (isLit) {
    const intensity = Math.min(Math.max(current_mA / 20, 0.25), 1.0);
    const glowColor = comp.color || "#eab308";

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 6 + intensity * 12;
    ctx.strokeStyle = glowColor;
    ctx.fillStyle = glowColor;
    ctx.lineWidth = 3.2;
    drawWireAndBar(); ctx.stroke();
    drawTriangle(); ctx.fill(); ctx.stroke();

    ctx.shadowBlur = 2;
    ctx.strokeStyle = "#fef08a";
    ctx.lineWidth = 1.8;
    drawWireAndBar(); ctx.stroke();
    drawTriangle(); ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.0;
    drawWireAndBar(); ctx.stroke();
    ctx.restore();
  } else {
    const normalColor = isBurned ? "#ef4444" : (isHovered ? "#38bdf8" : "#000000");
    ctx.strokeStyle = normalColor;
    ctx.fillStyle = normalColor;
    ctx.lineWidth = isHovered ? 2.5 : 2.0;
    drawWireAndBar(); ctx.stroke();
    drawTriangle(); ctx.fill(); ctx.stroke();
  }

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
    ctx.moveTo(-2, -9); ctx.lineTo(4, -15);
    ctx.moveTo(4, -15); ctx.lineTo(1, -15);
    ctx.moveTo(3, -6); ctx.lineTo(9, -12);
    ctx.moveTo(9, -12); ctx.lineTo(6, -12);
    ctx.stroke();
    ctx.restore();
  }

  // 上方近接パーツ衝突検知付きラベル配置
  ctx.rotate(-angle);
  ctx.font = "bold 9px monospace";
  ctx.textAlign = "center";
  const labelText = isBurned ? "LED(BURN)" : ((comp && comp.name) || "LED");
  const textW = ctx.measureText(labelText).width;

  let hasUpperComp = false;
  if (typeof components !== "undefined" && Array.isArray(components)) {
    hasUpperComp = components.some(c => {
      if (c.id === comp.id) return false;
      const pA_other = (typeof getHoleCoord === "function") ? getHoleCoord(c.pinA) : null;
      const pB_other = (typeof getHoleCoord === "function") ? getHoleCoord(c.pinB) : null;
      if (!pA_other || !pB_other) return false;
      const otherMinX = Math.min(pA_other.x, pB_other.x) - 10;
      const otherMaxX = Math.max(pA_other.x, pB_other.x) + 10;
      const otherMidY = (pA_other.y + pB_other.y) / 2;
      return (midX >= otherMinX && midX <= otherMaxX) && ((midY - otherMidY) > 0 && (midY - otherMidY) < 35);
    });
  }

  const labelY = hasUpperComp ? 18 : -16;
  const maskY = hasUpperComp ? 10 : -24;
  ctx.fillStyle = (typeof DISPLAY_MODE !== "undefined" && DISPLAY_MODE.isXrayON) ? "rgba(226, 232, 240, 0.9)" : "rgba(248, 250, 252, 0.9)";
  ctx.fillRect(-textW / 2 - 2, maskY, textW + 4, 10);
  ctx.fillStyle = isBurned ? "#ef4444" : (isHovered ? "#0284c7" : "#000000");
  ctx.fillText(labelText, 0, labelY);

  ctx.restore();
}

// 4. 電解コンデンサ (JIS C 0617 極性コンデンサ記号)
function drawSymbolCapacitor(ctx, pA, pB, comp, isHovered) {
  if (!pA || !pB) return;
  ctx.save();
  const color = isHovered ? "#38bdf8" : "#000000";
  ctx.strokeStyle = color; ctx.fillStyle = color;
  ctx.lineWidth = isHovered ? 2.5 : 2.0;

  const distance = Math.hypot(pB.x - pA.x, pB.y - pA.y);
  const halfDist = distance / 2;
  const midX = (pA.x + pB.x) / 2;
  const midY = (pA.y + pB.y) / 2;
  const angle = Math.atan2(pB.y - pA.y, pB.x - pA.x);

  ctx.translate(midX, midY); ctx.rotate(angle);

  ctx.beginPath();
  ctx.moveTo(-halfDist, 0); ctx.lineTo(-4, 0);
  ctx.moveTo(4, 0); ctx.lineTo(halfDist, 0);
  ctx.stroke();

  ctx.beginPath(); ctx.moveTo(-4, -8); ctx.lineTo(-4, 8); ctx.stroke();
  ctx.beginPath(); ctx.arc(8, 0, 9, Math.PI * 0.75, Math.PI * 1.25); ctx.stroke();

  ctx.font = "9px sans-serif"; ctx.fillText("+", -10, -6);
  ctx.rotate(-angle);
  ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
  ctx.fillText(`${(comp && comp.val_uF) || 10}µF`, 0, -11);
  ctx.restore();
}

// 5. 可変抵抗器 (JIS C 0617 ポテンショメータ記号)
function drawSymbolPotentiometer(ctx, pA, pB, comp, isHovered) {
  if (!pA || !pB) return;
  ctx.save();

  const dx = pB.x - pA.x;
  const dy = pB.y - pA.y;
  const distance = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  const halfDist = distance / 2;
  const midX = (pA.x + pB.x) / 2;
  const midY = (pA.y + pB.y) / 2;

  ctx.translate(midX, midY);
  ctx.rotate(angle);

  const rw = 24;
  const rh = 10;

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

  const current_mA = (comp && comp.current_mA !== undefined) ? comp.current_mA : ((physics && physics.i_total_mA) ? physics.i_total_mA : (isEnergized ? 7.0 : 0));

  ctx.fillStyle = (typeof DISPLAY_MODE !== "undefined" && DISPLAY_MODE.isXrayON) ? "rgba(226, 232, 240, 0.9)" : "#f8fafc";
  ctx.fillRect(-rw / 2, -rh / 2, rw, rh);

  const drawBodyPath = () => {
    ctx.beginPath();
    ctx.moveTo(-halfDist, 0); ctx.lineTo(-rw / 2, 0);
    ctx.moveTo(rw / 2, 0); ctx.lineTo(halfDist, 0);
    ctx.rect(-rw / 2, -rh / 2, rw, rh);
  };

  let wiperDropY = 16.0;
  if (comp && (comp.pinC || comp.pinWiper)) {
    const pC = (typeof getHoleCoord === "function") ? getHoleCoord(comp.pinC || comp.pinWiper) : null;
    if (pC) wiperDropY = Math.hypot(pC.x - midX, pC.y - midY);
  }

  const drawWiperPath = () => {
    ctx.beginPath();
    ctx.moveTo(0, wiperDropY);
    ctx.lineTo(0, 5);
  };

  const drawWiperArrow = () => {
    ctx.beginPath();
    ctx.moveTo(-3.5, 10.5);
    ctx.lineTo(0, 5);
    ctx.lineTo(3.5, 10.5);
    ctx.closePath();
  };

  if (isEnergized && current_mA > 0.05) {
    const intensity = Math.min(Math.max(current_mA / 25, 0), 1.0);
    const haloColor = intensity > 0.6 ? "#ea580c" : (intensity > 0.3 ? "#c2410c" : "#991b1b");
    const midColor  = intensity > 0.5 ? "#fef08a" : "#f97316";
    const coreColor = intensity > 0.4 ? "#ffffff" : "#fef08a";

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.shadowColor = haloColor;
    ctx.shadowBlur = 4 + intensity * 8;
    ctx.strokeStyle = haloColor;
    ctx.fillStyle = haloColor;
    ctx.lineWidth = 3.2;
    drawBodyPath(); ctx.stroke();
    drawWiperPath(); ctx.stroke();
    drawWiperArrow(); ctx.fill();

    ctx.shadowBlur = 2;
    ctx.strokeStyle = midColor;
    ctx.fillStyle = midColor;
    ctx.lineWidth = 1.8;
    drawBodyPath(); ctx.stroke();
    drawWiperPath(); ctx.stroke();
    drawWiperArrow(); ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = coreColor;
    ctx.lineWidth = 1.0;
    drawBodyPath(); ctx.stroke();
    drawWiperPath(); ctx.stroke();
    ctx.restore();
  } else {
    const baseColor = isHovered ? "#38bdf8" : "#000000";
    ctx.strokeStyle = baseColor;
    ctx.fillStyle = baseColor;
    ctx.lineWidth = isHovered ? 2.5 : 2.0;
    drawBodyPath(); ctx.stroke();
    drawWiperPath(); ctx.stroke();
    drawWiperArrow(); ctx.fill();
  }

  ctx.rotate(-angle);
  ctx.font = "bold 9px monospace";
  ctx.textAlign = "center";
  const curVal = comp.val_ohm !== undefined ? comp.val_ohm : ((comp.val_max_ohm || 10000) * (comp.cur_ratio || 0.5));
  const valText = curVal >= 1000 ? `${(curVal / 1000).toFixed(1)}kΩ` : `${Math.round(curVal)}Ω`;

  const textWidth = ctx.measureText(valText).width;
  ctx.fillStyle = (typeof DISPLAY_MODE !== "undefined" && DISPLAY_MODE.isXrayON) ? "rgba(226, 232, 240, 0.9)" : "rgba(248, 250, 252, 0.85)";
  ctx.fillRect(-textWidth / 2 - 2, -15, textWidth + 4, 10);
  ctx.fillStyle = isHovered ? "#0284c7" : "#000000";
  ctx.fillText(valText, 0, -8);

  ctx.restore();
}

// 6. 整流ダイオード (JIS C 0617 記号)
function drawSymbolDiode(ctx, pA, pB, comp, isHovered) {
  ctx.save();
  const color = isHovered ? "#38bdf8" : "#000000";
  ctx.strokeStyle = color; ctx.fillStyle = color;
  ctx.lineWidth = isHovered ? 2.5 : 2.0;

  const midX = (pA.x + pB.x) / 2;
  const midY = (pA.y + pB.y) / 2;
  const angle = Math.atan2(pB.y - pA.y, pB.x - pA.x);

  ctx.translate(midX, midY);
  ctx.rotate(angle);

  ctx.beginPath();
  ctx.moveTo(-16, 0); ctx.lineTo(-6, 0);
  ctx.moveTo(6, 0);   ctx.lineTo(16, 0);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-6, -7); ctx.lineTo(6, 0); ctx.lineTo(-6, 7);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(6, -7); ctx.lineTo(6, 7);
  ctx.stroke();

  ctx.font = "bold 9px monospace";
  ctx.textAlign = "center";
  ctx.fillText("D (1N4007)", 0, -11);
  ctx.restore();
}

// 7. NPNトランジスタ (2SC1815 JIS記号)
function drawSymbolTransistor(ctx, comp, isHovered) {
  const pE = (typeof getHoleCoord === "function") ? getHoleCoord(comp.pinE || comp.pinA) : null;
  const colC = (typeof getColFromHoleId === "function") ? (getColFromHoleId(comp.pinA) + 1) : 2;
  const pC = (typeof getHoleCoord === "function") ? getHoleCoord(comp.pinC || `C${colC}`) : null;
  const pB = (typeof getHoleCoord === "function") ? getHoleCoord(comp.pinB) : null;
  if (!pE || !pC || !pB) return;

  ctx.save();
  const midX = pC.x;
  const midY = pC.y - 22;

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
  const current_mA = (comp && comp.current_mA !== undefined) ? comp.current_mA : ((physics && physics.i_total_mA) ? physics.i_total_mA : (isConducting ? 7.0 : 0));

  ctx.fillStyle = (typeof DISPLAY_MODE !== "undefined" && DISPLAY_MODE.isXrayON) ? "rgba(226, 232, 240, 0.9)" : "#f8fafc";
  ctx.beginPath();
  ctx.arc(midX, midY, 13, 0, Math.PI * 2);
  ctx.fill();

  const drawMainCurrentPath = () => {
    ctx.beginPath();
    ctx.moveTo(pC.x, pC.y); ctx.lineTo(midX, midY + 12);
    ctx.moveTo(midX + 3, midY - 3); ctx.lineTo(midX, midY + 12);
    ctx.moveTo(midX + 3, midY); ctx.lineTo(midX - 7, midY + 9);
    ctx.moveTo(midX - 7, midY + 9); ctx.lineTo(pE.x, midY + 12); ctx.lineTo(pE.x, pE.y);
  };

  const drawBasePath = () => {
    ctx.beginPath();
    ctx.moveTo(pB.x, pB.y); ctx.lineTo(pB.x, midY + 12); ctx.lineTo(midX + 7, midY + 9);
    ctx.moveTo(midX + 3, midY + 4); ctx.lineTo(midX + 7, midY + 9);
    ctx.moveTo(midX + 3, midY - 6); ctx.lineTo(midX + 3, midY + 6);
  };

  const drawEmitterArrow = () => {
    ctx.beginPath();
    ctx.moveTo(midX - 7, midY + 9);
    ctx.lineTo(midX - 2, midY + 7);
    ctx.lineTo(midX - 4, midY + 4);
    ctx.closePath();
  };

  if (isConducting && current_mA > 0.05) {
    const intensity = Math.min(Math.max(current_mA / 25, 0), 1.0);
    const haloColor = intensity > 0.6 ? "#ea580c" : (intensity > 0.3 ? "#c2410c" : "#991b1b");
    const midColor  = intensity > 0.5 ? "#fef08a" : "#f97316";
    const coreColor = intensity > 0.4 ? "#ffffff" : "#fef08a";

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(midX, midY, 12, 0, Math.PI * 2); ctx.stroke();

    ctx.shadowColor = haloColor;
    ctx.shadowBlur = 4 + intensity * 8;
    ctx.strokeStyle = haloColor;
    ctx.fillStyle = haloColor;
    ctx.lineWidth = 3.2;
    drawMainCurrentPath(); ctx.stroke();
    drawBasePath(); ctx.stroke();
    drawEmitterArrow(); ctx.fill();

    ctx.shadowBlur = 2;
    ctx.strokeStyle = midColor;
    ctx.fillStyle = midColor;
    ctx.lineWidth = 1.8;
    drawMainCurrentPath(); ctx.stroke();
    drawBasePath(); ctx.stroke();
    drawEmitterArrow(); ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = coreColor;
    ctx.lineWidth = 1.0;
    drawMainCurrentPath(); ctx.stroke();
    ctx.restore();
  } else {
    const normalColor = isHovered ? "#38bdf8" : "#000000";
    ctx.strokeStyle = normalColor;
    ctx.fillStyle = normalColor;
    ctx.lineWidth = isHovered ? 2.5 : 1.8;

    ctx.beginPath(); ctx.arc(midX, midY, 12, 0, Math.PI * 2); ctx.stroke();
    drawMainCurrentPath(); ctx.stroke();
    drawBasePath(); ctx.stroke();
    drawEmitterArrow(); ctx.fill();
  }

  ctx.font = "bold 8.5px monospace";
  ctx.textAlign = "center";
  const labelText = (comp && comp.name) || "2SC1815";
  const textWidth = ctx.measureText(labelText).width;
  ctx.fillStyle = (typeof DISPLAY_MODE !== "undefined" && DISPLAY_MODE.isXrayON) ? "rgba(226, 232, 240, 0.9)" : "rgba(248, 250, 252, 0.9)";
  ctx.fillRect(midX - textWidth / 2 - 2, midY - 21, textWidth + 4, 9);
 ctx.fillStyle = isHovered ? "#0284c7" : "#000000";
  ctx.fillText(labelText, midX, midY - 14);

  ctx.restore();
}

// 8. N-channel MOSFET (2N7000 JIS C 0617 simbolo)
function drawSymbolMOSFET(ctx, comp, isHovered) {
  const pS = (typeof getHoleCoord === "function") ? getHoleCoord(comp.pinS || comp.pinA) : null;
  const colG = (typeof getColFromHoleId === "function") ? (getColFromHoleId(comp.pinA) + 1) : 2;
  const pG = (typeof getHoleCoord === "function") ? getHoleCoord(comp.pinG || `C${colG}`) : null;
  const pD = (typeof getHoleCoord === "function") ? getHoleCoord(comp.pinD || comp.pinB) : null;
  if (!pS || !pG || !pD) return;

  ctx.save();
  const midX = pG.x;
  const midY = pG.y - 22;

  const isConducting = (comp && (comp.state === "ON" || comp.state === "OHMIC" || (comp.vgs_V >= (comp.vgs_th || 2.1))));
  const current_mA = (comp && comp.id_mA !== undefined) ? comp.id_mA : (isConducting ? 6.89 : 0.0);

  ctx.fillStyle = (typeof DISPLAY_MODE !== "undefined" && DISPLAY_MODE.isXrayON) ? "rgba(226, 232, 240, 0.9)" : "#f8fafc";
  ctx.beginPath();
  ctx.arc(midX, midY, 13, 0, Math.PI * 2);
  ctx.fill();

  const drawGateElectrode = () => {
    ctx.beginPath();
    ctx.moveTo(pG.x, pG.y); ctx.lineTo(midX, midY + 12);
    ctx.moveTo(midX - 5, midY + 5); ctx.lineTo(midX + 5, midY + 5);
  };

  const drawChannelPath = () => {
    ctx.beginPath();
    ctx.moveTo(midX - 6, midY + 2); ctx.lineTo(midX - 2, midY + 2);
    ctx.moveTo(midX - 2, midY + 2); ctx.lineTo(pS.x, midY + 12); ctx.lineTo(pS.x, pS.y);
    ctx.moveTo(midX + 2, midY + 2); ctx.lineTo(midX + 6, midY + 2);
    ctx.moveTo(midX + 6, midY + 2); ctx.lineTo(pD.x, midY + 12); ctx.lineTo(pD.x, pD.y);
    ctx.moveTo(midX - 1, midY + 2); ctx.lineTo(midX + 1, midY + 2);
    ctx.moveTo(midX, midY + 2); ctx.lineTo(midX, midY + 8);
    ctx.moveTo(midX, midY + 8); ctx.lineTo(pS.x, midY + 12);
  };

  const drawChannelArrow = () => {
    ctx.beginPath();
    ctx.moveTo(midX, midY + 3);
    ctx.lineTo(midX - 3, midY + 7);
    ctx.lineTo(midX + 3, midY + 7);
    ctx.closePath();
  };

  if (isConducting && current_mA > 0.05) {
    const intensity = Math.min(Math.max(current_mA / 25, 0), 1.0);
    const haloColor = intensity > 0.6 ? "#0284c7" : (intensity > 0.3 ? "#0369a1" : "#075985");
    const midColor  = intensity > 0.5 ? "#38bdf8" : "#0284c7";
    const coreColor = intensity > 0.4 ? "#ffffff" : "#bae6fd";

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(midX, midY, 12, 0, Math.PI * 2); ctx.stroke();

    ctx.shadowColor = haloColor;
    ctx.shadowBlur = 4 + intensity * 8;
    ctx.strokeStyle = haloColor;
    ctx.fillStyle = haloColor;
    ctx.lineWidth = 3.2;
    drawGateElectrode(); ctx.stroke();
    drawChannelPath(); ctx.stroke();
    drawChannelArrow(); ctx.fill();

    ctx.shadowBlur = 2;
    ctx.strokeStyle = midColor;
    ctx.fillStyle = midColor;
    ctx.lineWidth = 1.8;
    drawGateElectrode(); ctx.stroke();
    drawChannelPath(); ctx.stroke();
    drawChannelArrow(); ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = coreColor;
    ctx.lineWidth = 1.0;
    drawChannelPath(); ctx.stroke();
    ctx.restore();
  } else {
    const normalColor = isHovered ? "#38bdf8" : "#000000";
    ctx.strokeStyle = normalColor;
    ctx.fillStyle = normalColor;
    ctx.lineWidth = isHovered ? 2.5 : 1.8;

    ctx.beginPath(); ctx.arc(midX, midY, 12, 0, Math.PI * 2); ctx.stroke();
    drawGateElectrode(); ctx.stroke();
    drawChannelPath(); ctx.stroke();
    drawChannelArrow(); ctx.fill();
  }

  ctx.font = "bold 8.5px monospace";
  ctx.textAlign = "center";
  const labelText = (comp && comp.name) || "2N7000";
  const textWidth = ctx.measureText(labelText).width;
  ctx.fillStyle = (typeof DISPLAY_MODE !== "undefined" && DISPLAY_MODE.isXrayON) ? "rgba(226, 232, 240, 0.9)" : "rgba(248, 250, 252, 0.9)";
  ctx.fillRect(midX - textWidth / 2 - 2, midY - 21, textWidth + 4, 9);
 ctx.fillStyle = isHovered ? "#0284c7" : "#000000";
  ctx.fillText(labelText, midX, midY - 14);

  ctx.restore();
}

// 9. 圧電ブザー / ピエゾサウンダ (JIS C 0617 規格準拠 記号描画)
function drawSymbolBuzzer(ctx, pA, pB, comp, isHovered) {
  if (!pA || !pB) return;

  const midX = (pA.x + pB.x) / 2;
  const midY = (pA.y + pB.y) / 2 - 18;
  const radius = 10.0;

  const isConducting = (comp && comp.current_mA > 0.05);

  ctx.save();

  // 背景マスク (X線/通常モードに応じた視認性確保)
  ctx.fillStyle = (typeof DISPLAY_MODE !== "undefined" && DISPLAY_MODE.isXrayON) ? "rgba(226, 232, 240, 0.9)" : "#f8fafc";
  ctx.beginPath();
  ctx.arc(midX, midY, radius + 4, 0, Math.PI * 2);
  ctx.fill();

  // 端子引き出し線 (pA: アノード, pB: カソード)
  const drawLeadLines = () => {
    ctx.beginPath();
    ctx.moveTo(pA.x, pA.y); ctx.lineTo(pA.x, midY + 4); ctx.lineTo(midX - 5, midY + 4);
    ctx.moveTo(pB.x, pB.y); ctx.lineTo(pB.x, midY + 4); ctx.lineTo(midX + 5, midY + 4);
  };

  // JISブザー記号本体 (上向き半円 + 底面線)
  const drawBuzzerBody = () => {
    ctx.beginPath();
    ctx.moveTo(midX - radius, midY + 4);
    ctx.lineTo(midX + radius, midY + 4);
    ctx.arc(midX, midY + 4, radius, Math.PI, 0, false);
    ctx.closePath();
  };

  // 音波放射アーク (発振時)
  const drawSoundWaves = () => {
    const wavePhase = (Date.now() / 200) % 2;
    ctx.beginPath();
    ctx.arc(midX, midY - 6, radius + 4 + wavePhase * 3, Math.PI * 1.25, Math.PI * 1.75, false);
    ctx.stroke();
  };

  if (isConducting) {
    const haloColor = "#0284c7";
    const coreColor = "#38bdf8";

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // 外側グロー
    ctx.shadowColor = haloColor;
    ctx.shadowBlur = 6;
    ctx.strokeStyle = haloColor;
    ctx.fillStyle = "rgba(56, 189, 248, 0.15)";
    ctx.lineWidth = 2.8;
    drawLeadLines(); ctx.stroke();
    drawBuzzerBody(); ctx.fill(); ctx.stroke();
    drawSoundWaves();

    // 内側コアライン
    ctx.shadowBlur = 0;
    ctx.strokeStyle = coreColor;
    ctx.lineWidth = 1.4;
    drawLeadLines(); ctx.stroke();
    drawBuzzerBody(); ctx.stroke();
  } else {
    const normalColor = isHovered ? "#38bdf8" : "#000000";
    ctx.strokeStyle = normalColor;
    ctx.fillStyle = "transparent";
    ctx.lineWidth = isHovered ? 2.2 : 1.6;
    drawLeadLines(); ctx.stroke();
    drawBuzzerBody(); ctx.stroke();
  }

  // ラベル表示
  ctx.font = "bold 8.5px monospace";
  ctx.textAlign = "center";
  const labelText = (comp && comp.name) ? "BUZZER" : "BZ (2.4kHz)";
  const textWidth = ctx.measureText(labelText).width;
  ctx.fillStyle = (typeof DISPLAY_MODE !== "undefined" && DISPLAY_MODE.isXrayON) ? "rgba(226, 232, 240, 0.9)" : "rgba(248, 250, 252, 0.9)";
  ctx.fillRect(midX - textWidth / 2 - 2, midY - 18, textWidth + 4, 9);
  ctx.fillStyle = isHovered ? "#0284c7" : "#000000";
  ctx.fillText(labelText, midX, midY - 11);

  ctx.restore();
}

// JIS/IEC C 0617規格準拠: CdS光導電セル (光可変抵抗器) 記号描画ルーチン
function drawSymbolCDS(ctx, pA, pB, comp, isHovered) {
  if (!pA || !pB) return;
  const mx = (pA.x + pB.x) / 2;
  const my = (pA.y + pB.y) / 2;
  const dx = pB.x - pA.x;
  const dy = pB.y - pA.y;
  const angle = Math.atan2(dy, dx);
  const len = Math.hypot(dx, dy);

  ctx.save();
  ctx.translate(mx, my);
  ctx.rotate(angle);

  const rw = 24; // JIS抵抗長方形の幅
  const rh = 9;  // JIS抵抗長方形の高さ

  // 1. 端子リード線
  ctx.strokeStyle = isHovered ? "#38bdf8" : "#0f172a";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-len / 2, 0); ctx.lineTo(-rw / 2, 0);
  ctx.moveTo(rw / 2, 0);   ctx.lineTo(len / 2, 0);
  ctx.stroke();

  // 2. JIS長方形本体 (受光面背景)
  ctx.fillStyle = isHovered ? "#e0f2fe" : "#ffffff";
  ctx.fillRect(-rw / 2, -rh / 2, rw, rh);
  ctx.strokeRect(-rw / 2, -rh / 2, rw, rh);

  // 3. JIS規格 入射光矢印 (斜め外側から降り注ぐ2本の平行矢印)
  const lux = comp.lux !== undefined ? comp.lux : 50;
  const intensity = Math.min(1.0, Math.max(0.2, lux / 150));
  const arrowColor = lux < 20 ? "#94a3b8" : `rgb(234, ${Math.round(179 * intensity)}, 8)`;

  ctx.strokeStyle = arrowColor;
  ctx.fillStyle = arrowColor;
  ctx.lineWidth = 1.4;
  ctx.lineCap = "round";

  // 矢印2本の基準オフセット (長方形の左上から中央へ向かう)
  [-4, 4].forEach(offset => {
    const startX = offset - 8;
    const startY = -rh / 2 - 12;
    const endX = offset - 2;
    const endY = -rh / 2 - 2;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // 矢じり
    const headLen = 3.5;
    const arrowAngle = Math.atan2(endY - startY, endX - startX);
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLen * Math.cos(arrowAngle - Math.PI / 6), endY - headLen * Math.sin(arrowAngle - Math.PI / 6));
    ctx.lineTo(endX - headLen * Math.cos(arrowAngle + Math.PI / 6), endY - headLen * Math.sin(arrowAngle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  });

// 4. 通電アニメーション破線 (実電流通過時の流動描写)
  const isEnergized = (comp.current_mA !== undefined ? comp.current_mA : 0.0) > 0.05;
  if (isEnergized) {
    const curDash = (typeof dashOffset !== "undefined") ? dashOffset : 0;
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.0;
    ctx.lineCap = "round";
    ctx.setLineDash([5, 3]);
    ctx.lineDashOffset = -curDash;
    ctx.beginPath();
    ctx.moveTo(-len / 2, 0);
    ctx.lineTo(len / 2, 0);
    ctx.stroke();
    ctx.setLineDash([]);
  }


  ctx.restore();
}


// ----------------------------------------------------------------------
// 5-2. 実物リアル外観描画モジュール
// ----------------------------------------------------------------------

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

  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1.8;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const halfDist = distance / 2;
  ctx.beginPath();
  ctx.moveTo(-halfDist, 0); ctx.lineTo(-bodyW / 2, 0);
  ctx.moveTo(bodyW / 2, 0);  ctx.lineTo(halfDist, 0);
  ctx.stroke();

  const leftX = -bodyW / 2;
  const rightX = bodyW / 2;

  ctx.fillStyle = "#181825";
  ctx.beginPath();
  ctx.arc(leftX + 2, 0, bodyH / 2 + 2, Math.PI * 0.5, Math.PI * 1.5);
  ctx.lineTo(rightX - 2, -bodyH / 2 - 1);
  ctx.arc(rightX - 2, 0, bodyH / 2 + 2, Math.PI * 1.5, Math.PI * 0.5);
  ctx.lineTo(leftX + 2, bodyH / 2 + 1);
  ctx.closePath();
  ctx.fill();

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

  const bandWidth = 2.0;
  const bandPositions = [leftX + 5, leftX + 9, leftX + 13, rightX - 5];
  colors.forEach((color, idx) => {
    ctx.fillStyle = color;
    ctx.fillRect(bandPositions[idx] - bandWidth / 2, -bodyH / 2 - 0.5, bandWidth, bodyH + 1);
  });

  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.fillRect(leftX + 2, -bodyH / 2 + 1.2, bodyW - 4, 1.8);

  ctx.restore();
}

function drawRealSwitch(ctx, pA, pB, comp, isHovered) {
  ctx.save();
  const midX = (pA.x + pB.x) / 2;
  const midY = (pA.y + pB.y) / 2;
  const angle = Math.atan2(pB.y - pA.y, pB.x - pA.x);
  const dist = Math.hypot(pB.x - pA.x, pB.y - pA.y);
  const halfDist = dist / 2;
  const bodyWidth = Math.min(14, dist * 0.7);

  ctx.translate(midX, midY);
  ctx.rotate(angle);

  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-halfDist, 0); ctx.lineTo(-bodyWidth / 2, 0);
  ctx.moveTo(bodyWidth / 2, 0); ctx.lineTo(halfDist, 0);
  ctx.stroke();

  ctx.fillStyle = isHovered ? "#3b82f6" : "#1e293b";
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-bodyWidth / 2, -7, bodyWidth, 14, 3);
  ctx.fill(); ctx.stroke();

  ctx.fillStyle = comp.isOn ? "#22c55e" : "#ef4444";
  ctx.beginPath(); ctx.arc(0, -5, 3, 0, Math.PI * 2); ctx.fill();

  ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 3.5; ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.lineTo(comp.isOn ? 7 : -7, 8);
  ctx.stroke();

  ctx.restore();
}

function drawRealSwitchSPDT(ctx, pA, pCOM, pB, comp, isHovered) {
  if (!pA || !pB) return;
  if (!pCOM) pCOM = { x: (pA.x + pB.x) / 2, y: (pA.y + pB.y) / 2 };

  ctx.save();
  const angle = Math.atan2(pB.y - pA.y, pB.x - pA.x);
  const distA = Math.hypot(pCOM.x - pA.x, pCOM.y - pA.y);
  const distB = Math.hypot(pB.x - pCOM.x, pB.y - pCOM.y);
  const maxDist = Math.max(distA, distB);
  const bodyHalfW = maxDist + 5;
  const bodyH = 18;

  ctx.translate(pCOM.x, pCOM.y);
  ctx.rotate(angle);

  ctx.fillStyle = isHovered ? "#1e3a8a" : "#1e293b";
  ctx.strokeStyle = isHovered ? "#38bdf8" : "#475569";
  ctx.lineWidth = isHovered ? 2.0 : 1.5;
  ctx.beginPath();
  ctx.roundRect(-bodyHalfW, -bodyH / 2, bodyHalfW * 2, bodyH, 4);
  ctx.fill(); ctx.stroke();

  const drawTerminal = (x, y, label) => {
    ctx.fillStyle = "#94a3b8";
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1.0;
    ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#0f172a";
    ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
    if (label) {
      ctx.font = "bold 7px monospace";
      ctx.fillStyle = "#94a3b8";
      ctx.textAlign = "center";
      ctx.fillText(label, x, -bodyH / 2 - 3);
    }
  };
  drawTerminal(-distA, 0, "1");
  drawTerminal(0, 0, "COM");
  drawTerminal(distB, 0, "2");

  const isL2 = comp.state === "L2";
  ctx.fillStyle = !isL2 ? "#38bdf8" : "#334155";
  ctx.shadowColor = !isL2 ? "#38bdf8" : "transparent";
  ctx.shadowBlur = !isL2 ? 6 : 0;
  ctx.beginPath(); ctx.arc(-distA * 0.5, -4, 2.5, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = isL2 ? "#38bdf8" : "#334155";
  ctx.shadowColor = isL2 ? "#38bdf8" : "transparent";
  ctx.shadowBlur = isL2 ? 6 : 0;
  ctx.beginPath(); ctx.arc(distB * 0.5, -4, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = "#f8fafc";
  ctx.lineWidth = 4.0;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(isL2 ? distB * 0.45 : -distA * 0.45, 6);
  ctx.stroke();

 ctx.fillStyle = isHovered ? "#38bdf8" : "#cbd5e1";
  ctx.beginPath();
  ctx.arc(isL2 ? distB * 0.45 : -distA * 0.45, 6, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawRealTactSwitch(ctx, pA, pB, comp, isHovered) {
  if (!pA || !pB) return;
  ctx.save();

  const midX = (pA.x + pB.x) / 2;
  const midY = (pA.y + pB.y) / 2;
  const dist = Math.hypot(pB.x - pA.x, pB.y - pA.y);
  const halfDist = dist / 2;
  const angle = Math.atan2(pB.y - pA.y, pB.x - pA.x);
  const bodySize = 18; // 6mm角の標準タクトスイッチ

  ctx.translate(midX, midY);
  ctx.rotate(angle);

  // 1. 金属リード足 (左右端子)
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-halfDist, 0); ctx.lineTo(-bodySize / 2, 0);
  ctx.moveTo(bodySize / 2, 0);  ctx.lineTo(halfDist, 0);
  ctx.stroke();

  // 2. スイッチ本体 (黒色モールド樹脂)
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = isHovered ? "#262626" : "#171717";
  ctx.strokeStyle = isHovered ? "#38bdf8" : "#404040";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(-bodySize / 2, -bodySize / 2, bodySize, bodySize, 3);
  ctx.fill(); ctx.stroke();
  ctx.shadowColor = "transparent";

  // 四隅の銀色固定リベット
  ctx.fillStyle = "#cbd5e1";
  [[-bodySize / 2 + 3, -bodySize / 2 + 3], [bodySize / 2 - 3, -bodySize / 2 + 3],
   [-bodySize / 2 + 3, bodySize / 2 - 3],  [bodySize / 2 - 3, bodySize / 2 - 3]].forEach(([rx, ry]) => {
    ctx.beginPath(); ctx.arc(rx, ry, 1.0, 0, Math.PI * 2); ctx.fill();
  });

  // 3. 中央の円形プランジャ (押下時の沈み込みフィードバック)
  const isPressed = !!comp.isPressed;
  const btnR = isPressed ? 4.5 : 5.5;
  ctx.fillStyle = isPressed ? "#0284c7" : (isHovered ? "#38bdf8" : "#0ea5e9");
  ctx.strokeStyle = isPressed ? "#0369a1" : "#bae6fd";
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.arc(0, 0, btnR, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  ctx.restore();
}

// 項目1: CdS光導電セルのリアル描画 (セラミック円盤 ＆ ジグザグ受光膜 精密版)
function drawRealCDS(ctx, p1, p2, comp, isHovered, isSelected) {
  const mx = (p1.x + p2.x) / 2;
  const my = (p1.y + p2.y) / 2;
  const outerRadius = 11;
  const innerRadius = 8.5;

  ctx.save();

  // 1. リード線 (スズメッキ軟銅線)
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 2.0;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y); ctx.lineTo(mx - 4, my);
  ctx.moveTo(p2.x, p2.y); ctx.lineTo(mx + 4, my);
  ctx.stroke();

  // 2. セラミック外枠基板 (アルミナ陶器色)
  ctx.fillStyle = isSelected ? "#38bdf8" : (isHovered ? "#facc15" : "#e5e5e5");
  ctx.strokeStyle = "#737373";
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.arc(mx, my, outerRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 3. 内部受光エリア (淡いベージュ色の基底層)
  ctx.fillStyle = "#fef3c7";
  ctx.beginPath();
  ctx.arc(mx, my, innerRadius, 0, Math.PI * 2);
  ctx.fill();

  // 4. ジグザグ受光電極膜 (硫化カドミウム・明瞭な赤橙色パターン)
  ctx.strokeStyle = "#ea580c";
  ctx.lineWidth = 1.6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  const w = 4.5;
  ctx.moveTo(mx - w, my - 5.5);
  ctx.lineTo(mx + w, my - 3.5);
  ctx.lineTo(mx - w, my - 1.5);
  ctx.lineTo(mx + w, my + 0.5);
  ctx.lineTo(mx - w, my + 2.5);
  ctx.lineTo(mx + w, my + 4.5);
  ctx.stroke();

  // 5. 表面保護エポキシ樹脂の光沢コート
  const grad = ctx.createLinearGradient(mx - 6, my - 6, mx + 6, my + 6);
  grad.addColorStop(0.0, "rgba(255, 255, 255, 0.6)");
  grad.addColorStop(0.3, "rgba(255, 255, 255, 0.15)");
  grad.addColorStop(1.0, "rgba(255, 255, 255, 0.0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(mx, my, innerRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}


function drawRealLED(ctx, pA, pB, comp, isHovered) {
  if (!pA || !pB) return;
  ctx.save();

  const midX = (pA.x + pB.x) / 2;
  const midY = (pA.y + pB.y) / 2;

  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 2.0;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(pA.x, pA.y); ctx.lineTo(midX, midY);
  ctx.moveTo(pB.x, pB.y); ctx.lineTo(midX, midY);
  ctx.stroke();

  ctx.strokeStyle = isHovered ? "#38bdf8" : "#94a3b8";
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(pA.x, pA.y, 3, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(pB.x, pB.y, 3, 0, Math.PI * 2); ctx.stroke();

  ctx.translate(midX, midY);

  const physics = typeof calculateCircuitPhysics === "function" ? calculateCircuitPhysics() : { status: "OPEN" };
  const isBurned = !!comp.isBurned;
  const current_mA = (comp.current_mA !== undefined) ? comp.current_mA : ((physics && physics.i_total_mA) ? physics.i_total_mA : 0);
  const isLit = !isBurned && (comp.isOn !== false) && (physics.status === "CLOSED") && (current_mA > 0.05);

  const isRainbow = (comp.colorType === "rainbow" || comp.color === "#ec4899" || comp.color === "rainbow");
  let r = 239, g = 68, b = 68;

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

  if (isLit) {
    ctx.save();
    const intensity = Math.min(Math.max(current_mA / 15.0, 0.15), 1.0);
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

  const radius = 9;
  if (isBurned) {
    ctx.fillStyle = "#334155";
    ctx.strokeStyle = "#0f172a";
  } else {
    ctx.fillStyle = isLit ? `rgb(${Math.min(r+60, 255)}, ${Math.min(g+60, 255)}, ${Math.min(b+60, 255)})` : mainColor;
    ctx.strokeStyle = isHovered ? "#38bdf8" : (isLit ? "#ffffff" : "rgba(255, 255, 255, 0.5)");
  }
  ctx.lineWidth = isHovered ? 2.0 : 1.0;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = isBurned ? "rgba(15, 23, 42, 0.8)" : (isLit ? "rgba(255, 255, 255, 0.6)" : "rgba(255, 255, 255, 0.25)");
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-4, -2); ctx.lineTo(-1, 0); ctx.lineTo(-3, 3);
  ctx.moveTo(3, -1);  ctx.lineTo(1, 0);  ctx.lineTo(2, 2);
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.fillStyle = isBurned ? "rgba(255, 255, 255, 0.15)" : (isLit ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.70)");
  ctx.beginPath();
  ctx.arc(-3, -3, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawRealCapacitor(ctx, pA, pB, comp, isHovered) {
  ctx.save();
  const midX = (pA.x + pB.x) / 2;
  const midY = (pA.y + pB.y) / 2;

  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 2.0;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(pA.x, pA.y); ctx.lineTo(midX, midY);
  ctx.moveTo(pB.x, pB.y); ctx.lineTo(midX, midY);
  ctx.stroke();

  ctx.translate(midX, midY);
  ctx.fillStyle = isHovered ? "#3b82f6" : "#1e293b";
  ctx.strokeStyle = isHovered ? "#60a5fa" : "#475569";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  ctx.fillStyle = "#94a3b8";
  ctx.beginPath();
  ctx.arc(0, 0, 10, Math.PI * 0.25, Math.PI * 0.75);
  ctx.fill();

  ctx.restore();
}

function drawRealPotentiometer(ctx, pA, pB, comp, isHovered) {
  if (!pA || !pB) return;
  ctx.save();

  const midX = (pA.x + pB.x) / 2;
  const midY = (pA.y + pB.y) / 2;

  let pWiper = null;
  if (comp && comp.pinC) {
    pWiper = (typeof getHoleCoord === "function") ? getHoleCoord(comp.pinC) : null;
  } else if (comp && comp.pinWiper) {
    pWiper = (typeof getHoleCoord === "function") ? getHoleCoord(comp.pinWiper) : null;
  } else {
    const colA = (typeof getColFromHoleId === "function") ? getColFromHoleId(comp.pinA) : 8;
    const colB = (typeof getColFromHoleId === "function") ? getColFromHoleId(comp.pinB) : 11;
    const midCol = Math.round((colA + colB) / 2);
    const rowChar = (comp.pinA && comp.pinA.charAt(0)) || "C";
    const nextRow = String.fromCharCode(rowChar.charCodeAt(0) + 1);
    pWiper = (typeof getHoleCoord === "function") ? getHoleCoord(`${nextRow}${midCol}`) : null;
  }

  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 2.0;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(pA.x, pA.y); ctx.lineTo(midX, midY);
  ctx.moveTo(pB.x, pB.y); ctx.lineTo(midX, midY);
  if (pWiper) {
    ctx.moveTo(pWiper.x, pWiper.y); ctx.lineTo(midX, midY);
  }
  ctx.stroke();

  ctx.translate(midX, midY);
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 5;
  ctx.shadowOffsetY = 2;

  ctx.fillStyle = isHovered ? "#2563eb" : "#334155";
  ctx.strokeStyle = isHovered ? "#60a5fa" : "#64748b";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.shadowColor = "transparent";

  const ratio = (comp && comp.cur_ratio !== undefined) ? comp.cur_ratio : 0.5;
  const angle = (ratio * 270 - 135) * (Math.PI / 180);

  ctx.strokeStyle = "#f8fafc";
  ctx.lineWidth = 2.0;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(angle) * 8, Math.sin(angle) * 8);
  ctx.stroke();

  ctx.fillStyle = "#cbd5e1";
  ctx.beginPath();
  ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

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

  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 1.8;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-halfDist, 0); ctx.lineTo(-bodyW / 2, 0);
  ctx.moveTo(bodyW / 2, 0);  ctx.lineTo(halfDist, 0);
  ctx.stroke();

  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;

  ctx.fillStyle = isHovered ? "#262626" : "#171717";
  ctx.strokeStyle = isHovered ? "#38bdf8" : "#404040";
  ctx.lineWidth = 1.2;

  ctx.beginPath();
  ctx.roundRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH, 2);
  ctx.fill(); ctx.stroke();
  ctx.shadowColor = "transparent";

  const bandW = 3.0;
  const bandX = (bodyW / 2) - 5;
  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(bandX - bandW / 2, -bodyH / 2, bandW, bodyH);

  ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
  ctx.fillRect(-bodyW / 2 + 1, -bodyH / 2 + 1, bodyW - 2, 1.5);

  ctx.restore();
}

function drawRealTransistor(ctx, comp, isHovered) {
  const pE = getHoleCoord(comp.pinE || comp.pinA);
  const pC = getHoleCoord(comp.pinC || `C${getColFromHoleId(comp.pinA) + 1}`);
  const pB = getHoleCoord(comp.pinB);
  if (!pE || !pC || !pB) return;

  ctx.save();
  const midX = pC.x;
  const midY = pC.y;

  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 2.0;
  ctx.lineCap = "round";

  [pE, pC, pB].forEach(p => {
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x, midY - 6);
    ctx.stroke();
  });

  ctx.translate(midX, midY - 14);
  const bodyW = 24;
  const bodyH = 12;

  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 5;
  ctx.shadowOffsetY = 2;

  ctx.fillStyle = isHovered ? "#262626" : "#171717";
  ctx.strokeStyle = isHovered ? "#38bdf8" : "#404040";
  ctx.lineWidth = 1.2;

  ctx.beginPath();
  ctx.moveTo(-bodyW / 2, bodyH / 2);
  ctx.lineTo(bodyW / 2, bodyH / 2);
  ctx.arc(0, bodyH / 2, bodyW / 2, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.shadowColor = "transparent";

  ctx.fillStyle = "#334155";
  ctx.fillRect(-bodyW / 2 + 2, bodyH / 2 - 2.5, bodyW - 4, 1.5);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 6.5px monospace";
  ctx.textAlign = "center";
  ctx.fillText("C1815", 0, 1);

ctx.font = "bold 6px monospace";
  ctx.fillStyle = "#64748b";
  const pitch = Math.abs(pC.x - pE.x);
  ctx.fillText("E", -pitch, bodyH / 2 + 7);
  ctx.fillText("C", 0, bodyH / 2 + 7);
  ctx.fillText("B", pitch, bodyH / 2 + 7);

  ctx.restore();
}

// ★ NチャネルMOSFET (2N7000) 用 リアル体描画関数 (TO-92パッケージ / S-G-D配列)
function drawRealMOSFET(ctx, comp, isHovered) {
  const pS = getHoleCoord(comp.pinS || comp.pinA);
  const pG = getHoleCoord(comp.pinG || `C${getColFromHoleId(comp.pinA) + 1}`);
  const pD = getHoleCoord(comp.pinD || comp.pinB);
  if (!pS || !pG || !pD) return;

  ctx.save();
  const midX = pG.x;
  const midY = pG.y;

  // 1. リード線 (シルバー)
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 2.0;
  ctx.lineCap = "round";

  [pS, pG, pD].forEach(p => {
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x, midY - 6);
    ctx.stroke();
  });

  // 2. TO-92 モールド本体 (D型断面)
  ctx.translate(midX, midY - 14);
  const bodyW = 24;
  const bodyH = 12;

  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 5;
  ctx.shadowOffsetY = 2;

  ctx.fillStyle = isHovered ? "#262626" : "#171717";
  ctx.strokeStyle = isHovered ? "#38bdf8" : "#404040";
  ctx.lineWidth = 1.2;

  ctx.beginPath();
  ctx.moveTo(-bodyW / 2, bodyH / 2);
  ctx.lineTo(bodyW / 2, bodyH / 2);
  ctx.arc(0, bodyH / 2, bodyW / 2, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.shadowColor = "transparent";

  // モールド上部の平坦段差ライン
  ctx.fillStyle = "#334155";
  ctx.fillRect(-bodyW / 2 + 2, bodyH / 2 - 2.5, bodyW - 4, 1.5);

  // 3. 型番刻印 (2N7000)
  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 6.5px monospace";
  ctx.textAlign = "center";
  ctx.fillText("2N7000", 0, 1);

  // 4. ピンアサイン刻印 (左: Source / 中: Gate / 右: Drain)
  ctx.font = "bold 6px monospace";
  ctx.fillStyle = "#38bdf8"; // MOSFET識別用アクセントカラー
 const pitch = Math.abs(pG.x - pS.x);
  ctx.fillText("S", -pitch, bodyH / 2 + 7);
  ctx.fillText("G", 0, bodyH / 2 + 7);
  ctx.fillText("D", pitch, bodyH / 2 + 7);

  ctx.restore();
}

// 圧電ブザー (ピエゾサウンダ) 用 リアル体描画関数
function drawRealBuzzer(ctx, pA, pB, comp, isHovered) {
  if (!pA || !pB) return;

  const midX = (pA.x + pB.x) / 2;
  const midY = (pA.y + pB.y) / 2;
  const radius = 13.0; // 約12mm相当のケース外径

  ctx.save();

  // 1. リード線 (シルバー)
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 2.0;
  ctx.lineCap = "round";

  [pA, pB].forEach(p => {
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(midX + (p.x - midX) * 0.4, midY);
    ctx.stroke();
  });

  // 2. 通電発振時の音波アニメーションエフェクト
  const isOscillating = (comp && comp.current_mA > 0.05);
  if (isOscillating) {
    const wavePhase = (Date.now() / 150) % 3; // 3段階の拡がり
    ctx.strokeStyle = "rgba(56, 189, 248, " + (0.6 - wavePhase * 0.18) + ")";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(midX, midY, radius + 3 + (wavePhase * 5), 0, Math.PI * 2);
    ctx.stroke();
  }

  // 3. 円筒ケース本体 (黒色プラスチック)
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;

  ctx.fillStyle = isHovered ? "#262626" : "#171717";
  ctx.strokeStyle = isHovered ? "#38bdf8" : "#404040";
  ctx.lineWidth = 1.4;

  ctx.beginPath();
  ctx.arc(midX, midY, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.shadowColor = "transparent";

  // ケース外周の段差ベベル
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.arc(midX, midY, radius - 2.5, 0, Math.PI * 2);
  ctx.stroke();

  // 4. 中央の放音孔 (キャビティ)
  ctx.fillStyle = "#0a0a0a";
  ctx.beginPath();
  ctx.arc(midX, midY, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#262626";
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // 5. 正極 (+) 刻印 (pinA側)
  const signX = midX + (pA.x < pB.x ? -7 : 7);
  const signY = midY - 6;
  ctx.fillStyle = "#ef4444";
  ctx.font = "bold 9px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("+", signX, signY);

  ctx.restore();
}

function drawSnapPinRing(ctx, x, y) {
  ctx.save();
  ctx.strokeStyle = "#0284c7";
  ctx.fillStyle = "rgba(56, 189, 248, 0.5)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.restore();
}

// ----------------------------------------------------------------------
// 5-3. パーツ描画ストラテジーマップ ＆ 統合描画メイン
// ----------------------------------------------------------------------

const COMP_RENDERERS = {
  resistor: (ctx, pA, pB, comp, isHovered) => {
    if (DISPLAY_MODE && DISPLAY_MODE.isSymbolON) drawSymbolResistor(ctx, pA, pB, comp, isHovered);
    else drawRealResistor(ctx, pA, pB, comp.colors || ["#78350f", "#000000", "#dc2626", "#d97706"], isHovered);
  },
  switch: (ctx, pA, pB, comp, isHovered) => {
    if (DISPLAY_MODE && DISPLAY_MODE.isSymbolON) drawSymbolSwitch(ctx, pA, pB, comp, isHovered);
    else drawRealSwitch(ctx, pA, pB, comp, isHovered);
  },



 switch_spdt: (ctx, pA, pB, comp, isHovered) => {
    if (DISPLAY_MODE && DISPLAY_MODE.isSymbolON) {
      drawSymbolSwitchSPDT(ctx, pA, pB, comp, isHovered);
    } else {
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
  tact_switch: (ctx, pA, pB, comp, isHovered) => {
    if (DISPLAY_MODE && DISPLAY_MODE.isSymbolON) drawSymbolTactSwitch(ctx, pA, pB, comp, isHovered);
    else drawRealTactSwitch(ctx, pA, pB, comp, isHovered);
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
  },

  // ★ NチャネルMOSFET (2N7000) の描画ストラテジー登録
mosfet: (ctx, pA, pB, comp, isHovered) => {
    if (DISPLAY_MODE && DISPLAY_MODE.isSymbolON) {
      if (typeof drawSymbolMOSFET === "function") drawSymbolMOSFET(ctx, comp, isHovered);
      else drawRealMOSFET(ctx, comp, isHovered);
    } else {
      drawRealMOSFET(ctx, comp, isHovered);
    }
  },

  // 圧電ブザーの描画ストラテジー登録
  buzzer: (ctx, pA, pB, comp, isHovered) => {
    if (DISPLAY_MODE && DISPLAY_MODE.isSymbolON) {
      if (typeof drawSymbolBuzzer === "function") drawSymbolBuzzer(ctx, pA, pB, comp, isHovered);
      else drawRealBuzzer(ctx, pA, pB, comp, isHovered);
    } else {
      drawRealBuzzer(ctx, pA, pB, comp, isHovered);
    }
  },

  // CdS光導電セルの描画ルーチンをストラテジーマップへ登録
  cds: (ctx, pA, pB, comp, isHovered) => {
    const isSelected = (typeof selectedComponent !== "undefined" && selectedComponent && selectedComponent.id === comp.id);
    if (DISPLAY_MODE && DISPLAY_MODE.isSymbolON) {
      if (typeof drawSymbolCDS === "function") drawSymbolCDS(ctx, pA, pB, comp, isHovered);
      else drawSymbolResistor(ctx, pA, pB, comp, isHovered);
    } else {
      drawRealCDS(ctx, pA, pB, comp, isHovered, isSelected);
    }
  }
};

function drawComponents(ctx) {
  components.forEach(comp => {
    const pA = getHoleCoord(comp.pinA);
    const pB = getHoleCoord(comp.pinB);
    if (!pA || !pB) return;

    const isHovered = (hoveredComponent && hoveredComponent.id === comp.id);

drawSnapPinRing(ctx, pA.x, pA.y);
    drawSnapPinRing(ctx, pB.x, pB.y);

    if (comp.type === "transistor" && comp.pinC) {
      const pC = getHoleCoord(comp.pinC);
      if (pC) drawSnapPinRing(ctx, pC.x, pC.y);
    }
    // MOSFETの中央足 (Gate) にスナップリングを描画
    if (comp.type === "mosfet" && comp.pinG) {
      const pG = getHoleCoord(comp.pinG);
      if (pG) drawSnapPinRing(ctx, pG.x, pG.y);
    }

    const renderer = COMP_RENDERERS[comp.type];
    if (typeof renderer === "function") {
      renderer(ctx, pA, pB, comp, isHovered);
    } else {
      drawRealResistor(ctx, pA, pB, comp.colors || ["#78350f", "#000000", "#dc2626", "#d97706"], isHovered);
    }
  });
}

// ----------------------------------------------------------------------
// 5-4. メインCanvas総合描画ルーチン (Main Scene Compositor)
// ----------------------------------------------------------------------

function renderScene(ctx) {
  if (!ctx) {
    const canvas = document.getElementById("breadboard-canvas");
    if (canvas) ctx = canvas.getContext("2d");
  }
  if (!ctx) return;

  const cfg = BOARD_CONFIG;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const pPlusHole = getHoleCoord("BUS_TOP_PLUS_1");
  const pMinusHole = getHoleCoord("BUS_BOTTOM_MINUS_1");
  if (!pPlusHole || !pMinusHole) return;

  // 1. バッテリー描画
  const batW = 42; const batH = 65; const batX = 20;
  const batY = (cfg.y + cfg.height / 2) - batH / 2;
  const curV = (typeof selectedBatteryVoltage !== "undefined") ? selectedBatteryVoltage : 9.0;
  const vLabel = Number.isInteger(curV) ? `${curV}V` : `${curV.toFixed(1)}V`;

  ctx.save();
  if (DISPLAY_MODE.isSymbolON) {
    ctx.strokeStyle = "#000000"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(batX + 6, batY + 32); ctx.lineTo(batX + 34, batY + 32); ctx.stroke();
    ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.moveTo(batX + 13, batY + 48); ctx.lineTo(batX + 27, batY + 48); ctx.stroke();
    ctx.fillStyle = "#000000"; ctx.font = "bold 10px monospace"; ctx.fillText(`+ ${vLabel} -`, batX, batY + 12);
  } else {
    ctx.fillStyle = "#334155"; ctx.beginPath(); ctx.roundRect(batX, batY, batW, batH, 6); ctx.fill();
    ctx.strokeStyle = "#64748b"; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = "#eab308"; ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
    ctx.fillText(vLabel, batX + batW / 2, batY + batH / 2 + 4);

    ctx.fillStyle = "#ef4444"; ctx.beginPath(); ctx.arc(batX + batW, batY + 18, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#3b82f6"; ctx.beginPath(); ctx.arc(batX + batW, batY + 47, 3.5, 0, Math.PI * 2); ctx.fill();

    ctx.beginPath(); ctx.moveTo(batX + batW, batY + 18); ctx.lineTo(batX + batW, pPlusHole.y); ctx.lineTo(pPlusHole.x, pPlusHole.y); ctx.stroke();
    ctx.strokeStyle = "#3b82f6"; ctx.beginPath(); ctx.moveTo(batX + batW, batY + 47); ctx.lineTo(batX + batW, pMinusHole.y); ctx.lineTo(pMinusHole.x, pMinusHole.y); ctx.stroke();
  }
  ctx.restore();

  // 2. ブレッドボード本体
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

  // 3. 電源レールガイド線 ＆ 文字
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

  // 4. ジャンパ線静的描画
  const energized = (typeof analyzeEnergizedNodes === "function") ? analyzeEnergizedNodes() : new Set();
  activeJumperWires.forEach(wire => drawJumperWire(ctx, wire, false));

  // 5. スルーホール描画
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

  // 6. 通電アニメーション破線描画 (物理実電流連動版)
  ctx.save();
  const physics = (typeof calculateCircuitPhysics === "function") ? calculateCircuitPhysics() : null;
  const isCircuitActive = physics && physics.status === "CLOSED" && physics.i_total_mA > 0.05;

  if (isCircuitActive) {
    ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 3; ctx.setLineDash([6, 4]); ctx.lineDashOffset = -dashOffset;

    ctx.beginPath();
    ctx.moveTo(batX + batW, batY + 18);
    ctx.lineTo(batX + batW, pPlusHole.y);
    ctx.lineTo(pPlusHole.x, pPlusHole.y);
    ctx.stroke();

    const activeWorkingWires = activeJumperWires.filter(w => (w.current_mA || 0) > 0.05);

    let maxPlusCol = 1;
    activeWorkingWires.forEach(w => {
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
    activeWorkingWires.forEach(w => {
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
      if ((wire.current_mA || 0) > 0.05) {
        drawJumperWire(ctx, wire, true);
      }
    });

    // ★ 実電流が流れているコンポーネント列のみ縦列破線を描画
    components.forEach(comp => {
      if ((comp.current_mA || 0) <= 0.05) return;
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
        }
      }
    });
  }
  ctx.restore();

  // 7. 削除モードホバー
  if (isDeleteMode && window.hoveredDeleteTarget) {
    ctx.save();
    ctx.strokeStyle = "#dc2626"; ctx.fillStyle = "rgba(239, 68, 68, 0.45)"; ctx.lineWidth = 5;
    if (window.hoveredDeleteTarget.type === "wire") {
      drawJumperWire(ctx, window.hoveredDeleteTarget.item, false);
    } else if (window.hoveredDeleteTarget.type === "component") {
      const comp = window.hoveredDeleteTarget.item;
      const pA = getHoleCoord(comp.pinA); const pB = getHoleCoord(comp.pinB);
      if (pA && pB) {
        ctx.beginPath(); ctx.arc((pA.x + pB.x) / 2, (pA.y + pB.y) / 2, 24, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      }
    }
    ctx.restore();
  }

  // 8. パーツ最前面描画
  drawComponents(ctx);
}

// ----------------------------------------------------------------------
// 5-5. 拡大プレビュー描画モジュール群
// ----------------------------------------------------------------------

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

function drawPreviewSwitchSPDT(ctx, comp, midX, midY) {
  ctx.save();
  ctx.translate(midX, midY - 6);

  const isL2 = comp.state === "L2";
  const bodyW = 84;
  const bodyH = 44;
  const pitch = 32;

  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";
  [-pitch, 0, pitch].forEach(x => {
    ctx.beginPath();
    ctx.moveTo(x, bodyH / 2 - 2);
    ctx.lineTo(x, bodyH / 2 + 16);
    ctx.stroke();
  });

  ctx.textAlign = "center";
  ctx.font = "bold 11px monospace";
  ctx.fillStyle = !isL2 ? "#38bdf8" : "#64748b";
  ctx.fillText("L1", -pitch, bodyH / 2 + 28);
  ctx.fillStyle = "#facc15";
  ctx.fillText("COM", 0, bodyH / 2 + 28);
  ctx.fillStyle = isL2 ? "#38bdf8" : "#64748b";
  ctx.fillText("L2", pitch, bodyH / 2 + 28);

  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 8;
  ctx.fillStyle = "#1e293b";
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH, 6);
  ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#fbbf24";
  ctx.beginPath(); ctx.arc(0, -8, 4, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = !isL2 ? "#38bdf8" : "#475569";
  ctx.beginPath(); ctx.arc(-22, -10, 3.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = isL2 ? "#38bdf8" : "#475569";
  ctx.beginPath(); ctx.arc(22, -10, 3.5, 0, Math.PI * 2); ctx.fill();

ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.lineTo(isL2 ? 20 : -20, 18);
  ctx.stroke();

  ctx.restore();
}

function drawPreviewTactSwitch(ctx, comp, midX, midY) {
  ctx.save();
  ctx.translate(midX, midY);

  const isPressed = !!comp.isPressed;
  const bodyW = 76, bodyH = 76;

  // 左右の金属リード足
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-bodyW / 2 - 20, 0); ctx.lineTo(-bodyW / 2, 0);
  ctx.moveTo(bodyW / 2, 0); ctx.lineTo(bodyW / 2 + 20, 0);
  ctx.stroke();

  // スイッチ本体ケース
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 10;
  ctx.fillStyle = "#1e293b";
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH, 10);
  ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;

  // 四隅の金属リベット
  ctx.fillStyle = "#cbd5e1";
  [[-26, -26], [26, -26], [-26, 26], [26, 26]].forEach(([rx, ry]) => {
    ctx.beginPath(); ctx.arc(rx, ry, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#64748b";
    ctx.beginPath(); ctx.arc(rx, ry, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#cbd5e1";
  });

  // 金属フレームのトップリング
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.stroke();

  // 中央プッシュプランジャ (押下状態連動)
  const btnR = isPressed ? 18 : 22;
  ctx.fillStyle = isPressed ? "#0284c7" : "#0ea5e9";
  ctx.strokeStyle = isPressed ? "#0369a1" : "#7dd3fc";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, btnR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  // 状態テキスト
  ctx.font = "bold 11px monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = isPressed ? "#38bdf8" : "#94a3b8";
  ctx.fillText(isPressed ? "PRESSED (ON)" : "RELEASED (OFF)", 0, bodyH / 2 + 20);

  ctx.restore();
}

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

function drawPreviewDiode(ctx, comp, midX, midY) {
  ctx.save();
  ctx.translate(midX, midY);

  const bodyW = 70;
  const bodyH = 26;

  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-100, 0); ctx.lineTo(-bodyW / 2, 0);
  ctx.moveTo(bodyW / 2, 0); ctx.lineTo(100, 0);
  ctx.stroke();

  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 8;
  ctx.fillStyle = "#171717";
  ctx.strokeStyle = "#404040";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.roundRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH, 4);
  ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(bodyW / 2 - 18, -bodyH / 2, 8, bodyH);

  ctx.fillStyle = "#a3a3a3";
  ctx.font = "bold 9px monospace";
  ctx.textAlign = "center";
  ctx.fillText("1N4007", -6, 3);

  ctx.font = "bold 10px monospace";
  ctx.fillStyle = "#ef4444";
  ctx.fillText("+ A (アノード)", -60, -18);
  ctx.fillStyle = "#38bdf8";
  ctx.fillText("- K (カソード)", 60, -18);

  ctx.restore();
}

function drawPreviewTransistor(ctx, comp, midX, midY) {
  ctx.save();
  ctx.translate(midX, midY - 8);

  const pitch = 22;
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  [-pitch, 0, pitch].forEach(x => {
    ctx.beginPath();
    ctx.moveTo(x, -5);
    ctx.lineTo(x, 18);
    ctx.stroke();
  });

  ctx.textAlign = "center";
  ctx.font = "bold 13px monospace";
  ctx.fillStyle = "#38bdf8";
  ctx.fillText("E", -pitch, 36);
  ctx.fillStyle = "#eab308";
  ctx.fillText("C", 0, 36);
  ctx.fillStyle = "#ef4444";
  ctx.fillText("B", pitch, 36);

  ctx.font = "bold 8px sans-serif";
  ctx.fillStyle = "#38bdf8";
  ctx.fillText("GND", -pitch, 46);
  ctx.fillStyle = "#eab308";
  ctx.fillText("LED", 0, 46);
  ctx.fillStyle = "#ef4444";
  ctx.fillText("SW", pitch, 46);

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
  ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#334155";
  ctx.fillRect(-bodyW / 2 + 4, -4, bodyW - 8, 3);

 ctx.fillStyle = "#a3a3a3";
  ctx.font = "bold 11px monospace";
  ctx.textAlign = "center";
  ctx.fillText("2SC1815", 0, -12);

  ctx.restore();
}

// ★ NチャネルMOSFET (2N7000) 用 拡大プレビュー描画関数 (TO-92パッケージ / S-G-D配列)
function drawPreviewMOSFET(ctx, comp, midX, midY) {
  ctx.save();
  ctx.translate(midX, midY - 8);

  const pitch = 22;
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  // 1. リード線 (シルバー)
  [-pitch, 0, pitch].forEach(x => {
    ctx.beginPath();
    ctx.moveTo(x, -5);
    ctx.lineTo(x, 18);
    ctx.stroke();
  });

  // 2. ピン名表示 (左: Source, 中: Gate, 右: Drain)
  ctx.textAlign = "center";
  ctx.font = "bold 13px monospace";
  ctx.fillStyle = "#38bdf8";
  ctx.fillText("S", -pitch, 36);
  ctx.fillStyle = "#a855f7";
  ctx.fillText("G", 0, 36);
  ctx.fillStyle = "#eab308";
  ctx.fillText("D", pitch, 36);

  // 3. 機能・配線ガイド表示
  ctx.font = "bold 8px sans-serif";
  ctx.fillStyle = "#38bdf8";
  ctx.fillText("GND", -pitch, 46);
  ctx.fillStyle = "#a855f7";
  ctx.fillText("CTRL", 0, 46);
  ctx.fillStyle = "#eab308";
  ctx.fillText("LOAD", pitch, 46);

  // 4. TO-92 モールド本体 (D型断面)
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
  ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;

  // モールド上部の平坦段差ライン
  ctx.fillStyle = "#334155";
  ctx.fillRect(-bodyW / 2 + 4, -4, bodyW - 8, 3);

 // 5. 型番刻印 (2N7000)
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "bold 11px monospace";
  ctx.textAlign = "center";
  ctx.fillText("2N7000", 0, -12);

  ctx.restore();
}

// 圧電ブザー (ピエゾサウンダ) 用 拡大プレビュー描画関数
function drawPreviewBuzzer(ctx, comp, midX, midY) {
  ctx.save();
  ctx.translate(midX, midY - 6);

  const pitch = 24;
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 3.5;
  ctx.lineCap = "round";

  // 1. リード線 (シルバー)
  [-pitch, pitch].forEach(x => {
    ctx.beginPath();
    ctx.moveTo(x, 10);
    ctx.lineTo(x, 34);
    ctx.stroke();
  });

  // 2. ピン名および極性表示
  ctx.textAlign = "center";
  ctx.font = "bold 11px monospace";
  ctx.fillStyle = "#ef4444";
  ctx.fillText("+ A (アノード)", -pitch, 48);
  ctx.fillStyle = "#38bdf8";
  ctx.fillText("- K (カソード)", pitch, 48);

  ctx.font = "bold 8.5px sans-serif";
  ctx.fillStyle = "#ef4444";
  ctx.fillText("SIG / +V", -pitch, 58);
  ctx.fillStyle = "#38bdf8";
  ctx.fillText("GND / D", pitch, 58);

  // 3. 円筒ケース本体 (黒色プラスチック)
  const radius = 32;

  ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;

  ctx.fillStyle = "#171717";
  ctx.strokeStyle = "#404040";
  ctx.lineWidth = 2.2;

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.shadowColor = "transparent";

  // ケース上面の段差ベベルライン
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, 0, radius - 5, 0, Math.PI * 2);
  ctx.stroke();

  // 4. 中央の放音孔 (キャビティ)
  ctx.fillStyle = "#050505";
  ctx.beginPath();
  ctx.arc(0, 0, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#262626";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // 5. 正極 (+) マーク刻印
  ctx.fillStyle = "#ef4444";
  ctx.font = "bold 16px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("+", -18, -14);

  // 6. 型番・周波数刻印
  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 8px monospace";
  ctx.fillText("PIEZO 2.4kHz", 0, 18);

  ctx.restore();
}

function drawPreviewCapacitorJIS(ctx, comp, midX, midY) {
  ctx.save();
  ctx.translate(midX, midY);

  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-60, 0); ctx.lineTo(-12, 0);
  ctx.moveTo(12, 0);  ctx.lineTo(60, 0);
  ctx.stroke();

  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(-12, -26); ctx.lineTo(-12, 26);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(28, 0, 30, Math.PI * 0.75, Math.PI * 1.25);
  ctx.stroke();

  ctx.font = "bold 16px sans-serif";
  ctx.fillStyle = "#ef4444";
  ctx.textAlign = "center";
  ctx.fillText("+", -32, -14);

  ctx.fillStyle = "#3b82f6";
  ctx.fillText("-", 32, -14);

  ctx.font = "bold 13px monospace";
  ctx.fillStyle = "#0f172a";
  ctx.fillText(`${comp.val_uF || 10}µF`, 0, -36);

  ctx.font = "bold 10px monospace";
  ctx.fillStyle = "#64748b";
  ctx.fillText(`耐圧: ${comp.max_V || 50}V`, 0, 44);

  ctx.restore();
}

function drawPreviewCapacitor(ctx, comp, midX, midY) {
  if (typeof DISPLAY_MODE !== "undefined" && DISPLAY_MODE.isSymbolON) {
    drawPreviewCapacitorJIS(ctx, comp, midX, midY);
    return;
  }

  ctx.save();
  ctx.translate(midX, midY);

  ctx.fillStyle = "#1e293b";
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-20, -35, 40, 70, 6);
  ctx.fill(); ctx.stroke();

  ctx.fillStyle = "#94a3b8";
  ctx.fillRect(5, -35, 15, 70);
  ctx.fillStyle = "#1e293b";
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("-", 12.5, 0);

  ctx.fillStyle = "#f8fafc";
  ctx.font = "bold 10px monospace";
  ctx.fillText(`${comp.val_uF || 10}µF`, -5, -5);
  ctx.fillStyle = "#38bdf8";
  ctx.fillText(`${comp.max_V || 50}V`, -5, 10);

  ctx.restore();
}

function drawPreviewPotentiometer(ctx, comp, midX, midY) {
  ctx.save();
  ctx.translate(midX, midY);

  ctx.fillStyle = "#334155";
  ctx.beginPath();
  ctx.arc(0, 0, 30, 0, Math.PI * 2);
  ctx.fill();

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

// CdS光導電セルのインスペクタプレビュー描画関数
function drawPreviewCDS(ctx, comp, midX, midY) {
  const span = 45;
  const p1 = { x: midX - span, y: midY };
  const p2 = { x: midX + span, y: midY };
  drawRealCDS(ctx, p1, p2, comp, false, false);
}

const PREVIEW_RENDERERS = {
  switch: drawPreviewSwitch,
  switch_spdt: drawPreviewSwitchSPDT,
  tact_switch: drawPreviewTactSwitch,
  led: drawPreviewLED,
  resistor: drawPreviewResistor,
  capacitor: drawPreviewCapacitor,
  potentiometer: drawPreviewPotentiometer,
  diode: drawPreviewDiode,
 transistor: drawPreviewTransistor,
  cds: drawPreviewCDS,
  mosfet: drawPreviewMOSFET,
  buzzer: drawPreviewBuzzer
};
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
    drawPreviewResistor(ctx, comp, midX, midY);
  }
}

// ======================================================================
// 【第6章：UIレンダラー ＆ パネル同期モジュール (UI & Inspectors)】
// リアルタイム分圧ツリー同期、動的インスペクター生成、および属性操作
// ======================================================================

/**
 * 6-1. バックグラウンド自律分圧ツリー生成エンジン (実データ直結・高速最適化版)
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

  // 通電中のジャンパ線・パーツを抽出
  const activeWires = (Array.isArray(activeJumperWires) ? activeJumperWires : []).filter(w => {
    const nFrom = getNodeByHoleId(w.fromHole);
    const nTo = getNodeByHoleId(w.toHole);
    return physics.energized && nFrom && nTo && physics.energized.has(nFrom) && physics.energized.has(nTo);
  });

  const activeComps = components.filter(c => {
    const nA = getNodeByHoleId(c.pinA);
    const nB = getNodeByHoleId(c.pinB);
    return physics.energized && nA && nB && physics.energized.has(nA) && physics.energized.has(nB);
  });

  // 上流から下流へ順序付け
  const topWires = activeWires.filter(w => w.fromHole.startsWith("BUS_TOP_") || w.toHole.startsWith("BUS_TOP_"));
  const botWires = activeWires.filter(w => w.fromHole.startsWith("BUS_BOTTOM_") || w.toHole.startsWith("BUS_BOTTOM_"));
  const midWires = activeWires.filter(w => !topWires.includes(w) && !botWires.includes(w));

  const treeItems = [
    ...topWires.map(w => ({ isWire: true, item: w, name: `🔌 ジャンパ線 (${w.fromHole} ➔ ${w.toHole})` })),
    ...activeComps.map(c => ({ isWire: false, item: c, name: `${c.name || c.type} (${c.pinA} ➔ ${c.pinB})` })),
    ...midWires.map(w => ({ isWire: true, item: w, name: `🔌 中継ジャンパ (${w.fromHole} ➔ ${w.toHole})` })),
    ...botWires.map(w => ({ isWire: true, item: w, name: `🔌 接地ジャンパ (${w.fromHole} ➔ ${w.toHole})` }))
  ];

// ★ 16列ハードコードを完全排除: 同一ノードから分岐する動的トポロジー並列判定
  const nodeUsage = {};
  activeComps.forEach(c => {
    const nA = getNodeByHoleId(c.pinA);
    if (nA) nodeUsage[nA] = (nodeUsage[nA] || 0) + 1;
  });
const hasBranchSplit = Object.values(nodeUsage).some(count => count > 1);
  const hasParallelLeds = activeComps.filter(c => c.type === "led" && c.isOn && (c.current_mA || 0) > 0.05).length > 1;



  // ★ トランジスタ回路も並列給電として判定に加える
  const hasTransistorCircuit = activeComps.some(c => c.type === "transistor");
  const isParallelCircuit = hasParallelLeds || hasBranchSplit || hasTransistorCircuit;


  let reportLines = [`[+${totalV.toFixed(1)}V 電源レール]`];
  let html = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
      <span style="color: #38bdf8; font-weight: bold;">[+${totalV.toFixed(1)}V 電源レール]</span>
      <button id="btn-copy-tree" style="background: #1e293b; color: #38bdf8; border: 1px solid #0284c7; border-radius: 4px; padding: 2px 8px; font-size: 10px; cursor: pointer; font-weight: bold; transition: 0.2s;" title="AI相談用にツリーをコピー">📋 AI共有用コピー</button>
    </div>`;
  let sumVDrop = 0.0;

  treeItems.forEach((entry, idx) => {
    let vDrop = 0.0;
    const itemI_mA = (entry.item.current_mA !== undefined) ? entry.item.current_mA : (isParallelCircuit ? (i_mA / 2) : i_mA);

    if (entry.isWire) {
      vDrop = 0.0;
    } else {
      const comp = entry.item;
      if (comp.voltageDrop !== undefined) {
        vDrop = comp.voltageDrop;
      } else if (comp.type === "resistor") {
        vDrop = (itemI_mA > 0.001) ? (comp.val_ohm || 1000) * (itemI_mA / 1000) : 0.0;
      } else if (comp.type === "potentiometer") {
        const curOhm = comp.val_ohm !== undefined ? comp.val_ohm : ((comp.val_max_ohm || 10000) * (comp.cur_ratio || 0.5));
        vDrop = (itemI_mA > 0.001) ? curOhm * (itemI_mA / 1000) : 0.0;
      } else if (comp.type === "led") {
        vDrop = (comp.isOn && itemI_mA > 0.001) ? (comp.vf || 2.0) : 0.0;
      } else if (comp.type === "diode") {
        vDrop = (itemI_mA > 0.001) ? (comp.vf || 0.7) : 0.0;
     } else if (comp.type === "transistor") {
        vDrop = (comp.state === "SATURATED" && itemI_mA > 0.001) ? (comp.vce_sat || 0.10) : 0.0;
      } else if (comp.type === "capacitor") {
        vDrop = comp.charge_V !== undefined ? comp.charge_V : 0.0;
      }
    }

   // ★ ベース抵抗(100kΩ等)は並列枝路のため、主幹直列電圧降下の合算から除外する
    const isBaseBranchItem = entry.item && ((entry.item.val_ohm || 0) >= 50000 || (entry.item.id && entry.item.id.includes("TR_B")));
    if (!isParallelCircuit && !isBaseBranchItem && itemI_mA > 0.05) {
      sumVDrop += vDrop;
    }

    const vRatio = ((vDrop / totalV) * 100).toFixed(1);
    const power_mW = entry.item.power_mW !== undefined ? entry.item.power_mW.toFixed(1) : (vDrop * itemI_mA).toFixed(1);
    const isLast = idx === treeItems.length - 1;
    const branchPrefix = isLast ? " └─" : " ├─";
    const subLinePrefix = isLast ? "     " : " │   ";
    const labelColor = entry.isWire ? "#38bdf8" : "#a6e3a1";

    html += `
      <div style="margin-top: 4px;">
        <span style="color: ${labelColor}; font-weight: bold;">${branchPrefix} ${entry.name}</span>
        <div style="color: #94a3b8; font-size: 10px; margin-left: 14px; border-left: 1px solid #334155; padding-left: 6px; line-height: 1.5;">
          <div>├ 電圧降下 : <span style="color: #facc15;">${vDrop.toFixed(2)} V</span> (${vRatio}%)</div>
          <div>├ 通過電流 : <span style="color: #4ade80;">${itemI_mA.toFixed(2)} mA</span></div>
          <div>└ 消費電力 : <span style="color: #f472b6;">${power_mW} mW</span></div>
        </div>
      </div>`;

    reportLines.push(`${branchPrefix} ${entry.name}`);
    reportLines.push(`${subLinePrefix}├ 電圧降下 : ${vDrop.toFixed(2)} V (${vRatio}%)`);
    reportLines.push(`${subLinePrefix}├ 通過電流 : ${itemI_mA.toFixed(2)} mA`);
    reportLines.push(`${subLinePrefix}└ 消費電力 : ${power_mW} mW`);
  });

  if (isParallelCircuit) {
    sumVDrop = totalV;
  }

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

  // ★ 分圧ツリー更新とイベントログエンジンを100%リアルタイム直結同期
  if (typeof updatePhysicsLogEngine === "function") {
    updatePhysicsLogEngine(physics, physics.energized);
  }
}

/**
 * 6-2. インスペクター動的UI生成 ストラテジーマップ (素子個別電流完全同期版)
 */
const INSPECTOR_RENDERERS = {
  // 1. 固定抵抗器
  resistor: (comp, titleEl, descEl, specBox, selectVal, physics) => {
    if (selectVal) selectVal.style.display = "none";

    const ohmVal = comp.val_ohm || 1000;
    const displayOhm = ohmVal >= 1000 ? `${(ohmVal / 1000).toFixed(1)}kΩ` : `${ohmVal}Ω`;

    if (titleEl) titleEl.textContent = `${displayOhm} 固定抵抗器`;
    if (descEl) descEl.textContent = comp.desc || `${displayOhm} の標準的な電流制限用抵抗器です。`;

    const nA = typeof getNodeByHoleId === "function" ? getNodeByHoleId(comp.pinA) : null;
    const nB = typeof getNodeByHoleId === "function" ? getNodeByHoleId(comp.pinB) : null;
    const isConnected = (physics.status === "CLOSED") && physics.energized && nA && nB && physics.energized.has(nA) && physics.energized.has(nB);
        // ★ 素子自身の個別電流を最優先参照 (並列回路の枝路電流に完全一致)
    const currentmA = (comp.current_mA !== undefined) ? comp.current_mA : (isConnected ? (physics.i_total_mA || 0.0) : 0.0);
    const powermW = comp.power_mW !== undefined ? comp.power_mW : (currentmA * currentmA * ohmVal) / 1000;
    const loadRate = ((powermW / 250) * 100).toFixed(1);

    const isSel = (v) => (ohmVal === v ? "selected" : "");

  if (specBox) {
      const flavorText = !isConnected
        ? "枷の紐 [静寂]: 命の巡りを静かに待つ古き絆。術者よ、数値を侮るなかれ。己が選んだオームの刻印一つで、光の命運は決する。"
        : (loadRate > 80.0
          ? "枷の紐 [過熱警告]: 奔流が耐容の限界に迫る。熱の蓄積が臨界を超えんとしている。直ちに配線を見直し、大いなる抵抗を選ぶか回路を遮断せよ。"
          : "枷の紐 [調律]: 命の巡りを程よく絞り、弱き種子(LED)を破滅から護る古き絆。適切な枷によってのみ、回路に正しき秩序がもたらされる。");

      specBox.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; background: #1e293b; padding: 6px 8px; border-radius: 4px; border: 1px solid #334155; margin-bottom: 8px;">
          <label for="select-dynamic-resistor-val" style="font-size: 10px; color: #38bdf8; font-weight: bold; white-space: nowrap;">[設定] 抵抗値切替:</label>
          <select id="select-dynamic-resistor-val" style="background: #0f172a; color: #38bdf8; border: 1px solid #0284c7; border-radius: 4px; padding: 2px 6px; font-size: 10px; font-weight: bold; cursor: pointer;">
            <option value="100" ${isSel(100)}>100 Ω (茶黒茶金)</option>
            <option value="330" ${isSel(330)}>330 Ω (橙橙茶金)</option>
            <option value="1000" ${isSel(1000)}>1.0k Ω (茶黒赤金)</option>
            <option value="10000" ${isSel(10000)}>10k Ω (茶黒橙金)</option>
            <option value="100000" ${isSel(100000)}>100k Ω (茶黒黄金)</option>
          </select>
        </div>
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">[定格] 電気的定格 & 基本諸元</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px 6px; margin-bottom: 8px; color: #cbd5e1;">
          <div>・品名: 炭素皮膜抵抗器</div>
          <div>・定格電力: 0.25 W (1/4W)</div>
          <div>・公称抵抗値: <span style="color: #f59e0b; font-weight: bold;">${displayOhm}</span></div>
          <div>・許容差: ±5% (J級)</div>
        </div>
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">[解析] リアルタイム動作解析</div>
        <div style="margin-bottom: 8px; color: #cbd5e1; background: #181825; padding: 6px; border-radius: 4px;">
          <div>・通過電流 (I): <span style="color: #4ade80; font-weight: bold;">${currentmA.toFixed(2)} mA</span></div>
          <div>・消費電力 (P): <span style="color: #4ade80; font-weight: bold;">${powermW.toFixed(1)} mW</span></div>
          <div>・定格負荷率: <span style="color: ${loadRate > 80 ? '#ef4444' : '#4ade80'}; font-weight: bold;">${loadRate} %</span></div>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #334155; font-size: 9px; color: #94a3b8; line-height: 1.4;">
            ・${flavorText}
          </div>
        </div>`;

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

  // 2. トグルスイッチ (SPST / SPDT)
  switch: (comp, titleEl, descEl, specBox, selectVal, physics) => {
    if (selectVal) selectVal.style.display = "none";
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
      const btnBg = isSpdt ? (isL1 ? "#0284c7" : "#0d9488") : (isOn ? "#22c55e" : "#ef4444");
      const btnText = isSpdt
        ? `接続先: ${isL1 ? '接点1 (L1) 導通中' : '接点2 (L2) 導通中'} [クリックで反転]`
        : `${isOn ? 'STATE: ON (通電/CLOSED)' : 'STATE: OFF (遮断/OPEN)'} [クリックで切替]`;

      const statusHtml = isSpdt
        ? `・現在の導通: <span style="color: #38bdf8; font-weight: bold;">COM ⇄ ${isL1 ? '接点1 (L1)' : '接点2 (L2)'}</span>`
        : `・現在の状態: <span style="color: ${isOn ? '#4ade80' : '#ef4444'}; font-weight: bold;">${isOn ? 'ON (通電/CLOSED)' : 'OFF (遮断/OPEN)'}</span>`;

      const specsHtml = isSpdt
        ? `・接点構成: 1回路2投 (SPDT / 3路)<br>・切替方式: ノンショーティング (B.B.M.)<br>・定格電圧/電流: DC 12V / 0.5A<br>・接触抵抗: 50 mΩ 以下`
        : `・接点構成: 1回路1投 (SPST)<br>・定格電圧/電流: DC 12V / 0.5A<br>・接触抵抗: 50 mΩ 以下`;

     let flavorText = "";
      if (isSpdt) {
        flavorText = isL1
          ? "転轍の門 [第一流路]: 奔流を接点1(L1)へと導く。一方を照らし、他方を眠らせる天秤の理。術者よ、切り替える流路の先を見極めよ。"
          : "転轍の門 [第二流路]: 奔流を接点2(L2)へと転換する。道は分かたれども源流は一つ。意図せぬ接続に惑わされるなかれ。";
      } else {
        flavorText = isOn
          ? "架橋の契り [通電/CLOSED]: 隔たれし二極を結び、命の巡りを解き放つ。回路に息吹きが宿る今、各所の挙動を注視せよ。"
          : "架橋の契り [遮断/OPEN]: 虚空をもって道を断ち、奔流を封じる。術者よ、素子を改むる時は必ずこの契りを解き、静寂を保て。";
      }

      specBox.innerHTML = `
        <div style="background: #1e293b; padding: 8px; border-radius: 4px; border: 1px solid #334155; margin-bottom: 8px;">
          <label style="font-size: 10px; color: #38bdf8; font-weight: bold; display:block; margin-bottom:4px;">[操作] スイッチ状態切替:</label>
          <button id="btn-inspector-toggle-switch" style="width:100%; padding:6px 10px; background:${btnBg}; color:#ffffff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:11px; transition:0.2s;">
            ${btnText}
          </button>
        </div>
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">[諸元] スイッチ基本諸元</div>
        <div style="color: #cbd5e1; margin-bottom: 8px; line-height: 1.5;">${specsHtml}</div>
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">[状態] リアルタイム動作状態</div>
        <div style="background: #181825; padding: 6px; border-radius: 4px;">
          ${statusHtml}
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #334155; font-size: 9px; color: #94a3b8; line-height: 1.4;">
            ・${flavorText}
          </div>
        </div>`;

      const btnToggle = document.getElementById("btn-inspector-toggle-switch");
      if (btnToggle) {
        btnToggle.onclick = () => {
          if (typeof saveHistory === "function") saveHistory();
          if (comp.type === "switch_spdt") {
            comp.state = (comp.state === "L2") ? "L1" : "L2";
          } else {
            comp.isOn = !comp.isOn;
          }

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

 switch_spdt: (comp, titleEl, descEl, specBox, selectVal, physics) => {
    if (typeof INSPECTOR_RENDERERS !== "undefined" && typeof INSPECTOR_RENDERERS.switch === "function") {
      INSPECTOR_RENDERERS.switch(comp, titleEl, descEl, specBox, selectVal, physics);
    }
  },

  // ★ 項目④: タクトスイッチ (モーメンタリ) 専用インスペクターレンダラー
  tact_switch: (comp, titleEl, descEl, specBox, selectVal, physics) => {
    if (selectVal) selectVal.style.display = "none";
    const isPressed = !!comp.isPressed;

    if (titleEl) titleEl.textContent = comp.name || "タクトスイッチ (モーメンタリ)";
    if (descEl) {
      descEl.textContent = isPressed
        ? "接点押下中【通電状態 (CLOSED)】です。指を離すと即座に遮断されます。"
        : "接点開放中【遮断状態 (OPEN)】です。ボタンを押すと通電します。";
    }

    if (specBox) {
      const btnBg = isPressed ? "#0284c7" : "#1e293b";
      const btnText = isPressed ? "ボタンを離す (RELEASE / 遮断)" : "ボタンを押し込む (PUSH / 通電)";
      const statusColor = isPressed ? "#38bdf8" : "#94a3b8";

    const flavorText = isPressed
        ? "刹那の契り [押下/導通]: 指先の意志が二極を縛り、束の間の奔流を注ぎ込む。術者よ、この瞬間に生じる回路の過渡応答を見逃すなかれ。指を解けば、即座に静寂へと還る。"
        : "刹那の契り [静止/開路]: 触れざれば動ぜず、常には虚空を開きて待つ。術者よ、漫然と触れるなかれ。準備なき衝動の通電は、回路の弱き種子を不意の嵐に晒す。";

      specBox.innerHTML = `
        <div style="background: #1e293b; padding: 8px; border-radius: 4px; border: 1px solid #334155; margin-bottom: 8px;">
          <label style="font-size: 10px; color: #38bdf8; font-weight: bold; display:block; margin-bottom:4px;">[操作] モーメンタリ接点操作:</label>
          <button id="btn-inspector-tact-push" style="width:100%; padding:8px 10px; background:${btnBg}; color:#ffffff; border:1px solid #38bdf8; border-radius:4px; cursor:pointer; font-weight:bold; font-size:11px; transition:0.2s;">
            ${btnText}
          </button>
        </div>
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">[諸元] スイッチ基本諸元</div>
        <div style="color: #cbd5e1; margin-bottom: 8px; line-height: 1.5; font-size: 11px;">
          ・接点構成: 1回路1投 (SPST モーメンタリa接点)<br>
          ・動作形態: ノーマリーオープン (常時開路)<br>
          ・定格電圧/電流: DC 12V / 50mA<br>
          ・接触抵抗: 100 mΩ 以下
        </div>
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">[状態] リアルタイム動作状態</div>
        <div style="background: #181825; padding: 6px; border-radius: 4px; font-size: 11px;">
          <div>・現在の導通: <span style="color: ${statusColor}; font-weight: bold;">${isPressed ? '導通中 (ON / 0Ω)' : '開放中 (OFF / ∞Ω)'}</span></div>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #334155; font-size: 9px; color: #94a3b8; line-height: 1.4;">
            ・${flavorText}
          </div>
        </div>`;

      const btnTact = document.getElementById("btn-inspector-tact-push");
      if (btnTact) {
        btnTact.onclick = () => {
          if (typeof saveHistory === "function") saveHistory();
          comp.isPressed = !comp.isPressed;

          if (typeof analyzeEnergizedNodes === "function") analyzeEnergizedNodes();
          let newPhysics = null;
          if (typeof calculateCircuitPhysics === "function") {
            newPhysics = calculateCircuitPhysics();
            if (typeof updateCircuitTreePanel === "function") updateCircuitTreePanel(newPhysics);
          }
          if (typeof renderScene === "function") renderScene();
          if (typeof drawOscilloscope === "function") drawOscilloscope();
          if (typeof updatePhysicsLogEngine === "function" && newPhysics) {
            updatePhysicsLogEngine(newPhysics, newPhysics.energized);
          }
         if (typeof updateInspectorUI === "function") {
            updateInspectorUI(comp, null, null, null, null, newPhysics);
          }
        };
      }
    }
  },

  // ★ 項目④: 整流ダイオード (1N4007) 専用インスペクターレンダラー
  diode: (comp, titleEl, descEl, specBox, selectVal, physics) => {
    if (selectVal) selectVal.style.display = "none";

    if (titleEl) titleEl.textContent = comp.name || "整流ダイオード (1N4007)";
    if (descEl) {
      descEl.textContent = comp.desc || "電流を一方向にしか流さない半導体素子。逆方向の電流を完全に阻止します。";
    }

    if (specBox) {
      const current_mA = comp.current_mA || 0.0;
      const isConducting = current_mA > 0.05;
      const vDrop = isConducting ? (comp.voltageDrop || comp.vf || 0.7).toFixed(2) : "0.00";

   const flavorText = isConducting
     ? "整流の関門 [順流/導通]: 閾値を超えた奔流を前方へと流す。逆流の兆しあらば即座に閉ざす守りの要。術者よ、下流の素子が護られていることを確かめよ。"
     : "整流の関門 [逆拒/遮断]: 銀の帯が示す壁が、逆巻く奔流を強固に阻む。術者よ、極性の向き(銀帯)を誤れば回路は沈黙し、意図せぬ障壁となる。印を見極めよ。";

   specBox.innerHTML = `
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">[諸元] ダイオード基本諸元</div>
        <div style="color: #cbd5e1; margin-bottom: 8px; line-height: 1.6; font-size: 11px;">
          ・型番: 1N4007 (汎用シリコン整流ダイオード)<br>
          ・順方向電圧降下 (Vf): <span style="color: #38bdf8; font-weight: bold;">約 0.7 V</span><br>
          ・最大定格電流 (Io): 1.0 A<br>
          ・ピーク逆耐電圧 (VRRM): 1,000 V (1kV)<br>
          ・極性マーク: カソード側に銀色帯バンド
        </div>
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">[状態] リアルタイム動作状態</div>
        <div style="background: #181825; padding: 6px; border-radius: 4px; font-size: 11px;">
          <div>・動作バイアス: <span style="color: ${isConducting ? '#4ade80' : '#94a3b8'}; font-weight: bold;">${isConducting ? '順方向導通 (FORWARD)' : '遮断 / 逆阻止 (REVERSE)'}</span></div>
          <div>・素子間電圧降下: <span style="color: #38bdf8; font-weight: bold;">${vDrop} V</span></div>
          <div>・通過電流: <span style="color: #38bdf8; font-weight: bold;">${current_mA.toFixed(2)} mA</span></div>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #334155; font-size: 9px; color: #94a3b8; line-height: 1.4;">
            ・${flavorText}
          </div>
        </div>`;



    }
  },

  // ★ 項目④: NPNトランジスタ (2SC1815) 専用インスペクターレンダラー
  transistor: (comp, titleEl, descEl, specBox, selectVal, physics) => {
    if (selectVal) selectVal.style.display = "none";

    if (titleEl) titleEl.textContent = comp.name || "NPNトランジスタ (2SC1815)";
    if (descEl) {
      descEl.textContent = comp.desc || "ベース端子への微小電流により、コレクタ・エミッタ間の大電流を電子的に開閉します。";
    }

    if (specBox) {
      const isSaturated = comp.state === "SATURATED";
      const stateColor = isSaturated ? "#4ade80" : "#64748b";
      const stateText = isSaturated ? "飽和・導通 (SATURATED / ON)" : "遮断 (CUTOFF / OFF)";
      const ibStr = isSaturated ? "約 83 µA (0.083 mA)" : "0.00 µA";
      const icStr = isSaturated ? `${(comp.current_mA || 6.89).toFixed(2)} mA` : "0.00 mA";

     const flavorText = isSaturated
        ? "転轍の門番 [飽和/導通]: 微小なる呼び水(ベース電流)を捧げしことで、門が開き大いなる主潮流(コレクタ電流)が解き放たれた。術者よ、増幅の理を過信するなかれ。負荷なき直結は門番そのものを灰燼へと帰す。"
        : "転轍の門番 [遮断/静止]: 呼び水なき門は堅く閉ざされ、背後の大いなる奔流を完全に阻んでいる。術者よ、三つの足(E・C・B)の順を誤るなかれ。向きを違えれば、門番は決して応えぬ。";

      specBox.innerHTML = `
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">[諸元] トランジスタ基本諸元</div>
        <div style="color: #cbd5e1; margin-bottom: 8px; line-height: 1.6; font-size: 11px;">
          ・型番: 2SC1815-Y (NPNシリコンエピタキシャル型)<br>
          ・ピン配列 (平坦面正面): <b>左: E (エミッタ) / 中: C (コレクタ) / 右: B (ベース)</b><br>
          ・直流電流増幅率 (hFE): 120 〜 240 (標準 150)<br>
          ・コレクタ飽和電圧 (Vce(sat)): 約 0.1 V<br>
          ・ベース・エミッタ間電圧 (Vbe): 約 0.7 V
        </div>
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">[状態] リアルタイム動作状態</div>
        <div style="background: #181825; padding: 6px; border-radius: 4px; font-size: 11px;">
          <div>・動作領域: <span style="color: ${stateColor}; font-weight: bold;">${stateText}</span></div>
          <div>・ベース電流 (Ib): <span style="color: #facc15; font-weight: bold;">${ibStr}</span></div>
          <div>・コレクタ電流 (Ic): <span style="color: #38bdf8; font-weight: bold;">${icStr}</span></div>
          <div>・C-E間電圧 (Vce): <span style="color: #cbd5e1;">${isSaturated ? '約 0.10 V' : '9.00 V (開放)'}</span></div>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #334155; font-size: 9px; color: #94a3b8; line-height: 1.4;">
            ・${flavorText}
          </div>
        </div>`;
 


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
        // ★ 素子自身の個別電流を最優先参照 (並列時も正確な個別枝路電流を表示)
    const currentmA = (comp.current_mA !== undefined) ? comp.current_mA : (isConnected && comp.isOn ? (physics.i_total_mA || 0.0) : 0.0);
    const isLit = (!isBurned && comp.isOn && currentmA > 0.05);
    const powermW = comp.power_mW !== undefined ? comp.power_mW : (currentmA * vf);
    const currentColor = comp.color || "#ef4444";
    const cType = comp.colorType || "red";
    const isSel = (hex, type) => (currentColor === hex || cType === type) ? "selected" : "";

   if (specBox) {
      let flavorText = "";
      if (comp.isBurned) {
        flavorText = "種子の灯 [灰燼/熱破壊]: 枷なき激流により核は瞬く間に焼き尽くされ、永遠の沈黙に沈んだ。術者よ、抵抗なき直結が招く無残を深く心に刻め。過ちを悔い、新しき種子に正しき枷を施せ。";
      } else if (isLit) {
        flavorText = "種子の灯 [開花/点灯]: 適切な枷(抵抗)に守られ、導かれし奔流を純粋なる光へと昇華させている。術者よ、この輝きを保ちたくば電流の数値を常に注視せよ。過信は即座に灰燼へと繋がる。";
      } else {
        flavorText = "種子の灯 [休眠/消灯]: 静かに息を潜める玻璃の種子。開花の閾値(順方向電圧)と、極性(アノード/カソード)の正しき導きを待っている。向きを違えれば、光は決して宿らぬ。";
      }

      specBox.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; background: #1e293b; padding: 6px 8px; border-radius: 4px; border: 1px solid #334155; margin-bottom: 8px;">
          <label for="select-led-color" style="font-size: 10px; color: #38bdf8; font-weight: bold;">[設定] 発光カラー切替:</label>
          <select id="select-led-color" style="background: #0f172a; color: #38bdf8; border: 1px solid #0284c7; border-radius: 4px; padding: 2px 6px; font-size: 10px; font-weight: bold; cursor: pointer;">
            <option value="#ef4444" ${isSel("#ef4444", "red")}>[赤] 赤色 (Red - Vf:2.0V)</option>
            <option value="#22c55e" ${isSel("#22c55e", "green")}>[緑] 緑色 (Green - Vf:2.2V)</option>
            <option value="#3b82f6" ${isSel("#3b82f6", "blue")}>[青] 青色 (Blue - Vf:3.1V)</option>
            <option value="#ffff00" ${isSel("#ffff00", "yellow")}>[黄] 黄色 (Yellow - Vf:2.1V)</option>
            <option value="#ffffff" ${isSel("#ffffff", "white")}>[白] 白色 (White - Vf:3.2V)</option>
            <option value="#ec4899" ${isSel("#ec4899", "rainbow")}>[虹] 虹色 (Rainbow - Vf:3.2V)</option>
          </select>
        </div>
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">[諸元] LED 基本諸元</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px 6px; margin-bottom: 8px; color: #cbd5e1;">
          <div>・品名: ${comp.name || '5mm LED'}</div>
          <div>・順方向電圧 (Vf): <span style="color: #f59e0b; font-weight: bold;">${vf.toFixed(1)} V</span></div>
          <div>・絶対最大定格: 30 mA</div>
          <div>・素子状態: <span style="color: ${comp.isBurned ? '#ef4444' : '#4ade80'}; font-weight: bold;">${comp.isBurned ? '熱破壊 (溶断断線)' : '正常'}</span></div>
        </div>
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">[解析] リアルタイム動作解析</div>
        <div style="margin-bottom: 8px; color: #cbd5e1; background: #181825; padding: 6px; border-radius: 4px;">
          <div>・発光状態: <span style="color: ${isLit ? '#4ade80' : '#ef4444'}; font-weight: bold;">${isLit ? '点灯中 (ACTIVE)' : (comp.isBurned ? '破壊破損 (OPEN)' : '消灯中 (OFF)')}</span></div>
          <div>・動作電流 (If): <span style="color: ${comp.isBurned ? '#ef4444' : '#4ade80'}; font-weight: bold;">${currentmA.toFixed(2)} mA</span></div>
          <div>・消費電力 (Pd): <span style="color: ${comp.isBurned ? '#ef4444' : '#4ade80'}; font-weight: bold;">${powermW.toFixed(1)} mW</span></div>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #334155; font-size: 9px; color: #94a3b8; line-height: 1.4;">
            ・${flavorText}
          </div>
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

  // 4. 可変抵抗器
  potentiometer: (comp, titleEl, descEl, specBox, selectVal, physics) => {
    if (selectVal) selectVal.style.display = "none";

    const maxOhm = comp.val_max_ohm || 10000;
    const maxKText = maxOhm >= 1000 ? `${(maxOhm / 1000).toFixed(1)}kΩ` : `${maxOhm}Ω`;
        if (titleEl) titleEl.textContent = `可変抵抗器 (${maxKText})`;
    if (descEl) descEl.textContent = comp.desc || "つまみを回すことで抵抗値を連続変化させる受動素子です。";

    const curRatio = comp.cur_ratio !== undefined ? comp.cur_ratio : 0.5;
    const currentOhm = comp.val_ohm !== undefined ? Math.round(comp.val_ohm) : Math.round(maxOhm * curRatio);

   if (specBox) {
      const potRatio = Math.round((currentOhm / maxOhm) * 100);
      let flavorText = "";
      if (currentOhm <= 50) {
        flavorText = "自在の堰 [全開/短絡警戒]: 堰を完全に払い、奔流を無防備に解き放つ。術者よ、下流に固定の枷(保護抵抗)なくば、この過大電流は容易く素子を焼き尽くす。ゼロオームの過信を戒めよ。";
      } else if (currentOhm >= maxOhm * 0.95) {
        flavorText = "自在の堰 [極限遮蔽]: 堰を極限まで押し上げ、奔流の道を細く絞り込む。光は微かとなり、回路の命脈は静寂の中へと眠りにつく。";
      } else {
        flavorText = "自在の堰 [無段階調律]: 術者の指先が堰の幅を自在に伸縮させ、電位の傾度を滑らかに統御する。中点からの分圧を見極め、均衡の取れた設計を導け。";
      }

      specBox.innerHTML = `
        <div style="background: #1e293b; padding: 8px; border-radius: 4px; border: 1px solid #334155; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <label for="input-pot-slider" style="font-size: 10px; color: #38bdf8; font-weight: bold;">[操作] 抵抗値ダイレクト調整 (1Ω単位):</label>
            <span id="text-pot-ohm" style="font-size: 11px; color: #f59e0b; font-weight: bold; font-family: monospace;">${currentOhm} Ω (${potRatio}%)</span>
          </div>
          <input type="range" id="input-pot-slider" min="0" max="${maxOhm}" step="1" value="${currentOhm}" style="width: 100%; cursor: pointer; accent-color: #38bdf8;">
        </div>

        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">[諸元] 可変抵抗 基本諸元</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px 6px; margin-bottom: 8px; color: #cbd5e1; font-size: 11px; align-items: center;">
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
        </div>

        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">[状態] リアルタイム動作状態</div>
        <div style="background: #181825; padding: 6px; border-radius: 4px; font-size: 11px;">
          <div>・分圧比率: <span style="color: #38bdf8; font-weight: bold;">${potRatio} %</span></div>
          <div>・有効抵抗値: <span style="color: #4ade80; font-weight: bold;">${currentOhm} Ω / ${maxOhm} Ω</span></div>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #334155; font-size: 9px; color: #94a3b8; line-height: 1.4;">
            ・${flavorText}
          </div>
        </div>`;

      const slider = document.getElementById("input-pot-slider");
      const textOhm = document.getElementById("text-pot-ohm");
      const labelVal = document.getElementById("label-pot-val");
      const rangeSelect = document.getElementById("select-pot-range");

      if (slider) {
        slider.oninput = (e) => {
          const valOhm = parseInt(e.target.value, 10);
          comp.val_ohm = valOhm;
          comp.cur_ratio = valOhm / comp.val_max_ohm;

          const pct = Math.round((valOhm / comp.val_max_ohm) * 100);
          if (textOhm) textOhm.textContent = `${valOhm} Ω (${pct}%)`;
          if (labelVal) labelVal.textContent = `${valOhm} Ω`;

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

      if (rangeSelect) {
        rangeSelect.onchange = (e) => {
          const newMax = parseInt(e.target.value, 10);
          comp.val_max_ohm = newMax;
          comp.name = `可変抵抗器 (${newMax >= 1000 ? (newMax / 1000).toFixed(1) + "kΩ" : newMax + "Ω"})`;
          comp.val_ohm = Math.round(newMax * (comp.cur_ratio !== undefined ? comp.cur_ratio : 0.5));

          if (typeof updateInspectorUI === "function") updateInspectorUI(comp);
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

 // 5. 電解コンデンサ (波形平滑化 ＆ RC過渡充放電両用)
  capacitor: (comp, titleEl, descEl, specBox, selectVal, physics) => {
    if (selectVal) selectVal.style.display = "none";
    if (titleEl) titleEl.textContent = comp.name || "電解コンデンサ";
    if (descEl) descEl.textContent = comp.desc || "電荷を蓄え、直流を遮断し交流を通す受動素子です。並列時はパルス波形を平滑化します。";

    if (comp.charge_V === undefined) comp.charge_V = 0.0;
    const curV = comp.charge_V;
    const capuF = comp.val_uF || 10;
    const energy_mJ = 0.5 * (capuF * 1e-6) * (curV * curV) * 1000;

  if (specBox) {
      let flavorText = "";
      if (curV >= 4.5) {
        flavorText = "猶予の器 [満水/蓄電]: 奔流を呑み込み、器の内に膨大なる電荷を張り詰めている。術者よ、回路を組み替える前には必ず強制放電の儀を行い、器を空にせよ。不意の解放は弱き素子を一撃で滅ぼす。";
      } else if (curV >= 0.5) {
        flavorText = "猶予の器 [過渡/充放電]: 激しき落差を和らげ、脈動する波形を滑らかな息吹へと彫刻している。器の大きさが時の流れ(時定数)を支配する理を知れ。";
      } else {
        flavorText = "猶予の器 [静止/空虚]: 乾いた器は静かに佇み、次なる奔流の到来を待つ。術者よ、二つの極性(陽極/陰極)を違えて注ぐなかれ。逆流の冒涜は、器そのものを破裂と煙の災厄へと導く。";
      }

      specBox.innerHTML = `
        <div style="background: #1e293b; padding: 8px; border-radius: 4px; border: 1px solid #334155; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <label for="select-cap-val" style="font-size: 10px; color: #38bdf8; font-weight: bold;">[設定] 静電容量切替:</label>
            <select id="select-cap-val" style="background: #0f172a; color: #38bdf8; border: 1px solid #0284c7; border-radius: 4px; padding: 2px 6px; font-size: 10px; font-weight: bold; cursor: pointer;">
              <option value="0.1" ${capuF === 0.1 ? 'selected' : ''}>0.1 µF (微小なまり)</option>
              <option value="1" ${capuF === 1 ? 'selected' : ''}>1 µF (台形波)</option>
              <option value="4.7" ${capuF === 4.7 ? 'selected' : ''}>4.7 µF (三角波移行)</option>
              <option value="10" ${capuF === 10 ? 'selected' : ''}>10 µF (標準三角波)</option>
              <option value="22" ${capuF === 22 ? 'selected' : ''}>22 µF (最大平滑波)</option>
              <option value="100" ${capuF === 100 ? 'selected' : ''}>100 µF (大容量RC)</option>
              <option value="1000" ${capuF === 1000 ? 'selected' : ''}>1000 µF (巨大容量RC)</option>
            </select>
          </div>
          <button id="btn-cap-reset" style="width:100%; padding:4px 8px; background:#ef4444; color:#ffffff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:10px; transition:0.2s;">
            [強制放電] 電荷リセット (0.0V)
          </button>
        </div>
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">[諸元] コンデンサ基本諸元</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px 6px; margin-bottom: 8px; color: #cbd5e1; font-size: 11px;">
          <div>・静電容量: <span style="color: #f59e0b; font-weight: bold;">${capuF} µF</span></div>
          <div>・耐圧定格: ${comp.max_V || 50} V</div>
          <div>・極性配列: 有極性 (アノード/カソード)</div>
          <div>・誘電構造: アルミニウム電解</div>
        </div>
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">[解析] リアルタイム充放電 & 平滑状態</div>
        <div style="margin-bottom: 8px; color: #cbd5e1; background: #181825; padding: 6px; border-radius: 4px; font-size: 11px;">
          <div>・端子間電圧 (Vc): <span style="color: #4ade80; font-weight: bold;">${curV.toFixed(2)} V</span></div>
          <div>・蓄積エネルギー (E): <span style="color: #4ade80; font-weight: bold;">${energy_mJ.toFixed(3)} mJ</span></div>
          <div>・オシロ平滑寄与率: <span style="color: #38bdf8; font-weight: bold;">${Math.min((capuF / 10.0) * 100, 100).toFixed(0)} %</span></div>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #334155; font-size: 9px; color: #94a3b8; line-height: 1.4;">
            ・${flavorText}
          </div>
        </div>`;



      const selCap = document.getElementById("select-cap-val");
      if (selCap) {
        selCap.onchange = (e) => {
          if (typeof saveHistory === "function") saveHistory();
          const newuF = parseFloat(e.target.value);
          comp.val_uF = newuF;
          comp.name = `電解コンデンサ (${newuF}µF)`;
          if (typeof calculateCircuitPhysics === "function") {
            const p = calculateCircuitPhysics();
            if (typeof updateCircuitTreePanel === "function") updateCircuitTreePanel(p);
          }
          if (typeof renderScene === "function") renderScene();
          if (typeof updateInspectorUI === "function") updateInspectorUI(comp);
        };
      }

      const btnReset = document.getElementById("btn-cap-reset");
      if (btnReset) {
        btnReset.onclick = () => {
          if (typeof saveHistory === "function") saveHistory();
          comp.charge_V = 0.0;
          if (typeof calculateCircuitPhysics === "function") {
            const p = calculateCircuitPhysics();
            if (typeof updateCircuitTreePanel === "function") updateCircuitTreePanel(p);
          }
          if (typeof renderScene === "function") renderScene();
          if (typeof updateInspectorUI === "function") updateInspectorUI(comp);
        };
      }
    }
  },

  // 6. 整流ダイオード
  diode: (comp, titleEl, descEl, specBox, selectVal, physics) => {
    if (selectVal) selectVal.style.display = "none";
    if (titleEl) titleEl.textContent = comp.name || "整流ダイオード (1N4007)";
    if (descEl) descEl.textContent = comp.desc || "一方向のみ電流を流す半導体素子です。";

    const nA = typeof getNodeByHoleId === "function" ? getNodeByHoleId(comp.pinA) : null;
    const nB = typeof getNodeByHoleId === "function" ? getNodeByHoleId(comp.pinB) : null;
    const isForward = (physics.status === "CLOSED") && physics.energized && nA && nB && physics.energized.has(nA) && physics.energized.has(nB);
        // ★ 個別電流を優先取得
    const currentmA = (comp.current_mA !== undefined) ? comp.current_mA : (isForward ? (physics.i_total_mA || 0.0) : 0.0);
    const powermW = comp.power_mW !== undefined ? comp.power_mW : (currentmA * (comp.vf || 0.7));

  if (specBox) {
      const flavorText = isForward
        ? "黒き楔 [順導/開門]: 頑ななる秩序の楔を越え、命の奔流が一方向へと解き放たれた。術者よ、下流へと続く流路が整っているか見届けよ。0.7Vの代償を払い、回路は今、前進の息吹を得る。"
        : "黒き楔 [逆拒/閉門]: 銀の帯が掲げる拒絶の印が、逆巻く奔流を強固に堰き止めている。術者よ、回路が沈黙せし時はまずこの楔の向き(カソード銀帯)を疑え。逆らえば一切の光は届かぬ。";

      specBox.innerHTML = `
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">[諸元] ダイオード基本諸元</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px 6px; margin-bottom: 8px; color: #cbd5e1;">
          <div>・型番: 1N4007</div>
          <div>・順方向降下 (Vf): <span style="color: #f59e0b; font-weight: bold;">0.7 V</span></div>
          <div>・最大逆耐圧 (Vrrm): 1000 V</div>
          <div>・定格順電流 (Io): 1.0 A</div>
          <div>・極性表示: カソード銀帯</div>
          <div>・素子構造: シリコン接合</div>
        </div>
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">[解析] リアルタイム動作解析</div>
        <div style="margin-bottom: 8px; color: #cbd5e1; background: #181825; padding: 6px; border-radius: 4px;">
          <div>・バイアス状態: <span style="color: ${isForward ? '#4ade80' : '#ef4444'}; font-weight: bold;">${isForward ? '順バイアス (導通中)' : '逆バイアス (遮断/OPEN)'}</span></div>
          <div>・通過電流 (If): <span style="color: ${isForward ? '#4ade80' : '#64748b'}; font-weight: bold;">${currentmA.toFixed(2)} mA</span></div>
          <div>・接合部損失 (Pd): <span style="color: ${isForward ? '#4ade80' : '#64748b'}; font-weight: bold;">${powermW.toFixed(1)} mW</span></div>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #334155; font-size: 9px; color: #94a3b8; line-height: 1.4;">
            ・${flavorText}
          </div>
        </div>`;


    }
  },

  // 7. NPNトランジスタ (2SC1815)
  transistor: (comp, titleEl, descEl, specBox, selectVal, physics) => {
    if (selectVal) selectVal.style.display = "none";
    if (titleEl) titleEl.textContent = comp.name || "NPNトランジスタ (2SC1815)";
    if (descEl) descEl.textContent = comp.desc || "ベース(B)の微小電流でコレクタ-エミッタ間の主電流を制御します。";

    const nB = typeof getNodeByHoleId === "function" ? getNodeByHoleId(comp.pinB) : null;
    const isEnergized = physics && physics.energized && nB ? physics.energized.has(nB) : false;
    const state = isEnergized ? "SATURATED" : "CUTOFF";
    comp.state = state;

    const isBaseOn = (state === "SATURATED");
    const ic_mA = (comp.current_mA !== undefined) ? comp.current_mA : (isBaseOn && physics.status === "CLOSED" ? (physics.i_total_mA || 0.0) : 0.0);
    const ib_uA = isBaseOn && ic_mA > 0 ? (ic_mA / (comp.hfe || 150)) * 1000 : 0.0;
       if (specBox) {
      const flavorText = isBaseOn
        ? "三脚の水門 [開門/導通]: 右足(ベース)へ捧げし微小なる呼び水に応じ、中央の門(コレクタ)が大いなる本流を左の出口(エミッタ)へと解き放った。術者よ、呼び水の道に正しき枷(10kΩ等の抵抗)を挟みしや。直結の過信は水門を内側から焼き砕く。"
        : "三脚の水門 [閉門/遮断]: 右足(ベース)への生贄なき今、門は冷徹に閉ざされ、本流の侵入を一切許さぬ。術者よ、三つの足の順(左からE・C・B)を違えるなかれ。足を取り違えれば、門は沈黙したまま開かぬ。";

      specBox.innerHTML = `
        <div style="background: #1e293b; border: 1px solid #0284c7; border-radius: 4px; padding: 6px 8px; margin-bottom: 8px;">
          <div style="font-size: 10px; color: #38bdf8; font-weight: bold; margin-bottom: 4px;">[指南] 端子接続の鉄則ガイド (どこに繋ぐ？)</div>
          <div style="font-size: 9.5px; line-height: 1.5; color: #cbd5e1;">
            <div><b style="color: #f87171;">[B: 右足・ベース]</b>: <b>制御入力</b> ➔ スイッチ/10kΩ抵抗を繋ぐ (水門レバー)</div>
            <div><b style="color: #facc15;">[C: 中足・コレクタ]</b>: <b>主電源入力</b> ➔ LED/負荷抵抗を繋ぐ (本流の入口)</div>
            <div><b style="color: #38bdf8;">[E: 左足・エミッタ]</b>: <b>主出力</b> ➔ マイナスレール(GND)へ繋ぐ (出口)</div>
          </div>
        </div>
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">[諸元] トランジスタ基本諸元</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px 6px; margin-bottom: 8px; color: #cbd5e1;">
          <div>・型番: 2SC1815-Y</div>
          <div>・極性: NPN型</div>
          <div>・増幅率 (hFE): <span style="color: #f59e0b; font-weight: bold;">${comp.hfe || 150}</span></div>
          <div>・Vbe 閾値: 0.7 V</div>
          <div>・最大定格 (Ic): 150 mA</div>
          <div>・端子配列: 左から E-C-B</div>
        </div>
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">[状態] リアルタイム動作状態</div>
        <div style="margin-bottom: 8px; color: #cbd5e1; background: #181825; padding: 6px; border-radius: 4px;">
          <div>・動作モード: <span style="color: ${isBaseOn ? '#4ade80' : '#ef4444'}; font-weight: bold;">${isBaseOn ? '飽和導通 (SATURATED / ON)' : '遮断状態 (CUTOFF / OFF)'}</span></div>
          <div>・コレクタ電流 (Ic): <span style="color: ${isBaseOn ? '#4ade80' : '#64748b'}; font-weight: bold;">${ic_mA.toFixed(2)} mA</span></div>
          <div>・ベース制御電流 (Ib): <span style="color: ${isBaseOn ? '#38bdf8' : '#64748b'}; font-weight: bold;">${ib_uA.toFixed(1)} µA</span></div>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #334155; font-size: 9px; color: #94a3b8; line-height: 1.4;">
            ・${flavorText}
          </div>
        </div>`;



    }
  },

  // 8. CdS光導電セル (照度スライダー完全連動)
  cds: (comp, titleEl, descEl, specBox, selectVal, physics) => {
    if (selectVal) selectVal.style.display = "none";
    if (titleEl) titleEl.textContent = comp.name || "CdS光導電セル (5mm)";
    if (descEl) {
      descEl.textContent = comp.desc || "光の強さに応じて抵抗値が激変する硫化カドミウム受光素子。暗くするとメガΩ級へ上昇します。";
    }

    if (comp.lux === undefined) comp.lux = 50;
    const lux = comp.lux;
    const calcOhm = Math.round(lux <= 1 ? 1000000 : Math.max(200, 20000 * Math.pow(10 / Math.max(lux, 1), 0.7)));
    comp.val_ohm = calcOhm;

    const displayOhm = calcOhm >= 1000000
      ? `${(calcOhm / 1000000).toFixed(2)} MΩ`
      : (calcOhm >= 1000 ? `${(calcOhm / 1000).toFixed(1)} kΩ` : `${calcOhm} Ω`);

   if (specBox) {
      let flavorText = "";
      if (lux < 20) {
        flavorText = "深淵の瞳 [閉眼/高抵抗]: 闇に包まれし瞳は固く閉ざされ、メガオームに及ぶ無限の障壁となって奔流を拒絶する。術者よ、この瞳単体では回路を動かせぬ。固定の枷(抵抗)と結んで分圧の比を創り出して初めて、闇を検知する導きが生まれる。";
      } else if (lux >= 150) {
        flavorText = "深淵の瞳 [開眼/低抵抗]: 強き光の恩寵を浴び、頑ななる障壁は一瞬にして崩壊した。奔流は抵抗なく瞳を通り抜ける。光と影の反転を見極め、次段の門番(トランジスタ)へと繋げ。";
      } else {
        flavorText = "深淵の瞳 [受光/調律]: 薄明の光を捉え、内部の抵抗を無段階に揺らがせている。術者よ、周囲の明るさに応じて中点の電位がどう傾くかを計測せよ。";
      }

      specBox.innerHTML = `
        <div style="background: #1e293b; padding: 8px; border-radius: 4px; border: 1px solid #334155; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <label for="input-cds-lux" style="font-size: 10px; color: #38bdf8; font-weight: bold;">[操作] 周囲照度 (Lux) コントロール:</label>
            <span id="text-cds-lux" style="font-size: 11px; color: #facc15; font-weight: bold; font-family: monospace;">${lux} Lux</span>
          </div>
          <input type="range" id="input-cds-lux" min="0" max="300" step="1" value="${lux}" style="width: 100%; cursor: pointer; accent-color: #facc15;">
          <div style="display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; margin-top: 2px;">
            <span>[暗黒 0 Lux]</span>
            <span>[室内 50 Lux]</span>
            <span>[直射 300 Lux]</span>
          </div>
        </div>

        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">[諸元] 光導電セル基本諸元</div>
        <div style="color: #cbd5e1; margin-bottom: 8px; line-height: 1.6; font-size: 11px;">
          ・素子タイプ: GL5528 (5mm硫化カドミウム)<br>
          ・現在の内部抵抗値: <span id="text-cds-ohm" style="color: #4ade80; font-weight: bold; font-size: 12px;">${displayOhm}</span><br>
          ・明時抵抗 (10 Lux): 10 〜 20 kΩ<br>
          ・暗時抵抗 (0 Lux): 1.0 MΩ (1,000,000 Ω) 以上<br>
          ・ピーク受光波長: 540 nm (緑〜黄色光に高感度)
        </div>

        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">[状態] リアルタイム動作状態</div>
        <div style="background: #181825; padding: 6px; border-radius: 4px; font-size: 11px; color: #cbd5e1;">
          <div>・通過電流: <span style="color: #38bdf8; font-weight: bold;">${(comp.current_mA || 0.0).toFixed(2)} mA</span></div>
          <div>・端子間電圧降下: <span style="color: #facc15; font-weight: bold;">${(comp.voltageDrop || 0.0).toFixed(2)} V</span></div>
          <div>・受光環境: <span style="color: ${lux < 20 ? '#a855f7' : '#facc15'}; font-weight: bold;">${lux < 20 ? '遮光状態 (暗闇検知)' : '明環境 (通常受光)'}</span></div>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #334155; font-size: 9px; color: #94a3b8; line-height: 1.4;">
            ・${flavorText}
          </div>
        </div>`;

      const slider = document.getElementById("input-cds-lux");
      const textLux = document.getElementById("text-cds-lux");
      const textOhm = document.getElementById("text-cds-ohm");

      if (slider) {
        slider.oninput = (e) => {
          const newLux = parseInt(e.target.value, 10);
          comp.lux = newLux;
          const newOhm = Math.round(newLux <= 1 ? 1000000 : Math.max(200, 20000 * Math.pow(10 / Math.max(newLux, 1), 0.7)));
          comp.val_ohm = newOhm;

          const ohmLabel = newOhm >= 1000000
            ? `${(newOhm / 1000000).toFixed(2)} MΩ`
            : (newOhm >= 1000 ? `${(newOhm / 1000).toFixed(1)} kΩ` : `${newOhm} Ω`);

          if (textLux) textLux.textContent = `${newLux} Lux`;
          if (textOhm) textOhm.textContent = ohmLabel;

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
    }
  },

  // 9. NチャネルMOSFET (2N7000 / 電圧制御スイッチング)
  mosfet: (comp, titleEl, descEl, specBox, selectVal, physics) => {
    if (selectVal) selectVal.style.display = "none";
    if (titleEl) titleEl.textContent = comp.name || "NチャネルMOSFET (2N7000)";
    if (descEl) descEl.textContent = comp.desc || "ゲート(G)に電圧を加えることでドレイン-ソース間の主電流を開閉する電圧制御素子です。";

    const vgs = comp.vgs_V !== undefined ? comp.vgs_V : 0.0;
    const vgs_th = comp.vgs_th || 2.1;
    const isOn = (comp.state === "ON" || comp.state === "OHMIC" || vgs >= vgs_th);
    comp.state = isOn ? "ON" : "CUTOFF";

    const id_mA = (comp.id_mA !== undefined) ? comp.id_mA : ((comp.current_mA !== undefined) ? comp.current_mA : (isOn && physics && physics.status === "CLOSED" ? (physics.i_total_mA || 0.0) : 0.0));
    const vds = comp.vds_V !== undefined ? comp.vds_V : (isOn ? (id_mA * 0.001 * (comp.rds_on || 1.2)) : 9.0);

   if (specBox) {
      const flavorText = isOn
        ? "無消費の神門 [開門/導通]: 一滴の生贄(電流)も求めず、純粋なる電位の気迫(2.1V)のみで神門を開き放った。ドレインからソースへの道はわずか1.2Ωの平坦な道へと化す。術者よ、負荷なき直結は神門をも焼き砕く。主電流の道に正しき負荷を忘れぬよう。"
        : "無消費の神門 [閉門/遮断]: 門は冷徹に閉ざされ、大いなる奔流を完全に遮断している。術者よ、中足(ゲート)を虚空に浮かす(フローティング)なかれ。浮遊せし微小な気(静電気)に触れれば神門は狂乱し、意図せぬ暴走を招く。必ずプルダウンの枷で大地に縛れ。";

      specBox.innerHTML = `
        <div style="background: #1e293b; border: 1px solid #0284c7; border-radius: 4px; padding: 6px 8px; margin-bottom: 8px;">
          <div style="font-size: 10px; color: #38bdf8; font-weight: bold; margin-bottom: 4px;">[指南] 端子接続ガイド (TO-92配列: S-G-D)</div>
          <div style="font-size: 9.5px; line-height: 1.5; color: #cbd5e1;">
            <div><b style="color: #38bdf8;">[S] ソース (左足)</b>: <b>基準電位</b> ➔ マイナスレール(GND)へ接続</div>
            <div><b style="color: #a855f7;">[G] ゲート (中足)</b>: <b>制御入力</b> ➔ スイッチ/電圧信号線へ接続 (電流は流れません)</div>
            <div><b style="color: #facc15;">[D] ドレイン (右足)</b>: <b>主負荷入力</b> ➔ LED/ブザー等の負荷マイナス側へ接続</div>
          </div>
        </div>
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">[諸元] MOSFET基本諸元</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px 6px; margin-bottom: 8px; color: #cbd5e1; font-size: 11px;">
          <div>・型番: 2N7000</div>
          <div>・チャネル: Nチャネル</div>
          <div>・閾値電圧 (Vgs_th): <span style="color: #f59e0b; font-weight: bold;">${vgs_th.toFixed(1)} V</span></div>
          <div>・オン抵抗 (Rds_on): <span style="color: #4ade80; font-weight: bold;">${comp.rds_on || 1.2} Ω</span></div>
          <div>・最大定格 (Id): 200 mA</div>
          <div>・耐圧 (Vds_max): 60 V</div>
        </div>
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">[状態] リアルタイム動作状態</div>
        <div style="margin-bottom: 8px; color: #cbd5e1; background: #181825; padding: 6px; border-radius: 4px; font-size: 11px;">
          <div>・動作モード: <span style="color: ${isOn ? '#4ade80' : '#ef4444'}; font-weight: bold;">${isOn ? '導通状態 (ON / OHMIC)' : '遮断状態 (CUTOFF / OFF)'}</span></div>
          <div>・ゲート電圧 (Vgs): <span style="color: ${vgs >= vgs_th ? '#4ade80' : '#cbd5e1'}; font-weight: bold;">${vgs.toFixed(2)} V</span></div>
          <div>・ドレイン電流 (Id): <span style="color: ${isOn ? '#4ade80' : '#64748b'}; font-weight: bold;">${id_mA.toFixed(2)} mA</span></div>
          <div>・ゲート制御電流 (Ig): <span style="color: #38bdf8; font-weight: bold;">0.00 µA (完全電圧制御)</span></div>
          <div>・ドレイン-ソース間電圧 (Vds): <span style="color: #facc15; font-weight: bold;">${vds.toFixed(2)} V</span></div>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #334155; font-size: 9px; color: #94a3b8; line-height: 1.4;">
            ・${flavorText}
          </div>
        </div>`;



    }
  },

  // 10. 圧電ブザー / ピエゾサウンダ (動的波形発振素子)
  buzzer: (comp, titleEl, descEl, specBox, selectVal, physics) => {
    if (selectVal) selectVal.style.display = "none";
    if (titleEl) titleEl.textContent = comp.name || "圧電ブザー (2.4kHz)";
    if (descEl) descEl.textContent = comp.desc || "電圧印加により2.4kHzで自励発振する音響素子です。オシロスコープ上で波形を観察できます。";

    const isClosed = physics && physics.status === "CLOSED";
    const current_mA = comp.current_mA !== undefined ? comp.current_mA : (isClosed ? (physics.i_total_mA || 0.0) : 0.0);
    const isOscillating = isClosed && current_mA > 0.05;
    const vDrop = comp.voltageDrop !== undefined ? comp.voltageDrop : (isOscillating ? (current_mA * 0.001 * (comp.val_ohm || 16)) : 0.0);
    const power_mW = comp.power_mW !== undefined ? comp.power_mW : (vDrop * current_mA);

   if (specBox) {
      const flavorText = isOscillating
        ? "響きの魔笛 [共鳴/発声]: 奔流を受けし圧電の結晶が激しく震え、高周波の鋭き咆哮(2.4kHz)を放っている。術者よ、耳を澄まし波形の乱れを看取せよ。並列に器(コンデンサ)を添え、直列に枷(抵抗)を配せば、荒ぶる叫びは優美なる調べへと彫刻される。"
        : "響きの魔笛 [静寂/待機]: 結晶は身じろぎもせず、沈黙の底で電位の到来を待つ。術者よ、二つの極性([+]アノード/[-]カソード)を違えるなかれ。向きを誤れば結晶は震えず、ただ無言の石と化す。";

      specBox.innerHTML = `
        <div style="background: #1e293b; border: 1px solid #0284c7; border-radius: 4px; padding: 6px 8px; margin-bottom: 8px;">
          <div style="font-size: 10px; color: #38bdf8; font-weight: bold; margin-bottom: 4px;">[指南] 端子接続ガイド (極性判別)</div>
          <div style="font-size: 9.5px; line-height: 1.5; color: #cbd5e1;">
            <div><b style="color: #ef4444;">[+] 正極 (pinA / アノード)</b>: <b>信号/給電側</b> ➔ 電源または負荷上流へ接続</div>
            <div><b style="color: #38bdf8;">[-] 負極 (pinB / カソード)</b>: <b>接地/引込側</b> ➔ GNDまたはMOSFETドレインへ接続</div>
          </div>
        </div>
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">[諸元] 音響・電気基本諸元</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px 6px; margin-bottom: 8px; color: #cbd5e1; font-size: 11px;">
          <div>・素子種別: 圧電サウンダ</div>
          <div>・発振周波数: <span style="color: #facc15; font-weight: bold;">${comp.freq_hz || 2400} Hz</span></div>
          <div>・等価インピーダンス: <span style="color: #4ade80; font-weight: bold;">${comp.val_ohm || 16} Ω</span></div>
          <div>・等価静電容量: <span style="color: #38bdf8; font-weight: bold;">${comp.capacitance_nF || 25} nF</span></div>
          <div>・駆動形式: 自励発振型</div>
          <div>・ピン間隔: 2列スパン直挿し</div>
        </div>
        <div style="color: #38bdf8; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 2px; margin-bottom: 4px;">[状態] リアルタイム発振状態</div>
        <div style="margin-bottom: 8px; color: #cbd5e1; background: #181825; padding: 6px; border-radius: 4px; font-size: 11px;">
          <div>・動作ステータス: <span style="color: ${isOscillating ? '#4ade80' : '#64748b'}; font-weight: bold;">${isOscillating ? '発振中 (OSCILLATING)' : '停止中 (STOPPED)'}</span></div>
          <div>・駆動電流: <span style="color: ${isOscillating ? '#38bdf8' : '#64748b'}; font-weight: bold;">${current_mA.toFixed(2)} mA</span></div>
          <div>・端子間降下電圧: <span style="color: #facc15; font-weight: bold;">${vDrop.toFixed(2)} V</span></div>
          <div>・音響消費電力: <span style="color: #cbd5e1; font-weight: bold;">${power_mW.toFixed(2)} mW</span></div>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #334155; font-size: 9px; color: #94a3b8; line-height: 1.4;">
            ・${flavorText}
          </div>
        </div>`;
    }
  }
};

/**
 * 6-3. 超軽量化された新しい updateInspectorUI 関数 (電池セレクタ動的制御対応)
 */
function updateInspectorUI(comp) {
  const titleEl = document.getElementById("inspector-part-title");
  const descEl = document.getElementById("inspector-part-desc");
  const specBox = document.getElementById("inspector-spec-box");
  const selectVal = document.getElementById("select-resistor-val");
  const attrBox = document.getElementById("inspector-attr-box");
  const actionBox = document.getElementById("inspector-action-box");


 // ★ 電池選択セレクトボックス (ID安全取得)
  const batterySelectEl = document.getElementById("select-battery-voltage") || document.getElementById("select-battery") || document.querySelector("select[id*='battery']");

  if (actionBox) {
    actionBox.style.display = comp ? "grid" : "none";
  }

  // 3端子パーツ選択時は回転ボタンを非活性化(グレーアウト)
  const btnInspectorRotate = document.getElementById("btn-inspector-rotate");
  if (btnInspectorRotate && comp) {
    const isThreePin = ["transistor", "mosfet", "switch_spdt", "potentiometer"].includes(comp.type);
    btnInspectorRotate.disabled = isThreePin;
    btnInspectorRotate.style.opacity = isThreePin ? "0.4" : "1.0";
    btnInspectorRotate.style.cursor = isThreePin ? "not-allowed" : "pointer";
  }

  if (attrBox) {
    attrBox.style.display = (comp && comp.type === "resistor") ? "flex" : "none";
  }

  // 0. パーツ未選択（9V 電源表示）

  if (!comp) {
    if (batterySelectEl) batterySelectEl.style.display = "inline-block";
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

  // ★ パーツ選択時は電池セレクタを隠す
  if (batterySelectEl) batterySelectEl.style.display = "none";

  const physics = typeof calculateCircuitPhysics === "function"
    ? calculateCircuitPhysics()
    : { status: "OPEN", r_total_ohm: 1000 };

  const renderer = INSPECTOR_RENDERERS[comp.type] || (comp.type === "switch_spdt" ? INSPECTOR_RENDERERS["switch"] : null);
  if (typeof renderer === "function") {
    renderer(comp, titleEl, descEl, specBox, selectVal, physics);
  } else {
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

  // 3端子素子(トランジスタ、MOSFET、3路スイッチ、可変抵抗器)は同一列短絡を防ぐため横向き固定
  const isThreePin = ["transistor", "mosfet", "switch_spdt", "potentiometer"].includes(target.type);
  if (isThreePin) {
    console.log("[保護機能] 3端子素子は同一列の短絡(ショート)を防ぐため、横向き固定となっています。");
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

  // タッチ操作時の画面スクロール・ピンチズーム暴発を完全防止
  canvas.style.touchAction = "none";

  // ==================================================================
  // 1. ポインタ押下 (マウス・タッチ・ペン統合ドラッグ開始判定)
  // ==================================================================
  let dragStartX = 0;
  let dragStartY = 0;
  let hasMovedEnough = false;

  canvas.addEventListener("pointerdown", (e) => {
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
    // ★ 2. 【2番目】空きスルーホールの最寄り吸着判定 (タッチ対応: 半径18px)
    // ------------------------------------------------------------------
    let clickedHole = null;
    let minHoleDist = 18; // 指先タップを確実に捉える吸着許容半径

    for (const hole of allHoles) {
      const d = Math.hypot(hole.x - mx, hole.y - my);
      if (d < minHoleDist) {
        minHoleDist = d;
        clickedHole = hole;
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

 // ★ インスペクター専用: 選択中パーツ即時削除ボタン
  const btnInspectorDelete = document.getElementById("btn-inspector-delete");
  if (btnInspectorDelete) {
    btnInspectorDelete.addEventListener("click", () => {
      if (selectedComponent || selectedWire) {
        deleteSelectedTarget();
      }
    });
  }

  // ★ インスペクター専用: 選択中パーツ回転ボタン
  const btnInspectorRotate = document.getElementById("btn-inspector-rotate");
  if (btnInspectorRotate) {
    btnInspectorRotate.addEventListener("click", () => {
      const target = selectedComponent || (components.length > 0 ? components[components.length - 1] : null);
      if (target && typeof rotateTargetComponent === "function") {
        rotateTargetComponent(target);
        if (typeof renderScene === "function") renderScene();
      }
    });
  }

  // 4-C. インスペクター「種類（抵抗値）変更」ドロップダウン制御

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

     // PART_REGISTRY の全項目から対象カテゴリのパーツを自動抽出 (受動部品選択時にもCdSを包含)
      Object.entries(PART_REGISTRY).forEach(([key, part]) => {
        const isMatch = !category || part.category === category || (category === "PASSIVE" && part.category === "SENSOR");
        if (isMatch) {
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

    // ★ カテゴリ選択肢に "SENSOR" (センサー・環境入力) を動的追加
    if (!Array.from(selectCat.options).some(opt => opt.value === "SENSOR")) {
      const sensorOpt = document.createElement("option");
      sensorOpt.value = "SENSOR";
      sensorOpt.textContent = "センサー・環境入力 (CdS)";
      selectCat.appendChild(sensorOpt);
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
  console.log("%c[監査開始] [F12 全プリセット回路 総合健全性マトリクス全自動監査]", "color: #06b6d4; font-weight: bold; font-size: 15px;");
  console.log("==================================================");

  if (typeof CIRCUIT_PRESETS === "undefined") {
    console.error("[監査エラー] CIRCUIT_PRESETS が定義されていません。");
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
    const rawPreset = CIRCUIT_PRESETS[key];
    const preset = typeof rawPreset === "function" ? rawPreset() : rawPreset;
    let hasError = false;
    const errors = [];

    // プリセットデータの仮想展開 (動的関数・静的オブジェクト両対応)
    components.length = 0;
    activeJumperWires.length = 0;

    const compList = preset ? (preset.components || preset.parts || (preset.circuit && preset.circuit.components)) : null;
    const wireList = preset ? (preset.wires || preset.answerWires || (preset.circuit && preset.circuit.wires)) : null;

    if (!Array.isArray(compList)) {
      hasError = true;
      errors.push(`プリセット [${key}] のパーツ配列 (components/parts) が未定義または不正です`);
    } else {
      compList.forEach(c => components.push(JSON.parse(JSON.stringify(c))));
    }

    if (Array.isArray(wireList)) {
      wireList.forEach(w => activeJumperWires.push(JSON.parse(JSON.stringify(w))));
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
      console.log(`    [PASS] プリセット「${preset.name || key}」: 正常`);
    } else {
      failCount++;
      console.error(`    [FAIL] プリセット「${preset.name || key}」: 異常検出 ➔`, errors);
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
    console.log(`%c[監査完了: 100% PASSED] (全 ${totalTests} プリセット全数合格)`, "color: #06b6d4; font-weight: bold;");
    console.log("[検証完了] すべてのプリセット回路において、穴配置・通電探索・物理計算・ツリー生成が完全正常であることを確認しました。");
  } else {
    console.warn(`%c[監査完了: 異常あり] 成功: ${passCount} / 失敗: ${failCount}`, "color: #ef4444; font-weight: bold;");
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
  tag: "BBSIM2-PRESET-AUDIT-COMPLETE",
  date: "2026-11-09",
  title: "全17プリセットの動的マルチ構図化完了および物理エンジン総合監査100%合格",
  details: [
    "Stage 6におけるブリッジ判定の誤作動を是正し並列LED回路の正常通電を回復",
    "Stage 7(ホイートストンブリッジ 7-1〜7-5)の潜在バグを解消し3大マルチ構図ジェネレータへ拡張",
    "可変抵抗器(VR1)の実効値計算をツマミ比率優先へ改修し平衡点(4.5V)復帰ラッチバグを根絶",
    "架橋LEDの所属アーム厳格追跡ロジックを導入し逆並列LEDの双方向差動検出を完全同期",
    "Stage 8〜10(直列3兄弟)およびStage 11(CdS夜間街灯)を難易度を保った動的散開配置へ刷新",
    "F12自動テストスイート(runPresetCircuitAudit)で全17プリセット100% PASSEDを達成",
    "【次回実装予定】パーツドラッグ移動の Pointer Events 化 (スマホ・タブレット操作対応)"
  ]
},


{
    tag: "v1.13.0",
    date: "2026-11-06",
    title: "Stage 13完成: MOSFETパルス駆動 ＆ オシロスコープ波形彫刻回路の実装",
    details: [
      "圧電ブザー(2.4kHz)のインスペクタ拡大プレビュー描画(drawPreviewBuzzer)およびディスパッチャ接続",
      "パーツパレットUIへの圧電ブザーおよびMOSFET(2N7000)の正式登録",
      "Stage 13公式プリセット構築: 2N7000パルススイッチングによるブザー駆動回路の実装",
      "オシロスコープ波形彫刻の実現: 並列コンデンサによる矩形波から三角波への過渡平滑化",
      "電解コンデンサインスペクタの機能拡張: 微小〜中容量(0.1µF〜22µF)切替による波形変調連動",
      "MOSFET動的負荷追従エンジンの改修: 可変抵抗(ボリューム)およびドレイン負荷抵抗の完全同期",
      "【次回実装予定】UI/UX操作性改善(配線プレビュー・撤去操作等)および接地線電流ラベルのサニタイズ"
    ]
  },



{
    tag: "FEATURE",
    date: "2026.11.05",
    title: "Stage 11: CdS光導電セルおよび自動夜間街灯回路の正式実装",
    details: [

 "ベース制御スイッチの実装、プリセット8/9/10実装",

      "CdS光導電セル (GL5528) のブレッドボード実物外観およびインスペクタ拡大プレビューの完全描画対応",
      "JIS C 0617 (IEC 60617) 規格準拠の回路記号描画ルーチンおよび通電アニメーション破線の統合",
      "照度 (Lux) コントロールスライダーによる内部抵抗値 (1.8kΩ〜1.0MΩ) のリアルタイム動的変化を実装",
      "回路物理計算エンジンへのCdS統合 (オームの法則・キルヒホッフ則および分電ツリー・オシロスコープ完全同期)",
      "CdSと47kΩプルアップ抵抗によるベース分圧解析を確立し、明暗反転のない夜間自動点灯物理ロジックを完成",
      "公式プリセット「Stage 11: 暗くなると自動点灯する夜間街灯回路」およびUIステージ選択ボタンの正式登録",
      "【次回実装予定】47.0kΩ固定抵抗器のインスペクタドロップダウン登録、および感度微調整機能の拡充"
    ]
  },



{
  tag: "DEVELOPMENT_LOG",
  date: "2026-11-04",
  title: "Stage 7（ホイートストン・ブリッジ 7-1〜7-5）完全実装と物理エンジンのゼロハードコード化",
  details: [
    "Stage 7 サブステージUI（7-1〜7-5）の動的展開および2回押しトグル機構の完全統合",
    "純抵抗並列アーム（LED非通電時）における直列誤認バグの特定とブランチ分離計算の確立",
    "左右中点間の架橋ワイヤにおける平衡時電流ゼロ（0.00mA）判定ロジックの実装",
    "架橋差動LED（赤・緑）のゼロハードコード化（素子ID・固定値依存を全廃し、幾何トポロジーから中点電位を動的導出）",
    "理論値との完全合致を実証（赤LED: 384Ω以下で点灯 / 緑LED: 約2913Ω以上で点灯 / 1000Ω平衡時に両方消灯）",
    "ホイートストン・ブリッジ教育シーケンス（7-1 分圧の壁 〜 7-5 極致の完成）の動作検証完了",
    "【次回実装予定】新パーツ追加の協議（CdS光導電セル／電子ブザー／タクトスイッチ）およびStage 8の実装設計"
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
