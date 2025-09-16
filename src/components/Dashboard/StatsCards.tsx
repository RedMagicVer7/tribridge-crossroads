import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ArrowUpRight, ArrowDownLeft, Repeat, TrendingUp } from "lucide-react";

const StatsCards = () => {
  const stats = [
    {
      title: "Total Volume (24h)",
      value: "$2,847,392",
      change: "+12.5%",
      trend: "up",
      icon: TrendingUp,
      gradient: "bg-gradient-primary"
    },
    {
      title: "Active Transactions",
      value: "156",
      change: "+8",
      trend: "up",
      icon: Repeat,
      gradient: "bg-gradient-success"
    },
    {
      title: "Average Processing Time",
      value: "0.8s",
      change: "-0.2s",
      trend: "down",
      icon: ArrowDownLeft,
      gradient: "bg-gradient-hero"
    },
    {
      title: "Success Rate",
      value: "99.97%",
      change: "+0.03%",
      trend: "up",
      icon: ArrowUpRight,
      gradient: "bg-gradient-success"
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden border-0 shadow-soft hover:shadow-medium transition-all duration-300">
          <div className={`absolute inset-0 opacity-5 ${stat.gradient}`}></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.gradient}`}>
              <stat.icon className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className={`text-sm flex items-center ${
              stat.trend === 'up' ? 'text-success' : 'text-muted-foreground'
            }`}>
              {stat.trend === 'up' ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownLeft className="h-3 w-3 mr-1" />
              )}
              {stat.change} from yesterday
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;