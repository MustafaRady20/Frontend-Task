import { useEffect, useState, useMemo } from 'react';
import { useReactTable, getCoreRowModel, getFilteredRowModel, flexRender } from '@tanstack/react-table';
import Modal from '../components/Modal';
import Header from '../components/Header';
import StoreBooksPage from '../components/storeBooks';
import { useParams } from 'react-router-dom';
import { API_BASED_URL } from '../config/api';
import Cookies from "js-cookie";
const Inventory = () => {
  const [activeTab, setActiveTab] = useState('books');
  const [showModal, setShowModal] = useState(false);
  const { storeId } = useParams();

  const [allBooks, setAllBooks] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [price, setPrice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // const {search} = useSearchParams()

  const user = Cookies.get("user")

  const view = 'books';
  useEffect(() => {
    if (view === 'authors' || view === 'books') {
      setActiveTab(view);
    }
  }, [view]);

  useEffect(() => {
    if (showModal) {
      fetchBooksAndInventory();
    }
  }, [showModal, storeId]);

  const fetchBooksAndInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const booksRes = await fetch(`${API_BASED_URL}/books`);
      if (!booksRes.ok) throw new Error('Failed to fetch books');
      const allBooksData = await booksRes.json();

      const inventoryRes = await fetch(`${API_BASED_URL}/inventory`);
      if (!inventoryRes.ok) throw new Error('Failed to fetch inventory');
      const inventoryData = await inventoryRes.json();

      const existingBookIds = new Set(
        inventoryData
          .filter(item => item.store_id === parseInt(storeId))
          .map(item => item.book_id)
      );

      const availableBooksData = allBooksData.filter(book => !existingBookIds.has(book.id));

      setAllBooks(allBooksData);
      setAvailableBooks(availableBooksData);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const dropdownColumns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Book Name',
        cell: ({ getValue }) => <div className="font-medium">{getValue()}</div>,
      },
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ getValue }) => <div className="text-sm text-gray-500">ID: {getValue()}</div>,
      },
    ],
    []
  );

  const dropdownTable = useReactTable({
    data: availableBooks,
    columns: dropdownColumns,
    state: {
      globalFilter: searchTerm,
    },
    onGlobalFilterChange: setSearchTerm,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const filteredBooks = dropdownTable.getRowModel().rows;

  const openModal = () => {
    setSelectedBookId('');
    setSelectedBook(null);
    setPrice('');
    setSearchTerm('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBookId('');
    setSelectedBook(null);
    setPrice('');
    setSearchTerm('');
    setError(null);
    setIsDropdownOpen(false);
  };

  const handleAddToInventory = async () => {
    if (!selectedBookId || !price) {
      alert('Please select a book and enter a price');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue < 0) {
      alert('Please enter a valid price');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASED_URL}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          store_id: parseInt(storeId),
          book_id: parseInt(selectedBookId),
          price: priceValue,
        }),
      });

      if (!response.ok) throw new Error('Failed to add book to inventory');

      alert('Book added to inventory successfully!');
      closeModal();
      
      window.dispatchEvent(new Event('inventoryUpdated'));
    } catch (err) {
      console.error('Error adding book to inventory:', err);
      setError(err.message);
      alert('Failed to add book: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSelect = (book) => {
    setSelectedBookId(book.id);
    setSelectedBook(book);
    setSearchTerm(book.name);
    setIsDropdownOpen(false);
  };

  return (
    <div className="py-6">
      <div className="flex mb-4 w-full justify-center items-center">
        <button
          onClick={() => setActiveTab('books')}
          className={`px-4 border-b-2 py-2 ${activeTab === 'books' ? 'border-b-main' : 'border-b-transparent'}`}
        >
          Books
        </button>
        <button
          onClick={() => setActiveTab('authors')}
          className={`px-4 border-b-2 py-2 ${activeTab === 'authors' ? 'border-b-main' : 'border-b-transparent'}`}
        >
          Authors
        </button>
      </div>

      <Header 
        addNew={openModal} 
        title={`Store Inventory`} 
        buttonTitle="Add to inventory" 
      />

      {activeTab === 'books' ? (
        <StoreBooksPage storeId={storeId}/>
      ) : (
        <p className="text-gray-600">No authors with books in this store.</p>
      )}

      <Modal
        title="Add Book to Store Inventory"
        save={handleAddToInventory}
        cancel={closeModal}
        show={showModal}
        setShow={setShowModal}
        saveDisabled={loading || !selectedBookId || !price}
        saveText={loading ? 'Adding...' : 'Add to Inventory'}
      >
        <div className="flex flex-col gap-4 w-full">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="relative">
            <label htmlFor="book_search" className="block text-gray-700 font-medium mb-1">
              Search and Select Book {availableBooks.length > 0 && `(${availableBooks.length} available)`}
            </label>
            
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="Type to search books..."
              className="border border-gray-300 rounded p-2 w-full"
              disabled={loading}
            />

            {isDropdownOpen && filteredBooks.length > 0 && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  <table className="w-full">
                    <tbody>
                      {filteredBooks.slice(0, 10).map((row) => (
                        <tr 
                          key={row.original.id}
                          className={`cursor-pointer hover:bg-gray-50 ${
                            selectedBookId === row.original.id ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleBookSelect(row.original)}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td 
                              key={cell.id} 
                              className="p-2 border-b"
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {filteredBooks.length > 10 && (
                    <div className="p-2 text-sm text-gray-500 border-t">
                      Showing 10 of {filteredBooks.length} books
                    </div>
                  )}
                </div>
              </>
            )}

            {isDropdownOpen && searchTerm && filteredBooks.length === 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 text-gray-500">
                No books found matching "{searchTerm}"
              </div>
            )}
          </div>

          <div>
            <label htmlFor="price" className="block text-gray-700 font-medium mb-1">
              Price
            </label>
            <input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="border border-gray-300 rounded p-2 w-full"
              placeholder="Enter Price (e.g., 29.99)"
              min="0"
              step="0.01"
              disabled={loading}
            />
          </div>

          {selectedBook && (
            <div className="bg-gray-50 p-3 rounded border">
              <h4 className="font-medium mb-2">Selected Book:</h4>
              <p>
                <strong>Name:</strong> {selectedBook.name}
              </p>
              <p>
                <strong>ID:</strong> {selectedBook.id}
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;