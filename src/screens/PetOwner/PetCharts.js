import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Line, Polyline, Circle, Rect, Text as SvgText } from 'react-native-svg';

const THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

const parseDate = (s) => {
    const [y, m, d] = String(s).slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d);
};

// คำนวณสเกลแกนน้ำหนัก (แกน Y) เป็นจำนวนเต็ม
const calculateNiceYScale = (maxW) => {
    const yMin = 0;
    const targetMax = Math.max(maxW, 1);
    const rawStep = targetMax / 3;

    let step = 1;
    if (rawStep <= 1) step = 1;
    else if (rawStep <= 2) step = 2;
    else if (rawStep <= 5) step = 5;
    else if (rawStep <= 10) step = 10;
    else if (rawStep <= 20) step = 20;
    else if (rawStep <= 30) step = 30;
    else step = Math.ceil(rawStep / 50) * 50;

    const yMax = Math.ceil(targetMax / step) * step || step * 3;

    const ticks = [];
    for (let val = 0; val <= yMax; val += step) {
        ticks.push(val);
    }

    return { yMin, yMax, ticks };
};

export function WeightChart({ data }) {
    const [containerWidth, setContainerWidth] = useState(0);
    const [filterRange, setFilterRange] = useState('6M');
    const [selectedIndex, setSelectedIndex] = useState(null);

    const height = 200;
    const pad = { top: 28, right: 24, bottom: 32, left: 38 };

    const allPoints = (data || [])
        .map((d) => ({ t: parseDate(d.date).getTime(), w: Number(d.weight), date: d.date }))
        .filter((p) => isFinite(p.w) && isFinite(p.t))
        .sort((a, b) => a.t - b.t);

    if (allPoints.length === 0) {
        return <Text style={styles.emptyText}>ยังไม่มีข้อมูลน้ำหนักจากการเข้ารับบริการ</Text>;
    }

    const latestTime = allPoints[allPoints.length - 1].t;
    const filteredPoints = allPoints.filter((p) => {
        if (filterRange === '3M') {
            const threeMonthsAgo = latestTime - (90 * 24 * 60 * 60 * 1000);
            return p.t >= threeMonthsAgo;
        }
        if (filterRange === '6M') {
            const sixMonthsAgo = latestTime - (180 * 24 * 60 * 60 * 1000);
            return p.t >= sixMonthsAgo;
        }
        if (filterRange === '1Y') {
            const oneYearAgo = latestTime - (365 * 24 * 60 * 60 * 1000);
            return p.t >= oneYearAgo;
        }
        return true;
    });

    const rawPoints = filteredPoints.length > 0 ? filteredPoints : allPoints;
    const n = rawPoints.length;

    const ws = rawPoints.map((p) => p.w);
    const maxW = Math.max(...ws);

    const { yMin, yMax, ticks } = calculateNiceYScale(maxW);
    const range = yMax - yMin;

    const innerW = Math.max(containerWidth - pad.left - pad.right, 1);
    const innerH = height - pad.top - pad.bottom;

    const getX = (p, index) => {
        if (n === 1) return pad.left + innerW / 2;
        return pad.left + (index / (n - 1)) * innerW;
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

        const day = d.getDate();
        const month = THAI_MONTHS[d.getMonth()];

        if (filterRange === '1Y' || filterRange === 'ALL') {
            const thaiYearShort = (d.getFullYear() + 543).toString().slice(-2);
            return `${day} ${month} ${thaiYearShort}`;
        }

        return `${day} ${month}`;
    };

    const filterOptions = [
        { key: '3M', label: '3 เดือน' },
        { key: '6M', label: '6 เดือน' },
        { key: '1Y', label: '1 ปี' },
        { key: 'ALL', label: 'ทั้งหมด' },
    ];

    return (
        <View style={styles.chartWrapper}>
            <View style={styles.headerRow}>
                <Text style={styles.unitTextLabel}>น้ำหนัก (กก.)</Text>

                <View style={styles.segmentedControl}>
                    {filterOptions.map((opt) => {
                        const isActive = filterRange === opt.key;
                        return (
                            <TouchableOpacity
                                key={opt.key}
                                style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
                                onPress={() => {
                                    setFilterRange(opt.key);
                                    setSelectedIndex(null);
                                }}
                                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <View onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)} style={{ width: '100%' }}>
                {containerWidth > 0 && (
                    <Svg width={containerWidth} height={height}>
                        {ticks.map((v, i) => (
                            <React.Fragment key={`tick-${i}`}>
                                <Line x1={pad.left} x2={containerWidth - pad.right} y1={getY(v)} y2={getY(v)} stroke="#F1F5F9" strokeWidth={1} />
                                <SvgText x={pad.left - 6} y={getY(v) + 3} fontSize="10" fill="#94A3B8" textAnchor="end">
                                    {Math.round(v)}
                                </SvgText>
                            </React.Fragment>
                        ))}

                        {points.length > 1 && (
                            <Polyline
                                points={points.map((p) => `${p.cx},${p.cy}`).join(' ')}
                                fill="none"
                                stroke="#2563EB"
                                strokeWidth={2}
                                strokeLinejoin="round"
                                strokeLinecap="round"
                            />
                        )}

                        {points.map((p, i) => {
                            const isSelected = selectedIndex === i;
                            const showText = n <= 8 || i === 0 || i === n - 1 || isSelected;

                            return (
                                <React.Fragment key={`pt-${i}`}>
                                    <Circle
                                        cx={p.cx}
                                        cy={p.cy}
                                        r={isSelected ? 6 : 4.5}
                                        fill={isSelected ? '#2563EB' : '#FFFFFF'}
                                        stroke="#2563EB"
                                        strokeWidth={2}
                                        onPress={() => setSelectedIndex(i)}
                                    />

                                    {showText && (
                                        <SvgText
                                            x={p.cx}
                                            y={p.cy - 8}
                                            fontSize="10"
                                            fontWeight={isSelected ? 'bold' : '600'}
                                            fill={isSelected ? '#1E40AF' : '#2563EB'}
                                            textAnchor="middle"
                                        >
                                            {p.w.toFixed(1)}
                                        </SvgText>
                                    )}

                                    {(n <= 7 || i % Math.ceil(n / 6) === 0 || i === n - 1) && (
                                        <SvgText x={p.cx} y={height - 8} fontSize="9" fill="#64748B" textAnchor="middle">
                                            {labelOf(p)}
                                        </SvgText>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </Svg>
                )}
            </View>
        </View>
    );
}

export function ServiceBarChart({ items }) {
    const [width, setWidth] = useState(0);
    const height = 180;
    const pad = { top: 16, right: 16, bottom: 28, left: 28 };

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
    const barW = Math.min(32, slot * 0.45);

    return (
        <View>
            <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ width: '100%' }}>
                {width > 0 && (
                    <Svg width={width} height={height}>
                        {ticks.map((v, i) => (
                            <React.Fragment key={`tick-${i}`}>
                                <Line x1={pad.left} x2={width - pad.right} y1={y(v)} y2={y(v)} stroke="#F1F5F9" strokeWidth={1} />
                                <SvgText x={pad.left - 6} y={y(v) + 3} fontSize="10" fill="#94A3B8" textAnchor="end">
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
                                            <Rect x={cx - barW / 2} y={y(item.count)} width={barW} height={barH} rx={4} fill="#10B981" />
                                            <SvgText x={cx} y={y(item.count) - 4} fontSize="10" fill="#047857" fontWeight="bold" textAnchor="middle">
                                                {String(item.count)}
                                            </SvgText>
                                        </>
                                    )}
                                    <SvgText x={cx} y={height - 8} fontSize="10" fill="#64748B" textAnchor="middle">
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
    chartWrapper: { width: '100%' },
    emptyText: { textAlign: 'center', color: '#94A3B8', fontSize: 13, paddingVertical: 16 },
    unitTextLabel: { color: '#64748B', fontSize: 11, fontWeight: '500' },

    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },

    segmentedControl: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        padding: 2,
    },
    segmentBtn: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    segmentBtnActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 1,
    },
    segmentText: {
        fontSize: 10,
        color: '#64748B',
        fontWeight: '500',
    },
    segmentTextActive: {
        color: '#2563EB',
        fontWeight: 'bold',
    },
});