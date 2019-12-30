// 参考自 https://juejin.im/post/5b10f62f5188257d7541ad71
import * as d3 from 'd3';
import Util from 'utils/utils';

class Tree {
  constructor(containerDom, config) {
    this.containerDom = containerDom;
    this.config = config;
    this.d3 = d3;
    this.init();
  }

  init() {
    // 初始化变量
    this.initVariables();
    // 初始化canvas
    this.initCanvas();
    // 初始化虚拟dom
    this.initVirtualNode();
    // 设置监听交互
    this.setCanvasListener();
  }

  initVariables() {
    this.height = this.containerDom.offsetHeight;
    this.width = this.containerDom.offsetWidth;

    this.padding = 20;
    // tree node size
    this.nodeWidth = 180;
    this.nodeHeight = 280;

    // unit size
    this.unitPadding = 20;
    this.unitWidth = 140;
    this.unitHeight = 100;

    // animation duration
    this.duration = 600;
    this.scale = 1.0;
  }

  initCanvas() {
    this.container = this.d3.select(this.containerDom);
    this.canvasNode = this.container
      .append('canvas')
      .attr('class', 'canvas-tree-canvas')
      .attr('width', this.width)
      .attr('height', this.height);
    this.hiddenCanvasNode = this.container
      .append('canvas')
      .attr('class', 'canvas-tree-canvas')
      .attr('width', this.width)
      .attr('height', this.height)
      .style('display', 'none');
    this.context = this.canvasNode.node().getContext('2d');
    this.context.translate(this.width / 2, this.padding);
    this.hiddenContext = this.hiddenCanvasNode.node().getContext('2d');
    this.hiddenContext.translate(this.width / 2, this.padding);
  }

  initVirtualNode() {
    // 创建虚拟节点
    const virtualContainer = document.createElement('root');
    this.virtualContainerNode = this.d3.select(virtualContainer);
    this.colorNodeMap = {};
  }

  setCanvasListener() {
    this.setClickListener();
    this.setDragListener();
    this.setMouseWheelZoomListener();
  }

  setClickListener() {
    const self = this;
    this.canvasNode.node().addEventListener('click', e => {
      // 通过坐标信息, 在隐藏的canvas中拿到对应的颜色
      const colorStr = Util.getColorStrFromCanvas(self.hiddenContext, e.layerX, e.layerY);
      const node = self.colorNodeMap[colorStr];
      if (node) {
        // let treeNodeData = node.data()[0]
        // self.hideChildren(treeNodeData, true)
        self.toggleTreeNode(node.data()[0]);
        self.update(node.data()[0]);
      }
    });
  }

  toggleTreeNode(treeNode) {
    if (treeNode.children) {
      treeNode._children = treeNode.children
      treeNode.children = null
    } else {
      treeNode.children = treeNode._children
      treeNode._children = null
    }
  }

  setDragListener() {
    this.onDrag_ = false
    this.dragStartPoint_ = { x: 0, y: 0 }
    let self = this
    this.canvasNode.node().onmousedown = function(e) {
      self.dragStartPoint_.x = e.x
      self.dragStartPoint_.y = e.y
      self.onDrag_ = true
    }

    this.canvasNode.node().onmousemove = function(e) {
      if (!self.onDrag_) {
        return
      }
      self.context.translate(
        (e.x - self.dragStartPoint_.x) / self.scale,
        (e.y - self.dragStartPoint_.y) / self.scale
      )
      self.hiddenContext.translate(
        (e.x - self.dragStartPoint_.x) / self.scale,
        (e.y - self.dragStartPoint_.y) / self.scale
      )
      self.dragStartPoint_.x = e.x
      self.dragStartPoint_.y = e.y
    }

    this.canvasNode.node().onmouseout = function(e) {
      if (self.onDrag_) {
        self.onDrag_ = false
      }
    }

    this.canvasNode.node().onmouseup = function(e) {
      if (self.onDrag_) {
        self.onDrag_ = false
      }
    }
  }

  setMouseWheelZoomListener() {
    let self = this
    this.canvasNode.node().addEventListener('mousewheel', event => {
      event.preventDefault()
      if (event.deltaY < 0) {
        self.bigger()
      } else {
        self.smaller()
      }
    })
  }

  bigger() {
    if (this.scale > 7) return
    this.clearCanvas_()
    this.scale = (this.scale * 5) / 4
    this.context.scale(5 / 4, 5 / 4)
    this.hiddenContext.scale(5 / 4, 5 / 4)
  }

