// 逐片元计算光照颜色（代替内插，更真实）基于点光源的光照效果-立方体
// 顶点着色器
var VSHADER_SOURCE = 
  'attribute vec4 a_Position;\n' + 
  'attribute vec4 a_Color;\n' + //表面基底色
  'attribute vec4 a_Normal;\n' +        // 法向量
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_ModelMatrix;\n' + //模型矩阵
  'uniform mat4 u_NormalMatrix;\n'+ //用来变换法向量的矩阵
  'varying vec4 v_Color;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_Position;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position ;\n' +
  //计算顶点的世界坐标
  '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +
  '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// 片元着色器
var FSHADER_SOURCE = 
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform vec3 u_LightColor;\n' +//光的颜色
  'uniform vec3 u_LightPosition;\n'  + //光源位置
  'uniform vec3 u_AmbientLight;\n' + //环境光颜色
  'varying vec3 v_Normal;\n' + 
  'varying vec3 v_Position;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  //对法线进行归一化，因为其内插之后长度不一定是1.0
  '  vec3 normal = normalize(v_Normal);\n' +
  //计算光线方向并归一化
  '  vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' +
  // 计算光线方向和法向量的点积
  '  float nDotL = max(dot(lightDirection, normal),0.0);\n' +
  // 计算diffuse、ambient以及最终的颜色
  '  vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;\n' +
  '  vec3 ambient = u_AmbientLight * v_Color.rgb;\n' +
  '  gl_FragColor = vec4(diffuse + ambient, v_Color.a);\n' +
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
  var u_ModelMatrix = gl.getUniformLocation(gl.program,'u_ModelMatrix');
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program,'u_NormalMatrix');
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
  var u_AmbientLight = gl.getUniformLocation(gl.program,'u_AmbientLight');
  if (!u_MvpMatrix || !u_LightColor || !u_LightPosition || !u_AmbientLight) { 
    console.log('Failed to get the storage location');
    return;
  }

  // 设置光线的颜色为白色
  gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
  // 设置光源的位置 (世界坐标)
  gl.uniform3f(u_LightPosition, 2.3,4.0,3.5);
  //传入环境光颜色
  gl.uniform3f(u_AmbientLight,0.2,0.2,0.2);
  
  var modelMatrix = new Matrix4();//模型矩阵
  var mvpMatrix = new Matrix4();    // 模型视图投影矩阵
  var normalMatrix = new Matrix4(); // 用来变换法向量的矩阵

  // 计算模型矩阵
  modelMatrix.setRotate(90,0,1,0); // 沿y轴平移
  // 将模型矩阵传给u_ModelMatrix变量
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  // 计算模型视图投影矩阵
  mvpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
  mvpMatrix.lookAt(6, 6, 14, 0, 0, 0, 0, 1, 0);
  mvpMatrix.multiply(modelMatrix);
  // 将矩阵传递给 u_MvpMatrix 变量
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  // 根据模型矩阵计算用来变换法向量的矩阵
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  //将用来变换法向量的矩阵传给u_NormalMatrix变量
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  // 清除颜色和深度缓冲
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);   // 绘制立方体
}

function initVertexBuffers(gl) {
  // 创建一个立方体
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  var vertices = new Float32Array([   // 坐标
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // v0-v1-v2-v3 前
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // v0-v3-v4-v5 右
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // v0-v5-v6-v1 上
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // v1-v6-v7-v2 左
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // v7-v4-v3-v2 下
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // v4-v7-v6-v5 后
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


  // 将顶点数据写入缓冲区 (坐标，颜色，法向量)
  if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)) return -1;
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

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return true;
}
