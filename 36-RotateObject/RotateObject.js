// 使用鼠标控制旋转三角形
// 顶点着色器
var VSHADER_SOURCE =
'attribute vec4 a_Position;\n' +
'attribute vec2 a_TexCoord;\n' +
'uniform mat4 u_MvpMatrix;\n' +
'varying vec2 v_TexCoord;\n' +
'void main() {\n' +
'  gl_Position = u_MvpMatrix * a_Position;\n' +
'  v_TexCoord = a_TexCoord;\n' +
'}\n';

// 片元着色器
var FSHADER_SOURCE =
'#ifdef GL_ES\n' +
'precision mediump float;\n' +
'#endif\n' +
'uniform sampler2D u_Sampler;\n' +
'varying vec2 v_TexCoord;\n' +
'void main() {\n' +
'  gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' +
'}\n';

function main() {
// Retrieve <canvas> element
var canvas = document.getElementById('webgl');

// Get the rendering context for WebGL
var gl = canvas.getContext('webgl');
if (!gl) {
  console.log('Failed to get the rendering context for WebGL');
  return;
}

// Initialize shaders
if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
  console.log('Failed to intialize shaders.');
  return;
}

// Set the vertex information
var n = initVertexBuffers(gl);
if (n < 0) {
  console.log('Failed to set the vertex information');
  return;
}

// Set the clear color and enable the depth test
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.enable(gl.DEPTH_TEST);

// Get the storage locations of uniform variables
var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
if (!u_MvpMatrix ) {
  console.log('Failed to get the storage location');
  return;
}

// Calculate the view projection matrix
var viewProjMatrix = new Matrix4();
viewProjMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0);
viewProjMatrix.lookAt(3.0, 3.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

//注册时间响应函数
var currentAngle = [0.0,0.0];//绕x轴旋转角度，绕y轴旋转角度
initEventHandlers(canvas, currentAngle);

//初始化纹理
if(!initTextures(gl)){
  console.log('error');
  return;
}

var tick = function(){
  draw(gl,n,viewProjMatrix,u_MvpMatrix,currentAngle);
  requestAnimationFrame(tick,canvas);
}
tick();
}

function initVertexBuffers(gl) {
// Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  var vertices = new Float32Array([   // Vertex coordinates
    1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
    1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
    1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
   -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
   -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
    1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
 ]);

 var texCoords = new Float32Array([   // 设置纹理坐标
  1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v0-v1-v2-v3 front
  0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v0-v3-v4-v5 right
  1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,    // v0-v5-v6-v1 up
  1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v1-v6-v7-v2 left
  0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,    // v7-v4-v3-v2 down
  0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0     // v4-v7-v6-v5 back
]);

// 设置顶点索引
var indices = new Uint8Array([
   0, 1, 2,   0, 2, 3,    // front
   4, 5, 6,   4, 6, 7,    // right
   8, 9,10,   8,10,11,    // up
  12,13,14,  12,14,15,    // left
  16,17,18,  16,18,19,    // down
  20,21,22,  20,22,23     // back
]);

 // Create a buffer object
 var indexBuffer = gl.createBuffer();
 if (!indexBuffer) {
   return -1;
 }

 // Write vertex information to buffer object
 if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position')) return -1; // Vertex coordinates
 if (!initArrayBuffer(gl, texCoords, 2, gl.FLOAT, 'a_TexCoord')) return -1;// Texture coordinates

 // Unbind the buffer object
 gl.bindBuffer(gl.ARRAY_BUFFER, null);

 // Write the indices to the buffer object
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
 gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

 return indices.length;
}

function initEventHandlers(canvas, currentAngle) {
 var dragging = false;         // 是否在拖动
 var lastX = -1, lastY = -1;   // 鼠标的组后位置

 canvas.onmousedown = function(ev) {   // 按下鼠标
   var x = ev.clientX, y = ev.clientY;
   // 如果鼠标在canvas内就开始拖动
   var rect = ev.target.getBoundingClientRect();
   if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
     lastX = x; lastY = y;
     dragging = true;
   }
 };

 canvas.onmouseup = function(ev) { dragging = false;  }; // 松开鼠标

 canvas.onmousemove = function(ev) { // Mouse is moved
   var x = ev.clientX, y = ev.clientY;
   if (dragging) {
     var factor = 100/canvas.height; // The rotation ratio
     var dx = factor * (x - lastX);
     var dy = factor * (y - lastY);
     //将沿y轴旋转的角度控制在-90到90度之间
     currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90.0), -90.0);
     currentAngle[1] = currentAngle[1] + dx;
   }
   lastX = x, lastY = y;
 };
}

var g_MvpMatrix = new Matrix4(); // Model view projection matrix
function draw(gl, n, viewProjMatrix, u_MvpMatrix, currentAngle) {
 // Caliculate The model view projection matrix and pass it to u_MvpMatrix
 g_MvpMatrix.set(viewProjMatrix);
 g_MvpMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis
 g_MvpMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); // Rotation around y-axis
 gl.uniformMatrix4fv(u_MvpMatrix, false, g_MvpMatrix.elements);

 gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);     // Clear buffers
 gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);   // Draw the cube
}

function initArrayBuffer(gl, data, num, type, attribute) {
 // Create a buffer object
 var buffer = gl.createBuffer();
 if (!buffer) {
   console.log('Failed to create the buffer object');
   return false;
 }
 // Write date into the buffer object
 gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
 gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
 // Assign the buffer object to the attribute variable
 var a_attribute = gl.getAttribLocation(gl.program, attribute);
 if (a_attribute < 0) {
   console.log('Failed to get the storage location of ' + attribute);
   return false;
 }
 gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
 // Enable the assignment to a_attribute variable
 gl.enableVertexAttribArray(a_attribute);

 return true;
}

function initTextures(gl) {
 // Create a texture object
 var texture = gl.createTexture();
 if (!texture) {
   console.log('Failed to create the texture object');
   return false;
 }

 // Get the storage location of u_Sampler
 var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
 if (!u_Sampler) {
   console.log('Failed to get the storage location of u_Sampler');
   return false;
 }

 // Create the image object
 var image = new Image();
 if (!image) {
   console.log('Failed to create the image object');
   return false;
 }
 // Register the event handler to be called when image loading is completed
 image.onload = function(){ loadTexture(gl, texture, u_Sampler, image); };
 // Tell the browser to load an Image
 image.src = '../resources/sky.jpg';

 return true;
}

function loadTexture(gl, texture, u_Sampler, image) {
 gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image Y coordinate
 // Activate texture unit0
 gl.activeTexture(gl.TEXTURE0);
 // Bind the texture object to the target
 gl.bindTexture(gl.TEXTURE_2D, texture);

 // Set texture parameters
 gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
 // Set the image to texture
 gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

 // Pass the texure unit 0 to u_Sampler
 gl.uniform1i(u_Sampler, 0);
}
