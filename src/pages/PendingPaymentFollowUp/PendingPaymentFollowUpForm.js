import React, { useEffect, useState } from "react";
import { Button, Card, CardBody, CardHeader, Col, Form, Input, Label, Row, Spinner, Alert } from "reactstrap";
import { get, post } from "../../helpers/api_helper";
import { useNavigate } from "react-router-dom";
const PendingPaymentFollowUpForm = ({ invoiceId, followUpId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: followUpId || 0,
    invoiceId: invoiceId || 0,
    dueDate: "",
  //  followUpDate: "",
    nextFollowUpDate: "",
    remark: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (followUpId > 0) {
      setLoading(true);
      get(`/PaymentFollowUp/GetById2?id=${followUpId}`)
        .then(response => {
          if (response?.isSuccess && response?.statusCode === 1) {
            setFormData({
              id: response.data.id,
              invoiceId: response.data.invoiceId,
              dueDate: response.data.dueDate ? response.data.dueDate.slice(0, 10) : "",
            //  followUpDate: response.data.followUpDate ? response.data.followUpDate.slice(0, 10) : "",
              nextFollowUpDate: response.data.nextFollowUpDate ? response.data.nextFollowUpDate.slice(0, 10) : "",
              remark: response.data.remark,
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

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...formData,
        invoiceId: invoiceId,
      };
      const response = await post("/PaymentFollowUp/Add2", payload);
      if (response?.statusCode === 1) {
        navigate(`/PendingPaymentFollowUp?invoiceId=${invoiceId}`);
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
        <h5 className="mb-0">{followUpId > 0 ? "Edit" : "Add"} Pending Payment Follow Up</h5>
        <div>
          <Button color="link" className="p-0" type="button" onClick={() => navigate(`/PendingPaymentFollowUp?invoiceId=${invoiceId}`)}>
            Close
          </Button>
        </div>
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
              <Col md={6}>
                <Label>Due Date<span style={{ color: "red" }}>*</span></Label>
                <Input
                   type="date"
                  name="dueDate"
                   min={(() => { const d = new Date(); d.setDate(d.getDate()); return d.toISOString().split('T')[0]; })()}
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                />
              </Col>
              {/* <Col md={6}>
                <Label>Follow Up Date<span style={{ color: "red" }}>*</span></Label>
                <Input
                  type="datetime-local"
                  name="followUpDate"
                  value={formData.followUpDate}
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
                 <div className="app-form-actions">
              <Button color="light" type="button" className="me-2" onClick={() => navigate(`/PendingPaymentFollowUp?invoiceId=${invoiceId}`)} disabled={saving}>
                Cancel
              </Button>
              <Button color="success" type="submit" disabled={saving}>
                {saving ? <Spinner size="sm" className="me-2" /> : null}
                Save
              </Button>
            </div>
            {/* <div className="app-form-actions">
                        <Button color="light" type="button" onClick={onClose}>
                          Cancel
                        </Button>
                        <Button color="success" type="submit" disabled={saving}>
                          {saving ? <Spinner size="sm" className="me-2" /> : null}
                          Save
                        </Button>
                      </div> */}
          </Form>
        )}
      </CardBody>
    </Card>
  );
};

export default PendingPaymentFollowUpForm;
