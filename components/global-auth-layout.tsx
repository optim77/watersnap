import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import { MarkButton } from "@/components/mark-button";
import { MediaButton } from "@/components/media-button";

export default function GlobalAuthLayout({
                                          children,
                                      }: {
    children: React.ReactNode;
}) {
    return (
        <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 w-full flex flex-col gap-20 items-center">
                <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                    <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                        <div className="flex gap-5 items-center font-semibold">
                            <div className="flex items-center gap-2">
                                {/*<DeployButton/>*/}
                                <MarkButton />
                                <MediaButton />
                            </div>
                        </div>
                        {!hasEnvVars ? <EnvVarWarning/> : <AuthButton/>}
                    </div>
                </nav>
                <div className="flex-1 flex flex-col gap-20 max-w-7xl px-5 md:px-12">
                    {children}
                </div>

                <footer
                    className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
                    <p>
                        Powered by WaterSnap
                    </p>
                    <ThemeSwitcher/>
                </footer>
            </div>
        </main>
    );
}
