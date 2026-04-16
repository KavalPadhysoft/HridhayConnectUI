import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap";
import { MDBDataTable } from "mdbreact";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { buildServerSortColumns, getNextSortState, withAutoSrColumn } from "../../common/common";
import { getPaymentsPages, deletePaymentById, getPaymentById, savePayment } from "../../helpers/fakebackend_helper";
import { getClientDropdownList } from "../../helpers/api_helper";
import axios from "axios";
import { showConfirm, showError, showSuccess } from "../../Pop_show/alertService";
import PaymentForm from "./PaymentForm";

const PAYMENT_LIST_SORT_COLUMN = "paymentId";
const PAYMENT_LIST_SORT_DIR = "asc";

const Payment = () => {
  document.title = "Payment | Lexa - Responsive Bootstrap 5 Admin Dashboard";
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const paymentId = Number(params.id || 0);
  const isFormPage = location.pathname.startsWith("/Payment/manage");
  const isEditMode = isFormPage && paymentId > 0;

  // List state
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(0);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [sortColumn, setSortColumn] = useState(PAYMENT_LIST_SORT_COLUMN);
  const [sortColumnDir, setSortColumnDir] = useState(PAYMENT_LIST_SORT_DIR);

  // Form state
  const [formLoading, setFormLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formTitle, setFormTitle] = useState(isEditMode ? "Edit Payment" : "Create Payment");
  const [formData, setFormData] = useState({
    paymentId: 0,
    clientId: 0,
    invoiceId: 0,
    paymentDate: "",
    amount: 0,
    paymentMode: "",
    referenceNo: "",
    notes: ""
  });

  // Dropdown states
  const [clientList, setClientList] = useState([]);
  const [clientListLoading, setClientListLoading] = useState(false);
  const [invoiceList, setInvoiceList] = useState([]);
  const [invoiceListLoading, setInvoiceListLoading] = useState(false);
  const [paymentModeList, setPaymentModeList] = useState([]);
  const [paymentModeListLoading, setPaymentModeListLoading] = useState(false);

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

      setInvoiceListLoading(true);
      axios.get("/Dropdown/InvoiceList")
        .then((res) => {
          if (res.data && res.data.isSuccess && Array.isArray(res.data.data)) {
            setInvoiceList(res.data.data);
          } else {
            setInvoiceList([]);
          }
        })
        .catch(() => setInvoiceList([]))
        .finally(() => setInvoiceListLoading(false));

      setPaymentModeListLoading(true);
      axios.get("/Dropdown/LovMaster", { params: { Lov_column: "PaymentMode" } })
        .then((res) => {
          if (res.data && res.data.isSuccess && Array.isArray(res.data.data)) {
            setPaymentModeList(res.data.data);
          } else {
            setPaymentModeList([]);
          }
        })
        .catch(() => setPaymentModeList([]))
        .finally(() => setPaymentModeListLoading(false));
    }
  }, [isFormPage]);

  // List logic
  const loadPayments = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getPaymentsPages({
        start: 0,
        length: 10,
        sortColumnDir,
      });
      if (response.isSuccess && response.data && response.data.data) {
        setRows(response.data.data);
      } else {
        setRows([]);
        setError(response.message || "Failed to load Payments.");
      }
    } catch (err) {
      setError("Error loading Payments.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isFormPage) {
      loadPayments();
    }
  }, [isFormPage, sortColumn, sortColumnDir]);

  const handleSortChange = (fieldName) => {
    const nextState = getNextSortState(sortColumn, sortColumnDir, fieldName);
    setSortColumn(nextState.sortColumn);
    setSortColumnDir(nextState.sortColumnDir);
  };

  const handleEdit = (id) => {
    navigate(`/Payment/manage/${id}`);
  };

  const handleDelete = async (id) => {
    if (await showConfirm("Are you sure you want to delete this Payment?")) {
      setDeletingId(id);
      try {
        const response = await deletePaymentById(id);
        if (response.isSuccess) {
          await showSuccess(response.message || "Payment deleted successfully.");
          setTimeout(() => loadPayments(), 600);
        } else {
          await showError(response.message || "Failed to delete Payment.");
        }
      } catch (err) {
        await showError("Error deleting Payment.");
      }
      setDeletingId(0);
    }
  };

  const handleAdd = () => {
    navigate("/Payment/manage");
  };

  // Form logic
  useEffect(() => {
    if (!isFormPage) return;
    if (!isEditMode) {
      setFormTitle("Create Payment");
      setFormData({
        paymentId: 0,
        clientId: 0,
        invoiceId: 0,
        paymentDate: "",
        amount: 0,
        paymentMode: "",
        referenceNo: "",
        notes: ""
      });
      setFormError("");
      setFormLoading(false);
      return;
    }
    setFormLoading(true);
    setFormError("");
    getPaymentById(paymentId)
      .then((response) => {
        if (response?.isSuccess && response?.data) {
          setFormTitle("Edit Payment");
          setFormData({ ...response.data });
        } else {
          setFormError(response?.message || "Failed to load Payment");
        }
      })
      .catch((err) => setFormError(err?.message || err || "Failed to load Payment"))
      .finally(() => setFormLoading(false));
  }, [isFormPage, isEditMode, paymentId]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      const payload = { ...formData };
      const response = await savePayment(payload);
      if (response?.statusCode === 1 || response?.isSuccess) {
        await showSuccess(response?.message || "Saved successfully");
        setTimeout(() => navigate("/Payment"), 600);
        return;
      }
      throw new Error(response?.message || "Failed to save Payment");
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to save Payment";
      await showError(errorMessage);
      setFormError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleClientChange = (option) => {
    setFormData(prev => ({
      ...prev,
      clientId: option ? option.value : "",
    }));
  };

  const handleInvoiceChange = (option) => {
    setFormData(prev => ({
      ...prev,
      invoiceId: option ? option.value : "",
    }));
  };

  const handlePaymentModeChange = (option) => {
    setFormData(prev => ({
      ...prev,
      paymentMode: option ? option.value : "",
    }));
  };

  const data = useMemo(() => {
    return withAutoSrColumn({
      columns: buildServerSortColumns({
        columns: [
          { label: "Client Name", field: "clientName", sort: "asc" },
          { label: "Invoice Number", field: "invoiceNumber", sort: "asc" },
          { label: "Payment Date", field: "paymentDate", sort: "asc" },
          { label: "Amount", field: "amount", sort: "asc" },
          { label: "Payment Mode", field: "paymentMode", sort: "asc" },
          { label: "Action", field: "action", sort: "disabled" },
        ],
        onSort: handleSortChange,
        activeSortColumn: sortColumn,
        sortColumnDir,
      }),
      rows: rows.map(item => ({
        paymentId: item.paymentId,
        clientName: item.clientName || "",
        invoiceNumber: item.invoiceNumber || "",
        paymentDate: item.paymentDate ? new Date(item.paymentDate).toLocaleDateString() : "",
        amount: item.amount ?? 0,
        paymentMode: item.paymentMode || "",
        action: (
          <div className="d-flex gap-2 justify-content-center">
            <Button
              color="link"
              className="p-0 text-primary"
              title="Edit"
              type="button"
              onClick={() => handleEdit(item.paymentId)}
            >
              <i className="mdi mdi-pencil font-size-18" />
            </Button>
            <Button
              color="link"
              className="p-0 text-danger"
              title="Delete"
              type="button"
              disabled={deletingId === item.paymentId}
              onClick={() => handleDelete(item.paymentId)}
            >
              {deletingId === item.paymentId ? (
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
            formLoading || clientListLoading || invoiceListLoading || paymentModeListLoading ? (
              <Card>
                <CardBody>
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                  </div>
                </CardBody>
              </Card>
            ) : (
              <PaymentForm
                title={formTitle}
                formError={formError}
                formData={formData}
                isEditMode={isEditMode}
                saving={saving}
                onChange={handleFormChange}
                onSubmit={handleFormSubmit}
                onClose={() => navigate("/Payment")}
                clientList={clientList}
                onClientChange={handleClientChange}
                invoiceList={invoiceList}
                onInvoiceChange={handleInvoiceChange}
                paymentModeList={paymentModeList}
                onPaymentModeChange={handlePaymentModeChange}
              />
            )
          ) : (
            <Card>
              <CardBody>
                <div className="d-flex justify-content-end mb-3">
                  <Button color="primary" type="button" onClick={handleAdd}>
                    <i className="mdi mdi-plus me-1" />Add Payment
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

export default Payment;
