import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, UtensilsCrossed } from 'lucide-react';

export default function CustomerHomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 p-4 sm:p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="p-4 text-center sm:p-6">
          <div className="bg-primary/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full sm:mb-4 sm:h-16 sm:w-16">
            <UtensilsCrossed className="text-primary h-6 w-6 sm:h-8 sm:w-8" />
          </div>
          <CardTitle className="text-xl sm:text-2xl">Welcome to Restaurant POS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 text-center sm:space-y-6 sm:p-6">
          <div className="rounded-lg bg-slate-50 p-4 sm:p-6">
            <QrCode className="text-muted-foreground mx-auto h-24 w-24 sm:h-32 sm:w-32" />
            <p className="text-muted-foreground mt-3 text-sm sm:mt-4 sm:text-base">
              Customer ordering interface coming soon
            </p>
          </div>
          <p className="text-muted-foreground text-sm">
            Scan the QR code on your table to view menu and place orders
          </p>
          <Button className="w-full" size="lg">
            View Sample Menu
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
