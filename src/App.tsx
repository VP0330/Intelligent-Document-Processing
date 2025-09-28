import { useState } from 'react';
import { FileText, Upload, Settings, BarChart3, Bell, LogOut, User } from 'lucide-react';
import { Button } from './components/ui/button';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import { Separator } from './components/ui/separator';
import { DocumentUpload } from './components/DocumentUpload';
import { DocumentDashboard } from './components/DocumentDashboard';
import { DocumentViewer } from './components/DocumentViewer';
import { StatsCards } from './components/StatsCards';
import { LoginScreen } from './components/LoginScreen';
import { Toaster } from './components/ui/sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from './components/ui/avatar';

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

interface User {
  email: string;
  name: string;
  avatar?: string;
}

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Invoice_2024_001.pdf',
    type: 'application/pdf',
    size: 2048000,
    uploadDate: new Date('2024-09-28T10:30:00'),
    status: 'completed',
    confidence: 0.95,
    extractedData: { invoiceNumber: 'INV-2024-001', total: '$1,250.00' }
  },
  {
    id: '2',
    name: 'Contract_Agreement.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 1536000,
    uploadDate: new Date('2024-09-28T09:15:00'),
    status: 'processing',
    confidence: 0.87
  },
  {
    id: '3',
    name: 'Receipt_Electronics.jpg',
    type: 'image/jpeg',
    size: 512000,
    uploadDate: new Date('2024-09-27T16:45:00'),
    status: 'completed',
    confidence: 0.92,
    extractedData: { merchant: 'Electronics Store', total: '$299.99' }
  },
  {
    id: '4',
    name: 'Tax_Document_2023.pdf',
    type: 'application/pdf',
    size: 3072000,
    uploadDate: new Date('2024-09-27T14:20:00'),
    status: 'error'
  }
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'upload' | 'analytics'>('dashboard');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);

  const handleUploadComplete = (newFiles: any[]) => {
    const newDocuments: Document[] = newFiles.map(file => ({
      ...file,
      status: 'pending' as const,
      uploadDate: new Date()
    }));
    setDocuments(prev => [...prev, ...newDocuments]);
    
    // Simulate processing
    setTimeout(() => {
      setDocuments(prev => 
        prev.map(doc => 
          newDocuments.find(nd => nd.id === doc.id) 
            ? { ...doc, status: 'processing' as const }
            : doc
        )
      );
      
      setTimeout(() => {
        setDocuments(prev => 
          prev.map(doc => 
            newDocuments.find(nd => nd.id === doc.id) 
              ? { 
                  ...doc, 
                  status: 'completed' as const, 
                  confidence: 0.85 + Math.random() * 0.15,
                  extractedData: { type: 'Document', fields: Math.floor(Math.random() * 10) + 1 }
                }
              : doc
          )
        );
      }, 3000);
    }, 1000);
  };

  const handleDocumentDelete = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    if (selectedDocument?.id === documentId) {
      setSelectedDocument(null);
    }
  };

  const handleLogin = (credentials: { email: string; password: string }) => {
    // Mock authentication - in real app, this would call an API
    const mockUser: User = {
      email: credentials.email,
      name: credentials.email.split('@')[0].charAt(0).toUpperCase() + credentials.email.split('@')[0].slice(1),
    };
    
    setUser(mockUser);
    setIsAuthenticated(true);
  };

  const handleRegister = (userData: { name: string; email: string; password: string }) => {
    // Mock registration - in real app, this would call an API
    const newUser: User = {
      email: userData.email,
      name: userData.name,
    };
    
    setUser(newUser);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setSelectedDocument(null);
    setCurrentView('dashboard');
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FileText },
    { id: 'upload', label: 'Upload Documents', icon: Upload },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} onRegister={handleRegister} />;
  }

  if (selectedDocument) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <DocumentViewer 
            document={selectedDocument} 
            onBack={() => setSelectedDocument(null)} 
          />
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold">DocuFlow</h1>
                <p className="text-xs text-muted-foreground">Intelligent Processing</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarMenu>
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => setCurrentView(item.id as any)}
                      isActive={currentView === item.id}
                      className="w-full justify-start"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
            
            <Separator className="my-4" />
            
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full justify-start">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="border-b border-border p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <SidebarTrigger />
              <div>
                <h2 className="text-xl font-semibold">
                  {currentView === 'dashboard' && 'Document Dashboard'}
                  {currentView === 'upload' && 'Upload Documents'}
                  {currentView === 'analytics' && 'Analytics & Reports'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {currentView === 'dashboard' && 'Manage and process your documents'}
                  {currentView === 'upload' && 'Add new documents for processing'}
                  {currentView === 'analytics' && 'View processing statistics and insights'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {user?.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <div className="flex-1 p-6 space-y-6">
            {currentView === 'dashboard' && (
              <>
                <StatsCards documents={documents} />
                <DocumentDashboard 
                  documents={documents}
                  onDocumentSelect={setSelectedDocument}
                  onDocumentDelete={handleDocumentDelete}
                />
              </>
            )}
            
            {currentView === 'upload' && (
              <DocumentUpload onUploadComplete={handleUploadComplete} />
            )}
            
            {currentView === 'analytics' && (
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
                <p className="text-muted-foreground">
                  Detailed analytics and reporting features coming soon
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}