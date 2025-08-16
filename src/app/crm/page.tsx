
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  UploadCloud,
  UserPlus,
  Download,
  Search,
  RefreshCw,
  MessageSquare,
  Users,
  CheckCircle2,
  Clock,
  MoreVertical,
  Inbox,
  Eye,
  Edit,
  Trash2,
  Repeat,
  Plus
} from 'lucide-react';
import { generateLeads } from '@/ai/flows/generate-leads-flow';
import type { GenerateLeadsInput } from '@/ai/flows/types';

type Lead = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  institution?: string;
  product: string;
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
    const [filters, setFilters] = useState({ search: '', status: 'all', product: 'all' });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false);

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
                lead.institution?.toLowerCase().includes(searchTerm)
            );
        }
        if (filters.status !== 'all') {
            tempLeads = tempLeads.filter(lead => lead.status === filters.status);
        }
        if (filters.product !== 'all') {
            tempLeads = tempLeads.filter(lead => lead.product === filters.product);
        }
        setFilteredLeads(tempLeads);
    }, [leads, filters]);

    const handleFileUpload = async (file: File) => {
        if (!file || file.type !== 'application/json') {
            toast({ title: "Invalid File", description: "Please upload a valid JSON file.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const fileContent = await file.text();
            const parsedContent = JSON.parse(fileContent);
            
            const result = await generateLeads({ contacts: parsedContent });

            const newLeads: Lead[] = result.map((lead: any) => ({
                id: lead.id || `${Date.now()}-${Math.random()}`,
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                institution: lead.institution,
                product: lead.productInterest,
                status: 'pending',
                logs: [],
                lastUpdated: new Date().toISOString(),
            }));
            
            setLeads(prev => {
                const updatedLeads = [...prev, ...newLeads];
                localStorage.setItem('focusInLeadsData', JSON.stringify(updatedLeads));
                return updatedLeads;
            });

            toast({ title: "Leads Generated", description: `${result.length} new leads have been generated and added.` });

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
        pending: leads.filter(l => l.status === 'pending').length,
    }), [leads]);

    const progress = useMemo(() => {
        if (leads.length === 0) return 0;
        const completed = leads.filter(l => l.status !== 'pending').length;
        return Math.round((completed / leads.length) * 100);
    }, [leads]);

    const handleFormSubmit = (formData: Omit<Lead, 'id' | 'status' | 'logs' | 'lastUpdated'>) => {
        if (selectedLead) { // Editing
            const updatedLeads = leads.map(l => l.id === selectedLead.id ? { ...l, ...formData, lastUpdated: new Date().toISOString() } : l);
            setLeads(updatedLeads);
            localStorage.setItem('focusInLeadsData', JSON.stringify(updatedLeads));
            toast({ title: "Lead Updated", description: "The lead details have been saved." });
        } else { // Adding new
            const newLead: Lead = {
                ...formData,
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
    
    const handleDeleteLead = (leadId: string) => {
        const updatedLeads = leads.filter(l => l.id !== leadId);
        setLeads(updatedLeads);
        localStorage.setItem('focusInLeadsData', JSON.stringify(updatedLeads));
        toast({ title: "Lead Deleted", description: "The lead has been removed." });
    }

    const downloadSample = () => {
        const sample = [{
            name: "Janarthan V",
            email: "janarthan@example.com",
            phone: "+919876543210",
            institution: "Example University"
        }];
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sample, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "sample-contacts.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        toast({ title: "Sample file downloaded." });
    };

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

    return (
        <div className="grid gap-6">
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
                        <p className="text-muted-foreground">Upload a JSON file with contact details to generate enriched leads with AI.</p>
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
                            <Button variant="link" onClick={downloadSample}>Download Sample</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {leads.length > 0 && (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.pending}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Lead Management</CardTitle>
                                <Button onClick={() => { setSelectedLead(null); setIsFormOpen(true); }}>
                                    <UserPlus className="mr-2 h-4 w-4" /> Add Lead
                                </Button>
                            </div>
                             <div className="mt-4">
                                <Label>Overall Progress ({progress}%)</Label>
                                <Progress value={progress} className="w-full" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row gap-4 mb-4">
                                <Input
                                    placeholder="Search by name, email, institution..."
                                    value={filters.search}
                                    onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                                    className="flex-grow"
                                />
                                <Select value={filters.status} onValueChange={(value) => setFilters(f => ({ ...f, status: value }))}>
                                    <SelectTrigger className="w-full md:w-[180px]">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="contacted">Contacted</SelectItem>
                                        <SelectItem value="responded">Responded</SelectItem>
                                        <SelectItem value="interested">Interested</SelectItem>
                                        <SelectItem value="not-interested">Not Interested</SelectItem>
                                        <SelectItem value="follow-up">Follow Up</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                <Button variant="outline" onClick={() => setFilters({ search: '', status: 'all', product: 'all' })}>
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
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
                                                <TableRow key={lead.id}>
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
                                                                <DropdownMenuItem onClick={() => { setSelectedLead(lead); setIsProfileOpen(true); }}>
                                                                    <Eye className="mr-2 h-4 w-4" /> View Profile
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => { setSelectedLead(lead); setIsStatusUpdateOpen(true); }}>
                                                                    <Repeat className="mr-2 h-4 w-4" /> Update Status
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => { setSelectedLead(lead); setIsFormOpen(true); }}>
                                                                    <Edit className="mr-2 h-4 w-4" /> Edit Lead
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteLead(lead.id)}>
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Lead
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center">
                                                    No results found for your filters.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            {leads.length === 0 && !isLoading && (
                 <Card>
                    <CardContent className="pt-6">
                        <div className="text-center text-muted-foreground flex flex-col items-center gap-4 p-8">
                            <Inbox className="w-16 h-16" />
                            <h3 className="text-xl font-semibold">No Leads Yet</h3>
                            <p>Upload a contact list or add a lead manually to get started.</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
