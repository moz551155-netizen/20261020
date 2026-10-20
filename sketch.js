// 儲存六種交通工具資料。
const vehicles = [
  // 儲存汽車資料。
  { id: "car", name: "汽車", color: "#ef4444" },

  // 儲存公車資料。
  { id: "bus", name: "公車", color: "#f59e0b" },

  // 儲存火車資料。
  { id: "train", name: "火車", color: "#64748b" },

  // 儲存飛機資料。
  { id: "plane", name: "飛機", color: "#38bdf8" },

  // 儲存腳踏車資料。
  { id: "bike", name: "腳踏車", color: "#22c55e" },

  // 儲存船資料。
  { id: "ship", name: "船", color: "#2563eb" }
];

// 儲存 p5.js 畫布物件。
let gameCanvas;

// 儲存畫布實際寬度。
let canvasWidth = 0;

// 儲存畫布實際高度。
let canvasHeight = 0;

// 儲存設計座標寬度。
let designWidth = 1200;

// 儲存設計座標高度。
let designHeight = 760;

// 儲存畫布縮放比例。
let scaleFactor = 1;

// 儲存內容水平起點。
let contentX = 0;

// 儲存目前是否使用手機版版面。
let isMobileLayout = false;

// 儲存左側文字區域。
let wordAreas = [];

// 儲存右側圖片區域。
let vehicleAreas = [];

// 儲存目前被拖曳的文字。
let draggingWord = null;

// 儲存拖曳中的水平座標。
let pointerX = 0;

// 儲存拖曳中的垂直座標。
let pointerY = 0;

// 儲存已經完成配對的編號。
let matchedIds = new Set();

// 儲存每題作答紀錄。
let answerRecords = {};

// 儲存目前完成題數。
let completedCount = 0;

// 儲存遊戲是否完成。
let gameFinished = false;

// 儲存錯誤提示動畫。
let errorAnimation = null;

// 儲存重新開始按鈕區域。
let restartButton = {
  x: 0,
  y: 0,
  w: 0,
  h: 0
};

// p5.js 初始化函式。
function setup() {
  // 建立全螢幕畫布。
  gameCanvas = createCanvas(windowWidth, windowHeight);

  // 設定畫布以區塊方式顯示。
  gameCanvas.style("display", "block");

  // 移除畫布外部邊距。
  gameCanvas.style("margin", "0");

  // 禁止瀏覽器接管畫布觸控操作。
  gameCanvas.elt.style.touchAction = "none";

  // 設定文字水平置中。
  textAlign(CENTER, CENTER);

  // 設定文字為粗體。
  textStyle(BOLD);

  // 使用指定的 Google 字形。
  textFont("Chiron GoRound TC");

  // 設定像素密度。
  pixelDensity(Math.min(window.devicePixelRatio || 1, 2));

  // 調整全螢幕畫布。
  resizeGameCanvas();

  // 初始化遊戲。
  resetGame();
}

// p5.js 每一幀執行一次。
function draw() {
  // 設定背景色。
  background("#f1f5f9");

  // 儲存繪圖狀態。
  push();

  // 將遊戲內容縮放到設計尺寸。
  scale(scaleFactor);

  // 繪製標題。
  drawHeader();

  // 繪製進度列。
  drawProgress();

  // 繪製左側文字區域。
  drawWordPanel();

  // 繪製右側交通工具圖片區域。
  drawVehiclePanel();

  // 如果正在拖曳文字，就繪製拖曳中的文字。
  if (draggingWord !== null) {
    drawDraggingWord();
  }

  // 如果正在顯示錯誤提示，就繪製錯誤提示。
  if (errorAnimation !== null) {
    drawErrorAnimation();
  }

  // 如果遊戲已完成，就繪製結果面板。
  if (gameFinished) {
    drawResultPanel();
  }

  // 恢復繪圖狀態。
  pop();
}

// 當視窗大小改變時執行。
function windowResized() {
  // 重新調整畫布。
  resizeGameCanvas();

  // 重新建立文字區域。
  createWordAreas();

  // 重新建立交通工具區域。
  createVehicleAreas();
}

// 依照視窗調整畫布與版面。
function resizeGameCanvas() {
  // 取得視窗寬度。
  canvasWidth = windowWidth;

  // 取得視窗高度。
  canvasHeight = windowHeight;

  // 判斷是否使用手機版。
  isMobileLayout = canvasWidth < 760;

  // 手機版使用單欄且縮小卡片。
  if (isMobileLayout) {
    // 設定手機版設計寬度。
    designWidth = 420;

    // 設定手機版設計高度。
    designHeight = 1120;

    // 設定手機版縮放比例。
    scaleFactor = Math.min(
      canvasWidth / designWidth,
      canvasHeight / designHeight
    );

    // 手機版內容從左側開始。
    contentX = 0;
  } else {
    // 桌面版使用較緊湊的設計寬度。
    designWidth = 1040;

    // 桌面版使用較低的設計高度。
    designHeight = 650;

    // 計算桌面版縮放比例。
    scaleFactor = Math.min(
      canvasWidth / designWidth,
      canvasHeight / designHeight
    );

    // 計算整體水平置中位置。
    contentX =
      (canvasWidth / scaleFactor - designWidth) / 2;
  }

  // 讓畫布填滿整個瀏覽器視窗。
  resizeCanvas(canvasWidth, canvasHeight);
}

// 重設遊戲。
function resetGame() {
  // 清除成功配對資料。
  matchedIds = new Set();

  // 清除答題紀錄。
  answerRecords = {};

  // 將完成題數歸零。
  completedCount = 0;

  // 設定遊戲尚未結束。
  gameFinished = false;

  // 清除拖曳狀態。
  draggingWord = null;

  // 清除錯誤提示。
  errorAnimation = null;

  // 建立文字區域。
  createWordAreas();

  // 建立圖片區域。
  createVehicleAreas();
}

