import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  Check,
  Phone,
  Users,
  Clock,
  Mail,
  User,
  MessageSquare,
  Sparkles,
  Gift,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { CustomerLayout } from '@/layouts/customer';
import { reservationsService } from '@/lib/api/services';
import type { Table } from '@/lib/api/services/reservations.service';
import { useToast } from '@/hooks/use-toast';
import type { AxiosError } from 'axios';

export default function ReservationPage() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: '2',
    tableId: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Combine date and time into ISO string
      const reservationDateTime = new Date(`${formData.date}T${formData.time}`);

      await reservationsService.createReservation({
        reservationTime: reservationDateTime.toISOString(),
        partySize: parseInt(formData.guests),
        guestName: formData.name,
        guestPhone: formData.phone,
        guestEmail: formData.email || undefined,
        notes: formData.message || undefined,
        tableId: formData.tableId,
      });

      setSubmitted(true);
      toast({
        title: 'Reservation Confirmed!',
        description: 'Your table has been successfully reserved.',
      });
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage =
        axiosError.response?.data?.message || 'Failed to create reservation. Please try again.';

      toast({
        variant: 'destructive',
        title: 'Reservation Failed',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGuestsChange = (value: string) => {
    setFormData({ ...formData, guests: value });
    // Reset table selection when party size changes
    setFormData((prev) => ({ ...prev, guests: value, tableId: '' }));
  };

  const handleTableChange = (value: string) => {
    setFormData({ ...formData, tableId: value });
  };

  // Fetch available tables when date, time, and guests are selected
  const fetchAvailableTables = useCallback(async () => {
    if (formData.date && formData.time && formData.guests) {
      setLoadingTables(true);
      try {
        const reservationDateTime = new Date(`${formData.date}T${formData.time}`);
        const tables = await reservationsService.getAvailableTables(
          reservationDateTime.toISOString(),
          parseInt(formData.guests)
        );
        setAvailableTables(tables);

        // Auto-select first table if available and no table is selected
        setFormData((prev) => {
          if (tables.length > 0 && !prev.tableId) {
            return { ...prev, tableId: tables[0].id };
          }
          return prev;
        });
      } catch (error) {
        console.error('Failed to fetch available tables:', error);
        setAvailableTables([]);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load available tables. Please try again.',
        });
      } finally {
        setLoadingTables(false);
      }
    }
  }, [formData.date, formData.time, formData.guests, toast]);

  useEffect(() => {
    fetchAvailableTables();
  }, [fetchAvailableTables]);

  if (submitted) {
    return (
      <CustomerLayout showFooter={false}>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-50 p-4">
          <Card className="animate-in fade-in zoom-in w-full max-w-2xl overflow-hidden border-2 shadow-2xl duration-500">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-8 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 animate-bounce items-center justify-center rounded-full bg-white shadow-lg">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="mb-2 text-3xl font-bold text-white">Reservation Confirmed!</h2>
              <p className="text-emerald-100">Your table is waiting for you</p>
            </div>

            <CardContent className="p-8">
              <div className="mb-6 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 p-6">
                <div className="mb-4 flex items-center gap-2 text-emerald-700">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-semibold">Reservation Details</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <User className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium">Name:</span>
                    <span>{formData.name}</span>
                  </div>
                  {formData.email && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Mail className="h-5 w-5 text-emerald-600" />
                      <span className="font-medium">Email:</span>
                      <span>{formData.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium">Date:</span>
                    <span>
                      {new Date(`${formData.date}T${formData.time}`).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium">Time:</span>
                    <span>
                      {new Date(`${formData.date}T${formData.time}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Users className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium">Guests:</span>
                    <span>{formData.guests}</span>
                  </div>
                  {formData.message && (
                    <div className="flex items-start gap-3 text-gray-700">
                      <MessageSquare className="mt-1 h-5 w-5 flex-shrink-0 text-emerald-600" />
                      <div>
                        <span className="font-medium">Special Request:</span>
                        <p className="mt-1 text-sm">{formData.message}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {formData.email && (
                <div className="mb-6 rounded-lg border-2 border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-start gap-3">
                    <Gift className="mt-1 h-6 w-6 flex-shrink-0 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Confirmation Email Sent!</p>
                      <p className="text-sm text-gray-600">
                        We've sent a confirmation to{' '}
                        <span className="font-medium">{formData.email}</span>. Please check your
                        inbox.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => setSubmitted(false)}
                  variant="outline"
                  className="flex-1 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                >
                  New Reservation
                </Button>
                <Link to="/customer/home" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            {/* Hero Section */}
            <div className="mb-16 text-center">
              <div className="mb-8 inline-flex animate-bounce items-center justify-center">
                <div className="rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 shadow-2xl shadow-emerald-600/30">
                  <Calendar className="h-14 w-14 text-white" />
                </div>
              </div>
              <h1 className="mb-6 text-5xl font-bold text-gray-900 md:text-6xl lg:text-7xl">
                Reserve Your <span className="text-emerald-600">Table</span>
              </h1>
              <p className="mx-auto max-w-2xl text-xl text-gray-600">
                Book your table in advance and enjoy a delightful dining experience with your loved
                ones
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Reservation Form */}
              <Card className="group overflow-hidden border-2 shadow-2xl transition-all duration-300 hover:shadow-emerald-600/20 lg:col-span-2">
                <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-green-50">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="rounded-full bg-emerald-100 p-2">
                      <Calendar className="h-5 w-5 text-emerald-700" />
                    </div>
                    Reservation Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address (Optional)</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="date">Date *</Label>
                        <div className="relative">
                          <Calendar className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                          <Input
                            id="date"
                            name="date"
                            type="date"
                            className="pl-10"
                            value={formData.date}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Time *</Label>
                        <div className="relative">
                          <Clock className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                          <Input
                            id="time"
                            name="time"
                            type="time"
                            className="pl-10"
                            value={formData.time}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="guests">Guests *</Label>
                        <div className="relative">
                          <Users className="pointer-events-none absolute top-1/2 left-3 z-10 h-5 w-5 -translate-y-1/2 text-gray-400" />
                          <Select
                            value={formData.guests}
                            onValueChange={handleGuestsChange}
                            required
                          >
                            <SelectTrigger className="pl-10">
                              <SelectValue placeholder="Select number of guests" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 Guest</SelectItem>
                              <SelectItem value="2">2 Guests</SelectItem>
                              <SelectItem value="3">3 Guests</SelectItem>
                              <SelectItem value="4">4 Guests</SelectItem>
                              <SelectItem value="5">5 Guests</SelectItem>
                              <SelectItem value="6">6 Guests</SelectItem>
                              <SelectItem value="7">7 Guests</SelectItem>
                              <SelectItem value="8">8+ Guests</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Table Selection */}
                    {formData.date && formData.time && formData.guests && (
                      <div className="space-y-2">
                        <Label htmlFor="table">Select Table *</Label>
                        {loadingTables ? (
                          <div className="flex items-center justify-center rounded-md border border-gray-300 bg-gray-50 p-4">
                            <Loader2 className="mr-2 h-5 w-5 animate-spin text-emerald-600" />
                            <span className="text-sm text-gray-600">
                              Finding available tables...
                            </span>
                          </div>
                        ) : availableTables.length > 0 ? (
                          <Select
                            value={formData.tableId}
                            onValueChange={handleTableChange}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose your table" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableTables.map((table) => (
                                <SelectItem key={table.id} value={table.id}>
                                  Table {table.number} (Capacity: {table.capacity}
                                  {table.location ? `, ${table.location}` : ''})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 p-4">
                            <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
                            <div>
                              <p className="text-sm font-medium text-amber-900">
                                No tables available
                              </p>
                              <p className="text-sm text-amber-700">
                                Please select a different time or party size.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="message">Special Requests (Optional)</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Any dietary restrictions or special occasions?"
                        value={formData.message}
                        onChange={handleChange}
                        rows={4}
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={
                        loading ||
                        !formData.tableId ||
                        (loadingTables && availableTables.length === 0)
                      }
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-lg font-semibold shadow-lg shadow-emerald-600/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-600/40 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Calendar className="mr-2 h-5 w-5" />
                          Confirm Reservation
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Info Sidebar */}
              <div className="space-y-6">
                <Card className="overflow-hidden border-2 shadow-lg transition-all hover:shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-emerald-700" />
                      Opening Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 p-6">
                    <div className="flex justify-between rounded-lg bg-gray-50 p-3">
                      <span className="font-medium text-gray-700">Monday - Friday</span>
                      <span className="font-bold text-emerald-600">10:00 - 22:00</span>
                    </div>
                    <div className="flex justify-between rounded-lg bg-gray-50 p-3">
                      <span className="font-medium text-gray-700">Saturday - Sunday</span>
                      <span className="font-bold text-emerald-600">09:00 - 23:00</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border-2 shadow-lg transition-all hover:shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-emerald-700" />
                      Contact Us
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-4 transition-all hover:bg-emerald-50">
                      <div className="rounded-full bg-emerald-100 p-3">
                        <Phone className="h-5 w-5 text-emerald-700" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">+1 (555) 123-4567</p>
                        <p className="text-sm text-gray-600">Call for assistance</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-4 transition-all hover:bg-emerald-50">
                      <div className="rounded-full bg-emerald-100 p-3">
                        <Users className="h-5 w-5 text-emerald-700" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Party of 8+?</p>
                        <p className="text-sm text-gray-600">Please call to reserve</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg">
                  <CardContent className="p-6">
                    <div className="mb-3 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-emerald-700" />
                      <h3 className="font-bold text-gray-900">Pro Tips</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600">•</span>
                        <span>Book 2-5 PM for quieter dining</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600">•</span>
                        <span>Weekend reservations fill up fast</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600">•</span>
                        <span>Special occasions? Let us know!</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
