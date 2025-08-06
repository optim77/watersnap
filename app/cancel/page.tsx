export default function CancelPage() {
    return (
        <div className="flex flex-col items-center justify-center mt-10 text-center">
            <h1 className="text-3xl font-bold text-red-600 mt-10">Payment Canceled ❌</h1>
            <p className="text-lg text-white mt-10">
                Something went wrong or you canceled the payment. You can try again at any time.
            </p>
        </div>
    );
}
