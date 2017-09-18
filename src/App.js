import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import { coordinate } from './utils/offset.js';

// 没有必要用 React ，只是方便用 es6 的语法，比较方便
// React 是通过数据来展现对应的界面，而 canvas 是先获取 canvas 再进行操作。所以变量就放在全局，不适合放在 state 中

// global variables

let size = 20; // 细胞大小
let speed = 150; // 运行速度 ms
let template = 'empty';

let currentArr = null; // 标识细胞状态的二维数组, 当前状态
let nextArr = null; // 标识细胞状态的二维数组, 接下来状态
const live_colors = ["#ee3b3b", "#ff7f24", "#eead00", "#66cd00", "#698d69", "#00ced1", "#b23aee", "#333333"];
let live_colors_count = 0;
let running = null; // 是否运行中

let colCount = null;
let rowCount = null;

let mouseDrawing = false; // 鼠标是否绘制中
let mouseDrawType = null; // 鼠标绘制状态，1为绘制，2为擦除

// 初始化数组
const init = () => {
  nextArr = [];
  let threshold = 0;

  switch (template) {
    case 'empty':
      threshold = 2;
      break;
    case 'small':
      threshold = 3 / 4;
      break;
    case 'medium':
      threshold = 2 / 4;
      break;
    case 'large':
      threshold = 1 / 4;
      break;
  }

  for (let i = 0; i < colCount; i++) {
    nextArr[i] = [];
    for (let j = 0; j < rowCount; j++) {
      nextArr[i][j] = Math.random() > threshold ? 1 : 0;
      // nextArr[i][j] = 0;
    }
  }

};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // dom 相关属性
      canvasContainerWidth: 0,
      canvasContainerHeight: 0,
      canvasWidth: 0,
      canvasHeight: 0,
      canvasMarginTop: 0,
      // data
      generation: 0, // 当前回合数
      computeTime: 0, // 本回合计算时间
      renderTime: 0, // 本回合绘制时间
      // disable
      template_disabled: false,
      initiate_disabled: false,
      begin_disabled: false,
      next_disabled: false,
      size_disabled: false,
      speed_disabled: false,
      // color
      live_color: live_colors[0], // 活细胞颜色
      death_color: '#CCC', // 死细胞颜色
    };

    this.draw = this.draw.bind(this);
    this.initiate = this.initiate.bind(this);
    this.begin = this.begin.bind(this);
    this.timer = this.timer.bind(this);
    this.next = this.next.bind(this);
    this.stop = this.stop.bind(this);
    this.compute = this.compute.bind(this);
    this.handleSizeChange = this.handleSizeChange.bind(this);
    this.handleSpeedChange = this.handleSpeedChange.bind(this);
    this.handleColorChange = this.handleColorChange.bind(this);
    this.handleCanvasMouseDown = this.handleCanvasMouseDown.bind(this);
    this.handleCanvasMouseMove = this.handleCanvasMouseMove.bind(this);
    this.handleCanvasMouseUp = this.handleCanvasMouseUp.bind(this);
    this.drawSingle = this.drawSingle.bind(this);
    this.getNextArray = this.getNextArray.bind(this);
  }
  // 计算canvas和canvasContainer的宽度高度等属性，在改变细胞大小的时候才会调用
  compute() {
    // 计算 行，列个数 和 canvasContainer canvas 宽度高度
    currentArr = null;
    nextArr = null;
    const canvasContainerWidth = document.body.scrollWidth - 20;
    const canvasContainerHeight = document.body.scrollHeight - document.getElementById('panel').scrollHeight - 10;
    colCount = Math.floor((canvasContainerWidth - 1) / size);
    rowCount = Math.floor(canvasContainerHeight / size);
    const canvasWidth = colCount * size + 1;
    const canvasHeight = rowCount * size + 1;
    const canvasMarginTop = (canvasContainerHeight - canvasHeight) / 2;

    this.setState({
      canvasContainerWidth,
      canvasContainerHeight,
      canvasWidth,
      canvasHeight,
      canvasMarginTop,
    }, () => {
      init();
      this.draw();
    });
  }
  // 根据当前数组计算下一状态的数组
  getNextArray() {
    const start_time = new Date();
    nextArr = [];

    for (let i = 0; i < colCount; i++) {
      nextArr[i] = [];
      for (let j = 0; j < rowCount; j++) {
        // 有3个邻居存活，2个保持原样，其他死亡
        let liveCount = 0;

        if (i !== 0 && j !== 0) {
          if (currentArr[i - 1][j - 1] !== 0) liveCount++; // 左上角
        }
        if (j !== 0) {
          if (currentArr[i][j - 1] !== 0) liveCount++; // 上方
        }
        if (i !== colCount - 1 && j !== 0) {
          if (currentArr[i + 1][j - 1]) liveCount++; // 右上角
        }
        if (i !== colCount - 1) {
          if (currentArr[i + 1][j]) liveCount++; // 右方
        }
        if (i !== colCount - 1 && j !== rowCount - 1) {
          if (currentArr[i + 1][j + 1]) liveCount++; // 右下角
        }
        if (j !== rowCount - 1) {
          if (currentArr[i][j + 1]) liveCount++; // 下方
        }
        if (j !== rowCount - 1 && i !== 0) {
          if (currentArr[i - 1][j + 1]) liveCount++; // 左下角
        }
        if (i !== 0) {
          if (currentArr[i - 1][j]) liveCount++; // 左方
        }

        switch (liveCount) {
          case 3:
            nextArr[i][j] = 1;
            break;
          case 2:
            nextArr[i][j] = currentArr[i][j];
            break;
          default:
            nextArr[i][j] = 0;
            break;
        }

      }
    }
    const end_time = new Date();
    this.setState({ computeTime: end_time - start_time });
  }
  // 根据下一状态数组绘制
  draw() {
    const start_time = new Date();
    const ctx = this.canvas.getContext('2d');
    // 没有计算下一状态，则重新绘制当前状态
    if (nextArr === null) {
      nextArr = currentArr;
    }

    for (let i = 0; i < colCount; i++) {
      for (let j = 0; j < rowCount; j++) {
        // 改变状态的部分才会重新绘制，这样很小的细胞大小时候绘制时间从 200ms 左右减少到了 30ms 左右，
        // currentArr 为 null 时进行全部重绘
        // 绘制的数据是nextArr, 与currentArr进行对比进行优化
        if (currentArr === null || nextArr[i][j] !== currentArr[i][j]) {
          if (nextArr[i][j] === 1) {
            ctx.fillStyle = this.state.live_color;
          } else {
            ctx.fillStyle = this.state.death_color;
          }

          if (size < 3) {
            ctx.fillRect(i * size, j * size, size, size);
          } else {
            ctx.fillRect(i * size + 1, j * size + 1, size - 1, size - 1);
          }
        }
      }
    }

    currentArr = nextArr;
    nextArr = null;

    const end_time = new Date();
    this.setState({ renderTime: end_time - start_time });

  }
  // 绘制单个细胞
  drawSingle(row, col, mouseDrawType) {
    const ctx = this.canvas.getContext('2d');
    ctx.fillStyle = mouseDrawType ? this.state.live_color : this.state.death_color;
    if (size < 3) {
      ctx.fillRect(col * size, row * size, size, size);
    } else {
      ctx.fillRect(col * size + 1, row * size + 1, size - 1, size - 1);
    }
  }
  // 初始化
  initiate() {
    this.setState({
      generation: 0,
      computeTime: 0,
      renderTime: 0,
    });
    init();
    this.draw();
  }
  // 组件加载完进行计算绘制
  componentDidMount() {
    this.compute();
  }
  // 开始自动迭代
  begin() {
    this.setState({
      template_disabled: true,
      initiate_disabled: true,
      begin_disabled: true,
      next_disabled: true,
      size_disabled: true,
      speed_disabled: false,
    });
    running = true;
    this.timer();
  }
  // 迭代器
  timer() {
    if (running) {
      this.setState({ generation: ++this.state.generation });
      this.getNextArray();
      this.draw();
      setTimeout(this.timer, speed);
    }
  }
  // 单步
  next() {
    this.setState({ generation: ++this.state.generation });
    this.getNextArray();
    this.draw();
  }
  // 停止
  stop() {
    this.setState({
      template_disabled: false,
      initiate_disabled: false,
      begin_disabled: false,
      next_disabled: false,
      size_disabled: false,
      speed_disabled: false,
    });
    running = false;
  }
  // 改变细胞大小
  handleSizeChange(e) {
    size = e.target.value;
    this.compute();
  }
  // 改变速度
  handleSpeedChange(e) {
    speed = e.target.value;
  }
  // 改变颜色
  handleColorChange() {
    live_colors_count = live_colors_count === live_colors.length - 1 ? 0 : ++live_colors_count;
    this.setState({
      live_color: live_colors[live_colors_count],
    }, () => {
      // 这里需要把currentArr 设置为 null 进行全部重绘，不然稳定部分不会改变颜色
      nextArr = currentArr;
      currentArr = null;
      this.draw();
    });
  }
  // 改变模版
  handleTemplateChange(e) {
    template = e.target.value;
  }
  // 左键生，右键死
  handleCanvasMouseDown(e) {
    const coord = coordinate(e);
    mouseDrawType = 1;
    mouseDrawing = true;
    if (e.button === 2) mouseDrawType = 0;
    const row = Math.floor(coord.coord_Y / size);
    const col = Math.floor(coord.coord_X / size);
    // 只有需要改变状态的时候才会重新绘制那个细胞
    if (row < rowCount && col < colCount && currentArr[col][row] !== mouseDrawType) {
      currentArr[col][row] = mouseDrawType;
      this.drawSingle(row, col, mouseDrawType);
    }
  }

  handleCanvasMouseMove(e) {
    const coord = coordinate(e);
    if (mouseDrawing) {
      const row = Math.floor(coord.coord_Y / size);
      const col = Math.floor(coord.coord_X / size);
      // 只有需要改变状态的时候才会重新绘制那个细胞
      if (row < rowCount && col < colCount && currentArr[col][row] !== mouseDrawType) {
        currentArr[col][row] = mouseDrawType;
        this.drawSingle(row, col, mouseDrawType);
      }
    }
  }

  handleCanvasMouseUp(e) {
    mouseDrawing = false;
    mouseDrawType = null;
  }

  render() {
    const { canvasContainerWidth, canvasContainerHeight, canvasWidth, canvasHeight, canvasMarginTop } = this.state;
    const color_style = {
      position: 'relative',
      top: '10px',
      display: 'inline-block',
      width: '30px',
      height: '30px',
      border: '1px solid black',
      borderRadius: '2px',
      backgroundColor: this.state.live_color,
      cursor: 'pointer',
    };
    return (
      <div>
        <div className="panel" id="panel">
          <div className="top_panel">
            模版：
            <select name="template" onChange={this.handleTemplateChange} disabled={this.state.template_disabled}>
              <option value="empty">空</option>
              <option value="small">少量随机</option>
              <option value="medium">中等随机</option>
              <option value="large">大量随机</option>
            </select>
            <button onClick={this.initiate} disabled={this.state.initiate_disabled}>初始化</button>
            操作：
            <button onClick={this.begin} disabled={this.state.begin_disabled}>开始</button>
            <button onClick={this.next} disabled={this.state.next_disabled}>单步</button>
            <button onClick={this.stop}>停止</button>
            尺寸：
            <select name="size" onChange={this.handleSizeChange} disabled={this.state.size_disabled} >
              <option value="35">很大</option>
              <option value="30">大</option>
              <option value="20" selected>中</option>
              <option value="5">小</option>
              <option value="2">很小</option>
            </select>
            速度：
            <select name="speed" onChange={this.handleSpeedChange} disabled={this.state.speed_disabled}>
              <option value="800">很慢</option>
              <option value="400">慢</option>
              <option value="150" selected>中</option>
              <option value="40">快</option>
              <option value="0">很快</option>
            </select>
            颜色：
            <div style={color_style} onClick={this.handleColorChange}></div>
          </div>
          <div className="bottom_panel">
            数据：
            <span>当前回合数：{this.state.generation}</span>
            <span>本回合计算时间：{this.state.computeTime} ms</span>
            <span>本回合绘制时间：{this.state.renderTime} ms</span>
          </div>
        </div>
        <div className="canvas-container" style={{width: `${canvasContainerWidth}px`, height: `${canvasContainerHeight}px` }}>
          <canvas
            className="canvas"
            ref={canvas => this.canvas = canvas}
            style={{ marginTop: `${canvasMarginTop}px` }}
            width={`${canvasWidth}px`}
            height={`${canvasHeight}px`}
            onMouseDown={this.handleCanvasMouseDown}
            onMouseMove={this.handleCanvasMouseMove}
            onMouseUp={this.handleCanvasMouseUp}
            onContextMenu={(e) => {e.preventDefault()}}
          ></canvas>
        </div>
      </div>
    );
  }
}

export default App;
