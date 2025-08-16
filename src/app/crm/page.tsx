
'use client';

import { useState, useEffect, useMemo, useRef, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

import {
  UploadCloud,
  UserPlus,
  Download,
  RefreshCw,
  MessageSquare,
  Users,
  CheckCircle2,
  Clock,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Repeat,
  Mail,
  FileJson,
  Combine,
  ChevronDown,
  LayoutGrid,
  List,
  PieChart
} from 'lucide-react';
import { cn } from '@/lib/utils';


type Lead = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  institution?: string;
  product: string;
  membership?: string;
  district?: string;
  state?: string;
  country?: string;
  pinCode?: string;
  dateOfBirth?: string;
  gender?: string;
  qualification?: string;
  profession?: string;
  status: 'pending' | 'contacted' | 'responded' | 'interested' | 'not-interested' | 'follow-up';
  logs: {
    date: string;
    action: string;
    feedback: string;
    notes: string;
  }[];
  lastUpdated: string | null;
};


export default function CrmPage() {
    const { toast } = useToast();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState({ search: '', product: 'all' });
    const [currentTab, setCurrentTab] = useState<string>('all');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false);
    const [isBulkStatusUpdateOpen, setIsBulkStatusUpdateOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');


    useEffect(() => {
        const storedLeads = localStorage.getItem('focusInLeadsData');
        if (storedLeads) {
            setLeads(JSON.parse(storedLeads));
        }
    }, []);

    useEffect(() => {
        let tempLeads = [...leads];
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            tempLeads = tempLeads.filter(lead =>
                lead.name.toLowerCase().includes(searchTerm) ||
                lead.email.toLowerCase().includes(searchTerm) ||
                (lead.institution || '').toLowerCase().includes(searchTerm)
            );
        }
         if (currentTab !== 'all') {
            tempLeads = tempLeads.filter(lead => lead.status === currentTab);
        }
        if (filters.product !== 'all') {
            tempLeads = tempLeads.filter(lead => lead.product === filters.product);
        }
        setFilteredLeads(tempLeads);
    }, [leads, filters, currentTab]);
    
    const handleFileUpload = async (file: File, combine: boolean = false) => {
        if (!file || file.type !== 'application/json') {
            toast({ title: "Invalid File", description: "Please upload a valid JSON file.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const fileContent = await file.text();
            const parsedContent = JSON.parse(fileContent);

            if (!Array.isArray(parsedContent)) {
                 toast({ title: "Invalid Format", description: "JSON file must contain an array of leads.", variant: "destructive" });
                 setIsLoading(false);
                 return;
            }

            const newLeads: Lead[] = parsedContent.map((lead: any) => ({
                id: lead.id ? String(lead.id) : `${Date.now()}-${Math.random()}`,
                name: lead.name || 'N/A',
                email: lead.email || 'N/A',
                phone: lead.phone,
                whatsapp: lead.whatsapp,
                institution: lead.institution,
                product: lead.product || 'N/A',
                membership: lead.membership,
                district: lead.district,
                state: lead.state,
                country: lead.country,
                pinCode: lead.pinCode,
                dateOfBirth: lead.dateOfBirth,
                gender: lead.gender,
                qualification: lead.qualification,
                profession: lead.profession,
                status: lead.status || 'pending',
                logs: lead.logs || [],
                lastUpdated: lead.lastUpdated || new Date().toISOString(),
            }));
            
            setLeads(prev => {
                let updatedLeads;
                if(combine) {
                    const existingIds = new Set(prev.map(l => l.id));
                    const uniqueNewLeads = newLeads.filter(l => !existingIds.has(l.id));
                    updatedLeads = [...prev, ...uniqueNewLeads];
                    toast({ title: "Leads Combined", description: `${uniqueNewLeads.length} new unique leads have been added.` });
                } else {
                    updatedLeads = newLeads;
                    toast({ title: "Leads Imported", description: `${newLeads.length} leads have been imported.` });
                }
                localStorage.setItem('focusInLeadsData', JSON.stringify(updatedLeads));
                return updatedLeads;
            });

        } catch (error) {
            console.error("Error processing file:", error);
            toast({ title: "Processing Error", description: "Failed to process the uploaded file.", variant: "destructive" });
        } finally {
            setIsLoading(false);
            if(fileInputRef.current) fileInputRef.current.value = "";
        }
    };
    
    const stats = useMemo(() => ({
        total: leads.length,
        contacted: leads.filter(l => l.status === 'contacted').length,
        responded: leads.filter(l => l.status === 'responded').length,
        interested: leads.filter(l => l.status === 'interested').length,
        pending: leads.filter(l => l.status === 'pending').length,
    }), [leads]);

    const progress = useMemo(() => {
        if (leads.length === 0) return 0;
        const completed = leads.filter(l => l.status !== 'pending').length;
        return Math.round((completed / leads.length) * 100);
    }, [leads]);

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries()) as Omit<Lead, 'id' | 'status' | 'logs' | 'lastUpdated'>;
        
        if (selectedLead) { // Editing
            const updatedLeads = leads.map(l => l.id === selectedLead.id ? { ...l, ...data, lastUpdated: new Date().toISOString() } : l);
            setLeads(updatedLeads);
            localStorage.setItem('focusInLeadsData', JSON.stringify(updatedLeads));
            toast({ title: "Lead Updated", description: "The lead details have been saved." });
        } else { // Adding new
            const newLead: Lead = {
                ...(data as any),
                id: `${Date.now()}-${Math.random()}`,
                status: 'pending',
                logs: [],
                lastUpdated: new Date().toISOString(),
            };
            const updatedLeads = [...leads, newLead];
            setLeads(updatedLeads);
            localStorage.setItem('focusInLeadsData', JSON.stringify(updatedLeads));
            toast({ title: "Lead Added", description: "The new lead has been saved." });
        }
        setIsFormOpen(false);
        setSelectedLead(null);
    };

    const handleStatusUpdate = (status: Lead['status'], notes: string) => {
        if (!selectedLead) return;
        
        const newLog = {
            date: new Date().toISOString(),
            action: `Status change to ${status}`,
            feedback: '',
            notes: notes
        };

        const updatedLeads = leads.map(l => 
            l.id === selectedLead.id 
            ? { ...l, status, logs: [...l.logs, newLog], lastUpdated: new Date().toISOString() } 
            : l
        );
        setLeads(updatedLeads);
        localStorage.setItem('focusInLeadsData', JSON.stringify(updatedLeads));
        toast({ title: "Status Updated", description: `Lead status changed to ${status}.` });
        
        setIsStatusUpdateOpen(false);
        setSelectedLead(null);
    }

    const handleBulkStatusUpdate = (status: Lead['status'], notes: string) => {
        const newLog = {
            date: new Date().toISOString(),
            action: `Bulk status change to ${status}`,
            feedback: '',
            notes: notes
        };
        
        const updatedLeads = leads.map(l =>
            selectedLeads.has(l.id)
                ? { ...l, status, logs: [...l.logs, newLog], lastUpdated: new Date().toISOString() }
                : l
        );
        
        setLeads(updatedLeads);
        localStorage.setItem('focusInLeadsData', JSON.stringify(updatedLeads));
        toast({ title: "Bulk Update Complete", description: `${selectedLeads.size} leads updated to ${status}.` });
        
        setSelectedLeads(new Set());
        setIsBulkStatusUpdateOpen(false);
    };

    const handleBulkDelete = () => {
        const updatedLeads = leads.filter(l => !selectedLeads.has(l.id));
        setLeads(updatedLeads);
        localStorage.setItem('focusInLeadsData', JSON.stringify(updatedLeads));
        toast({ title: "Bulk Delete Complete", description: `${selectedLeads.size} leads have been deleted.` });
        setSelectedLeads(new Set());
    };
    
    const handleDeleteLead = (leadId: string) => {
        const updatedLeads = leads.filter(l => l.id !== leadId);
        setLeads(updatedLeads);
        localStorage.setItem('focusInLeadsData', JSON.stringify(updatedLeads));
        toast({ title: "Lead Deleted", description: "The lead has been removed." });
    }
    
    const exportData = () => {
        if(leads.length === 0) {
            toast({ title: "No data to export", variant: "destructive" });
            return;
        }
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(leads, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `focus-in-leads-${new Date().toISOString()}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        toast({ title: "Data exported successfully." });
    }
    
    const resetLeads = () => {
        setLeads([]);
        localStorage.removeItem('focusInLeadsData');
        toast({ title: "Lead data has been reset." });
    }

    const getStatusBadgeVariant = (status: Lead['status']): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case 'interested':
            case 'responded':
                return 'default'; // Using primary color for positive status
            case 'contacted':
            case 'follow-up':
                return 'secondary';
            case 'not-interested':
                return 'destructive';
            case 'pending':
            default:
                return 'outline';
        }
    }
    
    const productChartData = useMemo(() => {
        const counts = leads.reduce((acc, lead) => {
            acc[lead.product] = (acc[lead.product] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [leads]);
    
    const statusChartData = useMemo(() => {
        const counts = leads.reduce((acc, lead) => {
            acc[lead.status] = (acc[lead.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [leads]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];


    return (
        <div className="grid gap-6">
            {leads.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <Eye /> Lead Management System
                        </CardTitle>
                        <CardDescription>Upload a JSON of contacts to generate leads, then manage and track interactions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="p-6 border-dashed border-2 rounded-lg text-center flex flex-col items-center gap-4 bg-muted/50">
                            <UploadCloud className="w-12 h-12 text-primary" />
                            <h3 className="text-lg font-semibold">Drag & Drop or Upload Contacts</h3>
                            <p className="text-muted-foreground">Upload a JSON file with contact details to manage your leads.</p>
                            <input
                                type="file"
                                accept=".json"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                                disabled={isLoading}
                            />
                            <div className="flex gap-2">
                                <Button onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                                    {isLoading ? "Processing..." : "Browse Files"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Contacted</CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.contacted}</div>
                            </CardContent>
                        </Card>
                         <Card>
                             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Responded</CardTitle>
                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.responded}</div>
                            </CardContent>
                        </Card>
                        <Card>
                             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Interested</CardTitle>
                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.interested}</div>
                            </CardContent>
                        </Card>
                         <Card>
                             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.pending}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <div className="flex flex-wrap gap-4 justify-between items-center">
                                    <CardTitle>Lead Management</CardTitle>
                                    <div className='flex gap-2'>
                                        <Button onClick={() => { setSelectedLead(null); setIsFormOpen(true); }}>
                                            <UserPlus className="mr-2 h-4 w-4" /> Add Lead
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive">
                                                    <RefreshCw className="mr-2 h-4 w-4" /> Reset
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete all lead data. You should download your data first.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <Button variant="outline" onClick={exportData}>Download Data</Button>
                                                <AlertDialogAction onClick={resetLeads}>Yes, reset</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Label>Overall Progress ({progress}%)</Label>
                                    <Progress value={progress} className="w-full" />
                                </div>
                                <div className="flex flex-col md:flex-row gap-4 mt-4">
                                    <Input
                                        placeholder="Search by name, email, institution..."
                                        value={filters.search}
                                        onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                                        className="flex-grow"
                                    />
                                    <Select value={filters.product} onValueChange={(value) => setFilters(f => ({ ...f, product: value }))}>
                                        <SelectTrigger className="w-full md:w-[180px]">
                                            <SelectValue placeholder="Filter by product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Products</SelectItem>
                                            <SelectItem value="Focus AI">Focus AI</SelectItem>
                                            <SelectItem value="Focus Cast">Focus Cast</SelectItem>
                                            <SelectItem value="Focus Case">Focus Case</SelectItem>
                                            <SelectItem value="Focus Clinic">Focus Clinic</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Tabs value={currentTab} onValueChange={setCurrentTab}>
                                     <div className="flex justify-between items-center">
                                        <TabsList>
                                            <TabsTrigger value="all">All</TabsTrigger>
                                            <TabsTrigger value="pending">Pending</TabsTrigger>
                                            <TabsTrigger value="contacted">Contacted</TabsTrigger>
                                            <TabsTrigger value="interested">Interested</TabsTrigger>
                                            <TabsTrigger value="responded">Responded</TabsTrigger>
                                        </TabsList>
                                        <div className="flex items-center gap-2">
                                            {selectedLeads.size > 0 && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline">
                                                            Bulk Actions <ChevronDown className="ml-2 h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem onClick={() => setIsBulkStatusUpdateOpen(true)}>
                                                            <Repeat className="mr-2 h-4 w-4" /> Update Status
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete {selectedLeads.size} leads?</AlertDialogTitle>
                                                                    <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={handleBulkDelete}>Confirm</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                            <Button variant={viewMode === 'card' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('card')}><LayoutGrid/></Button>
                                            <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')}><List/></Button>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                    {viewMode === 'list' ? (
                                        <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead padding="checkbox">
                                                        <Checkbox
                                                            checked={filteredLeads.length > 0 && selectedLeads.size === filteredLeads.length}
                                                            onCheckedChange={(checked) => {
                                                                const newSelectedLeads = new Set<string>();
                                                                if (checked) {
                                                                    filteredLeads.forEach(lead => newSelectedLeads.add(lead.id));
                                                                }
                                                                setSelectedLeads(newSelectedLeads);
                                                            }}
                                                        />
                                                    </TableHead>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead className="hidden md:table-cell">Institution</TableHead>
                                                    <TableHead className="hidden lg:table-cell">Product Interest</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredLeads.length > 0 ? (
                                                    filteredLeads.map(lead => (
                                                        <TableRow key={lead.id} data-state={selectedLeads.has(lead.id) && "selected"}>
                                                            <TableCell padding="checkbox">
                                                                <Checkbox
                                                                    checked={selectedLeads.has(lead.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        const newSelected = new Set(selectedLeads);
                                                                        if (checked) {
                                                                            newSelected.add(lead.id);
                                                                        } else {
                                                                            newSelected.delete(lead.id);
                                                                        }
                                                                        setSelectedLeads(newSelected);
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="font-medium">{lead.name}</TableCell>
                                                            <TableCell className="hidden md:table-cell">{lead.institution || "N/A"}</TableCell>
                                                            <TableCell className="hidden lg:table-cell">{lead.product}</TableCell>
                                                            <TableCell>
                                                                <Badge variant={getStatusBadgeVariant(lead.status)}>{lead.status}</Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                                            <span className="sr-only">Open menu</span>
                                                                            <MoreVertical className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem onClick={() => { setSelectedLead(lead); setIsStatusUpdateOpen(true); }}>
                                                                            <Repeat className="mr-2 h-4 w-4" /> Update Status
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => window.location.href = `mailto:${lead.email}`}>
                                                                            <Mail className="mr-2 h-4 w-4" /> Send Email
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => lead.whatsapp && window.open(`https://wa.me/${lead.whatsapp.replace(/[^0-9]/g, '')}`, '_blank')}>
                                                                            <MessageSquare className="mr-2 h-4 w-4" /> Send WhatsApp
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem onClick={() => { setSelectedLead(lead); setIsFormOpen(true); }}>
                                                                            <Edit className="mr-2 h-4 w-4" /> Edit Lead
                                                                        </DropdownMenuItem>
                                                                        <AlertDialog>
                                                                            <AlertDialogTrigger asChild>
                                                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Lead
                                                                                </DropdownMenuItem>
                                                                            </AlertDialogTrigger>
                                                                            <AlertDialogContent>
                                                                                <AlertDialogHeader><AlertDialogTitle>Delete this lead?</AlertDialogTitle></AlertDialogHeader>
                                                                                <AlertDialogDescription>This will permanently delete {lead.name}'s record.</AlertDialogDescription>
                                                                                <AlertDialogFooter>
                                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                                    <AlertDialogAction onClick={() => handleDeleteLead(lead.id)}>Confirm</AlertDialogAction>
                                                                                </AlertDialogFooter>
                                                                            </AlertDialogContent>
                                                                        </AlertDialog>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="h-24 text-center">
                                                            No results found for your filters.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {filteredLeads.map(lead => (
                                                <Card key={lead.id} className="flex flex-col">
                                                    <CardHeader>
                                                        <CardTitle>{lead.name}</CardTitle>
                                                        <CardDescription>{lead.institution || "No institution"}</CardDescription>
                                                    </CardHeader>
                                                    <CardContent className="flex-grow space-y-2">
                                                        <p className="text-sm text-muted-foreground">{lead.email}</p>
                                                        <p className="text-sm text-muted-foreground">{lead.phone || "No phone"}</p>
                                                        <Badge variant="outline">{lead.product}</Badge>
                                                        <Badge variant={getStatusBadgeVariant(lead.status)}>{lead.status}</Badge>
                                                    </CardContent>
                                                    <CardContent className="flex gap-2">
                                                        <Button size="sm" variant="outline" className="w-full" onClick={() => { setSelectedLead(lead); setIsFormOpen(true); }}>Edit</Button>
                                                        <Button size="sm" className="w-full" onClick={() => { setSelectedLead(lead); setIsStatusUpdateOpen(true);}}>Update</Button>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                     </div>
                                </Tabs>
                            </CardContent>
                        </Card>
                         <div className="flex flex-col gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><PieChart/>Product Interest</CardTitle>
                                    <CardDescription>Distribution of leads by product.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                    <RechartsPieChart>
                                        <Pie data={productChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                        {productChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </RechartsPieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle  className="flex items-center gap-2"><PieChart/>Status Distribution</CardTitle>
                                    <CardDescription>Breakdown of lead statuses.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                     <ResponsiveContainer width="100%" height={250}>
                                    <RechartsPieChart>
                                        <Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                        {statusChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </RechartsPieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Data Management</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-2">
                                    <input
                                        type="file" accept=".json" ref={fileInputRef} className="hidden"
                                        onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], true)}
                                        disabled={isLoading}
                                    />
                                    <Button onClick={() => fileInputRef.current?.click()} disabled={isLoading} variant="outline">
                                        <Combine className="mr-2 h-4 w-4" /> Combine with JSON File
                                    </Button>
                                    <Button onClick={exportData}>
                                        <Download className="mr-2 h-4 w-4" /> Export as JSON
                                    </Button>
                                </CardContent>
                            </Card>
                         </div>
                    </div>
                </>
            )}

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
                        <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">Full Name *</Label>
                                <Input id="name" name="name" defaultValue={selectedLead?.name} required />
                            </div>
                            <div>
                                <Label htmlFor="email">Email *</Label>
                                <Input id="email" name="email" type="email" defaultValue={selectedLead?.email} required />
                            </div>
                            <div>
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" name="phone" defaultValue={selectedLead?.phone} />
                            </div>
                            <div>
                                <Label htmlFor="whatsapp">WhatsApp</Label>
                                <Input id="whatsapp" name="whatsapp" defaultValue={selectedLead?.whatsapp} />
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold border-b pb-2 mt-4">Professional Information</h3>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="institution">Institution</Label>
                                <Input id="institution" name="institution" defaultValue={selectedLead?.institution} />
                            </div>
                             <div>
                                <Label htmlFor="product">Product Interest *</Label>
                                <Select name="product" defaultValue={selectedLead?.product} required>
                                    <SelectTrigger><SelectValue placeholder="Select a product" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Focus AI">Focus AI</SelectItem>
                                        <SelectItem value="Focus Cast">Focus Cast</SelectItem>
                                        <SelectItem value="Focus Case">Focus Case</SelectItem>
                                        <SelectItem value="Focus Clinic">Focus Clinic</SelectItem>
                                    </SelectContent>
                                </Select>
                             </div>
                        </div>
                        <h3 className="text-lg font-semibold border-b pb-2 mt-4">Additional Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                <Input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={selectedLead?.dateOfBirth} />
                            </div>
                            <div>
                                <Label htmlFor="gender">Gender</Label>
                                <Select name="gender" defaultValue={selectedLead?.gender}>
                                    <SelectTrigger><SelectValue placeholder="Select gender"/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="qualification">Qualification</Label>
                                <Input id="qualification" name="qualification" defaultValue={selectedLead?.qualification} />
                            </div>
                            <div>
                                <Label htmlFor="profession">Profession</Label>
                                <Input id="profession" name="profession" defaultValue={selectedLead?.profession} />
                            </div>
                        </div>

                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

             <Dialog open={isStatusUpdateOpen} onOpenChange={setIsStatusUpdateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update status for {selectedLead?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Select onValueChange={(value: Lead['status']) => setSelectedLead(l => l ? {...l, status: value} : null)}>
                             <SelectTrigger><SelectValue placeholder="Select new status" /></SelectTrigger>
                             <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="responded">Responded</SelectItem>
                                <SelectItem value="interested">Interested</SelectItem>
                                <SelectItem value="not-interested">Not Interested</SelectItem>
                                <SelectItem value="follow-up">Follow Up</SelectItem>
                             </SelectContent>
                        </Select>
                        <Textarea id="status-notes" placeholder="Add notes for this status change..." />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                        <Button onClick={() => handleStatusUpdate(selectedLead!.status, (document.getElementById('status-notes') as HTMLTextAreaElement).value)}>Update</Button>
                    </DialogFooter>
                </DialogContent>
             </Dialog>

             <Dialog open={isBulkStatusUpdateOpen} onOpenChange={setIsBulkStatusUpdateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bulk update status for {selectedLeads.size} leads</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                         <Select onValueChange={(value: Lead['status']) => setSelectedLead(l => ({...l!, status: value}))}>
                             <SelectTrigger><SelectValue placeholder="Select new status" /></SelectTrigger>
                             <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="responded">Responded</SelectItem>
                                <SelectItem value="interested">Interested</SelectItem>
                                <SelectItem value="not-interested">Not Interested</SelectItem>
                                <SelectItem value="follow-up">Follow Up</SelectItem>
                             </SelectContent>
                        </Select>
                        <Textarea id="bulk-status-notes" placeholder="Add notes for this status change..." />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                         <Button onClick={() => handleBulkStatusUpdate(selectedLead!.status, (document.getElementById('bulk-status-notes') as HTMLTextAreaElement).value)}>Update All</Button>
                    </DialogFooter>
                </DialogContent>
             </Dialog>
        </div>
    );
}

    