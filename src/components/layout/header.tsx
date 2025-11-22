import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Home, Library, Menu } from 'lucide-react';

export function Header() {
  const navLinks = [
    { href: '/', label: 'Home', icon: <Home className="h-5 w-5" /> },
    {
      href: '/library',
      label: 'Biblioteca',
      icon: <Library className="h-5 w-5" />,
    },
  ];

  const desktopNav = (
    <nav className="hidden items-center gap-1 md:flex">
      {navLinks.map((link) => (
        <Button
          variant={'ghost'}
          className={`hover:bg-primary/80`}
          key={link.label}
          asChild
        >
          <Link href={link.href} className="flex items-center gap-2">
            {link.icon}
            <span>{link.label}</span>
          </Link>
        </Button>
      ))}
    </nav>
  );

  const mobileNav = (
    <nav className="flex flex-col gap-4 pt-10">
      <Link href="/" className="mb-4 flex items-center justify-center gap-2">
        <span className="font-headline text-2xl font-bold text-primary">
          Kippu Tales
        </span>
      </Link>
      {navLinks.map((link) => (
        <Button
          variant="ghost"
          key={link.label}
          asChild
          className="w-full justify-start text-lg"
        >
          <Link href={link.href} className="flex items-center gap-4">
            {link.icon}
            <span>{link.label}</span>
          </Link>
        </Button>
      ))}
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-headline text-2xl font-bold text-primary">
            Kippu Tales
          </span>
        </Link>

        {desktopNav}

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">{mobileNav}</SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
