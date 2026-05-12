import React, { useEffect, useMemo, useState } from "react"
import { DASHBOARD_NAME } from "../../config"
import { Alert, Card, CardBody, Col, Row, Spinner } from "reactstrap"
import { MDBDataTable } from "mdbreact"
import { connect } from "react-redux"
import { buildServerSortColumns, getNextSortState, withAutoSrColumn } from "../../common/common"

import { setBreadcrumbItems } from "../../store/actions"
import { getAllOutstandingPayments } from "../../helpers/fakebackend_helper"

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

const OUTSTANDING_SORT_COLUMN = "customerName"
const OUTSTANDING_SORT_DIR = "asc"

const Outstanding = (props) => {
  document.title = `Outstanding Payment | ${DASHBOARD_NAME}`

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [rows, setRows] = useState([])
  const [sortColumn, setSortColumn] = useState(OUTSTANDING_SORT_COLUMN)
  const [sortColumnDir, setSortColumnDir] = useState(OUTSTANDING_SORT_DIR)

  const loadOutstandingPayments = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await getAllOutstandingPayments({
        start: 0,
        length: 1000,
        sortColumn,
        sortColumnDir,
      })

      if (!(response?.isSuccess && response?.statusCode === 1)) {
        throw new Error(response?.message || "Failed to load outstanding payments")
      }

      const list = response?.data?.data || []
      setRows(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err?.message || err || "Failed to load outstanding payments")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    props.setBreadcrumbItems("Outstanding Payment ")
  }, [])

  useEffect(() => {
    loadOutstandingPayments()
  }, [sortColumn, sortColumnDir])

  const handleSortChange = (fieldName) => {
    const nextState = getNextSortState(sortColumn, sortColumnDir, fieldName)
    setSortColumn(nextState.sortColumn)
    setSortColumnDir(nextState.sortColumnDir)
  }

  const totalDue = rows.reduce((sum, item) => sum + (parseFloat(item.total_Amount) || 0), 0)

  const data = useMemo(() => {
    return withAutoSrColumn({
         columns: buildServerSortColumns({
           columns: [
             { label: "Shop Name", field: "customerName", sort: "asc" },
             { label: "Total Amount", field: "total_Amount", sort: "asc", thClassName: "text-end", tdClassName: "text-end" },
           ],
        onSort: handleSortChange,
        activeSortColumn: sortColumn,
        sortColumnDir,
      }),
      rows: rows.map((item) => ({
        id: item.id,
        customerName: item.customerName || "",
        total_Amount: item.total_Amount ? `₹ ${parseFloat(item.total_Amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "₹ 0.00",
      })),
    })
  }, [rows, sortColumn, sortColumnDir])

  return (
    <>
      <style>{widgetStyles}</style>
      <Card>
       <CardBody>
           <Row className="mb-3">
             <Col md={3}>
               <div className="widget-card" style={{ background: "linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)", padding: "12px", maxWidth: "220px" }}>
                 <div className="widget-card-body">
                   <div className="d-flex justify-content-between align-items-center">
                     <div>
                       <p className="text-white-50 mb-1" style={{ fontSize: "11px" }}>Total Due</p>
                       <h4 className="text-white mb-0" style={{ fontSize: "16px", fontWeight: "600" }}>₹ {totalDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h4>
                     </div>
                     <div className="widget-icon" style={{ width: "35px", height: "35px" }}>
                       <i className="mdi mdi-currency-inr text-white" style={{ fontSize: "20px" }}></i>
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
           <div id="outstanding-table-wrapper" style={{ width: '100%', overflowX: 'auto' }}>
             <MDBDataTable className="table-auto-sr" striped bordered small noBottomColumns data={data} />
           </div>
         )}
       </CardBody>
       <style>{`
           /* Force right alignment for Total Amount column in Outstanding */
           #layout-wrapper > div.main-content > div > div > div.card > div > div.dataTables_wrapper.dt-bootstrap4.table-auto-sr > div:nth-child(2) > div > div > table > thead > tr > th:nth-child(3),
           #layout-wrapper > div.main-content > div > div > div.card > div > div.dataTables_wrapper.dt-bootstrap4.table-auto-sr > div:nth-child(2) > div > div > table > tbody > tr > td:nth-child(3) {
               text-align: right !important;
           }
           
           /* Override RTL-specific alignment */
           #layout-wrapper[dir="rtl"] > div.main-content > div > div > div.card > div > div.dataTables_wrapper.dt-bootstrap4.table-auto-sr > div:nth-child(2) > div > div > table > thead > tr > th:nth-child(3),
           #layout-wrapper[dir="rtl"] > div.main-content > div > div > div.card > div > div.dataTables_wrapper.dt-bootstrap4.table-auto-sr > div:nth-child(2) > div > div > table > tbody > tr > td:nth-child(3) {
               text-align: right !important;
           }
           
           /* Also target by class for robustness */
           #outstanding-table-wrapper .table-auto-sr tbody td.text-end,
           #outstanding-table-wrapper .table-auto-sr thead th.text-end {
               text-align: right !important;
           }
           #outstanding-table-wrapper [dir="rtl"] .table-auto-sr tbody td.text-end,
           #outstanding-table-wrapper [dir="rtl"] .table-auto-sr thead th.text-end {
               text-align: right !important;
           }
           
           /* Fallback: target specific column position */
           #outstanding-table-wrapper .table-auto-sr tbody td:nth-child(3),
           #outstanding-table-wrapper .table-auto-sr thead th:nth-child(3) {
               text-align: right !important;
           }
       `}</style>
    </Card>
    </>
  )
}

export default connect(null, { setBreadcrumbItems })(Outstanding)
