'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/superbase';
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { v4 as uuidv4 } from 'uuid';
import { PostgrestError } from "@supabase/supabase-js";
import { StorageError } from "@supabase/storage-js";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getUserCredit } from "@/components/utils/get-user-credit";
import { decreaseCredit } from "@/components/utils/decrease-credit";

export default function UploadSection({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
    const [mediumFile, setMediumFile] = useState<File | null>(null);
    const [watermarkFile, setWatermarkFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [credits, setCredits] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchCredits = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (!data.user) return;

            const { data: creditData } = await getUserCredit(data.user);
            setCredits(creditData?.credits ?? 0);
            if (creditData?.credits !== undefined && creditData.credits < 10) {
                toast.error("You need more credits to process");
            }
            if (error){
                console.error(error.message);
                toast.error("Something went wrong");
            }
        };

        fetchCredits();
    }, []);

    const handleUploadFile = async () => {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return toast.error('You must be logged in');
        if (!mediumFile || !watermarkFile) return toast.error('Select both files!');

        setUploading(true);
        const userId = user.id;
        const uuid = uuidv4();

        const mediumExt = mediumFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        const watermarkExt = watermarkFile.name.split('.').pop()?.toLowerCase() || 'png';

        const filePath = `public/${userId}/mediums/${uuid}.${mediumExt}`;
        const watermarkPath = `public/${userId}/watermarks/${uuid}.${watermarkExt}`;

        const { error: uploadFileError } = await supabase.storage.from('watersnap').upload(filePath, mediumFile);
        const { error: uploadWatermarkError } = await supabase.storage.from('watersnap').upload(watermarkPath, watermarkFile);

        if (uploadFileError) return throwAlert(uploadFileError);
        if (uploadWatermarkError) return throwAlert(uploadWatermarkError);

        const { error: insertFileError } = await supabase.from('media').insert({
            format: mediumFile.type,
            user: userId,
            media: uuid,
            created_at: new Date().toISOString()
        });

        const { error: insertWatermarkError } = await supabase.from('watermarks').insert({
            format: watermarkFile.type,
            user: userId,
            media: uuid,
            created_at: new Date().toISOString()
        });


        if (insertFileError) return throwAlert(insertFileError);
        if (insertWatermarkError) return throwAlert(insertWatermarkError);

        setUploading(false);
        await decreaseCredit(user);
        router.push(`/editor?medium=${uuid}&watermark=${uuid}`);
    };

    const throwAlert = (err: PostgrestError | StorageError | null) => {
        console.error(err);
        toast.error('Upload failed!');
    };

    return (
        <div className={cn("flex flex-col items-center min-h-screen p-10 bg-blend-darken", className)} {...props}>
            <Card className="w-full max-w-4xl p-6 shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-blue-600">Upload Your Photo and Watermark</CardTitle>
                </CardHeader>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="dropzone-watermark" className="text-sm font-medium text-white">
                            Watermark file
                        </label>
                        <label
                            htmlFor="dropzone-watermark"
                            className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg bg-white hover:bg-gray-100 cursor-pointer"
                        >
                            <p className="text-gray-500">
                                {watermarkFile ? watermarkFile.name : "Click or drag watermark here"}
                            </p>
                            <input
                                id="dropzone-watermark"
                                type="file"
                                accept="image/png"
                                className="hidden"
                                onChange={(e) => setWatermarkFile(e.target.files?.[0] || null)}
                            />
                        </label>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="dropzone-photo" className="text-sm font-medium text-white">
                            Photo file
                        </label>
                        <label
                            htmlFor="dropzone-photo"
                            className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg bg-white hover:bg-gray-100 cursor-pointer"
                        >
                            <p className="text-gray-500">
                                {mediumFile ? mediumFile.name : "Click or drag photo here"}
                            </p>
                            <input
                                id="dropzone-photo"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => setMediumFile(e.target.files?.[0] || null)}
                            />
                        </label>
                    </div>
                </div>

                <button
                    onClick={handleUploadFile}
                    disabled={uploading || (credits !== null && credits < 10)}
                    className={cn(
                        "mt-8 w-full text-white py-3 rounded-lg text-lg font-medium transition",
                        credits !== null && credits < 10
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                    )}
                >
                    {credits !== null && credits < 10
                        ? "Not enough credits for action"
                        : uploading
                            ? "Uploading..."
                            : "Start Editing"}
                </button>
            </Card>
        </div>
    );
}
