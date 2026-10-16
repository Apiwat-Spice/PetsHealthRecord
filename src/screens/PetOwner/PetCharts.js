import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Line, Polyline, Circle, Rect, Text as SvgText } from 'react-native-svg';

const THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

const parseDate = (s) => {
    const [y, m, d] = String(s).slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d);
};

const fmtTick = (v) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

// ============ กราฟเส้น: แนวโน้มน้ำหนัก ============
// ============ กราฟเส้น: แนวโน้มน้ำหนัก (ปรับปรุงความสวยงามและกระจายจุด) ============
export function WeightChart({ data }) {
    const [width, setWidth] = useState(0);
    const height = 210; // เพิ่มความสูงเล็กน้อยเพื่อใส่ตัวเลขเหนือจุด
    const pad = { top: 28, right: 24, bottom: 32, left: 38 };

    // 🟢 1. จัดการข้อมูล และแก้ไขกรณีวันที่ซ้ำกันให้ขยับระยะแกน X กระจายเท่าๆ กัน
    const rawPoints = (data || [])
        .map((d) => ({ t: parseDate(d.date).getTime(), w: Number(d.weight), date: d.date }))
        .filter((p) => isFinite(p.w) && isFinite(p.t))
        .sort((a, b) => a.t - b.t);

    if (rawPoints.length === 0) {
        return <Text style={styles.emptyText}>ยังไม่มีข้อมูลน้ำหนักจากการเข้ารับบริการ</Text>;
    }

    const n = rawPoints.length;
    const ws = rawPoints.map((p) => p.w);
    const minW = Math.min(...ws);
    const maxW = Math.max(...ws);
    const span = maxW - minW;
    const margin = span === 0 ? Math.max(1, maxW * 0.15) : span * 0.25;
    const yMin = Math.max(0, Math.floor((minW - margin) * 10) / 10);
    const yMax = Math.ceil((maxW + margin) * 10) / 10;
    const range = Math.max(yMax - yMin, 0.5);
    const ticks = [0, 1, 2, 3].map((i) => yMin + (range * i) / 3);

    const innerW = Math.max(width - pad.left - pad.right, 1);
    const innerH = height - pad.top - pad.bottom;

    // 🟢 2. ตรวจสอบว่ามีวันที่ซ้ำกันไหม ถ้าซ้ำกันหรือระยะเวลาเท่ากัน ให้กระจายแกน X เป็น Index แทน (ไม่ให้เส้นดิ่งลงมา 90 องศา)
    const hasDuplicateDates = rawPoints.some((p, i) => i > 0 && p.t === rawPoints[i - 1].t);
    const tMin = rawPoints[0].t;
    const tMax = rawPoints[n - 1].t;

    const getX = (p, index) => {
        if (n === 1) return pad.left + innerW / 2;
        if (hasDuplicateDates || tMax === tMin) {
            // กระจายจุดตามลำดับ Index (Slot-based) เพื่อให้เส้นเฉียงสวยงาม
            return pad.left + (index / (n - 1)) * innerW;
        }
        return pad.left + ((p.t - tMin) / (tMax - tMin)) * innerW;
    };

    const getY = (w) => pad.top + innerH - ((w - yMin) / range) * innerH;

    const points = rawPoints.map((p, i) => ({
        ...p,
        cx: getX(p, i),
        cy: getY(p.w)
    }));

    const labelOf = (p) => {
        const d = parseDate(p.date);
        if (isNaN(d.getTime())) return p.date;
        const month = THAI_MONTHS[d.getMonth()];
        const day = d.getDate();
        return `${day} ${month}`; // แสดง "17 ต.ค." เพื่อแยกแยะวันได้ชัดเจน
    };

    return (
        <View>
            <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ width: '100%' }}>
                {width > 0 && (
                    <Svg width={width} height={height}>
                        {/* เส้นแนวนอน Grid Lines */}
                        {ticks.map((v, i) => (
                            <React.Fragment key={`tick-${i}`}>
                                <Line x1={pad.left} x2={width - pad.right} y1={getY(v)} y2={getY(v)} stroke="#E6EDF2" strokeWidth={1} />
                                <SvgText x={pad.left - 6} y={getY(v) + 3} fontSize="10" fill="#8A9AA5" textAnchor="end">
                                    {fmtTick(v)}
                                </SvgText>
                            </React.Fragment>
                        ))}

                        {/* 🟢 เส้นเชื่อมกราฟ */}
                        {points.length > 1 && (
                            <Polyline
                                points={points.map((p) => `${p.cx},${p.cy}`).join(' ')}
                                fill="none"
                                stroke="#0056D2"
                                strokeWidth={1.5}
                                strokeLinejoin="round"
                                strokeLinecap="round"
                            />
                        )}

                        {/* 🟢 จุดวงกลม และ ตัวเลขน้ำหนักแปะบนจุด (4.3, 5.0, 7.0) */}
                        {points.map((p, i) => (
                            <React.Fragment key={`pt-${i}`}>
                                <Circle cx={p.cx} cy={p.cy} r={5} fill="#FFFFFF" stroke="#0056D2" strokeWidth={1} />

                                {/* ตัวเลขค่าน้ำหนักเหนือจุด */}
                                <SvgText
                                    x={p.cx}
                                    y={p.cy - 10}
                                    fontSize="11"
                                    fontWeight="bold"
                                    fill="#0056D2"
                                    textAnchor="middle"
                                >
                                    {p.w.toFixed(1)}
                                </SvgText>

                                {/* ป้ายวันที่ด้านล่างแกน X */}
                                <SvgText x={p.cx} y={height - 8} fontSize="10" fill="#64748B" textAnchor="middle">
                                    {labelOf(p)}
                                </SvgText>
                            </React.Fragment>
                        ))}
                    </Svg>
                )}
            </View>
            <Text style={styles.unitText}>น้ำหนัก (กก.)</Text>
        </View>
    );
}

