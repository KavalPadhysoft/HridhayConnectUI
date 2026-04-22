import React, { useState, useEffect } from "react";
import { Button, Card, CardBody, Col, Form, Input, Label, Row } from "reactstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { post, get, getLovDropdownList } from "../../helpers/api_helper";
import { Alert, CardHeader, Spinner } from "reactstrap";
import { showError, showSuccess } from "../../Pop_show/alertService"
import Select from "react-select";

const AdjustAdvancePayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const invoiceId = params.get("invoiceId") || 0;
  const clientId = params.get("clientId") || 0;
  const remainingAmount = params.get("remainingAmount") || 0;
  const pendingAmount = params.get("pendingAmount") || 0;
  const advance_ID = params.get("advance_ID") || 0;
const rawDate = params.get("paymentDate");
const paymentDate = rawDate
  ? rawDate.split("T")[0]   // ✅ FIX: remove time
  : new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    clientId: Number(clientId),
    invoiceId: Number(invoiceId),
    paymentDate: paymentDate,
    advancePayment: Number(remainingAmount) || 0,
    originalAdvanceAmount: Number(remainingAmount) || 0,
    paymentMode: "",
    referenceNo: "",
    notes: "",
         pendingAmount: Number(pendingAmount),
advance_ID: Number(advance_ID) || 0,
   // ✅ ADD THIS
    iS_Advance: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [clientOptions, setClientOptions] = useState([]);
  const [invoiceOptions, setInvoiceOptions] = useState([]);
  const [paymentModeOptions, setPaymentModeOptions] = useState([]);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState(null);

  useEffect(() => {
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

  setForm((prev) => ({
    ...prev,
    [name]: name === "advancePayment" ? Number(value) : value
  }));
};

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setSaving(true);
  //   setError("");
  //   try {
  //     await savePayment(form);
  //     navigate(-1);
  //   } catch (err) {
  //     setError(err?.toString() || "Advance adjustment failed");
  //   } finally {
  //     setSaving(false);
  //   }
  // };
const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  // ✅ Validation on SAVE click
  if (Number(form.advancePayment) > Number(form.pendingAmount)) {
    const msg = "Advance amount cannot be greater than Invoice Amount";
    setError(msg);        // show in UI
    await showError(msg); // popup message
    return;
  }

  setSaving(true);

  try {
    const response = await savePayment(form);

    if (response?.isSuccess) {
      await showSuccess(response?.message || "Advance saved successfully");
      navigate(-1);
      return;
    }

    throw new Error(response?.message || "Advance adjustment failed");
  } catch (err) {
    const errorMessage = err?.message || err || "Advance adjustment failed";
    await showError(errorMessage);
    setError(errorMessage);
  } finally {
    setSaving(false);
  }
};

  // end handle submit
  const savePayment = async payload => {
    try {
    return await post("/Payment/Add", {
      ...payload,
      amount: payload.advancePayment, // ✅ map सही field
       advancePayment: payload.advancePayment,
      iS_Advance: true                // ✅ mark as advance
    });
  } 
    catch (error) {
      throw (
        error?.response?.data?.message ||
        error?.message ||
        "Advance adjustment failed"
      );
    }
  };
  /// new add from chatGPT
const getPendingFromList = async (invoiceId) => {
  try {
    const response = await get(`/Invoice/PendingPayment?start=0&length=100`);

    if (response?.isSuccess) {
      const list = response.data.data;

      const selected = list.find(i => i.invoiceId === invoiceId);

      return selected?.pendingAmount || 0;
    }
  } catch (e) {
    console.log(e);
  }

  return 0;
};

const handleInvoiceChange = async (e) => {
  const invoiceId = Number(e.target.value);

  setForm(prev => ({
    ...prev,
    invoiceId
  }));

  const pending = await getPendingFromList(invoiceId);

  setForm(prev => ({
    ...prev,
    pendingAmount: pending
  }));
};

////
  const handleClientChange = (e) => {
    setForm((prev) => ({ ...prev, clientId: Number(e.target.value), invoiceId: 0 }));
  };
  // const handleInvoiceChange = (e) => {
  //   setForm((prev) => ({ ...prev, invoiceId: Number(e.target.value) }));
  // };
  const handlePaymentModeChange = (option) => {
    setSelectedPaymentMode(option);
    setForm(prev => ({ ...prev, paymentMode: option ? option.value : "" }));
  };

  return (
    <Card className="mb-4 app-form-card">
      <CardHeader className="bg-white d-flex align-items-center justify-content-between">
        <h5 className="mb-0">Adjust Advance Payment</h5>
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
              <Label>Invoice Amount</Label>
              <Input
                type="text"
                value={form.pendingAmount || ''}
                readOnly
                disabled
              />
            </Col>
            <Col md={6}>
              <Label for="advancePayment">Advance Payment<span style={{ color: 'red' }}>*</span></Label>
              <Input
                type="number"
                name="advancePayment"
                id="advancePayment"
                value={form.advancePayment}
                onChange={handleChange}
                required
                min={0}
              />
              <small style={{ color: "rgb(24, 151, 234)", display: "block", marginTop: 4 }}>
  Advance Amount: {form.originalAdvanceAmount || 0}
</small>
            </Col>
             <Col md={6}>
              <Label for="paymentDate">Payment Date<span style={{ color: 'red' }}>*</span></Label>
             <Input
  type="date"
  name="paymentDate"
  id="paymentDate"
  value={form.paymentDate}
  readOnly   // ✅ ADD THIS
  disabled   // ✅ optional (prevents click UI)
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
              <Label for="notes">Notes</Label>
              <Input
                type="textarea"
                name="notes"
                id="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
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

export default AdjustAdvancePayment;
