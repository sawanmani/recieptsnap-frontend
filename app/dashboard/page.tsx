'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Camera, Upload, Receipt, PieChart, Settings, X, CheckCircle, LogOut, Lock } from 'lucide-react';
import UsageBadge from '@/components/UsageBadge';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/sessionUtils';
import { signOut } from 'next-auth/react';

interface ReceiptItem {
  id: string;
  merchantName: string | null;
  totalAmount: number | null;
  currency: string | null;
  purchaseDate: string;
  transactionType?: 'DEBIT' | 'CREDIT' | null;
  items: Array<{
    name: string;
    quantity: number | null;
    price: number | null;
  }>;
  createdAt: string;
}

interface ReceiptData {
  id: string;
  merchantName: string | null;
  totalAmount: number | null;
  currency: string | null;
  purchaseDate: string;
  transactionType?: 'DEBIT' | 'CREDIT' | null;
  items: Array<{
    name: string;
    quantity: number | null;
    price: number | null;
  }> | null;
  createdAt: string;
}

interface ReceiptSummary {
  totalExpenses: number;
  totalIncome: number;
  thisMonthExpenses: number;
  thisMonthIncome: number;
  receiptCount: number;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedReceipt, setParsedReceipt] = useState<ReceiptItem | null>(null);
  const [batchScanCount, setBatchScanCount] = useState<number | null>(null); // Track batch scan count
  const [showPaywall, setShowPaywall] = useState(false);
  const [receiptHistory, setReceiptHistory] = useState<ReceiptData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [summary, setSummary] = useState<ReceiptSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [preferredCurrency, setPreferredCurrency] = useState<string>('INR'); // User's preferred currency
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingReceipt, setEditingReceipt] = useState<ReceiptData | null>(null);
  const [editForm, setEditForm] = useState<Partial<ReceiptData>>({
    merchantName: '',
    totalAmount: 0,
    currency: '',
    purchaseDate: '',
    transactionType: 'DEBIT'
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [scanMode, setScanMode] = useState<'image' | 'sms'>('image');
  const [smsText, setSmsText] = useState('');
  const [usageRefreshKey, setUsageRefreshKey] = useState(0);
  const [userPlan, setUserPlan] = useState<string | null>(null);

  const itemsPerPage = 5;

  // Handle unauthenticated redirect
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch receipt summary
  useEffect(() => {
    const fetchSummary = async () => {
      if (!session?.accessToken) return;
      
      try {
        const response = await api.get('/api/receipts/summary', session.accessToken);
        if (response.ok) {
          const data = await response.json();
          setSummary(data);
        }
      } catch (error) {
        console.error('Error fetching receipt summary:', error);
      } finally {
        setSummaryLoading(false);
      }
    };

    if (session) {
      fetchSummary();
    }
  }, [session]);

  // Initial load of receipt history
  useEffect(() => {
    const fetchReceiptHistory = async (page: number) => {
      const accessToken = getAccessToken(session);
      if (!accessToken) return;
      
      setLoadingHistory(true);
      try {
        const response = await api.get(`/api/receipts?page=${page}&limit=${itemsPerPage}`, accessToken);
        
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

    fetchReceiptHistory(currentPage);
  }, []);

  // Fetch user plan alongside other initial data loads
  useEffect(() => {
    if (session?.accessToken) {
      api.get('/api/usage', session.accessToken).then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setUserPlan(data.plan);
        }
      });
    }
  }, [session]);

  // Fetch user's preferred currency
  useEffect(() => {
    const fetchUserCurrency = async () => {
      if (!session?.accessToken) return;
      
      try {
        const response = await api.get('/api/users/', session.accessToken);
        if (response.ok) {
          const userData = await response.json();
          setPreferredCurrency(userData.preferredCurrency || 'INR');
        }
      } catch (error) {
        console.error('Error fetching user currency:', error);
      }
    };

    if (session) {
      fetchUserCurrency();
    }
  }, [session]);

  // Loading state for auth check
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primaryPastel">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  // Redirect unauthenticated users
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primaryPastel">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const fetchReceiptHistory = async (page: number) => {
    const accessToken = getAccessToken(session);
    if (!accessToken) return;
    
    setLoadingHistory(true);
    try {
      const response = await api.get(`/api/receipts?page=${page}&limit=${itemsPerPage}`, accessToken);
      
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxFiles = userPlan === 'FREE' ? 1 : 5;
    setSelectedFiles(files.slice(0, maxFiles));
  };

  const handleScanReceipt = async () => {
    if (!session) {
      window.location.href = '/login';
      return;
    }

    if (selectedFiles.length === 0) {
      alert('Please select at least one image first');
      return;
    }

    const accessToken = getAccessToken(session);
    if (!accessToken) {
      alert('Authentication token not available. Please sign in again.');
      window.location.href = '/login';
      return;
    }

    setIsProcessing(true);
    setParsedReceipt(null);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append('images', file));

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/receipts/scan`, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type header as it will be set automatically with boundary
          'Authorization': `Bearer ${accessToken}`,
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
      const successfulReceipts = data.results.filter((r: any) => r.success).map((r: any) => r.receipt);
      const failedFiles = data.results.filter((r: any) => !r.success);

      if (successfulReceipts.length > 0) {
        if (successfulReceipts.length > 1) {
          // Batch scan: show first receipt and summary
          setParsedReceipt(successfulReceipts[0]);
          setBatchScanCount(successfulReceipts.length); // Set batch count for display
        } else {
          // Single receipt: show the receipt
          setParsedReceipt(successfulReceipts[0]);
          setBatchScanCount(null); // Reset batch count
        }
      } else {
        setBatchScanCount(null); // Reset batch count if no successful scans
      }

      if (failedFiles.length > 0) {
        alert(
          `${successfulReceipts.length} of ${data.results.length} scanned successfully.\n\nFailed: ${failedFiles
            .map((f: any) => `${f.filename} — ${f.error}`)
            .join('\n')}`
        );
      }

      setSelectedFiles([]);
      setReceiptHistory([]);
      setCurrentPage(1);
      fetchReceiptHistory(1);
      const summaryRes = await api.get('/api/receipts/summary', session.accessToken);
      if (summaryRes.ok) setSummary(await summaryRes.json());

      setUsageRefreshKey((prev) => prev + 1); // Trigger usage badge refresh
    } catch (error: any) {
      console.error('Error scanning receipt:', error);
      alert(error.message || 'An error occurred while scanning the receipt');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleParseSms = async () => {
    if (!session) {
      window.location.href = '/login';
      return;
    }
    const accessToken = getAccessToken(session);
    if (!accessToken) {
      alert('Authentication token not available. Please sign in again.');
      window.location.href = '/login';
      return;
    }

    setIsProcessing(true);
    setParsedReceipt(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/receipts/parse-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ smsText }),
      });

      if (res.status === 402) {
        setShowPaywall(true);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to parse SMS');
      }

      const data = await res.json();
      setParsedReceipt(data.receipt);
      setSmsText('');

      setReceiptHistory([]);
      setCurrentPage(1);
      fetchReceiptHistory(1);
      const summaryRes = await api.get('/api/receipts/summary', session.accessToken);
      if (summaryRes.ok) setSummary(await summaryRes.json());

      setUsageRefreshKey((prev) => prev + 1); // Trigger usage badge refresh
    } catch (error: any) {
      console.error('Error parsing SMS:', error);
      alert(error.message || 'An error occurred while parsing the SMS');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingReceipt || !session?.accessToken) return;
    setSavingEdit(true);
    try {
      const res = await api.put(`/api/receipts/${editingReceipt.id}`, {
        merchantName: editForm.merchantName || '',
        totalAmount: editForm.totalAmount || 0,
        currency: editForm.currency || 'INR',
        purchaseDate: editForm.purchaseDate ? new Date(editForm.purchaseDate).toISOString() : new Date().toISOString(),
        transactionType: editForm.transactionType || 'DEBIT'
      }, session.accessToken);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update receipt');
      }

      setEditingReceipt(null);
      setReceiptHistory([]);
      setCurrentPage(1);
      fetchReceiptHistory(1);
      const summaryRes = await api.get('/api/receipts/summary', session.accessToken);
      if (summaryRes.ok) setSummary(await summaryRes.json());

      setUsageRefreshKey((prev) => prev + 1); // Trigger usage badge refresh
    } catch (error: any) {
      alert(error.message || 'Failed to save changes');
    } finally {
      setSavingEdit(false);
    }
  };

  const closeModal = () => {
    setShowPaywall(false);
    setParsedReceipt(null);
  };

  const openEditModal = (receipt: ReceiptData) => {
    setEditingReceipt(receipt);
    setEditForm({
      merchantName: receipt.merchantName || '',
      totalAmount: receipt.totalAmount || 0,
      currency: receipt.currency || '',
      purchaseDate: receipt.purchaseDate || '',
      transactionType: receipt.transactionType || 'DEBIT',
    });
  };

  // Format currency based on user's preferred currency
  const formatCurrency = (amount: number | null, currencyCode: string = preferredCurrency) => {
    if (amount === null) return 'N/A';
    
    // Map currency codes to appropriate locales
    const currencyMap: Record<string, { locale: string; currency: string }> = {
      'INR': { locale: 'en-IN', currency: 'INR' },
      'USD': { locale: 'en-US', currency: 'USD' },
      'EUR': { locale: 'de-DE', currency: 'EUR' },
      'GBP': { locale: 'en-GB', currency: 'GBP' }
    };
    
    const { locale, currency } = currencyMap[currencyCode] || currencyMap['INR'];
    
    return new Intl.NumberFormat(locale, { 
      style: 'currency', 
      currency: currency
    }).format(amount);
  };

  const handleExportCsv = async () => {
    if (!session?.accessToken) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/receipts/export`,
        { headers: { 'Authorization': `Bearer ${session.accessToken}` } }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to export');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receiptsnap-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(error.message || 'Failed to export receipts');
    }
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
              <li>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
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
              {/* Total Expenses Card */}
              {summaryLoading ? (
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h2 className="text-xl font-semibold mb-4 text-purple-800">Total Expenses</h2>
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h2 className="text-xl font-semibold mb-4 text-purple-800">Total Expenses</h2>
                  <p className="text-3xl font-bold text-red-600">{formatCurrency(summary?.totalExpenses || 0)}</p>
                </div>
              )}

              {/* Total Income Card */}
              {summaryLoading ? (
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h2 className="text-xl font-semibold mb-4 text-purple-800">Total Income</h2>
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h2 className="text-xl font-semibold mb-4 text-purple-800">Total Income</h2>
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(summary?.totalIncome || 0)}</p>
                </div>
              )}

              {/* Combined Card for This Month Expenses and Income */}
              {summaryLoading ? (
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h2 className="text-xl font-semibold mb-4 text-purple-800">This Month</h2>
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h2 className="text-xl font-semibold mb-4 text-purple-800">This Month</h2>
                  <p className="text-lg text-red-600">Expenses: {formatCurrency(summary?.thisMonthExpenses || 0)}</p>
                  <p className="text-lg text-green-600">Income: {formatCurrency(summary?.thisMonthIncome || 0)}</p>
                </div>
              )}
            </div>
            
            {/* Usage Badge Column */}
            <div>
              <UsageBadge refreshKey={usageRefreshKey} />
              {userPlan === 'FREE' && (
                <button
                  onClick={() => router.push('/pricing')}
                  className="mt-4 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Go Premium
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-md">
              <h2 className="text-2xl font-semibold mb-6 text-center text-purple-800">Upload Receipt</h2>
              
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => setScanMode('image')}
                  className={`px-3 py-1 rounded text-sm ${scanMode === 'image' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  Upload Image
                </button>
                <button
                  onClick={() => setScanMode('sms')}
                  className={`px-3 py-1 rounded text-sm ${scanMode === 'sms' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  Paste SMS
                </button>
              </div>
              
              {scanMode === 'image' && (
                <>
                  {!isProcessing && !parsedReceipt && (
                    <div className="space-y-4">
                      {/* File selection */}
                      <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center">
                        <Upload className="mx-auto h-12 w-12 text-purple-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          {userPlan && userPlan !== 'FREE' 
                            ? 'Select up to 5 receipt images to scan' 
                            : 'Select one receipt image to scan'}
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          multiple={userPlan !== 'FREE'}
                          onChange={handleFileChange}
                          ref={fileInputRef}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-3 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Choose Files
                        </button>
                      </div>

                      {/* Selected files preview */}
                      {selectedFiles.length > 0 && (
                        <div className="text-sm text-gray-600 mt-2">
                          {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected:{' '}
                          {selectedFiles.map((f) => f.name).join(', ')}
                        </div>
                      )}

                      <button
                        onClick={handleScanReceipt}
                        disabled={isProcessing || selectedFiles.length === 0}
                        className="w-full bg-purple-600 text-white py-2 rounded-lg disabled:opacity-50"
                      >
                        {isProcessing ? 'Scanning...' : `Scan ${selectedFiles.length > 1 ? 'Batch' : 'Receipt'}`}
                      </button>
                    </div>
                  )}

                  {isProcessing && (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                      <p className="text-lg text-gray-600">Processing your receipt{selectedFiles.length > 1 ? 's' : ''}...</p>
                      <p className="text-sm text-gray-500">This may take a few seconds</p>
                    </div>
                  )}

                  {parsedReceipt && (
                    <div className="bg-white rounded-2xl shadow-md p-6 border border-green-200">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-semibold text-green-700">Receipt Parsed Successfully!</h3>
                        <CheckCircle className="text-green-500" size={24} />
                      </div>
                      
                      {batchScanCount && batchScanCount > 1 && (
                        <div className="mt-2 text-lg text-blue-600 font-medium">
                          {batchScanCount} receipts scanned successfully
                        </div>
                      )}
                      
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
                            setSelectedFiles([]);
                            setParsedReceipt(null);
                            setBatchScanCount(null); // Reset batch count
                            setSmsText('');
                          }}
                        >
                          Scan Another
                        </button>
                      </div>
                    </div>
                  )}
                </>

              )}
              
              {scanMode === 'sms' && (
                <div>
                  <textarea
                    value={smsText}
                    onChange={(e) => setSmsText(e.target.value)}
                    placeholder="Paste your bank/UPI debit or credit SMS here..."
                    className="w-full p-3 border border-gray-300 rounded-lg h-32"
                  />
                  <button
                    onClick={handleParseSms}
                    disabled={isProcessing || !smsText.trim()}
                    className="mt-3 w-full bg-purple-600 text-white py-2 rounded-lg disabled:opacity-50"
                  >
                    {isProcessing ? 'Parsing...' : 'Parse SMS'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'receipts' && (
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-purple-800">Receipt History</h2>
              <button
                onClick={() => {
                  if (userPlan === 'FREE') {
                    setShowPaywall(true);
                  } else {
                    handleExportCsv();
                  }
                }}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 flex items-center"
              >
                {userPlan === 'FREE' && <Lock size={16} className="mr-1" />}
                Export CSV
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-accentPeach">
                  <tr>
                    <th className="py-3 px-4 text-left rounded-l-lg">Date</th>
                    <th className="py-3 px-4 text-left">Merchant</th>
                    <th className="py-3 px-4 text-left">Amount</th>
                    <th className="py-3 px-4 text-left">Actions</th>
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
                        <button
                          onClick={() => {
                            setEditingReceipt(receipt);
                            setEditForm({
                              merchantName: receipt.merchantName || '',
                              totalAmount: receipt.totalAmount || 0,  // Fixed: keeping it as number
                              currency: receipt.currency || 'INR',
                              purchaseDate: receipt.purchaseDate ? new Date(receipt.purchaseDate).toISOString().split('T')[0] : '',
                              transactionType: receipt.transactionType || 'DEBIT',
                            });
                          }}
                          className="text-purple-600 hover:text-purple-800 text-sm"
                        >
                          Edit
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            receipt.transactionType === 'CREDIT'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {receipt.transactionType === 'CREDIT' ? 'Credited' : 'Debited'}
                        </span>
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
                  defaultValue={session?.user?.email ?? ''}
                  disabled
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Display Name</label>
                <input 
                  type="text" 
                  defaultValue={session?.user?.name ?? ''}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Currency</label>
                <select 
                  value={preferredCurrency} 
                  onChange={(e) => setPreferredCurrency(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Receipts are stored in their original currency; this only changes how totals are displayed
                </p>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Theme</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg">
                  <option>Light</option>
                  <option>Dark</option>
                  <option>Pastel</option>
                </select>
              </div>
              
              <button 
                onClick={async () => {
                  if (!session?.accessToken) return;
                  
                  try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/api/users/`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.accessToken}`
                      },
                      body: JSON.stringify({
                        preferredCurrency: preferredCurrency
                      })
                    });
                    
                    if (response.ok) {
                      alert('Settings saved successfully!');
                    } else {
                      const errorData = await response.json();
                      alert(`Error: ${errorData.error || 'Failed to save settings'}`);
                    }
                  } catch (error) {
                    console.error('Error saving settings:', error);
                    alert('An error occurred while saving settings');
                  }
                }}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Edit Receipt Modal */}
      {editingReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Receipt</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Merchant Name</label>
                <input
                  type="text"
                  value={editForm.merchantName || ''}
                  onChange={(e) => setEditForm({ ...editForm, merchantName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Amount</label>
                <input
                  type="number"
                  value={editForm.totalAmount || 0}
                  onChange={(e) => setEditForm({ 
                    ...editForm, 
                    totalAmount: parseFloat(e.target.value) || 0 
                  })}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Currency</label>
                <input
                  type="text"
                  value={editForm.currency || ''}
                  onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Date</label>
                <input
                  type="date"
                  value={editForm.purchaseDate || ''}
                  onChange={(e) => setEditForm({ ...editForm, purchaseDate: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Type</label>
                <select
                  value={editForm.transactionType || 'DEBIT'}
                  onChange={(e) => setEditForm({ 
                    ...editForm, 
                    transactionType: e.target.value as 'DEBIT' | 'CREDIT' 
                  })}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="DEBIT">Debited</option>
                  <option value="CREDIT">Credited</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button onClick={() => setEditingReceipt(null)} className="px-4 py-2 text-gray-600">Cancel</button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50"
              >
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

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