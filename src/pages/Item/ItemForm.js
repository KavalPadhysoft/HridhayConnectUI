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

const ItemForm = ({
  title,
  formData,
  formError,
  categoryOptions,
  unitOptions,
  packagingTypeOptions,
  isEditMode,
  saving,
  onChange,
  onCategoryChange,
  onUnitChange,
  onPackagingTypeChange,
  onSubmit,
  onClose,
}) => {
  const categorySelectOptions = (categoryOptions || []).map(item => ({
    value: item.id || item.value,
    label: item.name || item.categoryName || item.label,
  }))

  const selectedCategory = categorySelectOptions.find(option => option.value == formData.categoryId) || null

  const unitSelectOptions = (unitOptions || []).map(item => ({
    value: item.code || item.lov_Code || item.value,
    label: item.name || item.lov_Desc || item.label,
  }))

  const selectedUnit = unitSelectOptions.find(option => option.value == formData.unit) || null

  const packagingTypeSelectOptions = (packagingTypeOptions || []).map(item => ({
    value: item.code || item.lov_Code || item.value,
    label: item.name || item.lov_Desc || item.label,
  }))

  const selectedPackagingType = packagingTypeSelectOptions.find(option => option.value == formData.packagingType) || null

  const handleDecimalChange = (name, maxLength = 18, decimalPlaces = 2) => e => {
    const value = e.target.value
    const regex = new RegExp(`^\\d{0,${maxLength}}(\\.\\d{0,${decimalPlaces}})?$`)
    if (value === "" || regex.test(value)) {
      onChange({
        target: {
          name,
          value,
        }
      })
    }
  }

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
             <Label>Item Name<span style={{ color: "red" }}>*</span></Label>
             <Input
               name="itemName"
               value={formData.itemName}
               onChange={onChange}
               placeholder="Enter item name"
               
             />
           </Col>
           <Col md={6}>
             <Label>Packaging Type</Label>
              <Select
                classNamePrefix="select2-selection"
                placeholder="Select packaging type"
                options={packagingTypeSelectOptions}
                value={selectedPackagingType}
                onChange={onPackagingTypeChange}
                isSearchable
                isClearable
              />
           </Col>
            <Col md={6}>
              <Label>Category<span style={{ color: "red" }}>*</span></Label>
              <Select
                classNamePrefix="select2-selection"
                placeholder="Select category"
                options={categorySelectOptions}
                value={selectedCategory}
                onChange={onCategoryChange}
                isSearchable
                isClearable
              />
            </Col>
            <Col md={6}>
              <Label>Unit</Label>
              <Select
                classNamePrefix="select2-selection"
                placeholder="Select unit"
                options={unitSelectOptions}
                value={selectedUnit}
                onChange={onUnitChange}
                isSearchable
                isClearable
              />
            </Col>
            <Col md={6}>
              <Label>Tax Percent</Label>
              <Input
                name="taxPercent"
                type="text"
                inputMode="decimal"
                value={formData.taxPercent || ""}
                onChange={handleDecimalChange("taxPercent", 5, 2)}
                placeholder="Enter tax percent (e.g. 18.00)"
              />
            </Col>          
          </Row>
          <Row className="g-3 mt-1">
            <Col md={6}>
              <Label>Rate<span style={{ color: "red" }}>*</span></Label>
              <Input
                name="rate"
                type="text"
                inputMode="decimal"
                value={formData.rate || ""}
                onChange={handleDecimalChange("rate", 18, 2)}
                placeholder="Enter rate"
                
              />
            </Col>
            <Col md={6}>
              <Label>MRP</Label>
              <Input
                name="mrp"
                type="text"
                inputMode="decimal"
                value={formData.mrp || ""}
                onChange={handleDecimalChange("mrp", 18, 2)}
                placeholder="Enter MRP"
              />
            </Col>
              <Col md={12}>
              <Label>Description</Label>
              <Input
                type="textarea"
                name="description"
                value={formData.description}
                onChange={onChange}
                placeholder="Enter description"
              />
            </Col>
            <Col md={6}>
              <Label>Available for Sale</Label>
              <div className="d-flex align-items-center gap-2">
                <div
                  onClick={() => {
                    const newValue = !formData.isAvailableForSale
                    onChange({
                      target: {
                        name: "isAvailableForSale",
                        type: "checkbox",
                        checked: newValue,
                        value: newValue
                      }
                    })
                  }}
                  style={{
                    width: '50px',
                    height: '26px',
                    backgroundColor: formData.isAvailableForSale ? '#28a745' : '#dc3545',
                    borderRadius: '13px',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s'
                  }}
                >
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      position: 'absolute',
                      top: '2px',
                      left: formData.isAvailableForSale ? '26px' : '2px',
                      transition: 'left 0.3s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                    }}
                  />
                </div>
                <span>{formData.isAvailableForSale ? "Yes" : "No"}</span>
              </div>
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

export default ItemForm
