import { DASHBOARD_NAME } from "../../config";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, CardBody, Col, Row, Spinner } from "reactstrap";
import { MDBDataTable } from "mdbreact";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { buildServerSortColumns, getNextSortState, withAutoSrColumn } from "../../common/common";
import { getOrdersPages, deleteOrderById, getOrderById, saveOrder, getOrderNo, getCustomerList, getAssignSaleList, getItemList, getDeliveryById, saveDelivery, cancelOrder, getOrderLayoutData } from "../../helpers/fakebackend_helper";
import { showConfirm, showError, showSuccess } from "../../Pop_show/alertService";
import OrderForm from "./OrderForm";
import DeliveryForm from "./DeliveryForm";

import { connect } from "react-redux";
import { setBreadcrumbItems } from "../../store/actions";

import { getLovDropdownList } from "../../helpers/api_helper";

const ORDER_LIST_SORT_COLUMN = "order_No";
const ORDER_LIST_SORT_DIR = "asc";

const Order = props => {
  document.title = `Order | ${DASHBOARD_NAME}`;
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const OrderId = Number(params.id || 0);
  const isFormPage = location.pathname.startsWith("/Order/manage");
  const isDeliveryPage = location.pathname.startsWith("/Order/deliver");
  const isEditMode = isFormPage && OrderId > 0;

  // List state
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(0);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);
  const [sortColumn, setSortColumn] = useState(ORDER_LIST_SORT_COLUMN);
  const [sortColumnDir, setSortColumnDir] = useState(ORDER_LIST_SORT_DIR);

  // Form state
  const [formLoading, setFormLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formTitle, setFormTitle] = useState(isEditMode ? "Edit Order" : "Create Order");
  const [formData, setFormData] = useState({
    id: 0,
    customerId: 0,
    salesPerson_Id: 0,
    order_Date: "",
    order_No: "",
    customerName: "",
    salesPersonName: "",
    total_Amount: 0,
    notes: "",
    order_Status: "1",
    order_Status_Text: "",
  });

  // Customer dropdown state
  const [customerList, setCustomerList] = useState([]);
  const [customerListLoading, setCustomerListLoading] = useState(false);

  // Status dropdown state
  const [statusList, setStatusList] = useState([]);
  const [statusListLoading, setStatusListLoading] = useState(false);

  // Salesman dropdown state
  const [salesmanList, setSalesmanList] = useState([]);
  const [salesmanListLoading, setSalesmanListLoading] = useState(false);

  // Item dropdown state
  const [itemList, setItemList] = useState([]);
  const [itemListLoading, setItemListLoading] = useState(false);

  // Order items state
  const [orderItems, setOrderItems] = useState([]);

  // Delivery state
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliverySaving, setDeliverySaving] = useState(false);
  const [deliveryError, setDeliveryError] = useState("");
  const [reloadFlag, setReloadFlag] = useState(0);
  const [deliveryFormData, setDeliveryFormData] = useState({
    id: 0,
    order_ID: 0,
    customerId: 0,
    salesPerson_Id: 0,
    order_Date: "",
    delivery_Date: new Date().toISOString().split("T")[0],
    order_No: "",
    customerName: "",
    salesPersonName: "",
    total_Amount: 0,
    no_Of_Items: 0,
    remarks: "",
    order_Status: "",
    order_Status_Text: "",
  });
  const [deliveryItems, setDeliveryItems] = useState([]);

  useEffect(() => {
    if (isFormPage) {
      setCustomerListLoading(true);
      getCustomerList()
        .then((res) => {
          if (res.isSuccess && Array.isArray(res.data)) {
            setCustomerList(res.data);
          } else {
            setCustomerList([]);
          }
        })
        .catch(() => setCustomerList([]))
        .finally(() => setCustomerListLoading(false));

      setStatusListLoading(true);
      getLovDropdownList("OrderStatus")
        .then((res) => {
          if (res.isSuccess && Array.isArray(res.data)) {
            setStatusList(res.data);
          } else {
            setStatusList([]);
          }
        })
        .catch(() => setStatusList([]))
        .finally(() => setStatusListLoading(false));

      setSalesmanListLoading(true);
      getAssignSaleList()
        .then((res) => {
          if (res.isSuccess && Array.isArray(res.data)) {
            setSalesmanList(res.data);
          } else {
            setSalesmanList([]);
          }
        })
        .catch(() => setSalesmanList([]))
        .finally(() => setSalesmanListLoading(false));

      setItemListLoading(true);
      getItemList()
        .then((res) => {
          if (res.isSuccess && Array.isArray(res.data)) {
            setItemList(res.data);
          } else {
            setItemList([]);
          }
        })
        .catch(() => setItemList([]))
        .finally(() => setItemListLoading(false));
    }
  }, [isFormPage]);

  // List logic
  const loadOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getOrdersPages({
        start: 0,
        length: 10,
        sortColumn,
        sortColumnDir,
      });
      if (response.isSuccess && response.data && response.data.data) {
        setRows(response.data.data);
      } else {
        setRows([]);
        setError(response.message || "Failed to load Orders.");
      }
    } catch (err) {
      setError("Error loading Orders.");
    }
    setLoading(false);
  };

  useEffect(() => {
    props.setBreadcrumbItems("Order")
  }, [])

  useEffect(() => {
    if (!isFormPage) {
      loadOrders();
    }
  }, [isFormPage, sortColumn, sortColumnDir, reloadFlag]);

  const handleSortChange = (fieldName) => {
    const nextState = getNextSortState(sortColumn, sortColumnDir, fieldName);
    setSortColumn(nextState.sortColumn);
    setSortColumnDir(nextState.sortColumnDir);
  };

  const handleEdit = (id) => {
    navigate(`/Order/manage/${id}`);
  };

  const handleDelete = async (id) => {
    if (await showConfirm("Are you sure you want to delete this Order?")) {
      setDeletingId(id);
      try {
        const response = await deleteOrderById(id);
        if (response.isSuccess) {
          await showSuccess(response.message || "Order deleted successfully.");
          setTimeout(() => loadOrders(), 600);
        } else {
          await showError(response.message || "Failed to delete Order.");
        }
      } catch (err) {
        await showError("Error deleting Order.");
      }
      setDeletingId(0);
    }
  };

  const handleCancelOrder = async (id) => {
    if (await showConfirm("Are you sure you want to cancel this Order?")) {
      try {
        const response = await cancelOrder(id);
        if (response?.statusCode === 1 || response?.isSuccess) {
          await showSuccess(response?.message || "Order cancelled successfully.");
          setReloadFlag(prev => prev + 1);
          setTimeout(() => loadOrders(), 600);
        } else {
          await showError(response?.message || `Failed to cancel Order. Status: ${response?.statusCode}`);
        }
      } catch (err) {
        console.error("Cancel order error:", err);
        await showError(err?.response?.data?.message || err?.message || "Error cancelling Order. Check API endpoint.");
      }
    }
  };

  const handleAdd = () => {
    navigate("/Order/manage");
  };

  const handleDeliver = (id) => {
    navigate(`/Order/deliver/${id}`);
  };

  // Delivery form logic
  useEffect(() => {
    if (!isDeliveryPage) return;
    setDeliveryLoading(true);
    setDeliveryError("");
    getDeliveryById(OrderId)
      .then((response) => {
        if (response?.isSuccess && response?.data) {
          const orderData = response.data.order || {};
          setDeliveryFormData({
            id: orderData.id || 0,
            order_ID: orderData.order_ID || 0,
            customerId: orderData.customerId || 0,
            salesPerson_Id: orderData.salesPerson_Id || 0,
            order_Date: orderData.order_Date ? orderData.order_Date.split("T")[0] : "",
    delivery_Date: new Date().toISOString().split("T")[0],
            order_No: orderData.order_No || "",
            customerName: orderData.customerName || "",
            salesPersonName: orderData.salesPersonName || "",
            total_Amount: orderData.total_Amount || 0,
            no_Of_Items: orderData.no_Of_Items || 0,
            remarks: orderData.remarks || "",
            order_Status: orderData.order_Status || "",
            order_Status_Text: orderData.order_Status_Text || "",
          });
          const items = response.data.deliveryItems || [];
          setDeliveryItems(items.map((item, idx) => ({
            ...item,
            itemName: item.itemName || item.itemName || `Item ID: ${item.item_ID || item.itemId}`,
            item_ID: item.item_ID || item.itemId,
            quantity: item.quantity || 0,
            rate: item.rate || 0,
            total_Amount: item.total_Amount || (item.quantity * item.rate),
          })));
        } else {
          setDeliveryError(response?.message || "Failed to load Delivery data");
        }
      })
      .catch((err) => setDeliveryError(err?.message || err || "Failed to load Delivery data"))
      .finally(() => setDeliveryLoading(false));
  }, [isDeliveryPage, OrderId]);

  const handleDeliveryChange = (e) => {
    setDeliveryFormData({ ...deliveryFormData, [e.target.name]: e.target.value });
  };

  const handleDeliverySubmit = async (e) => {
    e.preventDefault();
    setDeliveryError("");
    setDeliverySaving(true);
    try {
      const totalAmount = deliveryItems.reduce((sum, it) => sum + Number(it.total_Amount), 0);
      const payload = {
        order: {
          ...deliveryFormData,
          delivery_Date: deliveryFormData.delivery_Date,
        },
        deliveryItems: deliveryItems.map(item => ({
          itemId: 0,
          delivery_ID: item.delivery_ID || 0,
          item_ID: item.item_ID || 0,
          quantity: item.quantity,
          rate: item.rate,
          total_Amount: item.total_Amount,
          order_No: deliveryFormData.order_No,
          order_ID: deliveryFormData.id,
        })),
      };
      const response = await saveDelivery(payload);
      if (response?.statusCode === 1 || response?.isSuccess) {
        await showSuccess(response?.message || "Delivered successfully");
        setReloadFlag(prev => prev + 1);
        setTimeout(() => navigate("/Order"), 600);
        return;
      }
      throw new Error(response?.message || "Failed to save Delivery");
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to save Delivery";
      await showError(errorMessage);
      setDeliveryError(errorMessage);
    } finally {
      setDeliverySaving(false);
    }
  };

  // Form logic
  useEffect(() => {
    if (!isFormPage) return;
    if (!isEditMode) {
      setFormTitle("Create Order");
      setFormError("");
      setFormLoading(true);
      // Fetch new order number from API
      getOrderNo()
        .then((res) => {
          let orderNo = "";
          if (res && (res.order_No || (res.data && res.data.order_No))) {
            orderNo = res.order_No || (res.data && res.data.order_No) || "";
          }
          const today = new Date().toISOString().split("T")[0];
          setFormData({
            id: 0,
            customerId: 0,
            salesPerson_Id: 0,
            order_Date: today,
            order_No: orderNo,
            customerName: "",
            salesPersonName: "",
            total_Amount: 0,
            notes: "",
            order_Status: "1",
            order_Status_Text: "Pending",
          });
        })
        .catch(() => {
          setFormData({
            id: 0,
            customerId: 0,
            salesPerson_Id: 0,
            order_Date: "",
            order_No: "",
            customerName: "",
            salesPersonName: "",
            total_Amount: 0,
            notes: "",
            order_Status: "1",
            order_Status_Text: "Pending",
          });
        })
        .finally(() => {
          setFormLoading(false);
        });
      setOrderItems([]);
      return;
    }
    setFormLoading(true);
    setFormError("");
    getOrderById(OrderId)
      .then((response) => {
        if (response?.isSuccess && response?.data) {
          setFormTitle("Edit Order");
          if (response.data.order && response.data.orderItems) {
            setFormData({
              ...response.data.order,
              order_Date: response.data.order.order_Date ? response.data.order.order_Date.substring(0, 10) : "",
              order_Status: "1",
              order_Status_Text: "Pending",
            });
            setOrderItems(response.data.orderItems.map(item => ({
              ...item,
              itemId: item.item_ID || item.itemId,
              itemName: item.item_Name || "",
              Quantity: item.quantity,
              Rate: item.rate,
              Total_Amount: item.total_Amount,
            })));
          } else {
            setFormData({
              ...response.data,
              order_Date: response.data.order_Date ? response.data.order_Date.substring(0, 10) : "",
              order_Status: "1",
              order_Status_Text: "Pending",
            });
            setOrderItems([]);
          }
        } else {
          setFormError(response?.message || "Failed to load Order");
        }
      })
      .catch((err) => setFormError(err?.message || err || "Failed to load Order"))
      .finally(() => setFormLoading(false));
  }, [isFormPage, isEditMode, OrderId]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      const totalAmount = orderItems.reduce((sum, it) => sum + Number(it.Total_Amount), 0);
      const orderPayload = {
        ...formData,
        total_Amount: totalAmount,
      };
      if (!formData.order_Date || formData.order_Date.trim() === "") {
        delete orderPayload.order_Date;
      }
      const itemsPayload = orderItems.map(item => ({
        itemId: item.itemId || 0,
        order_ID: formData.id || 0,
        item_ID: item.itemId || 0,
        quantity: item.Quantity === "" ? null : Number(item.Quantity),
        rate: item.Rate === "" ? null : Number(item.Rate),
        total_Amount: item.Total_Amount,
        order_No: formData.order_No,
      }));
      const payload = {
        order: orderPayload,
        orderItems: itemsPayload
      };
      const response = await saveOrder(payload);
      if (response?.statusCode === 1 || response?.isSuccess) {
        await showSuccess(response?.message || "Saved successfully");
        setTimeout(() => navigate("/Order"), 600);
        return;
      }
      throw new Error(response?.message || "Failed to save Order");
    } catch (err) {
      const errorMessage = err?.message || err || "Failed to save Order";
      await showError(errorMessage);
      setFormError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCustomerChange = (option) => {
    setFormData(prev => ({
      ...prev,
      customerId: option ? option.value : "",
    }));
  };

  const handleStatusChange = (option) => {
    setFormData(prev => ({
      ...prev,
      order_Status: option ? option.value : "",
    }));
  };

  const handleSalesmanChange = (option) => {
    setFormData(prev => ({
      ...prev,
      salesPerson_Id: option ? option.value : "",
    }));
  };

  // Format date as dd-MMM-yyyy
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return "";
    const day = String(d.getDate()).padStart(2, '0');
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Status badge colors
  const getStatusBadge = (status) => {
    const statusMap = {
      "1": { color: "warning", text: "Pending" },
      "2": { color: "info", text: "Partially Delivered" },
      "4": { color: "primary", text: "Delivered" },
      "5": { color: "danger", text: "Cancelled" },
    };
    const statusInfo = statusMap[status] || { color: "secondary", text: status };
    return (
      <span className={`badge rounded-pill bg-${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  // Table data
  const data = useMemo(() => {
    return withAutoSrColumn({
      columns: buildServerSortColumns({
        columns: [
          { label: "Order No", field: "order_No", sort: "asc" },
          { label: "Customer Name", field: "customerName", sort: "asc" },
          { label: "Order Date", field: "order_Date", sort: "asc" },
          { label: "Items", field: "itemsCount", sort: "asc" },
          { label: "Delivered Items", field: "delivered_Items", sort: "asc" },
          { label: "Total Amount", field: "total_Amount", sort: "asc" },
          { label: "Salesman", field: "salesPersonName", sort: "asc" },
          { label: "Status", field: "order_Status_Text", sort: "asc" },
          { label: "Action", field: "action", sort: "disabled" },
        ],
        onSort: handleSortChange,
        activeSortColumn: sortColumn,
        sortColumnDir,
      }),
      rows: rows.map(item => ({
        order_No: item.order_No || "",
        customerName: item.customerName || "",
        order_Date: formatDate(item.order_Date),
        itemsCount: item.no_Of_Items || 0,
        delivered_Items: item.delivered_Items || 0,
        total_Amount: item.total_Amount ?? 0,
        salesPersonName: item.salesPersonName || "",
        order_Status_Text: getStatusBadge(item.order_Status),
        action: (
          <div className="d-flex gap-2 justify-content-center">
            {item.order_Status === "1" ? (
              <>
                <Button
                  color="link"
                  className="p-0 text-primary"
                  title="Edit"
                  type="button"
                  onClick={() => handleEdit(item.id)}
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
                <Button
                  color="success"
                  size="sm"
                  title="Deliver"
                  type="button"
                  onClick={() => handleDeliver(item.id)}
                  style={{ fontWeight: 500 }}
                >
                  <i className="mdi mdi-truck-delivery me-1" />
                  Deliver
                </Button>
                <Button
                  color="warning"
                  size="sm"
                  title="Cancel Order"
                  type="button"
                  onClick={() => handleCancelOrder(item.id)}
                  style={{ fontWeight: 500 }}
                >
                  <i className="mdi mdi-close-circle me-1" />
                  Cancel
                </Button>
              </>
            ) : null}
            <Button
              color="link"
              className="p-0 text-info"
              title="View"
              type="button"
              onClick={() => navigate(`/Order/layout/${item.id}/${item.order_Status}`)}
            >
              <i className="mdi mdi-eye font-size-18" />
            </Button>
          </div>
        ),
      })),
    });
  }, [rows, sortColumn, sortColumnDir, deletingId]);

  return (
    <React.Fragment>
      <Row>
        <Col lg={12}>
          {isFormPage ? (
            formLoading || customerListLoading || statusListLoading || salesmanListLoading || itemListLoading ? (
              <Card>
                <CardBody>
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                  </div>
                </CardBody>
              </Card>
            ) : (
              <OrderForm
                title={formTitle}
                formError={formError}
                formData={formData}
                isEditMode={isEditMode}
                saving={saving}
                onChange={handleFormChange}
                onSubmit={handleFormSubmit}
                onClose={() => navigate("/Order")}
                customerList={customerList}
                onCustomerChange={handleCustomerChange}
                statusList={statusList}
                onStatusChange={handleStatusChange}
                salesmanList={salesmanList}
                onSalesmanChange={handleSalesmanChange}
                itemList={itemList}
                orderItems={orderItems}
                setOrderItems={setOrderItems}
              />
            )
          ) : isDeliveryPage ? (
            deliveryLoading ? (
              <Card>
                <CardBody>
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                  </div>
                </CardBody>
              </Card>
            ) : (
              <DeliveryForm
                title="Deliver Order"
                formError={deliveryError}
                formData={deliveryFormData}
                saving={deliverySaving}
                onChange={handleDeliveryChange}
                onSubmit={handleDeliverySubmit}
                onClose={() => navigate("/Order")}
                deliveryItems={deliveryItems}
                setDeliveryItems={setDeliveryItems}
                orderItemsCount={deliveryFormData.no_Of_Items || 0}
              />
            )
          ) : (
            <Card>
              <CardBody>
                <div className="d-flex justify-content-end mb-3">
                  <Button color="primary" type="button" onClick={() => navigate("/Order/manage")}>
                    <i className="mdi mdi-plus me-1" />Add Order
                  </Button>
                </div>
                {error ? <Alert color="danger">{error}</Alert> : null}
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner color="primary" />
                  </div>
                ) : (
                  <MDBDataTable
                    striped
                    bordered
                    small
                    noBottomColumns
                    data={data}
                    className={rows && rows.length > 0 ? "table-auto-sr" : undefined}
                    noRecordsFoundLabel={<span style={{display: 'block', textAlign: 'center', fontWeight: 'bold', color: '#888'}}>You don't have any record</span>}
                  />
                )}
              </CardBody>
            </Card>
          )}
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default connect(null, { setBreadcrumbItems })(Order);
