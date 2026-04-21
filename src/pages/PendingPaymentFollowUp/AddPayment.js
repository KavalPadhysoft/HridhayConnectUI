import React, { useState, useEffect } from "react";
import { Button, Card, CardBody, Col, Form, FormGroup, Input, Label, Row } from "reactstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { post, get, getLovDropdownList } from "../../helpers/api_helper";
import { Alert, CardHeader, Spinner } from "reactstrap";
import Select from "react-select";

const AddPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Get invoiceId and clientId from query params if present
  const params = new URLSearchParams(location.search);
  const invoiceId = params.get("invoiceId") || 0;
  const clientId = params.get("clientId") || 0;

  const [form, setForm] = useState({
    clientId: Number(clientId),
    invoiceId: Number(invoiceId),
    paymentDate: new Date().toISOString().slice(0, 10),
    amount: 0,
    paymentMode: "",
    referenceNo: "",
    notes: "",
    // iS_Advance is not shown in the form and always false
    iS_Advance: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [clientOptions, setClientOptions] = useState([]);
  const [invoiceOptions, setInvoiceOptions] = useState([]);
  const [paymentModeOptions, setPaymentModeOptions] = useState([]);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState(null);

  useEffect(() => {
    // Fetch client list
    const fetchClients = async () => {
      try {
        const res = await get("/Dropdown/ClientList");
        if (res?.isSuccess && Array.isArray(res.data)) {
          setClientOptions(res.data);
        }
      } catch {}
    };
    fetchClients();
  }, []);

  useEffect(() => {
    // Fetch invoice list for selected client
    const fetchInvoices = async () => {
      try {
        const res = await get(`/Dropdown/InvoiceList?clientId=${form.clientId || 0}`);
        if (res?.isSuccess && Array.isArray(res.data)) {
          setInvoiceOptions(res.data);
        }
      } catch {}
    };
    fetchInvoices();
  }, [form.clientId]);

  useEffect(() => {
    // Fetch payment mode list using LOV API
    const fetchPaymentModes = async () => {
      try {
        const res = await getLovDropdownList("PaymentMode");
        if (res?.isSuccess && Array.isArray(res.data)) {
          setPaymentModeOptions(res.data.map(mode => ({ value: mode.code, label: mode.name })));
        }
      } catch {}
    };
    fetchPaymentModes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await savePayment(form);
      navigate(-1);
    } catch (err) {
      setError(err?.toString() || "Payment save failed");
    } finally {
      setSaving(false);
    }
  };

  const savePayment = async payload => {
    try {
      return await post("/Payment/Add", payload);
    } catch (error) {
      throw (
        error?.response?.data?.message ||
        error?.message ||
        "Payment save failed"
      );
    }
  };

  const handleClientChange = (e) => {
    setForm((prev) => ({ ...prev, clientId: Number(e.target.value), invoiceId: 0 }));
  };
  const handleInvoiceChange = (e) => {
    setForm((prev) => ({ ...prev, invoiceId: Number(e.target.value) }));
  };
  const handlePaymentModeChange = (option) => {
    setSelectedPaymentMode(option);
    setForm(prev => ({ ...prev, paymentMode: option ? option.value : "" }));
  };

  return (
    <Card className="mb-4 app-form-card">
      <CardHeader className="bg-white d-flex align-items-center justify-content-between">
        <h5 className="mb-0">Add Payment</h5>
        <Button color="link" className="p-0" type="button" onClick={() => navigate(-1)} style={{ color: '#6c63ff', fontWeight: 500 }}>
          Close
        </Button>
      </CardHeader>
      <CardBody className="app-form-body">
        {error ? <Alert color="danger">{error}</Alert> : null}
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Label for="clientId">Client<span style={{ color: 'red' }}>*</span></Label>
              <Input
                type="select"
                name="clientId"
                id="clientId"
                value={form.clientId}
                onChange={handleClientChange}
                disabled={saving || !!clientId}
                required
              >
                <option value="">Select Client</option>
                {clientOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </Input>
            </Col>
            <Col md={6}>
              <Label for="invoiceId">Invoice<span style={{ color: 'red' }}>*</span></Label>
              <Input
                type="select"
                name="invoiceId"
                id="invoiceId"
                value={form.invoiceId}
                onChange={handleInvoiceChange}
                disabled={saving || !form.clientId || !!invoiceId}
                required
              >
                <option value="">Select Invoice</option>
                {invoiceOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </Input>
            </Col>
            <Col md={6}>
              <Label for="paymentDate">Payment Date<span style={{ color: 'red' }}>*</span></Label>
              <Input
                type="date"
                name="paymentDate"
                id="paymentDate"
                value={form.paymentDate}
                onChange={handleChange}
                required
                disabled={saving}
              />
            </Col>
            <Col md={6}>
              <Label for="amount">Amount<span style={{ color: 'red' }}>*</span></Label>
              <Input
                type="number"
                name="amount"
                id="amount"
                value={form.amount}
                onChange={handleChange}
                required
                min={0}
                disabled={saving}
              />
            </Col>
            <Col md={6}>
              <Label>Payment Mode<span style={{ color: "red" }}>*</span></Label>
              <Select
                classNamePrefix="select2-selection"
                placeholder="Select payment mode"
                options={paymentModeOptions}
                value={paymentModeOptions.find(opt => String(opt.value) === String(form.paymentMode)) || null}
                onChange={option => {
                  setSelectedPaymentMode(option);
                  setForm(prev => ({ ...prev, paymentMode: option ? option.value : "" }));
                }}
                isClearable
                styles={{ container: base => ({ ...base, width: "100%" }) }}
                isDisabled={saving}
              />
            </Col>
            <Col md={6}>
              <Label for="referenceNo">Reference No</Label>
              <Input
                type="text"
                name="referenceNo"
                id="referenceNo"
                value={form.referenceNo}
                onChange={handleChange}
                disabled={saving}
              />
            </Col>
            <Col md={6}>
              <Label>Invoice Amount</Label>
              <Input
                type="text"
                value={form.pendingAmount || ''}
                readOnly
                disabled
              />
            </Col>
            <Col md={6}>
              <Label for="notes">Notes</Label>
              <Input
                type="textarea"
                name="notes"
                id="notes"
                value={form.notes}
                onChange={handleChange}
                // rows={2}
                disabled={saving}
              />
            </Col>
          </Row>
          <div className="app-form-actions d-flex justify-content-center mt-4">
            <Button color="light" type="button" onClick={() => navigate(-1)} style={{ minWidth: 120, marginRight: 16 }} disabled={saving}>
              Cancel
            </Button>
            <Button color="success" type="submit" disabled={saving} style={{ minWidth: 120 }}>
              {saving ? <Spinner size="sm" className="me-2" /> : null}
              Save
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
};

export default AddPayment;
