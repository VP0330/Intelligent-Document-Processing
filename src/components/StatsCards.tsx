import { FileText, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  status: 'pending' | 'processing' | 'completed' | 'error';
  extractedData?: any;
  confidence?: number;
}

interface StatsCardsProps {
  documents: Document[];
}

export function StatsCards({ documents }: StatsCardsProps) {
  const totalDocuments = documents.length;
  const completedDocuments = documents.filter(d => d.status === 'completed').length;
  const processingDocuments = documents.filter(d => d.status === 'processing').length;
  const errorDocuments = documents.filter(d => d.status === 'error').length;
  
  const completionRate = totalDocuments > 0 ? Math.round((completedDocuments / totalDocuments) * 100) : 0;
  
  const stats = [
    {
      title: 'Total Documents',
      value: totalDocuments.toString(),
      icon: FileText,
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Completed',
      value: completedDocuments.toString(),
      icon: CheckCircle,
      change: `${completionRate}%`,
      changeType: 'neutral' as const
    },
    {
      title: 'Processing',
      value: processingDocuments.toString(),
      icon: Clock,
      change: processingDocuments > 0 ? 'Active' : 'None',
      changeType: 'neutral' as const
    },
    {
      title: 'Success Rate',
      value: `${completionRate}%`,
      icon: TrendingUp,
      change: errorDocuments === 0 ? 'Perfect' : `${errorDocuments} errors`,
      changeType: errorDocuments === 0 ? 'positive' : 'negative' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${
                stat.changeType === 'positive' ? 'text-green-600' :
                stat.changeType === 'negative' ? 'text-red-600' :
                'text-muted-foreground'
              }`}>
                {stat.change}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}