import GlobalAuthLayout from "@/components/global-auth-layout";

export default function PreviewLayout({
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