// 建立左側文字區域。
function createWordAreas() {
  // 清除原有的文字區域。
  wordAreas = [];

  // 設定左側文字區域寬度。
  const areaWidth = isMobileLayout ? 360 : 245;

  // 桌面版將左側區域往右移。
  const desktopStartX = contentX + 70;

  // 手機版維持置中位置。
  const mobileStartX = 30;

  // 設定文字區域起始水平位置。
  const startX = isMobileLayout
    ? mobileStartX
    : desktopStartX;

  // 將標題下方的第一個選項往上移。
  const startY = isMobileLayout ? 218 : 188;

  // 設定文字選項之間的距離。
  const gap = isMobileLayout ? 62 : 53;

  // 打亂交通工具順序。
  const shuffledVehicles = shuffleArray(vehicles);

  // 建立六個文字選項。
  shuffledVehicles.forEach((vehicle, index) => {
    // 儲存單一文字區域。
    wordAreas.push({
      id: vehicle.id,
      name: vehicle.name,
      x: startX,
      y: startY + index * gap,
      w: areaWidth,
      h: 44,
      selected: false
    });
  });
}

// 建立右側交通工具圖片區域。
function createVehicleAreas() {
  // 清除原有的圖片區域。
  vehicleAreas = [];

  // 設定手機版卡片寬度。
  const mobileCardWidth = 360;

  // 設定桌面版卡片寬度。
  const desktopCardWidth = 275;

  // 設定手機版卡片高度。
  const mobileCardHeight = 150;

  // 設定桌面版卡片高度。
  const desktopCardHeight = 132;

  // 桌面版將右側整體往右移。
  const desktopStartX = contentX + 350;

  // 手機版維持置中位置。
  const mobileStartX = 30;

  // 建立六張交通工具圖片卡片。
  vehicles.forEach((vehicle, index) => {
    // 計算手機版垂直位置。
    const mobileY = 218 + index * 164;

    // 計算桌面版欄位。
    const column = index % 2;

    // 計算桌面版列數。
    const row = Math.floor(index / 2);

    // 計算桌面版水平位置。
    const desktopX =
      desktopStartX + column * 295;

    // 計算桌面版垂直位置。
    const desktopY = 188 + row * 145;

    // 儲存圖片區域資料。
    vehicleAreas.push({
      id: vehicle.id,
      name: vehicle.name,
      color: vehicle.color,
      x: isMobileLayout
        ? mobileStartX
        : desktopX,
      y: isMobileLayout
        ? mobileY
        : desktopY,
      w: isMobileLayout
        ? mobileCardWidth
        : desktopCardWidth,
      h: isMobileLayout
        ? mobileCardHeight
        : desktopCardHeight,
      wrongUntil: 0
    });
  });
}

// 繪製標題。
function drawHeader() {
  // 設定標題顏色。
  fill("#1e293b");

  // 設定標題大小。
  textSize(isMobileLayout ? 25 : 30);

  // 計算標題水平位置。
  const centerX = isMobileLayout
    ? designWidth / 2
    : contentX + designWidth / 2;

  // 繪製標題。
  text("交通工具連連看", centerX, 34);

  // 設定說明文字顏色。
  fill("#64748b");

  // 設定說明文字大小。
  textSize(isMobileLayout ? 12 : 14);

  // 繪製說明文字。
  text(
    "按住左側文字，拖曳到右側正確的動態圖片上",
    centerX,
    67
  );
}

// 繪製進度列。
function drawProgress() {
  // 設定進度列寬度。
  const progressWidth = isMobileLayout
    ? 360
    : designWidth - 40;

  // 設定進度列水平位置。
  const x = isMobileLayout
    ? 30
    : contentX + 20;

  // 設定進度列垂直位置。
  const y = 92;

  // 設定進度列高度。
  const progressHeight = 10;

  // 計算完成比例。
  const progress = completedCount / vehicles.length;

  // 關閉外框。
  noStroke();

  // 設定背景色。
  fill("#dbe5f1");

  // 繪製進度列背景。
  rect(x, y, progressWidth, progressHeight, 999);

  // 設定完成進度顏色。
  fill("#2563eb");

  // 繪製進度。
  rect(
    x,
    y,
    progressWidth * progress,
    progressHeight,
    999
  );

  // 設定文字顏色。
  fill("#64748b");

  // 設定文字大小。
  textSize(13);

  // 繪製進度文字。
  text(
    `完成進度：${completedCount} / ${vehicles.length}`,
    isMobileLayout
      ? designWidth / 2
      : contentX + designWidth / 2,
    117
  );
}

// 繪製左側文字面板。
function drawWordPanel() {
  // 設定面板標題顏色。
  fill("#1e293b");

  // 縮小左側標題文字。
  textSize(14);

  // 計算標題水平位置。
  const titleX = isMobileLayout
    ? designWidth / 2
    : contentX + 192;

  // 將標題垂直位置下移到接近選項的位置。
  text("交通工具名稱", titleX, 164);

  // 繪製左側文字選項。
  wordAreas.forEach(wordArea => {
    // 判斷是否已經完成配對。
    const isMatched = matchedIds.has(wordArea.id);

    // 設定背景顏色。
    if (isMatched) {
      fill("#dcfce7");
    } else if (wordArea.selected) {
      fill("#dbeafe");
    } else {
      fill("#f8fbff");
    }

    // 設定外框顏色。
    if (isMatched) {
      stroke("#86efac");
    } else if (wordArea.selected) {
      stroke("#2563eb");
    } else {
      stroke("#b9c8de");
    }

    // 設定外框粗細。
    strokeWeight(2);

    // 繪製文字選項卡片。
    rect(
      wordArea.x,
      wordArea.y,
      wordArea.w,
      wordArea.h,
      12
    );

    // 設定文字顏色。
    fill(isMatched ? "#16a34a" : "#1e293b");

    // 縮小交通工具名稱文字。
    textSize(14);

    // 繪製交通工具名稱。
    text(
      isMatched
        ? `✓ ${wordArea.name}`
        : wordArea.name,
      wordArea.x + wordArea.w / 2,
      wordArea.y + wordArea.h / 2
    );
  });
}

