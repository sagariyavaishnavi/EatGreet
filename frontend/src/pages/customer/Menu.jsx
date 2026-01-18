export default function Menu() {
    const items = [
        { id: 1, name: "Classic Burger", price: "$12", category: "Burgers" },
        { id: 2, name: "Margherita Pizza", price: "$15", category: "Pizza" },
        { id: 3, name: "Caesar Salad", price: "$10", category: "Salads" },
        { id: 3, name: "Fries", price: "$5", category: "Sides" },
    ];

    return (
        <div className="min-h-screen bg-white">
            <header className="bg-white shadow sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">EatGreet Menu</h1>
                    <div className="text-sm bg-gray-100 px-3 py-1 rounded-full">Table #4</div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <h2 className="text-xl font-semibold mb-6">Popular Items</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-gray-800">
                    {items.map(item => (
                        <div key={item.id} className="border rounded-lg p-4 hover:shadow-lg transition">
                            <div className="h-40 bg-gray-200 rounded-md mb-4 flex items-center justify-center text-gray-400">Image</div>
                            <h3 className="font-bold text-lg">{item.name}</h3>
                            <p className="text-gray-500 text-sm mb-2">{item.category}</p>
                            <div className="flex justify-between items-center mt-4">
                                <span className="font-bold text-lg">{item.price}</span>
                                <button className="bg-black text-white px-4 py-2 rounded-full text-sm">Add</button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
