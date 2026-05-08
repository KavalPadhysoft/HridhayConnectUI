
import axios from "axios";
import { del, get, post } from "./api_helper";
import * as url from "./url_helper";
import { getBlob, exportToExcel } from "./api_helper";

// Gets the logged in user data from local session
const getLoggedInUser = () => {
  const user = localStorage.getItem("user");
  if (user) return JSON.parse(user);
  return null;
};

//is user is logged in
const isUserAuthenticated = () => {
  return getLoggedInUser() !== null;
};

const buildPageParams = (overrides = {}) => {
  return {
    start: 0,
    length: 10,
    sortColumn: "",
    sortColumnDir: "desc",
    searchValue: "",
    ...overrides,
  }
}

// Register Method
const postFakeRegister = data => {
  return axios
    .post(url.POST_FAKE_REGISTER, data)
    .then(response => {
      if (response.status >= 200 || response.status <= 299) return response.data;
      throw response.data;
    })
    .catch(err => {
      let message;
      if (err.response && err.response.status) {
        switch (err.response.status) {
          case 404:
            message = "Sorry! the page you are looking for could not be found";
            break;
          case 500:
            message =
              "Sorry! something went wrong, please contact our support team";
            break;
          case 401:
            message = "Invalid credentials";
            break;
          default:
            message = err[1];
            break;
        }
      }
      throw message;
    });
};

// Login Method
const postFakeLogin = async data => {
  const userName = data.userName || data.email || ""
  const password = data.password || ""

  if (!userName || !password) {
    throw "Please enter username and password"
  }

  try {
    const response = await post("/Auth/Login", null, {
      params: {
        userName,
        password,
      },
    })

    return response
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Login API call failed"
    )
  }
};

// Export users to Excel
export const exportUsers = async (params = {}) => {
  return await exportToExcel("/User/ExportToExcel", "Users.xlsx", { params });
};

// Export users to PDF
export const exportUsersPdf = async (params = {}) => {
  return await exportToExcel("/User/ExportToPdf", "Users.pdf", { params });
};

