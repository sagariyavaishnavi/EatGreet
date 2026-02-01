import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, Activity, Eye, User, Clock, UtensilsCrossed, X, Loader2, QrCode, Download, Printer, FileText } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { toast } from 'react-hot-toast';
import { useSettings } from '../../context/SettingsContext';
import { restaurantAPI, orderAPI } from '../../utils/api';
import logo from '../../assets/logo-m.svg';

const AdminTable = () => {
    const [tables, setTables] = useState(() => {
        const saved = localStorage.getItem('admin_tables');
        let initialTables = saved ? JSON.parse(saved) : [1, 2, 3, 4, 5];
        // Ensure unique and sorted
        initialTables = [...new Set(initialTables.map(Number))].sort((a, b) => a - b);
        return initialTables;
    });

    const { currencySymbol } = useSettings();

    const [restaurantName, setRestaurantName] = useState('');
    const [activeOrders, setActiveOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [selectedTableOrder, setSelectedTableOrder] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [qrModal, setQrModal] = useState({ isOpen: false, url: '', tableNo: null });
    const [restaurant, setRestaurant] = useState(null);

    useEffect(() => {
        localStorage.setItem('admin_tables', JSON.stringify(tables));
        fetchRestaurantDetails();
        fetchActiveOrders();

        const interval = setInterval(fetchActiveOrders, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [tables]);

    // Keep selectedTableOrder updated if activeOrders changes while modal is open
    useEffect(() => {
        if (isPreviewOpen && selectedTableOrder) {
            const updated = activeOrders.find(o => String(o.tableNumber) === String(selectedTableOrder.tableNumber));
            if (updated) {
                setSelectedTableOrder(updated);
            } else {
                // Order might have been completed/cancelled
                setIsPreviewOpen(false);
            }
        }
    }, [activeOrders, isPreviewOpen]);

    const fetchActiveOrders = async () => {
        try {
            const { data } = await orderAPI.getOrders();
            // Filter for active orders only
            const active = (data || []).filter(o => ['pending', 'preparing', 'ready'].includes(o.status));
            setActiveOrders(active);
        } catch (error) {
            console.error("Failed to fetch active orders", error);
        } finally {
            setLoadingOrders(false);
        }
    };

    const fetchRestaurantDetails = async () => {
        try {
            const { data } = await restaurantAPI.getDetails();
            // Use restaurant business name and fallback to owner name, sanitize for URL if needed
            // Currently assuming restaurantName is stored in user object properly
            setRestaurant(data);
            setRestaurantName(data.name || 'restaurant');
        } catch (error) {
            console.error("Failed to fetch restaurant details", error);
        }
    };

    const addTable = () => {
        const numericTables = tables.map(Number);
        const nextTableNo = numericTables.length > 0 ? Math.max(...numericTables) + 1 : 1;

        // Ensure unique and sorted
        const newTables = [...new Set([...numericTables, nextTableNo])].sort((a, b) => a - b);
        setTables(newTables);
        toast.success(`Table ${nextTableNo} added`);
    };

    const removeTable = (table) => {
        setTables(tables.filter(t => t !== table));
        toast.success(`Table ${table} removed`);
    };

    const getTableUrl = (tableNo) => {
        // Sanitize restaurant name for URL safe string if it has spaces? 
        // For now assume user knows or simple replace. 
        // Ideally backend enforces slug. Let's do simple encoding or replacement.
        const slug = restaurantName.toLowerCase().trim().replace(/\s+/g, '-');
        return `${window.location.origin}/${slug}/table/${tableNo}`;
    };

    const handlePrint = (order) => {
        try {
            const printWindow = window.open('', '_blank');
            if (!printWindow) return;

            const subtotal = order.items?.reduce((acc, it) => acc + (it.price * (it.quantity || 1)), 0) || 0;
            const cgst = subtotal * 0.025;
            const sgst = subtotal * 0.025;
            const grandTotal = subtotal + cgst + sgst;

            const itemsRows = (order.items || []).map(it => `
                <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 5px;">
                    <div style="flex: 1;">${it.name}</div>
                    <div style="width: 30px; text-align: center;">${it.quantity || 1}</div>
                    <div style="width: 60px; text-align: right;">${currencySymbol}${(it.price || 0).toFixed(2)}</div>
                    <div style="width: 70px; text-align: right;">${currencySymbol}${(it.price * (it.quantity || 1)).toFixed(2)}</div>
                </div>
            `).join('');

            const html = `
                <!doctype html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Invoice</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
                        body { 
                            font-family: 'Courier Prime', monospace; 
                            color: #000; 
                            width: 300px; 
                            margin: 0 auto; 
                            padding: 20px;
                        }
                        .header { text-align: center; margin-bottom: 20px; }
                        .restaurant-name { font-size: 18px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; }
                        .restaurant-info { font-size: 12px; margin-bottom: 2px; }
                        .divider { border-top: 1px dashed #000; margin: 10px 0; }
                        .info-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 3px; }
                        .table-header { display: flex; justify-content: space-between; font-weight: bold; font-size: 13px; margin-bottom: 5px; }
                        .footer { text-align: center; margin-top: 20px; font-size: 14px; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="restaurant-name">${restaurant?.name || 'EatGreet Restaurant'}</div>
                        <div class="restaurant-info">${restaurant?.restaurantDetails?.address || 'Restaurant Address'}</div>
                        ${restaurant?.restaurantDetails?.contactNumber ? `<div class="restaurant-info">Tel: ${restaurant.restaurantDetails.contactNumber}</div>` : ''}
                        <div class="restaurant-info">GST - 24AAYFT4562G1ZO</div>
                    </div>

                    <div class="divider"></div>
                    <div class="info-row"><span>Name:</span> <span>${order.customerInfo?.name || 'Guest'}</span></div>
                    <div class="divider"></div>
                    
                    <div class="info-row">
                        <span>Date: ${new Date(order.createdAt).toLocaleDateString()}</span>
                        <span>Dine In: ${order.tableNumber || 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <span>Time: ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div class="info-row">
                        <span>Cashier: Admin</span>
                        <span>Bill No: ${order._id.slice(-4)}</span>
                    </div>

                    <div class="divider"></div>
                    <div class="table-header">
                        <div style="flex: 1;">No.Item</div>
                        <div style="width: 30px; text-align: center;">Qty</div>
                        <div style="width: 60px; text-align: right;">Price</div>
                        <div style="width: 70px; text-align: right;">Amt</div>
                    </div>
                    <div class="divider"></div>
                    
                    ${itemsRows}
                    
                    <div class="divider"></div>
                    <div class="info-row" style="font-weight: bold;">
                        <span>Total Qty: ${order.items?.reduce((acc, it) => acc + (it.quantity || 1), 0)}</span>
                        <span>Sub Total: ${currencySymbol}${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="info-row">
                        <span>CGST@2.5%</span>
                        <span>${currencySymbol}${cgst.toFixed(2)}</span>
                    </div>
                    <div class="info-row">
                        <span>SGST@2.5%</span>
                        <span>${currencySymbol}${sgst.toFixed(2)}</span>
                    </div>
                    <div class="divider"></div>
                    <div class="info-row" style="font-size: 16px; font-weight: bold;">
                        <span>Grand Total</span>
                        <span>${currencySymbol}${grandTotal.toFixed(2)}</span>
                    </div>
                    <div class="divider"></div>
                    
                    <div class="footer">Thank You Visit Again</div>
                </body>
                <script>
                    window.onload = () => { window.print(); window.close(); }
                </script>
                </html>
            `;
            printWindow.document.write(html);
            printWindow.document.close();
        } catch (e) {
            console.error('Print failed', e);
            toast.error('Print failed');
        }
    };

    const handleCompleteOrder = async (order) => {
        const loadToast = toast.loading('Completing order...');
        try {
            await orderAPI.updateStatus(order._id, 'completed');
            toast.success('Order completed!', { id: loadToast });
            setIsPreviewOpen(false);
            fetchActiveOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to complete order', { id: loadToast });
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Table Management</h1>

                <button
                    onClick={addTable}
                    className="bg-[#FD6941] text-white px-6 py-2.5 rounded-full font-bold shadow-sm hover:bg-orange-600 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Table
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                {tables.map(table => {
                    const url = getTableUrl(table);
                    const tableOrder = activeOrders.find(o => String(o.tableNumber) === String(table));
                    const isLive = !!tableOrder;

                    return (
                        <div key={table} className={`bg-white rounded-[2rem] p-5 aspect-square shadow-sm border ${isLive ? 'border-[#FD6941]' : 'border-gray-100'} flex flex-col justify-between group hover:border-[#FD6941]/30 transition-all relative overflow-hidden`}>
                            {isLive && (
                                <div className="absolute top-0 right-0">
                                    <div className="bg-[#FD6941] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm flex items-center gap-1">
                                        <Activity className="w-3 h-3 animate-pulse" /> LIVE
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-start">
                                <div className={`w-12 h-12 ${isLive ? 'bg-orange-100' : 'bg-orange-50'} rounded-2xl flex items-center justify-center text-[#FD6941] font-bold text-xl`}>
                                    {table}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {isLive && (
                                        <button
                                            onClick={() => {
                                                setSelectedTableOrder(tableOrder);
                                                setIsPreviewOpen(true);
                                            }}
                                            className="p-2 bg-orange-50 text-[#FD6941] rounded-xl transition-colors"
                                            title="View Live Order"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setQrModal({ isOpen: true, url, tableNo: table })}
                                        className="p-2 bg-blue-50 text-blue-500 rounded-xl transition-colors"
                                        title="Generate QR Code"
                                    >
                                        <QrCode className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-[#FD6941] animate-pulse' : 'bg-gray-200'}`}></div>
                                <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isLive ? 'text-[#FD6941]' : 'text-gray-300'}`}>
                                    {isLive ? 'Occupied' : 'Available'}
                                </p>
                            </div>

                            <div className="flex justify-between items-center mt-auto">
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Table</div>
                                <button
                                    onClick={() => removeTable(table)}
                                    className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-xl transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Live Order Preview Modal */}
            {isPreviewOpen && selectedTableOrder && createPortal(
                <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Table {selectedTableOrder.tableNumber} - Live Order</h2>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Started {new Date(selectedTableOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsPreviewOpen(false)}
                                className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#FD6941] shadow-sm">
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs text-orange-600 font-bold uppercase tracking-wider">Customer</p>
                                    <p className="text-lg font-bold text-gray-900">{selectedTableOrder.customerInfo?.name || 'Guest'}</p>
                                </div>
                                <div className="ml-auto">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${selectedTableOrder.status === 'pending' ? 'bg-red-100 text-red-600' :
                                        selectedTableOrder.status === 'preparing' ? 'bg-yellow-100 text-yellow-600' :
                                            'bg-green-100 text-green-600'
                                        }`}>
                                        {selectedTableOrder.status}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest px-1">Order Items</p>
                                {selectedTableOrder.items?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-gray-400 border border-gray-100 text-xs">
                                                {item.quantity}x
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{item.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className={`text-[10px] font-bold uppercase ${item.status === 'ready' ? 'text-green-500' :
                                                        item.status === 'preparing' ? 'text-yellow-500' :
                                                            item.status === 'served' ? 'text-blue-500' :
                                                                item.status === 'completed' ? 'text-gray-400' :
                                                                    'text-red-400'
                                                        }`}>
                                                        {item.status || 'pending'}
                                                    </p>
                                                    {item.status === 'ready' && (
                                                        <button
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                try {
                                                                    await orderAPI.updateItemStatus(selectedTableOrder._id, idx, 'served');
                                                                    fetchActiveOrders();
                                                                    // Update the selected order in local state too
                                                                    const updatedItems = [...selectedTableOrder.items];
                                                                    updatedItems[idx].status = 'served';
                                                                    setSelectedTableOrder({ ...selectedTableOrder, items: updatedItems });
                                                                    toast.success(`${item.name} served!`);
                                                                } catch (err) {
                                                                    toast.error("Failed to serve item");
                                                                }
                                                            }}
                                                            className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-md font-bold hover:bg-green-600 transition-colors"
                                                        >
                                                            Mark Served
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-gray-900 rounded-2xl p-5 text-white flex justify-between items-center shadow-lg mb-4">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 opacity-60">Bill Amount</p>
                                    <p className="text-2xl font-bold">{currencySymbol}{selectedTableOrder.totalAmount?.toFixed(2) || (selectedTableOrder.items?.reduce((acc, it) => acc + (it.price * (it.quantity || 1)), 0) * 1.05).toFixed(2)}</p>
                                </div>
                                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                                    <UtensilsCrossed className="w-5 h-5 text-white opacity-40" />
                                </div>
                            </div>

                            <button
                                disabled={!selectedTableOrder.items?.some(it => ['ready', 'served'].includes(it.status)) && selectedTableOrder.status !== 'ready'}
                                onClick={() => handleCompleteOrder(selectedTableOrder)}
                                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg active:scale-[0.98] ${(selectedTableOrder.items?.some(it => ['ready', 'served'].includes(it.status)) || selectedTableOrder.status === 'ready')
                                    ? 'bg-[#FD6941] text-white hover:bg-orange-600 hover:shadow-orange-200'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                    }`}
                            >
                                <div className={`p-1.5 rounded-lg ${(selectedTableOrder.items?.some(it => ['ready', 'served'].includes(it.status)) || selectedTableOrder.status === 'ready') ? 'bg-white/20' : 'bg-gray-300'}`}>
                                    <UtensilsCrossed className={`w-5 h-5 ${(selectedTableOrder.items?.some(it => ['ready', 'served'].includes(it.status)) || selectedTableOrder.status === 'ready') ? 'text-white' : 'text-gray-400'}`} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold">
                                        {selectedTableOrder.items?.some(it => ['pending', 'preparing'].includes(it.status)) ? 'Complete Ready Items' : 'Complete Order'}
                                    </p>
                                    <p className="text-[10px] uppercase tracking-wider">
                                        {selectedTableOrder.items?.some(it => ['pending', 'preparing'].includes(it.status))
                                            ? 'Settles ready items & keeps pending live'
                                            : 'Settles table & frees up space'}
                                    </p>
                                </div>
                            </button>

                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* QR Code Modal */}
            {qrModal.isOpen && createPortal(
                <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-800">Table {qrModal.tableNo} QR Code</h2>
                            <button
                                onClick={() => setQrModal({ ...qrModal, isOpen: false })}
                                className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-8 flex flex-col items-center">
                            <div className="bg-white p-4 rounded-2xl shadow-inner border border-gray-100 mb-6" id="qr-container">
                                <QRCodeCanvas
                                    id={`qr-canvas-${qrModal.tableNo}`}
                                    value={qrModal.url}
                                    size={250}
                                    level="H"
                                    includeMargin={true}
                                    imageSettings={{
                                        src: logo,
                                        x: undefined,
                                        y: undefined,
                                        height: 50,
                                        width: 50,
                                        excavate: true,
                                    }}
                                />
                            </div>
                            <button
                                onClick={() => {
                                    const canvas = document.getElementById(`qr-canvas-${qrModal.tableNo}`);
                                    const url = canvas.toDataURL("image/png");
                                    const link = document.createElement("a");
                                    link.href = url;
                                    link.download = `Table_${qrModal.tableNo}_QR.png`;
                                    link.click();
                                    toast.success('QR Code downloaded');
                                }}
                                className="w-full bg-[#FD6941] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-200 active:scale-[0.98]"
                            >
                                <Download className="w-5 h-5" /> Download QR Code
                            </button>
                            <p className="mt-4 text-[10px] text-gray-400 text-center uppercase font-bold tracking-widest">
                                Scan this to open Table {qrModal.tableNo} menu
                            </p>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {tables.length === 0 && (
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 min-h-[300px] flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl">🪑</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">No Tables Added</h3>
                    <p className="text-gray-400 text-sm max-w-sm">
                        Add tables to generate unique menu links for your customers.
                    </p>
                </div>
            )}
        </div>
    );
};

export default AdminTable;
