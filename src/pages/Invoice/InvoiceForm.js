import React from "react";
import { Alert, Button, Card, CardBody, CardHeader, Col, Form, Input, Label, Row, Spinner } from "reactstrap";
import Select from "react-select";

const InvoiceForm = ({
  title,
  formError,
  formData,
  isEditMode,
  saving,
  onChange,
  onSubmit,
  onClose,
  clientList = [], // <-- add clientList prop
  onClientChange, // optional callback for select
  statusList = [], // <-- add statusList prop
  onStatusChange, // optional callback for select
}) => {
  // Prepare options for react-select
  const clientSelectOptions = (clientList || []).map(client => ({
    value: client.id,
    label: client.name,
  }));
  const selectedClient = clientSelectOptions.find(option => Number(option.value) === Number(formData.clientId)) || null;

  // Status dropdown options
  const statusSelectOptions = (statusList || []).map(status => ({
    value: status.code,
    label: status.name,
  }));
  const selectedStatus = statusSelectOptions.find(option => String(option.value) === String(formData.status)) || null;

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
            <Col md={6}>
              <Label>Invoice Number<span style={{ color: "red" }}>*</span></Label>
              <Input
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={onChange}
                placeholder="Enter invoice number"
              />
            </Col>
            <Col md={6}>
              <Label>Select Client<span style={{ color: "red" }}>*</span></Label>
              <Select
                classNamePrefix="select2-selection"
                placeholder="Select client"
                options={clientSelectOptions}
                value={selectedClient}
                onChange={onClientChange}
                isSearchable
                isClearable
              />
            </Col>
            <Col md={6}>
              <Label>Invoice Date<span style={{ color: "red" }}>*</span></Label>
              <Input
                name="invoiceDate"
                value={formData.invoiceDate}
                onChange={onChange}
                placeholder="YYYY-MM-DD"
                type="date"
              />
            </Col>
            <Col md={6}>
              <Label>Due Date<span style={{ color: "red" }}>*</span></Label>
              <Input
                name="dueDate"
                value={formData.dueDate}
                onChange={onChange}
                placeholder="YYYY-MM-DD"
                type="date"
              />
            </Col>
            <Col md={6}>
              <Label>Sub Total</Label>
              <Input
                name="subTotal"
                value={formData.subTotal}
                onChange={onChange}
                placeholder="Enter sub total"
                type="number"
              />
            </Col>
            <Col md={6}>
              <Label>Discount</Label>
              <Input
                name="discount"
                value={formData.discount}
                onChange={onChange}
                placeholder="Enter discount"
                type="number"
              />
            </Col>
            <Col md={6}>
              <Label>Final Amount</Label>
              <Input
                name="finalAmount"
                value={formData.finalAmount}
                onChange={onChange}
                placeholder="Enter final amount"
                type="number"
              />
            </Col>
            <Col md={6}>
              <Label>Status<span style={{ color: "red" }}>*</span></Label>
              <Select
                classNamePrefix="select2-selection"
                placeholder="Select status"
                options={statusSelectOptions}
                value={selectedStatus}
                onChange={onStatusChange}
                isSearchable
                isClearable
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
          <div className="app-form-actions">
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

export default InvoiceForm;
