import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent! We\'ll get back to you soon.');
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'support@uhailink.com',
      link: 'mailto:support@uhailink.com',
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+254 700 000 000',
      link: 'tel:+254700000000',
    },
    {
      icon: MapPin,
      title: 'Address',
      value: 'Nairobi, Kenya',
      link: null,
    },
  ];

  return (
    <Layout>
      <div className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Contact Us</h1>
            <p className="text-xl text-muted-foreground">
              Have questions? We're here to help.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Get in Touch</CardTitle>
                  <CardDescription>
                    Reach out to us through any of these channels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <info.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{info.title}</p>
                        {info.link ? (
                          <a
                            href={info.link}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            {info.value}
                          </a>
                        ) : (
                          <p className="text-sm text-muted-foreground">{info.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-primary text-primary-foreground">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center mb-2">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <CardTitle>Need Immediate Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 opacity-90">
                    For medical emergencies, please contact:
                  </p>
                  <div className="space-y-2">
                    <p className="font-semibold">Kenya Red Cross: 1199</p>
                    <p className="font-semibold">Emergency: 999</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="lg:col-span-2 shadow-lg">
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="John Doe" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john@example.com" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help?" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full md:w-auto">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
