'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Camera, Upload, Receipt, PieChart, Settings, X, CheckCircle } from 'lucide-react';
import UsageBadge from '@/components/UsageBadge';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';

interface ReceiptItem {
  id: string;
  merchantName: string | null;
  totalAmount: number | null;
  currency: string | null;
  purchaseDate: string;
  items: Array<{
    name: string;
    quantity: number | null;
    price: number | null;
  }>;
  createdAt: string;
}

export default function Home() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedReceipt, setParsedReceipt] = useState<any>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [receiptHistory, setReceiptHistory] = useState<ReceiptItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const itemsPerPage = 5;

  // Fetch receipt history
  const fetchReceiptHistory = async (page: number) => {
    if (!session) return;
    
    setLoadingHistory(true);
    try {
      const response = await api.get(`/api/receipts?page=${page}&limit=${itemsPerPage}`, session.accessToken);
      
      if (response.ok) {
        const data = await response.json();
        setReceiptHistory(prev => [...prev, ...data.receipts]);
      }
    } catch (error) {
      console.error('Error fetching receipt history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Load more receipts when scrolling
  const loadMoreReceipts = () => {
    if (!loadingHistory) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchReceiptHistory(nextPage);
    }
  };

  // Initial load of receipt history
  useState(() => {
    fetchReceiptHistory(currentPage);
  });

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScanReceipt = async () => {
    if (!session) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    if (!imagePreview) {
      alert('Please select an image first');
      return;
    }

    setIsProcessing(true);
    setParsedReceipt(null);

    try {
      const formData = new FormData();
      // Convert data URL to blob
      const response = await fetch(imagePreview);
      const blob = await response.blob();
      formData.append('image', blob, 'receipt.jpg');

      // Using fetch directly for multipart form data
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/receipts/scan`, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type header as it will be set automatically with boundary
          'Authorization': `Bearer ${session.accessToken}`,
        },
      });

      if (res.status === 402) {
        setShowPaywall(true);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to scan receipt');
      }

      const data = await res.json();
      setParsedReceipt(data.receipt);
    } catch (error: any) {
      console.error('Error scanning receipt:', error);
      alert(error.message || 'An error occurred while scanning the receipt');
    } finally {
      setIsProcessing(false);
    }
  };

  const closeModal = () => {
    setShowPaywall(false);
    setImagePreview(null);
    setParsedReceipt(null);
  };

  return (
    <div className="min-h-screen bg-primaryPastel">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-800">ReceiptSnap</h1>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center space-x-1 ${activeTab === 'dashboard' ? 'text-purple-700 font-medium' : 'text-gray-600'}`}
                >
                  <PieChart size={18} />
                  <span>Dashboard</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('receipts')}
                  className={`flex items-center space-x-1 ${activeTab === 'receipts' ? 'text-purple-700 font-medium' : 'text-gray-600'}`}
                >
                  <Receipt size={18} />
                  <span>Receipts</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center space-x-1 ${activeTab === 'settings' ? 'text-purple-700 font-medium' : 'text-gray-600'}`}
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-purple-800">Total Expenses</h2>
                <p className="text-3xl font-bold text-gray-800">$1,240.00</p>
                <p className="text-green-500 mt-2">↓ 12% from last month</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-purple-800">Total Income</h2>
                <p className="text-3xl font-bold text-gray-800">$4,890.00</p>
                <p className="text-green-500 mt-2">↑ 8% from last month</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-purple-800">Net Profit</h2>
                <p className="text-3xl font-bold text-gray-800">$3,650.00</p>
                <p className="text-green-500 mt-2">↑ 5% from last month</p>
              </div>
            </div>
            
            {/* Usage Badge Column */}
            <div>
              <UsageBadge />
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-md">
              <h2 className="text-2xl font-semibold mb-6 text-center text-purple-800">Upload Receipt</h2>
              
              {!imagePreview && !isProcessing && !parsedReceipt && (
                <div 
                  className="border-2 border-dashed border-purple-300 rounded-2xl p-12 text-center cursor-pointer hover:bg-primaryPastel transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="mx-auto h-12 w-12 text-purple-500" />
                  <p className="mt-4 text-lg text-gray-600">Click to upload receipt image</p>
                  <p className="mt-2 text-gray-500">Supports JPG, PNG, WEBP (max 8MB)</p>
                  <button className="mt-6 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
                    Select Image
                  </button>
                </div>
              )}
              
              {imagePreview && !isProcessing && !parsedReceipt && (
                <div className="text-center">
                  <div className="relative inline-block">
                    <img 
                      src={imagePreview} 
                      alt="Receipt preview" 
                      className="max-h-64 rounded-2xl mx-auto"
                    />
                    <button 
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      onClick={() => setImagePreview(null)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  <div className="mt-4">
                    <button 
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                      onClick={handleScanReceipt}
                    >
                      Scan Receipt
                    </button>
                  </div>
                </div>
              )}
              
              {isProcessing && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                  <p className="text-lg text-gray-600">Processing your receipt...</p>
                  <p className="text-sm text-gray-500">This may take a few seconds</p>
                </div>
              )}
              
              {parsedReceipt && (
                <div className="bg-white rounded-2xl shadow-md p-6 border border-green-200">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-green-700">Receipt Parsed Successfully!</h3>
                    <CheckCircle className="text-green-500" size={24} />
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Merchant:</span>
                      <span className="font-medium">{parsedReceipt.merchantName || 'N/A'}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-medium">{parsedReceipt.currency} {parsedReceipt.totalAmount?.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{parsedReceipt.purchaseDate ? new Date(parsedReceipt.purchaseDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-700 mb-2">Items:</h4>
                      <ul className="space-y-1">
                        {parsedReceipt.items && parsedReceipt.items.length > 0 ? (
                          parsedReceipt.items.map((item: any, index: number) => (
                            <li key={index} className="flex justify-between text-sm">
                              <span>{item.name}</span>
                              <span>{item.quantity} × {item.price?.toFixed(2) || 'N/A'}</span>
                            </li>
                          ))
                        ) : (
                          <li>No items listed</li>
                        )}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button 
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      onClick={() => {
                        setImagePreview(null);
                        setParsedReceipt(null);
                      }}
                    >
                      Scan Another
                    </button>
                  </div>
                </div>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
              />
            </div>
          </div>
        )}

        {activeTab === 'receipts' && (
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-2xl font-semibold mb-6 text-purple-800">Receipt History</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-accentPeach">
                  <tr>
                    <th className="py-3 px-4 text-left rounded-l-lg">Date</th>
                    <th className="py-3 px-4 text-left">Merchant</th>
                    <th className="py-3 px-4 text-left">Amount</th>
                    <th className="py-3 px-4 text-left rounded-r-lg">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {receiptHistory.map((receipt, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-accentMint">
                      <td className="py-3 px-4">{new Date(receipt.purchaseDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{receipt.merchantName || 'Unknown'}</td>
                      <td className="py-3 px-4 text-red-500">{receipt.currency} {receipt.totalAmount?.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Processed</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {receiptHistory.length === 0 && !loadingHistory && (
              <div className="text-center py-8 text-gray-500">
                No receipts found. Scan your first receipt!
              </div>
            )}
            
            {loadingHistory && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            )}
            
            <div className="mt-6 text-center">
              <button 
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                onClick={loadMoreReceipts}
                disabled={loadingHistory}
              >
                {loadingHistory ? 'Loading...' : 'Load More'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-md">
            <h2 className="text-2xl font-semibold mb-6 text-purple-800">Account Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  defaultValue="user@example.com"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Display Name</label>
                <input 
                  type="text" 
                  defaultValue="John Doe"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Currency</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg">
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                  <option>INR (₹)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Theme</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg">
                  <option>Light</option>
                  <option>Dark</option>
                  <option>Pastel</option>
                </select>
              </div>
              
              <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-red-600">Free Plan Limit Reached</h3>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={closeModal}
              >
                <X size={24} />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              You've reached your monthly limit of 25 receipt scans. Upgrade to continue scanning receipts.
            </p>
            
            <div className="space-y-4">
              <button 
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-colors"
                onClick={() => {
                  window.location.href = '/pricing';
                }}
              >
                Upgrade to Premium
              </button>
              
              <button 
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}