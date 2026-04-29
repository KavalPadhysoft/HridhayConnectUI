 import React, { useEffect, useState } from "react";
import { Button, Card, CardBody, CardHeader, Col, Form, Input, Label, Row, Spinner, Alert } from "reactstrap";
import { get, post } from "../../helpers/api_helper";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

const PaymentFollowUpForm = ({ invoiceId, followUpId, dueDaysList }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: followUpId || 0,
    invoiceId: invoiceId || 0,
    dueDate: "",
    nextFollowUpDate: "",
    status: "",
    remark: "",
    dueDays: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
  const fetchInvoiceData = async () => {
    if (!invoiceId || followUpId > 0) return; // only for ADD mode

    try {
      const res = await get(`/Invoice/GetById?id=${invoiceId}`);

      if (res?.isSuccess && res.data) {
        const data = res.data;

        setFormData(prev => ({
          ...prev,
          dueDate: data.dueDate
            ? data.dueDate.split("T")[0]
            : "",
          dueDays: data.dueDays || "",
        }));
      }
    } catch (err) {
      console.error("Failed to fetch invoice data", err);
    }
  };

  fetchInvoiceData();
}, [invoiceId, followUpId]);


  useEffect(() => {
    if (followUpId > 0) {
      setLoading(true);
      get(`/PaymentFollowUp/GetById?id=${followUpId}`)
        .then(response => {
          if (response?.isSuccess && response?.statusCode === 1) {
            setFormData({
              id: response.data.id,
              invoiceId: response.data.invoiceId,
              dueDate: response.data.dueDate?.slice(0, 16),
              nextFollowUpDate: response.data.nextFollowUpDate?.slice(0, 16),
              status: response.data.status,
              remark: response.data.remark,
              dueDays: response.data.dueDays || "",
            });
          } else {
            setError(response?.message || "Failed to load follow-up");
          }
        })
        .catch(() => setError("Failed to load follow-up"))
        .finally(() => setLoading(false));
    }
  }, [followUpId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const dueDaysSelectOptions = (dueDaysList || []).map(item => ({
    value: item.name,
    label: `${item.name} Days`,
  }));
  const selectedDueDays = dueDaysSelectOptions.find(option => String(option.value) === String(formData.dueDays)) || null;

  const onDueDaysChange = (option) => {
    setFormData(prev => ({ ...prev, dueDays: option ? option.value : "" }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...formData,
        invoiceId: invoiceId,
      };
      const response = await post("/PaymentFollowUp/Add", payload);
      if (response?.statusCode === 1) {
        navigate(`/PaymentFollowUp?invoiceId=${invoiceId}`);
        return;
      }
      throw new Error(response?.message || "Failed to save follow-up");
    } catch (err) {
      setError(err?.message || err || "Failed to save follow-up");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="mb-4 app-form-card">
      <CardHeader className="bg-white d-flex align-items-center justify-content-between">
        <h5 className="mb-0">{followUpId > 0 ? "Edit" : "Add"} Payment Follow Up</h5>
        {/* <Button color="link" className="p-0" type="button" onClick={() => navigate(`/PaymentFollowUp?invoiceId=${invoiceId}`)}>
          Close
        </Button> */}
            <Button color="secondary" type="button" onClick={() => navigate(`/PaymentFollowUp?invoiceId=${invoiceId}`)}>
                            <i className="mdi mdi-arrow-left me-1" />Back
                          </Button>
      </CardHeader>
      <CardBody className="app-form-body">
        {error && <Alert color="danger">{error}</Alert>}
        {loading ? (
          <div className="text-center py-5">
            <Spinner color="primary" />
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              {/* <Col md={6}>
                <Label>Due Date<span style={{ color: "red" }}>*</span></Label>
                <Input
                  type="date"
                  name="dueDate"
                     min={(() => { const d = new Date(); d.setDate(d.getDate()); return d.toISOString().split('T')[0]; })()}
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                />
              </Col> */}
              <Col md={6}>
                <Label>Next FollowUp Date<span style={{ color: "red" }}>*</span></Label>
                <Input
                  type="date"
                  name="nextFollowUpDate"
                   min={(() => { const d = new Date(); d.setDate(d.getDate()); return d.toISOString().split('T')[0]; })()}
                  value={formData.nextFollowUpDate}
                  onChange={handleChange}
                  required
                />
              </Col>
              <Col md={6}>
                <Label>Due Days</Label>
                <Select
                  classNamePrefix="select2-selection"
                  placeholder="Select due days"
                  options={dueDaysSelectOptions}
                  value={selectedDueDays}
                  onChange={onDueDaysChange}
                  isSearchable
                  isClearable
                />
              </Col>
              {/* <Col md={6}>
                <Label>Status<span style={{ color: "red" }}>*</span></Label>
                <Input
                  type="text"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  placeholder="Enter status"
                  style={{ width: "100%" }}
                />
              </Col> */}
              <Col md={6}>
                <Label>Remark<span style={{ color: "red" }}>*</span></Label>
                <Input
                  type="text"
                  name="remark"
                  value={formData.remark}
                  onChange={handleChange}
                  placeholder="Enter remark"
                />
              </Col>
            </Row>
            <div className="app-form-actions mt-4 d-flex justify-content-end">
              <Button color="light" type="button" className="me-2" onClick={() => navigate(`/PaymentFollowUp?invoiceId=${invoiceId}`)} disabled={saving}>
                Cancel
              </Button>
              <Button color="success" type="submit" disabled={saving}>
                {saving ? <Spinner size="sm" className="me-2" /> : null}
                Save
              </Button>
            </div>
          </Form>
        )}
      </CardBody>
    </Card>
  );
};

export default PaymentFollowUpForm;
