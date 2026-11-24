// ค่าตั้งของเกม (ครูแก้ได้)
var CONFIG = {
  // ลิงก์เว็บแอป Apps Script (ลงท้ายด้วย /exec) ว่างไว้ = เล่นแบบออฟไลน์
  API_URL: 'https://script.google.com/macros/s/AKfycbyt2XF5_wusP9mFlBsId1DGN0loHJKVDK5laUz_CQQdzhocmIbUdUgtE8FL3mdspPnbYQ/exec',
  // โลกที่เปิดเมื่อเล่นแบบออฟไลน์
  OFFLINE_WORLDS: [1],
  ROOMS: ['1/5', '1/6', '1/7', '1/8', '1/9'],
  // เมื่อออฟไลน์ ประตูบอสเปิดหลังผ่านภารกิจครบทุกภารกิจในโลก
  OFFLINE_BOSS_AFTER_QUESTS: true,
  POLL_CONFIG_MS: 30000,
  POLL_BOARD_MS: 10000
};
