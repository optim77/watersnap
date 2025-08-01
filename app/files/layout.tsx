import GlobalAuthLayout from "@/components/global-auth-layout";

export default function FilesLayout({
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
