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

const CustomerForm = ({
  title,
  formData,
  formError,
  customerTypeOptions,
  salesmanOptions,
  isEditMode,
  saving,
  onChange,
  onCustomerTypeChange,
  onSalesmanChange,
  onSubmit,
  onClose,
}) => {
  const customerTypeSelectOptions = (customerTypeOptions || []).map(item => ({
    value: item.code ?? item.lov_Code,
    label: item.name ?? item.lov_Desc,
  }))

  const selectedCustomerType = customerTypeSelectOptions.find(option => option.value === formData.customerType) || null

  const salesmanSelectOptions = (salesmanOptions || []).map(item => ({
    value: item.id ?? item.value ?? item.code,
    label: item.name ?? item.label ?? item.lov_Desc,
  }))

  const selectedSalesman = salesmanSelectOptions.find(option => option.value === formData.assignedSalesman) || null

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
              <Label>Customer Name<span style={{ color: "red" }}>*</span></Label>
              <Input
                name="name"
                value={formData.name}
                onChange={onChange}
                placeholder="Enter customer name"
              />
            </Col>
            <Col md={6}>
              <Label>Owner Name<span style={{ color: "red" }}>*</span></Label>
              <Input
                name="ownerName"
                value={formData.ownerName}
                onChange={onChange}
                placeholder="Enter owner name"
              />
            </Col>
            <Col md={6}>
              <Label>Phone No<span style={{ color: "red" }}>*</span></Label>
              <Input
                name="phone"
                type="tel"
                pattern="[0-9]*"
                inputMode="numeric"
                value={formData.phone}
                onChange={e => {
                  const value = e.target.value.replace(/[^0-9]/g, "")
                  onChange({
                    target: {
                      name: "phone",
                      value,
                    }
                  })
                }}
                placeholder="Enter phone number"
                maxLength={10}
              />
            </Col>
            <Col md={6}>
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={onChange}
                placeholder="Enter email"
              />
            </Col>
            <Col md={6}>
              <Label>GST Number</Label>
              <Input
                name="gstNumber"
                value={formData.gstNumber}
                onChange={onChange}
                placeholder="Enter GST number"
              />
            </Col>
            <Col md={6}>
              <Label>Customer Type</Label>
              <Select
                classNamePrefix="select2-selection"
                placeholder="Select customer type"
                options={customerTypeSelectOptions}
                value={selectedCustomerType}
                onChange={onCustomerTypeChange}
                isSearchable
                isClearable
              />
            </Col>
            <Col md={12}>
              <Label>Address Line</Label>
              <Input
                type="textarea"
                name="addressLine"
                value={formData.addressLine}
                onChange={onChange}
                placeholder="Enter address"
              />
            </Col>
            <Col md={6}>
              <Label>Area</Label>
              <Input
                name="area"
                value={formData.area}
                onChange={onChange}
                placeholder="Enter area"
              />
            </Col>
            <Col md={6}>
              <Label>City</Label>
              <Input
                name="city"
                value={formData.city}
                onChange={onChange}
                placeholder="Enter city"
              />
            </Col>
            <Col md={6}>
              <Label>State</Label>
              <Input
                name="state"
                value={formData.state}
                onChange={onChange}
                placeholder="Enter state"
              />
            </Col>
            <Col md={6}>
              <Label>Pincode</Label>
              <Input
                name="pincode"
                type="text"
                inputMode="numeric"
                value={formData.pincode || ""}
                onChange={e => {
                  const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6)
                  onChange({
                    target: {
                      name: "pincode",
                      value,
                    }
                  })
                }}
                placeholder="Enter 6-digit pincode"
                maxLength={6}
              />
            </Col>
            <Col md={6}>
              <Label>Credit Limit</Label>
              <Input
                name="creditLimit"
                type="text"
                inputMode="decimal"
                value={formData.creditLimit || 1000}
                onChange={e => {
                  const value = e.target.value.replace(/[^0-9.]/g, "")
                  const parts = value.split(".")
                  const formatted = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : value
                  onChange({
                    target: {
                      name: "creditLimit",
                      value: formatted,
                    }
                  })
                }}
                placeholder="Enter credit limit"
              />
            </Col>
            <Col md={6}>
              <Label>Credit Days</Label>
              <Input
                name="creditDays"
                type="text"
                inputMode="numeric"
                value={formData.creditDays || ""}
                onChange={e => {
                  const value = e.target.value.replace(/[^0-9]/g, "")
                  onChange({
                    target: {
                      name: "creditDays",
                      value,
                    }
                  })
                }}
                placeholder="Enter credit days"
              />
            </Col>
            <Col md={6}>
              <Label>Assigned Salesman</Label>
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

export default CustomerForm
