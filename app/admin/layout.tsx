import { readNav } from '@/lib/content/nav';
import { readHeader } from '@/lib/content/header';
import { readFooter } from '@/lib/content/footer';
import { SiteHeader } from '@/components/site-header';
import { Footer } from '@/components/footer';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [nav, header, footer] = await Promise.all([
    readNav(),
    readHeader(),
    readFooter(),
  ]);

  return (
    <>
      <SiteHeader nav={nav as any} header={header as any} />
      <div className="flex min-h-[calc(100vh-65px)] flex-col">
        <div className="grow">{children}</div>
        <Footer footer={footer as any} />
      </div>
    </>
  );
}
