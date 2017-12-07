//三维世界-利用键盘改变视点
//顶点着色器
var VSHADER_SOURCE = 
'attribute vec4 a_Position;\n'+
'attribute vec4 a_Color;\n'+
'uniform mat4 u_ViewMatrix;\n'+//传入视图矩阵
'varying vec4 v_Color;\n'+//varying 变量
'void main(){\n'+
'   gl_Position = u_ViewMatrix * a_Position;\n'+//视图矩阵与顶点坐标相乘
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
if(!u_ViewMatrix){
    console.log('error');
    return;
}

//创建视图矩阵的Matrix4对象
var viewMatrix = new Matrix4();
//注册键盘时间响应函数
document.onkeydown = function(ev){keydown(ev,gl,n,u_ViewMatrix,viewMatrix);};

draw(gl,n,u_ViewMatrix,viewMatrix);//绘制三角形
}

function initVertexBuffers(gl){
var verticesColors = new Float32Array([
    //顶点坐标和颜色
    0.0,0.5,-0.4,0.4,1.0,0.4,
    -0.5,-0.5,-0.4,0.4,1.0,0.4,
    0.5,-0.5,-0.4,1.0,0.4,0.4,//绿色三角形在最后面

    0.5,0.4,-0.2,1.0,0.4,0.4,//黄色三角形在中间
    -0.5,0.4,-0.2,1.0,1.0,0.4,
    0.0,-0.6,-0.2,1.0,1.0,0.4,

    0.0,0.5,0.0,0.4,0.4,1.0,
    -0.5,-0.5,0.0,0.4,0.4,1.0,//蓝色三角形在最前边
    0.5,-0.5,0.0,1.0,0.4,0.4
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
var g_eyeX= 0.20, g_eyeY = 0.25,g_eyeZ = 0.25;//视点
function keydown(ev,gl,n,u_ViewMatrix,viewMatrix){
    if(ev.keyCode == 39){
        g_eyeX +=0.01;//按下右键
    }else
    if(ev.keyCode == 37 ){//按下左键
        g_eyeX -= 0.01;
    }else{return;}//按下其他的键
    draw(gl,n,u_ViewMatrix,viewMatrix);
}

function draw(gl,n,u_ViewMatrix,viewMatrix){
    //设置视点和视线
    viewMatrix.setLookAt(g_eyeX,g_eyeY,g_eyeZ,0.0,0.0,0.0,0,1,0);

    //将视图矩阵传给u_ViewMAtrix变量
    gl.uniformMatrix4fv(u_ViewMatrix,false,viewMatrix.elements);
  
    gl.clear(gl.COLOR_BUFFER_BIT);//清空canvas

    gl.drawArrays(gl.TRIANGLES, 0, n);//绘制三角形
}