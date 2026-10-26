import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, RefreshCw, Users, Clock, CheckCircle2, Phone, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

interface ContactRequest {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  project_type: string;
  message: string | null;
  status: string;
  created_at: string;
}

const Dashboard = () => {
  const { toast } = useToast();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      if (!supabase) throw new Error("خدمة البيانات غير متاحة حالياً");
      const { data, error } = await supabase
        .from("contact_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      toast({
        title: "خطأ في جلب البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      if (!supabase) throw new Error("خدمة البيانات غير متاحة حالياً");
      const { error } = await supabase
        .from("contact_requests")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setRequests(
        requests.map((req) =>
          req.id === id ? { ...req, status: newStatus } : req
        )
      );

      toast({
        title: "تم تحديث الحالة",
      });
    } catch (error) {
      toast({
        title: "خطأ في التحديث",
        variant: "destructive",
      });
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.phone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      new: { label: "جديد", variant: "default" },
      contacted: { label: "تم التواصل", variant: "secondary" },
      completed: { label: "مكتمل", variant: "outline" },
    };
    const config = statusConfig[status] || statusConfig.new;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const stats = {
    total: requests.length,
    new: requests.filter((r) => r.status === "new").length,
    contacted: requests.filter((r) => r.status === "contacted").length,
    completed: requests.filter((r) => r.status === "completed").length,
  };

  return (
    <div dir="rtl" className="min-h-screen bg-secondary/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Connect Technology" className="h-10 w-auto" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
              <p className="text-muted-foreground text-sm">إدارة طلبات العملاء</p>
            </div>
          </div>
          <Button onClick={fetchRequests} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
          <Button onClick={handleSignOut} variant="ghost" className="gap-2">
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-secondary">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.new}</p>
                <p className="text-sm text-muted-foreground">طلبات جديدة</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-secondary">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.contacted}</p>
                <p className="text-sm text-muted-foreground">تم التواصل</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-secondary">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-sm text-muted-foreground">مكتملة</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث بالاسم أو الإيميل أو الهاتف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="فلتر بالحالة" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="new">جديد</SelectItem>
                  <SelectItem value="contacted">تم التواصل</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>الطلبات ({filteredRequests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">لا توجد طلبات</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الاسم</TableHead>
                      <TableHead className="text-right">الهاتف</TableHead>
                      <TableHead className="text-right">الإيميل</TableHead>
                      <TableHead className="text-right">نوع المشروع</TableHead>
                      <TableHead className="text-right">الرسالة</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.full_name}</TableCell>
                        <TableCell dir="ltr" className="text-right">
                          <a
                            href={`tel:${request.phone}`}
                            className="text-primary hover:underline"
                          >
                            {request.phone}
                          </a>
                        </TableCell>
                        <TableCell>
                          <a
                            href={`mailto:${request.email}`}
                            className="text-primary hover:underline"
                          >
                            {request.email}
                          </a>
                        </TableCell>
                        <TableCell>{request.project_type}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {request.message || "-"}
                        </TableCell>
                        <TableCell>
                          {new Date(request.created_at).toLocaleDateString("ar-EG", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={request.status}
                            onValueChange={(value) => updateStatus(request.id, value)}
                          >
                            <SelectTrigger className="w-32 h-8">
                              {getStatusBadge(request.status)}
                            </SelectTrigger>
                            <SelectContent className="bg-background">
                              <SelectItem value="new">جديد</SelectItem>
                              <SelectItem value="contacted">تم التواصل</SelectItem>
                              <SelectItem value="completed">مكتمل</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