  smaller() {
    if (this.scale < 0.2) return
    this.clearCanvas_()

    this.scale = (this.scale * 4) / 5
    this.context.scale(4 / 5, 4 / 5)
    this.hiddenContext.scale(4 / 5, 4 / 5)
  }

  clearCanvas_() {
    this.context.clearRect(-1000000, -10000, 2000000, 2000000)
    this.hiddenContext.clearRect(-1000000, -10000, 2000000, 2000000)
  }

  // 绘制方法
  draw(data) {
    this.data = this.d3.hierarchy(data)
    // 定义 树生成器
    this.treeGenerator = this.d3
      .tree()
      .nodeSize([this.nodeWidth, this.nodeHeight])
    // 对各个需要更新的数据进行更新
    this.update()

    let self = this
    this.d3.timer(function() {
      self.drawCanvas()
    })
  }

  // 更新目标节点
  update(targetTreeNode) {
    this.treeData = this.treeGenerator(this.data)
    let nodes = this.treeData.descendants()
    let links = this.treeData.links()

    let animatedStartX = 0
    let animatedStartY = 0
    let animatedEndX = 0
    let animatedEndY = 0
    if (targetTreeNode) {
      animatedStartX = targetTreeNode.x0
      animatedStartY = targetTreeNode.y0
      animatedEndX = targetTreeNode.x
      animatedEndY = targetTreeNode.y
    }

    // 更新单元块儿
    this.updateOrgUnits(
      nodes,
      animatedStartX,
      animatedStartY,
      animatedEndX,
      animatedEndY
    )
    // 更新连接线
    this.updateLinks(
      links,
      animatedStartX,
      animatedStartY,
      animatedEndX,
      animatedEndY
    )

    // 设置上唯一颜色
    this.addColorKey()
    // 虚拟节点绑定至树形数据结构上
    this.bindNodeToTreeData()
  }

  // 更新单元块儿
  updateOrgUnits(
    nodes,
    animatedStartX,
    animatedStartY,
    animatedEndX,
    animatedEndY
  ) {
    const orgUnitSelection = this.virtualContainerNode
      .selectAll('.orgUnit')
      .data(nodes, d => d['colorKey'])

    orgUnitSelection
      .attr('class', 'orgUnit')
      .attr('x', function(data) {
        return data.x0
      })
      .attr('y', function(data) {
        return data.y0
      })
      .transition()
      .duration(this.duration)
      .attr('x', function(data) {
        return data.x
      })
      .attr('y', function(data) {
        return data.y
      })
      .attr('fillStyle', '#ff0000')

    orgUnitSelection
      .enter()
      .append('orgUnit')
      .attr('class', 'orgUnit')
      .attr('x', animatedStartX)
      .attr('y', animatedStartY)
      .transition()
      .duration(this.duration)
      .attr('x', function(data) {
        return data.x
      })
      .attr('y', function(data) {
        return data.y
      })
      .attr('fillStyle', '#ff0000')

    orgUnitSelection
      .exit()
      .transition()
      .duration(this.duration)
      .attr('x', animatedEndX)
      .attr('y', animatedEndY)
      .remove()

    // record origin index for animation
    nodes.forEach(treeNode => {
      treeNode['x0'] = treeNode.x
      treeNode['y0'] = treeNode.y
    })
  }

  updateLinks(
    links,
    animatedStartX,
    animatedStartY,
    animatedEndX,
    animatedEndY
  ) {
    let linkSelection = this.virtualContainerNode
      .selectAll('.link')
      .data(links, function(d) {
        return d.source['colorKey'] + ':' + d.target['colorKey']
      })

    linkSelection
      .attr('class', 'link')
      .attr('sourceX', function(linkData) {
        return linkData.source['x00']
      })
      .attr('sourceY', function(linkData) {
        return linkData.source['y00']
      })
      .attr('targetX', function(linkData) {
        return linkData.target['x00']
      })
      .attr('targetY', function(linkData) {
        return linkData.target['y00']
      })
      .transition()
      .duration(this.duration)
      .attr('sourceX', function(linkData) {
        return linkData.source.x
      })
      .attr('sourceY', function(linkData) {
        return linkData.source.y
      })
      .attr('targetX', function(linkData) {
        return linkData.target.x
      })
      .attr('targetY', function(linkData) {
        return linkData.target.y
      })

    linkSelection
      .enter()
      .append('link')
      .attr('class', 'link')
      .attr('sourceX', animatedStartX)
      .attr('sourceY', animatedStartY)
      .attr('targetX', animatedStartX)
      .attr('targetY', animatedStartY)
      .transition()
      .duration(this.duration)
      .attr('sourceX', function(link) {
        return link.source.x
      })
      .attr('sourceY', function(link) {
        return link.source.y
      })
      .attr('targetX', function(link) {
        return link.target.x
      })
      .attr('targetY', function(link) {
        return link.target.y
      })

    linkSelection
      .exit()
      .transition()
      .duration(this.duration)
      .attr('sourceX', animatedEndX)
      .attr('sourceY', animatedEndY)
      .attr('targetX', animatedEndX)
      .attr('targetY', animatedEndY)
      .remove()

    // record origin data for animation
    links.forEach(treeNode => {
      treeNode.source['x00'] = treeNode.source.x
      treeNode.source['y00'] = treeNode.source.y
      treeNode.target['x00'] = treeNode.target.x
      treeNode.target['y00'] = treeNode.target.y
    })
    linkSelection = null
  }

