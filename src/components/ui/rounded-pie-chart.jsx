"use client";

import { LabelList, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

export const description = "A pie chart with a label list";

const defaultChartData = [
  { category: "Electronics", count: 275, fill: "var(--color-electronics)" },
  { category: "Clothing", count: 200, fill: "var(--color-clothing)" },
  { category: "Accessories", count: 187, fill: "var(--color-accessories)" },
  { category: "Home", count: 173, fill: "var(--color-home)" },
  { category: "Sports", count: 90, fill: "var(--color-sports)" },
];

const chartConfig = {
  count: {
    label: "Products",
  },

  electronics: {
    label: "Electronics",
    color: "var(--chart-1)",
  },

  clothing: {
    label: "Clothing",
    color: "var(--chart-2)",
  },

  accessories: {
    label: "Accessories",
    color: "var(--chart-3)",
  },

  home: {
    label: "Home",
    color: "var(--chart-4)",
  },

  sports: {
    label: "Sports",
    color: "var(--chart-5)",
  }
};

export function RoundedPieChart({ data = defaultChartData, title = "Product Categories", subtitle = "Distribution by category", growthRate = "5.2%" }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>
          {title}
          <Badge
            variant="outline"
            className="text-green-500 bg-green-500/10 border-none ml-2">
            <TrendingUp className="h-4 w-4" />
            <span>{growthRate}</span>
          </Badge>
        </CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="count" hideLabel />} />
            <Pie
              data={data}
              innerRadius={30}
              dataKey="count"
              radius={10}
              cornerRadius={8}
              paddingAngle={4}>
              <LabelList
                dataKey="count"
                stroke="none"
                fontSize={12}
                fontWeight={500}
                fill="currentColor"
                formatter={(value) => value.toString()} />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
