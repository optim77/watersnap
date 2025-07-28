'use client';
import { useState } from 'react';
import { supabase } from '@/lib/superbase';
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { v4 as uuidv4 } from 'uuid';
import { PostgrestError } from "@supabase/supabase-js";
import { StorageError } from "@supabase/storage-js";
import { useRouter } from "next/navigation";

export default function UploadSection({
                                          className,
                                          ...props
                                      }: React.ComponentPropsWithoutRef<"div">) {
    const [mediumFile, setMediumFile] = useState<File | null>(null);
    const [watermarkFile, setWatermarkFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();


    const handleUploadFile = async () => {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) {
            alert('You must be logged in');
            return;
        }
        if (!mediumFile || !watermarkFile) return alert('Select both files!');

        setUploading(true);
        const userId = user.id;
        const uuid = uuidv4();

        const fileExtension = mediumFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        const watermarkExtension = watermarkFile.name.split('.').pop()?.toLowerCase() || 'jpg';

        const fileMimeType = mediumFile.type || `image/${fileExtension}`;
        const watermarkMimeType = watermarkFile.type || `image/${watermarkExtension}`;

        const filePath =  `public/${userId}/mediums/${uuid}.${fileExtension}`;
        const watermarkPath = `public/${userId}/watermarks/${uuid}.${watermarkExtension}`;

        const { error: uploadFileError } = await supabase
            .storage
            .from('watersnap')
            .upload(filePath, mediumFile);

        const { error: uploadWatermarkError } = await supabase
            .storage
            .from('watersnap')
            .upload(watermarkPath, watermarkFile);

        if (uploadFileError){
            throwAlert(uploadFileError)
        }
        if (uploadWatermarkError){
            throwAlert(uploadWatermarkError)
        }

        const { error: insertFileError } =  await supabase
            .from('media')
            .insert({
                format: fileMimeType,
                user: userId,
                media: uuid,
                created_at: new Date().toISOString()
            });
        const { error: insertWatermarkError } = await supabase
                .from('watermarks')
                .insert({
                    format: watermarkMimeType,
                    user: userId,
                    media: uuid,
                    created_at: new Date().toISOString()
                });

        if (insertFileError) {throwAlert(insertFileError);}
        if (insertWatermarkError) {throwAlert(insertFileError);}

        setUploading(false);
        alert('Upload + DB insert success!');
        router.push(`/editor?medium=${uuid}&watermark=${uuid}`);
    }

    const throwAlert = (err:  PostgrestError | StorageError | null) => {
        console.error(err);
        alert('Insert failed');
        return;
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>

            <Card className="p-4">
                <CardHeader>
                    <CardTitle className="text-2xl">Upload watermark and photo</CardTitle>
                </CardHeader>

                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-watermark"
                           className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span
                                className="font-semibold">Click to upload a watermark</span> or drag and drop</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, SVG</p>
                        </div>
                        <input id="dropzone-watermark" type="file" className="hidden"  accept="image/png"
                               onChange={(e) => setWatermarkFile(e.target.files?.[0] || null)}/>
                    </label>
                </div>

                <br/>

                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-photo"
                           className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span
                                className="font-semibold">Click to upload a photo</span> or drag and drop</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG</p>
                        </div>
                        <input id="dropzone-photo" type="file" className="hidden" accept="image/*"
                               onChange={(e) => setMediumFile(e.target.files?.[0] || null)}/>
                    </label>
                </div>

                <button
                    className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    onClick={handleUploadFile}
                    disabled={uploading}
                >
                    {uploading ? 'Processing...' : 'Send'}
                </button>
            </Card>
        </div>
    );
}
