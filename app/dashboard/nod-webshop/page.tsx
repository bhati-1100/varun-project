"use client";
import Table from "@/app/components/Table";
import DeleteConfirmationModal from "@/app/components/users/deleteConfirmationModal";
import AddEditModal from "@/app/components/users/addEditModal";
import "@/app/globals.css";
import { TableHeader, TableRow, Tooltip } from "@nextui-org/react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import { useEffect, useState } from "react";
import GeneralBreadcrumbs from "@/app/components/GeneralBreadcrumbs";
import { fetchNodProducts } from "@/services/api/productService";

export default function Users() {
  const [state, setState] = useState({
    products: [],
    totalPages: 0,
    currentPage: 1,
    isLoading: true,
    sortDescriptor: { column: "name", direction: "ascending" },
    modalSettings: {
      isOpenAddEdit: false,
      isOpenDelete: false,
      currentEntry: null,
    },
  });

  const pageSize = 2;

  const appendQueriesToUrl = (
    queries: { key: string; value: string | number }[]
  ) => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    queries.map((query) => {
      urlSearchParams.set(query.key, query.value.toString());
    });
    window.history.replaceState(null, "", "?" + urlSearchParams.toString());
  };

  const getUrlQueryElement = (key: string) => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    return urlSearchParams.get(key) || "";
  };

  const fetchUsers = async () => {
    setState((prevState) => ({
      ...prevState,
      isLoading: true,
      products: [],
    }));

    const page = getUrlQueryElement("page");
    const search = getUrlQueryElement("search");

    try {
      const productsData = await fetchNodProducts(search || "", +page || 1);

      const result = productsData?.result;
      if (result) {
        setState((prevState) => ({
          ...prevState,
          products: result.products as any,
          totalPages: result.total_pages,
        }));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setState((prevState) => ({
        ...prevState,
        isLoading: false,
      }));
    }
  };

  useEffect(() => {
    const init = async () => {
      appendQueriesToUrl([
        { key: "page", value: getUrlQueryElement("page") || 1 },
      ]);
      setState((prevState) => ({
        ...prevState,
        currentPage: Number(getUrlQueryElement("page")),
      }));
      await fetchUsers();
    };
    init();
  }, []);

  const handleAddEditModal = (id?: string) => {
    const userToEdit = state.products.find((user: any) => user.id === id);

    setState((prevState) => ({
      ...prevState,
      modalSettings: {
        ...prevState.modalSettings,
        isOpenAddEdit: true,
        currentEntry: userToEdit ?? null,
      },
    }));
  };

  const handleAddEdit = async () => {
    await fetchUsers();
  };

  const handleDeleteModal = (id: string) => {
    const userToDelete = state.products.find((user: any) => user.id === id);
    if (userToDelete) {
      setState((prevState) => ({
        ...prevState,
        modalSettings: {
          ...prevState.modalSettings,
          isOpenDelete: true,
          currentEntry: userToDelete,
        },
      }));
    }
  };

  const handleDelete = async () => {
    await fetchUsers();
  };

  const handleModalClose = () => {
    setState((prevState) => ({
      ...prevState,
      modalSettings: {
        ...prevState.modalSettings,
        isOpenAddEdit: false,
        isOpenDelete: false,
      },
    }));
  };

  const handleOnSearch = async (value: string) => {
    const queries = [
      {
        key: "search",
        value: value,
      },
    ];
    appendQueriesToUrl(queries);
    if (value == "") {
      setState((prevState) => ({
        ...prevState,
        currentPage: 1,
      }));
      appendQueriesToUrl([{ key: "page", value: 1 }]);
    }
    await fetchUsers();
  };

  const handlePageChange = async (page: number) => {
    setState((prevState) => ({
      ...prevState,
      currentPage: page,
    }));
    appendQueriesToUrl([{ key: "page", value: page.toString() }]);
    await fetchUsers();
  };

  const handleSortChange = async (sortDescriptor: any) => {
    setState((prevState) => ({
      ...prevState,
      users: [],
      sortDescriptor,
      currentPage: 1,
    }));
    appendQueriesToUrl([
      { key: "sortBy", value: sortDescriptor.column },
      { key: "sortOrder", value: sortDescriptor.direction },
      { key: "page", value: 1 },
    ]);
    await fetchUsers();
  };

  return (
    <>
      <GeneralBreadcrumbs
        items={[
          {
            name: "Dashboard",
            href: "/dashboard",
          },
          {
            name: "NOD Wehshop",
            href: "/dashboard/nod-webshop",
          },
        ]}
      />
      <Table
        columns={[
          { key: "name", label: "NAME", allowsSorting: true },
          {
            key: "product_category_name",
            label: "CATEGORY",
            allowsSorting: true,
          },
          {
            key: "manufacturer_name",
            label: "MANUFACTURER",
            allowsSorting: true,
          },
          { key: "price", label: "PRICE", allowsSorting: true },
          { key: "warranty", label: "WARRANTY", allowsSorting: true },
          { key: "stock_value", label: "STOCK", allowsSorting: true },
          {
            key: "actions",
            label: "ACTIONS",
            className: "text-end",
            cell: (rowData) => (
              <div className="flex items-center gap-5">
                <Tooltip content="Edit">
                  <span
                    className="cursor-pointer text-center text-base text-blue-500 hover:text-blue-300 dark:text-white dark:hover:text-blue-500"
                    onClick={() => handleAddEditModal(rowData.id)}
                  >
                    <FaPencilAlt />
                  </span>
                </Tooltip>
                <Tooltip content="Delete">
                  <span
                    className="cursor-pointer text-center text-base text-red-500 hover:text-red-300 dark:text-white dark:hover:text-red-500"
                    onClick={() => handleDeleteModal(rowData.id)}
                  >
                    <FaTrash />
                  </span>
                </Tooltip>
              </div>
            ),
          },
        ]}
        isLoading={state.isLoading}
        hasSearchBar
        addMore={() => handleAddEditModal()}
        data={state.products}
        page={state.currentPage}
        pages={state.totalPages}
        onSearchChange={handleOnSearch}
        onPageChange={handlePageChange}
        sortDescriptor={state.sortDescriptor}
        onSortChange={handleSortChange}
      />
      {state.modalSettings.isOpenAddEdit && (
        <AddEditModal
          isOpen={state.modalSettings.isOpenAddEdit}
          onOpenChange={handleModalClose}
          currentEntry={state.modalSettings.currentEntry}
          onUpdateUser={handleAddEdit}
        />
      )}
      {state.modalSettings.isOpenDelete && (
        <DeleteConfirmationModal
          isOpen={state.modalSettings.isOpenDelete}
          onConfirm={handleDelete}
          onClose={handleModalClose}
          currentEntry={state.modalSettings.currentEntry}
        />
      )}
    </>
  );
}