// 繪製右側圖片面板。
function drawVehiclePanel() {
  // 設定面板標題顏色。
  fill("#1e293b");

  // 設定面板標題大小。
  textSize(17);

  // 計算標題水平位置。
  const titleX = isMobileLayout
    ? designWidth / 2
    : contentX + 610;

  // 繪製圖片面板標題。
  text("動態交通工具圖片", titleX, 155);

  // 繪製每一張交通工具圖片卡片。
  vehicleAreas.forEach(area => {
    // 判斷是否配對成功。
    const isMatched = matchedIds.has(area.id);

    // 判斷是否顯示錯誤狀態。
    const isWrong = area.wrongUntil > millis();

    // 判斷拖曳文字是否位於卡片上。
    const isHovering =
      draggingWord !== null &&
      isInside(pointerX, pointerY, area);

    // 設定卡片背景色。
    if (isMatched) {
      fill("#f0fdf4");
    } else if (isWrong) {
      fill("#fff1f2");
    } else if (isHovering) {
      fill("#eff6ff");
    } else {
      fill("#fbfdff");
    }

    // 設定卡片外框色。
    if (isMatched) {
      stroke("#22c55e");
    } else if (isWrong) {
      stroke("#ef4444");
    } else if (isHovering) {
      stroke("#2563eb");
    } else {
      stroke("#dbe3ef");
    }

    // 設定卡片外框粗細。
    strokeWeight(isMatched || isHovering ? 3 : 2);

    // 繪製圖片卡片。
    rect(
      area.x,
      area.y,
      area.w,
      area.h,
      15
    );

    // 繪製名稱標籤。
    drawVehicleLabel(area, isMatched);

    // 繪製重新設計的交通工具動畫。
    drawVehicleGraphic(area);

    // 繪製答案拖曳方框。
    drawDropZone(area, isMatched, isHovering);
  });
}

// 繪製交通工具名稱標籤。
function drawVehicleLabel(area, isMatched) {
  // 關閉外框。
  noStroke();

  // 設定標籤背景。
  fill("rgba(255,255,255,0.94)");

  // 繪製標籤。
  rect(
    area.x + 8,
    area.y + 8,
    58,
    22,
    999
  );

  // 設定文字顏色。
  fill(isMatched ? "#16a34a" : "#1e293b");

  // 設定文字大小。
  textSize(10);

  // 繪製交通工具名稱。
  text(
    area.name,
    area.x + 37,
    area.y + 19
  );
}

// 繪製拖曳答案方框。
function drawDropZone(area, isMatched, isHovering) {
  // 設定答案方框寬度。
  const zoneWidth = Math.min(
    175,
    area.w - 24
  );

  // 設定答案方框高度。
  const zoneHeight = 25;

  // 計算答案方框水平位置。
  const zoneX =
    area.x + area.w / 2 - zoneWidth / 2;

  // 將答案方框稍微往下移。
  const zoneY =
    area.y + area.h - zoneHeight - 5;

  // 設定答案方框背景色。
  if (isMatched) {
    fill("rgba(220,252,231,0.98)");
  } else if (isHovering) {
    fill("rgba(219,234,254,0.98)");
  } else {
    fill("rgba(248,250,252,0.98)");
  }

  // 設定答案方框外框顏色。
  if (isMatched) {
    stroke("#16a34a");
  } else if (isHovering) {
    stroke("#2563eb");
  } else {
    stroke("#94a3b8");
  }

  // 設定方框外框粗細。
  strokeWeight(isMatched || isHovering ? 2.5 : 1.5);

  // 設定未配對時的虛線。
  drawingContext.setLineDash(
    isMatched ? [] : [5, 4]
  );

  // 繪製答案方框。
  rect(
    zoneX,
    zoneY,
    zoneWidth,
    zoneHeight,
    7
  );

  // 恢復實線設定。
  drawingContext.setLineDash([]);

  // 設定提示文字顏色。
  fill(
    isMatched
      ? "#16a34a"
      : isHovering
        ? "#1d4ed8"
        : "#64748b"
  );

  // 設定提示文字大小。
  textSize(10);

  // 繪製提示文字。
  text(
    isMatched
      ? "✓ 配對完成"
      : isHovering
        ? "放開完成配對"
        : "拖曳到這裡",
    area.x + area.w / 2,
    zoneY + zoneHeight / 2
  );
}

// 繪製不同的交通工具動畫。
function drawVehicleGraphic(area) {
  // 計算圖形中心水平位置。
  const centerX =
    area.x + area.w / 2;

  // 計算圖形中心垂直位置。
  const centerY =
    area.y + area.h / 2 - 3;

  // 繪製重新生成的汽車。
  if (area.id === "car") {
    drawCar(centerX, centerY, area.color);
  }

  // 繪製重新生成的公車。
  if (area.id === "bus") {
    drawBus(centerX, centerY, area.color);
  }

  // 繪製重新生成的火車。
  if (area.id === "train") {
    drawTrain(centerX, centerY, area.color);
  }

  // 繪製重新生成的飛機。
  if (area.id === "plane") {
    drawPlane(centerX, centerY, area.color);
  }

  // 保留原有腳踏車動畫。
  if (area.id === "bike") {
    drawBike(centerX, centerY, area.color);
  }

  // 繪製重新生成的船。
  if (area.id === "ship") {
    drawShip(centerX, centerY, area.color);
  }
}

