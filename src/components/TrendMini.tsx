import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { CitationPoint } from '../lib/types';

const TrendMini = ({ data }: { data: CitationPoint[] }) => {
  const chartData = data.map((entry) => ({ year: entry.y, count: entry.c }));

  return (
    <div className="relative overflow-hidden rounded-[22px] border border-white/12 bg-panel/70 p-5 shadow-panel">
      <header className="mb-3 flex items-center justify-between text-[0.58rem] font-mono uppercase tracking-[0.32em] text-dim">
        <span>Telemetry // Citations</span>
        <span className="text-amber">Live Feed</span>
      </header>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ left: 0, right: 0, top: 16, bottom: 0 }}>
            <XAxis
              dataKey="year"
              stroke="rgba(255,255,255,0.25)"
              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-mono)' }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.15)' }}
            />
            <YAxis hide domain={[0, 'dataMax + 1']} />
            <Tooltip
              contentStyle={{
                background: 'rgba(11, 14, 16, 0.92)',
                border: '1px solid rgba(255, 138, 0, 0.35)',
                borderRadius: 12,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.18em'
              }}
              labelStyle={{ color: 'var(--white)' }}
              formatter={(value: number) => [`${value} cites`, '']} // label suppressed
            />
            <Line type="monotone" dataKey="count" stroke="var(--amber)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="pointer-events-none absolute inset-0 border border-dashed border-white/5" />
    </div>
  );
};

export default TrendMini;
