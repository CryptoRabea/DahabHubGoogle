
import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Check, Globe, ScrollText, ArrowDownToLine } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onAgree }) => {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      // Buffer of 15px for various screen densities
      if (scrollTop + clientHeight >= scrollHeight - 15) {
        setHasScrolledToBottom(true);
      }
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
      // Small timeout to ensure it registers as scrolled
      setTimeout(() => setHasScrolledToBottom(true), 500);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(false);
      // Reset scroll position
      setTimeout(() => {
        if(scrollRef.current) scrollRef.current.scrollTop = 0;
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[85vh] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-dahab-teal/10 text-dahab-teal rounded-2xl">
              <ScrollText size={24} />
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-900">{lang === 'ar' ? 'شروط وأحكام المستخدمين' : 'Client Terms & Conditions'}</h3>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">AmakenDahab Platform</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition"
            >
              <Globe size={16} className="text-dahab-teal" />
              {lang === 'ar' ? 'English' : 'عربي'}
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className={`flex-1 overflow-y-auto p-8 space-y-8 text-gray-800 leading-relaxed ${lang === 'ar' ? 'text-right' : 'text-left'}`}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          <div className="space-y-6">
            <p className="font-medium text-gray-600">
              {lang === 'ar' 
                ? 'يرجى قراءة الشروط والأحكام التالية بعناية قبل استخدام التطبيق كمستخدم. باستخدامك للتطبيق، فإنك توافق على الالتزام الكامل بهذه الشروط.'
                : 'Please read the following Terms & Conditions carefully before using the application as a Client. By using the app, you agree to be fully bound by these terms.'}
            </p>

            <section>
              <h4 className="font-extrabold text-lg text-dahab-teal mb-3">{lang === 'ar' ? 'أولاً: التعريفات' : 'Section 1: Definitions'}</h4>
              <ul className="space-y-2 text-sm">
                <li><strong>{lang === 'ar' ? 'التطبيق:' : 'Application:'}</strong> {lang === 'ar' ? 'منصة إلكترونية لعرض الفعاليات وتنظيم الحجوزات وربط المستخدمين بمقدمي الخدمات.' : 'A digital platform for listing events, managing bookings, and connecting Clients with Providers.'}</li>
                <li><strong>{lang === 'ar' ? 'المستخدم (Client):' : 'Client:'}</strong> {lang === 'ar' ? 'أي شخص يستخدم التطبيق لتصفح الفعاليات أو حجز أو شراء تذاكر.' : 'Any individual using the application to browse, book, or purchase event tickets.'}</li>
                <li><strong>{lang === 'ar' ? 'مقدم الخدمة (Provider):' : 'Provider:'}</strong> {lang === 'ar' ? 'الجهة أو الشخص المسؤول عن تنظيم وتنفيذ الفعالية.' : 'The individual or entity responsible for organizing and delivering the event.'}</li>
                <li><strong>{lang === 'ar' ? 'الفعالية / الإيفينت:' : 'Event:'}</strong> {lang === 'ar' ? 'أي حدث يتم عرضه على التطبيق سواء كان مجانيًا أو مدفوعًا.' : 'Any event listed on the application, whether free or paid.'}</li>
              </ul>
            </section>

            <section>
              <h4 className="font-extrabold text-lg text-dahab-teal mb-3">{lang === 'ar' ? 'ثانياً: استخدام التطبيق' : 'Section 2: App Usage'}</h4>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>{lang === 'ar' ? 'يلتزم المستخدم باستخدام التطبيق لأغراض مشروعة فقط.' : 'Clients must use the application for lawful purposes only.'}</li>
                <li>{lang === 'ar' ? 'يلتزم المستخدم بإدخال بيانات صحيحة عند التسجيل أو الحجز.' : 'Clients must provide accurate information during registration or booking.'}</li>
                <li>{lang === 'ar' ? 'يحق للتطبيق إيقاف أو تقييد أي حساب في حال إساءة الاستخدام.' : 'The application reserves the right to suspend or restrict accounts in case of misuse.'}</li>
              </ul>
            </section>

            <section>
              <h4 className="font-extrabold text-lg text-dahab-teal mb-3">{lang === 'ar' ? 'ثالثاً: الحجز والتذاكر' : 'Section 3: Bookings & Tickets'}</h4>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>{lang === 'ar' ? 'يتيح التطبيق للمستخدمين حجز أو شراء تذاكر الفعاليات المعروضة.' : 'The application allows Clients to book or purchase tickets for listed events.'}</li>
                <li>{lang === 'ar' ? 'بعد إتمام عملية الدفع، يتم إرسال تأكيد الحجز إلى المستخدم عبر التطبيق أو البريد الإلكتروني.' : 'Booking confirmation will be sent to the Client after successful payment.'}</li>
                <li>{lang === 'ar' ? 'التذكرة صالحة للاستخدام من قبل المستخدم فقط ولا يجوز إعادة بيعها إلا بموافقة التطبيق.' : 'Tickets are personal and may not be resold without the application’s approval.'}</li>
              </ul>
            </section>

            <section>
              <h4 className="font-extrabold text-lg text-dahab-teal mb-3">{lang === 'ar' ? 'رابعاً: الأسعار والدفع' : 'Section 4: Pricing & Payments'}</h4>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>{lang === 'ar' ? 'يتم عرض أسعار التذاكر بوضوح داخل التطبيق قبل تأكيد الحجز.' : 'Ticket prices are clearly displayed before booking confirmation.'}</li>
                <li>{lang === 'ar' ? 'تتم جميع عمليات الدفع من خلال وسائل الدفع المعتمدة داخل التطبيق.' : 'All payments are processed through the application’s approved payment methods.'}</li>
                <li>{lang === 'ar' ? 'لا يتحمل التطبيق مسؤولية أي أخطاء ناتجة عن إدخال بيانات دفع غير صحيحة من قبل المستخدم.' : 'The application is not responsible for payment errors caused by incorrect user information.'}</li>
              </ul>
            </section>

            <section>
              <h4 className="font-extrabold text-lg text-dahab-teal mb-3">{lang === 'ar' ? 'خامساً: الإلغاء والاسترداد' : 'Section 5: Cancellation & Refunds'}</h4>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>{lang === 'ar' ? 'تخضع سياسات الإلغاء والاسترداد لشروط مقدم الخدمة الخاصة بكل فعالية.' : 'Cancellation and refund policies are determined by the Provider for each event.'}</li>
                <li>{lang === 'ar' ? 'يجب على المستخدم مراجعة سياسة الإلغاء قبل إتمام الحجز.' : 'Clients must review cancellation policies before booking.'}</li>
                <li>{lang === 'ar' ? 'في حال إلغاء الفعالية من قبل مقدم الخدمة، يتم التعامل مع الاسترداد وفق السياسة المعلنة.' : 'If an event is canceled by the Provider, refunds are handled according to the stated policy.'}</li>
              </ul>
            </section>

            <section>
              <h4 className="font-extrabold text-lg text-dahab-teal mb-3">{lang === 'ar' ? 'سادساً: المسؤولية' : 'Section 6: Liability'}</h4>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>{lang === 'ar' ? 'التطبيق يعمل كوسيط بين المستخدم ومقدم الخدمة ولا يتحمل مسؤولية تنفيذ الفعالية.' : 'The application acts as an intermediary and is not responsible for event execution.'}</li>
                <li>{lang === 'ar' ? 'لا يتحمل التطبيق أي مسؤولية عن أي إصابات أو أضرار تحدث أثناء الفعالية.' : 'The application is not liable for injuries or damages occurring during events.'}</li>
              </ul>
            </section>

            <section>
              <h4 className="font-extrabold text-lg text-dahab-teal mb-3">{lang === 'ar' ? 'سابعاً: التعديلات وإنهاء الخدمة' : 'Section 7: Amendments & Termination'}</h4>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>{lang === 'ar' ? 'يحق للتطبيق تعديل هذه الشروط والأحكام في أي وقت مع إخطار المستخدمين.' : 'The application may amend these Terms & Conditions at any time with notice.'}</li>
                <li>{lang === 'ar' ? 'يحق للتطبيق إيقاف أو إنهاء حساب المستخدم في حال مخالفة الشروط.' : 'User accounts may be suspended or terminated for violations.'}</li>
              </ul>
            </section>

            <section>
              <h4 className="font-extrabold text-lg text-dahab-teal mb-3">{lang === 'ar' ? 'ثامناً: القانون المنظم' : 'Section 8: Governing Law'}</h4>
              <p className="text-sm">
                {lang === 'ar' 
                  ? 'تخضع هذه الشروط والأحكام للقوانين المعمول بها في جمهورية مصر العربية.'
                  : 'These Terms & Conditions are governed by the laws of the Arab Republic of Egypt.'}
              </p>
            </section>

            <div className="bg-dahab-teal/5 p-6 rounded-2xl border border-dahab-teal/20 italic text-sm text-dahab-teal font-medium mt-10">
              {lang === 'ar' 
                ? 'باستخدامك للتطبيق كمستخدم، فإنك تقر بموافقتك الكاملة على جميع ما ورد أعلاه.'
                : 'By using the application as a Client, you confirm your full acceptance of all the above terms.'}
            </div>
          </div>
        </div>

        {/* Floating Quick Scroll Button */}
        {!hasScrolledToBottom && (
          <button 
            onClick={scrollToBottom}
            className="absolute bottom-40 right-8 bg-dahab-teal text-white w-14 h-14 rounded-full shadow-2xl animate-bounce hover:bg-teal-700 transition-all flex items-center justify-center z-20 group"
          >
            <ArrowDownToLine size={24} className="group-hover:scale-110 transition-transform" />
          </button>
        )}

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-4">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition ${hasScrolledToBottom ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
            {hasScrolledToBottom ? <Check size={20} className="shrink-0" /> : <ChevronDown size={20} className="shrink-0 animate-bounce" />}
            <p className="text-xs font-bold uppercase tracking-wider">
              {hasScrolledToBottom 
                ? (lang === 'ar' ? 'تمت القراءة بالكامل - يمكنك الموافقة الآن' : 'Finished Reading - You can agree now')
                : (lang === 'ar' ? 'يرجى التمرير للأسفل حتى النهاية للتفعيل' : 'Please scroll all the way down to activate')}
            </p>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition"
            >
              {lang === 'ar' ? 'رجوع' : 'Back'}
            </button>
            <button 
              onClick={onAgree}
              disabled={!hasScrolledToBottom}
              className={`flex-[2] py-4 rounded-2xl font-bold transition shadow-xl shadow-dahab-teal/20 ${hasScrolledToBottom ? 'bg-dahab-teal text-white hover:bg-teal-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              {lang === 'ar' ? 'أوافق على الشروط' : 'I Agree to Terms'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
