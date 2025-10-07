import { useState } from "react";
import { usePage } from "@inertiajs/react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { DataTable } from "@/components/data-table/DataTable";
import { getRegistrationColumns } from "@/components/data-table/table-colums";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function RegistValidation() {
  const [timeRange, setTimeRange] = useState("90d");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  // Ambil data dari Laravel via Inertia
  const { registrations } = usePage().props;

  console.log("Props dari Laravel:", registrations);

  // Filtering client-side
  const filteredData = registrations.filter((item) => {
    const matchStatus = status ? item.validationStatus === status : true;
    const matchSearch =
      search === "" ||
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.email?.toLowerCase().includes(search.toLowerCase());

    let matchTime = true;
    if (timeRange === "7d") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      matchTime = new Date(item.submittedAt) >= sevenDaysAgo;
    } else if (timeRange === "30d") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      matchTime = new Date(item.submittedAt) >= thirtyDaysAgo;
    } else if (timeRange === "90d") {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      matchTime = new Date(item.submittedAt) >= ninetyDaysAgo;
    }

    return matchStatus && matchSearch && matchTime;
  });


  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/admin/registrations">
                    Member Registration Validation
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          <CardHeader className="relative lg:px-6 w-full">
            <div className="flex items-center justify-between gap-2 lg:px-4 flex-col lg:flex-row">
              {/* Search */}
              <div className="flex items-start gap-2 lg:w-1/3 w-full -ml-6">
                <div className="relative w-full">
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-8 w-full pl-8"
                    placeholder="Search by name or email"
                  />
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <Button variant="default" className="h-8 w-20 lg:w-28">
                  Search
                </Button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="flex w-40" aria-label="Select a value">
                    <SelectValue placeholder="Pending" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Pending" className="rounded-lg">Pending</SelectItem>
                    <SelectItem value="Completed" className="rounded-lg">Completed</SelectItem>
                    <SelectItem value="Failed" className="rounded-lg">Failed</SelectItem>
                  </SelectContent>
                </Select>


                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="flex w-40">
                    <SelectValue placeholder="Last 3 months" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="90d">Last 3 months</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <div className="flex flex-col gap-4 p-4 border rounded-lg mx-4">
            <h1 className="text-xl font-semibold">Members List</h1>
            <DataTable data={filteredData} columns={getRegistrationColumns()} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
