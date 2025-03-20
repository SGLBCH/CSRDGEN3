import Navigation from './components/Navigation'
import Link from 'next/link'
import { ChartBarIcon, DocumentTextIcon, ShieldCheckIcon, ArrowRightIcon, UserIcon, CreditCardIcon, ClipboardDocumentCheckIcon, EyeIcon, SparklesIcon, ShareIcon } from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Comprehensive Reporting',
    description: 'Generate detailed sustainability reports that comply with CSRD requirements.',
    icon: DocumentTextIcon,
  },
  {
    name: 'Data Analytics',
    description: 'Analyze and visualize your sustainability metrics with powerful tools.',
    icon: ChartBarIcon,
  },
  {
    name: 'Compliance Assurance',
    description: 'Stay compliant with EU sustainability reporting directives.',
    icon: ShieldCheckIcon,
  },
]

const steps = [
  {
    id: 1,
    title: 'Determine CSRD Necessity',
    description: 'Decide if you need the CSRD for your SME company.',
    icon: ClipboardDocumentCheckIcon,
  },
  {
    id: 2,
    title: 'Simple Login',
    description: 'Login with your email to access the platform.',
    icon: UserIcon,
  },
  {
    id: 3,
    title: 'One-Time Payment',
    description: 'Secure payment of €199 (one-time payment, lifetime access).',
    icon: CreditCardIcon,
  },
  {
    id: 4,
    title: 'Complete Questionnaire',
    description: 'Fill out the 100 optional questions at your own pace.',
    icon: DocumentTextIcon,
  },
  {
    id: 5,
    title: 'Review Your Answers',
    description: 'Review and preview your answers before generating the report.',
    icon: EyeIcon,
  },
  {
    id: 6,
    title: 'AI-Powered Generation',
    description: 'Generate your report securely with advanced AI technology.',
    icon: SparklesIcon,
  },
  {
    id: 7,
    title: 'Share With Stakeholders',
    description: 'Share with your suppliers, customers, and other stakeholders.',
    icon: ShareIcon,
  },
];

