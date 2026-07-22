/* ─────────────────────────────────────────────────────────
   chart-area-linear · Variant 2/68
   Khác bản default: Area type="linear" (nối điểm bằng đoạn
   thẳng thay vì cong natural) và tooltip hideLabel (chỉ hiện
   series, không hiện nhãn tháng). Còn lại giữ nguyên.
   Trong repo React thật: thay window.* bằng import từ
   "@/components/ui/card" và "@/components/ui/chart".
   ───────────────────────────────────────────────────────── */

const { AreaChart, Area, CartesianGrid, XAxis } = Recharts;

const areaLinearData = [
  { month: "Tháng 1", online: 186 },
  { month: "Tháng 2", online: 305 },
  { month: "Tháng 3", online: 237 },
  { month: "Tháng 4", online: 173 },
  { month: "Tháng 5", online: 209 },
  { month: "Tháng 6", online: 264 },
];

const areaLinearConfig = {
  online: { label: "Online", color: "var(--chart-1)" },
};

function ChartAreaLinear() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Area Chart - Linear</CardTitle>
        <CardDescription>Doanh thu online · 6 tháng gần nhất · tỷ đồng</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={areaLinearConfig}>
          <AreaChart
            accessibilityLayer
            data={areaLinearData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.replace("Tháng ", "T")}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Area
              dataKey="online"
              type="linear"
              fill="var(--color-online)"
              fillOpacity={0.4}
              stroke="var(--color-online)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Tăng 5,2% so với tháng trước <IconTrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Tháng 1 – Tháng 6 · 2026
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

registerChartVariant({
  id: "chart-area-linear",
  group: "area",
  desc: "type=linear — nối điểm bằng đoạn thẳng; tooltip hideLabel.",
  Component: ChartAreaLinear,
});
