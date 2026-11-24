// ข้อมูลโลกและภารกิจ (ค่าในไฟล์นี้ตรวจกับข้อกำหนดแล้ว ห้ามแก้เอง)
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
      intro: 'ศิษย์สำนักพระฤๅษีมาพอดี! ข้าต้องคำนวณพื้นที่แผ่นหินเพื่อสร้างถนนข้ามไปลงกา แต่ยักษ์บั๊กทำแอปของข้าพัง ช่วยข้าซ่อมที',
      unlockPages: ['spell-5-2'],
      steps: [
        {
          type: 'match', design: areaDesign, code: areaCode, flow: areaFlow,
          question: 'จับคู่ผังงานกับบล็อก: แตะกล่องในผังงาน แล้วแตะบล็อกที่ทำงานเดียวกัน',
          pairs: { f0: ['b1'], f1: ['b2', 'b3'], f2: ['b4'], f3: ['b5'] },
          hint: 'กล่องรับค่าคือบรรทัดที่อ่านค่าจากช่องกรอก กล่องแสดงค่าคือบรรทัดที่เปลี่ยนข้อความบนป้าย',
          explain: 'ผังงานกับบล็อกคือสิ่งเดียวกัน! กล่องแต่ละกล่องกลายเป็นบล็อกหนึ่งหรือสองบรรทัด และทำงานเรียงจากบนลงล่าง'
        },
        {
          type: 'predict', design: areaDesign, code: areaCode, flow: areaFlow,
          values: { widthInput: '5', lengthInput: '8' }, press: 'calcButton',
          question: 'ถ้ากรอกความกว้าง 5 ความยาว 8 แล้วกดปุ่มคำนวณ แอปจะแสดงข้อความใด',
          choices: ['พื้นที่ = 40 ตารางเซนติเมตร', 'พื้นที่ = 13 ตารางเซนติเมตร', 'พื้นที่ = 58 ตารางเซนติเมตร', 'พื้นที่ = NaN ตารางเซนติเมตร'],
          answer: 0,
          hint: 'ไล่ทีละบรรทัด: w เก็บ 5, l เก็บ 8 แล้ว area = w * l เครื่องหมาย * คือคูณ',
          explain: '5 x 8 = 40 ถูกต้อง! แอปของข้าทำงานแล้ว ลองกด Run เล่นกับตัวเลขอื่นดูได้'
        },
        {
          type: 'bug', design: areaDesignP, code: perimCodeBug, flow: perimFlow,
          values: { widthInput: '5', lengthInput: '8' }, press: 'calcButton',
          question: 'ข้าเพิ่มการคำนวณเส้นรอบรูป แต่กรอก 5 กับ 8 กลับได้ 116 แทนที่จะเป็น 26! แตะบล็อกที่ผิด',
          badLines: ['b2', 'b3'], from: 'getText',
          fixChoices: ['getNumber', 'getText', 'setText', 'onEvent'], fixAnswer: 'getNumber',
          fixQuestion: 'ถูกแล้ว ต้องเปลี่ยน getText เป็นคำสั่งใด',
          check: { id: 'perimeterLabel', text: 'เส้นรอบรูป = 26 เซนติเมตร' },
          hint: 'getText อ่านค่าเป็นข้อความ "5" + "8" ของข้อความคือการต่อกันเป็น "58" แล้ว 2 x 58 = 116',
          explain: 'getNumber อ่านค่าเป็นตัวเลข 5 + 8 จึงได้ 13 และ 2 x 13 = 26 ถูกต้อง! ยักษ์วัดแจ้งชอบแอบเปลี่ยนเป็น getText'
        },
        {
          type: 'bug', design: areaDesign, code: idBugCode, flow: areaFlow,
          values: { widthInput: '5', lengthInput: '8' }, press: 'calcButton',
          question: 'ยักษ์แก้โค้ดอีกแล้ว! กดปุ่มคำนวณแล้วไม่มีอะไรเกิดขึ้นเลย ดูข้อความเตือนใต้มือถือ แล้วแตะบล็อกที่ผิด',
          badLines: ['b1'], from: '"calcbutton"',
          fixChoices: ['"calcbutton"', '"calcButton"', '"CalcButton"', '"calc Button"'], fixAnswer: '"calcButton"',
          fixQuestion: 'id ของปุ่มในหน้าจอคืออะไร (กด "แสดง id" ดูได้)',
          check: { id: 'resultLabel', text: 'พื้นที่ = 40 ตารางเซนติเมตร' },
          hint: 'id ต้องตรงกับในหน้าจอทุกตัวอักษร รวมตัวพิมพ์เล็กพิมพ์ใหญ่',
          explain: 'calcButton ตัว B ใหญ่ ตรงกับหน้าจอแล้ว ปุ่มจึงทำงาน! ถนนข้ามไปลงกาพร้อมสร้างแล้ว'
        }
      ]
    },
    'w5-q2': {
      id: 'w5-q2', week: 5, world: 1, owner: 'npc-sri-thanonchai', ownerName: 'ศรีธนญชัย',
      title: 'เทอร์โมมิเตอร์เจ้าเล่ห์',
      appName: 'แอปแปลงอุณหภูมิ',
      intro: 'ข้าขายของให้พ่อค้าเมืองลังกาที่ใช้องศาฟาเรนไฮต์ แต่แอปแปลงหน่วยของข้ารวนจนเขาหาว่าข้าโกง! คราวนี้ข้าไม่ได้โกงจริง ๆ นะ ช่วยด้วย',
      unlockPages: ['spell-5-3'],
      steps: [
        {
          type: 'order', design: tempDesign, code: tempCode, flow: tempFlow,
          wrapper: ['c1', 'c5'], items: ['c2', 'c3', 'c4'], values: { celsiusInput: '25' }, press: 'convertButton',
          question: 'บล็อกในปุ่มหลุดออกมาหมด! แตะบล็อกเรียงตามลำดับที่ถูก',
          hint: 'ต้องมีค่า c ก่อนจึงคำนวณ f ได้ และต้องคำนวณ f ก่อนจึงแสดงผลได้',
          explain: 'รับค่า → คำนวณ → แสดงผล นี่คือหัวใจของโปรแกรมแบบลำดับ!'
        },
        {
          type: 'fill', design: tempDesign, code: tempFillCode, flow: tempFlow,
          values: { celsiusInput: '100' }, press: 'convertButton',
          question: 'สูตรแปลงหายไป! แตะช่อง ? แล้วเลือกสูตรที่ถูก (ทดสอบด้วย 100 องศาเซลเซียส ต้องได้ 212 องศาฟาเรนไฮต์)',
          blanks: { '1': { choices: ['c * 9 / 5 + 32', 'c + 32 * 9 / 5', 'c * 5 / 9 + 32', '(c + 32) * 9 / 5'], answer: 'c * 9 / 5 + 32' } },
          check: { id: 'resultLabel', text: '100 °C = 212 °F' },
          hint: 'สูตรคือ F = C x 9 ÷ 5 + 32 คูณและหารก่อน แล้วค่อยบวก 32',
          explain: '100 x 9 ÷ 5 + 32 = 212 ถูกต้อง! พ่อค้าลังกาเชื่อข้าแล้ว'
        },
        {
          type: 'test', design: tempDesign, code: tempCode, flow: tempFlow,
          inputId: 'celsiusInput', press: 'convertButton', outputId: 'resultLabel',
          question: 'ทดสอบแอปก่อนส่งมอบ: แตะค่าที่กรอกทางซ้าย แล้วแตะผลที่ต้องได้ทางขวา',
          pairs: [['0', '0 °C = 32 °F'], ['100', '100 °C = 212 °F'], ['37', '37 °C = 98.6 °F'], ['-40', '-40 °C = -40 °F']],
          hint: 'ลองคิดทีละค่า: 0 x 9 ÷ 5 + 32 = 32 และ 37 คืออุณหภูมิร่างกายปกติ',
          explain: 'ทดสอบครบทุกแบบ ทั้งศูนย์ ค่าบวก ทศนิยม และค่าติดลบ แอปทำงานถูกหมด!'
        },
        {
          type: 'predict', design: tempDesign, code: tempCode, flow: tempFlow, showFirst: true,
          values: { celsiusInput: '' }, press: 'convertButton',
          question: 'ลูกค้ากดปุ่มแปลงโดยไม่กรอกอะไรเลย แอปแสดงผลเป็น NaN สาเหตุคือข้อใด',
          choices: ['ช่องกรอกว่าง getNumber จึงอ่านเป็นตัวเลขไม่ได้', 'ใช้สูตรคำนวณผิด', 'id ของปุ่มไม่ตรงกับหน้าจอ', 'ลืมใส่คำสั่ง setText'],
          answer: 0,
          hint: 'NaN ย่อมาจาก Not a Number แปลว่า "ไม่ใช่ตัวเลข"',
          explain: 'ช่องว่างหรือตัวอักษรอ่านเป็นตัวเลขไม่ได้ จึงได้ NaN ต้องบอกผู้ใช้ให้กรอกตัวเลขก่อนกดปุ่ม'
        }
      ]
    }
  };

  var WORLDS = [
    { n: 1, week: 5, name: 'ท่าน้ำลงกา', topic: 'การเขียนโปรแกรมแบบลำดับ', theme: 'dawn',
      quests: ['w5-q1', 'w5-q2'], boss: 'yak', pos: { x: 17, y: 68 } },
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
