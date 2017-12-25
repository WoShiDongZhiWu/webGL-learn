// 绘制机器人手臂，包括上臂和前臂，使用层次结构模型，单关节模型
// 顶点着色器
var VSHADER_SOURCE = 
  'attribute vec4 a_Position;\n' + 
  'attribute vec4 a_Normal;\n' +        // 法向量
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n'+ //用来变换法向量的矩阵
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position ;\n' +
  //计算颜色
  '  vec3 lightDirection = normalize(vec3(0.0,0.5,0.7));\n' + 
  '  vec4 color = vec4(1.0,0.4,0.0,1.0);\n' + 
  '  vec3 normal = normalize((u_NormalMatrix * a_Normal).xyz);\n' +
  '  float nDotL = max(dot(normal, lightDirection),0.0);\n'+
  '  v_Color = vec4(color.rgb * nDotL + vec3(0.1),color.a);\n' +
  '}\n';

// 片元着色器
var FSHADER_SOURCE = 
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

function main() {
  // 获取<canvas>
  var canvas = document.getElementById('webgl');

  // 获取渲染的context
  var gl = canvas.getContext('webgl')
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // 初始化着色器
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // 设置顶点坐标、颜色、法向量
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // 设置背景颜色，开启隐藏面消除功能
  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);

  // 获取uniform变量的存储位置
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program,'u_NormalMatrix');
  if (!u_MvpMatrix ||!u_NormalMatrix) { 
    console.log('Failed to get the storage location');
    return;
  }

  // 计算视图投影矩阵
  var viewProjMatrix = new Matrix4();
  viewProjMatrix.setPerspective(50.0,canvas.clientWidth/canvas.clientHeight,1.0,100);
  viewProjMatrix.lookAt(20.0,10.0,30.0,0.0,0.0,0.0,0.0,1.0,0.0);

  //注册键盘事件响应函数
  document.onkeydown = function(ev){keydown(ev,gl,n,viewProjMatrix,u_MvpMatrix,u_NormalMatrix);};

  // 绘制机器人手臂
  draw(gl,n,viewProjMatrix,u_MvpMatrix,u_NormalMatrix);
}

var ANGLE_STEP = 3.0;//每次按键转动的角度
var g_arm1Angle = -90.0; // arm1的当前角度
var g_jointAngle = 0.0; //joint1的当前角度(及arm2的角度)
function keydown(ev,gl,n,viewProjMatrix,u_MvpMatrix,u_NormalMatrix){
  switch (ev.keyCode) {
    case 38: //上方向键 joint1绕z轴正向旋转
      if (g_jointAngle <135.0) g_jointAngle += ANGLE_STEP;
      break;
    case 40: //下方向键 joint1绕z轴负方向旋转
      if (g_jointAngle >-135.0) g_jointAngle -= ANGLE_STEP;
      break;
    case 39: // 右方向键 arm1绕y轴正方向旋转
      g_arm1Angle = (g_arm1Angle +ANGLE_STEP) % 360;
      break;
    case 37: //左方向键 arm1绕y轴负方向旋转
      g_arm1Angle = (g_arm1Angle - ANGLE_STEP) % 360;
      break;
    default: return; //
  }
  // 绘制手臂
  draw(gl,n,viewProjMatrix,u_MvpMatrix,u_NormalMatrix);
}
function initVertexBuffers(gl) {
  // 创建一个立方体,长3，宽3，高10

  var vertices = new Float32Array([
    1.5, 10.0, 1.5, -1.5, 10.0, 1.5, -1.5,  0.0, 1.5,  1.5,  0.0, 1.5, // v0-v1-v2-v3 front
    1.5, 10.0, 1.5,  1.5,  0.0, 1.5,  1.5,  0.0,-1.5,  1.5, 10.0,-1.5, // v0-v3-v4-v5 right
    1.5, 10.0, 1.5,  1.5, 10.0,-1.5, -1.5, 10.0,-1.5, -1.5, 10.0, 1.5, // v0-v5-v6-v1 up
   -1.5, 10.0, 1.5, -1.5, 10.0,-1.5, -1.5,  0.0,-1.5, -1.5,  0.0, 1.5, // v1-v6-v7-v2 left
   -1.5,  0.0,-1.5,  1.5,  0.0,-1.5,  1.5,  0.0, 1.5, -1.5,  0.0, 1.5, // v7-v4-v3-v2 down
    1.5,  0.0,-1.5, -1.5,  0.0,-1.5, -1.5, 10.0,-1.5,  1.5, 10.0,-1.5  // v4-v7-v6-v5 back
  ]);


  var colors = new Float32Array([    // 颜色
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 前
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 右
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 上
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 左
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 下
    1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 后
 ]);


  var normals = new Float32Array([    // 法向量
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 前
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 右
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 上
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 左
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 下
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 后
  ]);


  // 设置顶点索引
  var indices = new Uint8Array([
     0, 1, 2,   0, 2, 3,    // 前
     4, 5, 6,   4, 6, 7,    // 右
     8, 9,10,   8,10,11,    // 上
    12,13,14,  12,14,15,    // 左
    16,17,18,  16,18,19,    // 下
    20,21,22,  20,22,23     // 后
 ]);


  // 将顶点数据写入缓冲区 (坐标，法向量)
  if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;

  // 将索引写入缓冲区对象
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

function initArrayBuffer (gl, attribute, data, num, type) {
  // 创建缓冲区对象
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // 将数据写入缓冲区对象
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // 将缓冲区分配给对应的属性
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('获取失败 ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // 开启缓冲区对象
  gl.enableVertexAttribArray(a_attribute);

  return true;
}
//坐标变换矩阵
var g_modelMatrix = new Matrix4(),g_mvpMatrix = new Matrix4();

function draw(gl,n,viewProjMatrix,u_MvpMatrix,u_NormalMatrix){
  //清除颜色和深度缓冲区
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Arm1
  var arm1Length = 10.0;// arm1的长度
  g_modelMatrix.setTranslate(0.0,-12.0,0.0);
  g_modelMatrix.rotate(g_arm1Angle,0.0,1.0,0.0);//绕y轴旋转
  drawBox(gl,n,viewProjMatrix,u_MvpMatrix,u_NormalMatrix);

  // Arm2 
  g_modelMatrix.translate(0.0, arm1Length, 0.0); 　　　// 移至joint1处
  g_modelMatrix.rotate(g_jointAngle, 0.0, 0.0, 1.0);  // 绕z轴旋转
  g_modelMatrix.scale(1.3, 1.0, 1.3); // 使立方体粗一点
  drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix); // 绘制
}

var g_normalMatrix = new Matrix4(); // 法线的旋转矩阵

// 绘制立方体
function drawBox(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix) {
  // 计算模型视图矩阵并传给u_MvpMatrix变量
  g_mvpMatrix.set(viewProjMatrix);
  g_mvpMatrix.multiply(g_modelMatrix);
  gl.uniformMatrix4fv(u_MvpMatrix, false, g_mvpMatrix.elements);
  // 计算法线变换矩阵并传给u_NormalMatrix变量
  g_normalMatrix.setInverseOf(g_modelMatrix);
  g_normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);
  // 绘制
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}
