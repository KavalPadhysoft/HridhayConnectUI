import React from "react"
import Select from "react-select"
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  Input,
  Label,
  Row,
  Spinner,
} from "reactstrap"

const PaymentCollectionForm = ({
  title,
  formData,
  formError,
  customerOptions,
  paymentModeOptions,
  salesmanOptions,
  isEditMode,
  saving,
  onChange,
  onCustomerChange,
  onPaymentModeChange,
  onSalesmanChange,
  onSubmit,
  onClose,
}) => {
  const customerSelectOptions = (customerOptions || []).map(item => ({
    value: item.id ?? item.code,
    label: item.name ?? item.customerName ?? item.label,
  }))

  const selectedCustomer = customerSelectOptions.find(option => option.value === formData.customerId) || null

  const paymentModeSelectOptions = (paymentModeOptions || []).map(item => ({
    value: item.code,
    label: item.name,
  }))

  const selectedPaymentMode = paymentModeSelectOptions.find(option => option.value === formData.paymentMode) || null

  const salesmanSelectOptions = (salesmanOptions || []).map(item => ({
    value: item.id ?? item.value ?? item.code,
    label: item.name ?? item.salesmanName ?? item.label,
  }))

  const selectedSalesman = salesmanSelectOptions.find(option => option.value === formData.collected_By) || null

  return (
    <Card className="mb-4 app-form-card">
      <CardHeader className="bg-white d-flex align-items-center justify-content-between">
        <h5 className="mb-0">{title}</h5>
        <Button color="secondary" type="button" onClick={onClose}>
          <i className="mdi mdi-arrow-left me-1" />Back
        </Button>
      </CardHeader>
      <CardBody className="app-form-body">
        {formError ? <Alert color="danger">{formError}</Alert> : null}
        <Form onSubmit={onSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Label>Shop Name<span style={{ color: "red" }}>*</span></Label>
              <Select
                classNamePrefix="select2-selection"
                placeholder="Select customer"
                options={customerSelectOptions}
                value={selectedCustomer}
                onChange={onCustomerChange}
                isSearchable
                isClearable
              />
            </Col>
            <Col md={6}>
              <Label>Payment Date<span style={{ color: "red" }}>*</span></Label>
              <Input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={onChange}
              />
            </Col>
            <Col md={6}>
              <Label>Amount<span style={{ color: "red" }}>*</span></Label>
              <Input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={onChange}
                step="0.01"
                min="0"
                placeholder="Enter amount"
              />
            </Col>
            <Col md={6}>
              <Label>Payment Mode<span style={{ color: "red" }}>*</span></Label>
              <Select
                classNamePrefix="select2-selection"
                placeholder="Select payment mode"
                options={paymentModeSelectOptions}
                value={selectedPaymentMode}
                onChange={onPaymentModeChange}
                isSearchable
                isClearable
              />
            </Col>
            <Col md={6}>
              <Label>Reference No</Label>
              <Input
                type="text"
                name="referenceNo"
                value={formData.referenceNo}
                onChange={onChange}
                placeholder="Enter reference number"
              />
            </Col>
            <Col md={6}>
              <Label>Collected By</Label>
              <Select
                classNamePrefix="select2-selection"
                placeholder="Select salesman"
                options={salesmanSelectOptions || []}
                value={selectedSalesman}
                onChange={onSalesmanChange}
                isSearchable
                isClearable
              />
            </Col>
            <Col md={12}>
              <Label>Remarks</Label>
              <Input
                type="textarea"
                name="remarks"
                value={formData.remarks}
                onChange={onChange}
                rows={3}
                placeholder="Enter remarks"
              />
            </Col>
          </Row>

          <div className="app-form-actions">
            <Button color="success" type="submit" disabled={saving}>
              {saving ? <Spinner size="sm" className="me-2" /> : null}
              Save
            </Button>
            <Button color="light" type="button" onClick={onClose}>
              Cancel
            </Button>            
          </div>
        </Form>
      </CardBody>
    </Card>
  )
}

export default PaymentCollectionForm