// Menu API helpers
const getMenuPages = async () => {
  try {
    return await get("/Menu/GetAllpage", {
      params: buildPageParams({ length: 100 }),
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Menu API call failed"
    )
  }
};

const getMenusPages = async (params = {}) => {
  try {
    return await get("/Menu/GetAllpage", {
      params: buildPageParams(params),
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Menus API call failed"
    )
  }
};

const getUsersPages = async (params = {}) => {
  try {
    return await get("/User/GetAllpage", {
      params: buildPageParams(params),
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Users API call failed"
    )
  }
};

const getRolesPages = async (params = {}) => {
  try {
    return await get("/Role/GetAllpage", {
      params: buildPageParams(params),
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Roles API call failed"
    )
  }
};

const getUserById = async id => {
  try {
    return await get("/User/GetById", {
      params: { id },
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "User fetch by id failed"
    )
  }
}

const getRoleById = async id => {
  try {
    return await get("/Role/GetById", {
      params: { id },
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Role fetch by id failed"
    )
  }
}

const getMenuById = async id => {
  try {
    return await get("/Menu/GetById", {
      params: { id },
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Menu fetch by id failed"
    )
  }
}

const getLovColumns = async (params = {}) => {
  try {
    return await get("/Lov/Get", {
      params: {
        flag: "LI",
        ...params,
      },
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "LOV columns API call failed"
    )
  }
}

const DeleteDetail = async (lovColumn, lovCode) => {
  try {
    return await del("/Lov/DeleteDetail", {
      params: { lovColumn, lovCode },
    });
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Delete failed"
    );
  }
};

const DeleteMaster = async (lovColumn) => {
  try {
    return await del("/Lov/DeleteMaster", {
      params: { lovColumn},
    });
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Delete failed"
    );
  }
};


const getLovMasterByColumn = async lovColumn => {
  try {
    return await get("/Lov/Get", {
      params: {
        flag: "LE",
        lovColumn,
      },
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "LOV master fetch failed"
    )
  }
}

const getLovDetailsByColumn = async (lovColumn, params = {}) => {
  try {
    return await get("/Lov/Get", {
      params: {
        flag: "LDI",
        lovColumn,
        ...params,
      },
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "LOV detail list API call failed"
    )
  }
}

const getLovDetailByCode = async (lovColumn, lovCode) => {
  try {
    return await get("/Lov/Get", {
      params: {
        flag: "LDE",
        lovColumn,
        lovCode,
      },
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "LOV detail fetch failed"
    )
  }
}

const saveUser = async payload => {
  try {
    return await post("/User/Add", payload)
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "User save failed"
    )
  }
}

const saveRole = async payload => {
  try {
    return await post("/Role/Save", payload)
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Role save failed"
    )
  }
}

const saveMenu = async payload => {
  try {
    return await post("/Menu/Add", payload)
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Menu save failed"
    )
  }
}

const saveLovMaster = async payload => {
  try {
    return await post("/Lov/SaveMaster", payload)
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "LOV master save failed"
    )
  }
}

const saveLovDetail = async payload => {
  try {
    return await post("/Lov/SaveDetail", payload)
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "LOV detail save failed"
    )
  }
}

const getRoleNames = async () => {
  try {
    return await get("/Dropdown/RoleName")
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Role dropdown API call failed"
    )
  }
}

const getRoleMenuPages = async () => {
  try {
    return await get("/Menu/GetAllpage", {
      params: buildPageParams({
        length: 100,
        sortColumnDir: "asc",
      }),
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Role menu API call failed"
    )
  }
}

const getMenuAccessPages = async () => {
  try {
    return await get("/MenuAccess/GetMenuAccess")
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Menu access API call failed"
    )
  }
}

const deleteUserById = async id => {
  try {
    return await del("/User/Delete", {
      params: { id },
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "User delete failed"
    )
  }
}

const deleteRoleById = async id => {
  try {
    return await del("/Role/Delete", {
      params: { id },
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Role delete failed"
    )
  }
}

const getCustomersPages = async (params = {}) => {
  try {
    return await get("/Customers/GetAllpage", {
      params: buildPageParams(params),
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Customers API call failed"
    )
  }
}

const getCustomerById = async id => {
  try {
    return await get("/Customers/GetById", {
      params: { id },
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Customer fetch by id failed"
    )
  }
}

const saveCustomer = async payload => {
  try {
    return await post("/Customers/Add", payload)
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Customer save failed"
    )
  }
}

const deleteCustomerById = async id => {
  try {
    return await del("/Customers/Delete", {
      params: { id },
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Customer delete failed"
    )
  }
}

// Category API helpers
const getCategoriesPages = async (params = {}) => {
  try {
    return await get("/Category/GetAllpage", {
      params: buildPageParams(params),
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Categories API call failed"
    )
  }
}

const getCategoryById = async id => {
  try {
    return await get("/Category/GetById", {
      params: { id },
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Category fetch by id failed"
    )
  }
}

const saveCategory = async payload => {
  try {
    return await post("/Category/Add", payload)
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Category save failed"
    )
  }
}

const deleteCategoryById = async id => {
  try {
    return await del("/Category/Delete", {
      params: { id },
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Category delete failed"
    )
  }
}

// Item API helpers
const getItemsPages = async (params = {}) => {
  try {
    return await get("/Item/GetAllpage", {
      params: buildPageParams(params),
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Items API call failed"
    )
  }
}

const getItemById = async id => {
  try {
    return await get("/Item/GetById", {
      params: { id },
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Item fetch by id failed"
    )
  }
}

const saveItem = async payload => {
  try {
    return await post("/Item/Add", payload)
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Item save failed"
    )
  }
}

const deleteItemById = async id => {
  try {
    return await del("/Item/Delete", {
      params: { id },
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Item delete failed"
    )
  }
}

const getCategoryList = async () => {
  try {
    const response = await get("/Dropdown/CategoryList")
    console.log("CategoryList API response:", response)
    return response
  } catch (error) {
    console.error("CategoryList API error:", error)
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Category list API call failed"
    )
  }
}

const getUnitList = async () => {
  try {
    const response = await get("/Dropdown/LovMaster", {
      params: { Lov_column: "Unit" },
    })
    console.log("LovMaster Unit API response:", response)
    return response
  } catch (error) {
    console.error("LovMaster Unit API error:", error)
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Unit list API call failed"
    )
   }
}

const getPackagingTypeList = async () => {
  try {
    const response = await get("/Dropdown/LovMaster", {
      params: { Lov_column: "PackagingType" },
    })
    console.log("LovMaster PackagingType API response:", response)
    return response
  } catch (error) {
    console.error("LovMaster PackagingType API error:", error)
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "LovMaster PackagingType API call failed"
    )
  }
}

const getPaymentModeList = async () => {
  try {
    const response = await get("/Dropdown/LovMaster", {
      params: { Lov_column: "PaymentMode" },
    })
    return response
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "PaymentMode list API call failed"
    )
  }
}

const getPaymentCollectionsPages = async (params = {}) => {
  try {
    return await get("/PaymentCollection/GetAllPaymentCollections", {
      params: buildPageParams(params),
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Payment Collections API call failed"
    )
  }
}

const getPaymentCollectionById = async id => {
  try {
    return await get("/PaymentCollection/GetById", {
      params: { id },
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Payment Collection fetch by id failed"
    )
  }
}

const savePaymentCollection = async payload => {
  try {
    return await post("/PaymentCollection/Add", payload)
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Payment Collection save failed"
    )
  }
}

const getAllOutstandingPayments = async (params = {}) => {
  try {
    return await get("/PaymentCollection/GetAllOutstandingPayments", {
      params: buildPageParams(params),
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Outstanding Payments API call failed"
    )
  }
}

const getAssignSaleList = async () => {
  try {
    const response = await get("/Dropdown/AssignSaleList")
    console.log("AssignSaleList API response:", response)
    return response
  } catch (error) {
    console.error("AssignSaleList API error:", error)
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Assign Sale list API call failed"
    )
  }
}

// Order API helpers
const getOrdersPages = async (params = {}) => {
  try {
    return await get("/Order/GetAllpage", {
      params: buildPageParams(params),
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Orders API call failed"
    )
  }
}

const getOrderById = async id => {
  try {
    return await get("/Order/GetById", {
      params: { id },
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Order fetch by id failed"
    )
  }
}

const saveOrder = async payload => {
  try {
    return await post("/Order/Save", payload)
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Order save failed"
    )
  }
}

const deleteOrderById = async id => {
  try {
    return await del("/Order/Delete", {
      params: { id },
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Order delete failed"
    )
  }
}

const getOrderNo = async () => {
  try {
    return await get("/Order/GetOrderNo")
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Order number API call failed"
    )
  }
}

const getItemList = async () => {
  try {
    const response = await get("/Dropdown/ItemList")
    return response
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Item list API call failed"
    )
  }
}

// Delivery API helpers
const getDeliveryById = async id => {
  try {
    return await get("/Deliveries/GetById", {
      params: { id },
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Delivery fetch by id failed"
    )
  }
}

const saveDelivery = async payload => {
  try {
    return await post("/Deliveries/Save", payload)
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Delivery save failed"
    )
  }
}

const cancelOrder = async id => {
  try {
    return await del("/Deliveries/CancelOrder", {
      params: { id },
    })
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Cancel order failed"
    )
  }
}

const getOrderLayoutData = async (id, status) => {
  try {
    return await get("/Order/GetOrderLayoutdata", {
      params: { id, status },
    });
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Get order layout data failed"
    );
  }
}

const getCustomerList = async () => {
  try {
    const response = await get("/Dropdown/CustomerList")
    return response
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Customer list API call failed"
    )
  }
}

const getCustomerTypeList = async () => {
  try {
    const response = await get("/Dropdown/LovMaster", {
      params: { Lov_column: "CustomerType" },
    })
    console.log("LovMaster CustomerType API response:", response)
    return response
  } catch (error) {
    console.error("LovMaster CustomerType API error:", error)
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Customer Type list API call failed"
    )
  }
}

const deleteMenuById = async id => {
  try {
    return await del("/Menu/Delete", {
      params: { id },
    });
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Menu delete failed"
    );
  }
};

const changePassword = async payload => {
  try {
    return await post("/ChangePassword/Add", payload)
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Change password failed"
    )
  }
}

// postForgetPwd
const postFakeForgetPwd = data => post(url.POST_FAKE_PASSWORD_FORGET, data);

// Edit profile
const postJwtProfile = data => post(url.POST_EDIT_JWT_PROFILE, data);

const postFakeProfile = data => post(url.POST_EDIT_PROFILE, data);

// Register Method
const postJwtRegister = (url, data) => {
  return axios
    .post(url, data)
    .then(response => {
      if (response.status >= 200 || response.status <= 299) return response.data;
      throw response.data;
    })
    .catch(err => {
      var message;
      if (err.response && err.response.status) {
        switch (err.response.status) {
          case 404:
            message = "Sorry! the page you are looking for could not be found";
            break;
          case 500:
            message =
              "Sorry! something went wrong, please contact our support team";
            break;
          case 401:
            message = "Invalid credentials";
            break;
          default:
            message = err[1];
            break;
        }
      }
      throw message;
    });
};

// Login Method
const postJwtLogin = data => post(url.POST_FAKE_JWT_LOGIN, data);

// postForgetPwd
const postJwtForgetPwd = data => post(url.POST_FAKE_JWT_PASSWORD_FORGET, data);

// postSocialLogin
export const postSocialLogin = data => post(url.SOCIAL_LOGIN, data);

// Reset Password API
const resetPassword = async (username) => {
  try {
    return await post("/User/ResetPassword", null, {
      params: { username },
    });
  } catch (error) {
    throw (
      error?.response?.data?.message ||
      error?.message ||
      "Reset password failed"
    );
  }
};

export {
  getLoggedInUser,
  isUserAuthenticated,
  postFakeRegister,
  postFakeLogin,
  postFakeProfile,
  postFakeForgetPwd,
  postJwtRegister,
  postJwtLogin,
  postJwtForgetPwd,
  postJwtProfile,
  getMenuPages,
  getMenusPages,
  getUsersPages,
  getRolesPages,
  getMenuById,
  getUserById,
  getRoleById,
  getLovColumns,
  getLovMasterByColumn,
  DeleteDetail,
  DeleteMaster,
  getCustomersPages,
  getCustomerById,
  saveCustomer,
  deleteCustomerById,
  getCategoriesPages,
  getCategoryById,
  saveCategory,
  deleteCategoryById,
  getLovDetailsByColumn,
  getLovDetailByCode,
  getRoleNames,
  getRoleMenuPages,
  getMenuAccessPages,
  saveUser,
  saveRole,
  saveMenu,
  saveLovMaster,
  saveLovDetail,
  deleteUserById,
  deleteRoleById,
  deleteMenuById,
  changePassword,
  buildPageParams,
  resetPassword,
  getItemsPages,
  getItemById,
  saveItem,
  deleteItemById,
  getCategoryList,
  getUnitList,
  getAssignSaleList,
   getCustomerTypeList,
   getOrdersPages,
   getOrderById,
   saveOrder,
   deleteOrderById,
   getOrderNo,
   getItemList,
   getCustomerList,
getDeliveryById,
     saveDelivery,
     cancelOrder,
     getOrderLayoutData,
     getPackagingTypeList,
     getPaymentModeList,
     getPaymentCollectionsPages,
     getPaymentCollectionById,
     savePaymentCollection,
     getAllOutstandingPayments,
}
