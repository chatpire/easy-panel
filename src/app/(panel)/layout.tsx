interface PanelLayoutProps {
  children?: React.ReactNode;
}

export default async function PanelLayout({ children }: PanelLayoutProps) {
  return <div className="flex min-h-screen flex-col space-y-6">{children}</div>;
}
