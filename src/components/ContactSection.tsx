import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Phone, Mail, Send, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ContactSection = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    countryCode: "+965",
    phone: "",
    email: "",
    projectType: "",
    message: "",
  });

  const countryCodes = [
    { code: "+965", name: "الكويت", flag: "🇰🇼" },
    { code: "+966", name: "السعودية", flag: "🇸🇦" },
    { code: "+971", name: "الإمارات", flag: "🇦🇪" },
    { code: "+973", name: "البحرين", flag: "🇧🇭" },
    { code: "+974", name: "قطر", flag: "🇶🇦" },
    { code: "+968", name: "عُمان", flag: "🇴🇲" },
    { code: "+962", name: "الأردن", flag: "🇯🇴" },
    { code: "+961", name: "لبنان", flag: "🇱🇧" },
    { code: "+20", name: "مصر", flag: "🇪🇬" },
    { code: "+212", name: "المغرب", flag: "🇲🇦" },
    { code: "+964", name: "العراق", flag: "🇮🇶" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      toast({
        title: "الإرسال غير متاح حالياً",
        description: "يرجى التواصل معنا مباشرة عبر الهاتف أو البريد الإلكتروني",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const contactData = {
      full_name: formData.fullName,
      phone: `${formData.countryCode} ${formData.phone}`,
      email: formData.email,
      project_type: formData.projectType,
      message: formData.message,
    };

    try {
      const { error } = await supabase.from("contact_requests").insert(contactData);

      if (error) throw error;

      // Send WhatsApp notification (fire and forget - don't block submission)
      supabase.functions.invoke('send-whatsapp-notification', {
        body: { contactRequest: contactData }
      }).catch(err => {
        console.error('WhatsApp notification failed:', err);
      });

      // إرسال البيانات إلى n8n لإشعار التيليجرام
      fetch('https://8n8.connectsys.cloud/webhook/63857cf5-fc2a-412e-a598-5c2979b15008', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      }).catch(err => {
        console.error('n8n Telegram notification failed:', err);
      });

      setIsSubmitted(true);
      toast({
        title: "تم إرسال طلبك بنجاح!",
        description: "سنتواصل معك في أقرب وقت ممكن",
      });
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const projectTypes = [
    "نظام إدارة مؤسسة",
    "موقع إلكتروني",
    "تطبيق جوال",
    "نظام نقاط البيع (POS)",
    "نظام إدارة المخزون",
    "تطوير نظام قائم",
    "أخرى",
  ];

  if (isSubmitted) {
    return (
      <section id="contact" dir="rtl" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary mb-6">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">تم إرسال طلبك بنجاح!</h2>
            <p className="text-muted-foreground mb-6">
              شكراً لتواصلك معنا. سيقوم فريقنا بالرد عليك في أقرب وقت ممكن.
            </p>
            <Button onClick={() => setIsSubmitted(false)} variant="outline">
              إرسال طلب آخر
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" dir="rtl" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 md:mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            تواصل معنا
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 md:mb-6 leading-tight">
            هل لديك فكرة <span className="gradient-text">مشروع؟</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            أو ترغب في تطوير نظامك الحالي؟ لنبدأ النقاش
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {/* Contact Form */}
          <Card className="border-0 shadow-xl order-2 lg:order-1">
            <CardContent className="p-5 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">الاسم الكامل</Label>
                  <Input
                    id="fullName"
                    placeholder="أدخل اسمك الكامل"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="text-right"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <div className="flex gap-2" dir="ltr">
                      <Select
                        value={formData.countryCode}
                        onValueChange={(value) =>
                          setFormData({ ...formData, countryCode: value })
                        }
                      >
                        <SelectTrigger className="w-[120px] flex-shrink-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background">
                          {countryCodes.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.flag} {country.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="xxxxxxxx"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="text-right"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectType">نوع المشروع</Label>
                  <Select
                    value={formData.projectType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, projectType: value })
                    }
                    required
                  >
                    <SelectTrigger className="text-right">
                      <SelectValue placeholder="اختر نوع المشروع" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      {projectTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">رسالتك</Label>
                  <Textarea
                    id="message"
                    placeholder="اكتب تفاصيل مشروعك أو استفسارك..."
                    rows={4}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="text-right resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full gradient-primary hover:opacity-90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "جاري الإرسال..."
                  ) : (
                    <>
                      إرسال الطلب
                      <Send className="mr-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="flex flex-col justify-center space-y-6 sm:space-y-8 order-1 lg:order-2">
            <div className="text-center lg:text-right">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
                أو تواصل معنا مباشرة
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                فريقنا جاهز للإجابة على استفساراتك ومناقشة مشروعك
              </p>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-secondary flex-shrink-0">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">الهاتف</p>
                  <a
                    href="tel:+96599679479"
                    className="text-base sm:text-lg font-semibold text-foreground hover:text-primary transition-colors"
                    dir="ltr"
                  >
                    +965 99679479
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-secondary flex-shrink-0">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">البريد الإلكتروني</p>
                  <a
                    href="mailto:info@connectsys.cloud"
                    className="text-base sm:text-lg font-semibold text-foreground hover:text-primary transition-colors break-all"
                  >
                    info@connectsys.cloud
                  </a>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary text-center lg:text-right">
              <p className="text-foreground font-medium mb-1 sm:mb-2 text-sm sm:text-base">⏰ ساعات العمل</p>
              <p className="text-muted-foreground text-sm sm:text-base">السبت - الخميس: 9 صباحاً - 6 مساءً</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
