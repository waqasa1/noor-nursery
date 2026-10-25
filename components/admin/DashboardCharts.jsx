"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPKR } from "@/lib/utils/currency";

const COLORS = {
  primary: "#1B5E45",
  secondary: "#3D8B65",
  accent: "#6BBF8A",
  soft: "#A8C5B5",
  warn: "#C45C26",
  amber: "#D4A017",
  slate: "#6B7C73",
  blue: "#3B6B8C",
  orders: "#1B5E45",
  grid: "#E4EDE7",
  text: "#5A6B62",
};

const STATUS_COLORS = {
  pending: COLORS.amber,
  awaiting_payment: COLORS.warn,
  payment_review: "#B45309",
  paid: COLORS.secondary,
  processing: COLORS.blue,
  packed: "#4F7CAC",
  shipped: COLORS.primary,
  delivered: COLORS.accent,
  cancelled: COLORS.slate,
  refunded: "#9CA3AF",
};

const METHOD_COLORS = {
  cod: COLORS.primary,
  easypaisa: COLORS.secondary,
  jazzcash: COLORS.warn,
  bank_transfer: COLORS.blue,
  payfast: COLORS.accent,
};

function ChartCard({ title, subtitle, children, className = "" }) {
  return (
    <div className={`rounded-2xl border bg-card p-5 ${className}`}>
      <div className="mb-4">
        <h2 className="font-display text-base font-bold text-primary">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      <div className="h-64 w-full min-w-0">{children}</div>
    </div>
  );
}

function EmptyChart({ message = "No data yet" }) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function tooltipStyle() {
  return {
    borderRadius: 12,
    border: "1px solid #E4EDE7",
    boxShadow: "0 8px 24px rgba(27, 94, 69, 0.08)",
    fontSize: 12,
  };
}

function OrdersTrendChart({ trend }) {
  if (!trend?.length) return <EmptyChart />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="ordersFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.orders} stopOpacity={0.32} />
            <stop offset="100%" stopColor={COLORS.orders} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: COLORS.text, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          minTickGap={28}
        />
        <YAxis
          tick={{ fill: COLORS.text, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={36}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={tooltipStyle()}
          formatter={(value) => [value, "Orders"]}
          labelFormatter={(label) => label}
        />
        <Area
          type="monotone"
          dataKey="orders"
          name="Orders"
          stroke={COLORS.orders}
          strokeWidth={2.5}
          fill="url(#ordersFill)"
          dot={false}
          activeDot={{ r: 4, fill: COLORS.orders }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function StatusDonut({ byStatus }) {
  if (!byStatus?.length) return <EmptyChart message="No orders yet" />;

  const data = byStatus.map((s) => ({
    ...s,
    name: s.label.replace(/\b\w/g, (c) => c.toUpperCase()),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={58}
          outerRadius={88}
          paddingAngle={2}
          stroke="#fff"
          strokeWidth={2}
        >
          {data.map((entry) => (
            <Cell
              key={entry.status}
              fill={STATUS_COLORS[entry.status] || COLORS.soft}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={tooltipStyle()}
          formatter={(value, name) => [`${value} orders`, name]}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          wrapperStyle={{ fontSize: 11, color: COLORS.text }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

function PaymentBarChart({ byPaymentMethod }) {
  if (!byPaymentMethod?.length) return <EmptyChart message="No payments yet" />;

  const data = byPaymentMethod.map((m) => ({
    ...m,
    name: m.label.replace(/\b\w/g, (c) => c.toUpperCase()),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: COLORS.text, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: COLORS.text, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={32}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={tooltipStyle()}
          formatter={(value, _name, item) => [
            `${value} orders · ${formatPKR(item?.payload?.revenue || 0)} paid`,
            item?.payload?.name || "Method",
          ]}
        />
        <Bar dataKey="count" name="Orders" radius={[8, 8, 0, 0]} maxBarSize={48}>
          {data.map((entry) => (
            <Cell
              key={entry.method}
              fill={METHOD_COLORS[entry.method] || COLORS.soft}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DashboardCharts({ charts }) {
  if (!charts) return null;

  const { trend, byStatus, byPaymentMethod } = charts;

  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-5">
      <ChartCard
        title="Orders"
        subtitle="Last 30 days · order volume"
        className="lg:col-span-3"
      >
        <OrdersTrendChart trend={trend} />
      </ChartCard>

      <ChartCard
        title="Order status"
        subtitle="All-time distribution"
        className="lg:col-span-2"
      >
        <StatusDonut byStatus={byStatus} />
      </ChartCard>

      <ChartCard
        title="Payment methods"
        subtitle="Orders by checkout method"
        className="lg:col-span-5"
      >
        <PaymentBarChart byPaymentMethod={byPaymentMethod} />
      </ChartCard>
    </div>
  );
}