// 繪製拖曳中的答案文字。
function drawDraggingWord() {
  // 設定拖曳文字背景。
  fill("rgba(219,234,254,0.98)");

  // 設定拖曳文字外框。
  stroke("#2563eb");

  // 設定外框粗細。
  strokeWeight(2);

  // 繪製拖曳文字方框。
  rect(
    pointerX - 70,
    pointerY - 23,
    140,
    46,
    12
  );

  // 設定文字顏色。
  fill("#1d4ed8");

  // 設定文字大小。
  textSize(14);

  // 繪製拖曳中的交通工具名稱。
  text(
    draggingWord.name,
    pointerX,
    pointerY
  );
}

// 繪製錯誤提示。
function drawErrorAnimation() {
  // 計算剩餘時間。
  const remaining =
    errorAnimation.until - millis();

  // 如果動畫結束，就清除錯誤提示。
  if (remaining <= 0) {
    errorAnimation = null;
    return;
  }

  // 計算透明度。
  const alphaValue =
    map(remaining, 0, 800, 0, 255);

  // 設定提示顏色。
  fill(220, 38, 38, alphaValue);

  // 設定提示大小。
  textSize(14);

  // 繪製錯誤提示。
  text(
    "再試一次！",
    errorAnimation.x,
    errorAnimation.y
  );
}

// 繪製測驗完成結果面板。
function drawResultPanel() {
  // 設定結果面板寬度。
  const panelWidth = isMobileLayout
    ? 360
    : 420;

  // 設定結果面板高度。
  const panelHeight = 190;

  // 計算目前設計畫布的可視寬度。
  const visibleWidth =
    canvasWidth / scaleFactor;

  // 計算目前設計畫布的可視高度。
  const visibleHeight =
    canvasHeight / scaleFactor;

  // 計算結果面板水平位置，使面板位於螢幕中央。
  const panelX =
    visibleWidth / 2 - panelWidth / 2;

  // 計算結果面板垂直位置，使面板位於螢幕中央。
  const panelY =
    visibleHeight / 2 - panelHeight / 2;

  // 設定結果面板背景色。
  fill("#ffffff");

  // 設定結果面板外框顏色。
  stroke("#bfdbfe");

  // 設定外框粗細。
  strokeWeight(2);

  // 繪製結果面板。
  rect(
    panelX,
    panelY,
    panelWidth,
    panelHeight,
    20
  );

  // 設定結果標題顏色。
  fill("#1e293b");

  // 設定結果標題大小。
  textSize(22);

  // 繪製結果標題。
  text(
    "測驗完成！",
    panelX + panelWidth / 2,
    panelY + 32
  );

  // 計算答對題數。
  const correctCount = matchedIds.size;

  // 計算答對百分比。
  const percentage = Math.round(
    (correctCount / vehicles.length) * 100
  );

  // 設定分數顏色。
  fill("#2563eb");

  // 設定分數大小。
  textSize(30);

  // 繪製答題分數。
  text(
    `${correctCount} / ${vehicles.length}　${percentage}%`,
    panelX + panelWidth / 2,
    panelY + 72
  );

  // 設定結果說明文字顏色。
  fill("#16a34a");

  // 設定結果說明文字大小。
  textSize(14);

  // 繪製結果說明。
  text(
    "六題皆已完成正確配對",
    panelX + panelWidth / 2,
    panelY + 105
  );

  // 設定重新開始按鈕區域。
  restartButton = {
    x: panelX + panelWidth / 2 - 95,
    y: panelY + 135,
    w: 190,
    h: 36
  };

  // 設定按鈕背景色。
  noStroke();
  fill("#2563eb");

  // 繪製重新開始按鈕。
  rect(
    restartButton.x,
    restartButton.y,
    restartButton.w,
    restartButton.h,
    9
  );

  // 設定按鈕文字顏色。
  fill("#ffffff");

  // 設定按鈕文字大小。
  textSize(14);

  // 繪製按鈕文字。
  text(
    "重新開始",
    restartButton.x + restartButton.w / 2,
    restartButton.y + restartButton.h / 2
  );
}