  // 给每个节点都添加上唯一的颜色
  addColorKey() {
    // give each node a unique color
    let self = this
    this.virtualContainerNode.selectAll('.orgUnit').each(function() {
      let node = self.d3.select(this)
      let newColor = Util.randomColor()
      while (self.colorNodeMap[newColor]) {
        newColor = Util.randomColor()
      }
      node.attr('colorKey', newColor)
      node.data()[0]['colorKey'] = newColor
      self.colorNodeMap[newColor] = node
    })
  }

  //  把虚拟节点绑定在树形数据上
  bindNodeToTreeData() {
    let self = this
    this.virtualContainerNode.selectAll('.orgUnit').each(function() {
      let node = self.d3.select(this)
      let data = node.data()[0]
      data['node'] = node
    })
  }

  // 正式绘制实际的canvas
  drawCanvas() {
    this.drawShowCanvas()
    this.drawHiddenCanvas()
  }

  drawShowCanvas() {
    this.context.clearRect(-50000, -10000, 100000, 100000)

    let self = this
    // draw links
    this.virtualContainerNode.selectAll('.link').each(function() {
      let node = self.d3.select(this)
      let linkPath = self.d3
        .linkVertical()
        .x(function(d) {
          return d.x
        })
        .y(function(d) {
          return d.y
        })
        .source(function() {
          return { x: node.attr('sourceX'), y: node.attr('sourceY') }
        })
        .target(function() {
          return { x: node.attr('targetX'), y: node.attr('targetY') }
        })
      let path = new Path2D(linkPath())
      self.context.stroke(path)
    })

    this.virtualContainerNode.selectAll('.orgUnit').each(function() {
      let node = self.d3.select(this)
      let treeNode = node.data()[0]
      let data = treeNode.data
      self.context.fillStyle = '#3ca0ff'
      let indexX = Number(node.attr('x')) - self.unitWidth / 2
      let indexY = Number(node.attr('y')) - self.unitHeight / 2

      // draw unit outline rect (if you want to modify this line ===>   please modify the same line in `drawHiddenCanvas`)
      Util.roundRect(
        self.context,
        indexX,
        indexY,
        self.unitWidth,
        self.unitHeight,
        4,
        true,
        false
      )

      Util.text(
        self.context,
        data.name,
        indexX + self.unitPadding,
        indexY + self.unitPadding,
        '20px',
        '#ffffff'
      )
      // Util.text(self.context, data.title, indexX + self.unitPadding, indexY + self.unitPadding + 30, '20px', '#000000')
      let maxWidth = self.unitWidth - 2 * self.unitPadding
      Util.wrapText(
        self.context,
        data.title,
        indexX + self.unitPadding,
        indexY + self.unitPadding + 24,
        maxWidth,
        20
      )
    })
  }

  drawHiddenCanvas() {
    this.hiddenContext.clearRect(-50000, -10000, 100000, 100000)

    let self = this
    this.virtualContainerNode.selectAll('.orgUnit').each(function() {
      let node = self.d3.select(this)
      self.hiddenContext.fillStyle = node.attr('colorKey')
      Util.roundRect(
        self.hiddenContext,
        Number(node.attr('x')) - self.unitWidth / 2,
        Number(node.attr('y')) - self.unitHeight / 2,
        self.unitWidth,
        self.unitHeight,
        4,
        true,
        false
      )
    })
  }
}

export default Tree;
