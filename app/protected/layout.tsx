import GlobalAuthLayout from "@/components/global-auth-layout";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
  <GlobalAuthLayout>
          {children}
  </GlobalAuthLayout>
  );
}
