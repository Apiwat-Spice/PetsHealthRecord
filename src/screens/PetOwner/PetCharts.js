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
export function WeightChart({ data }) {
    const [width, setWidth] = useState(0);
    const height = 190;
    const pad = { top: 14, right: 16, bottom: 30, left: 38 };

    const points = (data || [])
        .map((d) => ({ t: parseDate(d.date).getTime(), w: Number(d.weight), date: d.date }))
        .filter((p) => isFinite(p.w) && isFinite(p.t))
        .sort((a, b) => a.t - b.t);

    if (points.length === 0) {
        return <Text style={styles.emptyText}>ยังไม่มีข้อมูลน้ำหนักจากการเข้ารับบริการ</Text>;
    }

    const ws = points.map((p) => p.w);
    const minW = Math.min(...ws);
    const maxW = Math.max(...ws);
    const span = maxW - minW;
    const margin = span === 0 ? Math.max(1, maxW * 0.1) : span * 0.2;
    const yMin = Math.max(0, Math.floor(minW - margin));
    const yMax = Math.ceil(maxW + margin);
    const range = Math.max(yMax - yMin, 1);
    const ticks = [0, 1, 2, 3, 4].map((i) => yMin + (range * i) / 4);

    const innerW = Math.max(width - pad.left - pad.right, 1);
    const innerH = height - pad.top - pad.bottom;
    const tMin = points[0].t;
    const tMax = points[points.length - 1].t;

    const x = (t) => (tMax === tMin ? pad.left + innerW / 2 : pad.left + ((t - tMin) / (tMax - tMin)) * innerW);
    const y = (w) => pad.top + innerH - ((w - yMin) / range) * innerH;

    const n = points.length;
    const labelIdx = [...new Set(n <= 5 ? points.map((_, i) => i) : [0, 1, 2, 3, 4].map((i) => Math.round((i * (n - 1)) / 4)))];
    const spansYears = new Date(tMin).getFullYear() !== new Date(tMax).getFullYear();
    const labelOf = (p) => {
        const d = new Date(p.t);
        const month = THAI_MONTHS[d.getMonth()];
        return spansYears ? `${month} ${String((d.getFullYear() + 543) % 100).padStart(2, '0')}` : month;
    };

    return (
        <View>
            <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ width: '100%' }}>
                {width > 0 && (
                    <Svg width={width} height={height}>
                        {ticks.map((v, i) => (
                            <React.Fragment key={`tick-${i}`}>
                                <Line x1={pad.left} x2={width - pad.right} y1={y(v)} y2={y(v)} stroke="#E6EDF2" strokeWidth={1} />
                                <SvgText x={pad.left - 6} y={y(v) + 3} fontSize="10" fill="#8A9AA5" textAnchor="end">
                                    {fmtTick(v)}
                                </SvgText>
                            </React.Fragment>
                        ))}

                        {points.length > 1 && (
                            <Polyline
                                points={points.map((p) => `${x(p.t)},${y(p.w)}`).join(' ')}
                                fill="none"
                                stroke="#5BB8E6"
                                strokeWidth={2.5}
                                strokeLinejoin="round"
                                strokeLinecap="round"
                            />
                        )}

                        {points.map((p, i) => (
                            <Circle key={`pt-${i}`} cx={x(p.t)} cy={y(p.w)} r={4} fill="#FFFFFF" stroke="#5BB8E6" strokeWidth={2} />
                        ))}

                        {labelIdx.map((i) => (
                            <SvgText key={`lb-${i}`} x={x(points[i].t)} y={height - 10} fontSize="10" fill="#8A9AA5" textAnchor="middle">
                                {labelOf(points[i])}
                            </SvgText>
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