import { useState } from 'react';
import { ArrowLeft, Download, RotateCcw, ZoomIn, ZoomOut, FileText, AlertCircle, CheckCircle, Clock, Copy, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner@2.0.3';

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

interface DocumentViewerProps {
  document: Document;
  onBack: () => void;
}

export function DocumentViewer({ document, onBack }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'processing': return Clock;
      case 'error': return AlertCircle;
      default: return Clock;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const mockExtractedData = {
    'Document Type': 'Invoice',
    'Invoice Number': 'INV-2024-001',
    'Date': '2024-09-28',
    'Vendor Name': 'Acme Corporation',
    'Total Amount': '$1,250.00',
    'Tax Amount': '$125.00',
    'Due Date': '2024-10-28',
    'Customer Name': 'Tech Solutions Inc.',
    'Customer Address': '123 Business St, City, State 12345',
    'Line Items': [
      { description: 'Software License', quantity: 1, unitPrice: '$1000.00', total: '$1000.00' },
      { description: 'Support Services', quantity: 2, unitPrice: '$125.00', total: '$250.00' }
    ]
  };

  const processingSteps = [
    { name: 'File Upload', status: 'completed', progress: 100 },
    { name: 'Document Analysis', status: document.status === 'pending' ? 'pending' : 'completed', progress: document.status === 'pending' ? 0 : 100 },
    { name: 'Text Extraction', status: document.status === 'processing' ? 'processing' : document.status === 'completed' ? 'completed' : 'pending', progress: document.status === 'processing' ? 75 : document.status === 'completed' ? 100 : 0 },
    { name: 'Data Validation', status: document.status === 'completed' ? 'completed' : 'pending', progress: document.status === 'completed' ? 100 : 0 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{document.name}</h1>
            <p className="text-muted-foreground">
              Uploaded on {formatDate(document.uploadDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge 
            variant="secondary" 
            className={`${getStatusColor(document.status)} border-0`}
          >
            {(() => {
              const StatusIcon = getStatusIcon(document.status);
              return <StatusIcon className="h-3 w-3 mr-1" />;
            })()}
            {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
          </Badge>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <Tabs defaultValue="preview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="preview">Document Preview</TabsTrigger>
          <TabsTrigger value="extracted">Extracted Data</TabsTrigger>
          <TabsTrigger value="processing">Processing Status</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Document Preview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Document Preview</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(50, zoom - 25))}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">{zoom}%</span>
                    <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(200, zoom + 25))}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg p-8 text-center min-h-96 flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Document preview would appear here
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Zoom: {zoom}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document Info */}
            <Card>
              <CardHeader>
                <CardTitle>Document Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">File Name</label>
                  <p className="text-sm text-muted-foreground break-all">{document.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">File Type</label>
                  <p className="text-sm text-muted-foreground">{document.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">File Size</label>
                  <p className="text-sm text-muted-foreground">
                    {(document.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Upload Date</label>
                  <p className="text-sm text-muted-foreground">{formatDate(document.uploadDate)}</p>
                </div>
                {document.confidence && (
                  <div>
                    <label className="text-sm font-medium">Extraction Confidence</label>
                    <p className="text-sm text-muted-foreground">
                      {Math.round(document.confidence * 100)}%
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="extracted" className="space-y-4">
          {document.status === 'completed' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Document Fields</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {Object.entries(mockExtractedData).map(([key, value]) => {
                        if (key === 'Line Items') return null;
                        return (
                          <div key={key} className="flex items-start justify-between group">
                            <div className="flex-1">
                              <label className="text-sm font-medium">{key}</label>
                              <p className="text-sm text-muted-foreground mt-1">{String(value)}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(String(value))}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Line Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockExtractedData['Line Items'].map((item: any, index: number) => (
                      <div key={index} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm">{item.description}</h4>
                          <span className="font-medium text-sm">{item.total}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Qty: {item.quantity} × {item.unitPrice}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Processing Document</h3>
              <p className="text-muted-foreground">
                Data extraction is in progress. Please check back in a few moments.
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Processing Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {processingSteps.map((step, index) => (
                  <div key={step.name} className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.status === 'completed' ? 'bg-green-100 text-green-600' :
                      step.status === 'processing' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {step.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : step.status === 'processing' ? (
                        <Clock className="h-4 w-4" />
                      ) : (
                        <span className="text-xs font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{step.name}</span>
                        <Badge variant={
                          step.status === 'completed' ? 'default' :
                          step.status === 'processing' ? 'secondary' : 'outline'
                        }>
                          {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                        </Badge>
                      </div>
                      {step.status !== 'pending' && (
                        <Progress value={step.progress} className="h-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}