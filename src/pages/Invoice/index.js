import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap";
import { MDBDataTable } from "mdbreact";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { buildServerSortColumns, getNextSortState, withAutoSrColumn } from "../../common/common";
import { getInvoicesPages, deleteInvoiceById, getInvoiceById, saveInvoice } from "../../helpers/fakebackend_helper";
import { showConfirm, showError, showSuccess } from "../../Pop_show/alertService";
import InvoiceForm from "./InvoiceForm";
import { getClientDropdownList, getLovDropdownList } from "../../helpers/api_helper";

const INVOICE_LIST_SORT_COLUMN = "invoiceNumber";
const INVOICE_LIST_SORT_DIR = "asc";

const Invoice = () => {
  document.title = "Invoice | Lexa - Responsive Bootstrap 5 Admin Dashboard";
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const InvoiceId = Number(params.id || 0);
  const isFormPage = location.pathname.startsWith("/Invoice/manage");
  const isEditMode = isFormPage && InvoiceId > 0;

  // List state
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(0);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [sortColumn, setSortColumn] = useState(INVOICE_LIST_SORT_COLUMN);
  const [sortColumnDir, setSortColumnDir] = useState(INVOICE_LIST_SORT_DIR);

  // Form state
  const [formLoading, setFormLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formTitle, setFormTitle] = useState(isEditMode ? "Edit Invoice" : "Create Invoice");
  const [formData, setFormData] = useState({
    invoiceId: 0,
    clientId: 0,
    invoiceNumber: "",
    invoiceDate: "",
    dueDate: "",
    subTotal: 0,
    discount: 0,
    finalAmount: 0,
    status: "",
    notes: ""
  });

  // Client dropdown state
  const [clientList, setClientList] = useState([]);
  const [clientListLoading, setClientListLoading] = useState(false);

  // Status dropdown state
  const [statusList, setStatusList] = useState([]);
  const [statusListLoading, setStatusListLoading] = useState(false);

  useEffect(() => {
    if (isFormPage) {
      setClientListLoading(true);
      getClientDropdownList()
        .then((res) => {
          if (res.isSuccess && Array.isArray(res.data)) {
            setClientList(res.data);
          } else {
            setClientList([]);
          }
        })
        .catch(() => setClientList([]))
        .finally(() => setClientListLoading(false));

      setStatusListLoading(true);
      getLovDropdownList("InvoiceStatus")
        .then((res) => {
          if (res.isSuccess && Array.isArray(res.data)) {
            setStatusList(res.data);
          } else {
            setStatusList([]);
          }
        })
        .catch(() => setStatusList([]))
        .finally(() => setStatusListLoading(false));
    }
  }, [isFormPage]);

  // List logic
  const loadInvoices = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getInvoicesPages({
        start: 0,
        length: 10,
        sortColumnDir,
      });
      if (response.isSuccess && response.data && response.data.data) {
        setRows(response.data.data);
      } else {
        setRows([]);
        setError(response.message || "Failed to load Invoices.");
      }
    } catch (err) {
      setError("Error loading Invoices.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isFormPage) {
      loadInvoices();
    }
  }, [isFormPage, sortColumn, sortColumnDir]);

  const handleSortChange = (fieldName) => {
    const nextState = getNextSortState(sortColumn, sortColumnDir, fieldName);
    setSortColumn(nextState.sortColumn);
    setSortColumnDir(nextState.sortColumnDir);
  };

  const handleEdit = (id) => {
    navigate(`/Invoice/manage/${id}`);
  };

  const handleDelete = async (id) => {
    if (await showConfirm("Are you sure you want to delete this Invoice?")) {
      setDeletingId(id);
      try {
        const response = await deleteInvoiceById(id);
        if (response.isSuccess) {
          await showSuccess(response.message || "Invoice deleted successfully.");
          setTimeout(() => loadInvoices(), 600);
        } else {
          await showError(response.message || "Failed to delete Invoice.");
        }
      } catch (err) {
        await showError("Error deleting Invoice.");
      }
      setDeletingId(0);
    }
  };

  const handleAdd = () => {
    navigate("/Invoice/manage");
  };

  // Form logic
  useEffect(() => {
    if (!isFormPage) return;
    if (!isEditMode) {
      setFormTitle("Create Invoice");
      setFormData({
        invoiceId: 0,
        clientId: 0,
        invoiceNumber: "",
        invoiceDate: "",
        dueDate: "",
        subTotal: 0,
        discount: 0,
        finalAmount: 0,
        status: "",
        notes: ""
      });
      setFormError("");
      setFormLoading(false);
      return;
    }
    setFormLoading(true);
    setFormError("");
    getInvoiceById(InvoiceId)
      .then((response) => {
        if (response?.isSuccess && response?.data) {
          setFormTitle("Edit Invoice");
          setFormData({
            ...response.data,
            invoiceDate: response.data.invoiceDate ? response.data.invoiceDate.substring(0, 10) : "",
            dueDate: response.data.dueDate ? response.data.dueDate.substring(0, 10) : "",
          });
        } else {
          setFormError(response?.message || "Failed to load Invoice");
        }
      })
      .catch((err) => setFormError(err?.message || err || "Failed to load Invoice"))
      .finally(() => setFormLoading(false));
  }, [isFormPage, isEditMode, InvoiceId]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      const payload = {
        ...formData,
        subTotal: formData.subTotal === "" || formData.subTotal === null ? 0 : Number(formData.subTotal),
        discount: formData.discount === "" || formData.discount === null ? 0 : Number(formData.discount),
        finalAmount: formData.finalAmount === "" || formData.finalAmount === null ? 0 : Number(formData.finalAmount)
      };
      const response = await saveInvoice(payload);
      if (response?.statusCode === 1 || response?.isSuccess) {
        await showSuccess(response?.message || "Saved successfully");
        setTimeout(() => navigate("/Invoice"), 600);
        return;
      }
      throw new Error(response?.message || "Failed to save Invoice");
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to save Invoice";
      await showError(errorMessage);
      setFormError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Handler for react-select client dropdown
  const handleClientChange = (option) => {
    setFormData(prev => ({
      ...prev,
      clientId: option ? option.value : "",
    }));
  };

  // Handler for react-select status dropdown
  const handleStatusChange = (option) => {
    setFormData(prev => ({
      ...prev,
      status: option ? option.value : "",
    }));
  };

  // Table data
  const data = useMemo(() => {
    return withAutoSrColumn({
      columns: buildServerSortColumns({
        columns: [
          { label: "Invoice Number", field: "invoiceNumber", sort: "asc" },
          { label: "Client Name", field: "clientName", sort: "asc" },
          { label: "Invoice Date", field: "invoiceDate", sort: "asc" },
          { label: "Due Date", field: "dueDate", sort: "asc" },
          { label: "Final Amount", field: "finalAmount", sort: "asc" },
          { label: "Status", field: "statusName", sort: "asc" },
          { label: "Action", field: "action", sort: "disabled" },
        ],
        onSort: handleSortChange,
        activeSortColumn: sortColumn,
        sortColumnDir,
      }),
      rows: rows.map(item => ({
        invoiceId: item.invoiceId,
        invoiceNumber: item.invoiceNumber || "",
        clientName: item.clientName || "",
        invoiceDate: item.invoiceDate ? new Date(item.invoiceDate).toLocaleDateString() : "",
        dueDate: item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "",
        finalAmount: item.finalAmount ?? 0,
        statusName: item.statusName || "",
        action: (
          <div className="d-flex gap-2 justify-content-center">
            <Button
              color="link"
              className="p-0 text-primary"
              title="Edit"
              type="button"
              onClick={() => handleEdit(item.invoiceId)}
            >
              <i className="mdi mdi-pencil font-size-18" />
            </Button>
            <Button
              color="link"
              className="p-0 text-danger"
              title="Delete"
              type="button"
              disabled={deletingId === item.invoiceId}
              onClick={() => handleDelete(item.invoiceId)}
            >
              {deletingId === item.invoiceId ? (
                <Spinner size="sm" />
              ) : (
                <i className="mdi mdi-trash-can-outline font-size-18" />
              )}
            </Button>
          </div>
        ),
      })),
    });
  }, [rows, sortColumn, sortColumnDir, deletingId]);

  return (
    <React.Fragment>
      <Row>
        <Col lg={12}>
          {isFormPage ? (
            formLoading || clientListLoading ? (
              <Card>
                <CardBody>
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                  </div>
                </CardBody>
              </Card>
            ) : (
              <InvoiceForm
                title={formTitle}
                formError={formError}
                formData={formData}
                isEditMode={isEditMode}
                saving={saving}
                onChange={handleFormChange}
                onSubmit={handleFormSubmit}
                onClose={() => navigate("/Invoice")}
                clientList={clientList}
                onClientChange={handleClientChange}
                statusList={statusList}
                onStatusChange={handleStatusChange}
              />
            )
          ) : (
            <Card>
              <CardBody>
                <div className="d-flex justify-content-end mb-3">
                  <Button color="primary" type="button" onClick={() => navigate("/Invoice/manage")}> 
                    <i className="mdi mdi-plus me-1" />Add Invoice
                  </Button>
                </div>
                {error ? <Alert color="danger">{error}</Alert> : null}
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                  </div>
                ) : (
                  <MDBDataTable className="table-auto-sr" striped bordered small noBottomColumns data={data} />
                )}
              </CardBody>
            </Card>
          )}
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default Invoice;
