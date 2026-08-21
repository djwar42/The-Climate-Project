import React, { useEffect, useRef, useState, useMemo } from 'react';
import { echartsMotion } from './motion.js';
import * as echarts from 'echarts/core';
import { LineChart, ScatterChart } from 'echarts/charts';
import {
  GridComponent, TooltipComponent, DataZoomComponent, MarkLineComponent,
  LegendComponent, AxisPointerComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { fmtYear, fmtYearShort, fmtYearFull } from './years.js';
import { NEON, neonBase } from './neon.js';
import { mono, display } from './theme.jsx';

echarts.use([
  LineChart, ScatterChart, GridComponent, TooltipComponent, DataZoomComponent,
  MarkLineComponent, LegendComponent, AxisPointerComponent, CanvasRenderer,
]);

const INK = '#2a2722';

export const KIND_COLOR = {
  glacial: '#2160ff',
  volcanic: '#ff3c1a',
  abrupt: '#7b1fe0',
  warm: '#ff8a00',
  policy: '#00b3a4',
  observation: '#00d084',
  discovery: '#e4e400',
};
const KIND_SYMBOL = {
  glacial: 'diamond', volcanic: 'triangle', abrupt: 'pin', warm: 'circle',
  policy: 'rect', observation: 'roundRect', discovery: 'arrow',
};
export const eventSymbol = (k) => KIND_SYMBOL[k] || 'circle';
const kindColor = (k) => KIND_COLOR[k] || NEON[0];

const firstSentences = (s, n = 2) => {
  if (!s) return '';
  const parts = String(s).split(/(?<=\.)\s+/);
  return parts.slice(0, n).join(' ');
};
const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function buildOption({ series, events, yName, y2Name, log, win, showLegend, first }) {
  const gridTop = events && events.length ? 46 : 22;
  const useY2 = series.some((s) => s.yAxis === 1);

  const dataSeries = [];
  series.forEach((s, i) => {
    const color = s.color || neonBase(i);
    if (s.band && s.band.length) {
      dataSeries.push({
        name: `${s.name}__lo`, type: 'line', yAxisIndex: s.yAxis || 0,
        data: s.band.map(([y, lo]) => [y, lo]),
        lineStyle: { opacity: 0 }, showSymbol: false, stack: `band${i}`,
        silent: true, tooltip: { show: false }, sampling: 'lttb', z: 1,
      });
      dataSeries.push({
        name: `${s.name}__hi`, type: 'line', yAxisIndex: s.yAxis || 0,
        data: s.band.map(([y, lo, hi]) => [y, hi - lo]),
        lineStyle: { opacity: 0 }, showSymbol: false, stack: `band${i}`,
        areaStyle: { color, opacity: 0.13 },
        silent: true, tooltip: { show: false }, sampling: 'lttb', z: 1,
      });
    }
    dataSeries.push({
      name: s.name, type: 'line', yAxisIndex: s.yAxis || 0, data: s.points,
      showSymbol: false, symbol: 'circle', symbolSize: 5, sampling: 'lttb',
      lineStyle: { width: s.width || 2, color, type: s.dashed ? 'dashed' : 'solid' },
      itemStyle: { color }, z: 3 + i,
      emphasis: { focus: 'series', lineStyle: { width: (s.width || 2) + 1 } },
    });
  });

  if (events && events.length) {
    const byYear = new Map();
    for (const e of events) {
      const k = Number(e.year.toFixed(3));
      if (!byYear.has(k)) byYear.set(k, []);
      byYear.get(k).push(e);
    }
    const marks = [...byYear.entries()].map(([year, group]) => ({
      value: [year, 0],
      group,
      symbol: eventSymbol(group[0].kind),
      itemStyle: { color: kindColor(group[0].kind), borderColor: INK, borderWidth: 1 },
      symbolSize: group.length > 1 ? 15 : 11,
    }));
    dataSeries.push({
      name: '__events', type: 'scatter', data: marks, z: 20,
      xAxisIndex: 0, yAxisIndex: useY2 ? 2 : 1,
      label: {
        show: true, position: 'top', formatter: (p) => (p.data.group.length > 1 ? `x${p.data.group.length}` : ''),
        fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: INK,
      },
      markLine: {
        silent: true, symbol: 'none',
        lineStyle: { color: INK, opacity: 0.16, width: 1, type: [3, 4] },
        label: { show: false },
        data: marks.map((m) => ({ xAxis: m.value[0] })),
      },
      tooltip: {
        trigger: 'item',
        formatter: (p) => {
          const g = p.data.group;
          const head = `<div style="font-family:Montserrat,sans-serif;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:0.06em">${esc(fmtYearFull(p.data.value[0]))}</div>`;
          const body = g.slice(0, 3).map((e) => `
            <div style="margin-top:7px;max-width:330px">
              <div style="font-family:IBM Plex Mono,monospace;font-size:11.5px;font-weight:700;color:${kindColor(e.kind)}">${esc(e.label)}</div>
              <div style="font-family:Moderustic,sans-serif;font-size:12px;line-height:1.5;opacity:0.92;white-space:normal">${esc(firstSentences(e.detail))}</div>
            </div>`).join('');
          const more = g.length > 3 ? `<div style="font-family:IBM Plex Mono,monospace;font-size:10px;margin-top:6px;opacity:0.8">+${g.length - 3} MORE</div>` : '';
          return head + body + more + `<div style="font-family:IBM Plex Mono,monospace;font-size:9.5px;margin-top:8px;opacity:0.6">CLICK FOR THE FULL ENTRY</div>`;
        },
      },
    });
  }

  const yAxes = [{
    type: log ? 'log' : 'value', scale: true, name: yName || '',
    nameTextStyle: { fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: INK, align: 'left' },
    nameGap: 12, position: 'left',
    axisLine: { show: true, lineStyle: { color: INK } },
    axisLabel: { fontFamily: 'IBM Plex Mono, monospace', fontSize: 10.5, color: INK },
    splitLine: { lineStyle: { color: 'rgba(42,39,34,0.10)' } },
  }];
  if (useY2) {
    yAxes.push({
      type: 'value', scale: true, name: y2Name || '', position: 'right',
      nameTextStyle: { fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: INK, align: 'right' },
      nameGap: 12,
      axisLine: { show: true, lineStyle: { color: INK } },
      axisLabel: { fontFamily: 'IBM Plex Mono, monospace', fontSize: 10.5, color: INK },
      splitLine: { show: false },
    });
  }
  yAxes.push({ type: 'value', min: 0, max: 1, show: false, axisPointer: { show: false } });

  return {
    ...echartsMotion({ first }),
    grid: { left: 62, right: useY2 ? 62 : 22, top: gridTop, bottom: 54 },
    legend: showLegend ? {
      show: true, top: 0, left: 0, icon: 'rect', itemWidth: 14, itemHeight: 3,
      textStyle: { fontFamily: 'IBM Plex Mono, monospace', fontSize: 10.5, color: INK },
      data: series.map((s) => s.name),
    } : { show: false },
    tooltip: {
      trigger: 'axis', axisPointer: { type: 'cross', label: { show: false } },
      backgroundColor: '#f7f4ec', borderColor: INK, borderWidth: 1, borderRadius: 0,
      extraCssText: 'box-shadow:3px 3px 0 rgba(42,39,34,0.22);',
      textStyle: { color: INK, fontSize: 12 },
      formatter: (ps) => {
        const arr = Array.isArray(ps) ? ps : [ps];
        const real = arr.filter((p) => p.seriesName && !p.seriesName.startsWith('__') && !p.seriesName.endsWith('__lo') && !p.seriesName.endsWith('__hi'));
        if (!real.length) return '';
        const x = real[0].value[0];
        const head = `<div style="font-family:Montserrat,sans-serif;font-weight:700;text-transform:uppercase;font-size:12px;letter-spacing:0.06em">${esc(fmtYear(x, { month: true }))}</div>`;
        const rows = real.map((p) => `<div style="font-family:IBM Plex Mono,monospace;font-size:11.5px;margin-top:3px">
            <span style="display:inline-block;width:9px;height:9px;background:${p.color};margin-right:6px"></span>
            ${esc(p.seriesName)} <b>${Number(p.value[1]).toFixed(2)}</b></div>`).join('');
        return head + rows;
      },
    },
    xAxis: {
      type: 'value', scale: true, min: win ? win[0] : 'dataMin', max: win ? win[1] : 'dataMax',
      axisLine: { lineStyle: { color: INK } },
      axisTick: { lineStyle: { color: INK } },
      axisLabel: {
        fontFamily: 'IBM Plex Mono, monospace', fontSize: 10.5, color: INK,
        formatter: (v) => fmtYearShort(v), hideOverlap: true,
      },
      splitLine: { show: false },
    },
    yAxis: yAxes,
    dataZoom: [
      { type: 'inside', xAxisIndex: 0, filterMode: 'none', zoomOnMouseWheel: true, moveOnMouseMove: false, moveOnMouseWheel: false },
      {
        type: 'slider', xAxisIndex: 0, filterMode: 'none', height: 20, bottom: 12,
        borderColor: 'rgba(42,39,34,0.4)', fillerColor: 'rgba(255,60,26,0.10)',
        handleStyle: { color: '#f4f0e4', borderColor: INK },
        dataBackground: { lineStyle: { color: 'rgba(42,39,34,0.4)' }, areaStyle: { color: 'rgba(42,39,34,0.10)' } },
        selectedDataBackground: { lineStyle: { color: NEON[0] }, areaStyle: { color: 'rgba(255,60,26,0.14)' } },
        labelFormatter: (v) => fmtYearShort(v),
        textStyle: { fontFamily: 'IBM Plex Mono, monospace', fontSize: 9.5, color: INK },
      },
    ],
    series: dataSeries,
  };
}

export function EventSlideout({ events, onClose }) {
  if (!events || !events.length) return null;
  return (
    <div style={{ border: '1px solid ' + INK, borderTop: '4px solid ' + kindColor(events[0].kind), background: 'rgba(42,39,34,0.045)', padding: '14px 16px', marginTop: 10 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ ...display, fontSize: 22, letterSpacing: '-0.01em' }}>{fmtYearFull(events[0].year)}</div>
        <button onClick={onClose} style={{ ...mono, fontSize: 10.5, letterSpacing: '0.1em', border: '1px solid ' + INK, background: 'transparent', cursor: 'pointer', padding: '3px 10px' }}>CLOSE</button>
      </div>
      {events.map((e, i) => (
        <div key={i} style={{ marginTop: 12, paddingTop: i ? 12 : 0, borderTop: i ? '1px solid rgba(42,39,34,0.2)' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ ...mono, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', color: '#f4f0e4', background: kindColor(e.kind), padding: '2px 7px' }}>{String(e.kind || 'event').toUpperCase()}</span>
            <span style={{ ...mono, fontSize: 13, fontWeight: 700, color: kindColor(e.kind) }}>{e.label}</span>
            {e.uncertainty && <span style={{ ...mono, fontSize: 10.5, opacity: 0.85 }}>{e.uncertainty}</span>}
          </div>
          <p style={{ fontFamily: 'Moderustic, sans-serif', fontSize: 14.5, lineHeight: 1.65, maxWidth: '72ch', margin: '8px 0 0' }}>{e.detail}</p>
          {e.source && (
            <a href={e.source} target="_blank" rel="noreferrer" style={{ ...mono, fontSize: 10.5, letterSpacing: '0.06em', color: kindColor(e.kind), display: 'inline-block', marginTop: 6 }}>
              SOURCE
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ClimateChart({
  series = [], events = [], height = 320, window: win, onWindow,
  yName, y2Name, log = false, showLegend = false, slideout = true,
}) {
  const boxRef = useRef(null);
  const instRef = useRef(null);
  const [open, setOpen] = useState(null);

  const firstRef = useRef(true);
  const option = useMemo(
    () => buildOption({ series, events, yName, y2Name, log, win, showLegend, first: firstRef.current }),
    [series, events, yName, y2Name, log, win, showLegend],
  );

  useEffect(() => {
    if (!boxRef.current) return undefined;
    const chart = echarts.init(boxRef.current, null, { renderer: 'canvas' });
    instRef.current = chart;
    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(boxRef.current);
    chart.on('click', (p) => {
      if (p.seriesName === '__events' && p.data && p.data.group) setOpen(p.data.group);
    });
    if (onWindow) {
      chart.on('datazoom', () => {
        const dz = chart.getOption().dataZoom;
        if (dz && dz[0] && Number.isFinite(dz[0].startValue) && Number.isFinite(dz[0].endValue)) {
          onWindow([dz[0].startValue, dz[0].endValue]);
        }
      });
    }
    return () => { ro.disconnect(); chart.dispose(); instRef.current = null; };
  }, []);

  useEffect(() => {
    if (!instRef.current) return;
    instRef.current.setOption(option, { notMerge: true });
    firstRef.current = false;
  }, [option]);

  return (
    <div>
      <div ref={boxRef} style={{ width: '100%', height }} />
      {slideout && <EventSlideout events={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
