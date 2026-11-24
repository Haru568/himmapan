// สมุดเวทมนตร์ หน้าทบทวน (code = บล็อกตัวอย่าง [cat, indent, text])
(function (root) {
  var PAGES = [
    {
      id: 'spell-5-1', week: 5, title: 'App Lab และ id', unlock: 'start',
      body: [
        'App Lab มีสองส่วน: <b>Design</b> สำหรับวางหน้าจอ (ป้ายข้อความ ช่องกรอก ปุ่ม) และ <b>Code</b> สำหรับเขียนคำสั่ง',
        'ทุกชิ้นส่วนในหน้าจอต้องมี <b>id</b> คือชื่อที่โค้ดใช้เรียก',
        'กฎ 3 ข้อของ id: ใช้ภาษาอังกฤษ ห้ามเว้นวรรค และตัวพิมพ์เล็กพิมพ์ใหญ่ต้องตรงกันทุกตัว',
        'ตัวอย่างที่ดี: <code>widthInput</code> <code>calcButton</code> <code>resultLabel</code>'
      ]
    },
    {
      id: 'spell-5-2', week: 5, title: 'บล็อก 4 ตัวของโปรแกรมแบบลำดับ', unlock: 'w5-q1',
      body: [
        '<code>onEvent</code> ทำงานเมื่อเกิดเหตุการณ์ เช่น กดปุ่ม',
        '<code>getNumber</code> อ่านค่าจากช่องกรอกเป็นตัวเลข',
        '<code>var</code> สร้างตัวแปรเก็บค่า',
        '<code>setText</code> แสดงผลบนป้ายข้อความ',
        'โปรแกรมแบบลำดับทำงานทีละบรรทัดจากบนลงล่าง ไม่ข้าม ไม่ย้อนกลับ: รับค่า → คำนวณ → แสดงผล'
      ],
      code: [
        ['ui', 0, 'onEvent("calcButton", "click", function() {'],
        ['var', 1, 'var w = getNumber("widthInput");'],
        ['var', 1, 'var l = getNumber("lengthInput");'],
        ['var', 1, 'var area = w * l;'],
        ['ui', 1, 'setText("resultLabel", "พื้นที่ = " + area);'],
        ['ui', 0, '});']
      ]
    },
    {
      id: 'spell-5-3', week: 5, title: 'ปัญหาที่พบบ่อย: ยักษ์วัดแจ้ง', unlock: 'w5-q2',
      table: [
        ['อาการ', 'สาเหตุ', 'วิธีแก้'],
        ['กดปุ่มแล้วไม่มีอะไรเกิดขึ้น', 'id ในโค้ดไม่ตรงกับหน้าจอ', 'ตรวจ id ทุกตัวอักษร'],
        ['5 + 8 ได้ 58', 'ใช้ getText อ่านเป็นข้อความ', 'เปลี่ยนเป็น getNumber'],
        ['ผลลัพธ์เป็น NaN', 'ช่องกรอกว่างหรือกรอกตัวอักษร', 'กรอกตัวเลขก่อนกดปุ่ม'],
        ['มีสามเหลี่ยมเตือน', 'บล็อกไม่ครบหรือเขียนผิด', 'อ่านข้อความเตือน แล้วแก้บรรทัดนั้น']
      ]
    },
    {
      id: 'spell-6-1', week: 6, title: 'if / else และเครื่องหมายเปรียบเทียบ', unlock: 'w6-q1',
      body: [
        '<code>if</code> คือทาง T (จริง) ของกล่องข้าวหลามตัด <code>else</code> คือทาง F (เท็จ) โปรแกรมทำเพียงทางเดียว',
        'เครื่องหมาย: <code>&gt;=</code> มากกว่าหรือเท่ากับ, <code>&gt;</code> มากกว่า, <code>&lt;=</code> น้อยกว่าหรือเท่ากับ, <code>&lt;</code> น้อยกว่า, <code>==</code> เท่ากัน',
        'ระวัง: <code>=</code> ตัวเดียวคือเก็บค่า ไม่ใช่เปรียบเทียบ'
      ],
      table: [
        ['เงื่อนไข', 'score = 50', 'score = 49'],
        ['score >= 50', 'จริง', 'เท็จ'],
        ['score > 50', 'เท็จ', 'เท็จ'],
        ['score == 50', 'จริง', 'เท็จ']
      ],
      code: [
        ['ui', 0, 'onEvent("checkButton", "click", function() {'],
        ['var', 1, 'var score = getNumber("scoreInput");'],
        ['control', 1, 'if (score >= 50) {'],
        ['ui', 2, 'setText("resultLabel", "ผ่าน");'],
        ['control', 1, '} else {'],
        ['ui', 2, 'setText("resultLabel", "ไม่ผ่าน");'],
        ['control', 1, '}'],
        ['ui', 0, '});']
      ]
    },
    {
      id: 'spell-6-2', week: 6, title: 'ทดสอบค่าตรงเส้นแบ่ง', unlock: 'w6-q2',
      body: [
        'ทดสอบเงื่อนไขทุกครั้งด้วยค่า 3 แบบ: เหนือเส้น ตรงเส้น ใต้เส้น',
        'เกณฑ์ผ่าน 50 ทดสอบด้วย 80, 50, 49 / เกณฑ์มีไข้ 37.5 ทดสอบด้วย 39, 37.5, 37.4'
      ],
      table: [
        ['อาการ', 'สาเหตุ', 'วิธีแก้'],
        ['ได้ 50 แต่ไม่ผ่าน', 'ใช้ > แทน >=', 'เปลี่ยนเป็น >='],
        ['ผลเป็นจริงทุกครั้ง', 'ใช้ = ตัวเดียว', 'ใช้เครื่องหมายเปรียบเทียบ'],
        ['ไม่ผ่านแล้วไม่มีอะไรขึ้น', 'ลืม setText ใน else', 'เพิ่ม setText ในส่วน else']
      ]
    },
    {
      id: 'spell-7-1', week: 7, title: 'การทำซ้ำ 3 ส่วน', unlock: 'w7-q1',
      body: [
        'การทำซ้ำมี 3 ส่วน: <b>ค่าเริ่มต้น</b> → <b>เงื่อนไข</b> (ตรวจก่อนทุกรอบ) → <b>ปรับค่า</b>',
        'ถ้าลืมปรับค่า เงื่อนไขจะเป็นจริงตลอด โปรแกรมวนไม่รู้จบ',
        'ตัวอย่างนี้วน 12 รอบ และเมื่อจบ A มีค่า 13'
      ],
      code: [
        ['var', 0, 'var A = 1;'],
        ['control', 0, 'while (A <= 12) {'],
        ['var', 1, 'var C = A * 2;'],
        ['var', 1, 'A = A + 1;'],
        ['control', 0, '}']
      ]
    },
    {
      id: 'spell-7-2', week: 7, title: 'while กับ for', unlock: 'w7-q2',
      body: [
        '<code>for</code> รวมค่าเริ่มต้น เงื่อนไข และการปรับค่าไว้ในบรรทัดเดียว',
        '<code>i++</code> คือ <code>i = i + 1</code> และ <code>"\\n"</code> คือขึ้นบรรทัดใหม่ ใช้คู่กับ Text Area'
      ],
      code: [
        ['var', 0, 'var text = "";'],
        ['control', 0, 'for (var i = 1; i <= 12; i++) {'],
        ['var', 1, 'text = text + "2 x " + i + " = " + (2 * i) + "\\n";'],
        ['control', 0, '}'],
        ['ui', 0, 'setText("resultArea", text);']
      ]
    }
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = PAGES;
  else root.SpellPages = PAGES;
})(this);
