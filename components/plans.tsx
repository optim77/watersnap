'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface Plan {
    id: number;
    name: string;
    describe: string;
    price: number;
}

export const  Plans = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchPlans = async () => {
            const supabase = createClient();
            const { data, error } = await supabase.from('plans').select('*').order('price');

            if (error) {
                console.error(error);
                toast.error('Failed to load plans');
            } else {
                console.error(data);
                setPlans(data);
            }
            setLoading(false);
        };

        fetchPlans();
    }, []);

    const handleSelectPlan = async (plan: Plan) => {
        try {
            const res = await fetch('/api/create-checkout-session', {
                method: 'POST',
                body: JSON.stringify({ planId: plan.id }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                toast.error("Could not redirect to payment.");
            }
        } catch (err) {
            toast.error("Payment failed");
            console.error(err);
        }
    };

    if (loading) {
        return <p className="text-center py-8">Loading plans...</p>;
    }

    return (
        <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
                <Card key={plan.id} className="flex flex-col justify-between shadow-md">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                        <p className="text-gray-500 mt-1">{plan.describe}</p>
                    </CardHeader>
                    <CardContent className="mt-auto">
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-lg font-semibold text-blue-600">${plan.price}</p>
                            <Button onClick={() => handleSelectPlan(plan)}>Select plan </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