// 繪製縮小版汽車動畫。
function drawCar(x, y, color) {
  // 計算汽車水平移動位置。
  const movement = (frameCount * 0.65) % 82 - 41;

  // 計算車輪旋轉角度。
  const wheelRotation = frameCount * 0.12;

  // 儲存目前繪圖狀態。
  push();

  // 將汽車移動到動畫位置。
  translate(x + movement, y);

  // 將汽車整體縮小為原本的百分之七十二。
  scale(0.72);

  // 讓汽車產生輕微上下晃動。
  translate(0, Math.sin(frameCount * 0.08) * 1.5);

  // 設定汽車外框顏色。
  stroke("#172033");

  // 設定汽車外框粗細。
  strokeWeight(2.5);

  // 設定汽車車身顏色。
  fill(color);

  // 繪製汽車上半部與車頂。
  beginShape();

  // 繪製車頭前端。
  vertex(-58, 8);

  // 繪製引擎蓋。
  vertex(-48, -9);

  // 繪製前擋風玻璃下方。
  vertex(-31, -29);

  // 繪製車頂前端。
  vertex(-10, -39);

  // 繪製車頂後端。
  vertex(26, -39);

  // 繪製後車窗上方。
  vertex(47, -23);

  // 繪製車尾上方。
  vertex(58, 7);

  // 關閉汽車上半部形狀。
  endShape(CLOSE);

  // 設定車窗顏色。
  fill("#dbeafe");

  // 設定車窗外框顏色。
  stroke("#334155");

  // 設定車窗外框粗細。
  strokeWeight(1.5);

  // 繪製前方車窗。
  beginShape();

  // 設定前方車窗左上角。
  vertex(-27, -27);

  // 設定前方車窗右上角。
  vertex(-9, -35);

  // 設定前方車窗右下角。
  vertex(-5, -15);

  // 設定前方車窗左下角。
  vertex(-23, -15);

  // 關閉前方車窗。
  endShape(CLOSE);

  // 繪製後方車窗。
  beginShape();

  // 設定後方車窗左上角。
  vertex(-3, -35);

  // 設定後方車窗右上角。
  vertex(23, -35);

  // 設定後方車窗右下角。
  vertex(37, -15);

  // 設定後方車窗左下角。
  vertex(-1, -15);

  // 關閉後方車窗。
  endShape(CLOSE);

  // 設定車窗反光顏色。
  stroke("#ffffff");

  // 設定車窗反光粗細。
  strokeWeight(2);

  // 繪製前方車窗反光。
  line(-20, -27, -11, -20);

  // 繪製後方車窗反光。
  line(5, -28, 17, -20);

  // 設定車身顏色。
  fill(color);

  // 設定車身外框顏色。
  stroke("#172033");

  // 設定車身外框粗細。
  strokeWeight(2.5);

  // 繪製下方車身。
  rect(-64, 5, 128, 25, 8);

  // 設定車身高光顏色。
  stroke("#ffffff");

  // 設定高光透明度。
  drawingContext.globalAlpha = 0.55;

  // 設定高光線條粗細。
  strokeWeight(3);

  // 繪製車身高光。
  line(-45, 11, 24, 11);

  // 恢復完整透明度。
  drawingContext.globalAlpha = 1;

  // 設定車門分隔線顏色。
  stroke("#7f1d1d");

  // 設定車門分隔線粗細。
  strokeWeight(1.5);

  // 繪製前車門分隔線。
  line(-4, 5, -4, 27);

  // 繪製後車門分隔線。
  line(29, 5, 29, 27);

  // 設定門把顏色。
  stroke("#334155");

  // 設定門把粗細。
  strokeWeight(2);

  // 繪製前門把。
  line(5, 14, 15, 14);

  // 繪製後門把。
  line(34, 14, 43, 14);

  // 設定前車燈顏色。
  fill("#fef08a");

  // 設定前車燈外框顏色。
  stroke("#92400e");

  // 設定前車燈外框粗細。
  strokeWeight(1.5);

  // 繪製前車燈。
  ellipse(55, 12, 10, 8);

  // 設定尾燈顏色。
  fill("#fca5a5");

  // 設定尾燈外框顏色。
  stroke("#991b1b");

  // 繪製尾燈。
  ellipse(-56, 12, 9, 8);

  // 設定保險桿顏色。
  stroke("#475569");

  // 設定保險桿粗細。
  strokeWeight(3);

  // 繪製前保險桿。
  line(58, 27, 65, 27);

  // 繪製後保險桿。
  line(-65, 27, -58, 27);

  // 繪製左側車輪。
  drawAnimatedCarWheel(-37, 29, wheelRotation);

  // 繪製右側車輪。
  drawAnimatedCarWheel(39, 29, wheelRotation);

  // 恢復繪圖狀態。
  pop();

  // 繪製縮小後的道路。
  drawMovingRoad(x, y + 27);
}

// 繪製汽車旋轉車輪。
function drawAnimatedCarWheel(x, y, rotation) {
  // 儲存目前繪圖狀態。
  push();

  // 移動到車輪位置。
  translate(x, y);

  // 設定輪胎顏色。
  fill("#172033");

  // 關閉輪胎外框。
  noStroke();

  // 繪製輪胎。
  circle(0, 0, 22);

  // 設定輪圈顏色。
  fill("#cbd5e1");

  // 繪製輪圈。
  circle(0, 0, 12);

  // 設定輪轂顏色。
  fill("#64748b");

  // 繪製輪轂。
  circle(0, 0, 5);

  // 旋轉車輪輻條。
  rotate(rotation);

  // 設定輻條顏色。
  stroke("#f8fafc");

  // 設定輻條粗細。
  strokeWeight(1.5);

  // 繪製第一條輻條。
  line(-5, 0, 5, 0);

  // 繪製第二條輻條。
  line(0, -5, 0, 5);

  // 恢復繪圖狀態。
  pop();
}

// 繪製汽車行駛道路。
function drawMovingRoad(x, y) {
  // 計算道路虛線移動位置。
  const roadOffset = (frameCount * 1.4) % 30;

  // 設定道路顏色。
  stroke("#94a3b8");

  // 設定道路粗細。
  strokeWeight(3);

  // 繪製道路外框。
  line(x - 78, y, x + 78, y);

  // 設定道路虛線顏色。
  stroke("#e2e8f0");

  // 設定道路虛線粗細。
  strokeWeight(2);

  // 逐一繪製移動中的道路虛線。
  for (
    let roadX = x - 82 - roadOffset;
    roadX < x + 82;
    roadX += 30
  ) {
    // 繪製道路虛線。
    line(roadX, y + 6, roadX + 14, y + 6);
  }
}

