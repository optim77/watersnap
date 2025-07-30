'use client';

import { useState } from 'react';
import { supabase } from '@/lib/superbase';
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { v4 as uuidv4 } from 'uuid';
import { PostgrestError } from "@supabase/supabase-js";
import { StorageError } from "@supabase/storage-js";
import { useRouter } from "next/navigation";

export default function UploadSection({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
    const [mediumFile, setMediumFile] = useState<File | null>(null);
    const [watermarkFile, setWatermarkFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    const handleUploadFile = async () => {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return alert('You must be logged in');
        if (!mediumFile || !watermarkFile) return alert('Select both files!');

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
        router.push(`/editor?medium=${uuid}&watermark=${uuid}`);
    };

    const throwAlert = (err: PostgrestError | StorageError | null) => {
        console.error(err);
        alert('Upload failed!');
    };

    return (
        <div className={cn("flex flex-col items-center min-h-screen p-10 bg-blend-darken", className)} {...props}>
            <Card className="w-full max-w-4xl p-6 shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-blue-600">Upload Your Photo and Watermark</CardTitle>
                </CardHeader>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                    {/* Watermark Input */}
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

                    {/* Photo Input */}
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
                    disabled={uploading}
                    className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition"
                >
                    {uploading ? 'Uploading...' : 'Start Editing'}
                </button>
            </Card>
        </div>
    );
}
