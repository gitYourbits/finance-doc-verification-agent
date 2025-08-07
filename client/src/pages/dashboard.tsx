import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const statsQuery = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => api.getDashboardStats(),
  });

  const onboardingsQuery = useQuery({
    queryKey: ["/api/onboardings"],
    queryFn: () => api.getOnboardings(undefined, 10),
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "verified":
        return "default";
      case "processing":
        return "secondary";
      case "review_required":
        return "destructive";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return "fas fa-check-circle text-success";
      case "processing":
        return "fas fa-spinner fa-spin text-warning";
      case "review_required":
        return "fas fa-exclamation-triangle text-warning";
      case "failed":
        return "fas fa-times-circle text-destructive";
      default:
        return "fas fa-clock text-muted-foreground";
    }
  };

  const formatTimestamp = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-shield-alt text-white text-sm" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">KYC Platform</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <Link href="/onboarding" className="text-muted-foreground hover:text-primary transition-colors">
                Client Onboarding
              </Link>
              <Link href="/dashboard" className="text-primary font-medium border-b-2 border-primary pb-1">
                Dashboard
              </Link>
            </nav>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="p-2">
                <i className="fas fa-bell text-muted-foreground" />
              </Button>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">AD</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-semibold">KYC Dashboard</CardTitle>
                <div className="flex items-center space-x-4">
                  <Button className="font-medium">
                    <i className="fas fa-download mr-2" />
                    Export Data
                  </Button>
                  <Button variant="outline" className="font-medium">
                    <i className="fas fa-filter mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {statsQuery.isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="p-4">
                      <Skeleton className="h-16" />
                    </Card>
                  ))
                ) : (
                  <>
                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-primary font-medium">Total Onboardings</p>
                            <p className="text-2xl font-bold text-primary">
                              {statsQuery.data?.stats.total || 0}
                            </p>
                          </div>
                          <i className="fas fa-users text-2xl text-primary" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-success/5 border-success/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-success font-medium">Verified Today</p>
                            <p className="text-2xl font-bold text-success">
                              {statsQuery.data?.stats.verifiedToday || 0}
                            </p>
                          </div>
                          <i className="fas fa-check-circle text-2xl text-success" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-destructive/5 border-destructive/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-destructive font-medium">Pending Review</p>
                            <p className="text-2xl font-bold text-destructive">
                              {statsQuery.data?.stats.pendingReview || 0}
                            </p>
                          </div>
                          <i className="fas fa-exclamation-triangle text-2xl text-destructive" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-warning/5 border-warning/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-warning font-medium">Processing</p>
                            <p className="text-2xl font-bold text-warning">
                              {statsQuery.data?.stats.processing || 0}
                            </p>
                          </div>
                          <i className="fas fa-spinner text-2xl text-warning" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              {/* Recent Onboardings Table */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recent Onboardings</h3>
                
                {onboardingsQuery.isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12" />
                    ))}
                  </div>
                ) : (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Client Name</TableHead>
                          <TableHead>Mobile</TableHead>
                          <TableHead>PAN</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {onboardingsQuery.data?.onboardings?.length ? (
                          onboardingsQuery.data.onboardings.map((onboarding) => (
                            <TableRow key={onboarding.id} className="hover:bg-muted/50">
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-primary">
                                      {onboarding.clientName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </span>
                                  </div>
                                  <span className="font-medium">{onboarding.clientName}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                +91 {onboarding.mobile}
                              </TableCell>
                              <TableCell className="font-mono text-sm">
                                {onboarding.panNumber}
                              </TableCell>
                              <TableCell>
                                <Badge variant={getStatusBadgeVariant(onboarding.status!)}>
                                  <i className={`${getStatusIcon(onboarding.status!)} mr-1`} />
                                  {onboarding.status?.charAt(0).toUpperCase() + onboarding.status?.slice(1).replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {formatTimestamp(onboarding.createdAt!)}
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                                  <i className="fas fa-eye mr-1" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              No onboarding records found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