// 重新生成公車動畫。
function drawBus(x, y, color) {
  // 計算公車移動位置。
  const movement =
    (frameCount * 0.4) % 100 - 50;

  // 儲存繪圖狀態。
  push();

  // 移動公車。
  translate(x + movement, y);

  // 設定外框。
  stroke("#1e293b");

  // 設定外框粗細。
  strokeWeight(2);

  // 設定車身顏色。
  fill(color);

  // 繪製公車。
  rect(-48, -28, 96, 47, 7);

  // 設定窗戶顏色。
  fill("#bae6fd");

  // 繪製窗戶。
  rect(-39, -19, 19, 15, 2);
  rect(-15, -19, 19, 15, 2);
  rect(9, -19, 19, 15, 2);

  // 設定車門顏色。
  fill("#dbeafe");

  // 繪製車門。
  rect(33, -19, 9, 30, 2);

  // 設定車燈顏色。
  fill("#fef08a");

  // 繪製車燈。
  circle(41, 7, 6);

  // 繪製車輪。
  drawDetailedWheel(-30, 22);
  drawDetailedWheel(30, 22);

  // 恢復繪圖狀態。
  pop();

  // 繪製道路。
  drawRoad(x, y + 27);
}

// 重新生成火車動畫。
function drawTrain(x, y, color) {
  // 計算火車移動位置。
  const movement =
    (frameCount * 0.32) % 100 - 50;

  // 儲存繪圖狀態。
  push();

  // 移動火車。
  translate(x + movement, y);

  // 設定外框。
  stroke("#1e293b");

  // 設定外框粗細。
  strokeWeight(2);

  // 設定車身顏色。
  fill(color);

  // 繪製車身。
  rect(-44, -29, 88, 48, 7);

  // 設定車窗顏色。
  fill("#bfdbfe");

  // 繪製車窗。
  rect(-34, -20, 21, 16, 2);
  rect(-8, -20, 21, 16, 2);

  // 設定車門顏色。
  fill("#cbd5e1");

  // 繪製車門。
  rect(21, -20, 13, 30, 2);

  // 設定車燈顏色。
  fill("#fef08a");

  // 繪製車頭燈。
  circle(35, 3, 7);

  // 設定煙囪顏色。
  fill("#475569");

  // 繪製煙囪。
  rect(-33, -42, 15, 13, 3);

  // 設定煙霧線條。
  noFill();
  stroke("#94a3b8");
  strokeWeight(3);

  // 繪製煙霧。
  arc(-25, -50, 14, 16, PI, TWO_PI);

  // 繪製車輪。
  drawDetailedWheel(-26, 22);
  drawDetailedWheel(26, 22);

  // 恢復繪圖狀態。
  pop();

  // 繪製鐵軌。
  drawRailway(x, y + 27);
}

// 重新生成飛機動畫。
function drawPlane(x, y, color) {
  // 計算飛機浮動位置。
  const floating =
    Math.sin(frameCount * 0.04) * 5;

  // 儲存繪圖狀態。
  push();

  // 移動飛機。
  translate(x, y + floating);

  // 設定外框。
  stroke("#1e293b");

  // 設定外框粗細。
  strokeWeight(2);

  // 設定飛機顏色。
  fill(color);

  // 繪製飛機。
  beginShape();
  vertex(-60, -1);
  vertex(-20, -8);
  vertex(-2, -31);
  vertex(7, -35);
  vertex(10, -30);
  vertex(5, -8);
  vertex(46, -2);
  vertex(56, 3);
  vertex(46, 8);
  vertex(5, 10);
  vertex(10, 30);
  vertex(3, 33);
  vertex(-20, 12);
  vertex(-60, 7);
  vertex(-68, 3);
  endShape(CLOSE);

  // 設定飛機窗戶顏色。
  fill("#f8fafc");

  // 關閉窗戶外框。
  noStroke();

  // 繪製窗戶。
  circle(22, 1, 6);
  circle(32, 2, 6);
  circle(42, 2, 6);

  // 恢復繪圖狀態。
  pop();

  // 設定雲朵顏色。
  stroke("#bae6fd");

  // 設定雲朵粗細。
  strokeWeight(3);

  // 繪製雲朵。
  line(x - 58, y + 32, x - 20, y + 32);
}

// 保留原有腳踏車動畫。
function drawBike(x, y, color) {
  // 計算輪子旋轉角度。
  const wheelRotation =
    frameCount * 0.14;

  // 計算踏板旋轉角度。
  const pedalRotation =
    frameCount * 0.18;

  // 計算上下晃動。
  const bounce =
    Math.sin(frameCount * 0.08) * 2;

  // 儲存繪圖狀態。
  push();

  // 移動腳踏車。
  translate(x, y + bounce);

  // 設定輪子外框。
  stroke("#1e293b");

  // 設定外框粗細。
  strokeWeight(2);

  // 關閉填色。
  noFill();

  // 繪製兩個輪子。
  circle(-38, 16, 38);
  circle(38, 16, 38);

  // 繪製輪輻。
  drawWheelSpokes(-38, 16, wheelRotation);
  drawWheelSpokes(38, 16, wheelRotation);

  // 設定車架顏色。
  stroke(color);

  // 設定車架粗細。
  strokeWeight(4);

  // 繪製車架。
  line(-38, 16, -12, -10);
  line(-12, -10, 14, 16);
  line(14, 16, -38, 16);

  // 繪製座椅支架。
  line(-12, -10, 3, -10);

  // 繪製前叉。
  line(14, 16, 25, -11);
  line(25, -11, 38, 16);

  // 設定座椅與車把顏色。
  stroke("#1e293b");

  // 設定座椅與車把粗細。
  strokeWeight(3);

  // 繪製座椅。
  line(-18, -13, 0, -13);

  // 繪製車把。
  line(20, -16, 32, -16);

  // 繪製車把握把。
  line(28, -19, 32, -16);
  line(28, -13, 32, -16);

  // 儲存踏板繪圖狀態。
  push();

  // 移動到踏板位置。
  translate(14, 16);

  // 旋轉踏板。
  rotate(pedalRotation);

  // 設定踏板外框。
  stroke("#1e293b");

  // 設定踏板粗細。
  strokeWeight(2);

  // 繪製踏板軸。
  line(-10, 0, 10, 0);

  // 設定踏板顏色。
  fill(color);

  // 繪製踏板。
  rect(-15, -2, 6, 4, 2);
  rect(9, -2, 6, 4, 2);

  // 恢復踏板狀態。
  pop();

  // 恢復腳踏車狀態。
  pop();

  // 繪製地面線。
  stroke("#94a3b8");
  strokeWeight(2);
  line(x - 65, y + 41, x + 65, y + 41);
}

