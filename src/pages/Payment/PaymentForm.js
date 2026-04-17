import React from "react";
import { Alert, Button, Card, CardBody, CardHeader, Col, Form, Input, Label, Row, Spinner } from "reactstrap";
import Select from "react-select";

const PaymentForm = ({
  title,
  formError,
  formData,
  isEditMode,
  saving,
  onChange,
  onSubmit,
  onClose,
  clientList = [],
  onClientChange,
  invoiceList = [],
  onInvoiceChange,
  paymentModeList = [],
  onPaymentModeChange,
}) => {
  const clientSelectOptions = (clientList || []).map(client => ({
    value: client.id,
    label: client.name,
  }));
  const selectedClient = clientSelectOptions.find(option => Number(option.value) === Number(formData.clientId)) || null;

  const invoiceSelectOptions = (invoiceList || []).map(inv => ({
    value: inv.id,
    label: inv.name,
  }));
  const selectedInvoice = invoiceSelectOptions.find(option => Number(option.value) === Number(formData.invoiceId)) || null;

  const paymentModeOptions = (paymentModeList || []).map(mode => ({
    value: mode.code || mode.value || mode.id,
    label: mode.name || mode.label,
  }));
  const selectedPaymentMode = paymentModeOptions.find(option => String(option.value) === String(formData.paymentMode)) || null;

  return (
    <Card className="mb-4 app-form-card">
      <CardHeader className="bg-white d-flex align-items-center justify-content-between">
        <h5 className="mb-0">{title}</h5>
        <Button color="link" className="p-0" type="button" onClick={onClose}>
          Close
        </Button>
      </CardHeader>
      <CardBody className="app-form-body">
        {formError ? <Alert color="danger">{formError}</Alert> : null}
        <Form onSubmit={onSubmit}>
          <Row className="g-3">
            <Col md={6} className="d-flex align-items-end">
              <div style={{ width: "100%" }}>
                <Label>Select Client<span style={{ color: "red" }}>*</span></Label>
                <Select
                  classNamePrefix="select2-selection"
                  placeholder="Select client"
                  options={clientSelectOptions}
                  value={selectedClient}
                  onChange={onClientChange}
                  isClearable
                  styles={{ container: base => ({ ...base, width: "100%" }) }}
                />
              </div>
            </Col>
            <Col md={6} className="d-flex align-items-end">
              <div style={{ width: "100%" }}>
                <Label>Select Invoice<span style={{ color: "red" }}>*</span></Label>
                <Select
                  classNamePrefix="select2-selection"
                  placeholder="Select invoice"
                  options={invoiceSelectOptions}
                  value={selectedInvoice}
                  onChange={onInvoiceChange}
                  isClearable
                  styles={{ container: base => ({ ...base, width: "100%" }) }}
                />
              </div>
            </Col>
            <Col md={6}>
              <Label>Payment Date<span style={{ color: "red" }}>*</span></Label>
              <Input
                name="paymentDate"
                type="date"
                value={formData.paymentDate ? formData.paymentDate.substring(0, 10) : ""}
                onChange={onChange}
                placeholder="YYYY-MM-DD"
              />
            </Col>
            <Col md={6}>
              <Label>Amount<span style={{ color: "red" }}>*</span></Label>
              <Input
                name="amount"
                type="number"
                value={formData.amount}
                onChange={onChange}
                placeholder="Enter amount"
              />
            </Col>
            <Col md={6}>
              <Label>Payment Mode<span style={{ color: "red" }}>*</span></Label>
              <Select
                classNamePrefix="select2-selection"
                placeholder="Select payment mode"
                options={paymentModeOptions}
                value={selectedPaymentMode}
                onChange={onPaymentModeChange}
                isClearable
                styles={{ container: base => ({ ...base, width: "100%" }) }}
              />
            </Col>
            <Col md={6}>
              <Label>Reference No</Label>
              <Input
                name="referenceNo"
                value={formData.referenceNo}
                onChange={onChange}
                placeholder="Enter reference number"
              />
            </Col>
            <Col md={12}>
              <Label>Notes</Label>
              <Input
                name="notes"
                value={formData.notes}
                onChange={onChange}
                placeholder="Enter notes"
              />
            </Col>
          </Row>
          <div className="app-form-actions mt-4">
            <Button color="light" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button color="success" type="submit" disabled={saving}>
              {saving ? <Spinner size="sm" className="me-2" /> : null}
              Save
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
};

export default PaymentForm;
