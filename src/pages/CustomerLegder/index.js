import React, { useEffect, useMemo, useState } from "react"
import { DASHBOARD_NAME } from "../../config"
import { Alert, Button, Card, CardBody, Col, Row, Spinner, Form, Label } from "reactstrap"
import { MDBDataTable } from "mdbreact"
import { connect } from "react-redux"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { buildServerSortColumns, getNextSortState, withAutoSrColumn } from "../../common/common"
import Select from "react-select"

import { setBreadcrumbItems } from "../../store/actions"
import { getCustomerList, getCustomerById } from "../../helpers/fakebackend_helper"
import { get } from "../../helpers/api_helper"

const CUSTOMER_LEDGER_SORT_COLUMN = "date"
const CUSTOMER_LEDGER_SORT_DIR = "asc"

const CustomerLegder = props => {
  document.title = `Customer Ledger | ${DASHBOARD_NAME}`
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const customerIdFromUrl = Number(params.id || 0)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [debug, setDebug] = useState({})
  const [rows, setRows] = useState([])
  const [sortColumn, setSortColumn] = useState(CUSTOMER_LEDGER_SORT_COLUMN)
  const [sortColumnDir, setSortColumnDir] = useState(CUSTOMER_LEDGER_SORT_DIR)
  const [customerOptions, setCustomerOptions] = useState([])
  const [selectedCustomerId, setSelectedCustomerId] = useState(customerIdFromUrl || 0)
  const [totalDebit, setTotalDebit] = useState(0)
  const [totalCredit, setTotalCredit] = useState(0)
  const [totalBalance, setTotalBalance] = useState(0)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const loadCustomers = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await getCustomerList()

      if (!(response?.isSuccess && response?.statusCode === 1)) {
        throw new Error(response?.message || "Failed to load customers")
      }

      const list = response?.data || []
      const formattedOptions = list.map(item => ({
        value: item.id,
        label: item.name || item.customerName || "",
      }))
      setCustomerOptions(formattedOptions)
      
      // Auto-select first customer if available and not already selected from URL
      if (formattedOptions.length > 0 && isInitialLoad && customerIdFromUrl === 0) {
        setSelectedCustomerId(formattedOptions[0].value)
        setIsInitialLoad(false)
      }
    } catch (err) {
      setError(err?.message || err || "Failed to load customers")
    } finally {
      setLoading(false)
    }
  }

  const loadCustomerLedger = async (customerId) => {
    if (!customerId) {
      setRows([])
      setTotalDebit(0)
      setTotalCredit(0)
      setTotalBalance(0)
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await get(`/CustomerLedger/CustomerLedger`, {
        params: {
          start: 0,
          length: 1000,
          sortColumnDir: sortColumnDir,
          customerId: customerId,
        }
      })

      if (!(response?.isSuccess && response?.statusCode === 1)) {
        throw new Error(response?.message || "Failed to load customer ledger")
      }

      const list = response?.data?.data || []
      setRows(Array.isArray(list) ? list : [])

      // Calculate totals
      const debitSum = list.reduce((sum, item) => sum + (parseFloat(item.debit) || 0), 0)
      const creditSum = list.reduce((sum, item) => sum + (parseFloat(item.credit) || 0), 0)
      setTotalDebit(debitSum)
      setTotalCredit(creditSum)
      setTotalBalance(debitSum - creditSum)
    } catch (err) {
      setError(err?.message || err || "Failed to load customer ledger")
      setRows([])
      setTotalDebit(0)
      setTotalCredit(0)
      setTotalBalance(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    props.setBreadcrumbItems("Customer Ledger")
    console.log("CustomerLegder component mounted")
    console.log("Props received:", props)
    setDebug({ mounted: true, props: props })
  }, [])

  useEffect(() => {
    loadCustomers()
  }, [])

  useEffect(() => {
    if (selectedCustomerId) {
      loadCustomerLedger(selectedCustomerId)
    }
  }, [selectedCustomerId, sortColumn, sortColumnDir])

  const handleSortChange = (fieldName) => {
    const nextState = getNextSortState(sortColumn, sortColumnDir, fieldName)
    setSortColumn(nextState.sortColumn)
    setSortColumnDir(nextState.sortColumnDir)
  }



  const data = useMemo(() => {
    return withAutoSrColumn({
      columns: buildServerSortColumns({
        columns: [
          { label: "Date", field: "date", sort: "asc" },
          { label: "Reference", field: "referenceNo", sort: "asc" },
          { label: "Description", field: "description", sort: "asc" },
        { label: "Debit", field: "debit", sort: "asc", thClassName: "text-end", tdClassName: "text-end" },
        { label: "Credit", field: "credit", sort: "asc", thClassName: "text-end", tdClassName: "text-end" },
        { label: "Balance", field: "balance", sort: "asc", thClassName: "text-end", tdClassName: "text-end" },
        ],
        onSort: handleSortChange,
        activeSortColumn: sortColumn,
        sortColumnDir,
      }),
       rows: rows.map((item) => ({
         id: item.id,
         date: item.date ? new Date(item.date).toLocaleDateString() : "",
         referenceNo: item.referenceNo || "",
         description: item.description || "",
         debit: item.debit ? `₹ ${parseFloat(item.debit).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "₹ 0.00",
         credit: item.credit ? `₹ ${parseFloat(item.credit).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "₹ 0.00",
         balance: item.balance ? `₹ ${parseFloat(item.balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "₹ 0.00",
       })),
    })
  }, [rows, sortColumn, sortColumnDir])

  return (
    <>
      <style>{`
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
      `}</style>
       <Card>
        <CardBody>
                <style>{`
                    /* Force right alignment for debit, credit, balance columns using exact selectors */
                    #customer-ledger-table > div > div:nth-child(2) > div > div > table > thead > tr > th:nth-child(5),
                    #customer-ledger-table > div > div:nth-child(2) > div > div > table > thead > tr > th:nth-child(6),
                    #customer-ledger-table > div > div:nth-child(2) > div > div > table > thead > tr > th:nth-child(7) {
                        text-align: right !important;
                    }
                    #customer-ledger-table > div > div:nth-child(2) > div > div > table > tbody > tr > td:nth-child(5),
                    #customer-ledger-table > div > div:nth-child(2) > div > div > table > tbody > tr > td:nth-child(6),
                    #customer-ledger-table > div > div:nth-child(2) > div > div > table > tbody > tr > td:nth-child(7) {
                        text-align: right !important;
                    }
                    /* Override RTL-specific text-end for these specific elements */
                    #customer-ledger-table[dir="rtl"] > div > div:nth-child(2) > div > div > table > thead > tr > th:nth-child(5),
                    #customer-ledger-table[dir="rtl"] > div > div:nth-child(2) > div > div > table > thead > tr > th:nth-child(6),
                    #customer-ledger-table[dir="rtl"] > div > div:nth-child(2) > div > div > table > thead > tr > th:nth-child(7) {
                        text-align: right !important;
                    }
                    #customer-ledger-table[dir="rtl"] > div > div:nth-child(2) > div > div > table > tbody > tr > td:nth-child(5),
                    #customer-ledger-table[dir="rtl"] > div > div:nth-child(2) > div > div > table > tbody > tr > td:nth-child(6),
                    #customer-ledger-table[dir="rtl"] > div > div:nth-child(2) > div > div > table > tbody > tr > td:nth-child(7) {
                        text-align: right !important;
                    }
                `}</style>
             <Row className="mb-2 align-items-end g-1">
                <Col md={6} className="pe-2">
                  <Label for="customerSelect" className="mb-1">Select Customer</Label>
                 <Select
                   id="customerSelect"
                   options={customerOptions.map(option => ({ value: option.value, label: option.label }))}
                   value={selectedCustomerId ? customerOptions.find(opt => opt.value === selectedCustomerId) : null}
                   onChange={selectedOption => {
                     if (selectedOption) {
                       setSelectedCustomerId(selectedOption.value);
                     } else {
                       setSelectedCustomerId(0);
                     }
                   }}
                   placeholder="-- Select Customer --"
                   isClearable={false}
                   styles={{
                     control: (base) => ({
                       ...base,
                       minHeight: "34px",
                       fontSize: "13px",
                     }),
                     option: (base) => ({
                       ...base,
                       fontSize: "13px",
                     }),
                   }}
                 />
               </Col>
               <Col md={6} className="text-end ps-2">
                 {selectedCustomerId && (
                   <div className="d-flex justify-content-end gap-3">
                     <div className="text-center">
                       <p className="mb-1" style={{ fontSize: "11px", color: "#6c757d" }}>Total Debit</p>
                       <h4 className="mb-0" style={{ fontSize: "16px", fontWeight: "600", color: "#dc3545" }}>₹ {totalDebit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h4>
                     </div>
                     <div className="text-center">
                       <p className="mb-1" style={{ fontSize: "11px", color: "#6c757d" }}>Total Credit</p>
                       <h4 className="mb-0" style={{ fontSize: "16px", fontWeight: "600", color: "#28a745" }}>₹ {totalCredit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h4>
                     </div>
                     <div className="text-center">
                       <p className="mb-1" style={{ fontSize: "11px", color: "#6c757d" }}>Total Balance</p>
                       <h4 className="mb-0" style={{ fontSize: "16px", fontWeight: "600", color: "#007bff" }}>₹ {totalBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h4>
                     </div>
                   </div>
                 )}
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

export default connect(null, { setBreadcrumbItems })(CustomerLegder)