// 繪製輪輻。
function drawWheelSpokes(x, y, rotation) {
  // 儲存繪圖狀態。
  push();

  // 移動至輪心。
  translate(x, y);

  // 旋轉輪輻。
  rotate(rotation);

  // 設定輪輻顏色。
  stroke("#94a3b8");

  // 設定輪輻粗細。
  strokeWeight(1);

  // 繪製八條輪輻。
  for (let index = 0; index < 8; index += 1) {
    // 計算輪輻角度。
    const angle =
      (TWO_PI / 8) * index;

    // 計算輪輻終點。
    const endX =
      Math.cos(angle) * 17;

    // 計算輪輻終點。
    const endY =
      Math.sin(angle) * 17;

    // 繪製輪輻。
    line(0, 0, endX, endY);
  }

  // 設定輪轂顏色。
  fill("#64748b");

  // 關閉輪轂外框。
  noStroke();

  // 繪製輪轂。
  circle(0, 0, 5);

  // 恢復繪圖狀態。
  pop();
}

// 重新生成船動畫。
function drawShip(x, y, color) {
  // 計算船的上下浮動。
  const floating =
    Math.sin(frameCount * 0.06) * 4;

  // 儲存繪圖狀態。
  push();

  // 移動船。
  translate(x, y + floating);

  // 設定船身外框。
  stroke("#1e293b");

  // 設定外框粗細。
  strokeWeight(2);

  // 設定船身顏色。
  fill(color);

  // 繪製船身。
  beginShape();
  vertex(-52, 7);
  vertex(52, 7);
  vertex(38, 24);
  vertex(-38, 24);
  endShape(CLOSE);

  // 設定船艙顏色。
  fill("#f8fafc");

  // 繪製船艙。
  rect(-18, -18, 36, 25, 3);

  // 設定船窗顏色。
  fill("#38bdf8");

  // 關閉窗戶外框。
  noStroke();

  // 繪製船窗。
  circle(-9, -7, 6);
  circle(1, -7, 6);
  circle(11, -7, 6);

  // 設定旗桿。
  stroke("#1e293b");
  strokeWeight(2);

  // 繪製旗桿。
  line(0, -18, 0, -34);

  // 設定旗子顏色。
  fill("#f87171");

  // 繪製旗子。
  beginShape();
  vertex(2, -33);
  vertex(27, -23);
  vertex(2, -23);
  endShape(CLOSE);

  // 恢復繪圖狀態。
  pop();

  // 設定水波顏色。
  noFill();
  stroke("#38bdf8");
  strokeWeight(3);

  // 繪製第一道水波。
  bezier(
    x - 62,
    y + 36,
    x - 45,
    y + 46,
    x - 22,
    y + 26,
    x - 4,
    y + 36
  );

  // 繪製第二道水波。
  bezier(
    x - 20,
    y + 36,
    x,
    y + 46,
    x + 20,
    y + 26,
    x + 40,
    y + 36
  );
}

// 繪製詳細車輪。
function drawDetailedWheel(x, y) {
  // 設定輪胎顏色。
  fill("#1e293b");

  // 關閉外框。
  noStroke();

  // 繪製輪胎。
  circle(x, y, 16);

  // 設定輪圈顏色。
  fill("#cbd5e1");

  // 繪製輪圈。
  circle(x, y, 8);

  // 設定輪轂顏色。
  fill("#64748b");

  // 繪製輪轂。
  circle(x, y, 3);
}

// 繪製道路。
function drawRoad(x, y) {
  // 設定道路顏色。
  stroke("#94a3b8");

  // 設定道路粗細。
  strokeWeight(3);

  // 繪製道路。
  line(x - 65, y, x + 65, y);
}

// 繪製鐵軌。
function drawRailway(x, y) {
  // 設定鐵軌顏色。
  stroke("#94a3b8");

  // 設定鐵軌粗細。
  strokeWeight(2);

  // 繪製兩條鐵軌。
  line(x - 65, y - 3, x + 65, y - 3);
  line(x - 65, y + 5, x + 65, y + 5);

  // 設定枕木顏色。
  stroke("#64748b");

  // 設定枕木粗細。
  strokeWeight(3);

  // 繪製枕木。
  for (
    let railX = x - 55;
    railX <= x + 55;
    railX += 18
  ) {
    // 繪製單一枕木。
    line(railX, y - 7, railX, y + 9);
  }
}

// 滑鼠按下事件。
function mousePressed() {
  // 將滑鼠座標轉為設計座標。
  const x = mouseX / scaleFactor;

  // 將滑鼠座標轉為設計座標。
  const y = mouseY / scaleFactor;

  // 開始拖曳。
  beginDrag(x, y);

  // 阻止瀏覽器預設行為。
  return false;
}

// 滑鼠拖曳事件。
function mouseDragged() {
  // 更新拖曳中的水平座標。
  pointerX = mouseX / scaleFactor;

  // 更新拖曳中的垂直座標。
  pointerY = mouseY / scaleFactor;

  // 阻止瀏覽器預設行為。
  return false;
}

