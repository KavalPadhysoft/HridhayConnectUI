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
  document.title = `Outstanding Payments | ${DASHBOARD_NAME}`

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
    props.setBreadcrumbItems("Outstanding Payments")
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
          { label: "Customer", field: "customerName", sort: "asc" },
          { label: "Total Amount", field: "total_Amount", sort: "asc" },
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
            <Col md={4}>
              <div className="widget-card" style={{ background: "linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)", padding: "15px" }}>
                <div className="widget-card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-white-50 mb-1" style={{ fontSize: "12px" }}>Total Due</p>
                      <h4 className="text-white mb-0" style={{ fontSize: "18px", fontWeight: "600" }}>₹ {totalDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h4>
                    </div>
                    <div className="widget-icon" style={{ width: "40px", height: "40px" }}>
                      <i className="mdi mdi-currency-inr text-white" style={{ fontSize: "22px" }}></i>
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
          <MDBDataTable className="table-auto-sr" striped bordered small noBottomColumns data={data} />
        )}
      </CardBody>
    </Card>
    </>
  )
}

export default connect(null, { setBreadcrumbItems })(Outstanding)