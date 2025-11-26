import { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaSortUp,
  FaSortDown,
  FaSort,
} from "react-icons/fa";
import Cookies from "js-cookie";
import { API_BASED_URL } from "../config/api";

export default function StoreBooksPage({ storeId }) {
  const [store, setStore] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [allAuthors, setAllAuthors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [searchText, setSearchText] = useState("");
  const [sorting, setSorting] = useState([]);

  const user = Cookies.get("user");
  const mergedData = useMemo(() => {
    if (!inventory.length || !allBooks.length || !allAuthors.length) return [];

    return inventory.map((item) => {
      const book = allBooks.find((b) => b.id == item.book_id) || {};
      const author = allAuthors.find((a) => a.id == book.author_id) || {};
      const authorName =
        author.first_name && author.last_name
          ? `${author.first_name} ${author.last_name}`
          : "Unknown";

      return {
        id: item.id,
        bookId: book.id || "N/A",
        name: book.name || "Unknown",
        page_count: book.page_count || 0,
        author: authorName,
        price: item.price || 0,
      };
    });
  }, [inventory, allBooks, allAuthors]);

  useEffect(() => {
    if (!storeId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const storesRes = await fetch(`${API_BASED_URL}/stores`);
        if (!storesRes.ok) throw new Error("Failed to fetch stores");
        const storesData = await storesRes.json();
        const foundStore = storesData.find((s) => s.id === storeId);

        if (!foundStore) throw new Error("Store not found");
        setStore(foundStore);

        const inventoryRes = await fetch(`${API_BASED_URL}/inventory`);
        if (!inventoryRes.ok) throw new Error("Failed to fetch inventory");
        const inventoryData = await inventoryRes.json();
        console.log("inventory", inventoryData);

        const storeInventory = inventoryData.filter(
          (item) => item.store_id == storeId
        );
        console.log("teste tes t", storeInventory);
        setInventory(storeInventory);

        const booksRes = await fetch(`${API_BASED_URL}/books`);
        if (!booksRes.ok) throw new Error("Failed to fetch books");
        const booksData = await booksRes.json();
        setAllBooks(booksData);

        const authorsRes = await fetch(`${API_BASED_URL}/authors`);
        if (!authorsRes.ok) throw new Error("Failed to fetch authors");
        const authorsData = await authorsRes.json();
        setAllAuthors(authorsData);

        console.log("Store, inventory, books, and authors loaded successfully");
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [storeId]);

  const handleEdit = (record) => {
    setEditingId(record.id);
    setEditPrice(record.price.toString());
  };

  const handleSave = async (id) => {
    const price = parseFloat(editPrice);
    if (isNaN(price) || price < 0) {
      alert("Please enter a valid price");
      return;
    }

    try {
      const res = await fetch(`${API_BASED_URL}/inventory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price }),
      });
      if (!res.ok) throw new Error("Failed to update price");

      setInventory((prev) =>
        prev.map((i) => (i.id === id ? { ...i, price } : i))
      );
      setEditingId(null);
      setEditPrice("");
      alert("Price updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update price: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this book?")) return;

    try {
      const res = await fetch(`${API_BASED_URL}/inventory/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete book");

      setInventory((prev) => prev.filter((i) => i.id !== id));
      alert("Book removed from store");
    } catch (err) {
      console.error(err);
      alert("Failed to remove book: " + err.message);
    }
  };

  const columns = useMemo(
    () => [
      { accessorKey: "bookId", header: "Book ID" },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "page_count", header: "Pages" },
      { accessorKey: "author", header: "Author" },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => {
          const record = row.original;
          if (editingId === record.id) {
            return (
              <input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="w-full px-2 py-1 border rounded"
                min="0"
                step="0.01"
              />
            );
          }
          return `$${record.price.toFixed(2)}`;
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const record = row.original;

          if (!user) return null;

          if (editingId === record.id) {
            return (
              <div className="flex gap-2">
                <button
                  onClick={() => handleSave(record.id)}
                  className="text-green-600 hover:text-green-800"
                  title="Save"
                >
                  <FaCheck />
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setEditPrice("");
                  }}
                  className="text-gray-600 hover:text-gray-800"
                  title="Cancel"
                >
                  <FaTimes />
                </button>
              </div>
            );
          }

          return (
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(record)}
                disabled={editingId !== null}
                className="text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                title="Edit"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => handleDelete(record.id)}
                disabled={editingId !== null}
                className="text-red-600 hover:text-red-800 disabled:text-gray-400"
                title="Delete"
              >
                <FaTrash />
              </button>
            </div>
          );
        },
      },
    ],
    [editingId, editPrice]
  );

  const table = useReactTable({
    data: mergedData,
    columns,
    state: { sorting, globalFilter: searchText },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearchText,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (loading)
    return <div className="p-6 text-center">Loading store data...</div>;
  if (error)
    return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  if (!store) return <div className="p-6 text-center">Store not found.</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{store.name} - Books</h1>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanSort() && (
                        <span>
                          {header.column.getIsSorted() === "asc" ? (
                            <FaSortUp />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <FaSortDown />
                          ) : (
                            <FaSort className="text-gray-300" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-4 text-center text-gray-500"
                >
                  No books found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="px-6 py-3 bg-gray-50 border-t text-sm text-gray-700">
          Showing {table.getFilteredRowModel().rows.length} of{" "}
          {mergedData.length} books
        </div>
      </div>
    </div>
  );
}