// ============ กราฟแท่ง: สถิติการรับบริการ ============
export function ServiceBarChart({ items }) {
    const [width, setWidth] = useState(0);
    const height = 190;
    const pad = { top: 14, right: 16, bottom: 30, left: 30 };

    const list = items || [];
    const total = list.reduce((sum, i) => sum + i.count, 0);

    const maxCount = Math.max(1, ...list.map((i) => i.count));
    const steps = Math.min(maxCount, 4);
    const tickMax = Math.ceil(maxCount / steps) * steps;
    const ticks = Array.from({ length: steps + 1 }, (_, i) => (tickMax / steps) * i);

    const innerW = Math.max(width - pad.left - pad.right, 1);
    const innerH = height - pad.top - pad.bottom;
    const y = (v) => pad.top + innerH - (v / tickMax) * innerH;
    const slot = innerW / Math.max(list.length, 1);
    const barW = Math.min(40, slot * 0.5);

    return (
        <View>
            <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ width: '100%' }}>
                {width > 0 && (
                    <Svg width={width} height={height}>
                        {ticks.map((v, i) => (
                            <React.Fragment key={`tick-${i}`}>
                                <Line x1={pad.left} x2={width - pad.right} y1={y(v)} y2={y(v)} stroke="#E6EDF2" strokeWidth={1} />
                                <SvgText x={pad.left - 6} y={y(v) + 3} fontSize="10" fill="#8A9AA5" textAnchor="end">
                                    {String(v)}
                                </SvgText>
                            </React.Fragment>
                        ))}

                        {list.map((item, i) => {
                            const cx = pad.left + slot * i + slot / 2;
                            const barH = (item.count / tickMax) * innerH;
                            return (
                                <React.Fragment key={`bar-${i}`}>
                                    {item.count > 0 && (
                                        <>
                                            <Rect x={cx - barW / 2} y={y(item.count)} width={barW} height={barH} rx={4} fill="#7FE6C4" />
                                            <SvgText x={cx} y={y(item.count) - 4} fontSize="10" fill="#3AA384" fontWeight="bold" textAnchor="middle">
                                                {String(item.count)}
                                            </SvgText>
                                        </>
                                    )}
                                    <SvgText x={cx} y={height - 10} fontSize="10" fill="#8A9AA5" textAnchor="middle">
                                        {item.label}
                                    </SvgText>
                                </React.Fragment>
                            );
                        })}
                    </Svg>
                )}
            </View>
            {total === 0 && <Text style={styles.emptyText}>ยังไม่มีประวัติการเข้ารับบริการ</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    emptyText: { textAlign: 'center', color: '#9AA7B0', fontSize: 13, paddingVertical: 16 },
    unitText: { textAlign: 'right', color: '#9AA7B0', fontSize: 11, marginTop: 2 },
});