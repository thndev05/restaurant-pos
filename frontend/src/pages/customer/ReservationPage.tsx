import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
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
} from 'lucide-react';
import { CustomerLayout } from '@/layouts/customer';

export default function ReservationPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: '2',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle reservation submission
    console.log('Reservation:', formData);
    setSubmitted(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium">Email:</span>
                    <span>{formData.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium">Date:</span>
                    <span>{formData.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium">Time:</span>
                    <span>{formData.time}</span>
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
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
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
                          <Users className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                          <Select
                            id="guests"
                            name="guests"
                            className="pl-10"
                            value={formData.guests}
                            onChange={handleChange}
                            required
                          >
                            <option value="1">1 Guest</option>
                            <option value="2">2 Guests</option>
                            <option value="3">3 Guests</option>
                            <option value="4">4 Guests</option>
                            <option value="5">5 Guests</option>
                            <option value="6">6 Guests</option>
                            <option value="7">7 Guests</option>
                            <option value="8">8+ Guests</option>
                          </Select>
                        </div>
                      </div>
                    </div>

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
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-lg font-semibold shadow-lg shadow-emerald-600/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-600/40"
                    >
                      <Calendar className="mr-2 h-5 w-5" />
                      Confirm Reservation
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
