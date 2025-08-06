import GlobalAuthLayout from "@/components/global-auth-layout";

export default function EditorLayout({
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
