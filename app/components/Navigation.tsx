'use client'

import { Fragment } from 'react'
import { Disclosure } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, DocumentTextIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useUser } from '@auth0/nextjs-auth0/client'
import { usePathname } from 'next/navigation'

// Define a type for the nested user structure
interface UserData {
  email?: string;
  name?: string;
  sub?: string;
  email_verified?: boolean;
  [key: string]: any; // Allow other properties
}

// Navigation item interface
interface NavigationItem {
  name: string;
  href: string;
  current: boolean;
  showOnlyWhenLoggedOut?: boolean;
}

const navigation: NavigationItem[] = [
  { name: 'Home', href: '/', current: true },
  { name: 'Dashboard', href: '/dashboard', current: false },
  { name: 'Reports', href: '/reports', current: false },
  { name: 'Guidelines', href: '/guidelines', current: false },
  { name: 'About CSRD', href: '/about', current: false },
  { name: 'Contact', href: '/contact', current: false },
  { name: 'Pricing', href: '/pricing', current: false, showOnlyWhenLoggedOut: true },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Navigation() {
  const { user, error, isLoading } = useUser()
  const pathname = usePathname()
  
  // Handle the nested user structure
  const userData = (user?.user || user) as UserData;
  const email = userData?.email;
  
  // Filter navigation items based on auth status
  const filteredNavigation = navigation.filter(item => 
    !(item.showOnlyWhenLoggedOut && user)
  );
  
  // Update the navigation items with current state based on path
  const navigationItems: NavigationItem[] = filteredNavigation.map(item => ({
    ...item,
    current: pathname === item.href || pathname?.startsWith(`${item.href}/`)
  }));

  return (
    <Disclosure as="nav" className="bg-primary-800">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Link href="/" className="text-white text-xl font-bold">
                    CSRD Reports
                  </Link>
                </div>
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          item.current
                            ? 'bg-primary-900 text-white'
                            : 'text-white hover:bg-primary-700',
                          (item.name === 'Reports' || item.name === 'Dashboard') && user 
                            ? 'flex items-center rounded-md px-3 py-2 text-sm font-medium bg-primary-700'
                            : 'rounded-md px-3 py-2 text-sm font-medium'
                        )}
                        aria-current={item.current ? 'page' : undefined}
                      >
                        {item.name === 'Reports' && user && (
                          <DocumentTextIcon className="mr-1 h-4 w-4" />
                        )}
                        {item.name === 'Dashboard' && user && (
                          <ChartBarIcon className="mr-1 h-4 w-4" />
                        )}
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6">
                  {user ? (
                    <div className="flex items-center space-x-4">
                      <span className="text-white">{email}</span>
                      <a
                        href="/api/auth/logout"
                        className="rounded-md bg-primary-900 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
                      >
                        Logout
                      </a>
                    </div>
                  ) : (
                    <a
                      href="/api/auth/login?returnTo=/dashboard"
                      className="rounded-md bg-tertiary-500 px-3.5 py-2.5 text-sm font-medium text-black hover:bg-tertiary-400"
                    >
                      Login
                    </a>
                  )}
                </div>
              </div>
              <div className="md:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-primary-700 focus:outline-none">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigationItems.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    item.current
                      ? 'bg-primary-900 text-white'
                      : 'text-white hover:bg-primary-700',
                    item.name === 'Reports' && user
                      ? 'flex items-center rounded-md px-3 py-2 text-base font-medium'
                      : 'block rounded-md px-3 py-2 text-base font-medium'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name === 'Reports' && user && (
                    <DocumentTextIcon className="mr-1 h-5 w-5" />
                  )}
                  {item.name}
                </Disclosure.Button>
              ))}
              {user ? (
                <div className="border-t border-primary-900 pt-4 mt-4">
                  <div className="px-2 text-white mb-2">{email}</div>
                  <a
                    href="/api/auth/logout"
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-primary-900 hover:bg-primary-700"
                  >
                    Logout
                  </a>
                </div>
              ) : (
                <a
                  href="/api/auth/login?returnTo=/dashboard"
                  className="mt-4 block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-tertiary-500 text-black hover:bg-tertiary-400"
                >
                  Login
                </a>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
} 