const footerNavigation = [
  { name: 'Home', href: '/' },
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Reports', href: '/reports' },
  { name: 'Guidelines', href: '/guidelines' },
  { name: 'About CSRD', href: '/about' },
  { name: 'Contact', href: '/contact' },
  { name: 'Pricing', href: '/pricing' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero section */}
      <div className="relative isolate px-6 pt-10 lg:px-8 overflow-hidden max-h-[500px] h-[500px] mb-0">
        {/* Decorative background elements */}
        <div className="absolute inset-x-0 -top-20 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-40" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-200 to-secondary-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 -z-10 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 100 100\'%3E%3Cg fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath opacity=\'.5\' d=\'M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        
        {/* Floating shapes */}
        <div className="absolute top-10 right-10 w-56 h-56 bg-tertiary-100 rounded-full mix-blend-multiply opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute top-20 right-32 w-56 h-56 bg-primary-100 rounded-full mix-blend-multiply opacity-10 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-0 left-20 w-56 h-56 bg-secondary-100 rounded-full mix-blend-multiply opacity-10 animate-blob"></div>
        
        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-16 -z-10">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full">
            <path fill="rgba(0, 41, 107, 0.03)" fillOpacity="1" d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,197.3C672,224,768,224,864,197.3C960,171,1056,117,1152,96C1248,75,1344,85,1392,90.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full">
            <path fill="rgba(0, 80, 157, 0.02)" fillOpacity="1" d="M0,192L48,176C96,160,192,128,288,133.3C384,139,480,181,576,186.7C672,192,768,160,864,160C960,160,1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        
        {/* Content */}
        <div className="mx-auto max-w-6xl py-12 lg:flex lg:items-center lg:gap-x-10 h-full">
          <div className="lg:w-1/2 flex items-center justify-center">
            <div className="relative px-6 py-8 sm:px-8 sm:py-12 bg-white/30 backdrop-blur-sm rounded-3xl shadow-sm">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                CSRD Reporting Made Simple
              </h1>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                Streamline your Corporate Sustainability Reporting Directive (CSRD) compliance with our comprehensive reporting platform.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
                <a
                  href="/reports"
                  className="rounded-md bg-primary-800 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-800"
                >
                  Create Reports
                </a>
                <a
                  href="/about" 
                  className="text-sm font-semibold leading-6 text-primary-800"
                >
                  Learn more <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:block lg:w-1/2 relative">
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl">
              <div className="w-full h-64 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-full opacity-20 blur-3xl transform -translate-y-8"></div>
            </div>
            <div className="relative grid grid-cols-2 gap-6">
              <div className="col-span-1 h-32 rounded-xl bg-tertiary-50 p-4 flex items-center justify-center">
                <DocumentTextIcon className="h-12 w-12 text-tertiary-600" />
              </div>
              <div className="col-span-1 h-48 rounded-xl bg-primary-50 p-4 flex items-center justify-center">
                <ShieldCheckIcon className="h-12 w-12 text-primary-600" />
              </div>
              <div className="col-span-2 h-32 rounded-xl bg-secondary-50 p-4 flex items-center justify-center">
                <ChartBarIcon className="h-12 w-12 text-secondary-600" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Lower gradient */}
        <div className="absolute inset-x-0 top-[calc(100%-5rem)] -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-tertiary-300 to-primary-400 opacity-10 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="relative -mt-1">
        <div className="bg-secondary-500 relative py-16 sm:py-24 -mt-1 border-t-0" style={{ marginTop: '-1px' }}>
          {/* Decorative wave-like top edge that blends with the hero */}
          <div className="absolute top-0 inset-x-0 -mt-5 h-10 bg-secondary-500" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 10%, 75% 50%, 50% 0%, 25% 50%, 0 10%)' }}></div>
          
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center mb-16">
              <h2 className="text-base font-semibold leading-7 text-tertiary-300">Simple Process</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                How It Works
              </p>
              <p className="mt-6 text-lg leading-8 text-white/80">
                Follow these simple steps to create your CSRD-compliant report and ensure your business meets sustainability reporting requirements.
              </p>
            </div>
            
            <div className="mx-auto mt-12 max-w-5xl">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {steps.map((step) => (
                  <div 
                    key={step.id} 
                    className="relative rounded-xl bg-white/10 p-6 backdrop-blur-sm transition hover:bg-white/20 overflow-hidden"
                  >
                    {/* Step number */}
                    <div className="absolute -right-4 -top-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary-700 text-3xl font-bold text-white shadow-lg">
                      {step.id}
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white text-secondary-800">
                          <step.icon className="h-6 w-6" aria-hidden="true" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                        <p className="mt-2 text-base text-white/80">{step.description}</p>
                      </div>
                    </div>
                    
                    {/* Decorative connector line */}
                    {step.id < steps.length && (
                      <div className="absolute bottom-0 right-10 h-8 w-0.5 translate-y-full bg-white/30 lg:hidden"></div>
                    )}
                    {step.id % 2 === 1 && step.id < steps.length - 1 && (
                      <div className="absolute hidden lg:block bottom-1/2 right-0 w-8 h-0.5 translate-x-full bg-white/30"></div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-12 text-center">
                <a
                  href="/pricing"
                  className="inline-flex items-center rounded-md bg-tertiary-500 px-5 py-3 text-base font-semibold text-black shadow-md hover:bg-tertiary-400 transition duration-300"
                >
                  Get Started Today
                  <ArrowRightIcon className="ml-2 h-5 w-5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-800">Faster Reporting</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for CSRD compliance
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Our platform simplifies the complex process of sustainability reporting, helping you meet regulatory requirements efficiently.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
              {features.map((feature) => (
                <div key={feature.name} className="relative pl-16">
                  <dt className="text-base font-semibold leading-7 text-gray-900">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-800">
                      <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-gray-600">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
          
          <div className="mt-16 flex justify-center">
            <a
              href="/reports"
              className="rounded-md bg-tertiary-500 px-4 py-2.5 text-sm font-semibold text-black shadow-sm hover:bg-tertiary-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary-500"
            >
              Start Creating Reports Now
            </a>
          </div>
        </div>
      </div>
      
      {/* Footer Section */}
      <footer className="bg-primary-800 text-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Company Info */}
            <div>
              <h3 className="text-xl font-semibold mb-4">CSRD Reports</h3>
              <p className="text-white/80 max-w-xs">
                Based in Almelo, the Netherlands
              </p>
              <p className="text-white/80 mt-2">
                Managed by Scott Golbach
              </p>
              <p className="text-white/80 mt-4">
                <Link href="/contact" className="text-tertiary-300 hover:text-tertiary-200">
                  Contact us for more information
                </Link>
              </p>
            </div>
            
            {/* Navigation */}
            <div className="lg:col-span-2">
              <h3 className="text-xl font-semibold mb-4">Site Links</h3>
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {footerNavigation.map((item) => (
                  <li key={item.name}>
                    <Link 
                      href={item.href}
                      className="text-white/80 hover:text-white transition"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-12 border-t border-white/20 pt-8 text-center">
            <p className="text-sm text-white/60">
              &copy; {new Date().getFullYear()} CSRD Reports. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
} 