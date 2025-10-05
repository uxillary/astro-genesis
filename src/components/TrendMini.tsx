import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import CornerBracket from '@/components/fui/CornerBracket';
import TickRuler from '@/components/fui/TickRuler';
import { FuiFrame } from '@/components/fui';
import type { CitationPoint } from '../lib/types';

const TrendMini = ({ data }: { data: CitationPoint[] }) => {
  const chartData = data.map((entry) => ({ year: entry.y, count: entry.c }));

  return (
    <FuiFrame grid="dots" tone="amber" padding={0} className="relative overflow-hidden rounded-[3px]">
      <div className="relative overflow-hidden rounded-[3px] border border-[#d6e3e0]/12 bg-panel/85 p-5 shadow-panel">
        <header className="mb-3 flex items-center justify-between text-[0.58rem] font-mono uppercase tracking-[0.32em] text-dim">
          <span>Telemetry // Citations</span>
          <span className="text-amber">Live Feed</span>
        </header>
        <CornerBracket radius={5} size={16} offset={10} color="amber" dashed>
          <div className="relative h-40">
            <TickRuler
              orientation="horizontal"
              className="pointer-events-none absolute left-6 right-6 top-4 opacity-70"
              spacing={10}
              majorEvery={4}
              color="mono"
              align="center"
            />
            <TickRuler
              orientation="vertical"
              className="pointer-events-none absolute bottom-6 left-4 top-4 opacity-70"
              spacing={10}
              majorEvery={4}
              color="mono"
              style={{ height: 'calc(100% - 2rem)' }}
            />
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ left: 0, right: 0, top: 16, bottom: 0 }}>
                <XAxis
                  dataKey="year"
                  stroke="rgba(214,227,224,0.18)"
                  tick={{ fontSize: 10, fill: 'rgba(214,227,224,0.6)', fontFamily: 'var(--font-mono)' }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(214,227,224,0.12)' }}
                />
                <YAxis hide domain={[0, 'dataMax + 1']} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(16, 22, 29, 0.92)',
                    border: '1px solid rgba(0, 179, 255, 0.35)',
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
        </CornerBracket>
        <div className="pointer-events-none absolute inset-0 border border-dashed border-[#d6e3e0]/5" />
      </div>
    </FuiFrame>
  );
};

export default TrendMini;
