import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Check, FileText, Globe } from 'lucide-react';

interface ProviderAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

type Language = 'ar' | 'en';

const ProviderAgreementModal: React.FC<ProviderAgreementModalProps> = ({ isOpen, onClose, onAccept }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(false);
    }
  }, [isOpen, language]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Consider scrolled to bottom when within 20px of the bottom
      if (scrollHeight - scrollTop - clientHeight < 20) {
        setHasScrolledToBottom(true);
      }
    }
  };

  const scrollToBottom = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  if (!isOpen) return null;

  const arabicTerms = `
شروط وأحكام مقدمي الخدمات (Provider)

يرجى قراءة الشروط والأحكام التالية بعناية قبل استخدام التطبيق كمقدم خدمة. باستخدامك للتطبيق، فإنك توافق على الالتزام الكامل بهذه الشروط.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

أولاً: التعريفات

• التطبيق: منصة إلكترونية لعرض الفعاليات وتنظيم الحجوزات وربط المستخدمين بمقدمي الخدمات.

• المستخدم (Client): أي شخص يستخدم التطبيق لتصفح الفعاليات أو حجز أو شراء تذاكر.

• مقدم الخدمة (Provider): الجهة أو الشخص المسؤول عن تنظيم وتنفيذ الفعالية.

• الفعالية / الإيفينت: أي حدث يتم عرضه على التطبيق سواء كان مجانيًا أو مدفوعًا.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ثانياً: استخدام التطبيق

1. يلتزم المستخدم باستخدام التطبيق لأغراض مشروعة فقط.

2. يلتزم المستخدم بإدخال بيانات صحيحة عند التسجيل أو الحجز.

3. يحق للتطبيق إيقاف أو تقييد أي حساب في حال إساءة الاستخدام.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ثالثاً: الحجز والتذاكر

1. يتيح التطبيق للمستخدمين حجز أو شراء تذاكر الفعاليات المعروضة.

2. بعد إتمام عملية الدفع، يتم إرسال تأكيد الحجز إلى المستخدم عبر التطبيق أو البريد الإلكتروني.

3. التذكرة صالحة للاستخدام من قبل المستخدم فقط ولا يجوز إعادة بيعها إلا بموافقة التطبيق.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

رابعاً: الأسعار والدفع

1. يتم عرض أسعار التذاكر بوضوح داخل التطبيق قبل تأكيد الحجز.

2. تتم جميع عمليات الدفع من خلال وسائل الدفع المعتمدة داخل التطبيق.

3. لا يتحمل التطبيق مسؤولية أي أخطاء ناتجة عن إدخال بيانات دفع غير صحيحة من قبل المستخدم.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

خامساً: الإلغاء والاسترداد

1. تخضع سياسات الإلغاء والاسترداد لشروط مقدم الخدمة الخاصة بكل فعالية.

2. يجب على المستخدم مراجعة سياسة الإلغاء قبل إتمام الحجز.

3. في حال إلغاء الفعالية من قبل مقدم الخدمة، يتم التعامل مع الاسترداد وفق السياسة المعلنة.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

سادساً: المسؤولية

1. التطبيق يعمل كوسيط بين المستخدم ومقدم الخدمة ولا يتحمل مسؤولية تنفيذ الفعالية.

2. لا يتحمل التطبيق أي مسؤولية عن أي إصابات أو أضرار تحدث أثناء الفعالية.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

سابعاً: التعديلات وإنهاء الخدمة

1. يحق للتطبيق تعديل هذه الشروط والأحكام في أي وقت مع إخطار المستخدمين.

2. يحق للتطبيق إيقاف أو إنهاء حساب المستخدم في حال مخالفة الشروط.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ثامناً: القانون المنظم

تخضع هذه الشروط والأحكام للقوانين المعمول بها في جمهورية مصر العربية.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

باستخدامك للتطبيق كمقدم خدمة، فإنك تقر بموافقتك الكاملة على جميع ما ورد أعلاه.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ملخص للاستخدام داخل التطبيق:

باستخدامك للتطبيق، فإنك توافق على:

• الالتزام بشروط الحجز والدفع لكل فعالية.

• مراجعة سياسة الإلغاء قبل تأكيد الحجز.

• إقرارك بأن التطبيق وسيط وليس مسؤولًا عن تنفيذ الفعاليات.

بالضغط على "أوافق"، فإنك تقر بموافقتك على شروط وأحكام مقدمي الخدمات.
`;

  const englishTerms = `
Provider Terms & Conditions

Please read the following Terms & Conditions carefully before using the application as a Provider. By using the app, you agree to be fully bound by these terms.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Definitions

• Application: A digital platform for listing events, managing bookings, and connecting Clients with Providers.

• Client: Any individual using the application to browse, book, or purchase event tickets.

• Provider: The individual or entity responsible for organizing and delivering the event.

• Event: Any event listed on the application, whether free or paid.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. App Usage

1. Clients must use the application for lawful purposes only.

2. Clients must provide accurate information during registration or booking.

3. The application reserves the right to suspend or restrict accounts in case of misuse.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. Bookings & Tickets

1. The application allows Clients to book or purchase tickets for listed events.

2. Booking confirmation will be sent to the Client after successful payment.

3. Tickets are personal and may not be resold without the application's approval.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. Pricing & Payments

1. Ticket prices are clearly displayed before booking confirmation.

2. All payments are processed through the application's approved payment methods.

3. The application is not responsible for payment errors caused by incorrect user information.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5. Cancellation & Refunds

1. Cancellation and refund policies are determined by the Provider for each event.

2. Clients must review cancellation policies before booking.

3. If an event is canceled by the Provider, refunds are handled according to the stated policy.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6. Liability

1. The application acts as an intermediary and is not responsible for event execution.

2. The application is not liable for injuries or damages occurring during events.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

7. Amendments & Termination

1. The application may amend these Terms & Conditions at any time with notice.

2. User accounts may be suspended or terminated for violations.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

8. Governing Law

These Terms & Conditions are governed by the laws of the Arab Republic of Egypt.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

By using the application as a Provider, you confirm your full acceptance of all the above terms.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

In-App Summary:

By using the app, you agree to:

• Follow booking and payment terms for each event.

• Review cancellation policies before booking.

• Acknowledge that the app acts as an intermediary and is not responsible for event delivery.

By clicking "Agree", you confirm acceptance of the Provider Terms & Conditions.

This is a summary. Full Terms & Conditions remain legally binding.
`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-dahab-teal to-blue-500 p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <FileText size={24} />
              <h2 className="text-xl font-bold">
                {language === 'ar' ? 'شروط وأحكام مقدمي الخدمات' : 'Provider Terms & Conditions'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Language Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage('en')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                language === 'en'
                  ? 'bg-white text-dahab-teal'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              <Globe size={16} />
              English
            </button>
            <button
              onClick={() => setLanguage('ar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                language === 'ar'
                  ? 'bg-white text-dahab-teal'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              <Globe size={16} />
              العربية
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        {!hasScrolledToBottom && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between">
            <p className="text-amber-700 text-sm font-medium">
              {language === 'ar'
                ? '⚠️ يرجى قراءة الشروط كاملة والتمرير للأسفل للموافقة'
                : '⚠️ Please read the full terms and scroll to the bottom to agree'}
            </p>
            <button
              onClick={scrollToBottom}
              className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition"
            >
              <ChevronDown size={16} />
              {language === 'ar' ? 'انتقل للأسفل' : 'Scroll Down'}
            </button>
          </div>
        )}

        {/* Terms Content */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className={`flex-1 overflow-y-auto p-6 ${language === 'ar' ? 'text-right' : 'text-left'}`}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
          <pre className="whitespace-pre-wrap font-sans text-gray-700 text-sm leading-relaxed">
            {language === 'ar' ? arabicTerms : englishTerms}
          </pre>
        </div>

        {/* Footer with Accept Button */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between gap-4">
            <p className={`text-xs ${hasScrolledToBottom ? 'text-green-600' : 'text-gray-400'}`}>
              {hasScrolledToBottom ? (
                <span className="flex items-center gap-1">
                  <Check size={14} />
                  {language === 'ar' ? 'لقد قرأت الشروط كاملة' : 'You have read the full terms'}
                </span>
              ) : (
                language === 'ar'
                  ? 'قم بالتمرير للأسفل لقراءة جميع الشروط'
                  : 'Scroll down to read all terms'
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={onAccept}
                disabled={!hasScrolledToBottom}
                className={`px-6 py-2.5 rounded-xl font-bold transition flex items-center gap-2 ${
                  hasScrolledToBottom
                    ? 'bg-dahab-teal text-white hover:bg-teal-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Check size={18} />
                {language === 'ar' ? 'أوافق على الشروط' : 'I Agree'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderAgreementModal;
