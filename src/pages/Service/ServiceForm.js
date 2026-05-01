import React from "react"
import { Alert, Button, Card, CardBody, CardHeader, Col, Form, Input, Label, Row, Spinner } from "reactstrap"

const ServiceForm = ({
  title,
  formError,
  formData,
  isEditMode,
  saving,
  onChange,
  onSubmit,
  onClose,
}) => {
  return (
    <Card className="mb-4 app-form-card">
      <CardHeader className="bg-white d--flex align--items-center justify-content--between">
        <h5 className="mb-0">{title}</h5>
        {/* <Button color="link" className="p-0" type="button" onClick={onClose} style={{ color: '#6c63ff', fontWeight: 500 }}>
          Close
        </Button> */}
<div style={{ display: "flex", justifyContent: "flex-end" }}>
  <Button color="secondary" type="button" onClick={onClose}>
    <i className="mdi mdi-arrow-left me-1" /> Back
  </Button>
</div>
      </CardHeader>
      <CardBody className="app-form-body">
        {formError ? <Alert color="danger">{formError}</Alert> : null}
        <Form onSubmit={onSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Label>Service Name<span style={{ color: "red" }}>*</span></Label>
              <Input
                name="serviceName"
                value={formData.serviceName}
                onChange={onChange}
                placeholder="Enter service name"
                maxLength={100}
                onKeyDown={(e) => {
                  const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", " "];
                  if (!/[a-zA-Z0-9 ]/.test(e.key) && !allowedKeys.includes(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </Col>
<Col md={6}>
              <Label>DefaultPrice<span style={{ color: "red" }}>*</span></Label>
              <Input
                name="defaultPrice"
                value={formData.defaultPrice}
                onChange={onChange}
                placeholder="Enter Default Price"
                maxLength={14}
                 onKeyDown={(e) => {
        const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Tab", "."];
        const value = e.target.value;
        const parts = value.split('.');
        const decimalPart = parts[1] || '';
        const cursorPos = e.target.selectionStart;
        const dotIndex = value.indexOf('.');

        if (e.key === '.' && value.includes('.')) {
          e.preventDefault();
          return;
        }
        if (decimalPart.length >= 2 && /[0-9]/.test(e.key)) {
          if (dotIndex === -1 || cursorPos <= dotIndex) {
          } else {
            e.preventDefault();
            return;
          }
        }
      if (!/[0-9.]/.test(e.key) && !allowedKeys.includes(e.key)) {
        e.preventDefault();
      }
    }}
    onBlur={(e) => {
      let val = e.target.value.trim();
      if (val === "" || val === ".") {
        onChange({ target: { name: "defaultPrice", value: "" } });
        return;
      }
      let num = parseFloat(val);
      if (isNaN(num)) {
        onChange({ target: { name: "defaultPrice", value: "" } });
        return;
      }
      if (num > 9999999999.99) {
        num = 9999999999.99;
      }
      if (num < 0) {
        num = 0;
      }
      num = Math.round(num * 100) / 100;
      onChange({ target: { name: "defaultPrice", value: num.toString() } });
    }}
              />
            </Col>
            <Col md={6}>
              <Label>Description</Label>
              <Input
                type="textarea"
                name="description"
                value={formData.description}
                onChange={onChange}
                placeholder="Enter description"
                rows={3}
                 maxLength={100}
              />
            </Col>
          </Row>
          <div className="app-form-actions d--flex justify-content-center mt-4">
            <Button color="light" type="button" onClick={onClose} style={{ minWidth: 120, marginRight: 16 }}>
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
  )
}

export default ServiceForm