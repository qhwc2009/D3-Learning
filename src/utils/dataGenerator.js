// 生成组织架构数据
export function generateOrgChartData(depth) {
  const data = {
    name: 'Lao Lao',
    title: 'general manager',
    children: [
      { name: 'Bo Miao', title: 'department manager' },
      {
        name: 'Su Miao',
        title: 'department manager',
        children: [
          { name: 'Tie Hua', title: 'senior engineer' },
          {
            name: 'Hei Hei',
            title: 'senior engineer',
            children: [
              { name: 'Pang Pang', title: 'engineer' },
              { name: 'Xiang Xiang', title: 'UE engineer' }
            ]
          }
        ]
      },
      { name: 'Hong Miao', title: 'department manager' }
    ]
  }

  for (let i = 0; i < 3; i++) {
    data['children'].push({
      name: 'Lao Lao',
      title: 'general manager',
      children: [
        { name: 'Bo Miao', title: 'department manager' },
        {
          name: 'Su Miao',
          title: 'department manager',
          children: [{ name: 'Tie Hua', title: 'senior engineer' }]
        }
      ]
    })
  }

  let temp = data
  for (let i = 0; i < depth; i++) {
    if (!temp.children) {
      temp.children = []
    }
    temp.children.push({
      name: 'Lao Lao',
      title: 'general manager',
      children: [
        { name: 'Bo Miao', title: 'department manager' },
        {
          name: 'Su Miao',
          title: 'department manager',
          children: [
            { name: 'Tie Hua', title: 'senior engineer' },
            {
              name: 'Hei Hei',
              title: 'senior engineer',
              children: [{ name: 'Xiang Xiang', title: 'UE engineer' }]
            }
          ]
        }
      ]
    })
    temp = temp.children[0]
  }
  return data
}

// 把树折叠起来 得到折叠后的数据
export function generateOrgChartDataFolded(depth, foldDepth) {
  const data = this.generateOrgChartData(depth)
  let tempNode = data
  for (let i = 0; i < foldDepth && tempNode.children; i++) {
    tempNode = tempNode.children[0]
  }
  tempNode._children = tempNode.children
  tempNode.children = null
  return data
}
