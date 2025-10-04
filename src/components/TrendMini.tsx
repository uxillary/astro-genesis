import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const TrendMini = () => {
  const data = Array.from({ length: 8 }, (_, index) => ({
    year: 2016 + index,
    value: Math.round(30 + Math.sin(index) * 12 + index * 3)
  }));

  return (
    <div className="border border-white/10 rounded-xl p-4 bg-black/40 backdrop-blur-sm">
      <header className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.3em] text-slate-400 mb-3">
        <span>Keyword Trajectory</span>
        <span className="text-accent-amber">Telemetry</span>
      </header>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="year" stroke="rgba(226,232,240,0.35)" tick={{ fontSize: 10 }} tickLine={false} axisLine={{ stroke: 'rgba(226,232,240,0.15)' }} />
            <YAxis hide domain={[0, 'dataMax + 10']} />
            <Tooltip
              contentStyle={{
                background: 'rgba(7,12,18,0.95)',
                border: '1px solid rgba(85,230,165,0.4)',
                borderRadius: 8,
                fontSize: 11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}
              labelStyle={{ color: 'rgba(226,232,240,0.8)' }}
            />
            <Line type="monotone" dataKey="value" stroke="#55e6a5" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendMini;
