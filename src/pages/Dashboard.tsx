import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Building2, DollarSign, TrendingUp, AlertTriangle, 
  FileText, Users, ArrowRight, RefreshCw 
} from 'lucide-react';

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { portfolioSummary, dealPipeline, recentProperties, loading, refetch } = useDashboardData();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const stats = portfolioSummary ? [
    { label: 'Total Properties', value: portfolioSummary.total_properties, icon: Building2, color: 'text-primary' },
    { label: 'Active Deals', value: portfolioSummary.active_properties, icon: TrendingUp, color: 'text-success' },
    { label: 'Total UPB', value: formatCurrency(Number(portfolioSummary.total_upb) || 0), icon: DollarSign, color: 'text-warning' },
    { label: 'Total BPO', value: formatCurrency(Number(portfolioSummary.total_bpo) || 0), icon: DollarSign, color: 'text-success' },
    { label: 'Foreclosures', value: portfolioSummary.foreclosures, icon: AlertTriangle, color: 'text-destructive' },
    { label: 'Bankruptcies', value: portfolioSummary.bankruptcies, icon: FileText, color: 'text-warning' },
  ] : [];

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onSignOut={signOut} />
      
      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Portfolio overview and deal pipeline</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={refetch}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Link to="/import">
              <Button size="sm">
                Import Data
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Deal Pipeline */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Deal Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dealPipeline.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No deals in pipeline</p>
              ) : (
                <div className="space-y-4">
                  {dealPipeline.map((stage) => (
                    <div key={stage.status} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{stage.status}</p>
                        <p className="text-sm text-muted-foreground">{stage.deal_count} deals</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">{formatCurrency(Number(stage.total_capital) || 0)}</p>
                        <p className="text-sm text-success">{Number(stage.avg_roi)?.toFixed(1) || 0}% avg ROI</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Properties */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Recent Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentProperties.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No properties yet</p>
                  <Link to="/import">
                    <Button size="sm">
                      Import Properties
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentProperties.slice(0, 5).map((property) => (
                    <div key={property.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">{property.address}</p>
                        <p className="text-sm text-muted-foreground">{property.city}, {property.state}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-medium text-foreground">{property.property_type || 'N/A'}</p>
                        {property.bpo && (
                          <p className="text-xs text-success">{formatCurrency(Number(property.bpo))}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/import">
            <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Import Data</h3>
                  <p className="text-sm text-muted-foreground">Upload CSV/Excel files</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/documents">
            <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Documents</h3>
                  <p className="text-sm text-muted-foreground">Manage files & uploads</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/">
            <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Analyze Deal</h3>
                  <p className="text-sm text-muted-foreground">AI underwriting tool</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
