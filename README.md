# 生命游戏

[预览](https://codearvin.github.io/life-game)

[参考教程](https://zhuanlan.zhihu.com/p/29102071)

## 简介
> 生命游戏（Game of Life），或者叫它的全称John Conway's Game of Life。是英国数学家约翰·康威在1970年代所发明的一种元胞自动机。
>所谓元胞自动机其实是一种离散的状态机，即无数个独立的格子，每个格子处于某种状态，然后所有格子按照预先设定好的规律进行状态演化。格子们可以是任意维度. 任意形状. 按任意规律排布的。
>而生命游戏就是最简单的元胞自动机之一——在二维平面上的方格子（细胞），每个细胞有两种状态：死或活，而下一回合的状态完全受它周围8个细胞的状态而定。按照以下三条规则进行演化：
>1. 活细胞周围的细胞数如果小于2个或多于3个则会死亡；（离群或过度竞争导致死亡）
>2. 活细胞周围如果有2或3个细胞可以继续存活；（正常生存）
>3. 死细胞（空格）周围如果恰好有3个细胞则会诞生新的活细胞。（繁殖）
>这三条规则简称B3/S23。如果调整规则对应的细胞数量，还能衍生出其他类型的自动机。

引用自参考教程

## 功能
  - [x] 在网页以单元格颜色变化模拟细胞的进化迭代
  - [x] 运行. 单步. 停止
  - [x] 生成随机密度的初始化模版
  - [x] 调节运行速度
  - [x] 状态显示
  - [x] 优化绘制过程
  - [x] 调节细胞显示尺寸
  - [x] 改变细胞颜色
  - [x] 鼠标左键绘制，右键擦除，支持拖拽
  - [ ] 提供更多的初始化模版
  - [ ] 显示更多的数据
  - [ ] 可以通过调色板选择细胞颜色
  - [ ] 现在的进化规则是B3/S23，再添加一种B36/S23
  - [ ] 支持导入、导出RLE格式
  - [ ] 支持导出GIF
  - [ ] 可以插入由RLE格式生成的图形
  - [ ] 适配移动端

## 使用的工具
[create-react-app](https://github.com/facebookincubator/create-react-app)

[gh-page](https://www.npmjs.com/package/gh-pages) 用来发布到Github

## 记录
1. 通过一个二维数组标识细胞的状态：0为死细胞、1为活细胞
2. 通过判断细胞八个相邻细胞的状态来计算出下一状态的二维数组(注意边界判断)
3. 由于setState是异步操作，所以如果某些操作改变了state的值，我们需要在setState的第二个参数里才能取到更新后的state值
4. 我感觉这个项目不适合在React里面写，React是数据驱动页面的更新，而canvas绘图则是先获取canvas元素再进行操作
5. 绘制的时候判断细胞状态是否发生改变，改变才会进行重绘，提高效率
6. 获取鼠标点击位置相对于点击元素的坐标代码，**这里有个bug**就是如果用Mac的触控板对页面进行放大的话(不是缩放)，`e.clientX`和`e.clientY`获取的值会不正确，`e.clientX`获取的值应该是点击位置在浏览器可视区域的坐标。但放大后获取的值和未放大点击对应位置的值是一样的。但而`window.scrollX`的值是正常的，这就导致了点击对应细胞单元格后发生变化的是另一个单元格。**这个bug目前还没有解决**
    ```javascript
    const getPageCoord = (target) => {
      let coord = { X: 0, Y: 0 };
      let element = target;
      while (element) {
        coord.X += element.offsetLeft;
        coord.Y += element.offsetTop;
        element = element.offsetParent;
      }
      return coord;
    };

    const getOffset = (e) => {
      const target = e.target;
      let pageCoord = getPageCoord(target);
      const eventCoord = {
        X: window.pageXOffset + e.clientX,
        Y: window.pageYOffset + e.clientY,
      };
      console.log('pageCoord', pageCoord, e.clientX, e.clientY);
      return {
        X: eventCoord.X - pageCoord.X,
        Y: eventCoord.Y - pageCoord.Y,
      };
    };

    const coordinate = (e) => {
       e = e || window.event;
      return {
        coord_X: e.offsetX ? e.offsetX : getOffset(e).X,
        coord_Y: e.offsetY ? e.offsetY : getOffset(e).Y,
      };
    };
    ```
7. `window.pageXOffset`是`window.scrollX`的别名，为了跨浏览器兼容性，请使用 `window.pageXOffset` 代替 `window.scrollX`
