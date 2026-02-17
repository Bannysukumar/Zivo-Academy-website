import type { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MapPin, Phone } from "lucide-react"

export const metadata: Metadata = { title: "Contact Us" }

export default function ContactPage() {
  return (
    <div className="bg-background py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-foreground md:text-4xl">
            Get in Touch
          </h1>
          <p className="mt-3 text-muted-foreground">
            Have questions? We would love to hear from you.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Contact Info */}
          <div className="flex flex-col gap-4">
            {[
              { icon: Mail, title: "Email", info: "support@zivoacademy.com" },
              { icon: Phone, title: "Phone", info: "+91 98765 43210" },
              { icon: MapPin, title: "Office", info: "Bangalore, Karnataka, India" },
            ].map((item, i) => (
              <Card key={i} className="border border-border">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.info}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <Card className="border border-border lg:col-span-2">
            <CardContent className="flex flex-col gap-4 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="How can we help?" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Your message..." rows={5} />
              </div>
              <Button className="w-full md:w-auto md:self-end">Send Message</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
