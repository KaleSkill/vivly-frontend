"use client";

import { Bar, BarChart, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { TrendingDown } from "lucide-react";

const defaultChartData = [
  { month: "January", users: 186, growth: 80 },
  { month: "February", users: 305, growth: 200 },
  { month: "March", users: 237, growth: 120 },
  { month: "April", users: 73, growth: 190 },
  { month: "May", users: 209, growth: 130 },
  { month: "June", users: 214, growth: 140 },
];

const chartConfig = {
  users: {
    label: "Users",
    color: "var(--chart-1)",
  },

  growth: {
    label: "Growth",
    color: "var(--chart-2)",
  }
};

export function DefaultMultipleBarChart({ data = defaultChartData, title = "User Growth", subtitle = "January - June 2025", growthRate = "+12.5%" }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {title}{" "}
          <Badge variant="outline" className="text-green-500 bg-green-500/10 border-none ml-2">
            <TrendingDown className="h-4 w-4" />
            <span>{growthRate}</span>
          </Badge>
        </CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <rect
              x="0"
              y="0"
              width="100%"
              height="85%"
              fill="url(#default-multiple-pattern-dots)" />
            <defs>
              <DottedBackgroundPattern />
            </defs>
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
            <Bar dataKey="users" fill="var(--color-users)" radius={4} />
            <Bar dataKey="growth" fill="var(--color-growth)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const DottedBackgroundPattern = () => {
  return (
    <pattern
      id="default-multiple-pattern-dots"
      x="0"
      y="0"
      width="10"
      height="10"
      patternUnits="userSpaceOnUse">
      <circle
        className="dark:text-muted/40 text-muted"
        cx="2"
        cy="2"
        r="1"
        fill="currentColor" />
    </pattern>
  );
};
