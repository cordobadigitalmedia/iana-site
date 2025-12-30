'use client';

import Link from 'next/link';
import { FileText, GraduationCap, Briefcase, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ApplicationLink {
  title: string;
  href: string;
  icon: React.ReactNode;
}

export function PreliminaryApplicationCards() {
  const preliminaryApplications: ApplicationLink[] = [
    {
      title: 'Preliminary Application for a small, short-term, Personal/Emergency loan',
      href: '/apply/preliminary/personal',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: 'Preliminary Application for an Educational loan via Iana',
      href: '/apply/preliminary/education',
      icon: <GraduationCap className="h-5 w-5" />,
    },
    {
      title: 'Preliminary Application for a Business or Institutional loan via Iana Independence or Iana Community',
      href: '/apply/preliminary/business',
      icon: <Briefcase className="h-5 w-5" />,
    },
  ];

  return (
    <Card className="border-2 my-6">
      <CardContent className="p-6">
        <div className="grid gap-3">
          {preliminaryApplications.map((app) => (
            <Button
              key={app.href}
              asChild
              variant="outline"
              className="justify-start h-auto py-4 px-4 bg-gray-50 hover:bg-gray-100 border-gray-300 text-left"
            >
              <Link href={app.href} className="flex items-center gap-3 w-full">
                <span className="text-gray-600 flex-shrink-0">{app.icon}</span>
                <span className="flex-1 text-left">{app.title}</span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function FinalApplicationCard() {
  const finalApplication: ApplicationLink = {
    title: 'Final Interest-Free Loan Application',
    href: '/apply/final',
    icon: <CheckCircle className="h-5 w-5" />,
  };

  return (
    <Card className="border-2 my-6">
      <CardContent className="p-6">
        <Button
          asChild
          variant="outline"
          className="w-full justify-start h-auto py-4 px-4 bg-gray-50 hover:bg-gray-100 border-gray-300 text-left"
        >
          <Link href={finalApplication.href} className="flex items-center gap-3 w-full">
            <span className="text-gray-600 flex-shrink-0">{finalApplication.icon}</span>
            <span className="flex-1 text-left">{finalApplication.title}</span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

