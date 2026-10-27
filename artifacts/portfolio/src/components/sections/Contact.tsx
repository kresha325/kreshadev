import { useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const countryCallingCodes = [
  ["AL", "Albania", "+355"], ["AD", "Andorra", "+376"], ["AE", "United Arab Emirates", "+971"], ["AF", "Afghanistan", "+93"], ["AG", "Antigua and Barbuda", "+1-268"], ["AI", "Anguilla", "+1-264"], ["AM", "Armenia", "+374"], ["AO", "Angola", "+244"], ["AR", "Argentina", "+54"], ["AT", "Austria", "+43"], ["AU", "Australia", "+61"], ["AZ", "Azerbaijan", "+994"],
  ["BA", "Bosnia and Herzegovina", "+387"], ["BB", "Barbados", "+1-246"], ["BD", "Bangladesh", "+880"], ["BE", "Belgium", "+32"], ["BF", "Burkina Faso", "+226"], ["BG", "Bulgaria", "+359"], ["BH", "Bahrain", "+973"], ["BI", "Burundi", "+257"], ["BJ", "Benin", "+229"], ["BN", "Brunei", "+673"], ["BO", "Bolivia", "+591"], ["BR", "Brazil", "+55"], ["BS", "Bahamas", "+1-242"], ["BT", "Bhutan", "+975"], ["BW", "Botswana", "+267"], ["BY", "Belarus", "+375"], ["BZ", "Belize", "+501"],
  ["CA", "Canada", "+1"], ["CD", "DR Congo", "+243"], ["CF", "Central African Republic", "+236"], ["CG", "Congo", "+242"], ["CH", "Switzerland", "+41"], ["CI", "Côte d’Ivoire", "+225"], ["CL", "Chile", "+56"], ["CM", "Cameroon", "+237"], ["CN", "China", "+86"], ["CO", "Colombia", "+57"], ["CR", "Costa Rica", "+506"], ["CU", "Cuba", "+53"], ["CV", "Cabo Verde", "+238"], ["CY", "Cyprus", "+357"], ["CZ", "Czechia", "+420"],
  ["DE", "Germany", "+49"], ["DJ", "Djibouti", "+253"], ["DK", "Denmark", "+45"], ["DM", "Dominica", "+1-767"], ["DO", "Dominican Republic", "+1-809"], ["DZ", "Algeria", "+213"], ["EC", "Ecuador", "+593"], ["EE", "Estonia", "+372"], ["EG", "Egypt", "+20"], ["ER", "Eritrea", "+291"], ["ES", "Spain", "+34"], ["ET", "Ethiopia", "+251"], ["FI", "Finland", "+358"], ["FJ", "Fiji", "+679"], ["FM", "Micronesia", "+691"], ["FR", "France", "+33"],
  ["GA", "Gabon", "+241"], ["GB", "United Kingdom", "+44"], ["GD", "Grenada", "+1-473"], ["GE", "Georgia", "+995"], ["GH", "Ghana", "+233"], ["GM", "Gambia", "+220"], ["GN", "Guinea", "+224"], ["GQ", "Equatorial Guinea", "+240"], ["GR", "Greece", "+30"], ["GT", "Guatemala", "+502"], ["GW", "Guinea-Bissau", "+245"], ["GY", "Guyana", "+592"], ["HN", "Honduras", "+504"], ["HR", "Croatia", "+385"], ["HT", "Haiti", "+509"], ["HU", "Hungary", "+36"], ["ID", "Indonesia", "+62"], ["IE", "Ireland", "+353"], ["IL", "Israel", "+972"], ["IN", "India", "+91"], ["IQ", "Iraq", "+964"], ["IR", "Iran", "+98"], ["IS", "Iceland", "+354"], ["IT", "Italy", "+39"],
  ["JM", "Jamaica", "+1-876"], ["JO", "Jordan", "+962"], ["JP", "Japan", "+81"], ["KE", "Kenya", "+254"], ["KG", "Kyrgyzstan", "+996"], ["KH", "Cambodia", "+855"], ["KI", "Kiribati", "+686"], ["KM", "Comoros", "+269"], ["KN", "Saint Kitts and Nevis", "+1-869"], ["KP", "North Korea", "+850"], ["KR", "South Korea", "+82"], ["KW", "Kuwait", "+965"], ["KZ", "Kazakhstan", "+7"], ["XK", "Kosovo", "+383"], ["LA", "Laos", "+856"], ["LB", "Lebanon", "+961"], ["LC", "Saint Lucia", "+1-758"], ["LI", "Liechtenstein", "+423"], ["LK", "Sri Lanka", "+94"], ["LR", "Liberia", "+231"], ["LS", "Lesotho", "+266"], ["LT", "Lithuania", "+370"], ["LU", "Luxembourg", "+352"], ["LV", "Latvia", "+371"], ["LY", "Libya", "+218"],
  ["MA", "Morocco", "+212"], ["MC", "Monaco", "+377"], ["MD", "Moldova", "+373"], ["ME", "Montenegro", "+382"], ["MG", "Madagascar", "+261"], ["MH", "Marshall Islands", "+692"], ["MK", "North Macedonia", "+389"], ["ML", "Mali", "+223"], ["MM", "Myanmar", "+95"], ["MN", "Mongolia", "+976"], ["MR", "Mauritania", "+222"], ["MT", "Malta", "+356"], ["MU", "Mauritius", "+230"], ["MV", "Maldives", "+960"], ["MW", "Malawi", "+265"], ["MX", "Mexico", "+52"], ["MY", "Malaysia", "+60"], ["MZ", "Mozambique", "+258"], ["NA", "Namibia", "+264"], ["NE", "Niger", "+227"], ["NG", "Nigeria", "+234"], ["NI", "Nicaragua", "+505"], ["NL", "Netherlands", "+31"], ["NO", "Norway", "+47"], ["NP", "Nepal", "+977"], ["NR", "Nauru", "+674"], ["NZ", "New Zealand", "+64"], ["OM", "Oman", "+968"], ["PA", "Panama", "+507"], ["PE", "Peru", "+51"], ["PG", "Papua New Guinea", "+675"], ["PH", "Philippines", "+63"], ["PK", "Pakistan", "+92"], ["PL", "Poland", "+48"], ["PT", "Portugal", "+351"], ["PW", "Palau", "+680"], ["PY", "Paraguay", "+595"], ["QA", "Qatar", "+974"], ["RO", "Romania", "+40"], ["RS", "Serbia", "+381"], ["RU", "Russia", "+7"], ["RW", "Rwanda", "+250"], ["SA", "Saudi Arabia", "+966"], ["SB", "Solomon Islands", "+677"], ["SC", "Seychelles", "+248"], ["SD", "Sudan", "+249"], ["SE", "Sweden", "+46"], ["SG", "Singapore", "+65"], ["SI", "Slovenia", "+386"], ["SK", "Slovakia", "+421"], ["SL", "Sierra Leone", "+232"], ["SM", "San Marino", "+378"], ["SN", "Senegal", "+221"], ["SO", "Somalia", "+252"], ["SR", "Suriname", "+597"], ["SS", "South Sudan", "+211"], ["ST", "São Tomé and Príncipe", "+239"], ["SV", "El Salvador", "+503"], ["SY", "Syria", "+963"], ["SZ", "Eswatini", "+268"], ["TD", "Chad", "+235"], ["TG", "Togo", "+228"], ["TH", "Thailand", "+66"], ["TJ", "Tajikistan", "+992"], ["TL", "Timor-Leste", "+670"], ["TM", "Turkmenistan", "+993"], ["TN", "Tunisia", "+216"], ["TO", "Tonga", "+676"], ["TR", "Türkiye", "+90"], ["TT", "Trinidad and Tobago", "+1-868"], ["TV", "Tuvalu", "+688"], ["TW", "Taiwan", "+886"], ["TZ", "Tanzania", "+255"], ["UA", "Ukraine", "+380"], ["UG", "Uganda", "+256"], ["US", "United States", "+1"], ["UY", "Uruguay", "+598"], ["UZ", "Uzbekistan", "+998"], ["VA", "Vatican City", "+39"], ["VC", "Saint Vincent and the Grenadines", "+1-784"], ["VE", "Venezuela", "+58"], ["VN", "Vietnam", "+84"], ["VU", "Vanuatu", "+678"], ["WS", "Samoa", "+685"], ["YE", "Yemen", "+967"], ["ZA", "South Africa", "+27"], ["ZM", "Zambia", "+260"], ["ZW", "Zimbabwe", "+263"],
].sort((a, b) => a[1].localeCompare(b[1]));

const blankForm = { name: "", email: "", countryCode: "+383", phone: "", projectType: "", message: "", website: "" };

export default function Contact() {
  const [form, setForm] = useState(blankForm);
  const [successOpen, setSuccessOpen] = useState(false);

  function submitProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const whatsappMessage = [
      "Përshëndetje KreshaDev! Dua të diskutoj një projekt.",
      `Emri: ${form.name}`,
      `Email: ${form.email}`,
      `Telefoni: ${form.countryCode} ${form.phone}`,
      `Lloji i projektit: ${form.projectType}`,
      `Përshkrimi: ${form.message}`,
    ].join("\n");
    const whatsappUrl = `https://wa.me/38344416502?text=${encodeURIComponent(whatsappMessage)}`;
    const whatsappTab = window.open(whatsappUrl, "_blank");
    if (whatsappTab) whatsappTab.opener = null;
    else window.location.href = whatsappUrl;
    setForm(blankForm);
    setSuccessOpen(true);
  }

  return (
    <footer className="relative w-full pb-16">
      <h2 className="mb-16 font-mono text-sm text-gray-500 md:text-base">// contact.init</h2>

      <div className="flex flex-col items-center text-center">
        <h3 className="mb-4 max-w-4xl font-sans text-4xl font-bold tracking-tight text-white md:text-7xl">
          Let's build something <span className="text-[#0066FF]">extraordinary.</span>
        </h3>
        <p className="mb-12 font-mono text-sm uppercase tracking-widest text-gray-500">KreshaDev — building from Kosovo</p>

        <form onSubmit={submitProject} className="mb-20 w-full max-w-3xl rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left md:p-8">
          <div className="mb-7 flex flex-wrap items-baseline justify-between gap-2">
            <h4 className="font-mono text-sm text-white md:text-base">// initialize.project</h4>
            <span className="font-mono text-[10px] uppercase tracking-widest text-gray-600">Tell me what you have in mind</span>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="contact-name" className="font-mono text-xs text-gray-400">Your name</label>
              <input id="contact-name" name="name" autoComplete="name" required maxLength={100} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#0066FF]" placeholder="Name" />
            </div>
            <div>
              <label htmlFor="contact-email" className="font-mono text-xs text-gray-400">Email address</label>
              <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#0066FF]" placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="contact-country-code" className="font-mono text-xs text-gray-400">Country code</label>
              <select id="contact-country-code" name="countryCode" required value={form.countryCode} onChange={(event) => setForm({ ...form, countryCode: event.target.value })} className="mt-2 w-full rounded-lg border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none focus:border-[#0066FF]">
                {countryCallingCodes.map(([code, country, prefix]) => <option key={code} value={prefix}>{country} ({prefix})</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="contact-phone" className="font-mono text-xs text-gray-400">Phone number</label>
              <input id="contact-phone" name="phone" type="tel" autoComplete="tel-national" required maxLength={20} pattern="[0-9 ()-]{5,20}" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#0066FF]" placeholder="44 123 456" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="contact-type" className="font-mono text-xs text-gray-400">Project type</label>
              <select id="contact-type" name="projectType" required value={form.projectType} onChange={(event) => setForm({ ...form, projectType: event.target.value })} className="mt-2 w-full rounded-lg border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none focus:border-[#0066FF]">
                <option value="" disabled>Select a project type</option>
                <option value="Website">Website</option>
                <option value="Mobile app">Mobile app</option>
                <option value="Web platform">Web platform</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="contact-message" className="font-mono text-xs text-gray-400">Project brief</label>
              <textarea id="contact-message" name="message" required minLength={10} maxLength={5000} rows={5} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} className="mt-2 w-full resize-y rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm leading-6 text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#0066FF]" placeholder="A few details about your idea, goals, and timeline…" />
            </div>
          </div>

          <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
            <label htmlFor="contact-website">Leave this field empty</label>
            <input id="contact-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} />
          </div>

          <button type="submit" className="interactive mt-6 inline-flex items-center gap-3 border border-[#0066FF]/50 bg-[#0066FF]/10 px-5 py-3 font-mono text-sm text-white transition-colors hover:bg-[#0066FF]/20">
            Continue in WhatsApp<span aria-hidden="true">→</span>
          </button>
          <p className="mt-4 font-mono text-[10px] leading-5 text-gray-600">WhatsApp will open with your project details ready. Review and send the message there.</p>
        </form>

        <div className="mb-32 flex flex-col gap-8 md:flex-row">
          <a href="mailto:kresha325@gmail.com" className="group interactive flex items-center border-b border-transparent pb-1 font-mono text-lg text-gray-400 transition-colors hover:border-[#0066FF] hover:text-white">
            <span className="mr-2 -translate-x-4 text-[#0066FF] opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">➜</span>kresha325@gmail.com
          </a>
          <a href="https://wa.me/38344416502" target="_blank" rel="noopener noreferrer" aria-label="Contact KreshaDev on WhatsApp at +383 44 416 502" className="group interactive flex items-center border-b border-transparent pb-1 font-mono text-lg text-gray-400 transition-colors hover:border-[#00D4FF] hover:text-white">
            <span className="mr-2 -translate-x-4 text-[#00D4FF] opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">➜</span>WhatsApp · +383 44 416 502
          </a>
          <a href="https://github.com/kresha325" target="_blank" rel="noopener noreferrer" className="group interactive flex items-center border-b border-transparent pb-1 font-mono text-lg text-gray-400 transition-colors hover:border-[#00D4FF] hover:text-white">
            <span className="mr-2 -translate-x-4 text-[#00D4FF] opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">➜</span>github.com/kresha325
          </a>
        </div>

        <div className="w-full border-t border-white/5 pt-8 font-mono text-xs uppercase tracking-widest text-gray-600">© {new Date().getFullYear()} KreshaDev. All rights reserved.</div>
      </div>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="border-white/10 bg-[#0b0b0b] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-sans text-2xl">Project initialized ✓</DialogTitle>
            <DialogDescription className="pt-2 leading-6 text-gray-400">
              WhatsApp opened with your project details. Review the message and tap Send to contact KreshaDev.
            </DialogDescription>
          </DialogHeader>
          <button type="button" onClick={() => setSuccessOpen(false)} className="mt-2 w-fit border border-[#0066FF]/50 bg-[#0066FF]/10 px-4 py-2 font-mono text-sm text-white transition-colors hover:bg-[#0066FF]/20">Close</button>
        </DialogContent>
      </Dialog>
    </footer>
  );
}
