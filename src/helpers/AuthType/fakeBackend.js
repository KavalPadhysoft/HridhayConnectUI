import axios from "axios"
import MockAdapter from "axios-mock-adapter"
import * as url from "../url_helper"
import accessToken from "../jwt-token-access/accessToken"

let users = [
  {
    uid: 1,
    username: "admin",
    role: "admin",
    password: "123456",
    email: "admin@themesbrand.com",
  },
]

// In-memory Terms data
let termsList = [
  {
    id: 1,
    terms: "Sample Terms",
    displaySeqNo: 1,
    isActive: true,
    isDeleted: false,
    createdBy: 1,
    createdDate: new Date().toISOString(),
    lastModifiedBy: null,
    lastModifiedDate: null,
  },
];
let termsIdCounter = 2;

const fakeBackend = () => {
  // This sets the mock adapter on the default instance
  const mock = new MockAdapter(axios, { onNoMatch: "passthrough" })

  // Terms: GetAllpage
  mock.onGet(/\/Terms\/GetAllpage.*/).reply(config => {
    const urlParams = new URLSearchParams(config.url.split('?')[1]);
    const start = parseInt(urlParams.get('start') || '0', 10);
    const length = parseInt(urlParams.get('length') || '10', 10);
    const sortColumn = urlParams.get('sortColumn') || 'terms';
    const sortColumnDir = urlParams.get('sortColumnDir') || 'asc';
    let data = [...termsList];
    data.sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return sortColumnDir === 'asc' ? -1 : 1;
      if (a[sortColumn] > b[sortColumn]) return sortColumnDir === 'asc' ? 1 : -1;
      return 0;
    });
    const paged = data.slice(start, start + length);
    return [200, {
      isSuccess: true,
      isConfirm: false,
      statusCode: 1,
      message: null,
      data: {
        startIndex: start,
        length,
        recordsFiltered: data.length,
        recordsTotal: data.length,
        data: paged,
      },
    }];
  });

  // Terms: GetById
  mock.onGet(/\/Terms\/GetById.*/).reply(config => {
    const urlParams = new URLSearchParams(config.url.split('?')[1]);
    const id = parseInt(urlParams.get('id'), 10);
    const found = termsList.find(t => t.id === id);
    if (!found) {
      return [404, { isSuccess: false, statusCode: 0, message: 'Not found', data: null }];
    }
    return [200, {
      isSuccess: true,
      isConfirm: false,
      statusCode: 1,
      message: null,
      data: found,
    }];
  });

  // Terms: Add (create or update)
  mock.onPost("/Terms/Add").reply(config => {
    const data = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    let result;
    if (data.id && data.id > 0) {
      // Update
      const idx = termsList.findIndex(t => t.id === data.id);
      if (idx === -1) {
        return [404, { isSuccess: false, statusCode: 0, message: 'Not found', data: null }];
      }
      termsList[idx] = { ...termsList[idx], ...data, lastModifiedDate: new Date().toISOString() };
      result = termsList[idx];
    } else {
      // Create
      const newTerm = {
        ...data,
        id: termsIdCounter++,
        isActive: data.isActive !== undefined ? data.isActive : true,
        isDeleted: false,
        createdBy: 1,
        createdDate: new Date().toISOString(),
        lastModifiedBy: null,
        lastModifiedDate: null,
      };
      termsList.push(newTerm);
      result = newTerm;
    }
    return [200, { isSuccess: true, statusCode: 1, message: null, data: result }];
  });

  // Terms: Delete
  mock.onDelete(/\/Terms\/Delete.*/).reply(config => {
    const urlParams = new URLSearchParams(config.url.split('?')[1]);
    const id = parseInt(urlParams.get('id'), 10);
    const idx = termsList.findIndex(t => t.id === id);
    if (idx === -1) {
      return [404, { isSuccess: false, statusCode: 0, message: 'Not found', data: null }];
    }
    termsList[idx].isDeleted = true;
    termsList = termsList.filter(t => t.id !== id);
    return [200, { isSuccess: true, statusCode: 1, message: null, data: null }];
  });

  mock.onPost(url.POST_FAKE_REGISTER).reply(config => {
    const user = JSON.parse(config["data"])
    users.push(user)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve([200, user])
      })
    })
  })

  mock.onPost("/post-fake-login").reply(config => {
    const user = JSON.parse(config["data"])
    const validUser = users.filter(
      usr => usr.email === user.email && usr.password === user.password
    )

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (validUser["length"] === 1) {
          resolve([200, validUser[0]])
        } else {
          reject([
            "Username and password are invalid. Please enter correct username and password",
          ])
        }
      })
    })
  })

  mock.onPost("/fake-forget-pwd").reply(config => {
    // User needs to check that user is eXist or not and send mail for Reset New password

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve([200, "Check you mail and reset your password."])
      })
    })
  })

  mock.onPost("/post-jwt-register").reply(config => {
    const user = JSON.parse(config["data"])
    users.push(user)

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve([200, user])
      })
    })
  })

  mock.onPost("/post-jwt-login").reply(config => {
    const user = JSON.parse(config["data"])
    const validUser = users.filter(
      usr => usr.email === user.email && usr.password === user.password
    )

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (validUser["length"] === 1) {
          // You have to generate AccessToken by jwt. but this is fakeBackend so, right now its dummy
          const token = accessToken
          const userName = user.name

          // JWT AccessToken
          const tokenObj = { accessToken: token, username: userName } // Token Obj
          const validUserObj = { ...validUser[0], ...tokenObj, ...user.name } // validUser Obj

          resolve([200, validUserObj])
        } else {
          reject([
            400,
            "Username and password are invalid. Please enter correct username and password",
          ])
        }
      })
    })
  })

  mock.onPost("/post-jwt-profile").reply(config => {
    const user = JSON.parse(config["data"])

    const one = config.headers

    let finalToken = one.Authorization

    const validUser = users.filter(usr => usr.uid === user.idx)

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Verify Jwt token from header.Authorization
        if (finalToken === accessToken) {
          if (validUser["length"] === 1) {
            let objIndex

            //Find index of specific object using findIndex method.
            objIndex = users.findIndex(obj => obj.uid === user.idx)

            //Update object's name property.
            users[objIndex].username = user.username

            // Assign a value to locastorage
            localStorage.removeItem("authUser")
            localStorage.setItem("authUser", JSON.stringify(users[objIndex]))

            resolve([200, "Profile Updated Successfully"])
          } else {
            reject([400, "Something wrong for edit profile"])
          }
        } else {
          reject([400, "Invalid Token !!"])
        }
      })
    })
  })

  mock.onPost("/post-fake-profile").reply(config => {
    const user = JSON.parse(config["data"])

    const validUser = users.filter(usr => usr.uid === user.idx)

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (validUser["length"] === 1) {
          let objIndex

          //Find index of specific object using findIndex method.
          objIndex = users.findIndex(obj => obj.uid === user.idx)

          //Update object's name property.
          users[objIndex].username = user.username

          // Assign a value to locastorage
          localStorage.removeItem("authUser")
          localStorage.setItem("authUser", JSON.stringify(users[objIndex]))

          resolve([200, "Profile Updated Successfully"])
        } else {
          reject([400, "Something wrong for edit profile"])
        }
      })
    })
  })

  mock.onPost("/jwt-forget-pwd").reply(config => {
    // User needs to check that user is eXist or not and send mail for Reset New password

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve([200, "Check you mail and reset your password."])
      })
    })
  })

  mock.onPost("/social-login").reply(config => {
    const user = JSON.parse(config["data"])

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (user && user.token) {
          // You have to generate AccessToken by jwt. but this is fakeBackend so, right now its dummy
          const token = accessToken
          const userName = user.name

          // JWT AccessToken
          const tokenObj = { accessToken: token, username: userName } // Token Obj
          const validUserObj = { ...user[0], ...tokenObj, ...user.name } // validUser Obj

          resolve([200, validUserObj])
        } else {
          reject([
            400,
            "Username and password are invalid. Please enter correct username and password",
          ])
        }
      })
    })
  })

  

}

export default fakeBackend
