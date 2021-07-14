import request from '@/utils/request'


//获取绩效列表
export function departmentList(data) {
  return request({
    url: '/department/list',
    method: 'post',
    data
  })
}

//添加部门
export function departmentAdd(data) {
    return request({
        url: '/department/add',
        method: 'post',
        data
    })
}

//通过id查询部门下岗位
export function positionList(departmentId){
  return request({
    url: '/department/position/list',
    method: 'post',
    params: {
    departmentId
    }
  })
}

//删除部门
export function departmentDelete(departmentId) {
  return request({
    url: '/department/delete',
    method: 'post',
    params: {
      departmentId
    }
  })
}

//添加岗位
export function positionAdd(data) {
  return request({
      url: '/department/position/add',
      method: 'post',
      data
  })
}

//删除岗位
export function positionDelete(positionId) {
  return request({
    url: '/department/position/delete',
    method: 'post',
    params: {
      positionId
    }
  })
}