import { useNavigate } from "react-router-dom";

export default function TermsConditionPage() {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <main className="fixed inset-0 overflow-auto bg-gradient-to-br from-white via-blue-100 to-slate-100">
      <div className="mx-auto max-w-6xl px-6 pt-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <TermsNavigation />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            <TermsCondition />
            
            <div className="mt-12 flex justify-center pb-16">
              <button
                onClick={handleBackToHome}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:from-cyan-700 hover:to-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 active:scale-95"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Return to Homepage
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function TermsNavigation() {
  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "terms", title: "Terms of Service" },
    { id: "user-responsibilities", title: "User Responsibilities" },
    { id: "content-usage", title: "Content Usage" },
    { id: "prohibited-activities", title: "Prohibited Activities" },
    { id: "account-suspension", title: "Account Suspension" },
    { id: "intellectual-property", title: "Intellectual Property" },
    { id: "liability-disclaimer", title: "Liability Disclaimer" },
    { id: "changes-to-terms", title: "Changes to Terms" },
    { id: "contact-information", title: "Contact Information" }
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="sticky top-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <svg className="h-5 w-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="font-semibold text-gray-900">Quick Navigation</h3>
      </div>
      <ul className="space-y-2">
        {sections.map((section) => (
          <li key={section.id}>
            <button
              onClick={() => scrollToSection(section.id)}
              className="w-full text-left text-sm text-gray-600 transition-all hover:text-cyan-600 hover:underline"
            >
              {section.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function TermsCondition({ lastUpdated = "September 29, 2025" }) {
  return (
    <section className="w-full">
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 mb-6">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Legal Documentation
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Terms & Conditions
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Please read these terms carefully before using our service
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2">
            <span className="text-sm font-medium text-gray-700">Last updated:</span>
            <span className="text-sm text-gray-600">{lastUpdated}</span>
          </div>
        </header>

        {/* Content */}
        <div className="space-y-12 text-gray-700">
          <section id="introduction" className="scroll-mt-24">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Introduction</h2>
            <p className="leading-relaxed text-gray-600">
              Welcome to our Smart Timetable Generator platform. By accessing or using our services, you agree to be
              bound by these Terms & Conditions. Please read them carefully. If you do not agree with any part of these
              terms, you should discontinue use of the service immediately.
            </p>
          </section>

          <section id="terms" className="scroll-mt-24">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Terms of Service</h2>
            <div className="space-y-4 text-gray-600">
              <p className="leading-relaxed">
                Our Smart Timetable Generator service provides automated scheduling solutions for educational institutions, 
                businesses, and individual users. The service is subject to the following terms:
              </p>
              <ul className="list-disc space-y-3 pl-6 leading-relaxed">
                <li>Service availability may vary and is not guaranteed to be uninterrupted or error-free</li>
                <li>We reserve the right to modify, suspend, or discontinue any aspect of the service at any time</li>
                <li>Users must be at least 13 years old to use the service, or have parental consent if underage</li>
                <li>Premium features may require subscription fees as outlined in our pricing plans</li>
                <li>We may impose usage limits to ensure fair access for all users</li>
              </ul>
            </div>
          </section>

          <section id="user-responsibilities" className="scroll-mt-24">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">User Responsibilities</h2>
            <p className="leading-relaxed text-gray-600">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities
              that occur under your account. You agree to provide accurate information and to comply with applicable
              laws and regulations while using the service.
            </p>
          </section>

          <section id="content-usage" className="scroll-mt-24">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Content Usage</h2>
            <p className="leading-relaxed text-gray-600">
              Content generated through the platform may be used for your internal scheduling and planning purposes. You
              agree not to reproduce, distribute, or publicly display content from the service without prior
              authorization where applicable. Generated timetables are for your organizational use only.
            </p>
          </section>

          <section id="prohibited-activities" className="scroll-mt-24">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Prohibited Activities</h2>
            <ul className="list-disc space-y-3 pl-6 leading-relaxed text-gray-600">
              <li>Attempting to access accounts or data that you do not own or have permission to use</li>
              <li>Reverse engineering, scraping, or overloading the service with automated requests</li>
              <li>Uploading malicious code, or engaging in behavior that disrupts service functionality</li>
              <li>Violating any local, national, or international laws in connection with your use of the service</li>
              <li>Using the service to generate inappropriate or harmful content</li>
              <li>Circumventing any security measures or access controls</li>
            </ul>
          </section>

          <section id="account-suspension" className="scroll-mt-24">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Account Suspension or Termination</h2>
            <p className="leading-relaxed text-gray-600">
              We reserve the right to suspend or terminate accounts that violate these terms or pose a risk to the
              security and integrity of the platform. We may take such actions without prior notice where necessary.
              Users may terminate their accounts at any time through account settings.
            </p>
          </section>

          <section id="intellectual-property" className="scroll-mt-24">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Intellectual Property</h2>
            <p className="leading-relaxed text-gray-600">
              The platform, including its design, software, and trademarks, are owned by us or our licensors and are
              protected by intellectual property laws. Nothing in these terms grants any license or right to use such
              intellectual property without express permission. User-generated content remains the property of the user.
            </p>
          </section>

          <section id="liability-disclaimer" className="scroll-mt-24">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Liability Disclaimer</h2>
            <p className="leading-relaxed text-gray-600">
              The service is provided on an "as is" and "as available" basis. To the fullest extent permitted by law, we
              disclaim all warranties and will not be liable for any indirect, incidental, special, or consequential
              damages arising from your use of the platform. We are not responsible for scheduling conflicts or issues
              resulting from generated timetables.
            </p>
          </section>

          <section id="changes-to-terms" className="scroll-mt-24">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Changes to Terms</h2>
            <p className="leading-relaxed text-gray-600">
              We may update these Terms & Conditions from time to time. Changes become effective upon posting. Your
              continued use of the platform after any changes indicates acceptance of the updated terms. We will
              notify users of significant changes via email or in-app notifications.
            </p>
          </section>

          <section id="contact-information" className="scroll-mt-24">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Contact Information</h2>
            <p className="leading-relaxed text-gray-600">
              If you have questions about these terms, please contact our support team via the Help section or through
              the contact information provided on our website. We typically respond to inquiries within 24-48 hours
              during business days.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}