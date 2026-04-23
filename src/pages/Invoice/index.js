import { DASHBOARD_NAME } from "../../config";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap";
import { MDBDataTable } from "mdbreact";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { buildServerSortColumns, getNextSortState, withAutoSrColumn } from "../../common/common";
import { getInvoicesPages, deleteInvoiceById, getInvoiceById, saveInvoice } from "../../helpers/fakebackend_helper";
import { showConfirm, showError, showSuccess } from "../../Pop_show/alertService";
import InvoiceForm from "./InvoiceForm";

import { getClientDropdownList, getLovDropdownList } from "../../helpers/api_helper";
import { getNewInvoiceNumber } from "../../helpers/invoice_helper";

import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";

import { getServiceDropdownList } from "../../helpers/api_helper";


const INVOICE_LIST_SORT_COLUMN = "invoiceNumber";
const INVOICE_LIST_SORT_DIR = "asc";

// end for direct PDF open
const Invoice = props => {
  document.title = `Invoice | ${DASHBOARD_NAME}`;
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

  // Service dropdown state
  const [serviceList, setServiceList] = useState([]);
  const [serviceListLoading, setServiceListLoading] = useState(false);

  // Invoice items state (moved from InvoiceForm)
  const [invoiceItems, setInvoiceItems] = useState([]);

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

      // Fetch service list for dropdown (new API)
      setServiceListLoading(true);
      getServiceDropdownList()
        .then((res) => {
          if (res.isSuccess && Array.isArray(res.data)) {
            // Map API data to expected format for InvoiceForm
            setServiceList(res.data.map(item => ({
              serviceId: item.id,
              ServiceName: item.name,
              Rate: item.defaultPrice,
              Description: item.name,
            })));
          } else {
            setServiceList([]);
          }
        })
        .catch(() => setServiceList([]))
        .finally(() => setServiceListLoading(false));
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
      props.setBreadcrumbItems("Invoice")
    }, [])


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
      setFormError("");
      setFormLoading(true);
      // Fetch new invoice number from API
      getNewInvoiceNumber()
        .then((res) => {
          let invoiceNumber = "";
          if (res && (res.invoiceNumber || (res.data && res.data.invoiceNumber))) {
            invoiceNumber = res.invoiceNumber || (res.data && res.data.invoiceNumber) || "";
          }
          setFormData({
            invoiceId: 0,
            clientId: 0,
            invoiceNumber: invoiceNumber,
            invoiceDate: "",
            dueDate: "",
            subTotal: 0,
            discount: 0,
            finalAmount: 0,
            status: "4", // Default status value for add
            notes: ""
          });
        })
        .catch(() => {
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
        })
        .finally(() => {
          setFormLoading(false);
        });
      // Do not auto-add any invoice item by default
      setInvoiceItems([]);
      return;
    }
    setFormLoading(true);
    setFormError("");
    getInvoiceById(InvoiceId)
      .then((response) => {
        if (response?.isSuccess && response?.data) {
          setFormTitle("Edit Invoice");
          // If API returns { invoice, items }
          if (response.data.invoice && response.data.items) {
            setFormData({
              ...response.data.invoice,
              invoiceDate: response.data.invoice.invoiceDate ? response.data.invoice.invoiceDate.substring(0, 10) : "",
              dueDate: response.data.invoice.dueDate ? response.data.invoice.dueDate.substring(0, 10) : "",
            });
            setInvoiceItems(response.data.items.map(item => ({
              ...item,
              ItemType: item.itemType,
              Description: item.description,
              Quantity: item.quantity,
              Rate: item.rate,
              Amount: item.amount,
              serviceId: item.serviceId,
            })));
          } else {
            setFormData({
              ...response.data,
              invoiceDate: response.data.invoiceDate ? response.data.invoiceDate.substring(0, 10) : "",
              dueDate: response.data.dueDate ? response.data.dueDate.substring(0, 10) : "",
            });
            setInvoiceItems([]);
          }
        } else {
          setFormError(response?.message || "Failed to load Invoice");
        }
      })
      .catch((err) => setFormError(err?.message || err || "Failed to load Invoice"))
      .finally(() => setFormLoading(false));
  }, [isFormPage, isEditMode, InvoiceId, serviceList]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      // Build payload as per API spec
      // Calculate subTotal and finalAmount from items and discount
      const subTotal = invoiceItems.reduce((sum, it) => sum + Number(it.Amount), 0);
      const discountRaw = formData.discount === undefined || formData.discount === null ? "" : formData.discount;
      const discountPercent = Math.min(Number(discountRaw) || 0, 100);
      const finalAmount = subTotal - (subTotal * discountPercent / 100);
      const invoicePayload = {
        ...formData,
        subTotal,
        discount: discountRaw,
        finalAmount
      };
      // Remove invoiceDate and dueDate if empty
      if (!formData.invoiceDate || formData.invoiceDate.trim() === "") {
        delete invoicePayload.invoiceDate;
      }
      if (!formData.dueDate || formData.dueDate.trim() === "") {
        delete invoicePayload.dueDate;
      }
      // Map invoiceItems to API expected fields
      const itemsPayload = invoiceItems.map(item => ({
        ...item,
        itemType: item.ItemType,
        description: item.Description,
        quantity: item.Quantity,
        rate: item.Rate,
        amount: item.Amount,
        serviceId: item.serviceId || 0,
        isTaxable: true,
        isActive: true,
        isDeleted: false,
      }));
      const payload = {
        invoice: invoicePayload,
        items: itemsPayload
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
      rows: rows.map(item => {
        // Format date as dd/mm/yyyy
        const formatDate = (dateStr) => {
          if (!dateStr) return "";
          const d = new Date(dateStr);
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const year = d.getFullYear();
          return `${day}/${month}/${year}`;
        };
        return {
          invoiceId: item.invoiceId,
          invoiceNumber: item.invoiceNumber || "",
          clientName: item.clientName || "",
          invoiceDate: formatDate(item.invoiceDate),
          dueDate: formatDate(item.dueDate),
          finalAmount: item.finalAmount ?? 0,
          statusName: item.statusName || "",
          action: (
            <div className="d-flex gap-2 justify-content-center">
              <Button
                color="link"
                className="p-0 text-info"
                title="View"
                type="button"
                // onClick={() => navigate(`/Invoice/view/${item.invoiceId}`)}
                 onClick={() => navigate(`/Invoice/pdf/${item.invoiceId}`)}
               // onClick={() => openPDFInNewTab(item.invoiceId)}
               // onClick={() => window.open(`/Invoice/pdf/${item.invoiceId}`, "_blank")}
              >
                <i className="mdi mdi-eye font-size-18" />
              </Button>
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
        };
      }),
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
                serviceList={serviceList}
                invoiceItems={invoiceItems}
                setInvoiceItems={setInvoiceItems}
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
                  <MDBDataTable
                    striped
                    bordered
                    
                    small
                    noBottomColumns
                    data={data}
                    className={rows && rows.length > 0 ? "table-auto-sr" : undefined}
                    noRecordsFoundLabel={<span style={{display: 'block', textAlign: 'center', fontWeight: 'bold', color: '#888'}}>You don't have any record</span>}
                  />
                )}
              </CardBody>
            </Card>
          )}
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(Invoice);

