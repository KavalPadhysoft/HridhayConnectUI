import React, { useEffect, useMemo, useState } from "react"
import { DASHBOARD_NAME } from "../../config"
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap"
import { MDBDataTable } from "mdbreact"
import { connect } from "react-redux"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { buildServerSortColumns, getNextSortState, withAutoSrColumn } from "../../common/common"

import { setBreadcrumbItems } from "../../store/actions"
import { get } from "../../helpers/api_helper"
import { showError, showSuccess } from "../../Pop_show/alertService"

const PENDING_ORDERS_SORT_COLUMN = "order_No"
const PENDING_ORDERS_SORT_DIR = "asc"
const PENDING_ITEMS_SORT_COLUMN = "CategoryName"
const PENDING_ITEMS_SORT_DIR = "asc"

const Dashboard = props => {
  document.title = `Dashboard | ${DASHBOARD_NAME}`
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()

  const [pendingOrdersLoading, setPendingOrdersLoading] = useState(false)
  const [pendingOrdersError, setPendingOrdersError] = useState("")
  const [pendingItemsLoading, setPendingItemsLoading] = useState(false)
  const [pendingItemsError, setPendingItemsError] = useState("")
  
  const [pendingOrders, setPendingOrders] = useState([])
  const [pendingItems, setPendingItems] = useState([])
  
  const [pendingOrdersSortColumn, setPendingOrdersSortColumn] = useState(PENDING_ORDERS_SORT_COLUMN)
  const [pendingOrdersSortColumnDir, setPendingOrdersSortColumnDir] = useState(PENDING_ORDERS_SORT_DIR)
  const [pendingItemsSortColumn, setPendingItemsSortColumn] = useState(PENDING_ITEMS_SORT_COLUMN)
  const [pendingItemsSortColumnDir, setPendingItemsSortColumnDir] = useState(PENDING_ITEMS_SORT_DIR)

  const breadcrumbItems = [
    { title: "Lexa", link: "#" },
    { title: "Dashboard", link: "#" },
  ]

  const loadPendingOrders = async () => {
    setPendingOrdersLoading(true)
    setPendingOrdersError("")
    setPendingItemsLoading(true)
    setPendingItemsError("")

    try {
      // Fetch pending orders
      const ordersResponse = await get(
        `https://hridhayconnect.bsite.net/api/Dashboard/GetDashboardDataForPendingOrders?start=0&length=10&sortColumn=${pendingOrdersSortColumn}&sortColumnDir=${pendingOrdersSortColumnDir}`
      )

      if (!(ordersResponse?.isSuccess && ordersResponse?.statusCode === 1)) {
        throw new Error(ordersResponse?.message || "Failed to load pending orders")
      }

      const ordersList = ordersResponse?.data?.data || []
      setPendingOrders(Array.isArray(ordersList) ? ordersList : [])

      // Fetch pending order items
      const itemsResponse = await get(
        `https://hridhayconnect.bsite.net/api/Dashboard/GetDashboardDataForPendingItemWise?start=0&length=10&sortColumn=${pendingItemsSortColumn}&sortColumnDir=${pendingItemsSortColumnDir}`
      )

      if (!(itemsResponse?.isSuccess && itemsResponse?.statusCode === 1)) {
        throw new Error(itemsResponse?.message || "Failed to load pending order items")
      }

      const itemsList = itemsResponse?.data?.data || []
      setPendingItems(Array.isArray(itemsList) ? itemsList : [])
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to load dashboard data"
      setPendingOrdersError(errorMessage)
      setPendingItemsError(errorMessage)
    } finally {
      setPendingOrdersLoading(false)
      setPendingItemsLoading(false)
    }
  }

  useEffect(() => {
    props.setBreadcrumbItems('Dashboard')
    loadPendingOrders()
  }, [])

  const handlePendingOrdersSortChange = fieldName => {
    const nextState = getNextSortState(pendingOrdersSortColumn, pendingOrdersSortColumnDir, fieldName)
    setPendingOrdersSortColumn(nextState.sortColumn)
    setPendingOrdersSortColumnDir(nextState.sortColumnDir)
    loadPendingOrders()
  }

  const handlePendingItemsSortChange = fieldName => {
    const nextState = getNextSortState(pendingItemsSortColumn, pendingItemsSortColumnDir, fieldName)
    setPendingItemsSortColumn(nextState.sortColumn)
    setPendingItemsSortColumnDir(nextState.sortColumnDir)
    loadPendingOrders()
  }

  const pendingOrdersData = useMemo(() => {
    return withAutoSrColumn({
      columns: buildServerSortColumns({
        columns: [
          { label: "Order No", field: "order_No", sort: "asc" },
          { label: "Order Date", field: "order_Date", sort: "asc" },
          { label: "Delivery Date", field: "delivery_Date", sort: "asc" },
          { label: "Shop", field: "customerName", sort: "asc" },
          { label: "Salesperson Name", field: "salesPersonName", sort: "asc" },
          { label: "Total Amount", field: "total_Amount", sort: "asc" },
          { label: "Status", field: "order_Status_Text", sort: "asc" },
        ],
        onSort: handlePendingOrdersSortChange,
        activeSortColumn: pendingOrdersSortColumn,
        sortColumnDir: pendingOrdersSortColumnDir,
      }),
      rows: pendingOrders.map(order => ({
        id: order.id,
        order_No: order.order_No || "",
        order_Date: order.order_Date ? new Date(order.order_Date).toLocaleDateString() : "",
        delivery_Date: order.delivery_Date ? new Date(order.delivery_Date).toLocaleDateString() : "",
        customerName: order.customerName || "",
        salesPersonName: order.salesPersonName || "",
        total_Amount: order.total_Amount || 0,
        order_Status_Text: order.order_Status_Text || "",
      })),
    })
  }, [pendingOrders, pendingOrdersSortColumn, pendingOrdersSortColumnDir])

  const pendingItemsData = useMemo(() => {
    return withAutoSrColumn({
      columns: buildServerSortColumns({
        columns: [
          { label: "Category Name", field: "CategoryName", sort: "asc" },
          { label: "Item Name", field: "ItemName", sort: "asc" },
          { label: "Unit", field: "Unit", sort: "asc" },
          { label: "Total Quantity", field: "TotalQuantity", sort: "asc" },
        ],
        onSort: handlePendingItemsSortChange,
        activeSortColumn: pendingItemsSortColumn,
        sortColumnDir: pendingItemsSortColumnDir,
      }),
      rows: pendingItems.map(item => ({
        id: item.id,
        CategoryName: item.categoryName || "",
        ItemName: item.itemName || "",
        Unit: item.unit_Text || "",
        TotalQuantity: item.totalQuantity || 0,
      })),
    })
  }, [pendingItems, pendingItemsSortColumn, pendingItemsSortColumnDir])

  return (
    <React.Fragment>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            
          </div>
        </div>
        
        {/* Pending Orders Table */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Pending Orders</h5>
              </div>
              <div className="card-body">
                {pendingOrdersError ? (
                  <Alert color="danger">{pendingOrdersError}</Alert>
                ) : (
                  <>
                 {pendingOrdersLoading ? (
                        <div className="text-center py-5">
                          <Spinner color="primary" />
                        </div>
                      ) : (
                        pendingOrders.length > 0 ? (
                          <MDBDataTable className="table-auto-sr" striped bordered small noBottomColumns data={pendingOrdersData} />
                        ) : (
                          <p className="text-center text-muted">No pending orders found.</p>
                        )
                      )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Pending Order Items Table */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Pending Order Items</h5>
              </div>
              <div className="card-body">
                {pendingItemsError ? (
                  <Alert color="danger">{pendingItemsError}</Alert>
                ) : (
                  <>
                 {pendingItemsLoading ? (
                        <div className="text-center py-5">
                          <Spinner color="primary" />
                        </div>
                      ) : (
                        pendingItems.length > 0 ? (
                          <MDBDataTable className="table-auto-sr" striped bordered small noBottomColumns data={pendingItemsData} />
                        ) : (
                          <p className="text-center text-muted">No pending order items found.</p>
                        )
                      )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default connect(null, { setBreadcrumbItems })(Dashboard)
