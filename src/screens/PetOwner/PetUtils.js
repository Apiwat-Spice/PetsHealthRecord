// ไฟล์: PetUtils.js

// คำนวณอายุจากวันเกิด (short=true แสดงเฉพาะปี / short=false แสดงปีและเดือน)
export const calcAge = (birthdate, short = false) => {
    if (!birthdate) return '-';
    const b = new Date(`${String(birthdate).slice(0, 10)}T00:00:00`);
    if (isNaN(b.getTime())) return '-';

    const now = new Date();
    let years = now.getFullYear() - b.getFullYear();
    let months = now.getMonth() - b.getMonth();
    if (now.getDate() < b.getDate()) months -= 1;
    if (months < 0) {
        years -= 1;
        months += 12;
    }
    if (years < 0) return '-';
    if (years === 0) return months <= 0 ? 'ไม่ถึง 1 เดือน' : `${months} เดือน`;
    if (short || months === 0) return `${years} ปี`;
    return `${years} ปี ${months} เดือน`;
};

// จัดรูปแบบน้ำหนักให้แสดงหน่วย "กก."
export const formatWeight = (weight) => {
    if (weight === null || weight === undefined || weight === '') return '-';
    const n = Number(weight);
    if (!isFinite(n)) return '-';
    return `${parseFloat(n.toFixed(2))} กก.`;
};

// แปลงค่าเพศเป็นข้อความพร้อมสัญลักษณ์
export const sexLabel = (sex) => ({ male: 'เพศผู้ ♂', female: 'เพศเมีย ♀' }[sex] || 'ไม่ระบุ');

// แยกข้อควรระวัง / แพ้ยา เป็นรายการ (รองรับการคั่นด้วยบรรทัดใหม่, เครื่องหมายคอมมา หรือเครื่องหมายวรรคตอน)
export const splitCautions = (detail) =>
    String(detail || '')
        .split(/[\n,;，、]+/)
        .map((s) => s.trim())
        .filter(Boolean);