//透视投影-可视空间
//顶点着色器
var VSHADER_SOURCE = 
'attribute vec4 a_Position;\n'+
'attribute vec4 a_Color;\n'+
'uniform mat4 u_ViewMatrix;\n'+//传入视图矩阵
'uniform mat4 u_ProjMatrix;\n'+//透视投影矩阵
'uniform mat4 u_ModelMatrix;\n'+//模型矩阵
'varying vec4 v_Color;\n'+//varying 变量
'void main(){\n'+
'   gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n'+//视图矩阵与顶点坐标相乘
'   v_Color = a_Color;\n'+//将数据传给片元着色器
'}\n';

//片元着色器
var FSHADER_SOURCE = 
'#ifdef GL_ES\n' +//?
'precision mediump float;\n' + //? 第六章
'#endif \n' +//?
'varying vec4 v_Color;\n'+
'void main(){\n'+
'   gl_FragColor = v_Color;\n'+//从顶点着色器接收颜色数据 
'}\n';

function main(){
//获取canvas
var canvas = document.getElementById('webgl');

//获取canvas的context
var gl = canvas.getContext('webgl');
if(!gl){
    console.log('gl error');
    return;
}

//初始化着色器
if(!initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE)){
    console.log('error');
    return;
}

//设置顶点的坐标和颜色
var n = initVertexBuffers(gl);
if(n<0){
    console.log('error');
    return;
}

//设置背景色
gl.clearColor(1.0,1.0,1.0,1.0);

//获取u_VIewMatrix的存储位置
var u_ViewMatrix = gl.getUniformLocation(gl.program,'u_ViewMatrix');
var u_ModelMatrix = gl.getUniformLocation(gl.program,'u_ModelMatrix');
var u_ProjMatrix = gl.getUniformLocation(gl.program,'u_ProjMatrix');
if(!u_ViewMatrix||!u_ProjMatrix||!u_ModelMatrix){
    console.log('error');
    return;
}

var ModelMatrix = new Matrix4();//模型矩阵
var viewMatrix = new Matrix4();//视图矩阵
var projMatrix = new Matrix4();//投影矩阵

//计算视图矩阵和投影矩阵
ModelMatrix.setTranslate(0.75,0,0);//平移0.75单位
viewMatrix.setLookAt(0,0,5,0,0,-100,0,1,0);
projMatrix.setPerspective(30,canvas.width/canvas.height,1,100);
//将视图矩阵和投影矩阵传递给u_ViewMatrix和u_projMatrix变量
gl.uniformMatrix4fv(u_ModelMatrix,false,ModelMatrix.elements);
gl.uniformMatrix4fv(u_ViewMatrix,false,viewMatrix.elements);
gl.uniformMatrix4fv(u_ProjMatrix,false,projMatrix.elements);

gl.clear(gl.COLOR_BUFFER_BIT);//清空canvas颜色缓冲区

gl.drawArrays(gl.TRIANGLES, 0, n);//绘制右侧的一组三角形

//为另一侧的三角形重新计算模型矩阵
ModelMatrix.setTranslate(-0.75,0,0);//平移-0.75单位
//只修改了模型矩阵
gl.uniformMatrix4fv(u_ModelMatrix,false,ModelMatrix.elements);

gl.drawArrays(gl.TRIANGLES,0,n);
}

function initVertexBuffers(gl){
var verticesColors = new Float32Array([
    //坐标值和色彩
    0.0,1.0,-4.0,0.4,1.0,0.4,
    -0.5,-1.0,-4.0,0.4,1.0,0.4,
    0.5,-1.0,-4.0,1.0,0.4,0.4,//绿色三角形在最后面

    0.0,1.0,-2.0,1.0,1.0,0.4,//黄色三角形在中间
    -0.5,-1.0,-2.0,1.0,1.0,0.4,
    0.5,-1.0,-2.0,1.0,0.4,0.4,

    0.0,1.0,0.0,0.4,0.4,1.0,
    -0.5,-1.0,0.0,0.4,0.4,1.0,//蓝色三角形在最前边
    0.5,-1.0,0.0,1.0,0.4,0.4,
]);
var n = 9;//顶点数量

//创建缓冲区对象
var vertexColorBuffer = gl.createBuffer();
if(!vertexColorBuffer){
    console.log('error');
    return;
}

//将顶点坐标和颜色写入缓冲区对象
gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
gl.bufferData(gl.ARRAY_BUFFER,verticesColors,gl.STATIC_DRAW);

var FSIZE = verticesColors.BYTES_PER_ELEMENT;

//获取a_Position的存储位置，分配缓冲区并开启
var a_Position = gl.getAttribLocation(gl.program,'a_Position');
if(a_Position<0){
    console.log('error');
    return;
}

gl.vertexAttribPointer(a_Position,3,gl.FLOAT,false,FSIZE*6,0);
gl.enableVertexAttribArray(a_Position);//开启缓冲区分配

//获取a_Color的存储位置，分配缓冲区并开启
var a_Color = gl.getAttribLocation(gl.program,'a_Color');
if(!a_Color){
    console.log('error');
    return;
}

gl.vertexAttribPointer(a_Color,3,gl.FLOAT,false,FSIZE*6,FSIZE*3);
gl.enableVertexAttribArray(a_Color);//开启缓冲区分配

return n;
}
