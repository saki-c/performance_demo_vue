import request from '@/utils/request'

export function userLogin(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

//获取用户列表
export function userList(data) {
  return request({
    url: '/user/list',
    method: 'post',
    data
  })
}

//添加用户
export function userAdd(data) {
  return request({
    url: '/user/add',
    method: 'post',
    data
  })
}

//修改密码
export function userUpdate(data) {
  return request({
    url: '/user/update',
    method: 'post',
    data
  })
}

//删除用户
export function userDelete(userId) {
  return request({
    url: '/user/delete',
    method: 'post',
    params: {
      userId
    }
  })
}

//密码重置
export function passwordReset(userId) {
  return request({
    url: '/user/reset',
    method: 'post',
    params: {
      userId
    }
  })
}

//升为管理员
export function userPromote(userId) {
  return request({
    url: '/user/promote',
    method: 'post',
    params: {
      userId
    }
  })
}

//降为用户
export function userDegrade(userId) {
  return request({
    url: '/user/degrade',
    method: 'post',
    params: {
      userId
    }
  })
}

//通过token登陆用户部门管理员列表
export function adminList() {
  return request({
    url: '/user/admin',
    method: 'get',
  })
}

//修改用户信息
export function userRevise(data) {
  return request({
    url: '/user/revise',
    method: 'post',
    data
  })
}

//管理员列表
export function allAdminList() {
  return request({
    url: '/user/alladmin',
    method: 'get',
  })
}

//获取绩效列表
export function positionList() {
  return request({
    url: '/department/position/list',
    method: 'get',
  })
}

//获取账户信息
export function userSelect() {
  return request({
    url: '/user/account',
    method: 'get',
  })
}
