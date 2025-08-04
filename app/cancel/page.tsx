export default function CancelPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-10">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Payment Canceled ❌</h1>
            <p className="text-lg text-gray-700">
                Something went wrong or you canceled the payment. You can try again at any time.
            </p>
        </div>
    );
}
