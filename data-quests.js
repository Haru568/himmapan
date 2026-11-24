// ข้อมูลโลกและภารกิจ (ปรับให้ง่ายขึ้น 24 พ.ย. 2569: ภารกิจละ 3 ขั้น ขั้นยากย้ายไปด่านท้าทาย)
(function (root) {
  function L(id, cat, indent, text) { return { id: id, cat: cat, indent: indent, text: text }; }

  // ---------- ภารกิจ 1 พระราม: แอปพื้นที่ ----------
  var areaDesign = [
    { type: 'label', id: 'titleLabel', text: 'โปรแกรมคำนวณพื้นที่สี่เหลี่ยมผืนผ้า', title: true },
    { type: 'input', id: 'widthInput', placeholder: 'ความกว้าง (ซม.)' },
    { type: 'input', id: 'lengthInput', placeholder: 'ความยาว (ซม.)' },
    { type: 'button', id: 'calcButton', text: 'คำนวณ' },
    { type: 'label', id: 'resultLabel', text: 'พื้นที่ = ?' }
  ];
  var areaDesignP = areaDesign.concat([{ type: 'label', id: 'perimeterLabel', text: 'เส้นรอบรูป = ?' }]);

  var areaCode = [
    L('b1', 'ui', 0, 'onEvent("calcButton", "click", function() {'),
    L('b2', 'var', 1, 'var w = getNumber("widthInput");'),
    L('b3', 'var', 1, 'var l = getNumber("lengthInput");'),
    L('b4', 'var', 1, 'var area = w * l;'),
    L('b5', 'ui', 1, 'setText("resultLabel", "พื้นที่ = " + area + " ตารางเซนติเมตร");'),
    L('b6', 'ui', 0, '});')
  ];
  var areaFlow = [
    { id: 'f0', shape: 'terminal', text: 'เริ่ม (กดปุ่มคำนวณ)', link: ['b1'] },
    { id: 'f1', shape: 'io', text: 'รับค่า กว้าง, ยาว', link: ['b2', 'b3'] },
    { id: 'f2', shape: 'process', text: 'พื้นที่ = กว้าง x ยาว', link: ['b4'] },
    { id: 'f3', shape: 'io', text: 'แสดงค่า พื้นที่', link: ['b5'] },
    { id: 'f4', shape: 'terminal', text: 'จบ', link: ['b6'] }
  ];
  var perimCodeBug = [
    L('b1', 'ui', 0, 'onEvent("calcButton", "click", function() {'),
    L('b2', 'var', 1, 'var w = getText("widthInput");'),
    L('b3', 'var', 1, 'var l = getText("lengthInput");'),
    L('b4', 'var', 1, 'var area = w * l;'),
    L('b7', 'var', 1, 'var p = 2 * (w + l);'),
    L('b5', 'ui', 1, 'setText("resultLabel", "พื้นที่ = " + area + " ตารางเซนติเมตร");'),
    L('b8', 'ui', 1, 'setText("perimeterLabel", "เส้นรอบรูป = " + p + " เซนติเมตร");'),
    L('b6', 'ui', 0, '});')
  ];
  var perimFlow = [
    { id: 'f0', shape: 'terminal', text: 'เริ่ม (กดปุ่มคำนวณ)', link: ['b1'] },
    { id: 'f1', shape: 'io', text: 'รับค่า กว้าง, ยาว', link: ['b2', 'b3'] },
    { id: 'f2', shape: 'process', text: 'พื้นที่ = กว้าง x ยาว', link: ['b4'] },
    { id: 'f2b', shape: 'process', text: 'เส้นรอบรูป = 2 x (กว้าง + ยาว)', link: ['b7'] },
    { id: 'f3', shape: 'io', text: 'แสดงค่า พื้นที่, เส้นรอบรูป', link: ['b5', 'b8'] },
    { id: 'f4', shape: 'terminal', text: 'จบ', link: ['b6'] }
  ];
  var idBugCode = areaCode.map(function (l) {
    return l.id === 'b1' ? L('b1', 'ui', 0, 'onEvent("calcbutton", "click", function() {') : l;
  });

  // ---------- ภารกิจ 2 ศรีธนญชัย: แปลงอุณหภูมิ ----------
  var tempDesign = [
    { type: 'label', id: 'titleLabel', text: 'แปลงอุณหภูมิ', title: true },
    { type: 'input', id: 'celsiusInput', placeholder: 'องศาเซลเซียส' },
    { type: 'button', id: 'convertButton', text: 'แปลง' },
    { type: 'label', id: 'resultLabel', text: 'ผล = ?' }
  ];
  var tempCode = [
    L('c1', 'ui', 0, 'onEvent("convertButton", "click", function() {'),
    L('c2', 'var', 1, 'var c = getNumber("celsiusInput");'),
    L('c3', 'var', 1, 'var f = c * 9 / 5 + 32;'),
    L('c4', 'ui', 1, 'setText("resultLabel", c + " °C = " + f + " °F");'),
    L('c5', 'ui', 0, '});')
  ];
  var tempFlow = [
    { id: 'g0', shape: 'terminal', text: 'เริ่ม (กดปุ่มแปลง)', link: ['c1'] },
    { id: 'g1', shape: 'io', text: 'รับค่า C', link: ['c2'] },
    { id: 'g2', shape: 'process', text: 'F = C x 9 ÷ 5 + 32', link: ['c3'] },
    { id: 'g3', shape: 'io', text: 'แสดงค่า F', link: ['c4'] },
    { id: 'g4', shape: 'terminal', text: 'จบ', link: ['c5'] }
  ];
  var tempFillCode = tempCode.map(function (l) {
    return l.id === 'c3' ? L('c3', 'var', 1, 'var f = {{1}};') : l;
  });

  var QUESTS = {
    'w5-q1': {
      id: 'w5-q1', week: 5, world: 1, owner: 'npc-phra-ram', ownerName: 'พระราม',
      title: 'ถนนข้ามไปลงกา',
      appName: 'แอปคำนวณพื้นที่',
      intro: 'ยักษ์บั๊กทำแอปคำนวณพื้นที่ของข้าพัง! ช่วยข้าซ่อมที',
      unlockPages: ['spell-5-2'],
      steps: [
        {
          type: 'match', design: areaDesign, code: areaCode, flow: areaFlow,
          question: 'แตะกล่องในผังงาน แล้วแตะบล็อกที่ทำงานเดียวกัน',
          pairs: { f0: ['b1'], f1: ['b2', 'b3'], f2: ['b4'], f3: ['b5'] },
          hint: 'รับค่า = getNumber · แสดงค่า = setText',
          explain: 'ผังงานกับบล็อกคือสิ่งเดียวกัน ทำงานจากบนลงล่าง!'
        },
        {
          type: 'predict', design: areaDesign, code: areaCode, flow: areaFlow,
          values: { widthInput: '5', lengthInput: '8' }, press: 'calcButton',
          question: 'กรอกกว้าง 5 ยาว 8 แล้วกดปุ่ม แอปจะขึ้นว่าอะไร',
          choices: ['พื้นที่ = 40 ตารางเซนติเมตร', 'พื้นที่ = 13 ตารางเซนติเมตร', 'พื้นที่ = 58 ตารางเซนติเมตร', 'พื้นที่ = 3 ตารางเซนติเมตร'],
          answer: 0,
          hint: 'area = w * l และ * คือคูณ → 5 x 8',
          explain: '5 x 8 = 40 ถูกต้อง! ลองกด ▶ ลองรัน ดูได้'
        },
        {
          type: 'bug', design: areaDesign, code: idBugCode, flow: areaFlow,
          values: { widthInput: '5', lengthInput: '8' }, press: 'calcButton',
          question: 'กดปุ่มแล้วไม่มีอะไรเกิดขึ้น! แตะบล็อกที่ผิด',
          badLines: ['b1'], from: '"calcbutton"',
          fixChoices: ['"calcbutton"', '"calcButton"', '"CalcButton"', '"calc Button"'], fixAnswer: '"calcButton"',
          fixQuestion: 'ปุ่มในหน้าจอชื่อ id อะไร (กด "แสดง id" ดูได้)',
          check: { id: 'resultLabel', text: 'พื้นที่ = 40 ตารางเซนติเมตร' },
          hint: 'ดูบรรทัดที่มีชื่อปุ่ม ตัวพิมพ์ใหญ่-เล็กต้องตรงกัน',
          explain: 'calcButton ตัว B ใหญ่ ตรงกับหน้าจอแล้ว แอปใช้ได้!'
        }
      ]
    },
    'w5-q2': {
      id: 'w5-q2', week: 5, world: 1, owner: 'npc-sri-thanonchai', ownerName: 'ศรีธนญชัย',
      title: 'เทอร์โมมิเตอร์เจ้าเล่ห์',
      appName: 'แอปแปลงอุณหภูมิ',
      intro: 'แอปแปลงอุณหภูมิของข้ารวน คราวนี้ข้าไม่ได้โกงนะ ช่วยด้วย!',
      unlockPages: ['spell-5-3'],
      steps: [
        {
          type: 'order', design: tempDesign, code: tempCode, flow: tempFlow,
          wrapper: ['c1', 'c5'], items: ['c2', 'c3', 'c4'], values: { celsiusInput: '25' }, press: 'convertButton',
          question: 'บล็อกหลุด! แตะเรียงให้ถูกลำดับ',
          hint: 'รับค่า → คำนวณ → แสดงผล',
          explain: 'รับค่า → คำนวณ → แสดงผล คือหัวใจของโปรแกรมแบบลำดับ!'
        },
        {
          type: 'fill', design: tempDesign, code: tempFillCode, flow: tempFlow,
          values: { celsiusInput: '100' }, press: 'convertButton',
          question: 'สูตรหายไป! แตะช่อง ? แล้วเลือกสูตร (ดูผังงานช่วยได้)',
          blanks: { '1': { choices: ['c * 9 / 5 + 32', 'c + 32', 'c * 5 / 9 + 32', 'c - 32'], answer: 'c * 9 / 5 + 32' } },
          check: { id: 'resultLabel', text: '100 °C = 212 °F' },
          hint: 'ผังงานเขียนว่า F = C x 9 ÷ 5 + 32',
          explain: '100 x 9 ÷ 5 + 32 = 212 ถูกต้อง!'
        },
        {
          type: 'test', design: tempDesign, code: tempCode, flow: tempFlow,
          inputId: 'celsiusInput', press: 'convertButton', outputId: 'resultLabel',
          question: 'ทดสอบแอป: แตะค่าทางซ้าย แล้วแตะผลทางขวา',
          pairs: [['0', '0 °C = 32 °F'], ['100', '100 °C = 212 °F'], ['37', '37 °C = 98.6 °F']],
          hint: 'ดูตัวเลขหน้า °C ทางขวา ต้องตรงกับค่าที่กรอก',
          explain: 'ทดสอบครบ แอปทำงานถูกหมด!'
        }
      ]
    },
    'w5-bonus': {
      id: 'w5-bonus', week: 5, world: 1, owner: 'npc-ruesi', ownerName: 'พระฤๅษี', bonus: true,
      title: 'ด่านท้าทายของพระฤๅษี',
      appName: 'สำหรับศิษย์ที่อยากเก่งขึ้น',
      intro: 'เก่งมากศิษย์! ด่านนี้ยากขึ้น ข้าอยากรู้ว่าเจ้าจะผ่านไหม',
      unlockPages: [],
      steps: [
        {
          type: 'bug', design: areaDesignP, code: perimCodeBug, flow: perimFlow,
          values: { widthInput: '5', lengthInput: '8' }, press: 'calcButton',
          question: 'กรอก 5 กับ 8 เส้นรอบรูปควรได้ 26 แต่ได้ 116! แตะบล็อกที่ผิด',
          badLines: ['b2', 'b3'], from: 'getText',
          fixChoices: ['getNumber', 'getText', 'setText', 'onEvent'], fixAnswer: 'getNumber',
          fixQuestion: 'ต้องเปลี่ยน getText เป็นคำสั่งใด',
          check: { id: 'perimeterLabel', text: 'เส้นรอบรูป = 26 เซนติเมตร' },
          hint: 'getText อ่านเป็นข้อความ "5"+"8" จึงต่อกันเป็น "58"',
          explain: 'getNumber อ่านเป็นตัวเลข 5 + 8 = 13 และ 2 x 13 = 26 ถูกต้อง!'
        },
        {
          type: 'predict', design: tempDesign, code: tempCode, flow: tempFlow, showFirst: true,
          values: { celsiusInput: '' }, press: 'convertButton',
          question: 'กดปุ่มโดยไม่กรอกอะไร แอปขึ้น NaN เพราะอะไร',
          choices: ['ช่องว่าง getNumber จึงอ่านเป็นตัวเลขไม่ได้', 'ใช้สูตรผิด', 'id ของปุ่มผิด', 'ลืมใส่ setText'],
          answer: 0,
          hint: 'NaN = Not a Number แปลว่า "ไม่ใช่ตัวเลข"',
          explain: 'ช่องว่างอ่านเป็นตัวเลขไม่ได้ จึงได้ NaN ต้องกรอกตัวเลขก่อนกดปุ่ม'
        }
      ]
    }
  };

  var WORLDS = [
    { n: 1, week: 5, name: 'ท่าน้ำลงกา', topic: 'การเขียนโปรแกรมแบบลำดับ', theme: 'dawn',
      quests: ['w5-q1', 'w5-q2'], bonus: ['w5-bonus'], boss: 'yak', pos: { x: 17, y: 68 } },
    { n: 2, week: 6, name: 'เกาะแก้วพิสดาร', topic: 'การเขียนโปรแกรมแบบเลือกทำ', theme: 'jungle',
      quests: [], boss: 'phisuea', pos: { x: 37, y: 40 } },
    { n: 3, week: 7, name: 'ค่ายหุ่นพยนต์', topic: 'การเขียนโปรแกรมแบบทำซ้ำ', theme: 'night',
      quests: [], boss: 'thotsakan', pos: { x: 75, y: 62 } }
  ];

  var CHARACTERS = [
    { id: 'hanuman', name: 'หนุมาน', from: 'รามเกียรติ์', color: '#5DCAD5' },
    { id: 'sangthong', name: 'สังข์ทอง', from: 'สังข์ทอง', color: '#E2B44A' },
    { id: 'phra-aphai', name: 'พระอภัยมณี', from: 'พระอภัยมณี', color: '#9B7BEA' },
    { id: 'manohra', name: 'มโนราห์', from: 'พระสุธน-มโนราห์', color: '#E57BB8' },
    { id: 'mermaid', name: 'นางเงือก', from: 'พระอภัยมณี', color: '#3FC6B7' },
    { id: 'mekhala', name: 'เมขลา', from: 'ตำนานเมขลา-รามสูร', color: '#9FD3F0' }
  ];

  var GUILDS = [
    { id: 'นาคา', color: '#2FAF7A' },
    { id: 'หงส์', color: '#E8C25A' },
    { id: 'กินรี', color: '#E57BB8' },
    { id: 'คชสีห์', color: '#F08A3C' },
    { id: 'มัจฉานุ', color: '#4FA8E8' }
  ];

  var TITLES = [
    { xp: 0, name: 'ศิษย์ใหม่' }, { xp: 50, name: 'ช่างฝึกหัด' }, { xp: 150, name: 'ช่างฝีมือ' },
    { xp: 300, name: 'ช่างชำนาญ' }, { xp: 500, name: 'จอมช่างหิมพานต์' }
  ];

  var Data = { QUESTS: QUESTS, WORLDS: WORLDS, CHARACTERS: CHARACTERS, GUILDS: GUILDS, TITLES: TITLES };
  if (typeof module !== 'undefined' && module.exports) module.exports = Data;
  else root.GameData = Data;
})(this);
