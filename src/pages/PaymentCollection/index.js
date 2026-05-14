import React, { useEffect, useMemo, useState } from "react"
import { DASHBOARD_NAME } from "../../config"
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap"
import { MDBDataTable } from "mdbreact"
import { connect } from "react-redux"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { buildServerSortColumns, getNextSortState, withAutoSrColumn } from "../../common/common"

import { setBreadcrumbItems } from "../../store/actions"
import { getPaymentCollectionsPages, getPaymentCollectionById, savePaymentCollection, getCustomerList, getPaymentModeList, getAssignSaleList } from "../../helpers/fakebackend_helper"
import { showConfirm, showError, showSuccess } from "../../Pop_show/alertService"
import PaymentCollectionForm from "./PaymentCollectionForm"

const widgetStyles = `
  .widget-card {
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
    height: 100%;
  }
  .widget-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  .widget-card-body {
    position: relative;
    z-index: 1;
  }
  .widget-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.2);
  }
`

const PAYMENT_COLLECTION_SORT_COLUMN = "paymentDate"
const PAYMENT_COLLECTION_SORT_DIR = "desc"

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const formatDateDDMMMYYYY = (dateStr) => {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  if (isNaN(d)) return ""
  const day = String(d.getDate()).padStart(2, "0")
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
}

