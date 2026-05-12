import React, { useEffect, useMemo, useState } from "react"
import { DASHBOARD_NAME } from "../../config"
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap"
import { MDBDataTable } from "mdbreact"
import { connect } from "react-redux"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { buildServerSortColumns, getNextSortState, withAutoSrColumn } from "../../common/common"

import { setBreadcrumbItems } from "../../store/actions"
import { deleteCustomerById, getCustomerById, getCustomersPages, getLovDetailsByColumn, saveCustomer, getCustomerTypeList, getAssignSaleList } from "../../helpers/fakebackend_helper"
import { get } from "../../helpers/api_helper"
import { showConfirm, showError, showSuccess } from "../../Pop_show/alertService"
import CustomerForm from "./CustomerForm"

const CUSTOMER_LIST_SORT_COLUMN = "customerName"
const CUSTOMER_LIST_SORT_DIR = "asc"

const Customers = props => {
  document.title = `Customer | ${DASHBOARD_NAME}`
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const customerId = Number(params.id || 0)
  const isFormPage = location.pathname.startsWith("/Customers/manage")
  const isEditMode = isFormPage && customerId > 0

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(0)
  const [error, setError] = useState("")
  const [formError, setFormError] = useState("")
  const [customerTypeOptions, setCustomerTypeOptions] = useState([])
  const [salesmanOptions, setSalesmanOptions] = useState([])
  const [rows, setRows] = useState([])
  const [sortColumn, setSortColumn] = useState(CUSTOMER_LIST_SORT_COLUMN)
  const [sortColumnDir, setSortColumnDir] = useState(CUSTOMER_LIST_SORT_DIR)
  const [formTitle, setFormTitle] = useState(isEditMode ? "Edit Customer" : "Create Customer")
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    ownerName: "",
    phone: "",
    email: "",
    gstNumber: "",
    customerType: "",
    addressLine: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    creditLimit: 1000,
    creditDays: "",
    assignedSalesman: "",
    isDeleted: false,
  })

  const breadcrumbItems = [
    { title: "Lexa", link: "#" },
    { title: "Customer", link: "#" },
  ]

  const loadCustomers = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await getCustomersPages({
        start: 0,
        length: 10,
        sortColumn,
        sortColumnDir,
      })

      if (!(response?.isSuccess && response?.statusCode === 1)) {
        throw new Error(response?.message || "Failed to load customers")
      }

      const list = response?.data?.data || []
      setRows(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err?.message || err || "Failed to load customers")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    props.setBreadcrumbItems("Customer")
  }, [])
  
  useEffect(() => {
    if (!isFormPage) {
      loadCustomers()
    }
  }, [isFormPage, sortColumn, sortColumnDir])

  // Reset form when switching from edit to create mode
  useEffect(() => {
    if (!isEditMode && isFormPage) {
      setFormTitle("Create Customer")
      setFormData({
        id: 0,
        name: "",
        ownerName: "",
        phone: "",
        email: "",
        gstNumber: "",
        customerType: "",
        addressLine: "",
        area: "",
        city: "",
        state: "",
        pincode: "",
        creditLimit: 1000,
        creditDays: "",
        assignedSalesman: "",
        isDeleted: false,
      })
    }
  }, [isFormPage, isEditMode])

  // Load form data (dropdowns) and customer data for edit mode or reset for create mode
  useEffect(() => {
    const loadData = async () => {
      if (!isFormPage) {
        return
      }

      setFormError("")

      try {
        // Load dropdown options
        const [customerTypeRes, assignSaleRes] = await Promise.all([
          getCustomerTypeList(),
          getAssignSaleList(),
        ])

        // Handle CustomerType response
        if (customerTypeRes?.isSuccess && customerTypeRes?.statusCode === 1) {
          const customerTypeData = customerTypeRes?.data || []
          setCustomerTypeOptions(customerTypeData)
        } else if (customerTypeRes?.data) {
          const customerTypeData = customerTypeRes.data || []
          setCustomerTypeOptions(customerTypeData)
        } else if (Array.isArray(customerTypeRes)) {
          setCustomerTypeOptions(customerTypeRes)
        }

        // Handle AssignSale response
        if (assignSaleRes?.isSuccess && assignSaleRes?.statusCode === 1) {
          const assignSaleData = assignSaleRes?.data || []
          setSalesmanOptions(assignSaleData)
        } else if (assignSaleRes?.data) {
          const assignSaleData = assignSaleRes.data || []
          setSalesmanOptions(assignSaleData)
        } else if (Array.isArray(assignSaleRes)) {
          setSalesmanOptions(assignSaleRes)
        }

        if (!isEditMode) {
          setFormTitle("Create Customer")
          setFormData({
            id: 0,
            name: "",
            ownerName: "",
            phone: "",
            email: "",
            gstNumber: "",
            customerType: "",
            addressLine: "",
            area: "",
            city: "",
            state: "",
            pincode: "",
            creditLimit: 1000,
            creditDays: "",
            assignedSalesman: "",
            isDeleted: false,
          })
          return
        }

        setLoading(true)
        const response = await getCustomerById(customerId)
        if (!(response?.isSuccess && response?.statusCode === 1)) {
          throw new Error(response?.message || "Failed to load customer")
        }

        const customer = response?.data || {}
        setFormTitle("Edit Customer")
        setFormData({
          id: customer.id || 0,
          name: customer.customerName || customer.name || "",
          ownerName: customer.ownerName || "",
          phone: customer.phoneNo || customer.phone || "",
          email: customer.email || "",
          gstNumber: customer.gstNumber || "",
          customerType: customer.customerType || "",
          addressLine: customer.addressLine || "",
          area: customer.area || "",
          city: customer.city || "",
          state: customer.state || "",
          pincode: customer.pincode || "",
          creditLimit: customer.creditLimit || 1000,
          creditDays: customer.creditDays || "",
          assignedSalesman: customer.assignedSalesman || customer.salesmanId || "",
          isDeleted: Boolean(customer.isDeleted),
        })
      } catch (err) {
        setFormError(err?.message || err || "Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isFormPage, isEditMode, customerId])

  const handleSortChange = fieldName => {
    const nextState = getNextSortState(sortColumn, sortColumnDir, fieldName)
    setSortColumn(nextState.sortColumn)
    setSortColumnDir(nextState.sortColumnDir)
  }

  const data = useMemo(() => {
    return withAutoSrColumn({
      columns: buildServerSortColumns({
        columns: [
          { label: "Shop Name", field: "name", sort: "asc" },
          { label: "Phone No", field: "phone", sort: "asc" },
          { label: "Location", field: "location", sort: "asc" },
          { label: "Action", field: "action", sort: "disabled" },
        ],
        onSort: handleSortChange,
        activeSortColumn: sortColumn,
        sortColumnDir,
      }),
      rows: rows.map(item => ({
        id: item.id,
        name: item.name || "",
        phone: item.phone || "",
        location: item.location || "",
        action: (
          <div className="d-flex gap-2 justify-content-center">
            <Button
              color="link"
              className="p-0 text-primary"
              title="Edit"
              type="button"
              onClick={() => navigate(`/Customers/manage/${item.id}`)}
            >
              <i className="mdi mdi-pencil font-size-18" />
            </Button>
            <Button
              color="link"
              className="p-0 text-danger"
              title="Delete"
              type="button"
              disabled={deletingId === item.id}
              onClick={() => handleDelete(item.id)}
            >
              {deletingId === item.id ? (
                <Spinner size="sm" />
              ) : (
                <i className="mdi mdi-trash-can-outline font-size-18" />
              )}
            </Button>
          </div>
        ),
      })),
    })
  }, [rows, sortColumn, sortColumnDir])

  const handleChange = event => {
    const { name, value, type, checked } = event.target
    setFormData(previous => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleCustomerTypeChange = option => {
    setFormData(previous => ({
      ...previous,
      customerType: option?.value ?? "",
    }))
  }

  const handleSalesmanChange = option => {
    setFormData(previous => ({
      ...previous,
      assignedSalesman: option?.value ?? "",
    }))
  }

  const handleDelete = async id => {
    const isConfirmed = await showConfirm("Are you sure you want to delete this customer?", "Delete", "Cancel")
    if (!isConfirmed) {
      return
    }

    setDeletingId(id)
    try {
      const response = await deleteCustomerById(id)
      if (response?.statusCode === 1) {
        await showSuccess(response?.message || "Customer deleted successfully")
        await loadCustomers()
        return
      }

      throw new Error(response?.message || "Failed to delete customer")
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to delete customer"
      await showError(errorMessage)
    } finally {
      setDeletingId(0)
    }
  }

  const handleSubmit = async event => {
    event.preventDefault()
    setFormError("")
    setSaving(true)

    try {
      const payload = {
        name: formData.name,
        ownerName: formData.ownerName,
        phone: formData.phone,
        email: formData.email,
        gstNumber: formData.gstNumber || null,
        customerType: formData.customerType || null,
        addressLine: formData.addressLine || null,
        area: formData.area || null,
        city: formData.city || null,
        state: formData.state || null,
        pincode: Number(formData.pincode) || null,
        creditLimit: Number(formData.creditLimit) || 1000,
        creditDays: Number(formData.creditDays) || null,
        assignedSalesman: formData.assignedSalesman || null,
      }

      if (isEditMode) {
        payload.id = Number(formData.id) || customerId
      }

      const response = await saveCustomer(payload)
      if (response?.statusCode === 1) {
        await showSuccess(response?.message || "Customer saved successfully")
        navigate("/Customers")
        return
      }

      throw new Error(response?.message || "Failed to save customer")
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to save customer"
      await showError(errorMessage)
      setFormError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (isFormPage) {
    return (
      <CustomerForm
        title={formTitle}
        formData={formData}
        customerTypeOptions={customerTypeOptions}
        salesmanOptions={salesmanOptions}
        isEditMode={isEditMode}
        saving={saving}
        formError={formError}
        onChange={handleChange}
        onCustomerTypeChange={handleCustomerTypeChange}
        onSalesmanChange={handleSalesmanChange}
        onSubmit={handleSubmit}
        onClose={() => navigate("/Customers")}
      />
    )
  }

  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-end mb-3">
          <Button color="primary" type="button" onClick={() => navigate("/Customers/manage")}>
            <i className="mdi mdi-plus me-1" />Add Customer
          </Button>
        </div>
        {error ? <Alert color="danger">{error}</Alert> : null}
        {loading ? (
          <div className="text-center py-5">
            <Spinner color="primary" />
          </div>
        ) : (
          <MDBDataTable className="table-auto-sr" striped bordered small noBottomColumns data={data} />
        )}
      </CardBody>
    </Card>
  )
}

export default connect(null, { setBreadcrumbItems })(Customers)
