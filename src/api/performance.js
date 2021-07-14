import request from '@/utils/request'


//获取绩效列表
export function performanceList(data) {
  return request({
    url: '/performance/list',
    method: 'post',
    data
  })
}

//添加绩效
export function performanceAdd(data) {
  return request({
    url: '/performance/add',
    method: 'post',
    data
  })
}

//下载绩效
export function performanceDowmload(data) {
  return request({
    responseType: 'blob',
    url: '/performance/download',
    method: 'post',
    data
  })
}

//获取绩效列表
export function performanceItemList(performanceId) {
  return request({
    url: '/performance/item/list',
    method: 'post',
    params: {
    performanceId
    }
  })
}

//修改绩效
export function performanceEdit(data) {
  return request({
    url: '/performance/update',
    method: 'post',
    data
  })
}

//提交绩效
export function performanceSubmit(performanceId) {
  return request({
    url: '/performance/submit',
    method: 'post',
    params: {
      performanceId
    }
  })
}

//保存绩效评分
export function performanceGrade(performanceId) {
  return request({
    url: '/performance/grade',
    method: 'post',
    params: {
      performanceId
    }
  })
}

export function summaryAdd(data) {
  return request({
    url: '/performance/summary',
    method: 'post',
    data
  })
}
