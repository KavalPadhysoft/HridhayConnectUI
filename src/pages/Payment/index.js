import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap";
import { MDBDataTable } from "mdbreact";

//Bradcrum
import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";


import { useNavigate, useLocation, useParams } from "react-router-dom";
import { buildServerSortColumns, getNextSortState, withAutoSrColumn } from "../../common/common";
import { getPaymentsPages, deletePaymentById, getPaymentById, savePayment } from "../../helpers/fakebackend_helper";
import { getClientDropdownList, getInvoiceDropdownList } from "../../helpers/api_helper";
import { getLovDropdownList } from "../../helpers/api_helper";
import { showConfirm, showError, showSuccess } from "../../Pop_show/alertService";
import PaymentForm from "./PaymentForm";

const PAYMENT_LIST_SORT_COLUMN = "paymentId";
const PAYMENT_LIST_SORT_DIR = "asc";
// Bradcrum
const Payment = props => {
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
  const handleClientChange = (option) => {
    setFormData(prev => ({
      ...prev,
      clientId: option ? Number(option.value) : 0,
    }));
  };
  const [rows, setRows] = useState([]);
  const handleInvoiceChange = (option) => {
    setFormData(prev => ({
      ...prev,
      invoiceId: option ? Number(option.value) : 0,
    }));
  };
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
      getInvoiceDropdownList()
        .then((res) => {
          if (res.isSuccess && Array.isArray(res.data)) {
            setInvoiceList(res.data);
          } else {
            setInvoiceList([]);
          }
        })
        .catch(() => setInvoiceList([]))
        .finally(() => setInvoiceListLoading(false));

      setPaymentModeListLoading(true);
      getLovDropdownList("PaymentMode")
        .then((res) => {
          if (res.isSuccess && Array.isArray(res.data)) {
            setPaymentModeList(res.data);
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

  // Bradcrum
   useEffect(() => {
    props.setBreadcrumbItems("Payment")
  }, [])


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
    if (saving) return; // Prevent multiple submissions
    setFormError("");
    setSaving(true);
    try {
      // Ensure clientId, invoiceId, amount are integers (0 if empty)
      const payload = {
        ...formData,
        clientId: formData.clientId === "" ? 0 : Number(formData.clientId),
        invoiceId: formData.invoiceId === "" ? 0 : Number(formData.invoiceId),
        amount: formData.amount === "" ? 0 : Number(formData.amount),
        paymentMode: formData.paymentMode ? formData.paymentMode : ""
      };
      // Remove paymentDate if empty
      if (!formData.paymentDate || formData.paymentDate.trim() === "") {
        delete payload.paymentDate;
      }
      const response = await savePayment(payload);
      if (response?.statusCode === 1 || response?.isSuccess) {
        setTimeout(async () => {
          navigate("/Payment");
          await showSuccess(response?.message || "Saved successfully");
        }, 0);
        return;
      }
      throw new Error(response?.message || "Failed to save Payment");
    } catch (err) {
      let errorMessage = "Failed to save Payment";
      if (err?.response && err.response.status === 400) {
        errorMessage = err.response.data?.message || "Bad request (400): Please check your input.";
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }
      await showError(errorMessage);
      setFormError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Removed duplicate handleClientChange and handleInvoiceChange

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


export default connect(null, { setBreadcrumbItems })(Payment);