const PaymentCollections = (props) => {
  document.title = `Payment Collection | ${DASHBOARD_NAME}`
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const paymentCollectionId = Number(params.id || 0)
  const isFormPage = location.pathname.startsWith("/PaymentCollection/manage")
  const isEditMode = isFormPage && paymentCollectionId > 0

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [formError, setFormError] = useState("")
  const [customerOptions, setCustomerOptions] = useState([])
  const [paymentModeOptions, setPaymentModeOptions] = useState([])
  const [salesmanOptions, setSalesmanOptions] = useState([])
  const [rows, setRows] = useState([])
  const [sortColumn, setSortColumn] = useState(PAYMENT_COLLECTION_SORT_COLUMN)
  const [sortColumnDir, setSortColumnDir] = useState(PAYMENT_COLLECTION_SORT_DIR)
  const [formTitle, setFormTitle] = useState(isEditMode ? "Edit Payment Collection" : "Create Payment Collection")
  const [formData, setFormData] = useState({
    id: 0,
    customerId: "",
    paymentDate: new Date().toISOString().split("T")[0],
    amount: "",
    paymentMode: "",
    referenceNo: "",
    collected_By: "",
    remarks: "",
  })

  const loadPaymentCollections = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await getPaymentCollectionsPages({
        start: 0,
        length: 1000,
        sortColumn,
        sortColumnDir,
      })

      if (!(response?.isSuccess && response?.statusCode === 1)) {
        throw new Error(response?.message || "Failed to load payment collections")
      }

      const list = response?.data?.data || []
      setRows(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err?.message || err || "Failed to load payment collections")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    props.setBreadcrumbItems("Payment Collection")
  }, [])

  useEffect(() => {
    if (!isFormPage) {
      loadPaymentCollections()
    }
  }, [isFormPage, sortColumn, sortColumnDir])

  useEffect(() => {
    if (!isEditMode && isFormPage) {
      setFormTitle("Create Payment Collection")
      setFormData({
        id: 0,
        customerId: "",
        paymentDate: new Date().toISOString().split("T")[0],
        amount: "",
        paymentMode: "",
        referenceNo: "",
        collected_By: "",
        remarks: "",
      })
    }
  }, [isFormPage, isEditMode])

  useEffect(() => {
    const loadData = async () => {
      if (!isFormPage) {
        return
      }

      setFormError("")

      try {
        const [customerRes, paymentModeRes, assignSaleRes] = await Promise.all([
          getCustomerList(),
          getPaymentModeList(),
          getAssignSaleList(),
        ])

        if (customerRes?.isSuccess && customerRes?.statusCode === 1) {
          const customerData = customerRes?.data || []
          setCustomerOptions(customerData)
        } else if (customerRes?.data) {
          setCustomerOptions(customerRes.data || [])
        } else if (Array.isArray(customerRes)) {
          setCustomerOptions(customerRes)
        }

        if (paymentModeRes?.isSuccess && paymentModeRes?.statusCode === 1) {
          const paymentModeData = paymentModeRes?.data || []
          setPaymentModeOptions(paymentModeData)
        } else if (paymentModeRes?.data) {
          setPaymentModeOptions(paymentModeRes.data || [])
        } else if (Array.isArray(paymentModeRes)) {
          setPaymentModeOptions(paymentModeRes)
        }

        if (assignSaleRes?.isSuccess && assignSaleRes?.statusCode === 1) {
          const assignSaleData = assignSaleRes?.data || []
          setSalesmanOptions(assignSaleData)
        } else if (assignSaleRes?.data) {
          setSalesmanOptions(assignSaleRes.data || [])
        } else if (Array.isArray(assignSaleRes)) {
          setSalesmanOptions(assignSaleRes)
        }

        if (!isEditMode) {
          setFormTitle("Create Payment Collection")
          setFormData({
            id: 0,
            customerId: "",
            paymentDate: new Date().toISOString().split("T")[0],
            amount: "",
            paymentMode: "",
            referenceNo: "",
            collected_By: "",
            remarks: "",
          })
          return
        }

        setLoading(true)
        const response = await getPaymentCollectionById(paymentCollectionId)
        if (!(response?.isSuccess && response?.statusCode === 1)) {
          throw new Error(response?.message || "Failed to load payment collection")
        }

        const payment = response?.data || {}
        setFormTitle("Edit Payment Collection")
        setFormData({
          id: payment.id || 0,
          customerId: payment.customerId || "",
          paymentDate: payment.paymentDate ? payment.paymentDate.split("T")[0] : new Date().toISOString().split("T")[0],
          amount: payment.amount || "",
          paymentMode: payment.paymentMode || "",
          referenceNo: payment.referenceNo || "",
          collected_By: payment.collected_By || "",
          remarks: payment.remarks || "",
        })
      } catch (err) {
        setFormError(err?.message || err || "Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isFormPage, isEditMode, paymentCollectionId])

  const handleSortChange = (fieldName) => {
    const nextState = getNextSortState(sortColumn, sortColumnDir, fieldName)
    setSortColumn(nextState.sortColumn)
    setSortColumnDir(nextState.sortColumnDir)
  }

  const totalCollected = rows.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
  const totalReceipts = rows.length

  const paymentModeSums = {}
  rows.forEach((item) => {
    const mode = item.paymentMode_Text || "Other"
    paymentModeSums[mode] = (paymentModeSums[mode] || 0) + (parseFloat(item.amount) || 0)
  })

  const data = useMemo(() => {
    return withAutoSrColumn({
      columns: buildServerSortColumns({
        columns: [
          { label: "Receipt No", field: "Payment_Receipt_No", sort: "asc" },
          { label: "Date", field: "paymentDate", sort: "asc" },
          { label: "Shop Name", field: "customerName", sort: "asc" },
          { label: "Mode", field: "paymentMode_Text", sort: "asc" },
          { label: "Reference", field: "referenceNo", sort: "asc" },
          { label: "Collected By", field: "collected_By_Text", sort: "asc" },
          { label: "Amount", field: "amount", sort: "asc" },
          { label: "Action", field: "action", sort: "disabled" },
        ],
        onSort: handleSortChange,
        activeSortColumn: sortColumn,
        sortColumnDir,
      }),
      rows: rows.map((item) => ({
        id: item.id,
        Payment_Receipt_No: item.payment_Receipt_No || "",
        paymentDate: formatDateDDMMMYYYY(item.paymentDate),
        customerName: item.customerName || "",
        paymentMode_Text: item.paymentMode_Text || "",
        referenceNo: item.referenceNo || "",
        collected_By_Text: item.collected_By_Text || "",
        amount: item.amount?.toLocaleString("en-IN") || "0",
        action: (
          <div className="d-flex gap-2 justify-content-center">
            <Button
              color="link"
              className="p-0 text-primary"
              title="Edit"
              type="button"
              onClick={() => navigate(`/PaymentCollection/manage/${item.id}`)}
            >
              <i className="mdi mdi-pencil font-size-18" />
            </Button>
          </div>
        ),
      })),
    })
  }, [rows, sortColumn, sortColumnDir, navigate])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleCustomerChange = (option) => {
    setFormData((previous) => ({
      ...previous,
      customerId: option?.value ?? "",
    }))
  }

  const handlePaymentModeChange = (option) => {
    setFormData((previous) => ({
      ...previous,
      paymentMode: option?.value ?? "",
    }))
  }

  const handleSalesmanChange = (option) => {
    setFormData((previous) => ({
      ...previous,
      collected_By: option?.value ?? "",
    }))
  }

const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError("")
    setSaving(true)

    try {
      const paymentDateValue = formData.paymentDate ? new Date(formData.paymentDate).toISOString() : new Date().toISOString()
      const amountValue = parseFloat(formData.amount) || 0
      
      const selectedCustomer = customerOptions.find(c => c.id === Number(formData.customerId))
      const selectedPaymentModeObj = paymentModeOptions.find(p => p.code === formData.paymentMode)
      const selectedSalesman = salesmanOptions.find(s => s.id === Number(formData.collected_By))

      const payload = {
        id: isEditMode ? Number(formData.id) || paymentCollectionId : 0,
        customerId: Number(formData.customerId) || 0,
        customerName: selectedCustomer?.name || "",
        collected_By: Number(formData.collected_By) || 0,
        collected_By_Text: selectedSalesman?.name || "",
        paymentDate: paymentDateValue,
        paymentMode: formData.paymentMode || "",
        paymentMode_Text: selectedPaymentModeObj?.name || "",
        referenceNo: formData.referenceNo || "",
        remarks: formData.remarks || "",
        amount: amountValue,
        total_Amount: amountValue,
      }

      console.log("Payload:", payload)

      const response = await savePaymentCollection(payload)
      if (response?.statusCode === 1) {
        await showSuccess(response?.message || "Payment collection saved successfully")
        navigate("/PaymentCollection")
        return
      }

      throw new Error(response?.message || "Failed to save payment collection")
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to save payment collection"
      await showError(errorMessage)
      setFormError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (isFormPage) {
    return (
      <PaymentCollectionForm
        title={formTitle}
        formData={formData}
        customerOptions={customerOptions}
        paymentModeOptions={paymentModeOptions}
        salesmanOptions={salesmanOptions}
        isEditMode={isEditMode}
        saving={saving}
        formError={formError}
        onChange={handleChange}
        onCustomerChange={handleCustomerChange}
        onPaymentModeChange={handlePaymentModeChange}
        onSalesmanChange={handleSalesmanChange}
        onSubmit={handleSubmit}
        onClose={() => navigate("/PaymentCollection")}
      />
    )
  }

  return (
    <>
      <style>{widgetStyles}</style>
      <Card>
        <CardBody>
        <div className="d-flex justify-content-end mb-3">
          <Button color="primary" type="button" onClick={() => navigate("/PaymentCollection/manage")}>
            <i className="mdi mdi-plus me-1" />Add New
          </Button>
        </div>
        <Row className="mb-3">
          <Col md={3}>
            <div className="widget-card" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
              <div className="widget-card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-white-50 mb-1" style={{ fontSize: "13px" }}>Total Collected</p>
                    <h4 className="text-white mb-0" style={{ fontSize: "22px", fontWeight: "600" }}>₹ {totalCollected.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h4>
                  </div>
                  <div className="widget-icon">
                    <i className="mdi mdi-currency-inr text-white" style={{ fontSize: "28px" }}></i>
                  </div>
                </div>
              </div>
            </div>
          </Col>
          <Col md={3}>
            <div className="widget-card" style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
              <div className="widget-card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-white-50 mb-1" style={{ fontSize: "13px" }}>Receipts</p>
                    <h4 className="text-white mb-0" style={{ fontSize: "22px", fontWeight: "600" }}>{totalReceipts}</h4>
                  </div>
                  <div className="widget-icon">
                    <i className="mdi mdi-receipt text-white" style={{ fontSize: "28px" }}></i>
                  </div>
                </div>
              </div>
            </div>
          </Col>
          <Col md={3}>
            <div className="widget-card" style={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" }}>
              <div className="widget-card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-white-50 mb-1" style={{ fontSize: "13px" }}>Cash</p>
                    <h4 className="text-white mb-0" style={{ fontSize: "22px", fontWeight: "600" }}>₹ {(paymentModeSums["Cash"] || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h4>
                  </div>
                  <div className="widget-icon">
                    <i className="mdi mdi-cash text-white" style={{ fontSize: "28px" }}></i>
                  </div>
                </div>
              </div>
            </div>
          </Col>
          <Col md={3}>
            <div className="widget-card" style={{ background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" }}>
              <div className="widget-card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-white-50 mb-1" style={{ fontSize: "13px" }}>UPI</p>
                    <h4 className="text-white mb-0" style={{ fontSize: "22px", fontWeight: "600" }}>₹ {(paymentModeSums["UPI"] || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h4>
                  </div>
                  <div className="widget-icon">
                    <i className="mdi mdi-contactless-payment text-white" style={{ fontSize: "28px" }}></i>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={3}>
            <div className="widget-card" style={{ background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" }}>
              <div className="widget-card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-dark-50 mb-1" style={{ fontSize: "13px" }}>Cheque</p>
                    <h4 className="text-dark mb-0" style={{ fontSize: "22px", fontWeight: "600" }}>₹ {(paymentModeSums["Cheque"] || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h4>
                  </div>
                  <div className="widget-icon">
                    <i className="mdi mdi-file-document-outline text-dark" style={{ fontSize: "28px" }}></i>
                  </div>
                </div>
              </div>
            </div>
          </Col>
          <Col md={3}>
            <div className="widget-card" style={{ background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)" }}>
              <div className="widget-card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-dark-50 mb-1" style={{ fontSize: "13px" }}>Bank Transfer</p>
                    <h4 className="text-dark mb-0" style={{ fontSize: "22px", fontWeight: "600" }}>₹ {(paymentModeSums["Bank Transfer"] || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h4>
                  </div>
                  <div className="widget-icon">
                    <i className="mdi mdi-bank text-dark" style={{ fontSize: "28px" }}></i>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
        {error ? <Alert color="danger">{error}</Alert> : null}
         {loading ? (
           <div className="text-center py-5">
             <Spinner color="primary" />
           </div>
         ) : (
           <>
             <MDBDataTable className="table-auto-sr" striped bordered small noBottomColumns data={data} />
           </>
         )}
      </CardBody>
    </Card>
    </>
  )
}

export default connect(null, { setBreadcrumbItems })(PaymentCollections)