// 滑鼠放開事件。
function mouseReleased() {
  // 將滑鼠座標轉為設計座標。
  const x = mouseX / scaleFactor;

  // 將滑鼠座標轉為設計座標。
  const y = mouseY / scaleFactor;

  // 結束拖曳。
  endDrag(x, y);

  // 阻止瀏覽器預設行為。
  return false;
}

// 手機觸控開始事件。
function touchStarted(event) {
  // 如果沒有觸控點，就停止處理。
  if (touches.length === 0) {
    return false;
  }

  // 取得畫布在瀏覽器中的位置。
  const bounds =
    gameCanvas.elt.getBoundingClientRect();

  // 取得第一個觸控點。
  const touch = touches[0];

  // 計算觸控水平設計座標。
  const x =
    (touch.x - bounds.left) / scaleFactor;

  // 計算觸控垂直設計座標。
  const y =
    (touch.y - bounds.top) / scaleFactor;

  // 開始拖曳。
  beginDrag(x, y);

  // 阻止瀏覽器預設行為。
  if (event) {
    event.preventDefault();
  }

  // 阻止頁面捲動。
  return false;
}

// 手機觸控移動事件。
function touchMoved(event) {
  // 如果沒有觸控點，就停止處理。
  if (touches.length === 0) {
    return false;
  }

  // 取得畫布位置。
  const bounds =
    gameCanvas.elt.getBoundingClientRect();

  // 取得第一個觸控點。
  const touch = touches[0];

  // 更新拖曳水平座標。
  pointerX =
    (touch.x - bounds.left) / scaleFactor;

  // 更新拖曳垂直座標。
  pointerY =
    (touch.y - bounds.top) / scaleFactor;

  // 阻止瀏覽器預設行為。
  if (event) {
    event.preventDefault();
  }

  // 阻止頁面捲動。
  return false;
}

// 手機觸控結束事件。
function touchEnded(event) {
  // 使用最後拖曳位置結束拖曳。
  endDrag(pointerX, pointerY);

  // 阻止瀏覽器預設行為。
  if (event) {
    event.preventDefault();
  }

  // 阻止頁面捲動。
  return false;
}

// 開始拖曳文字。
function beginDrag(x, y) {
  // 如果遊戲完成，就檢查重新開始按鈕。
  if (gameFinished) {
    // 如果點擊重新開始按鈕，就重設遊戲。
    if (isInside(x, y, restartButton)) {
      resetGame();
    }

    // 結束函式。
    return;
  }

  // 逐一檢查左側文字區域。
  for (const wordArea of wordAreas) {
    // 已配對文字不能再次拖曳。
    if (matchedIds.has(wordArea.id)) {
      continue;
    }

    // 如果指標位於文字區域，就開始拖曳。
    if (isInside(x, y, wordArea)) {
      // 設定目前拖曳文字。
      draggingWord = wordArea;

      // 儲存拖曳位置。
      pointerX = x;
      pointerY = y;

      // 清除其他文字選取狀態。
      wordAreas.forEach(item => {
        item.selected = false;
      });

      // 選取目前文字。
      wordArea.selected = true;

      // 結束搜尋。
      break;
    }
  }
}

// 結束拖曳文字。
function endDrag(x, y) {
  // 如果目前沒有拖曳文字，就結束。
  if (draggingWord === null) {
    return;
  }

  // 找出放下位置的圖片區域。
  const targetArea = vehicleAreas.find(area => {
    return isInside(x, y, area);
  });

  // 如果找到圖片區域，就檢查答案。
  if (targetArea) {
    checkAnswer(draggingWord, targetArea);
  }

  // 清除拖曳狀態。
  draggingWord = null;

  // 清除文字選取狀態。
  wordAreas.forEach(item => {
    item.selected = false;
  });
}

// 檢查答案是否正確。
function checkAnswer(wordArea, targetArea) {
  // 如果圖片已經配對，就停止處理。
  if (matchedIds.has(targetArea.id)) {
    return;
  }

  // 判斷文字與圖片是否相同。
  const isCorrect =
    wordArea.id === targetArea.id;

  // 如果答案正確。
  if (isCorrect) {
    // 將編號加入成功集合。
    matchedIds.add(wordArea.id);

    // 增加完成題數。
    completedCount += 1;

    // 記錄答對。
    answerRecords[wordArea.id] = true;

    // 如果六題全部完成，就結束遊戲。
    if (completedCount === vehicles.length) {
      gameFinished = true;
    }

    // 結束函式。
    return;
  }

  // 記錄答錯。
  answerRecords[wordArea.id] = false;

  // 設定錯誤顯示時間。
  targetArea.wrongUntil = millis() + 800;

  // 建立錯誤提示。
  errorAnimation = {
    x: targetArea.x + targetArea.w / 2,
    y: targetArea.y - 10,
    until: millis() + 800
  };
}

// 判斷座標是否位於區域內。
function isInside(x, y, area) {
  // 回傳座標是否在矩形範圍中。
  return (
    x >= area.x &&
    x <= area.x + area.w &&
    y >= area.y &&
    y <= area.y + area.h
  );
}

// 將陣列隨機打亂。
function shuffleArray(items) {
  // 複製原始陣列。
  const result = [...items];

  // 從最後一個元素開始交換。
  for (let index = result.length - 1; index > 0; index -= 1) {
    // 取得隨機索引。
    const randomIndex = Math.floor(
      Math.random() * (index + 1)
    );

    // 交換兩個陣列元素。
    [result[index], result[randomIndex]] = [
      result[randomIndex],
      result[index]
    ];
  }

  // 回傳打亂後的陣列。
  return result;
}