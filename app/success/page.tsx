export default function SuccessPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-10">
            <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Successful! 🎉</h1>
            <p className="text-lg text-gray-700">
                Your credits have been added. You can now start using the app.
            </p>
        </div>
    );
}
